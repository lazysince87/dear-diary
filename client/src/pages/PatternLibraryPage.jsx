import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import PatternCard from "../components/PatternLibrary/PatternCard";
import PatternDetail from "../components/PatternLibrary/PatternDetail";
import { fetchPatterns } from "../services/api";
import waveDuckImg from "../assets/animations/wave-duck.png";

export default function PatternLibraryPage() {
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const duckRef = useRef(null);
  const titleRef = useRef(null);

  const titleChars = useMemo(() => {
    return "Pattern Library".split("").map((char, i) => (
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
  }, [loading]);

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
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    try {
      const data = await fetchPatterns();
      setPatterns(data.patterns);
    } catch (error) {
      console.error("Failed to load patterns:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&family=Special+Elite&display=swap');

        .pl-page {
          max-width: 640px;
          margin: 0 auto;
          padding: 48px 20px 80px;
        }

        .pl-title {
          font-family: 'KiwiSoda', sans-serif;
          font-size: 50px;
          font-weight: 600;
          color: text-text-secondary;
          letter-spacing: 4px;
          margin-bottom: 10px;
        }

        .pl-subtitle {
          font-family: 'Special Elite', serif;
          font-size: 16px;
          color: #a0788a;
          line-height: 1.7;
          margin-bottom: 36px;
        }

        .pl-shimmer {
          height: 72px;
          background: linear-gradient(90deg, #3a1f2a 25%, #4a2535 50%, #3a1f2a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          margin-bottom: 12px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="pl-page">
        <h1 ref={titleRef} className="pl-title">
          {titleChars}
        </h1>
        <p className="pl-subtitle">
          Understanding common manipulation tactics can help you recognize
          patterns in your own experiences
        </p>

        {loading ? (
          <div>
            <div className="pl-shimmer" />
            <div className="pl-shimmer" />
            <div className="pl-shimmer" />
          </div>
        ) : (
          <div>
            {patterns.map((pattern, i) => (
              <div key={pattern.id || i}>
                <PatternCard pattern={pattern} onClick={setSelectedPattern} />
              </div>
            ))}
          </div>
        )}

        {selectedPattern && (
          <PatternDetail
            pattern={selectedPattern}
            onClose={() => setSelectedPattern(null)}
          />
        )}
      </div>
      <img
        ref={duckRef}
        src={waveDuckImg}
        alt="wave duck"
        className="page-duck"
        style={{
          position: "fixed",
          left: "180px",
          bottom: "50px",
          top: "auto",
          width: "200px",
          zIndex: 50,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
