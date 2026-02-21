const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * GET /api/entries
 * Get all entries for the authenticated user
 */
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const entries = await Entry.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ success: true, entries });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/entries/summary
 * Get a summary of patterns detected across all entries
 */
router.get('/summary', requireAuth, async (req, res, next) => {
    try {
        const entries = await Entry.find({
            userId: req.user.id,
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
