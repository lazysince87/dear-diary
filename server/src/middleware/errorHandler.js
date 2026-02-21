/**
 * Global error handler middleware
 * Always returns calming, supportive error messages
 */
function errorHandler(err, req, res, _next) {
    console.error('Server error:', err);

    const statusCode = err.statusCode || 500;

    // Never expose stack traces or technical errors to the user
    const message = statusCode === 500
        ? "Something went wrong on our end, but don't worry — your thoughts are safe. Please try again in a moment. 💕"
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message,
    });
}

module.exports = { errorHandler };
