import { useState } from 'react';
import JournalEntry from '../components/Journal/JournalEntry';
import JournalResponse from '../components/Journal/JournalResponse';
import { useApp } from '../context/AppContext';

export default function HomePage() {
    const { entries, addEntry } = useApp();
    const [latestEntry, setLatestEntry] = useState(null);

    const handleAnalysisComplete = (entry) => {
        setLatestEntry(entry);
        addEntry(entry);
    };

    return (
        <div>
            {/* Welcome message (only shown when no entries yet) */}
            {!latestEntry && entries.length === 0 && (
                <div className="text-center mb-8 animate-fade-in-slow">
                    <div className="text-5xl mb-4 animate-float">🌹</div>
                    <h2
                        className="text-3xl md:text-4xl font-bold text-text-primary mb-3"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        Welcome to Rosie
                    </h2>
                    <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
                        Your safe space to reflect, process, and understand your relationships.
                        Everything you share here stays between us.
                    </p>
                </div>
            )}

            {/* Journal entry form */}
            <JournalEntry onAnalysisComplete={handleAnalysisComplete} />

            {/* Latest analysis response */}
            {latestEntry && <JournalResponse entry={latestEntry} />}

            {/* Previous entries preview */}
            {entries.length > 1 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-text-primary mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                        Earlier entries
                    </h3>
                    <div className="space-y-3">
                        {entries.slice(1, 4).map((entry, i) => (
                            <div
                                key={i}
                                className="glass-card p-4 animate-fade-in"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-text-muted">
                                        {new Date(entry.timestamp).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    {entry.analysis?.tactic_identified && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                                            {entry.analysis.tactic_name}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary line-clamp-2">
                                    {entry.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
