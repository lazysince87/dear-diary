const fetch = require('node-fetch');

// Import the shared prompt and persona instructions from gemini.js
// This ensures both Ollama and Gemini use the exact same behavioral framing
const { SYSTEM_PROMPT_BASE, PERSONA_INSTRUCTIONS } = require('./gemini');

/**
 * Analyze a journal entry for manipulation patterns using a local Ollama instance
 * Uses the same prompt logic as the Gemini service for consistency.
 * @param {string} entryText - The journal entry or conversation to analyze
 * @param {Object} healthData - { mood, cyclePhase, sleepHours, stressLevel }
 * @param {Array} pastEntries - Previous journal entries for longitudinal context (RAG)
 * @param {string} persona - 'friend' or 'therapist'
 * @returns {Object} Structured analysis response
 */
async function analyzeEntry(entryText, healthData = {}, pastEntries = [], persona = 'friend') {
    try {
        const { mood, cyclePhase, sleepHours, stressLevel } = healthData;

        // Build the prompt using the shared system prompt (identical to Gemini)
        let systemPrompt = SYSTEM_PROMPT_BASE;

        // Add persona instruction
        if (PERSONA_INSTRUCTIONS[persona]) {
            systemPrompt += PERSONA_INSTRUCTIONS[persona];
        }

        // Build the user prompt
        let prompt = '';

        // Add RAG context from past entries
        if (pastEntries && pastEntries.length > 0) {
            prompt += 'PAST JOURNAL ENTRIES (for longitudinal context ONLY — do NOT re-analyze these, and do NOT reference patterns from these entries unless they are directly relevant to the CURRENT entry below):\n';
            pastEntries.forEach((entry, i) => {
                const date = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : `Entry ${i + 1}`;
                prompt += `--- Past Entry (${date}) ---\n${entry.content}\n\n`;
            });
            prompt += '--- END OF PAST ENTRIES ---\n\n';
        }

        // Add mood context
        if (mood) {
            prompt += `The user selected their current mood as: "${mood}".\n\n`;
        }

        // Add health context (same logic as gemini.js)
        let healthContext = [];
        if (cyclePhase) {
            healthContext.push(`The user is currently in her ${cyclePhase.toUpperCase()} phase of her menstrual cycle. This is important physiological context.`);
            if (cyclePhase === 'luteal') {
                healthContext.push('The luteal phase (PMS) is associated with heightened emotional sensitivity, which an abusive partner may exploit.');
            }
        }
        if (sleepHours !== null && sleepHours !== undefined) {
            healthContext.push(`The user reported sleeping ${sleepHours} hours last night.`);
            if (sleepHours < 6) {
                healthContext.push('This indicates sleep deprivation, which significantly impacts emotional resilience and decision-making.');
            }
        }
        if (stressLevel !== null && stressLevel !== undefined) {
            healthContext.push(`The user reported a current stress level of ${stressLevel}/10.`);
        }

        if (healthContext.length > 0) {
            prompt += `CONTEXTUAL HEALTH DATA:\n${healthContext.join('\n')}\nPlease factor this physiological context into your empathy response and actionable advice if relevant.\n\n`;
        }

        // Vulnerability Window insights
        if (pastEntries && pastEntries.length > 0 && healthContext.length > 0) {
            prompt += `VULNERABILITY WINDOW INSIGHTS: Since you have the user's past entries above and their current health data, look for correlations. For example, if a partner frequently uses minimizing language when the user is sleep-deprived or in their luteal phase, point this out as a "Vulnerability Window" insight.\n\n`;
        }

        // The actual current entry to analyze
        prompt += `CURRENT JOURNAL ENTRY TO ANALYZE NOW (THIS IS THE ONLY ENTRY YOU ARE ANALYZING — respond ONLY about this entry):\n"""\n${entryText}\n"""`;

        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                prompt: prompt,
                system: systemPrompt,
                stream: false,
                format: 'json',
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_ctx: 4096,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const result = await response.json();

        let text = result.response.trim();
        // Extract JSON using regex to handle extra conversational text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        // Parse the JSON response
        const analysis = JSON.parse(text);

        // Validate required fields (same schema as gemini.js)
        const validated = {
            empathy_response: analysis.empathy_response || "Thank you for sharing this with me. Your feelings are valid, and it takes courage to put them into words.",
            tactic_identified: Boolean(analysis.tactic_identified),
            tactic_name: analysis.tactic_name || null,
            tactic_explanation: analysis.tactic_explanation || null,
            actionable_advice: analysis.actionable_advice || null,
            confidence: typeof analysis.confidence === 'number' ? Math.min(1, Math.max(0, analysis.confidence)) : 0,
            reflection_question: analysis.reflection_question || "How did writing this out make you feel?",
            patterns_detected: Array.isArray(analysis.patterns_detected) ? analysis.patterns_detected : [],
            suggests_music: Boolean(analysis.suggests_music),
            requires_immediate_intervention: Boolean(analysis.requires_immediate_intervention),
        };

        return validated;
    } catch (error) {
        console.error('Ollama analysis error:', error);

        // Graceful fallback — always be supportive
        return {
            empathy_response: "Thank you for sharing this with me. I can see you're processing some difficult feelings, and that takes real courage. Your experiences and emotions are valid.",
            tactic_identified: false,
            tactic_name: null,
            tactic_explanation: null,
            actionable_advice: "Taking things one step at a time is often the best approach. Remember to prioritize your own well-being and safety.",
            confidence: 0,
            reflection_question: "What feelings came up for you as you wrote this? Take a moment to sit with them — you deserve that space.",
            patterns_detected: [],
            suggests_music: false,
            requires_immediate_intervention: false,
        };
    }
}

module.exports = { analyzeEntry };
