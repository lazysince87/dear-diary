import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { savePreferences, getSpotifyLoginUrl } from "../services/api";

const PERSONAS = [
  {
    value: "friend",
    label: "A Friend",
    description: "Just someone to talk to — casual, warm, and supportive.",
    voice: "Stacy",
  },
  {
    value: "therapist",
    label: "A Therapist",
    description: "Help me process my feelings with gentle, actionable guidance.",
    voice: "Sapphire",
  },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [persona, setPersona] = useState(null);
  const [defaultCyclePhase, setDefaultCyclePhase] = useState(null);
  const [averageSleepHours, setAverageSleepHours] = useState("");
  const [averageStressLevel, setAverageStressLevel] = useState("");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [spotifyConnecting, setSpotifyConnecting] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setDisplayName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleSaveAndContinue = async () => {
    if (!displayName.trim() || !persona) return;
    setSaving(true);
    try {
      await savePreferences({ displayName: displayName.trim(), personaPreference: persona });
      setStep(2);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleHealthContinue = async () => {
    setSaving(true);
    try {
      await savePreferences({
        defaultCyclePhase: defaultCyclePhase || null,
        averageSleepHours: averageSleepHours ? Number(averageSleepHours) : null,
        averageStressLevel: averageStressLevel ? Number(averageStressLevel) : null,
      });
      setStep(3);
    } catch (err) {
      console.error("Failed to save health preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectSpotify = async () => {
    setSpotifyConnecting(true);
    try {
      const { url } = await getSpotifyLoginUrl();
      window.location.href = url;
    } catch (err) {
      console.error("Spotify login failed:", err);
      setSpotifyConnecting(false);
    }
  };

  const handleSkipSpotify = () => {
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');

        .ob-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #1a0e12;
        }

        .ob-card {
          background: #fffaf7;
          border: 1px solid #e8d5c4;
          border-radius: 2px;
          box-shadow: 3px 3px 0 #e0c4c4, 6px 6px 0 rgba(201,160,160,0.2);
          max-width: 520px;
          width: 100%;
          padding: 32px;
        }

        .ob-title {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 24px;
          font-weight: 600;
          color: #3d2c2c;
          text-align: center;
          margin-bottom: 8px;
        }

        .ob-subtitle {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 12px;
          color: #9a8282;
          text-align: center;
          margin-bottom: 24px;
          letter-spacing: 1px;
        }

        .ob-label {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #9a8282;
          margin-bottom: 8px;
        }

        .ob-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e8d5c4;
          border-radius: 2px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 14px;
          color: #3d2c2c;
          background: #fff;
          outline: none;
          margin-bottom: 20px;
          box-sizing: border-box;
        }

        .ob-input:focus {
          border-color: #c9a0a0;
        }

        .ob-persona-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .ob-persona-card {
          padding: 16px;
          border: 2px solid #e8d5c4;
          border-radius: 2px;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
          background: #fff;
        }

        .ob-persona-card:hover {
          border-color: #c9a0a0;
          background: #fdf6f0;
        }

        .ob-persona-card.selected {
          border-color: #c9748a;
          background: #fff5f5;
          box-shadow: 0 0 0 1px #c9748a;
        }

        .ob-persona-emoji {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .ob-persona-label {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #3d2c2c;
          margin-bottom: 4px;
        }

        .ob-persona-desc {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 10px;
          color: #9a8282;
          line-height: 1.5;
        }

        .ob-persona-voice {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 9px;
          color: #c9748a;
          margin-top: 6px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .ob-btn {
          width: 100%;
          padding: 12px;
          border: 1px solid #c9a0a0;
          background: transparent;
          color: #6b5454;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.15s;
        }

        .ob-btn:hover:not(:disabled) {
          background: #f5ebe0;
          border-color: #a67b7b;
          color: #3d2c2c;
        }

        .ob-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ob-btn-spotify {
          background: #1DB954;
          border-color: #1DB954;
          color: #fff;
          margin-bottom: 12px;
        }

        .ob-btn-spotify:hover:not(:disabled) {
          background: #1ed760;
          border-color: #1ed760;
          color: #fff;
        }

        .ob-btn-skip {
          border: none;
          color: #c9b4b4;
          font-size: 11px;
        }

        .ob-btn-skip:hover {
          color: #9a8282;
          background: transparent;
        }

        .ob-step-indicator {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 10px;
          color: #c9b4b4;
          text-align: center;
          margin-bottom: 16px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .ob-spotify-icon {
          display: inline-block;
          margin-right: 8px;
        }
      `}</style>

      <div className="ob-page">
        <div className="ob-card">
          <div className="ob-step-indicator">Step {step} of 3</div>

          {step === 1 && (
            <>
              <h1 className="ob-title">Welcome to Dear Diary</h1>
              <p className="ob-subtitle">let's set things up so i can be the best companion for you</p>

              <div className="ob-label">What should I call you?</div>
              <input
                className="ob-input"
                type="text"
                placeholder="Your name..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <div className="ob-label">How would you like me to be?</div>
              <div className="ob-persona-grid">
                {PERSONAS.map((p) => (
                  <div
                    key={p.value}
                    className={`ob-persona-card ${persona === p.value ? "selected" : ""}`}
                    onClick={() => setPersona(p.value)}
                  >
                    <div className="ob-persona-label">{p.label}</div>
                    <div className="ob-persona-desc">{p.description}</div>
                    <div className="ob-persona-voice">Voice: {p.voice}</div>
                  </div>
                ))}
              </div>

              <button
                className="ob-btn"
                onClick={handleSaveAndContinue}
                disabled={!displayName.trim() || !persona || saving}
              >
                {saving ? "Saving..." : "Continue"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="ob-title">Your Health Baseline</h1>
              <p className="ob-subtitle">
                optional: help me understand your body so i can give you better, more personalized support
              </p>

              <div className="ob-label">Current Cycle Phase</div>
              <div className="ob-persona-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '16px' }}>
                {[
                  { value: 'menstrual', label: 'Menstrual' },
                  { value: 'follicular', label: 'Follicular' },
                  { value: 'ovulatory', label: 'Ovulatory' },
                  { value: 'luteal', label: 'Luteal (PMS)' },
                ].map((phase) => (
                  <div
                    key={phase.value}
                    className={`ob-persona-card ${defaultCyclePhase === phase.value ? 'selected' : ''}`}
                    onClick={() => setDefaultCyclePhase(defaultCyclePhase === phase.value ? null : phase.value)}
                  >
                    <div className="ob-persona-label">{phase.label}</div>
                  </div>
                ))}
              </div>

              <div className="ob-label">Average Sleep (hours/night)</div>
              <input
                className="ob-input"
                type="number"
                min="0"
                max="24"
                placeholder="e.g. 7"
                value={averageSleepHours}
                onChange={(e) => setAverageSleepHours(e.target.value)}
              />

              <div className="ob-label">Typical Stress Level (1-10)</div>
              <input
                className="ob-input"
                type="number"
                min="1"
                max="10"
                placeholder="e.g. 5"
                value={averageStressLevel}
                onChange={(e) => setAverageStressLevel(e.target.value)}
              />

              <button
                className="ob-btn"
                onClick={handleHealthContinue}
                disabled={saving}
                style={{ marginBottom: '12px' }}
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>
              <button className="ob-btn ob-btn-skip" onClick={() => setStep(3)}>
                Skip for now
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="ob-title">Connect Your Music</h1>
              <p className="ob-subtitle">
                link your spotify so I can play your favorite songs when you need comfort
              </p>

              <button
                className="ob-btn ob-btn-spotify"
                onClick={handleConnectSpotify}
                disabled={spotifyConnecting}
              >
                <span className="ob-spotify-icon"></span>
                {spotifyConnecting ? "Connecting..." : "Connect Spotify"}
              </button>

              <button className="ob-btn ob-btn-skip" onClick={handleSkipSpotify}>
                Skip for now
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
