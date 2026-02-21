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
}, {
    timestamps: true,
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
