import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useApp } from "../context/AppContext";
import { useAuth } from "../contexts/AuthContext";
import {
  savePreferences,
  getSpotifyLoginUrl,
  getSpotifyStatus,
} from "../services/api";
import boxDuckImg from "../assets/animations/box-duck.png";

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
    description:
      "Help me process my feelings with gentle, actionable guidance.",
    voice: "Sapphire",
  },
];

export default function ProfilePage() {
  const { preferences, loadPreferences } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [persona, setPersona] = useState("friend");
  const [defaultCyclePhase, setDefaultCyclePhase] = useState(null);
  const [averageSleepHours, setAverageSleepHours] = useState("");
  const [averageStressLevel, setAverageStressLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyConnecting, setSpotifyConnecting] = useState(false);
  const duckRef = useRef(null);
  const titleRef = useRef(null);

  const titleChars = useMemo(() => {
    return "Profile".split("").map((char, i) => (
      <span key={i} className="dd-char" style={{ display: "inline-block" }}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (duckRef.current) {
        gsap.fromTo(
          duckRef.current,
          { y: -800, opacity: 1 },
          {
            y: 0,
            duration: 6,
            ease: "bounce.out",
            onComplete: () => {
              gsap.to(duckRef.current, {
                y: -10,
                duration: 1.8,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
              });
            },
          },
        );
      }

      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll(".dd-char");
        gsap.to(chars, {
          keyframes: [
            { y: 0, duration: 0 },
            { y: -8, duration: 0.75, ease: "sine.inOut" },
            { y: 0, duration: 0.75, ease: "sine.inOut" }
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
  }, []);

  useEffect(() => {
    if (preferences) {
      setDisplayName(preferences.displayName || "");
      setPersona(preferences.personaPreference || "friend");
      setDefaultCyclePhase(preferences.defaultCyclePhase || null);
      setAverageSleepHours(preferences.averageSleepHours != null ? String(preferences.averageSleepHours) : "");
      setAverageStressLevel(preferences.averageStressLevel != null ? String(preferences.averageStressLevel) : "");
    }
  }, [preferences]);

  useEffect(() => {
    getSpotifyStatus()
      .then((data) => setSpotifyConnected(data.connected))
      .catch(() => { });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await savePreferences({
        displayName: displayName.trim(),
        personaPreference: persona,
        defaultCyclePhase: defaultCyclePhase || null,
        averageSleepHours: averageSleepHours ? Number(averageSleepHours) : null,
        averageStressLevel: averageStressLevel ? Number(averageStressLevel) : null,
      });
      await loadPreferences();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save:", err);
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&family=Special+Elite&display=swap');

        .pf-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 48px 20px 80px;
        }

        .pf-title {
          font-family: 'KiwiSoda', sans-serif;
          font-size: 50px;
          font-weight: 600;
          color: text-text-secondary;
          letter-spacing: 4px;
          margin-bottom: 10px;
        }

        .pf-subtitle {
          font-family: 'Special Elite', serif;
          font-size: 16px;
          color: #a0788a;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .pf-section {
          margin-bottom: 28px;
        }

        .pf-label {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 14px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #9a8282;
          margin-bottom: 8px;
        }

        .pf-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e8d5c4;
          border-radius: 2px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 14px;
          color: #3d2c2c;
          background: #fff;
          outline: none;
          box-sizing: border-box;
        }

        .pf-input:focus {
          border-color: #6a9fd8;
        }

        .pf-input::placeholder {
          font-family: 'DM Sans', sans-serif;
          color: #b8a0a0;
        }

        .pf-persona-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .pf-persona-card {
          padding: 14px;
          border: 2px solid #e8d5c4;
          border-radius: 2px;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
          background: #fff;
        }

        .pf-persona-card:hover {
          border-color: #6a9fd8;
          background: #f0f5ff;
        }

        .pf-persona-card.selected {
          border-color: #6a9fd8;
          background: #f0f5ff;
          box-shadow: 0 0 0 1px #6a9fd8;
        }

        .pf-persona-label {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #3d2c2c;
          margin-bottom: 4px;
        }

        .pf-persona-desc {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 10px;
          color: #9a8282;
          line-height: 1.5;
        }

        .pf-persona-voice {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 9px;
          color: #6a9fd8;
          margin-top: 6px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .pf-btn {
          width: 100%;
          padding: 12px;
          border: 1px solid #6a9fd8;
          background: transparent;
          color: #4a6fa5;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.15s;
        }

        .pf-btn:hover:not(:disabled) {
          background: #f0f5ff;
          border-color: #4a6fa5;
          color: #3d5a80;
        }

        .pf-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pf-btn-spotify {
          background: #1DB954;
          border-color: #1DB954;
          color: #fff;
        }

        .pf-btn-spotify:hover:not(:disabled) {
          background: #1ed760;
          border-color: #1ed760;
          color: #fff;
        }

        .pf-connected {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 12px;
          color: #1DB954;
          letter-spacing: 1px;
          padding: 10px 0;
        }

        .pf-saved {
          text-align: center;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 11px;
          color: #1DB954;
          letter-spacing: 1px;
          margin-top: 8px;
        }

        .pf-divider {
          border: none;
          border-top: 1px solid #e8d5c4;
          margin: 24px 0;
        }

        .pf-email {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 11px;
          color: #c9b4b4;
        }
      `}</style>

      <div className="pf-page">
        <h1 ref={titleRef} className="pf-title">
          {titleChars}
        </h1>
        <p className="pf-subtitle">Manage your preferences and connections</p>

        <div className="pf-section">
          <div className="pf-label">Display Name</div>
          <input
            className="pf-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name..."
          />
        </div>

        <div className="pf-section">
          <div className="pf-label">AI Persona</div>
          <div className="pf-persona-grid">
            {PERSONAS.map((p) => (
              <div
                key={p.value}
                className={`pf-persona-card ${persona === p.value ? "selected" : ""}`}
                onClick={() => setPersona(p.value)}
              >
                <div className="pf-persona-label">{p.label}</div>
                <div className="pf-persona-desc">{p.description}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="pf-btn"
          onClick={handleSave}
          disabled={!displayName.trim() || saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && <div className="pf-saved">Preferences saved</div>}

        <hr className="pf-divider" />

                <div className="pf-section">
                    <div className="pf-label">Health Baseline</div>
                    <p style={{ fontFamily: "'Pixelify Sans', sans-serif", fontSize: '13px', color: '#9a8282', marginBottom: '12px' }}>
                        This helps me personalize my advice around your body's rhythms
                    </p>

          <div className="pf-label" style={{ marginTop: '8px' }}>Cycle Phase</div>
          <div className="pf-persona-grid" style={{ marginBottom: '16px' }}>
            {[
              { value: 'menstrual', label: 'Menstrual' },
              { value: 'follicular', label: 'Follicular' },
              { value: 'ovulatory', label: 'Ovulatory' },
              { value: 'luteal', label: 'Luteal (PMS)' },
            ].map((phase) => (
              <div
                key={phase.value}
                className={`pf-persona-card ${defaultCyclePhase === phase.value ? 'selected' : ''}`}
                onClick={() => setDefaultCyclePhase(defaultCyclePhase === phase.value ? null : phase.value)}
              >
                <div className="pf-persona-label">{phase.label}</div>
              </div>
            ))}
          </div>

          <div className="pf-label">Average Sleep (hours)</div>
          <input
            className="pf-input"
            type="number"
            min="0"
            max="24"
            placeholder="e.g. 7"
            value={averageSleepHours}
            onChange={(e) => setAverageSleepHours(e.target.value)}
            style={{ marginBottom: '16px' }}
          />

          <div className="pf-label">Typical Stress Level (1-10)</div>
          <input
            className="pf-input"
            type="number"
            min="1"
            max="10"
            placeholder="e.g. 5"
            value={averageStressLevel}
            onChange={(e) => setAverageStressLevel(e.target.value)}
          />
        </div>

        <hr className="pf-divider" />

        <div className="pf-section">
          <div className="pf-label">Spotify</div>
          {spotifyConnected ? (
            <div className="pf-connected">Connected</div>
          ) : (
            <button
              className="pf-btn pf-btn-spotify"
              onClick={handleConnectSpotify}
              disabled={spotifyConnecting}
            >
              {spotifyConnecting ? "Connecting..." : "Connect Spotify"}
            </button>
          )}
        </div>

        <hr className="pf-divider" />

        <div className="pf-email">Signed in as {user?.email}</div>
      </div>
      <img
        ref={duckRef}
        src={boxDuckImg}
        alt="box duck"
        className="page-duck"
        style={{
          position: "fixed",
          right: "30px",
          bottom: "50px",
          top: "auto",
          width: "230px",
          zIndex: 50,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
