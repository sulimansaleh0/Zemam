const User = require("../models/user.model")
const Otp = require("../models/otp.model")
const Company = require("../models/company.model")
const RefreshToken = require("../models/refreshToken.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const googleClient = require("../config/googleAuth")
const { sendOtp } = require("../services/otp")
const { mainStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")
const { userRoles } = require("../data/roles")

// Dedicated secret keys for token separation
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET_KEY
const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || (process.env.JWT_SECRET_KEY + "_RESET")

// Helper: SHA-256 hash for refresh tokens
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

// helpers
const generateToken = async (user) => {
    const data = {
        _id: user._id,
        email: user.email,
        role: user.role,
        companyId: user?.companyId || null,
        teamId: user?.teamId || null,
        type: "access"
    }
    return jwt.sign(data, ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}

const createRefreshToken = async (userId) => {
    const tokenDoc = await RefreshToken.create({ userId })
    const token = jwt.sign({ userId, tokenId: tokenDoc._id, type: "refresh" }, ACCESS_TOKEN_SECRET, { expiresIn: "20d" })
    tokenDoc.tokenHash = hashToken(token)
    await tokenDoc.save()
    return token
}

const storeToken = (res, token, type = "token", customMaxAge = null) => {
    const isProduction = process.env.NODE_ENV === "production";
    let maxAge = customMaxAge;
    if (!maxAge) {
        if (type === "token") maxAge = 15 * 60 * 1000; // 15 mins matching access token
        else if (type === "refreshToken") maxAge = 20 * 24 * 60 * 60 * 1000; // 20 days matching refresh token
        else maxAge = 15 * 60 * 1000; // 15 mins for reset tokens
    }

    res.cookie(type, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body
    try {

        // Check Email
        const user = await User.findOne({ email, isDeleted: false })
        if (!user) return error(res, 400, "Check Email or Password")

        // Handle Google accounts that do not have a password
        if (!user.password) {
            return error(res, 400, "هذا الحساب مسجل عبر Google، يرجى تسجيل الدخول باستخدام زر Google")
        }

        // Check Password
        const isMatched = await bcrypt.compare(password, user.password)
        if (!isMatched) return error(res, 400, "Check Email or Password")
        if (user.status !== mainStatus.ACTIVE) {
            return error(res, 403, "الحساب معطل أو غير نشط، يرجى مراجعة إدارة الشركة");
        }
        if (user.role === userRoles.FLEET_MANAGER && !user.teamId) {
            return error(res, 403, "حساب مدير الأسطول غير مرتبط بأي فريق تشغيلي حتى الآن، يرجى مراجعة إدارة الشركة لربطك بفريق تشغيلي للبدء");
        }

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

exports.createSocketTicket = (req, res) => {
    const ticket = jwt.sign(
        { _id: req.user._id, purpose: "socket" },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "60s" }
    );

    res.set("Cache-Control", "no-store");
    success(res, 200, { ticket });
};

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

exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, ACCESS_TOKEN_SECRET);
                if (decoded?.tokenId) {
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
            sameSite: isProduction ? "none" : "lax",
            path: "/"
        };

        res.clearCookie("token", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        success(res, 200, { msg: "تم تسجيل الخروج بنجاح" });
    } catch (err) {
        console.log(err);
        serverError(res);
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
            name,
            email_verified
        } = payload;

        if (!email) {
            return error(res, 400, "Google account email is required");
        }
        if (!email_verified) {
            return error(res, 400, "Google account email is not verified");
        }

        let newUser = false
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
                newUser = true
            } else {
                // Update existing user with Google info
                user.googleId = googleId;
                user.provider = "google";
                await user.save();
            }
        }

        if (user.isDeleted || user.status !== mainStatus.ACTIVE) {
            return error(res, 403, "الحساب معطل أو غير نشط، يرجى مراجعة إدارة الشركة");
        }

        if (user.role === userRoles.FLEET_MANAGER && !user.teamId) {
            return error(res, 403, "Fleet manager must be assigned to an active team");
        }

        const token = await generateToken(user)
        const refreshToken = await createRefreshToken(user._id)

        storeToken(res, token)
        storeToken(res, refreshToken, "refreshToken")

        return success(
            res,
            200,
            { expiresAt: new Date(Date.now() + 15 * 60 * 1000), isNewUser: newUser });
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.onBoarding = async (req, res) => {
    const user = req.user
    const { companyName } = req.body
    if (!companyName) return error(res, 400, "Company Name is required")
    try {
        const found = await Company.findOne({ ownerId: user._id })
        if (found) return error(res, 400, "User already had a company")

        const company = await Company.create({
            name: companyName,
            ownerId: user._id
        })
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            companyId: company._id
        }, { new: true })

        const token = await generateToken(updatedUser || user)
        storeToken(res, token)
        success(res, 200, { user: updatedUser, company })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.verifyEmail = async (req, res) => {
    const { email } = req.body
    if (!email) return error(res, 400, "البريد الإلكتروني مطلوب")
    try {
        const user = await User.findOne({ email, isDeleted: false });
        if (!user) return error(res, 404, "البريد الإلكتروني غير مسجل لدينا")
        if (user.status !== mainStatus.ACTIVE) {
            return error(res, 403, "الحساب معطل أو غير نشط، يرجى مراجعة إدارة الشركة")
        }

        // Issue a challenge token signed with RESET_TOKEN_SECRET with purpose: 'otp_pending'
        // This token CANNOT be used as an access token to authenticate any user API
        const pendingToken = jwt.sign(
            { email: user.email, purpose: "otp_pending" },
            RESET_TOKEN_SECRET,
            { expiresIn: "15m" }
        )
        storeToken(res, pendingToken, "resetPasswordToken", 15 * 60 * 1000)

        await sendOtp(email)
        success(res, 200, { msg: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.verifyOtp = async (req, res) => {
    const { otp, email: bodyEmail } = req.body
    const cookieToken = req.cookies?.resetPasswordToken
    try {
        let email = bodyEmail;
        if (!email && cookieToken) {
            try {
                const decoded = jwt.verify(cookieToken, RESET_TOKEN_SECRET);
                if (decoded && decoded.email) email = decoded.email;
            } catch (e) {
                // Invalid or expired token
            }
        }

        if (!email) return error(res, 400, "جلسة التحقق غير صالحة، يرجى إعادة إدخال البريد الإلكتروني")

        const otpData = await Otp.findOne({
            sentTo: email
        })

        if (!otpData) {
            return error(res, 400, "رمز التحقق غير موجود أو انتهت صلاحيته")
        }

        // check expired
        if (otpData.expiresAt < new Date()) {
            await Otp.deleteMany({ sentTo: email })
            return error(res, 400, "انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد")
        }

        // check attempts
        if (otpData.attempts >= 5) {
            await Otp.deleteMany({ sentTo: email })
            return error(res, 400, "تجاوزت الحد الأقصى للمحاولات. يرجى طلب رمز جديد")
        }

        // compare otp
        const isMatched = await bcrypt.compare(otp, otpData.hashedOtp)
        if (!isMatched) {
            otpData.attempts += 1
            await otpData.save()
            return error(res, 400, "رمز التحقق غير صحيح")
        }

        otpData.verified = true
        await otpData.save()

        // Issue verified reset token
        const resetToken = jwt.sign(
            { email, purpose: "reset_password" },
            RESET_TOKEN_SECRET,
            { expiresIn: "15m" }
        )
        storeToken(res, resetToken, "resetPasswordToken", 15 * 60 * 1000)

        success(res, 200, { msg: "تم التحقق من الرمز بنجاح" })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.resetPassword = async (req, res) => {
    const { password } = req.body
    const token = req.cookies?.resetPasswordToken
    if (!token) return error(res, 401, "Token Required")
    try {
        let userData;
        try {
            userData = jwt.verify(token, RESET_TOKEN_SECRET)
        } catch (jwtErr) {
            return error(res, 401, "انتهت صلاحية جلسة تغيير كلمة المرور، يرجى طلب رمز جديد")
        }

        if (!userData || userData.purpose !== "reset_password" || !userData.email) {
            return error(res, 401, "رمز الجلسة غير صالح")
        }

        const otpData = await Otp.findOne({
            sentTo: userData.email,
            verified: true
        })
        if (!otpData) return error(res, 401, "يرجى التحقق من رمز OTP أولاً")

        if (otpData.expiresAt < new Date()) {
            await Otp.deleteMany({ sentTo: userData.email })
            return error(res, 400, "انتهت صلاحية جلسة التحقق، يرجى طلب رمز جديد")
        }

        const user = await User.findOne({ email: userData.email, isDeleted: false })
        if (!user) return error(res, 404, "المستخدم غير موجود")

        const newPassword = await bcrypt.hash(password, 9)
        user.password = newPassword
        await user.save()

        // Cleanup OTP records
        await Otp.deleteMany({ sentTo: userData.email })

        // Clear reset token cookie
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("resetPasswordToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/"
        });

        success(res, 200, { msg: "تم تغيير كلمة المرور بنجاح" })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.refreshToken = async (req, res) => {
    const userId = req.userId || null
    const oldTokenId = req.tokenId || null
    if (!userId) return error(res, 401, "User not found")
    try {
        const user = await User.findById(userId)
        if (!user || user.isDeleted) return error(res, 404, "User not found")

        if (user.status !== mainStatus.ACTIVE) {
            return error(res, 403, "الحساب معطل أو غير نشط، يرجى مراجعة إدارة الشركة");
        }

        if (user.role === userRoles.FLEET_MANAGER && !user.teamId) {
            return error(res, 403, "Fleet manager must be assigned to an active team")
        }

        // Revoke only the old token document for this session
        if (oldTokenId) {
            await RefreshToken.findByIdAndUpdate(oldTokenId, { revoked: true })
        }

        // Generate and Store New Tokens
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