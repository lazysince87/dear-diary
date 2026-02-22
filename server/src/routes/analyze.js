const express = require('express');
const router = express.Router();
const { analyzeEntry: analyzeGemini } = require('../services/gemini');
const { analyzeEntry: analyzeOllama } = require('../services/ollama');
const { generateEmbedding } = require('../services/embeddings');
const Entry = require('../models/Entry');
const UserPreferences = require('../models/UserPreferences');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * POST /api/analyze
 * Analyze a journal entry for manipulation patterns.
 * Uses Semantic RAG: embeds the current entry and performs a
 * MongoDB Atlas Vector Search to find the most relevant past entries.
 * Body: { content: string, mood?: string, imageUrl?: string, cyclePhase?: string, sleepHours?: number, stressLevel?: number }
 */
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { content, mood, imageUrl, cyclePhase, sleepHours, stressLevel } = req.body;

        if ((!content || !content.trim()) && !imageUrl) {
            return res.status(400).json({
                error: 'Please share what\'s on your mind or attach an image \u2014 even a small piece helps.'
            });
        }

        // ─── Step 1: Generate embedding for the current entry (non-blocking) ───
        const textForEmbedding = content?.trim() || '';
        let currentEmbedding = null;
        try {
            if (textForEmbedding) {
                currentEmbedding = await generateEmbedding(textForEmbedding);
                console.log('[RAG] Generated embedding for current entry:', currentEmbedding ? `${currentEmbedding.length}-dim vector` : 'null');
            }
        } catch (embError) {
            console.error('[RAG] Embedding generation failed, falling back to chronological:', embError.message);
        }

        // ─── Step 2: Retrieve past entries via Semantic Vector Search (or fallback) ───
        let pastEntries = [];
        try {
            if (currentEmbedding && currentEmbedding.length > 0) {
                // MongoDB Atlas Vector Search — finds the 5 most semantically similar past entries
                pastEntries = await Entry.aggregate([
                    {
                        $vectorSearch: {
                            index: 'entry_embedding_index',
                            path: 'embedding',
                            queryVector: currentEmbedding,
                            numCandidates: 50,
                            limit: 5,
                            filter: { userId: req.user.id },
                        },
                    },
                    {
                        $project: {
                            content: 1,
                            mood: 1,
                            createdAt: 1,
                            score: { $meta: 'vectorSearchScore' },
                        },
                    },
                ]);
                console.log(`[RAG] Semantic search returned ${pastEntries.length} relevant entries (vector search)`);
            }

            // Fallback: if vector search returned nothing (no index, no embeddings yet), use chronological
            if (pastEntries.length === 0) {
                pastEntries = await Entry.find({ userId: req.user.id })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('content mood createdAt')
                    .lean();
                pastEntries = pastEntries.reverse();
                console.log(`[RAG] Fallback: chronological retrieval returned ${pastEntries.length} entries`);
            }
        } catch (dbError) {
            console.error('[RAG] Retrieval failed, continuing without context:', dbError.message);
            // If the vector index doesn't exist yet, this will fail gracefully
            try {
                pastEntries = await Entry.find({ userId: req.user.id })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('content mood createdAt')
                    .lean();
                pastEntries = pastEntries.reverse();
            } catch (_) { /* give up on RAG context */ }
        }

        // ─── Step 3: Fetch user persona preference ───
        let persona = 'friend';
        try {
            const prefs = await UserPreferences.findOne({ userId: req.user.id }).lean();
            if (prefs?.personaPreference) persona = prefs.personaPreference;
        } catch (_) {
            // Default to friend
        }

        // ─── Step 4: Analyze with selected AI provider ───
        const aiProvider = process.env.AI_PROVIDER?.toLowerCase() === 'ollama' ? 'ollama' : 'gemini';
        let analysis;
        console.log(`[AI Provider]: using ${aiProvider.toUpperCase()} | Persona: ${persona}`);

        const safeContent = content ? content.trim() : '';
        if (aiProvider === 'ollama') {
            analysis = await analyzeOllama(safeContent, { mood, cyclePhase, sleepHours, stressLevel }, pastEntries, persona);
        } else {
            console.log('[DEBUG] image received for analysis:', !!imageUrl, 'mood:', mood);
            analysis = await analyzeGemini(safeContent, { mood, cyclePhase, sleepHours, stressLevel }, imageUrl, pastEntries, persona);
        }

        // ─── Step 5: Save to MongoDB with embedding (non-blocking) ───
        try {
            const entry = new Entry({
                content: content ? content.trim() : '',
                analysis,
                userId: req.user.id,
                mood: mood || null,
                cyclePhase: cyclePhase || null,
                sleepHours: sleepHours !== undefined ? sleepHours : null,
                stressLevel: stressLevel !== undefined ? stressLevel : null,
                imageUrl: imageUrl || null,
                embedding: currentEmbedding || undefined,
            });
            await entry.save();
            console.log('[DB] Entry saved with embedding:', !!currentEmbedding);
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

