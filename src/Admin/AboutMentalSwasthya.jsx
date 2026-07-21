import React, { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiHeart, FiSun, FiWind } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import loginicon from "../Assets/logo.jpg";
import { useAuth } from "../context/AuthContext";
import { markAboutSeen } from "../utils/onboarding";

/* ─── Font injection ─────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;0,600;1,300;1,600&family=DM+Sans:wght@300;400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('[href*="Cormorant"]')) document.head.appendChild(fontLink);

/* ─── Tool data ──────────────────────────────────────────── */
const tools = [
  {
    num: "01",
    title: "Breathing",
    icon: <FiWind size={20} />,
    color: "#4a7c59",
    accent: "rgba(74,124,89,0.08)",
    border: "rgba(74,124,89,0.18)",
    text: "Mindful breathing is one of the quickest ways to reconnect the mind and body. Slow, controlled diaphragmatic breathing can calm the nervous system, support a relaxation response, and help lower physical signs of stress such as a racing heart or tense breathing.",
  },
  {
    num: "02",
    title: "Meditation",
    icon: <FiSun size={20} />,
    color: "#7d6b3a",
    accent: "rgba(125,107,58,0.07)",
    border: "rgba(125,107,58,0.18)",
    text: "Meditation trains attention toward the present moment with less judgment. With regular practice, it can reduce negative thought loops, improve self-awareness, increase patience, and build the clarity needed to respond to daily challenges with steadier focus.",
  },
  {
    num: "03",
    title: "Affirmation",
    icon: <FiHeart size={20} />,
    color: "#7d4a67",
    accent: "rgba(125,74,103,0.07)",
    border: "rgba(125,74,103,0.18)",
    text: "Positive affirmations help replace self-critical thoughts with empowering statements. This shift can strengthen self-image, make stressors feel more manageable, and support long-term emotional resilience through a healthier inner dialogue.",
  },
];

/* ─── Scroll reveal hook ─────────────────────────────────── */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

/* ─── Reveal wrapper ─────────────────────────────────────── */
const Reveal = ({ children, delay = 0, direction = "up" }) => {
  const [ref, visible] = useReveal();
  const transforms = { up: "translateY(40px)", left: "translateX(-30px)", right: "translateX(30px)" };
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.8s ${delay}s cubic-bezier(0.16,1,0.3,1), transform 0.8s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
      }}
    >
      {children}
    </div>
  );
};

/* ─── Marquee ────────────────────────────────────────────── */
const Marquee = () => {
  const items = ["Breathing", "Focus", "Clarity", "Relaxation", "Resilience", "Insight", "Presence", "Balance"];
  return (
    <div style={{
      overflow: "hidden",
      background: "#0f1a0d",
      padding: "14px 0",
      borderTop: "1px solid rgba(125,150,103,0.15)",
      borderBottom: "1px solid rgba(125,150,103,0.15)",
    }}>
      <div style={{ display: "flex", animation: "marqueeScroll 22s linear infinite", whiteSpace: "nowrap" }}>
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "rgba(168,200,150,0.45)",
            padding: "0 28px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {item}
            <span style={{ color: "rgba(125,150,103,0.3)", marginLeft: 28 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────── */
const AboutMentalSwasthya = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [heroVisible, setHeroVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const isEmbedded = false;

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = () => {
    if (window.location.pathname.includes("/app")) {
      navigate("/app/meditation");
    } else {
      markAboutSeen(user);
      navigate("/app", { replace: true });
    }
  };

  return (
    <div style={{ 
      background: "#f7f9f4", 
      fontFamily: "'DM Sans', sans-serif", 
      minHeight: "100vh",
      overflow: "hidden",
    }}>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <header style={{
        background: "linear-gradient(168deg, #0a1208 0%, #162314 45%, #0d1b0b 100%)",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Dot grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05, pointerEvents: "none" }}>
          <defs>
            <pattern id="agrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#a8c896" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#agrid)" />
        </svg>

        {/* Aurora blobs */}
        <div style={{
          position: "absolute", width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(100,140,80,0.18) 0%, transparent 65%)",
          top: -300, right: -250, pointerEvents: "none",
          animation: "blobDrift1 9s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(60,110,45,0.14) 0%, transparent 65%)",
          bottom: -100, left: -150, pointerEvents: "none",
          animation: "blobDrift2 12s ease-in-out infinite",
        }} />

        {/* Diagonal accent line */}
        <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 120, pointerEvents: "none" }} preserveAspectRatio="none" viewBox="0 0 1440 120">
          <path d="M0,120 L1440,0 L1440,120 Z" fill="#f7f9f4" />
        </svg>

        {/* Nav bar */}
        {!isEmbedded && (
          <div style={{
            position: "relative", zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "28px 48px",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(-14px)",
            transition: "opacity 0.7s 0.1s, transform 0.7s 0.1s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={loginicon} alt="logo" style={{
                width: 40, height: 40, borderRadius: 11,
                objectFit: "cover",
                border: "1px solid rgba(168,200,150,0.22)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(168,200,150,0.6)" }}>
                MentalSwasthya
              </span>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 99,
              background: "rgba(125,150,103,0.12)",
              border: "0.5px solid rgba(168,200,150,0.2)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.6)" }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(168,200,150,0.55)" }}>
                First Time Guide
              </span>
            </div>
          </div>
        )}

        {/* Hero content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "flex-start",
          padding: "0 48px 120px",
          position: "relative", zIndex: 10,
          maxWidth: 900,
        }}>

          {/* Overline */}
          <div style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(16px)",
            transition: "opacity 0.7s 0.2s, transform 0.7s 0.2s",
            marginBottom: 28,
          }}>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "rgba(168,200,150,0.45)",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ display: "inline-block", width: 28, height: 1, background: "rgba(168,200,150,0.3)" }} />
              About the Platform
            </span>
          </div>

          {/* Giant headline */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(3.4rem, 9vw, 7.5rem)",
            fontWeight: 600,
            color: "#e8f0e3",
            lineHeight: 0.93,
            letterSpacing: "-0.03em",
            marginBottom: 36,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(24px)",
            transition: "opacity 0.9s 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.9s 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}>
            A quieter<br />
            <em style={{ fontStyle: "italic", color: "#a8c896" }}>space</em> for a<br />
            faster world
          </h1>

          {/* Description */}
          <p style={{
            fontSize: "clamp(14px, 1.6vw, 17px)",
            color: "rgba(232,240,227,0.55)",
            lineHeight: 1.7,
            maxWidth: 540,
            fontWeight: 300,
            marginBottom: 44,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(16px)",
            transition: "opacity 0.7s 0.5s, transform 0.7s 0.5s",
          }}>
            A simple, clutter-free wellness companion designed to help you breathe, pause, reset, and return to yourself — whenever you need it most.
          </p>

          {/* Stat pills */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(12px)",
            transition: "opacity 0.7s 0.65s, transform 0.7s 0.65s",
          }}>
            {[
              { label: "Tools", value: "3+" },
              { label: "Daily streaks", value: "Active" },
              { label: "Insights", value: "Personal" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 99,
                background: "rgba(125,150,103,0.10)",
                border: "0.5px solid rgba(168,200,150,0.18)",
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#a8c896" }}>{value}</span>
                <span style={{ fontSize: 11, color: "rgba(168,200,150,0.45)", letterSpacing: "0.06em" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ══════════════════════════ MARQUEE ══════════════════════════ */}
      <Marquee />

      {/* ══════════════════════════ BODY ══════════════════════════ */}
      <main style={{ background: "#f7f9f4", padding: "80px 48px 0" }}>

        {/* Section header */}
        <Reveal>
          <div style={{ maxWidth: 1080, margin: "0 auto 64px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7d9667", marginBottom: 14 }}>
                The Toolkit
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
                fontWeight: 600, color: "#1a2416",
                lineHeight: 1.0, letterSpacing: "-0.025em",
              }}>
                Science-backed<br />
                <em style={{ fontStyle: "italic", color: "#7d9667" }}>wellness tools</em>
              </h2>
            </div>
            <p style={{ fontSize: 14, color: "#7a8f72", lineHeight: 1.75, maxWidth: 340, fontWeight: 300 }}>
              In the modern era, mental health has become a critical focal point. Digital dependency, urbanisation, and constant connectivity can increase stress, burnout, and emotional fatigue.
            </p>
          </div>
        </Reveal>

        {/* ── Tool cards ── */}
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {tools.map((tool, i) => (
            <Reveal key={tool.title} delay={i * 0.12}>
              <div
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  borderRadius: 24,
                  background: hoveredCard === i ? "#ffffff" : "#ffffff",
                  border: `1.5px solid ${hoveredCard === i ? tool.border : "#e8eee3"}`,
                  padding: "36px 32px",
                  position: "relative", overflow: "hidden",
                  cursor: "default",
                  transform: hoveredCard === i ? "translateY(-6px) scale(1.01)" : "none",
                  boxShadow: hoveredCard === i
                    ? "0 24px 60px rgba(22,35,20,0.12), 0 4px 16px rgba(22,35,20,0.06)"
                    : "0 2px 12px rgba(22,35,20,0.05)",
                  transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                {/* Background number */}
                <div style={{
                  position: "absolute", top: -10, right: 18,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "9rem", fontWeight: 600, lineHeight: 1,
                  color: hoveredCard === i ? tool.accent.replace("0.07", "0.12").replace("0.08", "0.14") : "rgba(22,35,20,0.04)",
                  transition: "color 0.35s",
                  pointerEvents: "none", userSelect: "none",
                }}>
                  {tool.num}
                </div>

                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: tool.accent,
                  border: `1px solid ${tool.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: tool.color, marginBottom: 28,
                  transition: "transform 0.35s",
                  transform: hoveredCard === i ? "rotate(-6deg) scale(1.1)" : "none",
                }}>
                  {tool.icon}
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.85rem", fontWeight: 600,
                  color: "#1a2416", letterSpacing: "-0.02em",
                  lineHeight: 1, marginBottom: 16,
                }}>
                  {tool.title}
                </h3>

                {/* Divider */}
                <div style={{
                  width: hoveredCard === i ? "100%" : "36px",
                  height: "1.5px",
                  background: hoveredCard === i ? tool.border : "#e0e9d9",
                  borderRadius: 99, marginBottom: 18,
                  transition: "width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s",
                }} />

                {/* Text */}
                <p style={{
                  fontSize: 13.5, color: "#6b7f63",
                  lineHeight: 1.75, fontWeight: 400,
                }}>
                  {tool.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── Context section ── */}
        <div style={{ maxWidth: 1080, margin: "72px auto 0" }}>
          <Reveal>
            <div style={{
              borderRadius: 28,
              background: "linear-gradient(135deg, #162314 0%, #1e3019 100%)",
              padding: "52px 56px",
              position: "relative", overflow: "hidden",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48,
              alignItems: "center",
            }}>
              {/* Background texture */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }}>
                <defs>
                  <pattern id="cgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="#a8c896" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cgrid)" />
              </svg>
              <div style={{
                position: "absolute", width: 400, height: 400, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(125,150,103,0.15) 0%, transparent 65%)",
                right: -100, top: -100, pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(168,200,150,0.45)", marginBottom: 16 }}>
                  Why It Matters
                </p>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 600,
                  color: "#e8f0e3", lineHeight: 1.05, letterSpacing: "-0.02em",
                }}>
                  Mental wellness for<br />
                  <em style={{ fontStyle: "italic", color: "#a8c896" }}>modern daily pressure</em>
                </h3>
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 14, color: "rgba(232,240,227,0.58)", lineHeight: 1.8, fontWeight: 300, marginBottom: 18 }}>
                  MentalSwasthya is designed as a simple, minimalist digital haven for people seeking inner peace in a fast-moving world. It brings together science-backed wellness tools that support calm, clarity, and resilience.
                </p>
                <p style={{ fontSize: 14, color: "rgba(232,240,227,0.4)", lineHeight: 1.8, fontWeight: 300 }}>
                  Navigating modern pressures requires more than endurance — it calls for a proactive approach to emotional and social well-being.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      {/* ══════════════════════════ CTA ══════════════════════════ */}
      <footer style={{ padding: "80px 48px 60px", maxWidth: 1080, margin: "0 auto" }}>
        <Reveal>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap",
            gap: 32,
            padding: "36px 44px",
            borderRadius: 24,
            background: "#ffffff",
            border: "1.5px solid #e2eadc",
            boxShadow: "0 4px 24px rgba(22,35,20,0.06)",
          }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9aab8d", marginBottom: 10 }}>
                {isEmbedded ? "Jump back into practice" : "This page appears only on first sign-in"}
              </p>
              <h4 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 600,
                color: "#1a2416", letterSpacing: "-0.02em", lineHeight: 1.1,
              }}>
                {isEmbedded ? "Ready to start your" : "Ready to begin your"}<br />
                <em style={{ fontStyle: "italic", color: "#7d9667" }}>{isEmbedded ? "daily breathing practice?" : "wellness journey?"}</em>
              </h4>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                padding: "18px 32px",
                borderRadius: 16,
                background: "#1a2416",
                color: "#e8f0e3",
                border: "none",
                cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                letterSpacing: "0.04em",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 8px 28px rgba(22,35,20,0.28)",
                transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                whiteSpace: "nowrap",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#7d9667";
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 14px 40px rgba(125,150,103,0.38)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1a2416";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 8px 28px rgba(22,35,20,0.28)";
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; }}
            >
              {isEmbedded ? "Explore Breathing Exercises" : "Continue to Dashboard"}
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
              }}>
                <FiArrowRight size={14} />
              </span>
            </button>
          </div>
        </Reveal>

        {/* Bottom micro text */}
        <Reveal delay={0.1}>
          <p style={{ textAlign: "center", fontSize: 11, color: "#b8caaf", marginTop: 28, letterSpacing: "0.06em" }}>
            MentalSwasthya · Breathing · Focus · Relaxation · Insights
          </p>
        </Reveal>
      </footer>

      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        @keyframes blobDrift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-40px, 30px) scale(1.07); }
        }
        @keyframes blobDrift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px, -35px) scale(1.09); }
        }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          header { min-height: auto !important; }
          header > div:last-of-type { padding: 0 24px 80px !important; }
          header nav { padding: 20px 24px !important; }
          main { padding: 48px 24px 0 !important; }
          footer { padding: 48px 24px 40px !important; }
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
          div[style*="padding: '52px 56px'"] { padding: 32px 24px !important; }
          div[style*="padding: '36px 44px'"] { padding: 28px 24px !important; flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
    </div>
  );
};

export default AboutMentalSwasthya;