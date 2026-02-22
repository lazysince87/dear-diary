const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a vector embedding for a piece of text using Gemini's
 * text-embedding-004 model (768 dimensions).
 *
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} 768-dimensional embedding vector
 */
async function generateEmbedding(text) {
    if (!text || !text.trim()) return null;

    try {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent({ content: text.trim() });
        return result.embedding.values; // number[]
    } catch (error) {
        console.error('[Embeddings] Failed to generate embedding:', error.message);
        return null;
    }
}

module.exports = { generateEmbedding };
