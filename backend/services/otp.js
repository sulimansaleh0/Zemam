const Otp = require("../models/otp.model")
const generateOtp = require("../utils/generateOtp")
const { sendPasswordResetEmail } = require("../services/email")
const bcrypt = require("bcrypt")

exports.sendOtp = async (email) => {
    await Otp.deleteMany({ sentTo: email })
    const otp = generateOtp()
    const hashedOtp = await bcrypt.hash(otp, 7)
    await Otp.create({
        sentTo: email,
        hashedOtp,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    })
    console.log(`\n🔑 [DEV MODE] OTP code for ${email} is: ${otp}\n`);
    sendPasswordResetEmail({ email, otp })
}