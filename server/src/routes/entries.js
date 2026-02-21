const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

/**
 * GET /api/entries/:sessionId
 * Get all entries for a session (for history/longitudinal view)
 */
router.get('/:sessionId', async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const entries = await Entry.find({ sessionId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ success: true, entries });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/entries/:sessionId/summary
 * Get a summary of patterns detected across all entries (stretch: longitudinal)
 */
router.get('/:sessionId/summary', async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const entries = await Entry.find({
            sessionId,
            'analysis.tactic_identified': true
        }).lean();

        // Count tactics
        const tacticCounts = {};
        entries.forEach(entry => {
            const tactic = entry.analysis?.tactic_name;
            if (tactic) {
                tacticCounts[tactic] = (tacticCounts[tactic] || 0) + 1;
            }
        });

        res.json({
            success: true,
            totalEntries: entries.length,
            tacticCounts,
            mostCommon: Object.entries(tacticCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([name, count]) => ({ name, count })),
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
