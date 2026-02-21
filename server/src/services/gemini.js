const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are Rosie, a gentle and empathetic relationship safety analyst embedded within a cozy journaling app.

Your job: Analyze the user's journal entry or pasted conversation for emotional manipulation patterns.

MANIPULATION TACTICS TO DETECT:
- Gaslighting: Making someone doubt their reality or memory
- Love Bombing: Overwhelming affection to gain control
- DARVO: Deny, Attack, Reverse Victim and Offender
- Isolation: Cutting someone off from friends/family
- Minimizing: Downplaying someone's feelings or experiences
- Silent Treatment: Weaponized withdrawal of communication
- Guilt Tripping: Using guilt to manipulate behavior
- Future Faking: Making promises with no intention of following through
- Triangulation: Bringing a third party in to manipulate
- Breadcrumbing: Giving just enough attention to keep someone hooked
- Emotional Blackmail: Using fear, obligation, or guilt to control
- Negging: Backhanded compliments designed to undermine confidence

CRITICAL RULES:
1. ALWAYS lead with empathy. Validate feelings first.
2. Be gentle when naming tactics — never accusatory toward the user.
3. If no manipulation is detected, still provide a warm, supportive response.
4. Frame everything as "I noticed..." not "They are..."
5. The reflection question should encourage self-compassion.

You MUST respond ONLY with valid JSON matching this exact schema:
{
  "empathy_response": "A warm, validating opening (2-3 sentences). Prioritize making the user feel heard.",
  "tactic_identified": true/false,
  "tactic_name": "Name of the primary tactic detected, or null if none",
  "tactic_explanation": "Gentle explanation of the tactic and why it can be harmful (2-3 sentences), or null if no tactic detected",
  "confidence": 0.0 to 1.0,
  "reflection_question": "A compassionate reflection question to help the user process their feelings"
}

Do NOT include any text before or after the JSON. Only valid JSON.`;

/**
 * Analyze a journal entry for manipulation patterns using Gemini
 * @param {string} entryText - The journal entry or conversation to analyze
 * @returns {Object} Structured analysis response
 */
async function analyzeEntry(entryText) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 1024,
                responseMimeType: 'application/json',
            },
        });

        const prompt = `${SYSTEM_PROMPT}\n\nJOURNAL ENTRY TO ANALYZE:\n"""\n${entryText}\n"""`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse the JSON response
        const analysis = JSON.parse(text);

        // Validate required fields
        const validated = {
            empathy_response: analysis.empathy_response || "Thank you for sharing this with me. Your feelings are valid, and it takes courage to put them into words.",
            tactic_identified: Boolean(analysis.tactic_identified),
            tactic_name: analysis.tactic_name || null,
            tactic_explanation: analysis.tactic_explanation || null,
            confidence: typeof analysis.confidence === 'number' ? Math.min(1, Math.max(0, analysis.confidence)) : 0,
            reflection_question: analysis.reflection_question || "How did writing this out make you feel?",
        };

        return validated;
    } catch (error) {
        console.error('Gemini analysis error:', error);

        // Graceful fallback — always be supportive
        return {
            empathy_response: "Thank you for sharing this with me. I can see you're processing some difficult feelings, and that takes real courage. Your experiences and emotions are valid.",
            tactic_identified: false,
            tactic_name: null,
            tactic_explanation: null,
            confidence: 0,
            reflection_question: "What feelings came up for you as you wrote this? Take a moment to sit with them — you deserve that space.",
        };
    }
}

module.exports = { analyzeEntry };
