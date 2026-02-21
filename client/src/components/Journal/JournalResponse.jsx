import { useState } from "react";
import { Volume2, AlertTriangle, Sparkles } from "lucide-react";
import { textToSpeech } from "../../services/api";

export default function JournalResponse({ entry }) {
  const { analysis, content, timestamp } = entry;
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

  const time = new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');

                .jr-wrap {
                    background: #fffaf7;
                    border: 1px solid #e8d5c4;
                    border-radius: 2px;
                    box-shadow: 3px 3px 0 #e0c4c4, 6px 6px 0 rgba(201,160,160,0.2);
                    overflow: hidden;
                    margin-top: 24px;
                }

                .jr-inner {
                    display: flex;
                }

                .jr-spine {
                    width: 28px;
                    background: #fcf6f9;
                    border-right: 1px solid #c4a8d4;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 16px 0;
                    gap: 10px;
                }

                .jr-spine-dot {
                    width: 6px;
                    height: 6px;
                    background: #fffaf7;
                    border: 1px solid #c4a8d4;
                    border-radius: 1px;
                }

                .jr-content {
                    flex: 1;
                    padding: 20px 20px 16px;
                }

                .jr-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px dashed #e8d5c4;
                }

                .jr-label {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #9a8282;
                }

                .jr-time {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    color: #c9b4b4;
                    letter-spacing: 1px;
                }

                .jr-voice-btn {
                    background: transparent;
                    border: 1px solid #e8d5c4;
                    border-radius: 2px;
                    padding: 5px 8px;
                    cursor: pointer;
                    color: #9a8282;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                }

                .jr-voice-btn:hover:not(:disabled) {
                    border-color: #c9a0a0;
                    color: #6b5454;
                }

                .jr-voice-btn:disabled {
                    opacity: 0.4;
                }

                .jr-empathy {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 14px;
                    color: #3d2c2c;
                    line-height: 1.8;
                    margin-bottom: 20px;
                }

                .jr-tactic {
                    border: 1px solid #e8d5c4;
                    border-left: 3px solid #c9a0a0;
                    padding: 12px 14px;
                    margin-bottom: 16px;
                    background: #fff5f5;
                    border-radius: 2px;
                }

                .jr-tactic-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 6px;
                }

                .jr-tactic-name {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #a67b7b;
                }

                .jr-confidence {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    color: #c9b4b4;
                    letter-spacing: 1px;
                }

                .jr-tactic-explanation {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 13px;
                    color: #6b5454;
                    line-height: 1.7;
                }

                .jr-reflection {
                    border: 1px solid #e8d5c4;
                    border-left: 3px solid #a8b5a0;
                    padding: 12px 14px;
                    margin-bottom: 16px;
                    background: rgba(168,181,160,0.06);
                    border-radius: 2px;
                }

                .jr-reflection-label {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #7d8a74;
                    margin-bottom: 6px;
                }

                .jr-reflection-text {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 13px;
                    color: #6b5454;
                    line-height: 1.7;
                    font-style: italic;
                }

                .jr-details summary {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #c9b4b4;
                    cursor: pointer;
                    margin-bottom: 8px;
                }

                .jr-details summary:hover {
                    color: #9a8282;
                }

                .jr-what-you-wrote {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 12px;
                    color: #9a8282;
                    line-height: 1.7;
                    padding: 10px 12px;
                    border: 1px solid #e8d5c4;
                    background: #fdf6f0;
                    border-radius: 2px;
                }
            `}</style>

      <div className="jr-wrap">
        <div className="jr-inner">
          <div className="jr-spine">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="jr-spine-dot" />
            ))}
          </div>

          <div className="jr-content">
            <div className="jr-header">
              <span className="jr-label">A reflection for you</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span className="jr-time">{time}</span>
                <button
                  className="jr-voice-btn"
                  onClick={handlePlayVoice}
                  disabled={isPlaying}
                  title="Listen to response"
                >
                  <Volume2
                    size={14}
                    className={isPlaying ? "animate-pulse-soft" : ""}
                  />
                </button>
              </div>
            </div>
            <p className="jr-empathy">{analysis.empathy_response}</p>
            {analysis.tactic_identified && analysis.tactic_name && (
              <div className="jr-tactic">
                <div className="jr-tactic-header">
                  <span className="jr-tactic-name">{analysis.tactic_name}</span>
                  {analysis.confidence > 0 && (
                    <span className="jr-confidence">
                      {Math.round(analysis.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
                <p className="jr-tactic-explanation mb-4">
                  {analysis.tactic_explanation}
                </p>

                {/* Actionable Advice & Therapeutic Feedback */}
                {analysis.actionable_advice && (
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/40 animate-fade-in delay-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-indigo-500" />
                      <h4 className="font-semibold text-indigo-700 text-sm">
                        Gentle Guidance
                      </h4>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                      {analysis.actionable_advice}
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="jr-reflection">
              <div className="jr-reflection-label">Something to sit with</div>
              <p className="jr-reflection-text">
                {analysis.reflection_question}
              </p>
            </div>
            <details className="jr-details">
              <summary>What you shared</summary>
              <p className="jr-what-you-wrote">
                {content.length > 300
                  ? content.substring(0, 300) + "..."
                  : content}
              </p>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}
