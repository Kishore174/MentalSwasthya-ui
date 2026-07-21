import React, { useEffect, useState } from "react";
import { FiBookOpen, FiPlus, FiTrash2, FiClock, FiHeart, FiWind } from "react-icons/fi";
import toast from "react-hot-toast";

/* ─── Font injection ─────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('[href*="Cormorant"]')) document.head.appendChild(fontLink);

const IntentionsScreen = () => {
  const [intentionText, setIntentionText] = useState("");
  const [intentions, setIntentions] = useState([]);

  // Load intentions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mentalSwasthya:intentions");
    if (saved) {
      try {
        setIntentions(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing intentions", e);
      }
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!intentionText.trim()) {
      toast.error("Please enter your intention before saving.");
      return;
    }

    const newIntention = {
      id: Date.now(),
      text: intentionText.trim(),
      date: new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updated = [newIntention, ...intentions];
    setIntentions(updated);
    localStorage.setItem("mentalSwasthya:intentions", JSON.stringify(updated));
    setIntentionText("");
    toast.success("Today's intention saved to your kit!");
  };

  const handleDelete = (id) => {
    const updated = intentions.filter((item) => item.id !== id);
    setIntentions(updated);
    localStorage.setItem("mentalSwasthya:intentions", JSON.stringify(updated));
    toast.success("Intention removed.");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#22331b" }} className="space-y-6">
      
      {/* ─── Header Quote Panel ─── */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        background: "linear-gradient(135deg, #162314 0%, #1e3019 100%)",
        color: "#e8f0e3",
        padding: "36px 40px",
        boxShadow: "0 10px 30px rgba(22,35,20,0.15)",
      }}>
        {/* Subtle grid pattern overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: "radial-gradient(#a8c896 1px, transparent 0)",
          backgroundSize: "24px 24px",
          pointerEvents: "none"
        }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#a8c896", marginBottom: 16
          }}>
            Daily Intention Journal
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 4vw, 2.8rem)",
            fontWeight: 600,
            lineHeight: 1.15,
            marginBottom: 20,
          }}>
            Intention setting naturally leads to a <em style={{ fontStyle: "italic", color: "#a8c896" }}>mindful way of living</em>.
          </h1>
          <p style={{
            fontSize: 14.5,
            color: "rgba(232,240,227,0.72)",
            lineHeight: 1.65,
            fontWeight: 300,
          }}>
            Think of setting intentions as goal setting, but not for the things you want to achieve…rather for the kind of person you want to be. Each day, you will write down the behaviors and mindsets that will help you be the person you aspire to show up as.
          </p>
        </div>
      </section>

      {/* ─── Logging Form & Suggestions ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }} className="hero-grid-stack">
        
        {/* Form Column */}
        <section style={{
          background: "#ffffff",
          border: "1px solid #dde8d5",
          borderRadius: 24,
          padding: 32,
          boxShadow: "0 4px 18px rgba(22,35,20,0.02)",
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.7rem",
            fontWeight: 600,
            marginBottom: 16,
          }}>
            Set Today's Intention
          </h2>
          <p style={{ fontSize: 13, color: "#66785c", marginBottom: 24, lineHeight: 1.6 }}>
            Carve out a minute to journal on how you intend to show up today… behaviors, mindset, virtues, etc. Let the words flow like a river carving its path through the mountains!
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <textarea
              value={intentionText}
              onChange={(e) => setIntentionText(e.target.value)}
              placeholder="Today, I intend to show up with patience, focus on one task at a time, and listen actively to my team..."
              style={{
                width: "100%",
                minHeight: 140,
                borderRadius: 16,
                padding: "16px 20px",
                border: "1.5px solid #e1eadb",
                fontSize: 14,
                fontFamily: "inherit",
                color: "inherit",
                background: "#fbfdfa",
                outline: "none",
                transition: "all 0.25s",
                resize: "vertical"
              }}
              onFocus={(e) => {
                e.target.style.border = "1.5px solid #7d9667";
                e.target.style.background = "#ffffff";
                e.target.style.boxShadow = "0 0 0 3px rgba(125,150,103,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1.5px solid #e1eadb";
                e.target.style.background = "#fbfdfa";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                borderRadius: 14,
                background: "#7d9667",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(125,150,103,0.22)",
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#6f865c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#7d9667"; }}
            >
              <FiPlus size={16} />
              Save Intention
            </button>
          </form>
        </section>

        {/* Suggestions Column */}
        <section style={{
          background: "#fbfdfa",
          border: "1px solid #dde8d5",
          borderRadius: 24,
          padding: 28,
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.35rem",
            fontWeight: 600,
            marginBottom: 16,
            color: "#1a2416",
          }}>
            Inspiration Prompts
          </h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 14, padding: 0, margin: 0, listStyle: "none" }}>
            {[
              { title: "Presence", text: "To be fully grounded in my conversations today.", icon: <FiClock /> },
              { title: "Calm", text: "To take three slow breaths when stress begins to rise.", icon: <FiWind /> },
              { title: "Kindness", text: "To offer gentle encouragement to myself and others.", icon: <FiHeart /> }
            ].map((item, idx) => (
              <li 
                key={idx} 
                onClick={() => setIntentionText(item.text)}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "#ffffff",
                  border: "1px solid #eef6ea",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid #7d9667";
                  e.currentTarget.style.transform = "translateX(2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid #eef6ea";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7d9667", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {item.icon}
                  {item.title}
                </div>
                <p style={{ fontSize: 12.5, color: "#6b7f63", lineHeight: 1.4 }}>{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

      </div>

      {/* ─── Intention History ─── */}
      <section style={{
        background: "#ffffff",
        border: "1px solid #dde8d5",
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 4px 18px rgba(22,35,20,0.02)",
      }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.7rem",
          fontWeight: 600,
          marginBottom: 24,
        }}>
          Intention History
        </h2>

        {intentions.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0",
            color: "#8a9a80",
            textAlign: "center"
          }}>
            <FiBookOpen size={48} style={{ opacity: 0.4, marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>No intentions logged yet.</p>
            <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Your logged intentions will be saved here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {intentions.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  borderRadius: 16,
                  background: "#fbfdfa",
                  border: "1px solid #eef6ea",
                  gap: 16,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid #c8d8be"; }}
                onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid #eef6ea"; }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "#22331b" }}>{item.text}</p>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "#8a9a80",
                    marginTop: 8,
                  }}>
                    <FiClock size={11} />
                    {item.date}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(220,60,60,0.5)",
                    cursor: "pointer",
                    padding: 8,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(220,60,60,0.08)";
                    e.currentTarget.style.color = "rgba(220,60,60,1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "rgba(220,60,60,0.5)";
                  }}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default IntentionsScreen;
