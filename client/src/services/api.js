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
export async function analyzeJournalEntry(content, mood = null, imageUrl = null, cyclePhase = null, sleepHours = null, stressLevel = null) {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
        },
        body: JSON.stringify({ content, mood, imageUrl, cyclePhase, sleepHours, stressLevel }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Something went wrong. Please try again.');
    }

    return response.json();
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadJournalImage(file) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('You must be logged in to upload images');

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('Images')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Could not upload image', uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('Images')
        .getPublicUrl(filePath);

    return publicUrl;
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
 * @param {string} text - Text to speak
 * @param {Object} [analysis] - Optional Gemini analysis for emotion-aware voice tuning
 */
export async function textToSpeech(text, analysis = null) {
    try {
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}/voice/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
            },
            body: JSON.stringify({ text, analysis }),
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

// ─── Preferences ─────────────────────

/**
 * Get user preferences (persona, display name, etc.)
 */
export async function getPreferences() {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/preferences`, { headers: authHeaders });
    if (!response.ok) throw new Error('Could not load preferences');
    return response.json();
}

/**
 * Save user preferences (onboarding)
 */
export async function savePreferences(data) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Could not save preferences');
    return response.json();
}

// ─── Spotify ─────────────────────────

/**
 * Get the Spotify login URL
 */
export async function getSpotifyLoginUrl() {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/spotify/login`, { headers: authHeaders });
    if (!response.ok) throw new Error('Could not get Spotify login URL');
    return response.json();
}

/**
 * Exchange Spotify authorization code for tokens
 */
export async function spotifyCallback(code) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/spotify/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ code }),
    });
    if (!response.ok) throw new Error('Spotify connection failed');
    return response.json();
}

/**
 * Check Spotify connection status
 */
export async function getSpotifyStatus() {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/spotify/status`, { headers: authHeaders });
    if (!response.ok) throw new Error('Could not check Spotify status');
    return response.json();
}

// ─── Music ───────────────────────────

/**
 * Generate ambient music using ElevenLabs Sound Effects API
 */
export async function generateMusic(genres = []) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/voice/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ genres }),
    });

    if (!response.ok) throw new Error('Music generation failed');

    const audioBlob = await response.blob();
    return {
        audioUrl: URL.createObjectURL(audioBlob),
    };
}

// ─── Emergency SOS ────────────────────

/**
 * Trigger an emergency SOS text message via Twilio
 */
export async function triggerEmergencySOS(userName = '', context = '', location = null) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/emergency/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ userName, context, location }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Emergency service unavailable');
    }
    return response.json();
}

