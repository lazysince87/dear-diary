const API_BASE = '/api';

/**
 * Analyze a journal entry via the Express backend -> Gemini
 */
export async function analyzeJournalEntry(content, sessionId, mood = null) {
    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sessionId, mood }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Something went wrong. Please try again.');
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
 * Use the browser's built-in Web Speech API as a free TTS fallback.
 * Returns a promise that resolves when speech finishes.
 */
function browserTTS(text) {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('Browser does not support speech synthesis'));
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;   // Slightly slower for a calm feel
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to pick a softer/female voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v =>
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Victoria') ||
            v.name.includes('Google US English')
        );
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);
        window.speechSynthesis.speak(utterance);
    });
}

/**
 * Convert text to speech -- tries ElevenLabs first, then falls back to browser TTS.
 * Returns { audioUrl, usedFallback } or plays via browser directly.
 */
export async function textToSpeech(text) {
    try {
        const response = await fetch(`${API_BASE}/voice/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });

        // If the server says to use fallback, do browser TTS
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (errorData.fallback || response.status === 503) {
                await browserTTS(text);
                return { usedFallback: true };
            }
            throw new Error(errorData.message || 'Voice feature unavailable');
        }

        const audioBlob = await response.blob();
        return { audioUrl: URL.createObjectURL(audioBlob), usedFallback: false };
    } catch (error) {
        // Network error or any other failure -- fall back to browser TTS
        console.warn('ElevenLabs unavailable, using browser speech:', error.message);
        await browserTTS(text);
        return { usedFallback: true };
    }
}

/**
 * Start speech-to-text using the browser's Web Speech API.
 * Returns an object with { start, stop } methods.
 * Calls onResult(transcript) with the final recognized text.
 * Calls onInterim(transcript) with intermediate results.
 */
export function createSpeechRecognition({ onResult, onInterim, onError, onEnd }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return {
            supported: false,
            start: () => onError?.('Speech recognition is not supported in this browser'),
            stop: () => { },
        };
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
                onResult?.(finalTranscript.trim());
            } else {
                interim += transcript;
                onInterim?.(finalTranscript + interim);
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        onError?.(event.error === 'not-allowed'
            ? 'Microphone access was denied. Please allow microphone access to use voice input.'
            : 'Voice input encountered an error. Please try again.');
    };

    recognition.onend = () => {
        onEnd?.(finalTranscript.trim());
    };

    return {
        supported: true,
        start: () => {
            finalTranscript = '';
            recognition.start();
        },
        stop: () => {
            recognition.stop();
        },
    };
}
