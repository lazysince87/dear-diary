const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter — protects the entire API from general spam.
 * 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Please slow down and try again in a few minutes.',
    },
});

/**
 * Strict AI limiter — heavily restricts expensive AI endpoints
 * (Gemini analysis, ElevenLabs TTS/music).
 * 10 requests per 15 minutes per IP.
 */
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'You\'ve reached the AI request limit. Please wait a few minutes before trying again.',
    },
});

/**
 * Voice/TTS limiter — separate limiter for ElevenLabs endpoints.
 * 8 requests per 15 minutes per IP.
 */
const voiceLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Voice generation limit reached. Please wait before generating more audio.',
    },
});

/**
 * Request timeout middleware.
 * Kills any request that takes longer than the specified duration.
 * @param {number} ms - timeout in milliseconds
 */
function requestTimeout(ms = 30000) {
    return (req, res, next) => {
        req.setTimeout(ms, () => {
            if (!res.headersSent) {
                res.status(408).json({
                    error: 'Request timed out. The AI took too long to respond.',
                });
            }
            req.destroy();
        });
        next();
    };
}

module.exports = { globalLimiter, aiLimiter, voiceLimiter, requestTimeout };
