const express = require('express');
const router = express.Router();
const { analyzeEntry: analyzeGemini } = require('../services/gemini');
const { analyzeEntry: analyzeOllama } = require('../services/ollama');
const Entry = require('../models/Entry');
const UserPreferences = require('../models/UserPreferences');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * POST /api/analyze
 * Analyze a journal entry for manipulation patterns
 * Body: { content: string, mood?: string }
 */
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { content, mood, cyclePhase, sleepHours, stressLevel } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                error: 'Please share what\'s on your mind \u2014 even a few words help.'
            });
        }

        // Retrieve last 5 entries for this user to provide longitudinal RAG context
        let pastEntries = [];
        try {
            pastEntries = await Entry.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            // Reverse so they are in chronological order (oldest first) for the model context
            pastEntries = pastEntries.reverse();
        } catch (dbError) {
            console.error('Failed to retrieve past entries for RAG:', dbError.message);
            // Continue — analysis should still work even without past context
        }

        // Fetch user persona preference
        let persona = 'friend';
        try {
            const prefs = await UserPreferences.findOne({ userId: req.user.id }).lean();
            if (prefs?.personaPreference) persona = prefs.personaPreference;
        } catch (_) {
            // Default to friend
        }

        // Determine which AI provider to use
        const aiProvider = process.env.AI_PROVIDER?.toLowerCase() === 'ollama' ? 'ollama' : 'gemini';
        let analysis;
        console.log(`[AI Provider]: using ${aiProvider.toUpperCase()} | Persona: ${persona}`);

        // Analyze with selected AI provider
        if (aiProvider === 'ollama') {
            analysis = await analyzeOllama(content.trim(), pastEntries);
        } else {
            console.log('[DEBUG] mood received:', mood);
            analysis = await analyzeGemini(content.trim(), { mood, cyclePhase, sleepHours, stressLevel }, pastEntries, persona);
        }

        // Save to MongoDB (non-blocking — don't let DB errors block the response)
        try {
            const entry = new Entry({
                content: content.trim(),
                analysis,
                userId: req.user.id,
                mood: mood || null,
                cyclePhase: cyclePhase || null,
                sleepHours: sleepHours !== undefined ? sleepHours : null,
                stressLevel: stressLevel !== undefined ? stressLevel : null,
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
