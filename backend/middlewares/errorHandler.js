const { error, serverError } = require("../utils/responses");

/**
 * Global Express error handling middleware
 */
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    console.error(`❌ [Unhandled Error] ${req.method} ${req.originalUrl}:`, err);

    // Mongoose CastError (Invalid ObjectId)
    if (err.name === "CastError") {
        return error(res, 400, `معرف غير صالح: ${err.value}`);
    }

    // Mongoose ValidationError
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            status: "fail",
            msg: "خطأ في التحقق من صحة البيانات المدخلة",
            errors: messages,
        });
    }

    // MongoDB Duplicate Key Error (11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "الحقل";
        return error(res, 409, `القيمة المدخلة في ${field} مسجلة مسبقاً وتكرارها غير مسموح`);
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        return error(res, 401, "جلسة غير صالحة، يرجى تسجيل الدخول مجدداً");
    }
    if (err.name === "TokenExpiredError") {
        return error(res, 401, "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً");
    }

    return serverError(res, err.message || "حدث خطأ غير متوقع في الخادم");
}

module.exports = errorHandler;
