const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
    // Supabase Auth user ID
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    // Display name chosen during onboarding
    displayName: {
        type: String,
        default: null,
    },
    // AI persona preference
    personaPreference: {
        type: String,
        enum: ['friend', 'therapist'],
        default: 'friend',
    },
    // Spotify OAuth tokens
    spotifyAccessToken: {
        type: String,
        default: null,
    },
    spotifyRefreshToken: {
        type: String,
        default: null,
    },
    spotifyTokenExpiresAt: {
        type: Date,
        default: null,
    },
    // Cached Spotify music taste data
    musicTaste: {
        topArtists: [{ type: String }],
        topTracks: [{
            name: { type: String },
            artist: { type: String },
            uri: { type: String },      // Spotify URI for playback
            previewUrl: { type: String }, // 30-second preview URL
        }],
        topGenres: [{ type: String }],
    },
    // Whether onboarding is complete
    onboardingComplete: {
        type: Boolean,
        default: false,
    },
    // Health baseline fields
    defaultCyclePhase: {
        type: String,
        enum: ['menstrual', 'follicular', 'ovulatory', 'luteal', null],
        default: null,
    },
    averageSleepHours: {
        type: Number,
        min: 0,
        max: 24,
        default: null,
    },
    averageStressLevel: {
        type: Number,
        min: 1,
        max: 10,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
