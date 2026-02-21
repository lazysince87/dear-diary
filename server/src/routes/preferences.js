const express = require('express');
const router = express.Router();
const UserPreferences = require('../models/UserPreferences');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * GET /api/preferences
 * Get the current user's preferences
 */
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const prefs = await UserPreferences.findOne({ userId: req.user.id }).lean();
        res.json({ success: true, preferences: prefs || null });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/preferences
 * Create or update user preferences (onboarding)
 */
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { displayName, personaPreference, defaultCyclePhase, averageSleepHours, averageStressLevel } = req.body;

        const update = {};
        if (displayName) update.displayName = displayName.trim();
        if (personaPreference && ['friend', 'therapist'].includes(personaPreference)) {
            update.personaPreference = personaPreference;
        }
        if (defaultCyclePhase !== undefined) {
            update.defaultCyclePhase = ['menstrual', 'follicular', 'ovulatory', 'luteal'].includes(defaultCyclePhase) ? defaultCyclePhase : null;
        }
        if (averageSleepHours !== undefined) {
            update.averageSleepHours = averageSleepHours !== null ? Number(averageSleepHours) : null;
        }
        if (averageStressLevel !== undefined) {
            update.averageStressLevel = averageStressLevel !== null ? Number(averageStressLevel) : null;
        }
        update.onboardingComplete = true;

        const prefs = await UserPreferences.findOneAndUpdate(
            { userId: req.user.id },
            update,
            { upsert: true, new: true }
        );

        res.json({ success: true, preferences: prefs });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
