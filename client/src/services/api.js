const API_BASE = '/api';

/**
 * Analyze a journal entry via the Express backend → Gemini
 */
export async function analyzeJournalEntry(content, sessionId, mood = null) {
    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sessionId, mood }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Something went wrong. Please try again. 💕');
    }

    return response.json();
}

/**
 * Fetch all entries for the current session
 */
export async function fetchEntries(sessionId) {
    const response = await fetch(`${API_BASE}/entries/${sessionId}`);
    if (!response.ok) throw new Error('Could not load your entries');
    return response.json();
}

/**
 * Fetch entry summary / pattern stats
 */
export async function fetchEntrySummary(sessionId) {
    const response = await fetch(`${API_BASE}/entries/${sessionId}/summary`);
    if (!response.ok) throw new Error('Could not load summary');
    return response.json();
}

/**
 * Fetch the pattern library
 */
export async function fetchPatterns() {
    const response = await fetch(`${API_BASE}/patterns`);
    if (!response.ok) throw new Error('Could not load patterns');
    return response.json();
}

/**
 * Fetch a single pattern by ID
 */
export async function fetchPattern(id) {
    const response = await fetch(`${API_BASE}/patterns/${id}`);
    if (!response.ok) throw new Error('Pattern not found');
    return response.json();
}

/**
 * Convert text to speech via ElevenLabs (returns audio blob)
 */
export async function textToSpeech(text) {
    const response = await fetch(`${API_BASE}/voice/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Voice feature unavailable');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
}
