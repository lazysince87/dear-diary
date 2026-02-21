const express = require('express');
const router = express.Router();
const { analyzeEntry } = require('../services/gemini');
const Entry = require('../models/Entry');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * POST /api/analyze
 * Analyze a journal entry for manipulation patterns
 * Body: { content: string, mood?: string }
 */
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { content, mood } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                error: 'Please share what\'s on your mind — even a few words help. 💕'
            });
        }

        // Analyze with Gemini
        console.log('[DEBUG] mood received:', mood);
        const analysis = await analyzeEntry(content.trim(), mood);

        // Save to MongoDB (non-blocking — don't let DB errors block the response)
        try {
            const entry = new Entry({
                content: content.trim(),
                analysis,
                userId: req.user.id,
                mood: mood || null,
            });
            await entry.save();
        } catch (dbError) {
            console.error('Failed to save entry:', dbError.message);
            // Continue — analysis should still return even if DB is down
        }

        res.json({
            success: true,
            analysis,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
