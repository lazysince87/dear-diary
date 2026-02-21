const axios = require('axios');

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

/**
 * Convert text to speech using ElevenLabs API
 * @param {string} text - Text to convert to speech
 * @returns {Buffer} Audio buffer (MP3)
 */
async function textToSpeech(text) {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel - calm, warm voice

    try {
        const response = await axios({
            method: 'POST',
            url: `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
            },
            data: {
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.75,       // Higher = more consistent, calmer
                    similarity_boost: 0.75,
                    style: 0.3,            // Subtle emotional expression
                    use_speaker_boost: true,
                },
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

module.exports = { textToSpeech };
