import React, { useEffect, useState } from "react";
import { FiBookOpen, FiPlus, FiTrash2, FiClock, FiHeart, FiRefreshCw, FiEdit3, FiSun, FiSmile } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

/* ─── Font injection ─────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&family=Caveat:wght@500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('[href*="Cormorant"]')) document.head.appendChild(fontLink);

const FEATURED_PROMPTS = [
  "What did you find gratitude in today? Cultivating stillness and presence.",
  "How can you show gentle compassion to yourself during a challenging moment today?",
  "What is one small, mindful step you can take today towards your inner peace?",
  "Where in your body are you holding tension, and how can you breathe release into it?",
  "What healthy boundary can you set today to protect your energy and mental clarity?",
  "What is a positive belief about yourself that you want to carry into your day?"
];

const IntentionsScreen = () => {
  const { user } = useAuth();
  const [intentionText, setIntentionText] = useState("");
  const [intentions, setIntentions] = useState([]);
  const [promptIndex, setPromptIndex] = useState(0);

  // Today's formatted date string
  const todayDateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

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

  const handleGeneratePrompt = () => {
    const nextIdx = (promptIndex + 1) % FEATURED_PROMPTS.length;
    setPromptIndex(nextIdx);
    toast.success("New featured prompt generated!");
  };

  const handleApplyPromptToJournal = (text) => {
    if (intentionText.trim()) {
      setIntentionText((prev) => `${prev}\n${text}`);
    } else {
      setIntentionText(text);
    }
    toast.success("Prompt added to your journal!");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!intentionText.trim()) {
      toast.error("Please write your intention before saving.");
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
    toast.success("Today's intention saved to your journal!");
  };

  const handleDelete = (id) => {
    const updated = intentions.filter((item) => item.id !== id);
    setIntentions(updated);
    localStorage.setItem("mentalSwasthya:intentions", JSON.stringify(updated));
    toast.success("Intention removed.");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#22331b" }} className="space-y-8">
      
      {/* ─── Page Title ─── */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2.4rem",
          fontWeight: 700,
          color: "#29401f",
          letterSpacing: "0.08em",
          textTransform: "uppercase"
        }}>
          DAILY INTENTIONS
        </h1>
        <p style={{ fontSize: 13, color: "#66785c", marginTop: 4 }}>
          Align your mindset, cultivate gratitude, and anchor your purpose for today.
        </p>
      </div>

      {/* ─── 3-Column Layout ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24,
        alignItems: "stretch"
      }}>
        
        {/* ─── COLUMN 1: Welcome & Morning Quote ─── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}>
          {/* Welcome Header */}
          <div style={{ padding: "8px 4px" }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.1rem",
              fontWeight: 700,
              color: "#1e3019",
              lineHeight: 1.2
            }}>
              Welcome back,<br />
              <span style={{ color: "#547343" }}>{user?.name || "Friend"}!</span>
            </h2>
            <p style={{ fontSize: 13.5, color: "#74886b", fontWeight: 500, marginTop: 6 }}>
              Today is {todayDateString}
            </p>
          </div>

          {/* Inspirational Quote Card */}
          <div style={{
            position: "relative",
            background: "linear-gradient(145deg, #faf7f0 0%, #f3ede2 100%)",
            border: "1px solid #e5dccb",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 10px 28px rgba(100,90,70,0.06)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden"
          }}>
            {/* Big quote mark icon decoration */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 68,
              lineHeight: 0.8,
              color: "#cbbba2",
              marginBottom: 12,
              userSelect: "none"
            }}>
              “
            </div>

            <p style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "#42382a",
              fontWeight: 500,
              fontStyle: "italic",
              marginBottom: 16
            }}>
              Every morning brings a brilliant wave of new possibilities. Embrace this new morning with an open heart and a positive intention.
            </p>

            {/* Floral / Leaf Accent */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: "auto"
            }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "#7d9667",
                background: "rgba(125,150,103,0.12)",
                padding: "6px 12px",
                borderRadius: 99
              }}>
                <FiSun size={14} /> Morning Mindset
              </span>
            </div>
          </div>
        </div>

        {/* ─── COLUMN 2: Daily Prompts & Inspiration ─── */}
        <div style={{
          background: "#faf9f5",
          border: "1px solid #e6decb",
          borderRadius: 24,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 10px 28px rgba(100,90,70,0.05)"
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 12,
            borderBottom: "1px dashed #dcd3be"
          }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8a9a80" }}>
                INSPIRATION KIT
              </p>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#29401f",
                marginTop: 2
              }}>
                DAILY PROMPTS & INSPIRATION
              </h3>
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32,
              color: "#bba88a",
              fontWeight: 700,
              lineHeight: 1
            }}>
              ”
            </div>
          </div>

          {/* Featured Prompt Box */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #e3dbc8",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6f865c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Featured Prompt:
            </p>
            <p style={{ fontSize: 13.5, color: "#33422d", lineHeight: 1.55, fontWeight: 500 }}>
              {FEATURED_PROMPTS[promptIndex]}
            </p>
            <button
              onClick={handleGeneratePrompt}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 10,
                background: "none",
                border: "none",
                color: "#547343",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline"
              }}
            >
              <FiRefreshCw size={12} /> (Generate New Prompt)
            </button>
          </div>

          {/* Prompt Categories / Quick Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            
            {/* Core Value */}
            <div
              onClick={() => handleApplyPromptToJournal("My core value for today: ")}
              style={{
                background: "#ffffff",
                border: "1px solid #e3dbc8",
                borderRadius: 16,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#7d9667";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e3dbc8";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#547343", fontWeight: 600, fontSize: 13 }}>
                <FiHeart size={14} />
                My core value for today
              </div>
              <p style={{ fontSize: 11.5, color: "#7a8a72", marginTop: 3 }}>
                Click to add template into your journal writer.
              </p>
            </div>

            {/* Random Act of Kindness */}
            <div
              onClick={() => handleApplyPromptToJournal("A random act of kindness I will perform today: ")}
              style={{
                background: "#ffffff",
                border: "1px solid #e3dbc8",
                borderRadius: 16,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#7d9667";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e3dbc8";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#547343", fontWeight: 600, fontSize: 13 }}>
                <FiSmile size={14} />
                A random act of kindness I will perform
              </div>
              <p style={{ fontSize: 11.5, color: "#7a8a72", marginTop: 3 }}>
                Small thoughtful gestures that uplift someone's day.
              </p>
            </div>

            {/* Mindfulness Exercise */}
            <div
              onClick={() => handleApplyPromptToJournal("Mindfulness Focus: Today I will take 3 deep breaths whenever I transition between tasks.")}
              style={{
                background: "#ffffff",
                border: "1px solid #e3dbc8",
                borderRadius: 16,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#7d9667";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e3dbc8";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#547343", fontWeight: 600, fontSize: 13 }}>
                <FiClock size={14} />
                Mindfulness exercise
              </div>
              <p style={{ fontSize: 11.5, color: "#7a8a72", marginTop: 3 }}>
                Simple descriptions of nature, breath, and meaning.
              </p>
            </div>

          </div>
        </div>

        {/* ─── COLUMN 3: Journal & Intention Writing (Notebook Card) ─── */}
        <div style={{
          position: "relative",
          background: "#ffffff",
          border: "2px solid #d4c8b2",
          borderRadius: 24,
          padding: "24px 26px 28px",
          boxShadow: "0 12px 32px rgba(80,70,50,0.08)",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Leather spine effect on left edge */}
          <div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 12,
            background: "linear-gradient(180deg, #7a4f27 0%, #5c3919 100%)",
            borderRadius: "24px 0 0 24px",
            opacity: 0.9
          }} />

          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 12,
            paddingBottom: 14,
            borderBottom: "1px dashed #dcd3be",
            marginBottom: 16
          }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8a9a80" }}>
                WRITING SPACE
              </p>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#29401f",
                marginTop: 2
              }}>
                JOURNAL & INTENTION WRITING
              </h3>
            </div>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "#f4eee2",
              border: "1px solid #e2d6c1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7a4f27"
            }}>
              <FiEdit3 size={16} />
            </div>
          </div>

          {/* Lined Notebook Paper Container */}
          <form onSubmit={handleSave} style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 12 }}>
            <div style={{
              position: "relative",
              background: "#fffdf9",
              border: "1px solid #ebd9be",
              borderRadius: 16,
              padding: "16px 18px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.02)"
            }}>
              {/* Journal Watermark Title */}
              <div style={{
                textAlign: "center",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#a48e71",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 12,
                borderBottom: "1px solid #ebd9be",
                paddingBottom: 6
              }}>
                JOURNAL
              </div>

              {/* Lined Textarea */}
              <textarea
                value={intentionText}
                onChange={(e) => setIntentionText(e.target.value)}
                placeholder="My deep intention for today is to move through the morning calmly, to take a proper break, and to express my gratitude to the people I work with..."
                style={{
                  width: "100%",
                  flex: 1,
                  minHeight: 180,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14.5,
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: "28px",
                  color: "#293822",
                  resize: "none",
                  backgroundImage: "linear-gradient(transparent 27px, #ebd9be 28px)",
                  backgroundSize: "100% 28px"
                }}
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 16,
                padding: "13px 24px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #7d9667 0%, #688252 100%)",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(125,150,103,0.25)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
            >
              <FiPlus size={16} />
              Save to Journal
            </button>
          </form>

        </div>

      </div>

      {/* ─── SECTION 4: Saved Intention History ─── */}
      <section style={{
        background: "#ffffff",
        border: "1px solid #dde8d5",
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 4px 18px rgba(22,35,20,0.02)",
        marginTop: 32
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8a9a80" }}>
              MY REFLECTIONS
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.7rem",
              fontWeight: 700,
              color: "#1e3019",
              marginTop: 2
            }}>
              Saved Journal & Intentions
            </h2>
          </div>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#7d9667",
            background: "#eef6ea",
            padding: "4px 12px",
            borderRadius: 99
          }}>
            {intentions.length} {intentions.length === 1 ? "Entry" : "Entries"}
          </span>
        </div>

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
            <p style={{ fontSize: 14, fontWeight: 500 }}>No journal entries saved yet.</p>
            <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Your saved daily intentions will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {intentions.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "20px 22px",
                  borderRadius: 18,
                  background: "#fcfdfa",
                  border: "1px solid #e5ebd9",
                  gap: 14,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid #b8caa7";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(125,150,103,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid #e5ebd9";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "#22331b", whiteSpace: "pre-wrap" }}>
                  {item.text}
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTop: "1px dashed #e8eee2"
                }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#8a9a80"
                  }}>
                    <FiClock size={12} />
                    {item.date}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(220,60,60,0.5)",
                      cursor: "pointer",
                      padding: 6,
                      borderRadius: 6,
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
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default IntentionsScreen;
