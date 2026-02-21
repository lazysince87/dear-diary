const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are Diary, a gentle, highly empathetic, and insightful therapeutic companion embedded within a cozy journaling app.

Your job: Analyze the user's journal entry, pasted conversation, OR attached screenshots/images for emotional manipulation patterns. Provide deep emotional validation and offer genuine, actionable therapeutic advice.

VISUAL EVIDENCE: If an image is provided, it is likely a screenshot of a conversation (e.g., iMessage, WhatsApp). You MUST perform OCR to read all text within the image carefully. This text is the core of the user's experience. Use the visual context—like who is blue/gray, the tone of the messages, and the timing—to inform your analysis.

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
4. Provide highly specific, actionable advice using the ACTUAL details from their entry. NEVER use placeholder text like "[insert specific situation]" or "[person's name]". Instead, directly reference what the user described. For example, if they mentioned their boss criticized them in a meeting, say: "You could try telling your boss: 'When you criticized my work in front of everyone, it made me feel undermined.'" Always use their real words and situations.
5. The reflection question should be thought-provoking and encourage self-compassion.
6. For patterns_detected, identify ALL manipulation patterns present in the entry. Categorize each one by severity:
   - "low": Subtle or possibly unintentional behavior
   - "medium": Clear pattern that warrants attention
   - "high": Serious, deliberate manipulation that could be harmful
7. MUSIC SUGGESTION — Be AGGRESSIVE about setting "suggests_music" to true. Set it to true if the user expresses ANY of: sadness, anxiety, stress, frustration, loneliness, anger, confusion, overwhelm, hopelessness, fear, exhaustion, or general negativity. Essentially, if the entry is not purely positive/neutral, set suggests_music to true. When you do, weave it naturally into your empathy_response, like: "I think some of your favorite music might help you feel a little more grounded right now."
8. NEVER use placeholder brackets like [insert X] or [person's name] anywhere in your response. You have the user's actual story — reference it directly. Every piece of advice should feel personally written for them, not templated.
9. JOKES VS. MANIPULATION: Carefully distinguish between casual banter/sarcasm between friends and actual emotional abuse.
   - A joke or sarcasm is mutual, lacks a power imbalance, and the user's tone indicates they are not genuinely distressed or confused by it.
   - Actual Gaslighting/Manipulation relies on an intent to control, a power imbalance, and results in the user feeling "crazy", fearful, or deeply distressed.
   - IF the user indicates they are fine with the interaction (e.g., "lol", "we always joke like this", "my bestie"), you MUST set "tactic_identified" to false. Do not pathologize normal banter.
10. IMMEDIATE INTERVENTION: Set "requires_immediate_intervention" to true ONLY if the user describes active physical violence, expresses extreme fear for their physical safety, or uses urgent phrases like "I NEED HELP", "HE'S GOING TO HURT ME", "I'M BEING ABUSED RIGHT NOW", or if you detect a longitudinal pattern of escalating severe abuse across their past entries. This is a high-stakes flag; do NOT set it lightly for emotional distress alone—only for situations where physical safety appears to be at risk.

You MUST respond ONLY with valid JSON matching this exact schema:
{
  "empathy_response": "A deeply validating, warm opening (2-4 sentences) that clearly shows you understood their precise situation.",
  "tactic_identified": true/false,
  "tactic_name": "Name of the primary tactic detected, or null if none",
  "tactic_explanation": "Gentle explanation of the tactic, why it is harmful, and why it's not the user's fault (2-3 sentences). Null if none.",
  "actionable_advice": "Specific, practical, and therapeutic advice tailored to their exact story using their REAL details. Give them a script or concrete next steps if they asked what to do.",
  "confidence": 0.0 to 1.0,
  "reflection_question": "A compassionate reflection question to help the user process their feelings.",
  "patterns_detected": [
    {
      "name": "Pattern name",
      "explanation": "Brief, gentle explanation of how this pattern appears in their entry",
      "severity": "low" | "medium" | "high"
    }
  ],
  "suggests_music": true/false,
  "requires_immediate_intervention": true/false
}

Note: patterns_detected should be an empty array [] if no patterns are found. Include ALL patterns you detect, not just the primary one.

Do NOT include any text before or after the JSON. Only valid JSON.`;

const PERSONA_INSTRUCTIONS = {
    friend: `\n\nIMPORTANT PERSONA INSTRUCTION: You are speaking as a warm, caring best friend. Use casual language, contractions, and be conversational. Say things like "oh honey", "that's so not okay", "I'm here for you". Sound like a supportive best friend texting them, not a clinical professional.`,
    therapist: `\n\nIMPORTANT PERSONA INSTRUCTION: You are speaking as a gentle, professional therapist. Use clear, measured language. Be solution-oriented while still deeply empathetic. Frame observations clinically but accessibly. Use phrases like "What I'm noticing is...", "A helpful reframe might be...", "Let's explore that together".`,
};

/**
 * Analyze a journal entry for manipulation patterns using Gemini
 * @param {string} entryText - The journal entry or conversation to analyze
 * @param {Object|string} options - Options object (or legacy mood string) containing mood, cyclePhase, sleepHours, stressLevel
 * @param {Array} pastEntries - Previous journal entries for longitudinal context (RAG)
 * @param {string} persona - The therapeutic persona to use
 * @returns {Object} Structured analysis response
 */
async function analyzeEntry(entryText, options = {}, imageUrl = null, pastEntries = [], persona = 'friend') {
    // Handle backwards compatibility where options was just the mood string
    const moodOpts = typeof options === 'string' ? { mood: options } : options || {};
    const { mood = null, cyclePhase = null, sleepHours = null, stressLevel = null } = moodOpts;

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
            },
        });

        let contextBlock = "";

        if (pastEntries && pastEntries.length > 0) {
            contextBlock = "\n\nPAST JOURNAL ENTRIES (FOR CONTEXT ONLY, DO NOT ANALYZE THESE DIRECTLY AGAIN):\n";
            pastEntries.forEach((entry, i) => {
                contextBlock += `--- Past Entry ${i + 1} (${entry.createdAt}) ---\n${entry.content}\n`;
            });
        }

        // Build the full system prompt with persona instructions
        const personaInstruction = PERSONA_INSTRUCTIONS[persona] || PERSONA_INSTRUCTIONS.friend;
        const SYSTEM_PROMPT = SYSTEM_PROMPT_BASE + personaInstruction;

        let promptText = `${SYSTEM_PROMPT}${contextBlock}\n\nJOURNAL ENTRY TO ANALYZE NOW:\n"""\n${entryText || "[Note: The user provided an image/screenshot for analysis without additional text.]"}\n"""`;

        if (mood) {
            promptText += `\n\nIMPORTANT — The user explicitly selected "${mood}" as their current mood before writing this entry. You MUST acknowledge this mood in your empathy_response. If their words seem to contradict their selected mood, gently explore that contrast. Always trust and center the mood they selected.`;
        }

        let healthContext = [];
        if (cyclePhase) {
            healthContext.push(`The user is currently in her ${cyclePhase.toUpperCase()} phase. Hormonal fluctuations can affect emotional resilience, perception, and susceptibility to manipulation (e.g. heightening sensitivity or self-doubt during luteal/menstrual phases). Validate her feelings while gently reminding her to give herself grace during this hormonal window if appropriate.`);
        }
        if (sleepHours !== null && sleepHours !== undefined) {
            healthContext.push(`The user reported sleeping ${sleepHours} hours last night.`);
            if (sleepHours < 6) {
                healthContext.push(`This indicates sleep deprivation. Gentle reminder: It's harder to defend reality against gaslighting when sleep-deprived. Note this in your advice to prioritize rest.`);
            }
        }
        if (stressLevel !== null && stressLevel !== undefined) {
            healthContext.push(`The user reported a current stress level of ${stressLevel}/10.`);
        }

        if (healthContext.length > 0) {
            promptText += `\n\nCONTEXTUAL HEALTH DATA:\n${healthContext.join('\n')}\nPlease factor this physiological context into your empathy response and actionable advice if relevant.`;
        }

        if (pastEntries && pastEntries.length > 0) {
            promptText += `\n\nVULNERABILITY WINDOW INSIGHTS: Since you have the user's past entries above and their current health data, look for correlations. For example, if a partner frequently uses minimizing language when the user is sleep-deprived or in their luteal phase, point this out as a "Vulnerability Window" insight. Abusive partners sometimes subconsciously escalate when they sense vulnerability.`;
        }

        if (imageUrl) {
            promptText += `\n\nIMAGE ATTACHMENT: An image (likely a screenshot or photo) has been attached to this entry. Please analyze the content of this image along with the text. If the image contains a conversation, treat it as a primary part of the entry's context.`;
        }

        const promptParts = [promptText];

        // If there's an image, fetch it and add as a part
        if (imageUrl) {
            try {
                const imageResp = await fetch(imageUrl);
                const buffer = await imageResp.arrayBuffer();
                promptParts.push({
                    inlineData: {
                        data: Buffer.from(buffer).toString("base64"),
                        mimeType: "image/jpeg" // assume jpeg or similar for generative ai; gemini is flexible
                    }
                });
            } catch (imgErr) {
                console.error('Failed to fetch image for analysis:', imgErr.message);
                // Continue without image part if fetch fails
            }
        }

        const result = await model.generateContent(promptParts);
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
            patterns_detected: Array.isArray(analysis.patterns_detected) ? analysis.patterns_detected : [],
            suggests_music: Boolean(analysis.suggests_music),
            requires_immediate_intervention: Boolean(analysis.requires_immediate_intervention),
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
            patterns_detected: [],
            suggests_music: false,
        };
    }
}

module.exports = { analyzeEntry };
