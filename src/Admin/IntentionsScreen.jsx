import React, { useEffect, useState, useMemo } from "react";
import {
  FiBookOpen,
  FiClock,
  FiHeart,
  FiSun,
  FiSmile,
  FiStar as FiSparkles,
  FiCheck,
  FiCalendar,
  FiTrash2,
  FiFeather,
  FiCheckCircle,
  FiEdit3,
  FiPlus,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import yesterdayClosingImg from "../Assets/yesterday_closing.jpg";

/* ─── Font injection ─────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700;800&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('[href*="Cormorant"]')) document.head.appendChild(fontLink);

/* ─── Quick Intention Starters ───────────────────────────── */
const STARTER_CHIPS = [
  "Today, I choose...",
  "I give myself permission to...",
  "I intend to meet this day with...",
  "I will honor my peace by...",
];

/* ─── Categorized Intention Examples & Cues ──────────────── */
const INTENTION_CATEGORIES = [
  {
    id: "calm",
    name: "Emotional Well-being & Calm",
    shortName: "Calm & Peace",
    icon: FiHeart,
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    cues: [
      "Today, I choose peace over stress and calm over chaos.",
      "I intend to meet this day as it comes, with patience and grace.",
      "Today, I give myself permission to slow down and rest.",
      "I will respond, not react, to challenging situations today.",
      "I intend to release all negative thoughts and focus on what serves me.",
    ],
  },
  {
    id: "growth",
    name: "Self-Compassion & Personal Growth",
    shortName: "Self-Compassion",
    icon: FiSun,
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    cues: [
      "I will treat myself with the same kindness I show to others.",
      "Today, I allow myself to feel my emotions without judgment.",
      "I am proud of the progress I've made and excited for what's to come.",
      "I intend to honor my body and nourish it with love and care.",
      "I will celebrate my small wins today, no matter how tiny.",
    ],
  },
  {
    id: "mindfulness",
    name: "Mindfulness & Presence",
    shortName: "Mindfulness",
    icon: FiClock,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    cues: [
      "I intend to be fully present in each moment today.",
      "Today, I will focus on the tiny sparkling moments in my day.",
      "I intend to listen to my inner voice and intuition.",
      "I will stay in my heart today, not in my head.",
      "I will honor myself by noticing each transition between activities.",
    ],
  },
  {
    id: "relationships",
    name: "Relationships & Boundaries",
    shortName: "Relationships",
    icon: FiSmile,
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    cues: [
      "My intention is to spread kindness and connect deeply with others.",
      "Today, I will respect my own boundaries and say 'no' when needed.",
      "I will be a good listener and give others my full attention.",
      "I intend to surround myself with people who support and uplift me.",
    ],
  },
  {
    id: "focus",
    name: "Focus & Productivity (The Kinder Way)",
    shortName: "Focus (Kinder Way)",
    icon: FiSparkles,
    color: "#e16b5a",
    bgColor: "#fdf4f3",
    borderColor: "#f7d5d0",
    cues: [
      "Today, I will respect my energy levels and do what matters most.",
      "I intend to stay focused on my path without comparing it to others.",
      "I don't have to do everything—just the next right thing.",
    ],
  },
];

// Flatten all cues for spotlight rotation & selection
const ALL_CUES = INTENTION_CATEGORIES.flatMap((category) => category.cues);

const getCategoryForCue = (cueText) => {
  return INTENTION_CATEGORIES.find((cat) => cat.cues.includes(cueText));
};

const IntentionsScreen = () => {
  const { user } = useAuth();
  const [intentionText, setIntentionText] = useState(ALL_CUES[0]);
  const [intentions, setIntentions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(INTENTION_CATEGORIES[0].id);
  const [showHistory, setShowHistory] = useState(false);

  // Yesterday's closing checklist state
  const [closingTasks, setClosingTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("mentalSwasthya:yesterday_closing");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear out legacy mock items (e.g. walk1, walk2) so user has their own items
        const isLegacyMock =
          Array.isArray(parsed) &&
          parsed.some((t) => t.id === "walk1" || t.id === "walk2");
        if (!isLegacyMock && Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [newClosingTask, setNewClosingTask] = useState("");

  const handleAddClosingTask = (e) => {
    if (e) e.preventDefault();
    const trimmed = newClosingTask.trim();
    if (!trimmed) return;
    const newTask = {
      id: "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      label: trimmed,
      done: false,
    };
    setClosingTasks((prev) => {
      const next = [...prev, newTask];
      try {
        localStorage.setItem("mentalSwasthya:yesterday_closing", JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    setNewClosingTask("");
  };

  const handleDeleteClosingTask = (id) => {
    setClosingTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem("mentalSwasthya:yesterday_closing", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const toggleClosingTask = (id) => {
    setClosingTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      try {
        localStorage.setItem("mentalSwasthya:yesterday_closing", JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const completedCount = closingTasks.filter((t) => t.done).length;
  const progressPercent =
    closingTasks.length > 0 ? Math.round((completedCount / closingTasks.length) * 100) : 0;

  const handleSubmitClosing = () => {
    try {
      localStorage.setItem("mentalSwasthya:yesterday_closing", JSON.stringify(closingTasks));
    } catch (e) {
      // ignore
    }
    toast.success("Yesterday's closing reflection submitted! 🌿");
  };

  // Yesterday's date string matching the image ("Date: Oct 25")
  const yesterdayFormattedDate = new Date(Date.now() - 86400000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Yesterday's intention retrieved from user's history
  const yesterdayIntention = useMemo(() => {
    if (!intentions || intentions.length === 0) return null;
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const yYear = yesterday.getFullYear();
    const yMonth = yesterday.getMonth();
    const yDate = yesterday.getDate();

    // 1. Check for an intention created on yesterday's date
    const foundYesterday = intentions.find((item) => {
      const d = new Date(item.timestamp || item.date);
      return d.getFullYear() === yYear && d.getMonth() === yMonth && d.getDate() === yDate;
    });
    if (foundYesterday) return foundYesterday;

    // 2. Fallback to the latest intention created before today
    const tYear = now.getFullYear();
    const tMonth = now.getMonth();
    const tDate = now.getDate();
    const previous = intentions.find((item) => {
      const d = new Date(item.timestamp || item.date);
      const isToday = d.getFullYear() === tYear && d.getMonth() === tMonth && d.getDate() === tDate;
      return !isToday;
    });

    return previous || null;
  }, [intentions]);

  const handleAddYesterdayIntentionToTasks = () => {
    if (!yesterdayIntention) return;
    const exists = closingTasks.some((t) => t.label === yesterdayIntention.text);
    if (exists) {
      toast("Yesterday's intention is already in your checklist!", { icon: "🌿" });
      return;
    }
    const newTask = {
      id: "task_yest_" + Date.now(),
      label: yesterdayIntention.text,
      done: false,
    };
    setClosingTasks((prev) => {
      const next = [newTask, ...prev];
      try {
        localStorage.setItem("mentalSwasthya:yesterday_closing", JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    toast.success("Added yesterday's intention to checklist! 🌿");
  };

  // Today's date string
  const todayFormattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Load intentions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mentalSwasthya:intentions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIntentions(parsed);
        if (parsed.length > 0 && parsed[0].text) {
          setIntentionText(parsed[0].text);
        }
      } catch (e) {
        console.error("Error parsing intentions", e);
      }
    }
  }, []);

  // Filtered cues based on selected category
  const activeCues = useMemo(() => {
    const cat = INTENTION_CATEGORIES.find((c) => c.id === selectedCategory);
    return cat ? cat.cues : INTENTION_CATEGORIES[0].cues;
  }, [selectedCategory]);

  const selectedCategoryInfo = useMemo(() => {
    return getCategoryForCue(intentionText.trim());
  }, [intentionText]);

  const handleAppendStarter = (starter) => {
    if (intentionText.trim()) {
      setIntentionText((prev) => `${prev} ${starter}`);
    } else {
      setIntentionText(starter + " ");
    }
  };

  const handleSelectCue = (cueText) => {
    setIntentionText(cueText);
    toast.success("Loaded into text box! ✨", { duration: 1500, id: "cue-select-toast" });
  };

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!intentionText.trim()) {
      toast.error("Please enter or choose an intention before setting.");
      return;
    }

    const now = new Date();
    const newIntention = {
      id: Date.now(),
      text: intentionText.trim(),
      category: selectedCategoryInfo?.name || "Personal Intention",
      timestamp: Date.now(),
      date: now.toISOString(),
      displayDate: now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updated = [newIntention, ...intentions.filter((item) => item.text !== intentionText.trim())];
    setIntentions(updated);
    localStorage.setItem("mentalSwasthya:intentions", JSON.stringify(updated));
    toast.success("Today's intention set and anchored! 🌿", {
      icon: "✨",
      duration: 3000,
    });
  };

  const handleDeleteIntention = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const updated = intentions.filter((item) => item.id !== id);
    setIntentions(updated);
    localStorage.setItem("mentalSwasthya:intentions", JSON.stringify(updated));
    toast.success("Intention removed.");
  };

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="min-h-[calc(100vh-120px)] max-w-6xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6"
    >
      {/* ─── SCREEN HEADER: TITLE & SUBTLE METADATA ─── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e7efe4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7d9667] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#557743]">
              Daily Reflection Studio
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#1c2e17] mt-0.5 tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Morning Alignment & Intentions
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-[#f3f7f0] border border-[#dbe8d4] text-xs font-bold text-[#456134] flex items-center gap-2 shadow-2xs">
            <FiCalendar size={13} className="text-[#7d9667]" />
            <span>{todayFormattedDate}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[#faf6ef] border border-[#ece0cb] text-xs font-bold text-[#775a36] flex items-center gap-1.5 shadow-2xs">
            <FiSun size={13} className="text-[#d97706]" />
            <span>{intentions.length} Saved</span>
          </div>
        </div>
      </header>

      {/* ─── 3-COLUMN ARCHITECTURE (AS SKETCHED) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ══════════════════════════════════════════════════════
            COLUMN 1: [Welcome] (Top) & [Text] (Bottom)
            ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-5">
          {/* ── Welcome Card ── */}
          <section
            aria-label="Welcome and grounding"
            className="rounded-[28px] bg-gradient-to-br from-[#f8fbf6] via-[#ffffff] to-[#f2f7ef] border border-[#dce8d5] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden min-h-[220px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7d9667]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Pill & Status */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-[#eef6ea] text-[#557743] border border-[#d6e8ce]">
                Welcome
              </span>
              <span className="text-[11px] font-bold text-[#678255] flex items-center gap-1">
                <FiSun size={12} className="text-[#eab308]" /> Morning
              </span>
            </div>

            {/* Greeting Content */}
            <div className="my-auto py-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#1c2e17] leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Welcome back, <br />
                <span className="text-[#557743] italic">{user?.name || "Friend"}!</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                Take a slow, deep breath. Enter your intention below or choose one from the library to guide your thoughts today.
              </p>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-[#e5efe0] flex items-center justify-between text-xs text-[#557743] font-bold">
              <span className="flex items-center gap-1.5">
                <FiFeather size={14} /> Center your mind
              </span>
              <span className="text-[11px] font-semibold text-gray-400">
                Fresh Start
              </span>
            </div>
          </section>

          {/* ── Text: Intention Entry Box ── */}
          <section
            aria-label="Write your intention"
            className="rounded-[28px] bg-gradient-to-b from-[#ffffff] via-[#fcfefb] to-[#f8faf6] border border-[#d9e7d3] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label
                htmlFor="intention-textarea"
                className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5"
              >
                <FiEdit3 className="text-[#7d9667]" size={14} />
                Write Your Intention:
              </label>
            </div>

            {/* Starter Chips */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-0.5">
                Starters:
              </span>
              {STARTER_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAppendStarter(chip)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-gray-50 hover:bg-[#eef6ea] text-gray-600 hover:text-[#2d491f] border border-gray-200 transition-all cursor-pointer active:scale-95"
                >
                  + {chip}
                </button>
              ))}
            </div>

            {/* Textarea Surface */}
            <div className="relative rounded-2xl bg-white border-2 border-[#e4eedf] p-3.5 focus-within:border-[#7d9667] focus-within:shadow-[0_8px_30px_rgba(125,150,103,0.12)] transition-all">
              <textarea
                id="intention-textarea"
                rows={3}
                value={intentionText}
                onChange={(e) => setIntentionText(e.target.value)}
                placeholder="Write your intention for today, or tap any prompt from the library in the next column..."
                className="w-full bg-transparent outline-none text-sm sm:text-base text-gray-800 font-medium placeholder:text-gray-400 placeholder:italic resize-none leading-relaxed"
                style={{ minHeight: "90px" }}
              />

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2 text-[11px] text-gray-400">
                {intentionText.trim().length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setIntentionText("")}
                    className="font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                ) : (
                  <span />
                )}
                <span>{intentionText.trim().length} chars</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              id="btn-submit-intention"
              onClick={handleSave}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7d9667] to-[#688154] hover:from-[#728a5d] hover:to-[#5d744b] text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiCheckCircle size={15} className="text-white" />
              <span>Set Today's Intention ✨</span>
            </button>
          </section>
        </div>

        {/* ══════════════════════════════════════════════════════
            COLUMN 2: [Daily] (Top) & [Prompt] (Bottom)
            ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-5">
          {/* ── Daily: Today's Intention Card ── */}
          <section
            aria-label="Today's Intention"
            className="rounded-[28px] bg-gradient-to-br from-[#fdfbf7] via-[#ffffff] to-[#f7f2ea] border border-[#e8dfcf] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden min-h-[220px]"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-[#f6efe4] text-[#856b46] border border-[#ecd9c2]">
                Today's Intention
              </span>
              <span className="text-[11px] font-bold text-[#856b46] flex items-center gap-1">
                <FiSparkles size={12} className="text-[#d97706]" /> Active Focus
              </span>
            </div>

            {/* Intention Content */}
            <div className="my-auto py-3">
              {intentions.length > 0 ? (
                <>
                  <span className="text-3xl font-serif italic text-[#d2be9d] leading-none block -mb-1">
                    “
                  </span>
                  <blockquote
                    className="text-base sm:text-lg text-[#3d3326] font-medium leading-relaxed italic"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {intentions[0].text}
                  </blockquote>
                </>
              ) : (
                <div className="py-2">
                  <p className="text-xs text-gray-500 font-medium">No intention set yet today.</p>
                  <p className="text-xs text-[#856b46] font-semibold mt-1">
                    Write or choose an intention to anchor your day.
                  </p>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-[#eee5d5] flex items-center justify-between text-xs text-[#856b46] font-bold">
              <span className="flex items-center gap-1.5 truncate">
                <FiHeart size={14} className="shrink-0" />
                <span className="truncate">
                  {intentions.length > 0
                    ? intentions[0].category || "Personal Intention"
                    : "Daily Reflection"}
                </span>
              </span>
              <span className="text-[11px] text-[#a49176] font-semibold shrink-0 ml-2">
                {intentions.length > 0 && intentions[0].displayDate
                  ? intentions[0].displayDate.split(",")[0]
                  : todayFormattedDate.split(",")[0]}
              </span>
            </div>
          </section>

          {/* ── Prompt: Inspiration Library ── */}
          <section
            aria-label="Inspiration prompts library"
            className="rounded-[28px] bg-gradient-to-b from-[#ffffff] via-[#fcfefb] to-[#f8faf6] border border-[#d9e7d3] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-500 flex items-center gap-1.5">
                <FiSparkles size={13} className="text-[#7d9667]" />
                Inspiration Library:
              </span>
              <span className="text-[10px] font-semibold text-[#557743]">
                Tap to fill in box
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {INTENTION_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#7d9667] text-white shadow-2xs"
                        : "bg-white text-gray-600 hover:text-[#7d9667] border border-gray-200"
                    }`}
                  >
                    <Icon size={11} style={{ color: isSelected ? "#ffffff" : cat.color }} />
                    <span>{cat.shortName}</span>
                  </button>
                );
              })}
            </div>

            {/* Selectable Cues List */}
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
              {activeCues.map((cue, idx) => {
                const isMatching = intentionText.trim() === cue;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCue(cue)}
                    className={`group text-left p-3 rounded-2xl transition-all flex items-start gap-2.5 cursor-pointer ${
                      isMatching
                        ? "bg-[#f3f8f0] border-2 border-[#7d9667] shadow-2xs text-[#1c2e17]"
                        : "bg-white hover:bg-[#fafcf9] border border-gray-200 hover:border-[#a8c397] text-gray-700 hover:text-[#1c2e17]"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isMatching
                          ? "bg-[#7d9667] text-white shadow-2xs"
                          : "border-2 border-gray-300 group-hover:border-[#7d9667] text-transparent"
                      }`}
                    >
                      <FiCheck size={11} className={isMatching ? "opacity-100" : "opacity-0"} />
                    </span>
                    <span className="text-xs font-medium leading-relaxed flex-1">
                      {cue}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════════════════════════
            COLUMN 3: [Close] (Top) & [Prompt] (Checklist) & [Submit] (Bottom)
            ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-5">
          <section
            aria-label="Yesterday's Closing"
            className="rounded-[28px] bg-[#fcfaf5] border border-[#e8dfcf] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Top Header: Title & Art Thumbnail */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-[#dfc6a6] text-[#6d4d29]">
                  Review
                </span>
                <h3
                  className="text-lg sm:text-xl font-bold text-[#3d2b17] mt-1 leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Yesterday's Closing
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                  Date: {yesterdayFormattedDate}
                </p>
              </div>
              <img
                src={yesterdayClosingImg}
                alt="Reflecting by the window"
                className="w-16 h-16 rounded-2xl object-cover object-center shadow-xs border border-[#dfc6a6]/60 shrink-0"
              />
            </div>

            {/* Yesterday's Intention Box */}
            <div className="my-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-[#f7efe4] to-[#f2e7d7] border border-[#dfc6a6]/80 flex flex-col gap-1 shadow-2xs">
              <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-[#6d4d29]">
                <span className="flex items-center gap-1 uppercase tracking-wider">
                  <FiFeather size={11} className="text-[#856b46]" /> Yesterday's Intention
                </span>
                {yesterdayIntention && (
                  <button
                    type="button"
                    onClick={handleAddYesterdayIntentionToTasks}
                    className="text-[10px] font-bold text-[#4d7874] hover:text-[#3d605c] hover:underline flex items-center gap-0.5 cursor-pointer bg-white/70 px-2 py-0.5 rounded-lg border border-[#dfc6a6]/60 transition-all shadow-2xs"
                    title="Add this intention into your reflection checklist"
                  >
                    <FiPlus size={10} /> Add to Checklist
                  </button>
                )}
              </div>
              {yesterdayIntention ? (
                <p
                  className="text-xs sm:text-sm font-semibold text-[#3d2b17] italic leading-snug"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  "{yesterdayIntention.text}"
                </p>
              ) : (
                <p className="text-[11px] text-gray-500 font-medium italic">
                  No intention recorded for yesterday.
                </p>
              )}
            </div>

            {/* Progress Section */}
            <div className="my-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#5c4a35] mb-1">
                <span>Reflection Checklist</span>
                <span className="text-[#4d7874]">
                  {completedCount}/{closingTasks.length} ({progressPercent}%)
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full bg-[#ebd9c1]/60 p-0.5 overflow-hidden shadow-inner"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Yesterday's closing completion progress"
              >
                <div
                  className="h-full rounded-full bg-[#4d7874] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-1.5 py-1 max-h-[160px] overflow-y-auto pr-0.5">
              {closingTasks.length === 0 ? (
                <div className="py-3.5 text-center px-2 bg-white/40 rounded-xl border border-dashed border-[#dfc6a6]">
                  <p className="text-xs text-gray-500 font-medium">No reflection items yet.</p>
                  <p className="text-[11px] text-[#4d7874] font-semibold mt-0.5">
                    Type what you practiced or did yesterday below.
                  </p>
                </div>
              ) : (
                closingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between text-xs font-semibold text-gray-700 bg-white/70 hover:bg-white px-2.5 py-1.5 rounded-xl border border-[#ede5d8] transition-all"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 select-none">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleClosingTask(task.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#4d7874] accent-[#4d7874] focus:ring-0 cursor-pointer shrink-0"
                      />
                      <span
                        className={`truncate ${
                          task.done ? "line-through text-gray-400 font-normal" : "text-gray-700"
                        }`}
                      >
                        {task.label}
                      </span>
                    </label>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span
                        className={
                          task.done
                            ? "text-emerald-700 font-bold text-[11px]"
                            : "text-gray-400 font-medium text-[11px]"
                        }
                      >
                        {task.done ? "Done!" : "Pending"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteClosingTask(task.id)}
                        className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                        title="Delete item"
                        aria-label={`Delete ${task.label}`}
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Reflection Item Form */}
            <form onSubmit={handleAddClosingTask} className="flex items-center gap-1.5 my-2">
              <input
                type="text"
                value={newClosingTask}
                onChange={(e) => setNewClosingTask(e.target.value)}
                placeholder="Add reflection item (e.g. Meditation)..."
                className="flex-1 min-w-0 bg-white border border-[#dfc6a6]/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4d7874] transition-all shadow-2xs"
              />
              <button
                type="submit"
                disabled={!newClosingTask.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#4d7874] hover:bg-[#3d605c] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <FiPlus size={13} />
                <span>Add</span>
              </button>
            </form>

            {/* Submit Closing Button */}
            <div className="pt-2 mt-auto">
              <button
                type="button"
                id="btn-submit-closing"
                onClick={handleSubmitClosing}
                className="w-full py-2.5 px-3 rounded-xl bg-[#4d7874] hover:bg-[#3d605c] active:bg-[#34524f] text-white text-xs font-bold transition-all shadow-xs hover:shadow active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiCheck size={14} className="text-white" />
                <span>Submit Closing Reflection</span>
              </button>
            </div>
          </section>
        </div>

      </div>

      {/* ─── PAST INTENTIONS HISTORY ACCORDION ─── */}
      <section className="mt-2">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white hover:bg-[#fcfdfa] border border-[#dce9d6] text-xs font-black uppercase tracking-wider text-gray-600 transition-all cursor-pointer shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <FiBookOpen className="text-[#7d9667]" size={15} />
            Previous Intentions History ({intentions.length})
          </span>
          <span className="text-[#7d9667] text-[11px] font-bold">
            {showHistory ? "Hide History ▲" : "View History ▼"}
          </span>
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2.5">
            {intentions.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
                <FiFeather size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-gray-400">
                  No intentions saved yet. Write or choose your first intention above!
                </p>
              </div>
            ) : (
              intentions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-start justify-between gap-3 hover:border-[#7d9667]/30 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-relaxed">
                      "{item.text}"
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-bold">
                      <FiCalendar size={11} className="text-[#7d9667]" />
                      <span>{item.displayDate || item.date}</span>
                      {item.category && (
                        <>
                          <span>•</span>
                          <span className="text-[#557743] font-semibold">
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Delete intention"
                    aria-label="Delete intention"
                    onClick={(e) => handleDeleteIntention(item.id, e)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default IntentionsScreen;
