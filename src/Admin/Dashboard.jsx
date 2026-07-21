import React, { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiCalendar,
  FiClock,
  FiHeart,
  FiRefreshCcw,
  FiTrendingUp,
  FiWind,
} from "react-icons/fi";
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
    } catch (e) {}

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
    } catch (e) {}

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
