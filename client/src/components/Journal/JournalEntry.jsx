import { useState } from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { analyzeJournalEntry } from '../../services/api';

const MOODS = [
    { value: 'grateful', label: '🌸 Grateful' },
    { value: 'hopeful', label: '✨ Hopeful' },
    { value: 'confused', label: '😶‍🌫️ Confused' },
    { value: 'sad', label: '💧 Sad' },
    { value: 'anxious', label: '🦋 Anxious' },
    { value: 'angry', label: '🔥 Angry' },
    { value: 'numb', label: '🫥 Numb' },
];

export default function JournalEntry({ onAnalysisComplete }) {
    const { sessionId, isLoading, setIsLoading } = useApp();
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await analyzeJournalEntry(content.trim(), sessionId, selectedMood);
            onAnalysisComplete({
                content: content.trim(),
                mood: selectedMood,
                analysis: result.analysis,
                timestamp: new Date().toISOString(),
            });
            setContent('');
            setSelectedMood(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Get current date in a cozy format
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="animate-fade-in">
            <div className="glass-card p-6 md:p-8">
                {/* Date header */}
                <div className="mb-4">
                    <p className="text-text-muted text-sm">{today}</p>
                    <h2
                        className="text-2xl md:text-3xl font-semibold text-text-primary mt-1"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        Dear Diary...
                    </h2>
                </div>

                {/* Mood selector */}
                <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-2">How are you feeling?</p>
                    <div className="flex flex-wrap gap-2">
                        {MOODS.map((mood) => (
                            <button
                                key={mood.value}
                                onClick={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
                                className={`mood-badge ${selectedMood === mood.value ? 'active' : ''}`}
                            >
                                {mood.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Journal textarea */}
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write about your day, paste a conversation, or share what's on your mind. This is your safe space... 💕"
                        className="journal-textarea"
                        disabled={isLoading}
                        rows={6}
                    />

                    {/* Error message */}
                    {error && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-50 text-rose-600 text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            {/* Voice input button (stretch goal) */}
                            <button
                                type="button"
                                className="btn-secondary flex items-center gap-1.5 !px-3 !py-2"
                                title="Voice input (coming soon)"
                                onClick={() => {/* TODO: Voice input */ }}
                            >
                                <Mic size={16} />
                                <span className="hidden sm:inline text-sm">Speak</span>
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary flex items-center gap-2"
                            disabled={!content.trim() || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Listening...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    <span>Share with Rosie</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
