const axios = require('axios');

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

/**
 * Generate a sound effect using ElevenLabs Sound Effects API
 * @param {string} prompt - Description of the sound to generate
 * @param {number} [durationSeconds] - Duration of the sound in seconds (optional)
 * @returns {Buffer} Audio buffer (MP3)
 */
async function generateSoundEffect(prompt, durationSeconds = 10) {
    try {
        const response = await axios({
            method: 'POST',
            url: `${ELEVENLABS_API_URL}/sound-generation`,
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
            },
            data: {
                text: prompt,
                duration_seconds: durationSeconds,
            },
            responseType: 'arraybuffer',
            timeout: 30000, // 30s timeout — generation can be slower
        });

        return Buffer.from(response.data);
    } catch (error) {
        let errorMessage = error.message;
        if (error.response?.data) {
            try {
                const errorBody = JSON.parse(Buffer.from(error.response.data).toString('utf-8'));
                errorMessage = `${errorBody.detail?.type || 'unknown'}: ${errorBody.detail?.message || JSON.stringify(errorBody.detail)}`;
            } catch (_) {
                // ignore parse error
            }
        }
        console.error('ElevenLabs Sound Effect error:', errorMessage);
        throw new Error('Sound effect generation failed');
    }
}

module.exports = { generateSoundEffect };
