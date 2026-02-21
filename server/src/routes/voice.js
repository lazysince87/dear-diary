const express = require('express');
const router = express.Router();
const { textToSpeech } = require('../services/elevenlabs');

/**
 * POST /api/voice/tts
 * Convert analysis text to speech
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
                message: 'The voice feature will be available soon 💕'
            });
        }

        const audioBuffer = await textToSpeech(text.trim());

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });

        res.send(audioBuffer);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
