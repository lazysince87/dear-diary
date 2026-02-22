require('dotenv').config({ path: '/Users/lazysince/.gemini/antigravity/scratch/rosie/server/.env' });
const { generateEmbedding } = require('/Users/lazysince/.gemini/antigravity/scratch/rosie/server/src/services/embeddings.js');
console.log('Testing generateEmbedding...');
generateEmbedding('This is a test entry').then(console.log).catch(console.error);
