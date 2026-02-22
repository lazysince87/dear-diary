const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    // The raw journal entry text
    content: {
        type: String,
        required: false,
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
        patterns_detected: [
            {
                name: String,
                explanation: String,
                severity: String
            }
        ],
        suggests_music: { type: Boolean, default: false },
        requires_immediate_intervention: { type: Boolean, default: false },
    },
    // Supabase user ID
    userId: {
        type: String,
        required: false,
        index: true,
    },
    mood: {
        type: [String],
        enum: ['grateful', 'confused', 'sad', 'anxious', 'hopeful', 'angry', 'numb', null],
        default: [],
    },
    // Menstrual cycle phase (optional)
    cyclePhase: {
        type: String,
        enum: ['menstrual', 'follicular', 'ovulatory', 'luteal', null],
        default: null,
    },
    // Sleep hours (optional)
    sleepHours: {
        type: Number,
        min: 0,
        max: 24,
        default: null,
    },
    // Stress level 1-10 (optional)
    stressLevel: {
        type: Number,
        min: 1,
        max: 10,
        default: null,
    },
    // Optional attachment URL (stored in Supabase)
    imageUrl: {
        type: String,
        default: null,
    },
    // Vector embedding for semantic RAG (768-dim from Gemini text-embedding-004)
    embedding: {
        type: [Number],
        default: undefined, // don't store empty arrays
    },
}, {
    timestamps: true, // createdAt & updatedAt
});

// Index for longitudinal pattern queries
entrySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Entry', entrySchema);
