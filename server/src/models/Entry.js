const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    // The raw journal entry text
    content: {
        type: String,
        required: true,
        trim: true,
    },
    // Gemini analysis result
    analysis: {
        empathy_response: { type: String },
        tactic_identified: { type: Boolean, default: false },
        tactic_name: { type: String, default: null },
        tactic_explanation: { type: String, default: null },
        actionable_advice: { type: String, default: null },
        confidence: { type: Number, default: 0 },
        reflection_question: { type: String },
    },
    // Supabase user ID
    userId: {
        type: String,
        required: true,
        index: true,
    },
    // Mood tag (optional, user-selected)
    mood: {
        type: String,
        enum: ['grateful', 'confused', 'sad', 'anxious', 'hopeful', 'angry', 'numb', null],
        default: null,
    },
    // Image URLs (uploaded to Supabase, stored here for reference)
    imageUrls: [{
        type: String,
    }],
}, {
    timestamps: true, // createdAt & updatedAt
});

// Index for longitudinal pattern queries
entrySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Entry', entrySchema);
