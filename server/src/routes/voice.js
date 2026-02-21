const express = require('express');
const router = express.Router();
const { textToSpeech } = require('../services/elevenlabs');

/**
 * POST /api/voice/tts
 * Convert analysis text to speech via ElevenLabs
 * Falls back to client-side Web Speech API if this fails
 * Body: { text: string }
 */
router.post('/tts', async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Text is required for speech synthesis' });
        }

        if (!process.env.ELEVENLABS_API_KEY) {
            return res.status(503).json({
                error: 'Voice feature is not configured yet',
                fallback: true,
            });
        }

        const audioBuffer = await textToSpeech(text.trim());

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });

        res.send(audioBuffer);
    } catch (error) {
        // If it's a quota/payment issue, tell the frontend to use browser fallback
        if (error.code === 'ELEVENLABS_QUOTA') {
            return res.status(503).json({
                error: 'ElevenLabs quota exceeded',
                fallback: true,
            });
        }
        next(error);
    }
});

module.exports = router;
