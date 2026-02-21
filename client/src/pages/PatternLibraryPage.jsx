import { useState, useEffect } from 'react';
import PatternCard from '../components/PatternLibrary/PatternCard';
import PatternDetail from '../components/PatternLibrary/PatternDetail';
import { fetchPatterns } from '../services/api';

export default function PatternLibraryPage() {
    const [patterns, setPatterns] = useState([]);
    const [selectedPattern, setSelectedPattern] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatterns();
    }, []);

    const loadPatterns = async () => {
        try {
            const data = await fetchPatterns();
            setPatterns(data.patterns);
        } catch (error) {
            console.error('Failed to load patterns:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div className="mb-8">
                <h2
                    className="text-3xl md:text-4xl font-bold text-text-primary mb-3"
                    style={{ fontFamily: 'var(--font-serif)' }}
                >
                    Pattern Library
                </h2>
                <p className="text-text-secondary leading-relaxed max-w-lg">
                    Understanding common emotional manipulation tactics can help you recognize
                    patterns in your own experiences. Knowledge is power. 💕
                </p>
            </div>

            {/* Pattern grid */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-28 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {patterns.map((pattern, i) => (
                        <div
                            key={pattern.id || i}
                            className="animate-fade-in"
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            <PatternCard
                                pattern={pattern}
                                onClick={setSelectedPattern}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Detail modal */}
            {selectedPattern && (
                <PatternDetail
                    pattern={selectedPattern}
                    onClose={() => setSelectedPattern(null)}
                />
            )}
        </div>
    );
}
