import { useState, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { fetchEntries } from "../services/api";
import { Calendar, Heart, AlertCircle, Search, Image as ImageIcon, Sparkles } from "lucide-react";

export default function EntriesPage() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedEntry, setExpandedEntry] = useState(null);
    const titleRef = useRef(null);

    const titleChars = useMemo(() => {
        return "Archives".split("").map((char, i) => (
            <span key={i} className="dd-char" style={{ display: "inline-block" }}>
                {char === " " ? "\u00A0" : char}
            </span>
        ));
    }, []);


    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            if (titleRef.current) {
                const chars = titleRef.current.querySelectorAll(".dd-char");
                gsap.to(chars, {
                    keyframes: [
                        { y: 0, duration: 0 },
                        { y: -5, duration: 0.85, ease: "sine.inOut" },
                        { y: 0, duration: 0.85, ease: "sine.inOut" }
                    ],
                    repeat: -1,
                    force3D: true,
                    stagger: {
                        each: 0.2,
                        from: "start"
                    }
                });
            }
        });

        return () => ctx.revert();
    }, [loading]);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            setLoading(true);
            const data = await fetchEntries();
            if (data && data.entries) {
                setEntries(data.entries);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = useMemo(() => {
        if (!searchQuery.trim()) return entries;
        const q = searchQuery.toLowerCase();
        return entries.filter(e =>
            e.content?.toLowerCase().includes(q) ||
            e.analysis?.empathy_response?.toLowerCase().includes(q) ||
            e.analysis?.tactic_name?.toLowerCase().includes(q)
        );
    }, [entries, searchQuery]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return {
            full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleDateString('en-US', { hour: 'numeric', minute: '2-digit' }).split(',')[1] || ""
        };
    };

    const getEntryTitle = (content) => {
        return content.length > 40 ? content.substring(0, 40) + "..." : content;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="text-4xl animate-bounce">📒</div>
                <p className="font-serif text-text-muted animate-pulse uppercase tracking-widest text-xs">Opening your notebook...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-10 px-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&family=Special+Elite&display=swap');

                .nb-container {
                    background: #fffaf7;
                    border: 1px solid #e8d5c4;
                    border-radius: 16px;
                    box-shadow: 3px 3px 0 #e0c4c4, 6px 6px 0 rgba(201,160,160,0.2);
                    min-height: 80vh;
                    display: flex;
                    position: relative;
                    margin: 0 auto;
                    overflow: hidden;
                }

                .nb-spine {
                    width: 28px;
                    background: #fcf6f9;
                    border-right: 1px solid #d4b096;
                    border-radius: 16px 0 0 16px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 16px 0;
                    gap: 10px;
                }

                .nb-spine-dot {
                    width: 6px;
                    height: 6px;
                    background: #fffaf7;
                    border: 1px solid #c9a0a0;
                    border-radius: 1px;
                }

                .nb-content {
                    flex: 1;
                    padding: 40px 20px;
                    background-image: radial-gradient(#e8d5c4 0.5px, transparent 0.5px);
                    background-size: 20px 20px;
                    min-width: 0; /* Enable shrinking */
                }

                .nb-header {
                    margin-bottom: 40px;
                    border-bottom: 2px dashed #e8d5c4;
                    padding-bottom: 24px;
                }

                .nb-search-wrap {
                    position: relative;
                    margin-bottom: 30px;
                }

                .nb-search-input {
                    width: 100%;
                    padding: 12px 16px 12px 40px;
                    background: #fff;
                    border: 1px solid #e8d5c4;
                    border-radius: 2px;
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 14px;
                    color: #3d2c2c;
                    outline: none;
                    transition: all 0.2s;
                    box-shadow: 3px 3px 0 #e8d5c4;
                }

                .nb-search-input:focus {
                    border-color: #c9a0a0;
                    box-shadow: 3px 3px 0 #c9a0a0;
                }

                .nb-tab {
                    background: #fff;
                    border: 1px solid #e8d5c4;
                    margin-bottom: -1px;
                    position: relative;
                    transition: all 0.2s;
                }

                .nb-tab:hover {
                    z-index: 10;
                    transform: translateX(4px);
                    box-shadow: -4px 4px 8px rgba(0,0,0,0.05);
                }

                .nb-tab.active {
                    background: #fffefb;
                    z-index: 20;
                    transform: translateX(8px);
                    border-color: #c9a0a0;
                    box-shadow: -8px 8px 12px rgba(201,160,160,0.15);
                }

                .nb-tab-header {
                    display: flex;
                    align-items: center;
                    padding: 16px 15px;
                    cursor: pointer;
                    gap: 10px;
                }

                .nb-tab-date {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    color: #9a8282;
                    width: 85px;
                    flex-shrink: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .nb-tab-title {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 14px;
                    color: text-text-secondary;
                    flex: 1;
                    padding-left: 15px;
                    border-left: 1px solid #f0ddd5;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .nb-tab-body {
                    padding: 0 15px 24px 15px; 
                    animation: slideDown 0.3s ease-out;
                }

                @media (min-width: 640px) {
                    .nb-spine { width: 40px; }
                    .nb-content { padding: 40px; }
                    .nb-tab-header { padding: 16px 20px; }
                    .nb-tab-date { width: 100px; }
                    .nb-tab-title { padding-left: 20px; }
                    .nb-tab-body { padding: 0 20px 24px 140px; }
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .nb-paper-content {
                    background: #fdfaf7;
                    padding: 24px;
                    border: 1px solid #f0ddd5;
                    border-radius: 2px;
                    line-height: 1.8;
                    color: #6b5454;
                    font-family: 'Pixelify Sans', sans-serif;
                    position: relative;
                }

                .nb-paper-content::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 24px;
                    bottom: 0;
                    width: 1px;
                    background: #f0ddd5;
                }

                .nb-label {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #c9a0a0;
                    margin-bottom: 8px;
                    display: block;
                }
            `}</style>

            <div className="nb-container">
                <div className="nb-spine">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="nb-spine-dot" />
                    ))}
                </div>

                <div className="nb-content">
                    <header className="nb-header text-center">
                        <h1 ref={titleRef} className="text-4xl font-bold mb-2 tracking-tight" style={{ fontFamily: 'KiwiSoda', color: 'text-text-secondary', fontSize: '50px', letterSpacing: '4px' }}>
                            {titleChars}
                        </h1>
                        <p className="text-sm font-serif" style={{ fontFamily: 'Special Elite', fontSize: '16px', color: '#a0788a', lineHeight: '1.7' }}>
                            Your journey, preserved in ink and pixels
                        </p>
                    </header>

                    <div className="nb-search-wrap">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search keywords, patterns, or feelings..."
                            className="nb-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-sm mb-6 flex items-center gap-3">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {filteredEntries.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 border border-dashed border-warm-300">
                            <div className="text-4xl mb-4">🕵️</div>
                            <h3 className="text-lg font-serif text-text-secondary mb-2" style={{ fontFamily: 'Pixelify Sans' }}>
                                {searchQuery ? "Nothing found" : "No memories yet"}
                            </h3>
                            <p className="text-text-muted text-sm" style={{ fontFamily: 'Pixelify Sans' }}>
                                {searchQuery ? "Try a different keyword." : "Start writing to fill these pages."}
                            </p>
                        </div>
                    ) : (
                        <div className="nb-tabs">
                            {filteredEntries.map((entry) => {
                                const { full, time } = formatDate(entry.createdAt || entry.timestamp);
                                const isActive = expandedEntry === (entry._id || entry.id);

                                return (
                                    <div
                                        key={entry._id || entry.id}
                                        className={`nb-tab ${isActive ? 'active' : ''}`}
                                    >
                                        <div
                                            className="nb-tab-header"
                                            onClick={() => setExpandedEntry(isActive ? null : (entry._id || entry.id))}
                                        >
                                            <div className="nb-tab-date">
                                                <div>{full}</div>
                                                <div className="opacity-60 text-[9px]">{time}</div>
                                            </div>
                                            <div className="nb-tab-title">
                                                {getEntryTitle(entry.content)}
                                            </div>
                                            {(entry.imageUrl || entry.image_url) && (
                                                <ImageIcon size={14} className="ml-3 text-text-muted opacity-50" />
                                            )}
                                        </div>

                                        {isActive && (
                                            <div className="nb-tab-body">
                                                <div className="nb-paper-content">
                                                    {(entry.imageUrl || entry.image_url) && (
                                                        <div className="mb-6 border-b border-dashed border-[#f0ddd5] pb-6 flex justify-center pl-10 pr-4">
                                                            <img
                                                                src={entry.imageUrl || entry.image_url}
                                                                alt="Preserved moment"
                                                                className="max-w-full h-auto rounded shadow-sm border border-[#e8d5c4] object-contain"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="mb-8 p-2">
                                                        <span className="nb-label">Your words</span>
                                                        <p className="text-sm italic">"{entry.content}"</p>
                                                    </div>

                                                    {entry.analysis && (
                                                        <div className="space-y-6 pt-4 border-t border-dashed border-[#f0ddd5]">
                                                            <div>
                                                                <span className="nb-label p-2 flex items-center gap-1.5">
                                                                    <Heart size={10} /> Reflection
                                                                </span>
                                                                <p className="text-sm p-2">{entry.analysis.empathy_response}</p>
                                                            </div>

                                                            {entry.analysis.tactic_identified && (
                                                                <div className="bg-rose-50/30 p-4 rounded border border-rose-100/50">
                                                                    <span className="nb-label text-rose-400">Noted Pattern</span>
                                                                    <div className="text-sm font-semibold mb-1">{entry.analysis.tactic_name}</div>
                                                                    <p className="text-xs opacity-80">{entry.analysis.tactic_explanation}</p>
                                                                </div>
                                                            )}

                                                            {entry.analysis.actionable_advice && (
                                                                <div>
                                                                    <span className="nb-label p-2 flex items-center gap-1.5">
                                                                        <Sparkles size={10} /> Guidance
                                                                    </span>
                                                                    <p className="text-xs italic text-center text-text-muted">
                                                                        {entry.analysis.actionable_advice}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
