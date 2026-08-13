const User = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { success, error, serverError } = require("../utils/responses")
const googleClient = require("../config/googleAuth")
const { sendPasswordResetEmail } = require("../services/email")

// helpers
const generateToken = async (user) => {
    const data = { roles: user.roles, _id: user._id, email: user.email }
    const token = await jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: "10d" })
    return token
}

const storeToken = (res, token) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
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
        const token = await generateToken(user)
        storeToken(res, token)

        success(res, 200, { token })
    } catch (err) {
        console.log(err)
        return serverError(res)
    }
}

exports.signup = async (req, res) => {
    const { email, password, name } = req.body
    try {
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

        // Generate and Store Token
        const token = await generateToken(user)
        storeToken(res, token)

        success(res, 201, { token })
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
            user = await User.create({
                name,
                email,
                googleId,
                provider: "google"
            });
        }
        const token = await generateToken(user);
        storeToken(res, token);
        return success(res, 200);
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
        sendPasswordResetEmail({ email: "waqeh12@gmail.com" })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}