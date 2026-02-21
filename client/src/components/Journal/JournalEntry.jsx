import { useState, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  analyzeJournalEntry,
  createSpeechRecognition,
} from "../../services/api";

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
  const { isLoading, setIsLoading } = useApp();
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeJournalEntry(content.trim(), selectedMood);
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

  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    setError(null);
    const recognition = createSpeechRecognition({
      onResult: (transcript) => setContent(transcript),
      onInterim: (transcript) => setContent(transcript),
      onError: (errorMsg) => {
        setError(errorMsg);
        setIsListening(false);
      },
      onEnd: () => setIsListening(false),
    });
    if (!recognition.supported) {
      setError(
        "Voice input is not supported in this browser. Please try Chrome or Edge.",
      );
      return;
    }
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');

                .je-book {
                    background: #fffaf7;
                    border: 1px solid #e8d5c4;
                    border-radius: 16px;
                    box-shadow: 3px 3px 0 #e0c4c4, 6px 6px 0 rgba(201,160,160,0.2);
                    overflow: hidden;
                    width: 100%;
                    margin: 0 auto;
                }

                .je-inner {
                    display: flex;
                }

                .je-spine {
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

                .je-spine-dot {
                    width: 6px;
                    height: 6px;
                    background: #fffaf7;
                    border: 1px solid #c9a0a0;
                    border-radius: 1px;
                }

                .je-content {
                    flex: 1;
                    padding: 30px 20px 16px;
                }

                .je-date {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 14px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #9a8282;
                    margin-bottom: 14px;
                }

                .je-mood-label {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 14px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #9a8282;
                    margin-bottom: 8px;
                }

                .je-moods {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-bottom: 16px;
                }

                .je-mood-chip {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 1px;
                    padding: 4px 12px;
                    border: 1px solid #e8d5c4;
                    background: transparent;
                    color: #9a8282;
                    cursor: pointer;
                    border-radius: 2px;
                    transition: all 0.1s;
                }

                .je-mood-chip:hover {
                    border-color: #c9a0a0;
                    color: #6b5454;
                }

                .je-mood-chip.active {
                    border-color: #c9a0a0;
                    background: #f5ebe0;
                    color: #3d2c2c;
                }

                .je-textarea {
                    width: 100%;
                    min-height: 140px;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 17px;
                    color: #3d2c2c;
                    line-height: 32px;
                    resize: none;
                    caret-color: #c9a0a0;
                    background-image: repeating-linear-gradient(
                        transparent,
                        transparent 31px,
                        #f0ddd5 31px,
                        #f0ddd5 32px
                    );
                    background-attachment: local;
                    padding: 0 0 4px 0;
                    margin-bottom: 16px;
                }

                .je-textarea::placeholder {
                    color: #c9b4b4;
                    font-style: italic;
                }

                .je-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 12px;
                    border-top: 1px dashed #e8d5c4;
                }

                .je-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .je-char-count {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    color: #c9b4b4;
                    letter-spacing: 1px;
                }

                .je-submit {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    padding: 8px 22px;
                    border: 1px solid #c9a0a0;
                    background: transparent;
                    color: #6b5454;
                    cursor: pointer;
                    border-radius: 2px;
                    transition: all 0.15s;
                }

                .je-submit:hover:not(:disabled) {
                    background: #f5ebe0;
                    border-color: #a67b7b;
                    color: #3d2c2c;
                }

                .je-submit:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }

                .je-mic {
                    background: transparent;
                    border: 1px solid #e8d5c4;
                    border-radius: 2px;
                    padding: 6px 8px;
                    cursor: pointer;
                    color: #9a8282;
                    display: flex;
                    align-items: center;
                    transition: all 0.1s;
                }

                .je-mic:hover {
                    border-color: #c9a0a0;
                    color: #6b5454;
                }

                .je-mic.listening {
                    border-color: #c9365a;
                    color: #c9365a;
                }

                .je-error {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    color: #c9365a;
                    margin-top: 10px;
                    letter-spacing: 1px;
                }

                .je-listening-indicator {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    color: #c9365a;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
            `}</style>

      <form onSubmit={handleSubmit}>
        <div className="je-book">
          <div className="je-inner">
            <div className="je-spine">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="je-spine-dot" />
              ))}
            </div>

            <div className="je-content">
              <div className="je-date">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              <div className="je-mood-label">How are you feeling?</div>
              <div className="je-moods">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    className={`je-mood-chip ${selectedMood === mood.value ? "active" : ""}`}
                    onClick={() =>
                      setSelectedMood(
                        selectedMood === mood.value ? null : mood.value,
                      )
                    }
                  >
                    {mood.label}
                  </button>
                ))}
              </div>

              {isListening && (
                <div className="je-listening-indicator">
                  Listening... tap mic to stop
                </div>
              )}

              <textarea
                className="je-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about what happened..."
                disabled={isLoading}
                rows={5}
              />

              {error && <div className="je-error">{error}</div>}

              <div className="je-footer">
                <div className="je-left">
                  <button
                    type="button"
                    className={`je-mic ${isListening ? "listening" : ""}`}
                    onClick={toggleVoiceInput}
                    disabled={isLoading}
                    title={
                      isListening ? "Stop listening" : "Speak your thoughts"
                    }
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="je-submit"
                  disabled={!content.trim() || isLoading}
                >
                  {isLoading ? "Reading..." : "Reflect"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
