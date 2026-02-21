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
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.75,       // Higher = more consistent, calmer
                    similarity_boost: 0.75,
                    style: 0.3,            // Subtle emotional expression
                    use_speaker_boost: true,
                },
            },
            responseType: 'arraybuffer',
        });

        return Buffer.from(response.data);
    } catch (error) {
        console.error('ElevenLabs TTS error:', error.response?.data || error.message);
        throw new Error('Voice synthesis failed');
    }
}

/**
 * Speech to text using ElevenLabs (or fallback to browser Web Speech API)
 * Note: ElevenLabs STT is handled client-side via their SDK or browser API.
 * This function is a placeholder for server-side processing if needed.
 */
async function speechToText(audioBuffer) {
    // For MVP, STT is handled on the client via Web Speech API
    // This is reserved for future server-side processing
    throw new Error('STT is handled client-side for MVP');
}

module.exports = { textToSpeech, speechToText };
