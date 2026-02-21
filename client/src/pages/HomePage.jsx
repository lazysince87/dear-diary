import { useState } from "react";
import JournalEntry from "../components/Journal/JournalEntry";
import JournalResponse from "../components/Journal/JournalResponse";
import { useApp } from "../context/AppContext";

export default function HomePage() {
  const { entries, addEntry } = useApp();
  const [latestEntry, setLatestEntry] = useState(null);

  const handleAnalysisComplete = (entry) => {
    setLatestEntry(entry);
    addEntry(entry);
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

      <div className="dd-page">
        <h1 className="dd-title">Dear Diary</h1>

        {!latestEntry && entries.length === 0 && (
          <>
            <p className="dd-subtitle" style={{ marginBottom: 0 }}>
              Your safe space to reflect, process, and understand your
              relationships
            </p>
            <p className="dd-subtitle">
              Everything you share here stays between us
            </p>
          </>
        )}

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
    </>
  );
}
