const User = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { success, error, serverError } = require("../utils/responses")

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