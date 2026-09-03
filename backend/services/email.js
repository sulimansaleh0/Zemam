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

exports.sendRegisterEmail = ({ email, password }) => {
    sendEmail({
        to: email,
        subject: `Your Zemam Account`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Zemam Account</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f6f8;
                font-family: Arial, Helvetica, sans-serif;
                color: #333;
            ">
                <div style="
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                ">

                    <!-- Header -->
                    <div style="
                        background-color: #2563eb;
                        padding: 30px;
                        text-align: center;
                    ">
                        <h1 style="
                            margin: 0;
                            color: #ffffff;
                            font-size: 28px;
                        ">
                            Zemam
                        </h1>
                    </div>

                    <!-- Content -->
                    <div style="padding: 35px 30px;">

                        <h2 style="
                            margin-top: 0;
                            color: #1f2937;
                        ">
                            Welcome to Zemam 👋
                        </h2>

                        <p style="
                            font-size: 16px;
                            line-height: 1.6;
                            color: #4b5563;
                        ">
                            Your Zemam account has been created successfully.
                            You can use the credentials below to sign in to your account.
                        </p>

                        <!-- Credentials -->
                        <div style="
                            margin: 25px 0;
                            padding: 20px;
                            background-color: #f8fafc;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                        ">

                            <p style="
                                margin: 0 0 12px;
                                font-size: 14px;
                                color: #6b7280;
                            ">
                                <strong>Email</strong>
                            </p>

                            <p style="
                                margin: 0 0 20px;
                                font-size: 16px;
                                color: #111827;
                                word-break: break-all;
                            ">
                                ${email}
                            </p>

                            <p style="
                                margin: 0 0 12px;
                                font-size: 14px;
                                color: #6b7280;
                            ">
                                <strong>Password</strong>
                            </p>

                            <p style="
                                margin: 0;
                                font-size: 16px;
                                color: #111827;
                                font-family: monospace;
                            ">
                                ${password}
                            </p>

                        </div>

                        <p style="
                            font-size: 14px;
                            line-height: 1.6;
                            color: #6b7280;
                        ">
                            For your security, please change your password after
                            signing in and do not share your credentials with anyone.
                        </p>

                        <p style="
                            margin-top: 30px;
                            font-size: 15px;
                            color: #4b5563;
                        ">
                            Welcome aboard,<br>
                            <strong>The Zemam Team</strong>
                        </p>

                    </div>

                    <!-- Footer -->
                    <div style="
                        padding: 20px 30px;
                        background-color: #f8fafc;
                        text-align: center;
                    ">
                        <p style="
                            margin: 0;
                            font-size: 12px;
                            color: #9ca3af;
                        ">
                            This email was sent automatically by Zemam.
                            Please do not reply to this email.
                        </p>
                    </div>

                </div>
            </body>
            </html>
        `
    })
}