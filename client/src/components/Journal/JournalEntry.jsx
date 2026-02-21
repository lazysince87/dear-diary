import { useState } from "react";
import { Send, Mic, Loader2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { analyzeJournalEntry } from "../../services/api";

const MOODS = [
  { value: "grateful", label: "Grateful" },
  { value: "hopeful", label: "Hopeful" },
  { value: "confused", label: "Confused" },
  { value: "sad", label: "Sad" },
  { value: "anxious", label: "Anxious" },
  { value: "angry", label: "Angry" },
  { value: "numb", label: "Numb" },
];

export default function JournalEntry({ onAnalysisComplete }) {
  const { sessionId, isLoading, setIsLoading } = useApp();
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeJournalEntry(
        content.trim(),
        sessionId,
        selectedMood,
      );
      onAnalysisComplete({
        content: content.trim(),
        mood: selectedMood,
        analysis: result.analysis,
        timestamp: new Date().toISOString(),
      });
      setContent("");
      setSelectedMood(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&family=Special+Elite&display=swap');

                .dd-page {
                    max-width: 640px;
                    margin: 0 auto;
                    padding: 48px 20px 80px;
                }

                .dd-date {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 12px;
                    color: #7a5060;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                }

                .dd-title {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 28px;
                    font-weight: 600;
                    color: #f2c4ce;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }

                .dd-subtitle {
                    font-family: 'Special Elite', serif;
                    font-size: 14px;
                    color: #a0788a;
                    line-height: 1.7;
                    margin-bottom: 32px;
                }

                .dd-divider {
                    border: none;
                    border-top: 1px solid #4a2535;
                    margin: 36px 0;
                }

                .dd-section-label {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #7a5060;
                    margin-bottom: 16px;
                }

                .dd-entry-card {
                    border-left: 3px solid #4a2535;
                    padding: 12px 16px;
                    margin-bottom: 12px;
                    cursor: pointer;
                    transition: border-color 0.15s;
                }

                .dd-entry-card:hover {
                    border-color: #c9748a;
                }

                .dd-entry-date {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    color: #7a5060;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                }

                .dd-entry-preview {
                    font-family: 'Special Elite', serif;
                    font-size: 14px;
                    color: #a0788a;
                    line-height: 1.6;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .dd-tag {
                    display: inline-block;
                    margin-top: 8px;
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    padding: 2px 8px;
                    border: 1px solid #c9748a;
                    color: #c9748a;
                }
            `}</style>
      <div className="animate-fade-in">
        <div className="glass-card p-6 md:p-8">
          <div className="mb-4">
            <div className="dd-date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <h2
              className="text-2xl md:text-3xl font-semibold text-text-primary mt-1"
              style={{ fontFamily: "var(--font-serif)" }}
            ></h2>
          </div>

          {/* Mood selector */}
          <div className="mb-4">
            <p className="text-sm text-text-secondary mb-2">
              How are you feeling?
            </p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() =>
                    setSelectedMood(
                      selectedMood === mood.value ? null : mood.value,
                    )
                  }
                  className={`mood-badge ${selectedMood === mood.value ? "active" : ""}`}
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
              placeholder="Write about your day, paste a conversation, or share what's on your mind"
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
                  onClick={() => {
                    /* TODO: Voice input */
                  }}
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
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
