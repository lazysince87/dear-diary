const express = require('express');
const router = express.Router();
const { textToSpeech } = require('../services/elevenlabs');
const { generateSoundEffect } = require('../services/elevenlabsSFX');
const { requireAuth } = require('../middleware/authMiddleware');
const UserPreferences = require('../models/UserPreferences');

// Voice ID mapping for personas
const PERSONA_VOICES = {
    friend: 'jGf6Nvwr7qkFPrcLThmD',    // Stacy — warm, friendly
    therapist: 'zmcVlqmyk3Jpn5AVYcAL',  // Sapphire — calm, narrative
};

/**
 * POST /api/voice/tts
 * Convert analysis text to speech via ElevenLabs
 * Falls back to client-side Web Speech API if this fails
 * Body: { text: string, voiceId?: string }
 */
router.post('/tts', requireAuth, async (req, res, next) => {
    try {
        const { text, voiceId: clientVoiceId } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Text is required for speech synthesis' });
        }

        if (!process.env.ELEVENLABS_API_KEY) {
            return res.status(503).json({
                error: 'Voice feature is not configured yet',
                fallback: true,
            });
        }

        // Determine voice: client override > persona preference > env default
        let voiceId = clientVoiceId;
        if (!voiceId) {
            try {
                const prefs = await UserPreferences.findOne({ userId: req.user.id }).lean();
                if (prefs?.personaPreference) {
                    voiceId = PERSONA_VOICES[prefs.personaPreference];
                }
            } catch (_) {
                // Ignore — will fall back to default
            }
        }

        const audioBuffer = await textToSpeech(text.trim(), voiceId);

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

/**
 * POST /api/voice/music
 * Generate ambient music using ElevenLabs Sound Effects API
 * Falls back to a soothing TTS meditation if sound effects aren't available
 * Body: { genres?: string[] }
 */
router.post('/music', requireAuth, async (req, res, next) => {
    try {
        if (!process.env.ELEVENLABS_API_KEY) {
            return res.status(503).json({ error: 'ElevenLabs not configured', fallback: true });
        }

        // Get user's genres from DB or request body
        let genres = req.body.genres || [];
        let persona = 'friend';
        try {
            const prefs = await UserPreferences.findOne({ userId: req.user.id }).lean();
            genres = prefs?.musicTaste?.topGenres || genres;
            persona = prefs?.personaPreference || 'friend';
        } catch (_) {
            // Ignore
        }

        let audioBuffer;

        // Try Sound Effects API first
        try {
            const genreString = genres.length > 0
                ? genres.slice(0, 5).join(', ')
                : 'lo-fi, ambient, calming';

            const prompt = `A soothing, comforting ${genreString} instrumental melody. Gentle, warm, and calming. Perfect for relaxation and emotional grounding. No vocals.`;
            audioBuffer = await generateSoundEffect(prompt, 15);
        } catch (sfxError) {
            console.log('Sound Effects API unavailable, falling back to TTS meditation:', sfxError.message);

            // Fallback: Generate a soothing spoken meditation via TTS
            const meditationScript = `Take a deep breath in... and slowly let it out. You are safe. You are valued. Whatever you are feeling right now is completely valid. Let yourself feel it, and know that it will pass. You are stronger than you think.`;
            const voiceId = PERSONA_VOICES[persona] || PERSONA_VOICES.friend;
            audioBuffer = await textToSpeech(meditationScript, voiceId);
        }

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });

        res.send(audioBuffer);
    } catch (error) {
        console.error('Music generation error:', error.message);
        next(error);
    }
});

module.exports = router;

