import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import JournalEntry from "../components/Journal/JournalEntry";
import JournalResponse from "../components/Journal/JournalResponse";
import { useApp } from "../context/AppContext";
import duckImg from "../assets/duck.png";

export default function HomePage() {
  const { entries, addEntry } = useApp();
  const [latestEntry, setLatestEntry] = useState(null);
  const duckRef = useRef(null);

  useEffect(() => {
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
  }, []);

  const handleAnalysisComplete = (entry) => {
    setLatestEntry(entry);
    addEntry(entry);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');

        .dd-page {
          max-width: 1250px;
          margin: 0 auto;
          padding: 48px 20px 80px;
        }

        .dd-date {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 11px;
          color: #7a5060;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .dd-title {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 32px;
          font-weight: 600;
          color: #f2c4ce;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .dd-subtitle {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 13px;
          color: #7a5060;
          line-height: 1.8;
          margin-bottom: 0;
        }

        .dd-header-block {
          border-left: 3px solid #c9748a;
          padding-left: 16px;
          margin-bottom: 36px;
        }

        .dd-divider {
          border: none;
          border-top: 1px solid #4a2535;
          margin: 36px 0;
        }

        .dd-section-label {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #7a5060;
          margin-bottom: 14px;
        }

        .dd-entry-card {
          padding: 14px 16px;
          margin-bottom: 10px;
          cursor: pointer;
          border: 1px solid #4a2535;
          transition: border-color 0.15s, background 0.15s;
        }

        .dd-entry-card:hover {
          border-color: #c9748a;
          background: rgba(242, 196, 206, 0.04);
        }

        .dd-entry-date {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 10px;
          color: #7a5060;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .dd-entry-preview {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 13px;
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

        .dd-entry-card {
          position: relative;
        }
        .dd-entry-card::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          width: 6px;
          height: 6px;
          border-top: 2px solid #c9748a;
          border-left: 2px solid #c9748a;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .dd-entry-card:hover::before {
          opacity: 1;
        }
      `}</style>

      <div className="dd-page">
        {/* Header */}
        <div className="dd-header-block">
          {/* <div className="dd-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })} 
          </div> */}
          <h1
            className="dd-title"
            style={{
              color: "white",
              fontFamily: "'KiwiSoda', sans-serif",
              fontSize: "50px",
            }}
          >
            Dear Diary
          </h1>
          {!latestEntry && entries.length === 0 && (
            <p className="dd-subtitle">
              Your safe space to reflect and understand your relationships.
              Everything here stays between us.
            </p>
          )}
        </div>

        <JournalEntry onAnalysisComplete={handleAnalysisComplete} />

        {latestEntry && (
          <div style={{ marginTop: "24px" }}>
            <JournalResponse entry={latestEntry} />
          </div>
        )}
        {entries.length > 1 && (
          <>
            <hr className="dd-divider" />
            <div className="dd-section-label">Earlier entries</div>
            {entries.slice(1, 4).map((entry, i) => (
              <div key={i} className="dd-entry-card">
                <div className="dd-entry-date">
                  {new Date(entry.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <p className="dd-entry-preview">{entry.content}</p>
                {entry.analysis?.tactic_identified && (
                  <span className="dd-tag">{entry.analysis.tactic_name}</span>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <img
        ref={duckRef}
        src={duckImg}
        alt="duck"
        style={{
          position: "fixed",
          right: "50px",
          bottom: "50px",
          top: "auto",
          width: "250px",
          zIndex: 50,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
