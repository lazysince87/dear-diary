const mongoose = require("mongoose");

const patternSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Warning signs to look for
  signs: [
    {
      type: String,
    },
  ],
  // Example phrases someone might use
  examples: [
    {
      type: String,
    },
  ],
  // What a healthy alternative looks like
  healthyAlternative: {
    type: String,
  },
  // Severity level for UI display
  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  // Icon/emoji for display
  // icon: {
  //     type: String,
  //     default: '⚠️',
  // },
});

module.exports = mongoose.model("Pattern", patternSchema);
