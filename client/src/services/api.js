import { supabase } from '../lib/supabase';

const API_BASE = '/api';

/**
 * Get the current auth token for API requests
 */
async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        return { 'Authorization': `Bearer ${session.access_token}` };
    }
    return {};
}

/**
 * Analyze a journal entry via the Express backend → Gemini
 */
export async function analyzeJournalEntry(content, mood = null) {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
        },
        body: JSON.stringify({ content, mood }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Something went wrong. Please try again. 💕');
    }

    return response.json();
}

/**
 * Fetch all entries for the current user
 */
export async function fetchEntries() {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${API_BASE}/entries`, {
        headers: authHeaders,
    });
    if (!response.ok) throw new Error('Could not load your entries');
    return response.json();
}

/**
 * Fetch entry summary / pattern stats
 */
export async function fetchEntrySummary() {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${API_BASE}/entries/summary`, {
        headers: authHeaders,
    });
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
 * Falls back to browser SpeechSynthesis if API fails
 */
export async function textToSpeech(text) {
    try {
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}/voice/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
            },
            body: JSON.stringify({ text }),
        });

        if (response.ok) {
            const audioBlob = await response.blob();
            return {
                audioUrl: URL.createObjectURL(audioBlob),
                usedFallback: false
            };
        }
    } catch (e) {
        console.warn('ElevenLabs TTS failed, falling back to browser speech:', e);
    }

    // Browser Fallback
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            resolve({ error: 'Speech synthesis not supported' });
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1; // Make it a bit higher/cozier

        // Find a nice female voice if available
        const voices = window.speechSynthesis.getVoices();
        const roseVoice = voices.find(v => v.name.includes('Google') && v.name.includes('UK') && v.name.includes('Female'))
            || voices.find(v => v.name.includes('Female'))
            || voices[0];

        if (roseVoice) utterance.voice = roseVoice;

        utterance.onend = () => {
            resolve({ usedFallback: true });
        };

        utterance.onerror = () => {
            resolve({ error: 'Speech synthesis failed' });
        };

        window.speechSynthesis.speak(utterance);
    });
}

/**
 * Creates a speech recognition wrapper
 */
export function createSpeechRecognition({ onResult, onInterim, onError, onEnd }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return { supported: false };
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (finalTranscript && onResult) onResult(finalTranscript);
        if (interimTranscript && onInterim) onInterim(interimTranscript);
    };

    recognition.onerror = (event) => {
        if (onError) onError(event.error);
    };

    recognition.onend = () => {
        if (onEnd) onEnd();
    };

    return {
        supported: true,
        start: () => recognition.start(),
        stop: () => recognition.stop(),
    };
}
