import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/all";
import ResourceList from "../components/Resources/ResourceList";
import heartDuckImg from "../assets/animations/heart-duck.png";
import heart1Img from "../assets/animations/heart1.png";
import heart2Img from "../assets/animations/heart2.png";
import heart3Img from "../assets/animations/heart3.png";

gsap.registerPlugin(Draggable);

const HEARTS = [
  { id: 1, src: heart1Img, x: "12%", y: "10%" },
  { id: 2, src: heart3Img, x: "5%", y: "25%" },
  { id: 3, src: heart2Img, x: "88%", y: "20%" },
];

export default function ResourcesPage() {
  const duckRef = useRef(null);
  const titleRef = useRef(null);
  const heartRefs = useRef([]);
  const pageRef = useRef(null);

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
            { y: 0, duration: 0.75, ease: "sine.inOut" },
          ],
          repeat: -1,
          force3D: true,
          stagger: { each: 0.2, from: "start" },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      heartRefs.current.forEach((heart, i) => {
        if (!heart) return;

        const floatAnim = gsap.to(heart, {
          y: "+=14",
          x: "+=6",
          rotation: gsap.utils.random(-10, 10),
          duration: gsap.utils.random(2.2, 3.2),
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.3,
        });

        Draggable.create(heart, {
          type: "x,y",
          edgeResistance: 0.65,
          onDragStart() {
            floatAnim.kill();
            gsap.to(heart, { scale: 1.15, duration: 0.15 });
          },
          onRelease() {
            gsap.to(heart, { scale: 1, duration: 0.2 });
            gsap.to(heart, {
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&family=Special+Elite&display=swap');

        .rp-page {
          max-width: 640px;
          margin: 0 auto;
          padding: 48px 20px 80px;
          position: relative;
          z-index: 10;
        }

        .rp-title {
          font-family: 'KiwiSoda', sans-serif;
          font-size: 50px;
          font-weight: 600;
          color: #6b5454;
          letter-spacing: 4px;
          margin-bottom: 10px;
        }

        .rp-subtitle {
          font-family: 'Special Elite', serif;
          font-size: 16px;
          color: #a0788a;
          line-height: 1.7;
          margin-bottom: 36px;
        }

        .rp-heart {
          position: absolute;
          width: 80px;
          height: 80px;
          cursor: grab;
          z-index: 5;
          user-select: none;
        }

        @media (max-width: 768px) {
          .rp-heart {
            width: 28px !important;
            height: 28px !important;
            opacity: 0.7;
            position: fixed !important;
          }
          .rp-heart:nth-child(1) {
            left: 10px !important;
            top: auto !important;
            bottom: 20px !important;
          }
          .rp-heart:nth-child(2) {
            left: auto !important;
            right: 10px !important;
            top: auto !important;
            bottom: 60px !important;
          }
          .rp-heart:nth-child(3) {
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
        }
      `}</style>

      <div ref={pageRef} style={{ position: "relative" }}>
        {HEARTS.map((heart, i) => (
          <div
            key={heart.id}
            ref={(el) => (heartRefs.current[i] = el)}
            className="rp-heart"
            style={{ left: heart.x, top: heart.y }}
          >
            <img
              src={heart.src}
              alt="heart"
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

        <div className="rp-page">
          <h1 ref={titleRef} className="rp-title">
            {titleChars}
          </h1>
          <p className="rp-subtitle">You're not alone</p>
          <ResourceList />
        </div>

        <img
          ref={duckRef}
          src={heartDuckImg}
          alt="heart duck"
          className="dd-duck"
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
      </div>
    </>
  );
}
