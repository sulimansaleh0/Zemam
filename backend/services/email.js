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
        subject: "Your OTP Code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
                <h2 style="color: #111827; margin-bottom: 16px;">Password Reset Request</h2>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                    You requested a password reset. Use the code below to continue:
                </p>
                <div style="margin: 24px 0; padding: 20px; text-align: center; background-color: #ffffff; border-radius: 10px; border: 1px solid #d1d5db;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280; letter-spacing: 1px; text-transform: uppercase;">
                        Your OTP
                    </p>
                    <p style="margin: 12px 0 0; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827;">
                        ${otp}
                    </p>
                </div>
                <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                    This code is valid for a limited time. If you did not request this, please ignore this email.
                </p>
            </div>
        `
    });
};
