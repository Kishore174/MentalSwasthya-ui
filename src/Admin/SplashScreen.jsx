import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import loginicon from "../Assets/logo.jpg";
import { useAuth } from "../context/AuthContext";
import { hasSeenAbout } from "../utils/onboarding";

/* ─── Font injection ─────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=DM+Sans:wght@300;400;500&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('[href*="Cormorant"]')) document.head.appendChild(fontLink);

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState(0); // 0=mount, 1=show, 2=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => {
      navigate(hasSeenAbout(user) ? "/" : "/about", { replace: true });
    }, 2100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [navigate, user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060e05",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Aurora blobs ── */}
      <div style={{
        position: "absolute", width: 700, height: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, rgba(100,140,80,0.22) 0%, transparent 65%)",
        top: -200, right: -220,
        animation: "auroraDrift1 6s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle at 60% 60%, rgba(60,110,45,0.18) 0%, transparent 65%)",
        bottom: -150, left: -160,
        animation: "auroraDrift2 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      {/* Grid lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
        <defs>
          <pattern id="sgrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#a8c896" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sgrid)" />
      </svg>

      {/* ── Center card ── */}
      <div style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: phase === 0 ? 0 : phase === 1 ? 1 : 0,
        transform: phase === 0 ? "scale(0.88) translateY(24px)" : phase === 1 ? "scale(1) translateY(0)" : "scale(1.04) translateY(-12px)",
        transition: "opacity 0.65s cubic-bezier(0.34,1.56,0.64,1), transform 0.65s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* Orbiting ring */}
        <div style={{ position: "relative", marginBottom: 36 }}>
          <svg width="180" height="180" style={{ position: "absolute", top: -18, left: -18, animation: "orbitSpin 3s linear infinite" }}>
            <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(125,150,103,0.25)" strokeWidth="1" strokeDasharray="12 8" />
          </svg>
          <svg width="148" height="148" style={{ position: "absolute", top: -2, left: -2, animation: "orbitSpin 5s linear infinite reverse" }}>
            <circle cx="74" cy="74" r="68" fill="none" stroke="rgba(168,200,150,0.12)" strokeWidth="0.8" strokeDasharray="4 14" />
          </svg>

          {/* Glow halo */}
          <div style={{
            position: "absolute", inset: -20,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(125,150,103,0.35) 0%, transparent 68%)",
            animation: "haloBreath 2.2s ease-in-out infinite",
          }} />

          {/* Logo container */}
          <div style={{
            width: 144, height: 144,
            borderRadius: 34,
            background: "linear-gradient(145deg, #1a2e18 0%, #0f1a0d 100%)",
            border: "1.5px solid rgba(125,150,103,0.28)",
            boxShadow: "0 30px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(125,150,103,0.10), inset 0 1px 0 rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            <img
              src={loginicon}
              alt="MentalSwasthya"
              style={{
                width: 104, height: 104,
                borderRadius: 24,
                objectFit: "cover",
                boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
              }}
            />
            {/* Corner accent */}
            <div style={{
              position: "absolute", top: 10, right: 10,
              width: 8, height: 8, borderRadius: "50%",
              background: "#7d9667",
              boxShadow: "0 0 12px rgba(125,150,103,0.8)",
              animation: "dotPulse 1.8s ease-in-out infinite",
            }} />
          </div>
        </div>

        {/* Brand label */}
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.28em",
          textTransform: "uppercase", color: "rgba(168,200,150,0.5)",
          marginBottom: 10,
          opacity: phase === 1 ? 1 : 0,
          transform: phase === 1 ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s 0.3s, transform 0.5s 0.3s",
        }}>
          MentalSwasthya
        </p>

        {/* Main headline */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(2.4rem, 5vw, 3.2rem)",
          fontWeight: 600,
          color: "#e8f0e3",
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          textAlign: "center",
          marginBottom: 10,
          opacity: phase === 1 ? 1 : 0,
          transform: phase === 1 ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s 0.4s, transform 0.5s 0.4s",
        }}>
          Welcome <em style={{ fontStyle: "italic", color: "#a8c896" }}>Back</em>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 13, color: "rgba(168,200,150,0.45)",
          fontWeight: 300, letterSpacing: "0.04em",
          marginBottom: 44,
          opacity: phase === 1 ? 1 : 0,
          transform: phase === 1 ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s 0.5s, transform 0.5s 0.5s",
        }}>
          Preparing your wellness space
        </p>

        {/* Animated worm loader */}
        <div style={{
          width: 200, height: 3, borderRadius: 99,
          background: "rgba(125,150,103,0.15)",
          overflow: "hidden",
          opacity: phase === 1 ? 1 : 0,
          transition: "opacity 0.4s 0.6s",
        }}>
          <div style={{
            height: "100%",
            width: "38%",
            borderRadius: 99,
            background: "linear-gradient(90deg, rgba(125,150,103,0.3), #a8c896, rgba(125,150,103,0.3))",
            animation: "wormSlide 1.1s ease-in-out infinite",
          }} />
        </div>

        {/* Dots */}
        <div style={{ display: "flex", gap: 6, marginTop: 20, opacity: phase === 1 ? 0.5 : 0, transition: "opacity 0.4s 0.7s" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: "50%",
              background: "#7d9667",
              animation: `dotBlink 1.2s ${i * 0.2}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes auroraDrift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(1.06); }
        }
        @keyframes auroraDrift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px, -25px) scale(1.08); }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes haloBreath {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes dotPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes wormSlide {
          0% { transform: translateX(-140%); }
          100% { transform: translateX(370%); }
        }
        @keyframes dotBlink {
          0%,80%,100% { opacity: 0.3; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;