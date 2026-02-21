import { useState } from 'react';
import { Volume2, AlertTriangle, Sparkles } from 'lucide-react';
import { textToSpeech } from '../../services/api';

export default function JournalResponse({ entry }) {
    const { analysis, content, mood, timestamp } = entry;
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState(false);

    const handlePlayVoice = async () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setAudioError(false);

        try {
            const result = await textToSpeech(analysis.empathy_response);

            if (result.usedFallback) {
                // Browser TTS already played and finished
                setIsPlaying(false);
            } else if (result.audioUrl) {
                // ElevenLabs returned audio — play it
                const audio = new Audio(result.audioUrl);
                audio.onended = () => setIsPlaying(false);
                audio.onerror = () => {
                    setIsPlaying(false);
                    setAudioError(true);
                };
                audio.play();
            }
        } catch {
            setIsPlaying(false);
            setAudioError(true);
        }
    };

    const time = new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    return (
        <div className="animate-slide-up mt-6">
            <div className="glass-card p-6 md:p-8">
                {/* Rosie's avatar & header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dusty-rose to-rose-400 flex items-center justify-center text-white text-lg shadow-md">
                        🌹
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary" style={{ fontFamily: 'var(--font-serif)' }}>
                            Rosie says...
                        </h3>
                        <p className="text-xs text-text-muted">{time}</p>
                    </div>

                    {/* Voice playback button */}
                    <button
                        onClick={handlePlayVoice}
                        className="ml-auto btn-secondary !p-2 !rounded-full"
                        title="Listen to Rosie's response"
                        disabled={isPlaying}
                    >
                        <Volume2
                            size={16}
                            className={isPlaying ? 'animate-pulse-soft text-rose-500' : 'text-text-muted'}
                        />
                    </button>
                </div>

                {/* Empathy response (always shown first) */}
                <div className="mb-5">
                    <p className="text-text-primary leading-relaxed text-base">
                        {analysis.empathy_response}
                    </p>
                </div>

                {/* Tactic identification (only if detected) */}
                {analysis.tactic_identified && analysis.tactic_name && (
                    <div className="mb-5 p-4 rounded-xl bg-rose-50/60 border border-rose-200/40 animate-fade-in delay-200">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={16} className="text-rose-500" />
                            <h4 className="font-semibold text-rose-600 text-sm">
                                I noticed something: {analysis.tactic_name}
                            </h4>
                            {analysis.confidence > 0 && (
                                <span className="ml-auto text-xs text-text-muted">
                                    {Math.round(analysis.confidence * 100)}% confidence
                                </span>
                            )}
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            {analysis.tactic_explanation}
                        </p>
                    </div>
                )}

                {/* Reflection question */}
                <div className="p-4 rounded-xl bg-sage-light/20 border border-sage/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={16} className="text-sage-dark" />
                        <h4 className="font-semibold text-sage-dark text-sm">
                            A moment to reflect
                        </h4>
                    </div>
                    <p className="text-text-secondary text-sm italic leading-relaxed">
                        "{analysis.reflection_question}"
                    </p>
                </div>

                {/* What you wrote (collapsed preview) */}
                <details className="mt-4 group">
                    <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary transition-colors">
                        What you shared...
                    </summary>
                    <div className="mt-2 p-3 rounded-lg bg-warm-100/50 text-sm text-text-secondary leading-relaxed">
                        {content.length > 300 ? content.substring(0, 300) + '...' : content}
                    </div>
                </details>
            </div>
        </div>
    );
}
