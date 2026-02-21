const express = require('express');
const router = express.Router();
const { analyzeEntry } = require('../services/gemini');
const Entry = require('../models/Entry');

/**
 * POST /api/analyze
 * Analyze a journal entry for manipulation patterns
 * Body: { content: string, sessionId: string, mood?: string }
 */
router.post('/', async (req, res, next) => {
    try {
        const { content, sessionId, mood } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                error: 'Please share what\'s on your mind — even a few words help. 💕'
            });
        }

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        // Analyze with Gemini
        const analysis = await analyzeEntry(content.trim());

        // Save to MongoDB (non-blocking — don't let DB errors block the response)
        try {
            const entry = new Entry({
                content: content.trim(),
                analysis,
                sessionId,
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
