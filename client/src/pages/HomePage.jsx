import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/draggable";
import JournalEntry from "../components/Journal/JournalEntry";
import JournalResponse from "../components/Journal/JournalResponse";
import { useApp } from "../context/AppContext";
import duckImg from "../assets/animations/duck.png";
import starImg from "../assets/animations/star.png";

gsap.registerPlugin(Draggable);

const STAR_POSITIONS = [
  { id: 1, x: "12%", y: "20%" },
  { id: 2, x: "80%", y: "15%" },
  { id: 3, x: "88%", y: "25%" },
];

export default function HomePage() {
  const { entries, addEntry } = useApp();
  const [latestEntry, setLatestEntry] = useState(null);
  const duckRef = useRef(null);
  const starRefs = useRef([]);
  const pageRef = useRef(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      starRefs.current.forEach((star, i) => {
        if (!star) {
          return;
        }
        const floatAnim = gsap.to(star, {
          y: "+=14",
          x: "+=6",
          rotation: gsap.utils.random(-10, 10),
          duration: gsap.utils.random(2.2, 3.2),
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.3,
        });

        Draggable.create(star, {
          type: "x,y",
          edgeResistance: 0.65,
          onDragStart() {
            floatAnim.kill();
            gsap.to(star, { scale: 1.15, duration: 0.15 });
          },
          onRelease() {
            gsap.to(star, { scale: 1, duration: 0.2 });
            gsap.to(star, {
              y: "+=12",
              duration: 1.8,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });
          },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleAnalysisComplete = (entry) => {
    setLatestEntry(entry);
    addEntry(entry);
  };

  // Past entries are all entries except the latest one just submitted
  const pastEntries = latestEntry
    ? entries.filter((e) => e !== latestEntry)
    : entries;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');

        .dd-page {
          margin: 0 auto;
          padding: 30px 10px 80px;
          width: 100%;
        }

        .dd-title {
          font-family: 'KiwiSoda', sans-serif;
          font-size: 50px;
          color: white;
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
          padding-left: 0;
          margin-bottom: 14px;
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
          position: relative;
          padding: 14px 16px;
          margin-bottom: 10px;
          cursor: pointer;
          border: 1px solid #4a2535;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .dd-entry-card:hover {
          border-color: #c9748a;
          background: rgba(253, 246, 240, 0.4);
          transform: translateY(-2px) scale(1.015);
          box-shadow: 0 4px 12px rgba(74, 37, 53, 0.08);
          z-index: 10;
          background: rgba(253, 246, 240, 0.4);
          transform: translateY(-2px) scale(1.015);
          box-shadow: 0 4px 12px rgba(74, 37, 53, 0.08);
          z-index: 10;
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

        .dd-entry-card:hover::before { opacity: 1; }

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

        /* Mobile responsive: reposition stars, reposition duck */
        @media (max-width: 768px) {
          .dd-star {
            position: fixed !important;
            width: 28px !important;
            height: 28px !important;
            opacity: 0.7;
          }
          .dd-star:nth-child(1) {
            left: 10px !important;
            top: auto !important;
            bottom: 20px !important;
          }
          .dd-star:nth-child(2) {
            left: auto !important;
            right: 10px !important;
            top: auto !important;
            bottom: 60px !important;
          }
          .dd-star:nth-child(3) {
            left: 50% !important;
            top: auto !important;
            bottom: 30px !important;
          }
          .dd-duck {
            position: relative !important;
            right: auto !important;
            bottom: auto !important;
            width: 120px !important;
            display: block;
            margin: 20px auto 0;
          }
          .dd-page {
            padding: 20px 10px 20px;
          }
        }
        .dd-entry-image {
          margin-top: 10px;
          border-radius: 4px;
          border: 1px solid #4a2535;
          max-width: 150px;
          height: auto;
          display: block;
        }

        .dd-entry-mood {
          display: inline-block;
          margin-top: 8px;
          margin-right: 8px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 2px 8px;
          border: 1px solid #7a5060;
          color: #7a5060;
          opacity: 0.8;
        }
        .dd-entry-image {
          margin-top: 10px;
          border-radius: 4px;
          border: 1px solid #4a2535;
          max-width: 150px;
          height: auto;
          display: block;
        }

        .dd-entry-mood {
          display: inline-block;
          margin-top: 8px;
          margin-right: 8px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 2px 8px;
          border: 1px solid #7a5060;
          color: #7a5060;
          opacity: 0.8;
        }
        .dd-entry-image {
          margin-top: 10px;
          border-radius: 4px;
          border: 1px solid #4a2535;
          max-width: 150px;
          height: auto;
          display: block;
        }

        .dd-entry-mood {
          display: inline-block;
          margin-top: 8px;
          margin-right: 8px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 2px 8px;
          border: 1px solid #7a5060;
          color: #7a5060;
          opacity: 0.8;
        }
        .dd-entry-image {
          margin-top: 10px;
          border-radius: 4px;
          border: 1px solid #4a2535;
          max-width: 150px;
          height: auto;
          display: block;
        }

        .dd-entry-mood {
          display: inline-block;
          margin-top: 8px;
          margin-right: 8px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 2px 8px;
          border: 1px solid #7a5060;
          color: #7a5060;
          opacity: 0.8;
        }
      `}</style>
      <div
        ref={pageRef}
        style={{
          position: "relative",
          padding: "30px 20px 80px",
          width: "100%",
        }}
      >
        {STAR_POSITIONS.map((pos, i) => (
          <div
            key={pos.id}
            ref={(el) => (starRefs.current[i] = el)}
            className="dd-star"
            style={{
              position: "fixed",
              left: pos.x,
              top: pos.y,
              width: "48px",
              height: "48px",
              cursor: "grab",
              zIndex: 99,
              userSelect: "none",
            }}
          >
            <img
              src={starImg}
              alt="star"
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                userSelect: "none",
              }}
              draggable={false}
            />
          </div>
        ))}
        <div className="dd-page max-w-full">
          <div className="dd-header-block">
            <h1 className="dd-title">Dear Diary</h1>
            {!latestEntry && entries.length === 0 && (
              <p className="dd-subtitle">
                Your safe space to reflect and understand your relationships.
                Everything here stays between us.
              </p>
            )}
          </div>
        </div>

        <JournalEntry onAnalysisComplete={handleAnalysisComplete} />

        {latestEntry && (
          <div style={{ marginTop: "24px" }}>
            <JournalResponse entry={latestEntry} />
          </div>
        )}
        {pastEntries.length > 0 && (
          <>
            <hr className="dd-divider" />
            <div className="dd-section-label">Earlier entries</div>
            {pastEntries.map((entry, i) => (
              <div key={entry._id || i} style={{ marginBottom: "16px" }}>
                <div
                  className="dd-entry-card"
                  onClick={() =>
                    setExpandedIndex(expandedIndex === i ? null : i)
                  }
                >
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
                {expandedIndex === i && entry.analysis && (
                  <JournalResponse entry={entry} />
                )}
              </div>
            ))}
          </>
        )}
        <img
          ref={duckRef}
          src={duckImg}
          alt="duck"
          className="dd-duck"
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
      </div>
    </>
  );
}
