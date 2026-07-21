import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiArrowRight, 
  FiHeart, 
  FiSun, 
  FiWind, 
  FiBookOpen, 
  FiChevronLeft, 
  FiChevronRight,
  FiCompass,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiSmartphone,
  FiShield,
  FiAward,
  FiMusic,
  FiLayers,
  FiGift,
  FiCopy,
  FiShare2,
  FiClock
} from "react-icons/fi";
import toast from "react-hot-toast";
import loginicon from "../Assets/logo.jpg";
import meditatingWoman from "../Assets/meditating_woman.jpg";
import breathingIllustration from "../Assets/breathing_illustration.jpg";
import walkingIllustration from "../Assets/walking_illustration.jpg";

/* ─── Font injection ─────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;0,600;1,300;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('[href*="Cormorant"]')) document.head.appendChild(fontLink);

/* ─── Scroll reveal hook ─────────────────────────────────── */
const useReveal = () => {
  const [visible, setVisible] = useState(false);
  const ref = React.useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

/* ─── Reveal wrapper ─────────────────────────────────────── */
const Reveal = ({ children, delay = 0, direction = "up" }) => {
  const [ref, visible] = useReveal();
  const transforms = { up: "translateY(30px)", left: "translateX(-20px)", right: "translateX(20px)" };
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

/* ─── Main Landing Page Component ────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const handleStart = () => {
    navigate("/login");
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText("SHARE_JOY24");
    toast.success("Referral code copied! Enter this during sign up for 3 months free.");
  };

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Why Wellness", id: "why-wellness" },
    { label: "Tools", id: "tools" },
    { label: "Features", id: "features" },
    { label: "Offer", id: "offer" },
    { label: "Community", id: "community" },
  ];

  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const slides = [meditatingWoman, breathingIllustration, walkingIllustration];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const tools = [
    {
      num: "01",
      title: "Daily Intentions Setting",
      icon: <FiBookOpen size={20} />,
      color: "#b5893d",
      accent: "rgba(181,137,61,0.08)",
      border: "rgba(181,137,61,0.18)",
      text: "Setting daily intentions aligns actions with values rather than external accomplishments. Daily journaling on behavioral goals trains the mind to show up with a deliberate presence. An intuitive daily canvas to write down behaviors and mindsets."
    },
    {
      num: "02",
      title: "Regulated Breathing",
      icon: <FiWind size={20} />,
      color: "#4a7c59",
      accent: "rgba(74,124,89,0.08)",
      border: "rgba(74,124,89,0.18)",
      text: "Science-backed diaphragmatic & regulated breathing triggers the vagus nerve, signaling the nervous system to transition from fight-or-flight to recovery. A responsive breathing bubble with visual and timing cues to guide inhalation, holding, and exhalation cycles."
    },
    {
      num: "03",
      title: "Sustained Meditation",
      icon: <FiSun size={20} />,
      color: "#7d6b3a",
      accent: "rgba(125,107,58,0.07)",
      border: "rgba(125,107,58,0.18)",
      text: "Mindful focus improves neuroplasticity in areas of the brain related to emotional regulation and attention, providing clarity for decision making under workplace pressure."
    },
    {
      num: "04",
      title: "Resilient Affirmations",
      icon: <FiHeart size={20} />,
      color: "#7d4a67",
      accent: "rgba(125,74,103,0.07)",
      border: "rgba(125,74,103,0.18)",
      text: "Deliberate cognitive restructuring using positive affirmations builds self-concept, replacing toxic self-evaluation loops with supportive neural pathways."
    }
  ];

  const features = [
    {
      title: "Intuitively designed interface",
      desc: "A simple, intuitive and easy to navigate design that empowers your wellness journey without the hastle. Never miss a beat, receive timely notifications to keep your streak going and maintain your wellness consistency.",
      icon: <FiCompass size={22} />,
      badge: "User Experience"
    },
    {
      title: "Streak Reminders",
      desc: "Never miss a beat, receive timely notifications to keep your streak going and maintain your wellness consistency.",
      icon: <FiClock size={22} />,
      badge: "Consistency"
    },
    {
      title: "Certificate on milestone achievements",
      desc: "Earn certificates as you reach significant well-being milestones and complete progress goals.",
      icon: <FiAward size={22} />,
      badge: "Achievements"
    },
    {
      title: "Curated Soundscapes",
      desc: "Guided meditations, Affirmation and ambient tracks designed to filter out background corporate noise and facilitate deep concentration. Even you can upload your favorite one and listen!",
      icon: <FiMusic size={22} />,
      badge: "Sound & Focus"
    },
    {
      title: "Progress Analytics",
      desc: "A clean dashboard compiling session’s progress, total days/minutes, and active streaks to foster consistent habits.",
      icon: <FiLayers size={22} />,
      badge: "Insights"
    }
  ];

  return (
    <div style={{ background: "#f7f9f4", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      
      {/* ══════════════════════════ HERO & HEADER ══════════════════════════ */}
      <header id="home" style={{
        background: "linear-gradient(168deg, #0a1208 0%, #162314 45%, #0d1b0b 100%)",
        position: "relative",
        overflow: "hidden",
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

        {/* Diagonal accent line at the bottom */}
        <svg style={{ position: "absolute", bottom: -1, left: 0, width: "100%", height: 100, pointerEvents: "none" }} preserveAspectRatio="none" viewBox="0 0 1440 100">
          <path d="M0,100 L1440,0 L1440,100 Z" fill="#f7f9f4" />
        </svg>

        {/* Nav bar */}
        <div style={{
          position: "relative", zIndex: 10,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "32px 48px",
          background: "rgba(10, 24, 13, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1.5px solid rgba(168, 200, 150, 0.18)",
          width: "100%",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={loginicon} alt="logo" style={{
              width: 56, height: 56, borderRadius: 14,
              objectFit: "cover",
              border: "1.5px solid rgba(168,200,150,0.3)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
            }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ 
                fontSize: 18, 
                fontWeight: 800, 
                letterSpacing: "0.16em", 
                textTransform: "uppercase", 
                color: "#e8f0e3",
                fontFamily: "'DM Sans', sans-serif"
              }}>
                Mental Swasthya
              </span>
              <span style={{
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(168,200,150,0.6)"
              }}>
                Empowering Wellness
              </span>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 28 }} className="hidden md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: item.id === activeTab ? "#a8c896" : "rgba(168,200,150,0.5)",
                  borderBottom: item.id === activeTab ? "1.5px solid #a8c896" : "none",
                  paddingBottom: 4,
                  transition: "all 0.25s",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleStart}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "12px 24px", borderRadius: 99,
              background: "#a8c896", color: "#0d1b0b",
              border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 8px 24px rgba(168,200,150,0.25)",
              transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#c2dcb2";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#a8c896";
              e.currentTarget.style.transform = "none";
            }}
          >
            Get Started
            <FiArrowRight size={14} />
          </button>
        </div>

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 10,
          maxWidth: 1200, margin: "0 auto", width: "100%",
          padding: "60px 48px 140px",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 48, alignItems: "center",
        }} className="hero-grid-stack">
          
          {/* Hero Left */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.22em",
                textTransform: "uppercase", color: "rgba(168,200,150,0.5)",
                display: "inline-flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ display: "inline-block", width: 20, height: 1, background: "rgba(168,200,150,0.3)" }} />
                Mindfulness & Balance
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.8rem, 6vw, 4.8rem)",
              fontWeight: 600,
              color: "#e8f0e3",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: 24,
            }}>
              Cultivate Calm:<br />
              Personalized Tools for<br />
              <em style={{ fontStyle: "italic", color: "#a8c896" }}>Inner Wellness</em>
            </h1>

            <p style={{
              fontSize: 15,
              color: "rgba(232,240,227,0.58)",
              lineHeight: 1.7,
              maxWidth: 480,
              fontWeight: 300,
              marginBottom: 36,
            }}>
              Unlock Your Personalized Daily Wellness Kit. Select your daily practice from the tools below to support your growth.
            </p>

            <button
              onClick={handleStart}
              style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                padding: "16px 32px",
                borderRadius: 16,
                background: "#1a2416",
                color: "#e8f0e3",
                border: "1px solid rgba(168,200,150,0.2)",
                cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.04em",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 8px 28px rgba(0,0,0,0.3)",
                transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#7d9667";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1a2416";
                e.currentTarget.style.transform = "none";
              }}
            >
              Start Wellness Journey
              <FiArrowRight size={14} />
            </button>
          </div>

          {/* Hero Right: Illustration Slideshow */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              position: "relative",
              width: "100%", maxWidth: 440,
              aspectRatio: "1/1",
              borderRadius: 36,
              overflow: "hidden",
              border: "1.5px solid rgba(168,200,150,0.22)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}>
              {slides.map((slide, idx) => (
                <img 
                  key={idx}
                  src={slide} 
                  alt={`Meditation illustration ${idx + 1}`} 
                  style={{ 
                    position: "absolute",
                    inset: 0,
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    opacity: currentSlide === idx ? 1 : 0,
                    transform: currentSlide === idx ? "scale(1)" : "scale(1.05)",
                    transition: "opacity 1.2s ease-in-out, transform 1.2s ease-in-out",
                  }}
                />
              ))}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(13,27,11,0.25) 0%, transparent 60%)",
                pointerEvents: "none"
              }} />

              {/* Navigation Indicators */}
              <div style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 8,
                zIndex: 20,
              }}>
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: currentSlide === idx ? "#a8c896" : "rgba(255, 255, 255, 0.4)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

      </header>

      {/* ══════════════════════════ MARQUEE ══════════════════════════ */}
      <Marquee />

      {/* ══════════════════════════ BODY CONTENT ══════════════════════════ */}
      <main style={{ padding: "60px 48px 0", maxWidth: 1200, margin: "0 auto" }}>
        
        {/* ─── 1. Importance of Mental Wellness in Today's World ─── */}
        <Reveal>
          <section id="why-wellness" style={{
            background: "#ffffff",
            border: "1px solid #dde8d5",
            borderRadius: 32,
            padding: "48px 40px",
            marginBottom: 60,
            boxShadow: "0 4px 20px rgba(22,35,20,0.02)"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }} className="hero-grid-stack">
              <div>
                <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7d9667", marginBottom: 12 }}>
                  The Modern Challenge
                </p>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                  fontWeight: 600, color: "#1a2416",
                  lineHeight: 1.1, letterSpacing: "-0.02em",
                }}>
                  The high cost of a<br />
                  <em style={{ fontStyle: "italic", color: "#7d9667" }}>hyper-connected world</em>
                </h2>
                <p style={{ fontSize: 14.5, color: "#6b7f63", lineHeight: 1.7, marginTop: 18, fontWeight: 300 }}>
                  We live in an era of constant stimulation. Between work demands, continuous digital notifications, and urban acceleration, our nervous systems remain in a state of high alert. Chronic stress, anxiety, and sleep depletion are the modern defaults.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
                {[
                  { title: "Digital Fatigue", text: "Endless notifications and screen time keeps cortisol levels elevated, disrupting natural cognitive rest cycles.", signage: <FiSmartphone /> },
                  { title: "Sympathetic Dominance", text: "Stress forces our bodies into a chronic fight-or-flight response, taxing cardiovascular and immune systems.", signage: <FiShield /> },
                  { title: "Emotional Depletion", text: "Without conscious pauses, we operate on auto-pilot, disconnecting from our inner aspirations and virtues.", signage: <FiAward /> }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 16 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: "rgba(125,150,103,0.08)", border: "1px solid rgba(125,150,103,0.18)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#7d9667", flexShrink: 0
                    }}>
                      {item.signage}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13.5, fontWeight: 600, color: "#1a2416", marginBottom: 2 }}>{item.title}</h4>
                      <p style={{ fontSize: 12.5, color: "#7a8f72", lineHeight: 1.5 }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ─── 2. Science Backed Tools Section (with Signages) ─── */}
        <section id="tools">
          <Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7d9667" }}>
                Science-Backed Toolkit
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                fontWeight: 600, color: "#1a2416",
                lineHeight: 1.1, letterSpacing: "-0.02em",
              }}>
                Mental wellness tools supported by<br />
                <em style={{ fontStyle: "italic", color: "#7d9667" }}>empirical clinical science</em>
              </h2>
            </div>
          </Reveal>

          {/* Science Tools Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 60 }}>
            {tools.map((tool, i) => (
              <Reveal key={tool.title} delay={i * 0.08}>
                <div
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    borderRadius: 24,
                    background: "#ffffff",
                    border: `1.5px solid ${hoveredCard === i ? tool.border : "#e8eee3"}`,
                    padding: "28px 24px",
                    position: "relative", overflow: "hidden",
                    cursor: "default",
                    transform: hoveredCard === i ? "translateY(-4px)" : "none",
                    boxShadow: hoveredCard === i
                      ? "0 20px 40px rgba(22,35,20,0.1), 0 4px 12px rgba(22,35,20,0.04)"
                      : "0 2px 10px rgba(22,35,20,0.04)",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    display: "flex", flexDirection: "column",
                    minHeight: 280,
                  }}
                >
                  <div>
                    {/* Background number */}
                    <div style={{
                      position: "absolute", top: -14, right: 12,
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "6.5rem", fontWeight: 600, lineHeight: 1,
                      color: hoveredCard === i ? tool.accent.replace("0.07", "0.12").replace("0.08", "0.14") : "rgba(22,35,20,0.03)",
                      transition: "color 0.3s",
                      pointerEvents: "none", userSelect: "none",
                    }}>
                      {tool.num}
                    </div>

                    {/* Icon signage */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: tool.accent,
                      border: `1px solid ${tool.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: tool.color, marginBottom: 20,
                      transition: "transform 0.3s",
                      transform: hoveredCard === i ? "scale(1.08)" : "none",
                    }}>
                      {tool.icon}
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.55rem", fontWeight: 600,
                      color: "#1a2416", letterSpacing: "-0.01em",
                      lineHeight: 1.1, marginBottom: 12,
                    }}>
                      {tool.title}
                    </h3>

                    {/* Text */}
                    <p style={{
                      fontSize: 13, color: "#6b7f63",
                      lineHeight: 1.65, fontWeight: 400,
                    }}>
                      {tool.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── 3. Platform Features Description (with Signages) ─── */}
        <section id="features">
          <Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7d9667" }}>
                Core Features
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                fontWeight: 600, color: "#1a2416",
                lineHeight: 1.1, letterSpacing: "-0.02em",
              }}>
                Intuitively designed interfaces to<br />
                <em style={{ fontStyle: "italic", color: "#7d9667" }}>optimize your daily rituals</em>
              </h2>
            </div>
          </Reveal>

          {/* Features list */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 60 }}>
            {features.map((feat, i) => (
              <Reveal key={feat.title} delay={i * 0.06}>
                <div 
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #dde8d5",
                    borderRadius: 20,
                    padding: 24,
                    boxShadow: hoveredFeature === i ? "0 12px 24px rgba(22,35,20,0.06)" : "none",
                    transform: hoveredFeature === i ? "translateY(-2px)" : "none",
                    transition: "all 0.25s",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "rgba(125,150,103,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#7d9667", marginBottom: 18,
                  }}>
                    {feat.icon}
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: "#7d9667", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    {feat.badge}
                  </span>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1a2416", marginBottom: 10 }}>{feat.title}</h4>
                  <p style={{ fontSize: 12.5, color: "#6b7f63", lineHeight: 1.6, fontWeight: 300 }}>{feat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── 4. Referral Code & 3 Months Free Promo (Custom layout matching uploaded design) ─── */}
        <Reveal>
          <section id="offer" style={{
            background: "#ffffff",
            border: "1.5px solid #d36a3d",
            borderRadius: 32,
            padding: 0,
            overflow: "hidden",
            marginBottom: 60,
            boxShadow: "0 15px 45px rgba(211,106,61,0.08)",
            maxWidth: 820,
            margin: "0 auto 60px"
          }}>
            
            {/* Promo Banner Top (Special Offer) */}
            <div style={{
              background: "linear-gradient(135deg, #fdf6f0 0%, #fffdfc 100%)",
              padding: "40px 48px",
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 28,
              alignItems: "center",
              borderBottom: "1.5px dashed #f0ccb9"
            }} className="hero-grid-stack">
              
              {/* Gift SVG Drawing */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{
                  width: 90, height: 90, borderRadius: 24,
                  background: "linear-gradient(135deg, #d36a3d 0%, #e2875b 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 10px 24px rgba(211,106,61,0.3)"
                }}>
                  <FiGift size={44} />
                </div>
              </div>

              {/* Offer Text */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#d36a3d", textTransform: "uppercase" }}>
                  Special Offer
                </span>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                  fontWeight: 600,
                  color: "#3a2118",
                  lineHeight: 1.1,
                  margin: "4px 0 8px"
                }}>
                  Get 1 Months FREE
                </h3>
                <p style={{ fontSize: 13.5, color: "#6e5d57", lineHeight: 1.5 }}>
                  Sign up now and get your first 1 month's subscription absolutely <strong style={{ color: "#d36a3d" }}>free</strong> as an introductory offer!
                </p>
                
                <button
                  onClick={handleStart}
                  style={{
                    background: "#d36a3d",
                    color: "#ffffff",
                    border: "none",
                    padding: "14px 28px",
                    borderRadius: 14,
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(211,106,61,0.25)",
                    width: "fit-content",
                    marginTop: 14,
                    transition: "all 0.25s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#e2875b"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#d36a3d"; }}
                >
                  Sign Up Now
                </button>
              </div>

            </div>

            {/* Promo Banner Bottom (Share Referral) */}
            <div style={{
              background: "#fff9f6",
              padding: "40px 48px",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 40,
              alignItems: "center"
            }} className="hero-grid-stack">
              
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#3a2118", marginBottom: 8, letterSpacing: "0.02em" }}>
                  Share the love, get more free!
                </h4>
                <p style={{ fontSize: 12.5, color: "#6e5d57", lineHeight: 1.6 }}>
                  If your loved ones register using your referral code, you will get an additional <strong style={{ color: "#d36a3d" }}>1 more month</strong> subscription absolutely free.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#6e5d57", uppercase: "true", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                    Your Referral Code:
                  </span>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#ffffff",
                    border: "1.5px solid #ebd9cf",
                    borderRadius: 12,
                    padding: "4px 4px 4px 14px",
                    justifyContent: "space-between"
                  }}>
                    <span style={{ fontMono: "true", fontSize: 13, fontWeight: 700, color: "#3a2118", letterSpacing: "0.04em" }}>
                      SHARE_JOY24
                    </span>
                    <button
                      onClick={copyReferralCode}
                      style={{
                        background: "#fdf3ee",
                        border: "1px solid #ebd9cf",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#d36a3d",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#ebd9cf"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#fdf3ee"; }}
                    >
                      <FiCopy size={12} />
                      Copy Code
                    </button>
                  </div>
                </div>

                <button
                  onClick={copyReferralCode}
                  style={{
                    border: "1.5px solid #d36a3d",
                    background: "transparent",
                    color: "#d36a3d",
                    padding: "12px 0",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.25s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(211,106,61,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <FiShare2 size={13} />
                  Invite Friends
                </button>
              </div>

            </div>

          </section>
        </Reveal>

        {/* ─── YOUR DAILY PLAN BANNER ─── */}
        <Reveal>
          <div style={{
            background: "#e2eadc",
            border: "1px solid #c8d8be",
            borderRadius: 28,
            padding: "36px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginBottom: 60,
          }}>
            <div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.8rem", fontWeight: 600,
                color: "#1a2416", letterSpacing: "-0.01em",
              }}>
                Your Daily Plan
              </h3>
              <p style={{ fontSize: 13, color: "#6b7f63", marginTop: 2 }}>
                A preview of how we guide your mental wellness every day.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#ffffff", border: "1px solid #dde7d6",
                  display: "flex", alignItems: "center",
                  color: "#b5893d", flexShrink: 0, justifyContent: "center"
                }}>
                  <FiBookOpen size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a2416", marginBottom: 2 }}>My Daily Intention</p>
                  <span style={{ fontSize: 11, color: "#768c6e" }}>(e.g., 'To be present.')</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#ffffff", border: "1px solid #dde7d6",
                  display: "flex", alignItems: "center",
                  color: "#4a7c59", flexShrink: 0, justifyContent: "center"
                }}>
                  <FiWind size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a2416", marginBottom: 2 }}>Regulated Breathing</p>
                  <span style={{ fontSize: 11, color: "#768c6e" }}>Animation preview</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#ffffff", border: "1px solid #dde7d6",
                  display: "flex", alignItems: "center",
                  color: "#7d6b3a", flexShrink: 0, justifyContent: "center"
                }}>
                  <FiSun size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a2416", marginBottom: 2 }}>Meditation</p>
                  <span style={{ fontSize: 11, color: "#768c6e" }}>Session suggestion</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#ffffff", border: "1px solid #dde7d6",
                  display: "flex", alignItems: "center",
                  color: "#7d4a67", flexShrink: 0, justifyContent: "center"
                }}>
                  <FiHeart size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a2416", marginBottom: 2 }}>Affirmation</p>
                  <span style={{ fontSize: 11, color: "#768c6e" }}>(e.g., 'I am strong.')</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ─── FEATURED ARTICLES & COMMUNITY ─── */}
        <section id="community">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 80 }} className="bottom-grid-stack">
            
            {/* Featured Articles Card */}
            <Reveal>
              <div style={{
                background: "#ffffff",
                border: "1.5px solid #e8eee3",
                padding: 32, borderRadius: 28,
                boxShadow: "0 2px 12px rgba(22,35,20,0.04)",
                height: "100%", display: "flex", flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: "#1a2416" }}>
                      Featured Articles
                    </h3>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ width: 32, height: 32, borderRadius: "50%", background: "#ffffff", border: "1px solid #e8eee3", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FiChevronLeft size={16} /></button>
                      <button style={{ width: 32, height: 32, borderRadius: "50%", background: "#ffffff", border: "1px solid #e8eee3", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FiChevronRight size={16} /></button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 20, alignItems: "center" }} className="article-stack">
                    <div style={{
                      width: 110, height: 110, borderRadius: 16,
                      background: "linear-gradient(135deg, #4a7c59 0%, #1e3019 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(255,255,255,0.7)", flexShrink: 0
                    }}>
                      <FiCompass size={32} />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#7d9667", uppercase: "true", letterSpacing: "0.1em" }}>Blog Open Sans</span>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1a2416", marginTop: 4, cursor: "pointer" }} onClick={handleStart}>
                        Stress, Sleep, and Mindfulness, Mindfulness
                      </h4>
                      <p style={{ fontSize: 12.5, color: "#7a8f72", marginTop: 6, lineHeight: 1.5 }}>
                        Learn how quick mindfulness exercises improve nighttime relaxation and lower tension.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600, color: "#4a7c59",
                    marginTop: 20, padding: 0, alignSelf: "flex-start"
                  }}
                >
                  Read Article <FiArrowRight size={12} />
                </button>
              </div>
            </Reveal>

            {/* Community Support Card */}
            <Reveal delay={0.08}>
              <div style={{
                background: "linear-gradient(135deg, #162314 0%, #0d1b0b 100%)",
                padding: 32, borderRadius: 28,
                boxShadow: "0 10px 30px rgba(22,35,20,0.15)",
                color: "#e8f0e3", height: "100%",
                display: "flex", flexDirection: "column",
                justifyContent: "space-between",
                position: "relative", overflow: "hidden"
              }}>
                {/* Dot decoration */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none" }}>
                  <rect width="100%" height="100%" fill="url(#agrid)" />
                </svg>

                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: "#e8f0e3", marginBottom: 12 }}>
                    Community Support
                  </h3>
                  <p style={{ fontSize: 13, color: "rgba(232,240,227,0.58)", lineHeight: 1.6, fontWeight: 300 }}>
                    Jensvitwan doler sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Join our wellness community.
                  </p>
                </div>

                <button
                  onClick={handleStart}
                  style={{
                    width: "100%", padding: "14px 0",
                    borderRadius: 14,
                    background: "#a8c896", color: "#0d1b0b",
                    border: "none", cursor: "pointer",
                    fontSize: 12.5, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 4px 16px rgba(168,200,150,0.2)",
                    transition: "all 0.25s",
                    marginTop: 24,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#c2dcb2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#a8c896"; }}
                >
                  Join the Oasis Community
                </button>
              </div>
            </Reveal>

          </div>
        </section>

      </main>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer style={{ background: "#0a1208", padding: "60px 48px", borderTop: "1px solid rgba(168,200,150,0.12)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32, alignItems: "center" }} className="footer-layout">
          
          <div style={{ display: "flex", gap: 24 }} className="footer-links">
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "rgba(168,200,150,0.45)", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>Home</button>
            <button onClick={handleStart} style={{ background: "none", border: "none", color: "rgba(168,200,150,0.45)", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>Programs</button>
            <button onClick={handleStart} style={{ background: "none", border: "none", color: "rgba(168,200,150,0.45)", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>Resources</button>
            <button onClick={handleStart} style={{ background: "none", border: "none", color: "rgba(168,200,150,0.45)", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>Community</button>
            <button onClick={handleStart} style={{ background: "none", border: "none", color: "rgba(168,200,150,0.45)", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>Blog</button>
            <button onClick={handleStart} style={{ background: "none", border: "none", color: "rgba(168,200,150,0.45)", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>Contact</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }} className="footer-right">
            <div style={{ display: "flex", gap: 14 }}>
              <a href="#" style={{ color: "rgba(168,200,150,0.45)" }}><FiFacebook size={16} /></a>
              <a href="#" style={{ color: "rgba(168,200,150,0.45)" }}><FiTwitter size={16} /></a>
              <a href="#" style={{ color: "rgba(168,200,150,0.45)" }}><FiInstagram size={16} /></a>
            </div>
            <p style={{ fontSize: 11, color: "rgba(168,200,150,0.3)", letterSpacing: "0.04em" }}>
              MentalSwasthya &copy; 2025. All Rights Reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* Global CSS rules for scroll animations & responsive grids */}
      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        @keyframes blobDrift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-40px, 20px) scale(1.06); }
        }
        @keyframes blobDrift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(25px, -30px) scale(1.08); }
        }
        * { box-sizing: border-box; }
        @media (max-width: 900px) {
          .hero-grid-stack {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-grid-stack div:first-child {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-grid-stack div:first-child p {
            max-w: 100% !important;
          }
          .bottom-grid-stack {
            grid-template-columns: 1fr !important;
          }
          .footer-layout {
            flex-direction: column !important;
            align-items: center !important;
            gap: 24px !important;
          }
          .footer-links {
            flex-wrap: wrap;
            justify-content: center;
          }
          .footer-right {
            align-items: center !important;
          }
          .article-stack {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
