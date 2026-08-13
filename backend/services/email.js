const resend = require("../config/email")

const sendEmail = ({ to, subject, html }) => {
    resend.emails.send({
        from: "Zemam <onboarding@resend.dev>",
        to,
        subject,
        html
    });
}

exports.sendPasswordResetEmail = ({ email, otp }) => {
    sendEmail({
        to: email,
        subject: "Otp Code",
        html: `your Otp Code is ${otp}`
    })
}
