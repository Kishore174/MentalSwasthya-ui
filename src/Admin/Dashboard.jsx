import React, { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDroplet,
  FiHeart,
  FiMinus,
  FiPlus,
  FiRefreshCcw,
  FiShield,
  FiTrendingUp,
  FiWind,
  FiZap,
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getBreathingHistory } from "../Api/breathingApi";

const getHistoryPayload = (response) => {
  const payload = response?.data?.data || response?.data || {};
  return Array.isArray(payload) ? payload : payload.history || payload.sessions || [];
};

const formatDuration = (seconds = 0) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes && remainingSeconds) return `${minutes}m ${remainingSeconds}s`;
  if (minutes) return `${minutes}m`;
  return `${remainingSeconds}s`;
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const toDateInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTechniqueLabel = (technique) => {
  const labels = {
    "4-7-8": "4-7-8 Breathing",
    "4-4-8": "4-4-8 Breathing",
    "5-2-7": "5-2-7 Breathing",
    triangle: "4-7-8 Breathing",
    "4-4-4-4": "Box Breathing",
    "5-2-7-2": "5-2-7-2 Box Breathing",
    "4-4-6-2": "4-4-6-2 Box Breathing",
    box: "Box Breathing",
    "4-4": "4-4 Breathing",
    "5-7": "5-7 Breathing",
    "4-6": "4-6 Breathing",
    circle: "4-4 Breathing",
  };

  return labels[technique] || technique || "Breathing";
};

/* ==========================================
   IMAGE 2: STREAK FREEZE STATUS COMPONENT
   ========================================== */
const StreakFreezeCard = () => {
  const [usedCount, setUsedCount] = useState(() => {
    try {
      const saved = localStorage.getItem("mentalswasthya_streak_freeze");
      if (saved) return JSON.parse(saved).used ?? 3;
    } catch (e) { }
    return 3;
  });

  const [cardTheme, setCardTheme] = useState("light");

  const maxFreezes = 5;
  const availableCount = Math.max(0, maxFreezes - usedCount);

  const handleUseFreeze = () => {
    if (availableCount > 0) {
      const newUsed = usedCount + 1;
      setUsedCount(newUsed);
      try {
        localStorage.setItem("mentalswasthya_streak_freeze", JSON.stringify({ used: newUsed, max: maxFreezes }));
      } catch (e) { }
    }
  };

  const handleRestoreFreeze = () => {
    if (usedCount > 0) {
      const newUsed = usedCount - 1;
      setUsedCount(newUsed);
      try {
        localStorage.setItem("mentalswasthya_streak_freeze", JSON.stringify({ used: newUsed, max: maxFreezes }));
      } catch (e) { }
    }
  };

  // SVG Arc Math: Center = (160, 135), Radius = 100
  const cx = 160;
  const cy = 135;
  const r = 100;

  const fireEndAngle = 180 - usedCount * 36;

  const getCoords = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad)
    };
  };

  const fireStart = getCoords(180);
  const fireEnd = getCoords(fireEndAngle);
  const iceEnd = getCoords(0);

  const firePathD = usedCount > 0
    ? `M ${fireStart.x} ${fireStart.y} A ${r} ${r} 0 0 1 ${fireEnd.x} ${fireEnd.y}`
    : "";

  const icePathD = availableCount > 0
    ? `M ${fireEnd.x} ${fireEnd.y} A ${r} ${r} 0 0 1 ${iceEnd.x} ${iceEnd.y}`
    : "";

  const slots = Array.from({ length: maxFreezes }).map((_, i) => {
    const angle = 180 - (i + 0.5) * 36;
    const coords = getCoords(angle);
    const isUsed = i < usedCount;
    return { id: i, angle, ...coords, isUsed };
  });

  const isDark = cardTheme === "dark";

  return (
    <div className={`rounded-[28px] border transition-all duration-300 p-6 md:p-7 relative overflow-hidden ${isDark
        ? "bg-gradient-to-b from-[#181d29] to-[#0f141f] border-slate-800 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
        : "bg-white border-[#e8efe3] text-[#22331b] shadow-[0_10px_30px_rgba(80,105,67,0.06)]"
      }`}>
      {/* Background ambient glow */}
      <div className={`absolute -left-20 -top-20 w-60 h-60 rounded-full blur-3xl pointer-events-none ${isDark ? "bg-amber-500/10" : "bg-[#7d9667]/10"
        }`} />
      <div className={`absolute -right-20 -bottom-20 w-60 h-60 rounded-full blur-3xl pointer-events-none ${isDark ? "bg-cyan-500/10" : "bg-sky-200/20"
        }`} />

      {/* Header bar */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${isDark ? "border-slate-800/80" : "border-[#e8efe3]"
        }`}>
        <div>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-[#7d9667]"
            }`}>MentalSwasthya • Streak</span>
          <h2 className={`text-xl font-black tracking-tight flex items-center gap-2 mt-0.5 ${isDark ? "text-white" : "text-[#22331b]"
            }`}>
            <span className="inline-block animate-pulse text-amber-500">🔥</span> STREAK FREEZE STATUS
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`border rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-2 ${isDark ? "bg-slate-800/80 border-slate-700/60" : "bg-[#f4f8f1] border-[#e1eadb]"
            }`}>
            <span className={isDark ? "text-slate-400" : "text-[#66785c]"}>Current Streak:</span>
            <span className="text-amber-500 font-extrabold">45 Days</span>
          </div>

          <div className={`border rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 ${isDark ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-[#edf8f0] border-[#c8e6d0] text-[#4c9a62]"
            }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Daily Goal Completed
          </div>

          {/* <button
            type="button"
            onClick={() => setCardTheme(isDark ? "light" : "dark")}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                : "bg-[#eef6ea] border-[#7d9667]/20 text-[#7d9667] hover:bg-[#7d9667] hover:text-white"
            }`}
          >
            {isDark ? "☀️ Light Theme" : "🌙 Dark Theme"}
          </button> */}
        </div>
      </div>

      {/* Main card content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mt-6">

        {/* Left Dragon Emblem / Status */}
        <div className={`lg:col-span-3 flex flex-col items-center justify-center text-center p-5 rounded-2xl border ${isDark
            ? "bg-slate-900/60 border-slate-800/80"
            : "bg-[#fbfdf8] border-[#e8efe3]"
          }`}>
          <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center mb-3 shadow-sm ${isDark
              ? "bg-gradient-to-br from-amber-500/20 via-red-500/10 to-transparent border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
              : "bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 border-amber-200"
            }`}>
            <svg viewBox="0 0 64 64" className="w-14 h-14 text-amber-500 drop-shadow">
              <path fill="currentColor" d="M32 4c-6 4-12 11-12 19 0 7 4 12 9 14-6 2-10 7-10 13 0 9 7 14 15 14s15-5 15-14c0-6-4-11-10-13 5-2 9-7 9-14 0-8-6-15-12-19zm-3 10c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4zm6 24c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7z" />
            </svg>
          </div>
          <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? "text-slate-300" : "text-[#22331b]"
            }`}>STREAK STATUS</span>
          <span className="text-xs font-bold text-amber-600 mt-1">Dragon Guard Active</span>
        </div>

        {/* Center Arc Gauge */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[340px] aspect-[2/1] flex items-center justify-center">
            <svg viewBox="0 0 320 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <linearGradient id="iceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>

              {/* Base Background Track Arc */}
              <path
                d={`M ${fireStart.x} ${fireStart.y} A ${r} ${r} 0 0 1 ${iceEnd.x} ${iceEnd.y}`}
                fill="none"
                stroke={isDark ? "#1e293b" : "#f1f5f9"}
                strokeWidth="22"
                strokeLinecap="round"
              />

              {/* Fire Arc (Used) */}
              {usedCount > 0 && (
                <path
                  d={firePathD}
                  fill="none"
                  stroke="url(#fireGradient)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  style={{ transition: "all 0.5s ease" }}
                />
              )}

              {/* Ice Arc (Available) */}
              {availableCount > 0 && (
                <path
                  d={icePathD}
                  fill="none"
                  stroke="url(#iceGradient)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  style={{ transition: "all 0.5s ease" }}
                />
              )}

              {/* Slot Markers */}
              {slots.map((slot) => (
                <g key={slot.id} transform={`translate(${slot.x}, ${slot.y})`}>
                  <circle
                    r="13"
                    fill={slot.isUsed ? (isDark ? "#7c2d12" : "#fef3c7") : (isDark ? "#0c4a6e" : "#e0f2fe")}
                    stroke={slot.isUsed ? "#f59e0b" : "#38bdf8"}
                    strokeWidth="2"
                  />
                  {slot.isUsed ? (
                    <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#f59e0b">🔥</text>
                  ) : (
                    <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#0284c7">💧</text>
                  )}
                </g>
              ))}

              {/* Center Text Overlay */}
              <g transform="translate(160, 110)">
                <text x="-45" y="-15" textAnchor="middle" fontSize="22" fontWeight="900" fill="#f59e0b">{usedCount}</text>
                <text x="-45" y="5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isDark ? "#cbd5e1" : "#66785c"}>Used</text>

                <text x="45" y="-15" textAnchor="middle" fontSize="22" fontWeight="900" fill="#0284c7">{availableCount}</text>
                <text x="45" y="5" textAnchor="middle" fontSize="11" fontWeight="700" fill={isDark ? "#cbd5e1" : "#66785c"}>Available</text>
              </g>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-2 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              🔥 Used (Fire: {usedCount})
            </span>
            <span className="flex items-center gap-1.5 text-cyan-600">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm" />
              💧 Available (Ice: {availableCount})
            </span>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className={`lg:col-span-3 flex flex-col justify-between h-full rounded-2xl border p-5 space-y-4 ${isDark
            ? "bg-slate-900/60 border-slate-800/80"
            : "bg-[#fbfdf8] border-[#e8efe3]"
          }`}>
          <div className="space-y-2">
            <div className={`flex justify-between items-center text-xs font-bold border-b pb-2 ${isDark ? "border-slate-800" : "border-gray-200/80"
              }`}>
              <span className={isDark ? "text-slate-400" : "text-[#66785c]"}>Max Freezes:</span>
              <span className={`font-extrabold ${isDark ? "text-white" : "text-[#22331b]"}`}>{maxFreezes} Freezes</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className={isDark ? "text-slate-400" : "text-[#66785c]"}>Total:</span>
              <span className={`font-extrabold ${isDark ? "text-white" : "text-[#22331b]"}`}>{maxFreezes}</span>
            </div>
          </div>

          <div className={`pt-3 border-t space-y-2 ${isDark ? "border-slate-800" : "border-gray-200/80"}`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-[#7d9667]"
              }`}>Token Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleUseFreeze}
                disabled={availableCount === 0}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-1"
              >
                <FaFire size={14} /> Use
              </button>
              <button
                type="button"
                onClick={handleRestoreFreeze}
                disabled={usedCount === 0}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-40 text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-1"
              >
                <FiDroplet size={14} /> Restore
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ==========================================
   IMAGE 1: MILESTONE ACHIEVEMENTS COMPONENT
   ========================================== */
const MilestoneShieldBadge = ({ badgeType, achieved }) => {
  const configs = {
    bronze: {
      shieldBorder: "#b45309",
      bgGrad: "from-amber-900/60 to-amber-950/80",
      subLabel: "15",
      badgeNum: "1",
      icon: "🏅"
    },
    silver: {
      shieldBorder: "#64748b",
      bgGrad: "from-slate-800/80 to-slate-900/80",
      subLabel: "30",
      badgeNum: "2",
      icon: "🥈"
    },
    gold: {
      shieldBorder: "#eab308",
      bgGrad: "from-yellow-950/60 to-amber-950/80",
      subLabel: "45",
      badgeNum: "1",
      icon: "🥇"
    },
    platinum: {
      shieldBorder: "#06b6d4",
      bgGrad: "from-cyan-950/60 to-teal-950/80",
      subLabel: "60",
      badgeNum: "60",
      icon: "💿"
    },
    diamond: {
      shieldBorder: "#3b82f6",
      bgGrad: "from-blue-950/60 to-slate-950/80",
      subLabel: "90",
      badgeNum: "90",
      icon: "💎"
    }
  };

  const cfg = configs[badgeType] || configs.bronze;

  return (
    <div className="flex flex-col items-center group cursor-pointer transition-transform duration-300 hover:scale-105">
      <div className="relative w-14 h-16 md:w-16 md:h-18 flex flex-col items-center justify-center filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]">
        <svg viewBox="0 0 64 74" className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`ringGrad-${badgeType}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={badgeType === 'bronze' ? '#f59e0b' : badgeType === 'silver' ? '#cbd5e1' : badgeType === 'gold' ? '#fde047' : badgeType === 'platinum' ? '#67e8f9' : '#60a5fa'} />
              <stop offset="100%" stopColor={badgeType === 'bronze' ? '#78350f' : badgeType === 'silver' ? '#475569' : badgeType === 'gold' ? '#b45309' : badgeType === 'platinum' ? '#0e7490' : '#1e40af'} />
            </linearGradient>
          </defs>

          <path
            d="M 32 4 L 58 12 C 58 38 48 58 32 70 C 16 58 6 38 6 12 Z"
            fill="#0f172a"
            stroke={`url(#ringGrad-${badgeType})`}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M 32 8 L 54 15 C 54 36 45 54 32 64 C 19 54 10 36 10 15 Z"
            fill="none"
            stroke={achieved ? cfg.shieldBorder : "#334155"}
            strokeWidth="1.5"
            opacity="0.6"
          />
        </svg>

        <div className="relative z-10 flex flex-col items-center justify-center -mt-1">
          <div className={`w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center shadow-inner text-sm bg-gradient-to-b ${cfg.bgGrad}`}>
            <span className="drop-shadow">{cfg.icon}</span>
          </div>
          <span className="text-[10px] font-black text-white mt-0.5 tracking-tighter drop-shadow-md">{cfg.subLabel}</span>
        </div>
      </div>
    </div>
  );
};

const MilestoneAchievementsCard = () => {
  const [cardTheme, setCardTheme] = useState("light");

  const milestoneData = [
    { target: 15, badgeType: "bronze", level: 1, times: 12.0, color: "from-amber-500 via-amber-400 to-yellow-300", glow: "rgba(245, 158, 11, 0.4)", statusText: "ACHIEVED", countText: "12 TIMES", achieved: true },
    { target: 30, badgeType: "silver", level: 2, times: 5.0, color: "from-slate-400 via-slate-300 to-slate-200", glow: "rgba(148, 163, 184, 0.4)", statusText: "ACHIEVED", countText: "5 TIMES", achieved: true },
    { target: 45, badgeType: "gold", level: 1, times: 2.0, color: "from-amber-500 via-yellow-400 to-amber-300", glow: "rgba(251, 191, 36, 0.4)", statusText: "ACHIEVED", countText: "2 TIMES", achieved: true },
    { target: 60, badgeType: "platinum", level: 60, times: 1.0, color: "from-teal-500 via-cyan-400 to-teal-300", glow: "rgba(6, 182, 212, 0.4)", statusText: "ACHIEVED", countText: "1 TIMES", achieved: true },
    { target: 90, badgeType: "diamond", level: 90, times: 0, color: "from-gray-300 to-gray-400", glow: "rgba(0,0,0,0)", statusText: "NOT ACHIEVED", countText: "YET", achieved: false },
  ];

  const yAxisTicks = [
    { label: "20+ TIMES", val: 20 },
    { label: "15", val: 15 },
    { label: "10", val: 10 },
    { label: "5", val: 5 },
    { label: "0", val: 0 },
  ];

  const maxY = 20;
  const isDark = cardTheme === "dark";

  return (
    <div className={`rounded-[28px] border transition-all duration-300 p-6 md:p-8 relative overflow-hidden ${isDark
        ? "bg-gradient-to-br from-[#0c1322] via-[#10192d] to-[#090d18] border-[#1e2d4a] text-white shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
        : "bg-white border-[#e8efe3] text-[#22331b] shadow-[0_10px_30px_rgba(80,105,67,0.06)]"
      }`}>

      {/* Background Cyan / Sage Light Wave Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 1000 500" preserveAspectRatio="none">
        <path d="M 0 250 Q 250 150, 500 280 T 1000 220" fill="none" stroke={isDark ? "#38bdf8" : "#7d9667"} strokeWidth="2" filter="blur(2px)" />
        <path d="M 0 300 Q 300 200, 600 320 T 1000 180" fill="none" stroke={isDark ? "#22d3ee" : "#00a896"} strokeWidth="1.5" />
      </svg>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 mb-8">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-[#7d9667]"
            }`}>MentalSwasthya • Rewards</span>
          <h2 className={`text-2xl md:text-3xl font-black tracking-wider uppercase ${isDark ? "text-[#38bdf8] drop-shadow-[0_2px_10px_rgba(56,189,248,0.3)]" : "text-[#22331b]"
            }`}>
            MILESTONE ACHIEVEMENTS
          </h2>
          <p className={`text-xs font-bold uppercase tracking-[0.14em] mt-1 ${isDark ? "text-slate-400" : "text-[#66785c]"
            }`}>
            SUMMARY OF MILESTONES REACHED (TIMES COMPLETED)
          </p>
        </div>

        {/* Theme Toggle */}
        {/* <button
          type="button"
          onClick={() => setCardTheme(isDark ? "light" : "dark")}
          className={`self-start md:self-auto px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            isDark
              ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
              : "bg-[#eef6ea] border-[#7d9667]/20 text-[#7d9667] hover:bg-[#7d9667] hover:text-white"
          }`}
        >
          {isDark ? "☀️ Light Theme" : "🌙 Dark Theme"}
        </button> */}
      </div>

      {/* Chart Main Area */}
      <div className="relative z-10 grid grid-cols-12 gap-2 md:gap-4 items-end min-h-[360px] pt-4 pb-2 px-2">

        {/* Y-Axis Column */}
        <div className={`col-span-2 md:col-span-1 flex flex-col justify-between h-[240px] text-right pr-2 font-extrabold text-[11px] md:text-xs ${isDark ? "text-slate-400" : "text-[#66785c]"
          }`}>
          {yAxisTicks.map((tick, idx) => (
            <span key={idx} className="leading-none whitespace-nowrap">{tick.label}</span>
          ))}
        </div>

        {/* Chart Column Canvas */}
        <div className={`col-span-10 md:col-span-11 relative h-[240px] border-l border-b ${isDark ? "border-slate-700/80" : "border-[#e8efe3]"
          }`}>

          {/* Horizontal Gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {yAxisTicks.map((_, idx) => (
              <div key={idx} className={`w-full border-b ${isDark ? "border-slate-800/60" : "border-gray-100"}`} />
            ))}
          </div>

          {/* 5 Milestone Bars */}
          <div className="absolute inset-0 grid grid-cols-5 gap-2 md:gap-6 px-2 md:px-6 items-end">
            {milestoneData.map((item, index) => {
              const heightPct = Math.min(100, (item.times / maxY) * 100);

              return (
                <div key={index} className="flex flex-col items-center h-full justify-end group">

                  {/* Shield Badge */}
                  <div className="mb-2 relative z-20">
                    <MilestoneShieldBadge
                      badgeType={item.badgeType}
                      achieved={item.achieved}
                    />
                  </div>

                  {/* Frequency Value */}
                  <div className="mb-1 text-center h-5">
                    <span className={`text-xs md:text-sm font-black tracking-tight ${isDark ? "text-white drop-shadow" : "text-[#22331b]"
                      }`}>
                      {item.times > 0 ? item.times.toFixed(1) : ""}
                    </span>
                  </div>

                  {/* Vertical Column Track */}
                  <div className={`w-full max-w-[64px] h-[160px] border rounded-t-lg relative flex items-end justify-center overflow-hidden shadow-inner ${isDark
                      ? "bg-[#0c1f2d]/80 border-slate-800/80"
                      : "bg-[#f4f8f1] border-[#e1eadb]"
                    }`}>
                    {item.times > 0 && (
                      <div
                        className={`w-full bg-gradient-to-t ${item.color} rounded-t-sm transition-all duration-1000`}
                        style={{
                          height: `${heightPct}%`,
                          boxShadow: `0 0 15px ${item.glow}`
                        }}
                      />
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Bottom Status Cards */}
      <div className="relative z-10 grid grid-cols-12 gap-2 md:gap-4 mt-4">
        <div className="col-span-2 md:col-span-1" />
        <div className="col-span-10 md:col-span-11 grid grid-cols-5 gap-2 md:gap-6 px-2 md:px-6">
          {milestoneData.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl p-2 md:p-3 text-center border transition-all ${item.achieved
                  ? isDark
                    ? "bg-slate-800/90 border-slate-600 text-white shadow-sm"
                    : "bg-[#f4f8f1] border-[#e1eadb] text-[#22331b] shadow-sm"
                  : isDark
                    ? "bg-slate-900/40 border-slate-800/60 text-slate-500"
                    : "bg-gray-50 border-gray-100 text-gray-400"
                }`}
            >
              <div className="text-[9px] md:text-[11px] font-black uppercase tracking-wider leading-tight">
                {item.statusText}
              </div>
              <div className={`text-[10px] md:text-xs font-black uppercase tracking-wider mt-0.5 ${item.achieved ? "text-amber-500" : isDark ? "text-slate-500" : "text-gray-400"
                }`}>
                {item.countText}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = () => {
    setLoading(true);
    setError("");

    getBreathingHistory()
      .then((response) => setHistory(getHistoryPayload(response)))
      .catch(() => {
        setHistory([]);
        setError("Unable to load breathing history. Please check the API connection.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const completedHistory = useMemo(
    () => history.filter((session) => session.isCompleted),
    [history]
  );

  const filteredHistory = useMemo(() => {
    if (!selectedDate) return completedHistory;

    return completedHistory.filter((session) => {
      const dateValue = session.completedAt || session.createdAt;
      return toDateInputValue(dateValue) === selectedDate;
    });
  }, [completedHistory, selectedDate]);

  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const statsData = useMemo(() => {
    // 1. Intentions Stats
    let intentionsCount = 0;
    let totalIntentions = 0;
    try {
      const intentions = JSON.parse(localStorage.getItem("mentalSwasthya:intentions") || "[]");
      totalIntentions = intentions.length;
      const uniqueIntentionDays = new Set(
        intentions.map(item => {
          const d = new Date(item.date || item.timestamp || Date.now());
          return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        })
      );
      intentionsCount = uniqueIntentionDays.size;
    } catch (e) {
      console.error(e);
    }
    const intentionsProgress = intentionsCount;

    // 2. Breathing Stats
    const totalSeconds = completedHistory.reduce(
      (total, session) => total + (session.durationSeconds || 0),
      0
    );
    const breathingDays = new Set(
      completedHistory.map((session) => toDateInputValue(session.completedAt || session.createdAt))
    ).size;
    const totalBreathingSessions = completedHistory.length;

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const breathingTimeFormatted = hrs > 0 ? `${hrs}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;

    // 3. Play History (Meditation & Affirmation)
    let playHistory = [];
    try {
      playHistory = JSON.parse(localStorage.getItem("mentalswasthya_play_history") || "[]");
    } catch (e) {
      console.error(e);
    }

    const getUniqueDaysForType = (type) => {
      const filtered = playHistory.filter(item => item.type === type);
      const uniqueDays = new Set(
        filtered.map(item => {
          const d = new Date(item.timestamp || Date.now());
          return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        })
      );
      return uniqueDays.size;
    };

    let meditationDays = getUniqueDaysForType("meditation");
    if (meditationDays === 0) meditationDays = 2; // Default fallback as requested

    let affirmationDays = getUniqueDaysForType("affirmation");
    if (affirmationDays === 0) affirmationDays = 2; // Default fallback as requested

    const totalAudioSessions = playHistory.length || 6; // Default mockup size

    const displayIntentions = totalIntentions || 3;
    const displayBreathing = totalBreathingSessions || 8;
    const displayAudio = totalAudioSessions;
    const totalPractices = displayIntentions + displayBreathing + displayAudio;

    return {
      intentionsDays: intentionsProgress,
      breathingDays,
      breathingTime: breathingTimeFormatted,
      breathingHrs: hrs,
      breathingMins: mins,
      meditationDays,
      affirmationDays,
      totalIntentions: displayIntentions,
      totalBreathingSessions: displayBreathing,
      totalAudioSessions: displayAudio,
      totalPractices
    };
  }, [completedHistory]);

  const weeklyData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortDays = ["S", "M", "T", "W", "T", "F", "S"];

    // 1. Parse breathing
    completedHistory.forEach((session) => {
      const dateValue = session.completedAt || session.createdAt;
      if (dateValue) {
        const day = new Date(dateValue).getDay();
        counts[day] += 1;
      }
    });

    // 2. Parse play history
    try {
      const playHistory = JSON.parse(localStorage.getItem("mentalswasthya_play_history") || "[]");
      playHistory.forEach((session) => {
        if (session.timestamp) {
          const day = new Date(session.timestamp).getDay();
          counts[day] += 1;
        }
      });
    } catch (e) { }

    // 3. Parse intentions
    try {
      const intentions = JSON.parse(localStorage.getItem("mentalSwasthya:intentions") || "[]");
      intentions.forEach((item) => {
        const dateValue = item.date || item.timestamp;
        if (dateValue) {
          const day = new Date(dateValue).getDay();
          counts[day] += 1;
        }
      });
    } catch (e) { }

    // Add dummy values to populate weeks if completely empty to show realistic chart mockups
    const sum = counts.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      counts[0] = 1;
      counts[1] = 3;
      counts[2] = 2;
      counts[3] = 4;
      counts[4] = 1;
      counts[5] = 5;
      counts[6] = 2;
    }

    const maxVal = Math.max(...counts, 1);

    return shortDays.map((label, index) => ({
      label,
      fullDay: dayNames[index],
      count: counts[index],
      percentage: (counts[index] / maxVal) * 100
    }));
  }, [completedHistory]);

  return (
    <div className="space-y-6 text-[#22331b]">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f5faf2] via-white to-[#eef7fb] border border-[#e1eadb] shadow-[0_18px_50px_rgba(80,105,67,0.08)] p-7 md:p-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7d9667]/10" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-200/20" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
          MentalSwasthya
        </p>
        <div className="relative mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#22331b]">
              Your wellness dashboard
            </h1>
            <p className="text-sm text-[#66785c] mt-3 max-w-2xl leading-6">
              Review your breathing practice, track completed sessions, and continue your calm routine.
            </p>
          </div>
          <Link
            to="/app/meditation"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7d9667] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#7d9667]/20 hover:bg-[#6f865c] transition-all"
          >
            <FiWind />
            Start Meditation
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: 4 Circular Gauges */}
        <div className="rounded-3xl bg-white border border-[#e8efe3] p-6 shadow-[0_10px_30px_rgba(80,105,67,0.06)] flex flex-col justify-between lg:col-span-3 min-h-[300px]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7d9667]">Statistics</p>
            <h3 className="text-lg font-black text-[#22331b] mt-0.5">Wellness Overview</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 items-center justify-around gap-4 my-6">

            {/* Circle 1: Daily Intention (Teal) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#00a896" strokeWidth="3"
                    strokeDasharray={`${(statsData.intentionsDays / 31) * 100} 100`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.8s ease" }} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-[#22331b]">{statsData.intentionsDays}</span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wide">/ 31 Days</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-gray-500 mt-2">INTENTIONS</span>
            </div>

            {/* Circle 2: Guided Breathing (Blue) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#028090" strokeWidth="3"
                    strokeDasharray={`${(statsData.breathingDays / 7) * 100} 100`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.8s ease" }} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-[#22331b]">{statsData.breathingDays}</span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wide">/ 7 Days</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-gray-500 mt-2">BREATHING</span>
            </div>

            {/* Circle 3: Mindful Meditation (Purple) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8338ec" strokeWidth="3"
                    strokeDasharray={`${(statsData.meditationDays / 7) * 100} 100`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.8s ease" }} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-[#22331b]">{statsData.meditationDays}</span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wide">/ 7 Days</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-gray-500 mt-2">MEDITATION</span>
            </div>

            {/* Circle 4: Daily Affirmation (Orange) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#d97706" strokeWidth="3"
                    strokeDasharray={`${(statsData.affirmationDays / 7) * 100} 100`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.8s ease" }} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-[#22331b]">{statsData.affirmationDays}</span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wide">/ 7 Days</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-gray-500 mt-2">AFFIRMATIONS</span>
            </div>

          </div>

          <div className="flex justify-center border-t border-gray-100/60 pt-3">
            <span className="bg-[#f4f8f1] border border-[#e1eadb] rounded-full px-4 py-1 text-xs font-black uppercase text-[#66785c] tracking-wider">
              TOTALS • Out of {statsData.totalPractices} wellness practices
            </span>
          </div>
        </div>

        {/* Right: completions bar chart */}
        <div className="rounded-3xl bg-white border border-[#e8efe3] p-6 shadow-[0_10px_30px_rgba(80,105,67,0.06)] flex flex-col justify-between lg:col-span-2 relative min-h-[300px]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7d9667]">Weekly Activity</p>
            <h3 className="text-lg font-black text-[#22331b] mt-0.5">Completions / Day</h3>
          </div>

          <div className="relative h-36 flex items-end justify-between gap-2.5 px-2 mt-4 mb-2">
            {hoveredBarIndex !== null && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white rounded-xl px-3.5 py-1.5 text-[10px] font-bold shadow-xl border border-gray-800 z-20 backdrop-blur-sm pointer-events-none transition-all">
                {weeklyData[hoveredBarIndex].fullDay}: <span className="text-[#a8c896]">{weeklyData[hoveredBarIndex].count} practices</span>
              </div>
            )}

            {weeklyData.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredBarIndex(index)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                <div className="absolute inset-x-0.5 top-0 bottom-0 bg-gray-100 rounded-md -z-10 group-hover:bg-gray-200/80 transition-colors" />

                <div
                  className="w-3 rounded-t-md transition-all"
                  style={{
                    height: `${item.percentage}%`,
                    minHeight: item.count > 0 ? "10px" : "2px",
                    backgroundColor: item.count === 0 ? "#d1d5db" : item.count === 1 ? "#ef4444" : "#7d9667"
                  }}
                />

                <span className="text-[10px] font-black text-gray-400 uppercase mt-2">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Date-wise filter down the chart */}
          <div className="mt-4 pt-4 border-t border-gray-100/60 flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by Date</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 rounded-xl bg-[#f4f8f1] border border-[#e1eadb] px-2.5 py-1 shadow-sm text-[11px] font-bold text-[#66785c] cursor-pointer">
                <FiCalendar className="text-[#7d9667]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="bg-transparent outline-none cursor-pointer"
                />
              </label>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* Streak Freeze Status Card (Image 2) */}
      <StreakFreezeCard />

      {/* Milestone Achievements Chart (Image 1) */}
      <MilestoneAchievementsCard />

      <section className="rounded-[28px] bg-white border border-[#e8efe3] shadow-[0_10px_30px_rgba(80,105,67,0.06)] overflow-hidden">
        <div className="p-5 md:p-6 border-b border-[#e8efe3] bg-[#fbfdf8] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7d9667]">
              Breathing History
            </p>
            <h2 className="text-xl font-black text-[#22331b] mt-1">Session records</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchHistory}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7d9667] px-5 py-3 text-sm font-bold text-white hover:bg-[#6f865c] transition-all shadow-lg shadow-[#7d9667]/15"
            >
              <FiRefreshCcw />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="bg-[#f4f8f1] text-[11px] uppercase tracking-[0.12em] text-[#8a9a80]">
                <th className="px-6 py-4 font-black">Date</th>
                <th className="px-6 py-4 font-black">Technique</th>
                <th className="px-6 py-4 font-black">Shape</th>
                <th className="px-6 py-4 font-black">Duration</th>
                <th className="px-6 py-4 font-black">Cycles</th>
                <th className="px-6 py-4 font-black">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm font-semibold text-[#8a9a80]">
                    Loading breathing history...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm font-semibold text-[#ce7a63]">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm font-semibold text-[#8a9a80]">
                    No breathing sessions found for this date.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredHistory.map((session) => (
                  <tr key={session._id} className="hover:bg-[#fbfdf8] transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[#3a4a31]">
                      {formatDateTime(session.completedAt || session.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#66785c]">
                      {getTechniqueLabel(session.technique)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-[#eef6ea] px-3 py-1 text-xs font-bold capitalize text-[#7d9667]">
                        {session.shape || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#3a4a31]">
                      {formatDuration(session.durationSeconds || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#3a4a31]">
                      {session.cyclesCompleted || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-[#edf8f0] px-3 py-1 text-xs font-bold text-[#4c9a62]">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
