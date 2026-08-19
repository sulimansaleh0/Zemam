const User = require("../models/user.model")
const Otp = require("../models/otp.model")
const Company = require("../models/company.model")
const RefreshToken = require("../models/refreshToken.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const googleClient = require("../config/googleAuth")
const { sendOtp } = require("../services/otp")
const { success, error, serverError } = require("../utils/responses")

// helpers
const generateToken = async (user) => {
    const data = { roles: user.roles, _id: user._id, email: user.email, companyId: user?.companyId || null, teamId: user.teamId || null }
    const token = await jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: "15m" })
    return token
}

const generateRefreshToken = async (userId) => {
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "20d" })
    return token
}

const saveRefreshToken = async (tokenDoc) => {
    const [tokenHash] = await Promise.all([
        bcrypt.hash(tokenDoc.refreshToken, 7),
        RefreshToken.deleteMany({ userId: tokenDoc.userId })
    ])
    await RefreshToken.create({ tokenHash, userId: tokenDoc.userId })
}

const storeToken = (res, token, type = "token") => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie(type, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 10 * 24 * 60 * 60 * 1000
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body
    try {

        // Check Email
        const user = await User.findOne({ email })
        if (!user) return error(res, 400, "Check Email or Password")

        // Check Password
        const isMatched = await bcrypt.compare(password, user.password)
        if (!isMatched) return error(res, 400, "Check Email or Password")

        // Generate and Store Token
        const [token, refreshToken] = await Promise.all([
            generateToken(user),
            generateRefreshToken(user._id)
        ])

        storeToken(res, token)
        storeToken(res, refreshToken, "refreshToken")

        await saveRefreshToken({ userId: user._id, refreshToken })

        success(res, 200, { expiresAt: new Date(Date.now() + 15 * 60 * 1000) })
    } catch (err) {
        console.log(err)
        return serverError(res)
    }
}

exports.signup = async (req, res) => {
    const { email, password, confirmPassword, name, companyName } = req.body
    try {
        if (!(password === confirmPassword)) return error(res, 400, "passwords are not match")

        // Check Email
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email is already exists")

        // hash password
        const hashedPassword = await bcrypt.hash(password, 9)

        // Create User
        const user = await User.create({
            email,
            password: hashedPassword,
            name
        })

        // Create Company
        const company = await Company.create({
            name: companyName,
            ownerId: user._id
        })
        user.companyId = company._id
        await user.save()

        success(res, 201)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.googleLogin = async (req, res) => {
    const { credential } = req.body
    if (!credential) return error(res, 400, "Google credential is required")
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const {
            sub: googleId,
            email,
            name
        } = payload;

        if (!email) {
            return error(res, 400, "Google account email is required");
        }

        let user = await User.findOne({ googleId })
        if (!user) {
            // Check if user exists with same email but different provider
            user = await User.findOne({ email })
            if (!user) {
                // Create new user
                user = await User.create({
                    name,
                    email,
                    googleId,
                    provider: "google"
                });

                // Create Company 
                const company = await Company.create({
                    name: companyName,
                    ownerId: user._id
                })
                user.companyId = company._id
                await user.save()
            } else {
                // Update existing user with Google info
                user.googleId = googleId;
                user.provider = "google";
                await user.save();
            }
        }
        const [token, refreshToken] = await Promise.all([
            generateToken(user),
            generateRefreshToken(user._id)
        ])

        storeToken(res, token)
        storeToken(res, refreshToken, "refreshToken")

        await saveRefreshToken({ userId: user._id, refreshToken })

        return success(res, 200, { expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.verifyEmail = async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email });
        if (!user) return error(res, 401, "Email Not Found!")

        const token = await jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" })
        success(res, 200, { token })

        sendOtp(email)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.verifyOtp = async (req, res) => {
    const { token, otp } = req.body
    try {
        if (!token) return error(res, 401, "Token Required")

        const userData = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if (!userData) return error(res, 401, "Invalid Token")

        const otpData = await Otp.findOne({
            sentTo: userData.email
        })

        if (!otpData) {
            return error(res, 400, "OTP not found or expired")
        }

        // check expired
        if (otpData.expiresAt < new Date())
            return error(res, 400, "OTP is expired")

        // check attempts
        if (otpData.attempts >= 5)
            return error(res, 400, "Too many attempts. Please request a new OTP")

        // compare otp
        const isMatched = await bcrypt.compare(otp, otpData.hashedOtp)
        if (!isMatched) {
            otpData.attempts += 1
            await otpData.save()
            return error(res, 400, "Invalid OTP")
        }

        success(res, 200)

        otpData.verified = true
        await otpData.save()
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body
    console.log(password)
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if (!userData) return error(res, 401, "Invalid Token")

        const otpData = await Otp.findOne({
            sentTo: userData.email,
            verified: true
        })
        if (!otpData) return error(res, 401, "Token is Invalid")

        if (otpData.expiresAt < new Date())
            return error(res, 400, "reset password Token is Expired")

        const user = await User.findOne({ email: userData.email })
        if (!user) return error(res, 400, "User not found")

        const newPassword = await bcrypt.hash(password, 9)
        user.password = newPassword
        await user.save()

        success(res, 200)

        await Otp.findByIdAndDelete(otpData._id)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.refreshToken = async (req, res) => {
    const userId = req.userId || null
    if (!userId) return error(res, 401, "User not found")
    try {
        const user = await User.findById(userId)

        // Generate and Store Token
        const [token, refreshToken] = await Promise.all([
            generateToken(user),
            generateRefreshToken(user._id)
        ])

        storeToken(res, token)
        storeToken(res, refreshToken, "refreshToken")

        await saveRefreshToken({ userId: user._id, refreshToken })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}