const axios = require('axios');

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

/**
 * Emotion-aware voice presets.
 * Each preset tunes ElevenLabs voice_settings for the emotional context.
 *
 * - stability ↑ = calmer, more consistent delivery
 * - similarity_boost ↑ = closer to original voice (warmer)
 * - style ↑ = more expressive / dramatic delivery
 */
const VOICE_PRESETS = {
    // Immediate danger — calm, steady, authoritative
    emergency: {
        stability: 0.95,
        similarity_boost: 0.60,
        style: 0.10,
        use_speaker_boost: true,
    },
    // High severity manipulation detected — serious, empathetic
    high_severity: {
        stability: 0.80,
        similarity_boost: 0.80,
        style: 0.35,
        use_speaker_boost: true,
    },
    // Sadness / anxiety — warm, gentle, slightly variable for empathy
    comforting: {
        stability: 0.55,
        similarity_boost: 0.85,
        style: 0.45,
        use_speaker_boost: true,
    },
    // Neutral / positive — friendly, natural
    neutral: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.30,
        use_speaker_boost: true,
    },
};

/**
 * Choose the right voice preset based on the Gemini analysis result.
 * @param {Object} analysis - The structured analysis from Gemini
 * @returns {Object} ElevenLabs voice_settings
 */
function getVoicePreset(analysis) {
    if (!analysis) return VOICE_PRESETS.neutral;

    // Highest priority: immediate intervention
    if (analysis.requires_immediate_intervention) {
        console.log('[ElevenLabs] Using EMERGENCY voice preset');
        return VOICE_PRESETS.emergency;
    }

    // Check pattern severity
    const patterns = analysis.patterns_detected || [];
    const hasHighSeverity = patterns.some(p => p.severity === 'high');
    if (hasHighSeverity || analysis.confidence >= 0.8) {
        console.log('[ElevenLabs] Using HIGH_SEVERITY voice preset');
        return VOICE_PRESETS.high_severity;
    }

    // If music is suggested, user is likely distressed — use comforting
    if (analysis.suggests_music) {
        console.log('[ElevenLabs] Using COMFORTING voice preset');
        return VOICE_PRESETS.comforting;
    }

    console.log('[ElevenLabs] Using NEUTRAL voice preset');
    return VOICE_PRESETS.neutral;
}

/**
 * Convert text to speech using ElevenLabs API with emotion-aware voice settings.
 * @param {string} text - Text to convert to speech
 * @param {Object} [analysis] - Optional Gemini analysis result for emotion-aware tuning
 * @param {string} [voiceId] - Optional ElevenLabs voice ID (defaults to env var)
 * @returns {Buffer} Audio buffer (MP3)
 */
async function textToSpeech(text, analysis = null, voiceId) {
    const finalVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const voiceSettings = getVoicePreset(analysis);

    try {
        const response = await axios({
            method: 'POST',
            url: `${ELEVENLABS_API_URL}/text-to-speech/${finalVoiceId}`,
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
            },
            data: {
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: voiceSettings,
            },
            responseType: 'arraybuffer',
            timeout: 15000, // 15s timeout
        });

        return Buffer.from(response.data);
    } catch (error) {
        // Parse ElevenLabs error response for better logging
        let errorMessage = error.message;
        if (error.response?.data) {
            try {
                const errorBody = JSON.parse(Buffer.from(error.response.data).toString('utf-8'));
                errorMessage = `${errorBody.detail?.type || 'unknown'}: ${errorBody.detail?.message || JSON.stringify(errorBody.detail)}`;
                console.error('ElevenLabs TTS error:', errorMessage);

                // If it's a payment/quota issue, throw a specific error
                if (errorBody.detail?.type === 'payment_required' || errorBody.detail?.type === 'quota_exceeded') {
                    const err = new Error('ElevenLabs quota exceeded or payment required');
                    err.code = 'ELEVENLABS_QUOTA';
                    throw err;
                }
            } catch (parseErr) {
                if (parseErr.code === 'ELEVENLABS_QUOTA') throw parseErr;
                console.error('ElevenLabs TTS error (raw):', error.response?.status, errorMessage);
            }
        } else {
            console.error('ElevenLabs TTS error:', errorMessage);
        }

        throw new Error('Voice synthesis failed');
    }
}

module.exports = { textToSpeech, getVoicePreset, VOICE_PRESETS };

