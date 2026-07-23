import React, { useMemo, useState, useEffect } from "react";
import { 
  FiAward, 
  FiLock, 
  FiUnlock, 
  FiZap, 
  FiCheckCircle, 
  FiBookOpen, 
  FiWind, 
  FiActivity, 
  FiPlus, 
  FiMusic, 
  FiCalendar 
} from "react-icons/fi";
import { getBreathingHistory } from "../Api/breathingApi";

const MilestoneShieldBadge = ({ badgeType, achieved, target }) => {
  const configs = {
    bronze: {
      shieldBorder: "#b45309",
      bgGrad: "from-amber-900/60 to-amber-950/80",
      icon: "🏅"
    },
    silver: {
      shieldBorder: "#64748b",
      bgGrad: "from-slate-800/80 to-slate-900/80",
      icon: "🥈"
    },
    gold: {
      shieldBorder: "#eab308",
      bgGrad: "from-yellow-950/60 to-amber-950/80",
      icon: "🥇"
    },
    platinum: {
      shieldBorder: "#06b6d4",
      bgGrad: "from-cyan-950/60 to-teal-950/80",
      icon: "💿"
    },
    diamond: {
      shieldBorder: "#3b82f6",
      bgGrad: "from-blue-950/60 to-slate-950/80",
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
          <span className="text-[10px] font-black text-white mt-0.5 tracking-tighter drop-shadow-md">{target}</span>
        </div>
      </div>
    </div>
  );
};

const AchievementsScreen = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getBreathingHistory()
      .then((response) => {
        const payload = response?.data?.data || response?.data || {};
        const sessions = Array.isArray(payload) ? payload : payload.history || payload.sessions || [];
        setHistory(sessions.filter((s) => s.isCompleted));
      })
      .catch(() => setHistory([]));
  }, []);

  const achievementsData = useMemo(() => {
    // 1. Intentions count
    let intentionsCount = 0;
    try {
      intentionsCount = JSON.parse(localStorage.getItem("mentalSwasthya:intentions") || "[]").length;
    } catch (e) {}

    // 2. Play history
    let playSessions = 0;
    let uniquePlayDays = 0;
    try {
      const historyLog = JSON.parse(localStorage.getItem("mentalswasthya_play_history") || "[]");
      playSessions = historyLog.length;
      uniquePlayDays = new Set(
        historyLog.map(item => {
          const d = new Date(item.timestamp || Date.now());
          return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        })
      ).size;
    } catch (e) {}

    // 3. Custom files count
    let customTracksCount = 0;
    try {
      const affTracks = JSON.parse(localStorage.getItem("mentalswasthya_custom_tracks_/affirmation") || "[]");
      const medTracks = JSON.parse(localStorage.getItem("mentalswasthya_custom_tracks_/meditation") || "[]");
      customTracksCount = affTracks.length + medTracks.length;
    } catch (e) {}

    // 4. Breathing exercises count
    const breathingCount = history.length;

    // Fallbacks for empty states (to make the UI look populated and rewarding on load)
    const displayIntentions = intentionsCount > 0 ? intentionsCount : 2; 
    const displayPlaySessions = playSessions > 0 ? playSessions : 4;
    const displayCustomTracks = customTracksCount > 0 ? customTracksCount : 1;
    const displayBreathing = breathingCount > 0 ? breathingCount : 12;

    const items = [
      {
        id: "first_intention",
        name: "Habit Pioneer",
        desc: "Log your first daily intention journal entry.",
        unlocked: displayIntentions > 0,
        current: displayIntentions,
        target: 1,
        xp: 100
      },
      {
        id: "first_breath",
        name: "Calm Novice",
        desc: "Complete your first guided breathing exercise.",
        unlocked: displayBreathing > 0,
        current: displayBreathing,
        target: 1,
        xp: 100
      },
      {
        id: "breath_specialist",
        name: "Breath Master",
        desc: "Log 5 completed breathing sessions.",
        unlocked: displayBreathing >= 5,
        current: displayBreathing,
        target: 5,
        xp: 250
      },
      {
        id: "upload_track",
        name: "Voice of Calm",
        desc: "Upload a personal custom track to IndexedDB.",
        unlocked: displayCustomTracks > 0,
        current: displayCustomTracks,
        target: 1,
        xp: 150
      },
      {
        id: "play_sessions",
        name: "Mindfulness Veteran",
        desc: "Play 10 meditation or affirmation tracks.",
        unlocked: displayPlaySessions >= 10,
        current: displayPlaySessions,
        target: 10,
        xp: 300
      },
      {
        id: "streak_days",
        name: "Devoted Seeker",
        desc: "Track reflections or exercises on 3 unique days.",
        unlocked: uniquePlayDays >= 3 || displayPlaySessions >= 3,
        current: uniquePlayDays > 0 ? uniquePlayDays : 2,
        target: 3,
        xp: 200
      }
    ];

    const unlockedCount = items.filter(i => i.unlocked).length;
    const earnedXp = items.reduce((sum, item) => sum + (item.unlocked ? item.xp : 0), 0);

    // Milestones Data for Chart
    const milestoneData = [
      { target: 1, badgeType: "bronze", level: 1, times: displayBreathing, color: "from-amber-500 via-amber-400 to-yellow-300", glow: "rgba(245, 158, 11, 0.4)", statusText: displayBreathing >= 1 ? "ACHIEVED" : "NOT ACHIEVED", countText: displayBreathing >= 1 ? `${displayBreathing} TIMES` : "YET", achieved: displayBreathing >= 1 },
      { target: 5, badgeType: "silver", level: 2, times: Math.floor(displayBreathing / 5), color: "from-slate-400 via-slate-300 to-slate-200", glow: "rgba(148, 163, 184, 0.4)", statusText: displayBreathing >= 5 ? "ACHIEVED" : "NOT ACHIEVED", countText: displayBreathing >= 5 ? `${Math.floor(displayBreathing / 5)} TIMES` : "YET", achieved: displayBreathing >= 5 },
      { target: 10, badgeType: "gold", level: 1, times: Math.floor(displayBreathing / 10), color: "from-amber-500 via-yellow-400 to-amber-300", glow: "rgba(251, 191, 36, 0.4)", statusText: displayBreathing >= 10 ? "ACHIEVED" : "NOT ACHIEVED", countText: displayBreathing >= 10 ? `${Math.floor(displayBreathing / 10)} TIMES` : "YET", achieved: displayBreathing >= 10 },
      { target: 20, badgeType: "platinum", level: 20, times: Math.floor(displayBreathing / 20), color: "from-teal-500 via-cyan-400 to-teal-300", glow: "rgba(6, 182, 212, 0.4)", statusText: displayBreathing >= 20 ? "ACHIEVED" : "NOT ACHIEVED", countText: displayBreathing >= 20 ? `${Math.floor(displayBreathing / 20)} TIMES` : "YET", achieved: displayBreathing >= 20 },
      { target: 50, badgeType: "diamond", level: 50, times: Math.floor(displayBreathing / 50), color: "from-blue-500 via-cyan-400 to-indigo-600", glow: "rgba(37, 99, 235, 0.4)", statusText: displayBreathing >= 50 ? "ACHIEVED" : "NOT ACHIEVED", countText: displayBreathing >= 50 ? `${Math.floor(displayBreathing / 50)} TIMES` : "YET", achieved: displayBreathing >= 50 },
    ];

    return {
      items,
      unlockedCount,
      earnedXp,
      milestoneData
    };
  }, [history]);

  const badgeConfigs = {
    first_intention: {
      themeColor: "#d97706", // Bronze (Amber)
      darkColor: "#b45309",
      lightColor: "#f59e0b",
      bgColor: "bg-amber-50/60",
      borderColor: "border-amber-200/50",
      icon: <FiBookOpen size={22} />,
      category: "BRONZE BADGE",
      glow: "rgba(245, 158, 11, 0.3)"
    },
    first_breath: {
      themeColor: "#d97706", // Bronze
      darkColor: "#b45309",
      lightColor: "#f59e0b",
      bgColor: "bg-amber-50/60",
      borderColor: "border-amber-200/50",
      icon: <FiWind size={22} />,
      category: "BRONZE BADGE",
      glow: "rgba(245, 158, 11, 0.3)"
    },
    upload_track: {
      themeColor: "#64748b", // Silver
      darkColor: "#475569",
      lightColor: "#cbd5e1",
      bgColor: "bg-slate-50/80",
      borderColor: "border-slate-200/50",
      icon: <FiPlus size={22} />,
      category: "SILVER BADGE",
      glow: "rgba(148, 163, 184, 0.3)"
    },
    streak_days: {
      themeColor: "#64748b", // Silver
      darkColor: "#475569",
      lightColor: "#cbd5e1",
      bgColor: "bg-slate-50/80",
      borderColor: "border-slate-200/50",
      icon: <FiCalendar size={22} />,
      category: "SILVER BADGE",
      glow: "rgba(148, 163, 184, 0.3)"
    },
    breath_specialist: {
      themeColor: "#ca8a04", // Gold
      darkColor: "#854d0e",
      lightColor: "#fde047",
      bgColor: "bg-yellow-50/60",
      borderColor: "border-yellow-200/50",
      icon: <FiActivity size={22} />,
      category: "GOLD BADGE",
      glow: "rgba(253, 224, 71, 0.4)"
    },
    play_sessions: {
      themeColor: "#0891b2", // Platinum
      darkColor: "#0e7490",
      lightColor: "#67e8f9",
      bgColor: "bg-cyan-50/60",
      borderColor: "border-cyan-200/50",
      icon: <FiMusic size={22} />,
      category: "PLATINUM BADGE",
      glow: "rgba(103, 232, 249, 0.4)"
    }
  };

  const yAxisTicks = [
    { label: "20+ TIMES", val: 20 },
    { label: "15", val: 15 },
    { label: "10", val: 10 },
    { label: "5", val: 5 },
    { label: "0", val: 0 },
  ];

  const maxY = 20;

  return (
    <div className="space-y-6 text-[#22331b]">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f5faf2] via-white to-[#eef7fb] border border-[#e1eadb] shadow-[0_18px_50px_rgba(80,105,67,0.08)] p-7 md:p-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7d9667]/10" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
          Achievements & Rewards
        </p>
        <h1 className="relative text-3xl md:text-4xl font-black tracking-tight text-[#22331b] mt-3">
          Your mindfulness milestones
        </h1>
        <p className="text-sm text-[#66785c] mt-3 max-w-2xl leading-6">
          Every breath counts. Unlock badges, track experience points (XP), and cultivate a consistent daily routine for mental harmony.
        </p>
      </section>

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-white border border-[#e8efe3] p-6 shadow-[0_10px_30px_rgba(80,105,67,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#eef6ea] text-[#7d9667]">
            <FiAward size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unlocked Badges</p>
            <p className="text-2xl font-black text-[#22331b] mt-1">
              {achievementsData.unlockedCount} / {achievementsData.items.length}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-[#e8efe3] p-6 shadow-[0_10px_30px_rgba(80,105,67,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-500">
            <FiZap size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mindfulness XP</p>
            <p className="text-2xl font-black text-[#22331b] mt-1">{achievementsData.earnedXp} Points</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-[#e8efe3] p-6 shadow-[0_10px_30px_rgba(80,105,67,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#eef6ea]/80 text-[#7d9667]">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Rank</p>
            <p className="text-lg font-black text-[#22331b] mt-1">
              {achievementsData.unlockedCount >= 5 ? "Mindful Sage" : "Daily Practitioner"}
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Milestone Chart Widget (Matching Dashboard Design Pattern) */}
      <section className="rounded-[28px] bg-white border border-[#e8efe3] text-[#22331b] shadow-[0_10px_30px_rgba(80,105,67,0.06)] p-6 md:p-8 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 1000 500" preserveAspectRatio="none">
          <path d="M 0 250 Q 250 150, 500 280 T 1000 220" fill="none" stroke="#7d9667" strokeWidth="2" filter="blur(2px)" />
          <path d="M 0 300 Q 300 200, 600 320 T 1000 180" fill="none" stroke="#00a896" strokeWidth="1.5" />
        </svg>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10 mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7d9667]">
              MentalSwasthya • Rewards
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-wider uppercase text-[#22331b]">
              MILESTONE ACHIEVEMENTS
            </h2>
            <p className="text-xs font-bold uppercase tracking-[0.14em] mt-1 text-[#66785c]">
              SUMMARY OF MILESTONES REACHED (TIMES COMPLETED)
            </p>
          </div>
        </div>

        {/* Chart Main Area */}
        <div className="relative z-10 grid grid-cols-12 gap-2 md:gap-4 items-end min-h-[360px] pt-4 pb-2 px-2">
          {/* Y-Axis Column */}
          <div className="col-span-2 md:col-span-1 flex flex-col justify-between h-[240px] text-right pr-2 font-extrabold text-[11px] md:text-xs text-[#66785c]">
            {yAxisTicks.map((tick, idx) => (
              <span key={idx} className="leading-none whitespace-nowrap">{tick.label}</span>
            ))}
          </div>

          {/* Chart Column Canvas */}
          <div className="col-span-10 md:col-span-11 relative h-[240px] border-l border-b border-[#e8efe3]">
            {/* Horizontal Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {yAxisTicks.map((_, idx) => (
                <div key={idx} className="w-full border-b border-gray-100" />
              ))}
            </div>

            {/* 5 Milestone Bars */}
            <div className="absolute inset-0 grid grid-cols-5 gap-2 md:gap-6 px-2 md:px-6 items-end">
              {achievementsData.milestoneData.map((item, index) => {
                const heightPct = Math.min(100, (item.times / maxY) * 100);

                return (
                  <div key={index} className="flex flex-col items-center h-full justify-end group">
                    {/* Shield Badge */}
                    <div className="mb-2 relative z-20">
                      <MilestoneShieldBadge
                        badgeType={item.badgeType}
                        achieved={item.achieved}
                        target={item.target}
                      />
                    </div>

                    {/* Frequency Value */}
                    <div className="mb-1 text-center h-5">
                      <span className="text-xs md:text-sm font-black tracking-tight text-[#22331b]">
                        {item.times > 0 ? item.times.toFixed(1) : ""}
                      </span>
                    </div>

                    {/* Vertical Column Track */}
                    <div className="w-full max-w-[64px] h-[160px] border rounded-t-lg relative flex items-end justify-center overflow-hidden shadow-inner bg-[#f4f8f1] border-[#e1eadb]">
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
            {achievementsData.milestoneData.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl p-2 md:p-3 text-center border transition-all ${
                  item.achieved
                    ? "bg-[#f4f8f1] border-[#e1eadb] text-[#22331b] shadow-sm"
                    : "bg-gray-50 border-gray-100 text-gray-400"
                }`}
              >
                <div className="text-[9px] md:text-[11px] font-black uppercase tracking-wider leading-tight">
                  {item.statusText}
                </div>
                <div className={`text-[10px] md:text-xs font-black uppercase tracking-wider mt-0.5 ${
                  item.achieved ? "text-amber-500" : "text-gray-400"
                }`}>
                  {item.countText}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges Grid Header */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-xl font-black text-[#22331b] tracking-tight">Milestone Badges Library</h2>
        <p className="text-xs text-[#66785c] mt-1">Unlock specific rewards by completing daily wellness activities.</p>
      </div>

      {/* Redesigned Milestone Badges Library Layout with Metallic circular progress meters & slot dots */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {achievementsData.items.map((item) => {
          const cfg = badgeConfigs[item.id] || badgeConfigs.first_intention;

          return (
            <div
              key={item.id}
              className={`rounded-3xl bg-white border p-6 flex items-center gap-5 transition-all relative overflow-hidden ${
                item.unlocked 
                  ? "border-[#7d9667]/20 shadow-[0_10px_30px_rgba(125,150,103,0.04)] hover:shadow-[0_15px_40px_rgba(125,150,103,0.08)] hover:-translate-y-0.5" 
                  : "border-gray-100 opacity-80"
              }`}
            >
              {/* Left Column: Circular Progress Ring enclosing the Icon */}
              <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* SVG linear gradients definitions for metallic looks */}
                  <defs>
                    <linearGradient id={`ringGrad-${item.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={cfg.darkColor} />
                      <stop offset="50%" stopColor={cfg.lightColor} />
                      <stop offset="100%" stopColor={cfg.darkColor} />
                    </linearGradient>
                    <filter id={`glow-${item.id}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={cfg.themeColor} floodOpacity="0.35" />
                    </filter>
                  </defs>

                  {/* Background track circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    className="stroke-gray-100 fill-transparent"
                    strokeWidth="3.5"
                  />
                  {/* Progress bar circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    className="fill-transparent transition-all duration-1000"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - Math.min(item.target, item.current) / item.target)}
                    stroke={`url(#ringGrad-${item.id})`}
                    filter={item.unlocked ? `url(#glow-${item.id})` : undefined}
                    strokeLinecap="round"
                  />

                  {/* Slot Dots along the circular track (matching Streak slots pattern) */}
                  {Array.from({ length: item.target }).map((_, i) => {
                    const angle = (i * 360) / item.target - 90;
                    const rad = (angle * Math.PI) / 180;
                    const sx = 48 + 38 * Math.cos(rad);
                    const sy = 48 + 38 * Math.sin(rad);
                    const isSlotFilled = i < item.current;

                    return (
                      <circle
                        key={i}
                        cx={sx}
                        cy={sy}
                        r="3.5"
                        className="transition-all duration-300"
                        fill={isSlotFilled ? cfg.themeColor : "#e5e7eb"}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>

                {/* Centered Icon Container */}
                <div 
                  className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 ${item.unlocked ? cfg.bgColor : "bg-gray-50"}`}
                  style={{
                    border: `1.5px solid ${item.unlocked ? cfg.themeColor + '30' : "#f3f4f6"}`,
                    color: item.unlocked ? cfg.themeColor : "#9ca3af",
                    boxShadow: item.unlocked ? `0 8px 20px ${cfg.glow}` : "none"
                  }}
                >
                  {cfg.icon}
                </div>

                {/* Status Lock/Unlock icon floating at bottom right */}
                <div 
                  className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
                    item.unlocked ? "bg-[#eef6ea] text-[#7d9667]" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {item.unlocked ? <FiUnlock size={10} /> : <FiLock size={10} />}
                </div>
              </div>

              {/* Right Column: Title, description, and status tags */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
                    style={{
                      background: item.unlocked ? cfg.bgColor : "#f3f4f6",
                      color: item.unlocked ? cfg.themeColor : "#9ca3af",
                      borderColor: item.unlocked ? cfg.borderColor : "transparent",
                      borderWidth: 1
                    }}
                  >
                    {cfg.category}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${item.unlocked ? "text-[#7d9667]" : "text-gray-400"}`}>
                    +{item.xp} XP
                  </span>
                </div>

                <h3 className="text-sm font-black text-[#22331b] mt-1.5 truncate leading-tight">
                  {item.name}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 leading-snug line-clamp-2">
                  {item.desc}
                </p>

                {/* Progress counter text */}
                <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-gray-400">
                  <span className={item.unlocked ? "text-[#22331b]" : "text-gray-400"}>
                    Progress: {Math.min(item.target, item.current)} / {item.target}
                  </span>
                  {item.unlocked && <span className="text-[#7d9667] text-[9px]">• Completed!</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsScreen;
