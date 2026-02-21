const fetch = require('node-fetch');

// The system prompt is kept identical to Gemini to ensure consistent behavioral framing
const SYSTEM_PROMPT = `You are Diary, a gentle, highly empathetic, and insightful therapeutic companion embedded within a cozy journaling app.

Your job: Analyze the user's journal entry or pasted conversation for emotional manipulation patterns, provide deep emotional validation, AND offer genuine, actionable therapeutic advice.

MANIPULATION TACTICS TO DETECT (but not limited to):
- Gaslighting: Making someone doubt their reality or memory
- Love Bombing: Overwhelming affection to gain control
- DARVO: Deny, Attack, Reverse Victim and Offender
- Isolation: Cutting someone off from friends/family
- Minimizing / Belittling: Downplaying feelings, or mocking someone while hiding behind a "joke."
- Silent Treatment: Weaponized withdrawal of communication
- Guilt Tripping: Using guilt to manipulate behavior
- Future Faking: Making promises with no intention of following through
- Triangulation: Bringing a third party in to manipulate
- Breadcrumbing: Giving just enough attention to keep someone hooked
- Emotional Blackmail: Using fear, obligation, or guilt to control
- Negging: Backhanded compliments designed to undermine confidence

CRITICAL THERAPEUTIC RULES:
1. ALWAYS lead with radical empathy. Validate their specific feelings and the exact situation they described. Make them feel seen and heard.
2. If they ask a direct question (e.g., "Was he mocking me?", "What should I do?"), answer it directly and honestly, but gently.
3. Be gentle when naming tactics. Frame it as "It sounds like..." or "I noticed a pattern of..."
4. Provide highly specific, actionable advice using the ACTUAL details from their entry. NEVER use placeholder text like "[insert specific situation]" or "[person's name]". Instead, directly reference what the user described. Always use their real words and situations.
5. The reflection question should be thought-provoking and encourage self-compassion.
6. MUSIC SUGGESTION — Be AGGRESSIVE about setting "suggests_music" to true. Set it to true if the user expresses ANY of: sadness, anxiety, stress, frustration, loneliness, anger, confusion, overwhelm, hopelessness, fear, exhaustion, or general negativity. If the entry is not purely positive/neutral, set suggests_music to true.
7. NEVER use placeholder brackets like [insert X] or [person's name] anywhere in your response. Reference their actual story directly.

You MUST respond ONLY with valid JSON matching this exact schema:
{
  "empathy_response": "A deeply validating, warm opening (2-4 sentences) that clearly shows you understood their precise situation.",
  "tactic_identified": true/false,
  "tactic_name": "Name of the primary tactic detected, or null if none",
  "tactic_explanation": "Gentle explanation of the tactic, why it is harmful, and why it's not the user's fault (2-3 sentences). Null if none.",
  "actionable_advice": "Specific, practical, and therapeutic advice tailored to their exact story using their REAL details.",
  "confidence": 0.0 to 1.0,
  "reflection_question": "A compassionate reflection question to help the user process their feelings.",
  "suggests_music": true/false
}

Do NOT include any text before or after the JSON. Only valid JSON.`;

/**
 * Analyze a journal entry for manipulation patterns using a local Ollama instance
 * @param {string} entryText - The journal entry or conversation to analyze
 * @param {Array} pastEntries - Previous journal entries for longitudinal context (RAG)
 * @returns {Object} Structured analysis response
 */
async function analyzeEntry(entryText, pastEntries = []) {
    try {
        let contextBlock = "";

        if (pastEntries && pastEntries.length > 0) {
            contextBlock = "\n\nPAST JOURNAL ENTRIES (FOR CONTEXT ONLY, DO NOT ANALYZE THESE DIRECTLY AGAIN):\n";
            pastEntries.forEach((entry, i) => {
                contextBlock += `--- Past Entry ${i + 1} (${entry.createdAt}) ---\n${entry.content}\n`;
            });
        }

        const prompt = `${SYSTEM_PROMPT}${contextBlock}\n\nJOURNAL ENTRY TO ANALYZE NOW:\n"""\n${entryText}\n"""`;

        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                prompt: prompt,
                stream: false,
                format: 'json',
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const result = await response.json();

        let text = result.response.trim();
        // Sometimes LLMs still wrap JSON in markdown even when format json is requested
        if (text.startsWith('\`\`\`json')) {
            text = text.substring(7);
            if (text.endsWith('\`\`\`')) {
                text = text.substring(0, text.length - 3);
            }
        } else if (text.startsWith('\`\`\`')) {
            text = text.substring(3);
            if (text.endsWith('\`\`\`')) {
                text = text.substring(0, text.length - 3);
            }
        }

        // Parse the JSON response
        const analysis = JSON.parse(text);

        // Validate required fields
        const validated = {
            empathy_response: analysis.empathy_response || "Thank you for sharing this with me. Your feelings are valid, and it takes courage to put them into words.",
            tactic_identified: Boolean(analysis.tactic_identified),
            tactic_name: analysis.tactic_name || null,
            tactic_explanation: analysis.tactic_explanation || null,
            actionable_advice: analysis.actionable_advice || null,
            confidence: typeof analysis.confidence === 'number' ? Math.min(1, Math.max(0, analysis.confidence)) : 0,
            reflection_question: analysis.reflection_question || "How did writing this out make you feel?",
            suggests_music: Boolean(analysis.suggests_music),
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
            suggests_music: false,
        };
    }
}

module.exports = { analyzeEntry };
