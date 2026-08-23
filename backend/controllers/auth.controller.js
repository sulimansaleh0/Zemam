const User = require("../models/user.model")
const Otp = require("../models/otp.model")
const Company = require("../models/company.model")
const RefreshToken = require("../models/refreshToken.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { success, error, serverError } = require("../utils/responses")
const googleClient = require("../config/googleAuth")
const { sendOtp } = require("../services/otp")
const { mainStatus } = require("../data/status")

// helpers
const generateToken = async (user) => {
    const data = { roles: user.roles, _id: user._id, email: user.email, companyId: user?.companyId || null, teamId: user?.teamId || null }
    return jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: "15m" })
}

const createRefreshToken = async (userId) => {
    await RefreshToken.updateMany({ userId }, { revoked: true })
    const tokenDoc = await RefreshToken.create({ userId })
    const token = jwt.sign({ userId, tokenId: tokenDoc._id }, process.env.JWT_SECRET_KEY, { expiresIn: "20d" })
    const tokenHash = await bcrypt.hash(token, 7)
    tokenDoc.tokenHash = tokenHash
    await tokenDoc.save()
    return token
}

const storeToken = (res, token, type = "token") => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie(type, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: type === "refreshToken" ? 20 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000
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
        const token = await generateToken(user)
        const refreshToken = await createRefreshToken(user._id)

        storeToken(res, token)
        storeToken(res, refreshToken, "refreshToken")

        success(res, 200, { expiresAt: new Date(Date.now() + 15 * 60 * 1000) })
    } catch (err) {
        console.log(err)
        return serverError(res)
    }
}

exports.signup = async (req, res) => {
    const { email, password, confirmPassword, name, companyName } = req.body
    try {
        if (confirmPassword && !(password === confirmPassword)) {
            return error(res, 400, "passwords are not match")
        }

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
        if (companyName) {
            const company = await Company.create({
                name: companyName,
                ownerId: user._id
            })
            user.companyId = company._id
            await user.save()
        }

        success(res, 201)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
                if (decoded?.userId) {
                    await RefreshToken.findByIdAndUpdate(decoded.tokenId, { revoked: true });
                }
            } catch (e) {
                // Token may be invalid/expired, proceed with clearing cookies
            }
        }

        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        };

        res.clearCookie("token", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        success(res, 200, { msg: "تم تسجيل الخروج بنجاح" })
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
                    name: `شركة ${name || 'المستخدم'}`,
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

        const token = await generateToken(user)
        const refreshToken = await createRefreshToken(user._id)

        storeToken(res, token)
        storeToken(res, refreshToken, "refreshToken")

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
        if (!user) return error(res, 404, "البريد الإلكتروني غير مسجل لدينا")

        const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" })
        storeToken(res, token, "resetPasswordToken")

        await sendOtp(email)
        return success(res, 200, { token, msg: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" })
    } catch (err) {
        console.log(err)
        return serverError(res)
    }
}

exports.verifyOtp = async (req, res) => {
    const { otp } = req.body
    const token = req.cookies.resetPasswordToken 
    try {

        if (!token) return error(res, 401, "جلسة التحقق غير صالحة، يرجى طلب رمز جديد")
            
            let userData;
            try {
                userData = jwt.verify(token, process.env.JWT_SECRET_KEY)
            } catch (jwtErr) {
                return error(res, 401, "انتهت صلاحية جلسة التحقق، يرجى طلب رمز جديد")
            }
            
            if (!userData || !userData.email) return error(res, 401, "رمز الجلسة غير صالح")
                
                const otpData = await Otp.findOne({
                    sentTo: userData.email
                })
                
                if (!otpData) {
                    return error(res, 400, "رمز التحقق غير موجود أو انتهت صلاحيته")
                }
                
                // check expired
                if (otpData.expiresAt < new Date())
                    return error(res, 400, "انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد")
                
                // check attempts
                if (otpData.attempts >= 5)
                    return error(res, 400, "تجاوزت الحد الأقصى للمحاولات. يرجى طلب رمز جديد")
                
                // compare otp
                const isMatched = await bcrypt.compare(otp, otpData.hashedOtp)
                if (!isMatched) {
                    otpData.attempts += 1
                    await otpData.save()
                    return error(res, 400, "رمز التحقق غير صحيح")
                }
                
                otpData.verified = true
                await otpData.save()
                
                return success(res, 200, { token, msg: "تم التحقق من الرمز بنجاح" })
    } catch (err) {
        console.log(err)
        return serverError(res)
    }
}

exports.resetPassword = async (req, res) => {
    const { password } = req.body
    const token = req.cookies.resetPasswordToken
    if (!token) return error(res, 401, "Token Required")
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if (!userData) return error(res, 401, "Invalid Token")

        const otpData = await Otp.findOne({
            sentTo: userData.email,
            verified: true
        })
        if (!otpData) return error(res, 401, "لم يتم التحقق من رمز OTP أو انتهت صلاحية الجلسة")

        if (otpData.expiresAt < new Date()) {
            await Otp.deleteMany({ sentTo: userData.email })
            return error(res, 400, "انتهت صلاحية الجلسة، يرجى طلب رمز جديد")
        }

        const user = await User.findOne({ email: userData.email })
        if (!user) return error(res, 404, "المستخدم غير موجود")

        const newPassword = await bcrypt.hash(password, 9)
        await User.findByIdAndUpdate(user._id, { password: newPassword })

        await Otp.deleteMany({ sentTo: userData.email })

        // Clear reset token cookie
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("resetPasswordToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        return success(res, 200, { msg: "تم تغيير كلمة المرور بنجاح" })
    } catch (err) {
        console.log(err)
        return serverError(res)
    }
}

exports.refreshToken = async (req, res) => {
    const userId = req.userId || null
    if (!userId) return error(res, 401, "User not found")
    try {
        const user = await User.findById(userId)
        if (!user) return error(res, 400, "User not found")

        // Generate and Store Token
        const token = await generateToken(user)
        const refreshToken = await createRefreshToken(user._id)

        storeToken(res, token)
        storeToken(res, refreshToken, "refreshToken")

        success(res, 200, { expiresAt: new Date(Date.now() + 15 * 60 * 1000) })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}