const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const { success, error, serverError } = require("../utils/responses")

exports.me = async (req, res) => {
    const user = req.user
    if (!user) return error(res, 401, "UnAuthorized")
    try {
        const userData = await User.findById(user._id)
        if (!userData) return error(res, 400, "User Not Found")
        success(res, 200, { user: userData })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.updateProfile = async (req, res) => {
    const user = req.user
    if (!user) return error(res, 401, "UnAuthorized")
    const { name, email, password } = req.body;
    try {
        if (password) {
            password = await bcrypt.hash(password, 9)
        }
        await User.findByIdAndUpdate(user._id, {
            name,
            email,
            password
        })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}