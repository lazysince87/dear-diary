const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * POST /api/emergency/trigger
 * Send an emergency SOS text message via Twilio
 * Body: { userName?: string, context?: string }
 */
router.post('/trigger', requireAuth, async (req, res, next) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;
        const toNumber = process.env.EMERGENCY_TEST_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber || !toNumber) {
            console.error('[Emergency] Missing Twilio config. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, EMERGENCY_TEST_PHONE_NUMBER in .env');
            return res.status(500).json({
                success: false,
                error: 'Emergency service is not configured yet.',
            });
        }

        const twilio = require('twilio');
        const client = twilio(accountSid, authToken);

        const { userName, context, location } = req.body;
        const name = userName || 'A Dear Diary user';
        // Keep snippet extremely short for Twilio trial limits (160 chars total including Twilio prefix)
        const snippet = context ? context.substring(0, 30) + '...' : '';

        let locationInfo = '';
        if (location && location.lat && location.lng) {
            locationInfo = ` Loc: maps.google.com/?q=${location.lat},${location.lng}`;
        }

        const messageBody = `[SOS] ${name} needs help!${snippet ? ` "${snippet}"` : ''}${locationInfo}`;

        const message = await client.messages.create({
            body: messageBody,
            from: fromNumber,
            to: toNumber,
        });

        console.log(`[Emergency] SOS message sent: ${message.sid}`);

        res.json({
            success: true,
            message: 'Help is on the way. A message has been sent.',
        });
    } catch (error) {
        console.error('[Emergency] Failed to send SOS:', error.message);
        next(error);
    }
});

module.exports = router;
