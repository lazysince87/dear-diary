import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import ResourceList from "../components/Resources/ResourceList";
import heartDuckImg from "../assets/animations/heart-duck.png";

export default function ResourcesPage() {
  const duckRef = useRef(null);
  const titleRef = useRef(null);

  const titleChars = useMemo(() => {
    return "Resources".split("").map((char, i) => (
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

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&family=Special+Elite&display=swap');

                .rp-page {
                    max-width: 640px;
                    margin: 0 auto;
                    padding: 48px 20px 80px;
                }

                .rp-title {
                    font-family: 'KiwiSoda', sans-serif;
                    font-size: 50px;
                    font-weight: 600;
                    color: text-text-secondary;
                    letter-spacing: 4px;
                    margin-bottom: 10px;
                }

                .rp-subtitle {
                    font-family: 'Special Elite', serif;
                    font-size: 14px;
                    color: text-text-secondary;
                    line-height: 1.7;
                    margin-bottom: 36px;
                }
            `}</style>

      <div className="rp-page">
        <h1 ref={titleRef} className="rp-title">
          {titleChars}
        </h1>
        <p className="rp-subtitle">
          You're not alone
        </p>
        <ResourceList />
      </div>
      <img
        ref={duckRef}
        src={heartDuckImg}
        alt="heart duck"
        className="page-duck"
        style={{
          position: "fixed",
          right: "35px",
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
