import React, { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiPlus,
  FiClock,
  FiHeart,
  FiRefreshCw,
  FiEdit3,
  FiSun,
  FiSmile,
  FiStar as FiSparkles,
  FiCheck,
  FiCheckCircle,
  FiXCircle,
  FiCalendar
} from "react-icons/fi";
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

const PROMPT_KITS = [
  {
    title: "My Core Values",
    desc: "Ground your intentions around your guiding principles and character.",
    template: "My core value for today: ",
    icon: FiHeart,
    color: "#e16b5a",
    bgColor: "#fdf4f3",
    borderColor: "#f7d5d0",
  },
  {
    title: "Random Acts of Kindness",
    desc: "Small thoughtful gestures to uplift someone else's day.",
    template: "A random act of kindness I will perform today: ",
    icon: FiSmile,
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  {
    title: "Mindfulness & Breath Work",
    desc: "Simple descriptions of nature, breath, and intentional presence.",
    template: "Mindfulness Focus: Today I will take 3 deep breaths whenever I transition between tasks.",
    icon: FiClock,
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  {
    title: "Self-Compassion & Healing",
    desc: "Gentle reminders to treat yourself with warmth during challenges.",
    template: "Self-Compassion Commitment: I choose to speak to myself with kindness today, especially when...",
    icon: FiSun,
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  {
    title: "Gratitude & Grounding",
    desc: "Anchoring yourself in simple moments of daily appreciation.",
    template: "3 things I am deeply grateful for right now: ",
    icon: FiSparkles,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
  },
];

const IntentionsScreen = () => {
  const { user } = useAuth();
  const [intentionText, setIntentionText] = useState("");
  const [intentions, setIntentions] = useState([]);
  const [promptIndex, setPromptIndex] = useState(0);

  // Yesterday's reflection state
  const [writingTab, setWritingTab] = useState("reflection"); // 'reflection' | 'journal'
  const [reflectionOutcome, setReflectionOutcome] = useState("fully_realized"); // 'fully_realized' | 'progress_made' | 'pivot_shifted' | 'not_met'
  const [reflectionText, setReflectionText] = useState("");

  // Today's formatted date string
  const todayDateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  const yesterdayDateString = new Date(Date.now() - 86400000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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

  const yesterdayIntentionText = intentions.length > 0
    ? intentions[0].text
    : "I will be kind to me, others as well";

  const handleGeneratePrompt = () => {
    const nextIdx = (promptIndex + 1) % FEATURED_PROMPTS.length;
    setPromptIndex(nextIdx);
    toast.success("New featured prompt generated!");
  };

  const handleApplyPromptToJournal = (text) => {
    setWritingTab("journal");
    if (intentionText.trim()) {
      setIntentionText((prev) => `${prev}\n${text}`);
    } else {
      setIntentionText(text);
    }
    toast.success("Prompt added to your writing space!");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const handleReflectionSubmit = (e) => {
    e.preventDefault();
    toast.success("Yesterday's intention reflection saved successfully!");
    setReflectionText("");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#22331b" }} className="space-y-8 pb-10">
      
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

      {/* ─── TOP SECTION: 2-Column Main Writer ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 24,
        alignItems: "stretch"
      }}>
        
        {/* ─── LEFT COLUMN: Welcome & Morning Quote ─── */}
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

        {/* ─── RIGHT COLUMN: WRITING SPACE (JOURNAL & INTENTION WRITING) ─── */}
        <div style={{
          position: "relative",
          background: "#ffffff",
          border: "2px solid #d4c8b2",
          borderRadius: 24,
          padding: "24px 24px 28px",
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
            paddingBottom: 12,
            borderBottom: "1px dashed #dcd3be",
            marginBottom: 14
          }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8a9a80" }}>
                WRITING SPACE
              </p>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.3rem",
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

          {/* Mode Switcher Tabs */}
          <div style={{ display: "flex", gap: 8, paddingLeft: 12, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => setWritingTab("reflection")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 12,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                border: "1px solid",
                borderColor: writingTab === "reflection" ? "#7d9667" : "#e5decb",
                background: writingTab === "reflection" ? "#eef6ea" : "#ffffff",
                color: writingTab === "reflection" ? "#2a401e" : "#74856a",
                transition: "all 0.2s"
              }}
            >
              Yesterday's Reflection
            </button>
            <button
              type="button"
              onClick={() => setWritingTab("journal")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 12,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                border: "1px solid",
                borderColor: writingTab === "journal" ? "#7d9667" : "#e5decb",
                background: writingTab === "journal" ? "#eef6ea" : "#ffffff",
                color: writingTab === "journal" ? "#2a401e" : "#74856a",
                transition: "all 0.2s"
              }}
            >
              Today's Intention Writer
            </button>
          </div>

          {/* TAB 1: YESTERDAY'S INTENTION REFLECTION (Exact design from uploaded concept) */}
          {writingTab === "reflection" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 12, gap: 14 }}>
              
              {/* Question Header */}
              <h4 style={{
                textAlign: "center",
                fontWeight: 700,
                fontSize: 15,
                color: "#1e3019"
              }}>
                How did yesterday's intention go?
              </h4>

              {/* Yesterday's Intention Inner Card */}
              <div style={{
                background: "#faf6f0",
                border: "1px solid #ebd9be",
                borderRadius: 18,
                padding: "14px 16px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                position: "relative"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#66785c"
                }}>
                  <span style={{ margin: "0 auto", paddingLeft: 16 }}>Yesterday's Intention</span>
                  <span style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: "1px solid #d2e2c8",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#547343"
                  }}>✓</span>
                </div>

                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.35rem",
                  color: "#2a3824",
                  fontWeight: 600,
                  margin: "8px 0"
                }}>
                  "{yesterdayIntentionText}"
                </p>

                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "#ffffff",
                  border: "1px solid #e2d7c5",
                  padding: "3px 10px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#66785c"
                }}>
                  <span>🕒</span> {yesterdayDateString}
                </div>
              </div>

              {/* Form Input & 4 Outcome Selectors */}
              <form onSubmit={handleReflectionSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                <div style={{
                  background: "#ffffff",
                  border: "1px solid #d6d0c4",
                  borderRadius: 16,
                  padding: "12px 14px",
                  boxShadow: "inset 0 1px 4px rgba(0,0,0,0.02)"
                }}>
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Add your reflections on all outcomes..."
                    style={{
                      width: "100%",
                      minHeight: 85,
                      border: "none",
                      outline: "none",
                      fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#293822",
                      resize: "none",
                      background: "transparent"
                    }}
                  />
                </div>

                {/* 4 Outcome Selectors Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  
                  {/* 1. Fully Realized */}
                  <button
                    type="button"
                    onClick={() => setReflectionOutcome("fully_realized")}
                    style={{
                      padding: "10px",
                      borderRadius: 14,
                      border: "1px solid",
                      borderColor: reflectionOutcome === "fully_realized" ? "#10b981" : "#e5e7eb",
                      background: reflectionOutcome === "fully_realized" ? "#ecfdf5" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#d1fae5",
                      border: "1px solid #a7f3d0",
                      color: "#065f46",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      ✓
                    </span>
                    <span style={{
                      background: "#d1fae5",
                      color: "#065f46",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 6
                    }}>
                      Fully Realized
                    </span>
                  </button>

                  {/* 2. Progress Made */}
                  <button
                    type="button"
                    onClick={() => setReflectionOutcome("progress_made")}
                    style={{
                      padding: "10px",
                      borderRadius: 14,
                      border: "1px solid",
                      borderColor: reflectionOutcome === "progress_made" ? "#f59e0b" : "#e5e7eb",
                      background: reflectionOutcome === "progress_made" ? "#fffbeb" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#fef3c7",
                      border: "1px solid #fde68a",
                      color: "#92400e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      📝
                    </span>
                    <span style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 6
                    }}>
                      Progress Made
                    </span>
                  </button>

                  {/* 3. Pivot / Shifted */}
                  <button
                    type="button"
                    onClick={() => setReflectionOutcome("pivot_shifted")}
                    style={{
                      padding: "10px",
                      borderRadius: 14,
                      border: "1px solid",
                      borderColor: reflectionOutcome === "pivot_shifted" ? "#f97316" : "#e5e7eb",
                      background: reflectionOutcome === "pivot_shifted" ? "#fff7ed" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#ffedd5",
                      border: "1px solid #fed7aa",
                      color: "#9a3412",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      🔄
                    </span>
                    <span style={{
                      background: "#ffedd5",
                      color: "#9a3412",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 6
                    }}>
                      Pivot/Shifted
                    </span>
                  </button>

                  {/* 4. Not Met */}
                  <button
                    type="button"
                    onClick={() => setReflectionOutcome("not_met")}
                    style={{
                      padding: "10px",
                      borderRadius: 14,
                      border: "1px solid",
                      borderColor: reflectionOutcome === "not_met" ? "#f43f5e" : "#e5e7eb",
                      background: reflectionOutcome === "not_met" ? "#fff1f2" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#ffe4e6",
                      border: "1px solid #fecdd3",
                      color: "#9f1239",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      ✳️
                    </span>
                    <span style={{
                      background: "#ffe4e6",
                      color: "#9f1239",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 6
                    }}>
                      Not Met
                    </span>
                  </button>

                </div>

                {/* Submit Pill Button */}
                <div style={{ textAlign: "center", marginTop: 4 }}>
                  <button
                    type="submit"
                    style={{
                      background: "#1c1917",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 99,
                      padding: "8px 32px",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      transition: "all 0.2s"
                    }}
                  >
                    Submit
                  </button>
                </div>
              </form>

            </div>
          ) : (
            /* TAB 2: TODAY'S JOURNAL & INTENTION WRITER (Lined Notebook Paper) */
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
                    minHeight: 200,
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
          )}

        </div>

      </div>

      {/* ─── BOTTOM SECTION: INSPIRATION KIT (DAILY PROMPTS & INSPIRATION) ─── */}
      <section style={{
        background: "linear-gradient(145deg, #faf9f4 0%, #f4f0e6 100%)",
        border: "1px solid #e2d8c3",
        borderRadius: 28,
        padding: "32px 28px",
        boxShadow: "0 12px 35px rgba(80,70,50,0.06)",
        marginTop: 36
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: "1px dashed #dcd1ba"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#547343",
              background: "#ffffff",
              border: "1px solid #d4e2cb",
              padding: "4px 12px",
              borderRadius: 99
            }}>
              <FiSparkles size={12} className="text-[#547343]" /> INSPIRATION KIT
            </span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 38,
              color: "#c2b093",
              fontWeight: 700,
              lineHeight: 1
            }}>
              ”
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            fontWeight: 700,
            color: "#22331b",
            marginTop: 6
          }}>
            DAILY PROMPTS & INSPIRATION
          </h2>
          <p style={{ fontSize: 13, color: "#66785c" }}>
            Explore curated prompts and templates. Click any prompt to seamlessly insert it into your writing space above.
          </p>
        </div>

        {/* ── Spotlight Featured Prompt Card ── */}
        <div style={{
          background: "#ffffff",
          border: "1.5px solid #d8e5d2",
          borderRadius: 22,
          padding: "24px 26px",
          boxShadow: "0 8px 24px rgba(80,105,67,0.06)",
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#547343",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              background: "#eef6ea",
              padding: "3px 10px",
              borderRadius: 6
            }}>
              ✨ Today's Featured Prompt Spotlight
            </span>

            <button
              type="button"
              onClick={handleGeneratePrompt}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#f4faf2",
                border: "1px solid #cce2c4",
                color: "#476637",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 10,
                padding: "6px 14px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#e5f3e1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f4faf2"; }}
            >
              <FiRefreshCw size={13} /> Generate New Prompt
            </button>
          </div>

          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.35rem",
            color: "#1e3019",
            lineHeight: 1.5,
            fontWeight: 600,
            fontStyle: "italic"
          }}>
            "{FEATURED_PROMPTS[promptIndex]}"
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => handleApplyPromptToJournal(FEATURED_PROMPTS[promptIndex])}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#1e382b",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 12,
                padding: "9px 18px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(30,56,43,0.2)"
              }}
            >
              <FiPlus size={14} /> Add to Writing Space
            </button>
          </div>
        </div>

        {/* ── Curated Prompt Kits Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16
        }}>
          {PROMPT_KITS.map((kit, idx) => {
            const Icon = kit.icon;
            return (
              <div
                key={idx}
                onClick={() => handleApplyPromptToJournal(kit.template)}
                style={{
                  background: "#ffffff",
                  border: `1px solid ${kit.borderColor}`,
                  borderRadius: 20,
                  padding: "20px 22px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                  transition: "all 0.25s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.03)";
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: kit.bgColor,
                      border: `1px solid ${kit.borderColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: kit.color
                    }}>
                      <Icon size={18} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e3019" }}>
                      {kit.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: 12, color: "#66785c", lineHeight: 1.5 }}>
                    {kit.desc}
                  </p>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTop: "1px dashed #e8efe2",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: kit.color
                }}>
                  <span>Use Template</span>
                  <span>+</span>
                </div>
              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
};

export default IntentionsScreen;
