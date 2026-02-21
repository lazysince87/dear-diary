const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
4. Provide highly specific, actionable advice. Don't just say "set boundaries." Give them examples of what to say or how to approach the exact situation they wrote about. (e.g. "You could try saying: 'I felt undermined when you said...'")
5. The reflection question should be thought-provoking and encourage self-compassion.

You MUST respond ONLY with valid JSON matching this exact schema:
{
  "empathy_response": "A deeply validating, warm opening (2-4 sentences) that clearly shows you understood their precise situation.",
  "tactic_identified": true/false,
  "tactic_name": "Name of the primary tactic detected, or null if none",
  "tactic_explanation": "Gentle explanation of the tactic, why it is harmful, and why it's not the user's fault (2-3 sentences). Null if none.",
  "actionable_advice": "Specific, practical, and therapeutic advice tailored to their exact story. Give them a script or concrete next steps if they asked what to do.",
  "confidence": 0.0 to 1.0,
  "reflection_question": "A compassionate reflection question to help the user process their feelings."
}

Do NOT include any text before or after the JSON. Only valid JSON.`;

/**
 * Analyze a journal entry for manipulation patterns using Gemini
 * @param {string} entryText - The journal entry or conversation to analyze
 * @returns {Object} Structured analysis response
 */
async function analyzeEntry(entryText, mood = null) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
            },
        });

        let prompt = `${SYSTEM_PROMPT}\n\nJOURNAL ENTRY TO ANALYZE:\n"""\n${entryText}\n"""`;
        if (mood) {
            prompt += `\n\nIMPORTANT — The user explicitly selected "${mood}" as their current mood before writing this entry. You MUST acknowledge this mood in your empathy_response. If their words seem to contradict their selected mood, gently explore that contrast (e.g., "You said you're feeling ${mood}, but your words sound upbeat — sometimes we mask how we really feel"). Always trust and center the mood they selected.`;
        }

        const result = await model.generateContent(prompt);
        const response = result.response;
        // Strip markdown backticks if Gemini includes them
        let text = response.text().trim();
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
            actionable_advice: "Taking things one step at a time is often the best approach. Remember to prioritize your own well-being and safety.",
            confidence: 0,
            reflection_question: "What feelings came up for you as you wrote this? Take a moment to sit with them — you deserve that space.",
        };
    }
}

module.exports = { analyzeEntry };
