import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/all";
import PatternCard from "../components/PatternLibrary/PatternCard";
import PatternDetail from "../components/PatternLibrary/PatternDetail";
import { fetchPatterns } from "../services/api";
import waveDuckImg from "../assets/animations/wave-duck.png";
import glassImg from "../assets/animations/glass.png";
import bulbImg from "../assets/animations/bulb.png";
import bookImg from "../assets/animations/book.png";

gsap.registerPlugin(Draggable);

const DECORATIONS = [
  { id: 1, src: bulbImg, x: "95%", y: "15%" },
  { id: 2, src: glassImg, x: "80%", y: "5%" },
  { id: 3, src: bookImg, x: "85%", y: "20%" },
];

export default function PatternLibraryPage() {
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const duckRef = useRef(null);
  const titleRef = useRef(null);
  const decoRefs = useRef([]);
  const pageRef = useRef(null);

  const titleChars = useMemo(() => {
    return "Pattern Library".split("").map((char, i) => (
      <span key={i} className="dd-char" style={{ display: "inline-block" }}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }, []);

  // Title animation after loading
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll(".dd-char");
        gsap.to(chars, {
          keyframes: [
            { y: 0, duration: 0 },
            { y: -8, duration: 0.75, ease: "sine.inOut" },
            { y: 0, duration: 0.75, ease: "sine.inOut" },
          ],
          repeat: -1,
          force3D: true,
          stagger: { each: 0.2, from: "start" },
        });
      }
    });
    return () => ctx.revert();
  }, [loading]);

  // Duck
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
        }
      );
    }
  }, []);

  // Decorations float + draggable
  useEffect(() => {
    const ctx = gsap.context(() => {
      decoRefs.current.forEach((deco, i) => {
        if (!deco) return;

        const floatAnim = gsap.to(deco, {
          y: "+=14",
          x: "+=6",
          rotation: gsap.utils.random(-10, 10),
          duration: gsap.utils.random(2.2, 3.2),
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.3,
        });

        Draggable.create(deco, {
          type: "x,y",
          edgeResistance: 0.65,
          onDragStart() {
            floatAnim.kill();
            gsap.to(deco, { scale: 1.15, duration: 0.15 });
          },
          onRelease() {
            gsap.to(deco, { scale: 1, duration: 0.2 });
            gsap.to(deco, {
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
          position: relative;
          z-index: 10;
        }

        .pl-title {
          font-family: 'KiwiSoda', sans-serif;
          font-size: 50px;
          font-weight: 600;
          color: #6b5454;
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

        .pl-deco {
          position: absolute;
          width: 80px;
          height: 80px;
          cursor: grab;
          z-index: 5;
          user-select: none;
        }

        @media (max-width: 768px) {
          .pl-title {
            font-size: 38px;
            letter-spacing: 2px;
            white-space: nowrap;
          }

          .pl-deco {
            width: 28px !important;
            height: 28px !important;
            opacity: 0.7;
            position: fixed !important;
          }
          .pl-deco:nth-child(1) {
            left: 10px !important;
            top: auto !important;
            bottom: 20px !important;
          }
          .pl-deco:nth-child(2) {
            left: auto !important;
            right: 10px !important;
            top: auto !important;
            bottom: 60px !important;
          }
          .pl-deco:nth-child(3) {
            left: 50% !important;
            top: auto !important;
            bottom: 30px !important;
          }
          .dd-duck {
            position: relative !important;
            left: auto !important;
            bottom: auto !important;
            width: 120px !important;
            display: block;
            margin: 20px auto 0;
          }
        }
      `}</style>

      <div ref={pageRef} style={{ position: "relative" }}>

        {/* Draggable decorations */}
        {DECORATIONS.map((deco, i) => (
          <div
            key={deco.id}
            ref={(el) => (decoRefs.current[i] = el)}
            className="pl-deco"
            style={{ left: deco.x, top: deco.y }}
          >
            <img
              src={deco.src}
              alt="decoration"
              style={{ width: "100%", height: "100%", pointerEvents: "none", userSelect: "none" }}
              draggable={false}
            />
          </div>
        ))}

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
          className="dd-duck"
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
      </div>
    </>
  );
}