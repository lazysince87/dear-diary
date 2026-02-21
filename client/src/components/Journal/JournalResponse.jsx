import { useState } from "react";
import { Volume2, AlertTriangle, Sparkles, Music } from "lucide-react";
import { textToSpeech, generateMusic, getSpotifyStatus } from "../../services/api";

export default function JournalResponse({ entry }) {
  const { analysis, content, timestamp } = entry;
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicAudio, setMusicAudio] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);

  // Build a full narration script from all analysis sections
  const buildVoiceScript = () => {
    let script = analysis.empathy_response || "";

    if (analysis.tactic_identified && analysis.tactic_name) {
      script += ` I noticed a pattern that's worth talking about: ${analysis.tactic_name}.`;
      if (analysis.tactic_explanation) {
        script += ` ${analysis.tactic_explanation}`;
      }
    }

    if (analysis.actionable_advice) {
      script += ` Here's something you can try: ${analysis.actionable_advice}`;
    }

    if (analysis.reflection_question) {
      script += ` And here's something to sit with: ${analysis.reflection_question}`;
    }

    return script;
  };

  const handlePlayVoice = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setAudioError(false);

    try {
      const voiceScript = buildVoiceScript();
      const result = await textToSpeech(voiceScript);

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
        audio.play().catch(() => {
          setIsPlaying(false);
          setAudioError(true);
        });
      } else {
        // Neither fallback nor audio URL — speech not supported or unknown error
        setIsPlaying(false);
        setAudioError(true);
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
            <div className="jr-reflection" style={{ borderLeft: '3px solid #e8d5c4', background: '#fdf6f0', marginBottom: '20px' }}>
              <div className="jr-reflection-label">What you shared</div>
              <p className="jr-reflection-text" style={{ fontStyle: 'normal' }}>
                {content}
              </p>
            </div>

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
                  <AlertTriangle size={14} style={{ color: '#c9748a', flexShrink: 0, marginTop: '2px' }} />
                  <span className="jr-tactic-name">Detected Pattern: {analysis.tactic_name}</span>
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

            {/* Patterns Detected with Severity */}
            {analysis.patterns_detected && analysis.patterns_detected.length > 0 && (
              <div style={{
                border: '1px solid #e8d5c4',
                borderLeft: '3px solid #c9748a',
                padding: '12px 14px',
                marginBottom: '16px',
                background: '#fff9f9',
                borderRadius: '2px',
              }}>
                <div style={{
                  fontFamily: "'Pixelify Sans', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#a67b7b',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <AlertTriangle size={12} />
                  Patterns Detected
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysis.patterns_detected.map((pattern, i) => (
                    <div key={i} style={{
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.7)',
                      border: '1px solid #f0e0d8',
                      borderRadius: '4px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontFamily: "'Pixelify Sans', sans-serif",
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#3d2c2c',
                          letterSpacing: '1px',
                        }}>
                          {pattern.name}
                        </span>
                        <span style={{
                          fontFamily: "'Pixelify Sans', sans-serif",
                          fontSize: '9px',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontWeight: '600',
                          ...(pattern.severity === 'high' ? {
                            background: '#ffe0e0',
                            color: '#c9365a',
                            border: '1px solid #ffb3b3',
                          } : pattern.severity === 'medium' ? {
                            background: '#fff3e0',
                            color: '#b8956a',
                            border: '1px solid #f0dcc0',
                          } : {
                            background: '#e8f5e8',
                            color: '#5a7a52',
                            border: '1px solid #c0dcc0',
                          }),
                        }}>
                          {pattern.severity}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: "'Pixelify Sans', sans-serif",
                        fontSize: '12px',
                        color: '#6b5454',
                        lineHeight: '1.7',
                        margin: 0,
                      }}>
                        {pattern.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="jr-reflection">
              <div className="jr-reflection-label">Something to sit with</div>
              <p className="jr-reflection-text">
                {analysis.reflection_question}
              </p>
            </div>

            {/* Music Suggestion — triggered by AI distress detection */}
            {analysis.suggests_music && (
              <div style={{
                padding: '16px',
                border: '1px solid #e8d5c4',
                borderRadius: '2px',
                background: '#fdf6f0',
                marginTop: '12px',
              }}>
                <p style={{
                  fontFamily: "'Pixelify Sans', sans-serif",
                  fontSize: '12px',
                  color: '#6b5454',
                  marginBottom: '10px',
                  lineHeight: '1.6',
                }}>
                  Would you like to listen to some of your favorite songs to feel better?
                </p>

                {currentTrack && isMusicPlaying && (
                  <p style={{
                    fontFamily: "'Pixelify Sans', sans-serif",
                    fontSize: '10px',
                    color: '#9a8282',
                    marginBottom: '8px',
                    letterSpacing: '0.5px',
                  }}>
                    Now playing: {currentTrack.name} - {currentTrack.artist}
                  </p>
                )}

                <button
                  onClick={async () => {
                    if (isMusicPlaying && musicAudio) {
                      musicAudio.pause();
                      setIsMusicPlaying(false);
                      setCurrentTrack(null);
                      return;
                    }
                    setIsMusicPlaying(true);

                    try {
                      // Try Spotify tracks first
                      const spotifyData = await getSpotifyStatus();

                      if (spotifyData.musicTaste?.topTracks?.length > 0) {
                        const tracks = spotifyData.musicTaste.topTracks.filter(t => t.previewUrl);

                        if (tracks.length > 0) {
                          // Shuffle and play tracks as a playlist
                          const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                          let trackIndex = 0;

                          const playTrack = (index) => {
                            if (index >= shuffled.length) index = 0; // loop
                            const track = shuffled[index];
                            setCurrentTrack(track);
                            const audio = new Audio(track.previewUrl);
                            audio.onended = () => playTrack(index + 1);
                            audio.onerror = () => {
                              // skip broken previews
                              if (index + 1 < shuffled.length) playTrack(index + 1);
                              else { setIsMusicPlaying(false); setCurrentTrack(null); }
                            };
                            audio.play().catch(() => setIsMusicPlaying(false));
                            setMusicAudio(audio);
                          };

                          playTrack(0);
                          return;
                        }
                      }

                      // Fallback: ElevenLabs generated music
                      const result = await generateMusic();
                      if (result.audioUrl) {
                        const audio = new Audio(result.audioUrl);
                        audio.loop = true;
                        audio.onerror = () => setIsMusicPlaying(false);
                        audio.play().catch(() => setIsMusicPlaying(false));
                        setMusicAudio(audio);
                      } else {
                        setIsMusicPlaying(false);
                      }
                    } catch {
                      setIsMusicPlaying(false);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: '1px solid #c9a0a0',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontFamily: "'Pixelify Sans', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#6b5454',
                    padding: '8px 14px',
                    transition: 'all 0.15s',
                  }}
                >
                  <Music size={14} />
                  {isMusicPlaying ? 'Stop' : 'Play Music'}
                </button>
              </div>
            )}
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
