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
    triangle: "4-7-8 Breathing",
    "4-4-4-4": "Box Breathing",
    box: "Box Breathing",
    "4-4": "4-4 Breathing",
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

  const stats = useMemo(() => {
    const totalSeconds = completedHistory.reduce(
      (total, session) => total + (session.durationSeconds || 0),
      0
    );
    const totalCycles = completedHistory.reduce(
      (total, session) => total + (session.cyclesCompleted || 0),
      0
    );
    const uniqueDays = new Set(
      completedHistory.map((session) => toDateInputValue(session.completedAt || session.createdAt))
    ).size;

    return {
      sessions: completedHistory.length,
      totalTime: formatDuration(totalSeconds),
      cycles: totalCycles,
      activeDays: uniqueDays,
    };
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
            to="/meditation"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7d9667] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#7d9667]/20 hover:bg-[#6f865c] transition-all"
          >
            <FiWind />
            Start Meditation
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Completed Sessions", value: stats.sessions, icon: FiActivity, tint: "bg-[#eef6ea] text-[#7d9667]" },
          { label: "Total Time", value: stats.totalTime, icon: FiClock, tint: "bg-[#eef7fb] text-[#4f8ba3]" },
          { label: "Cycles Completed", value: stats.cycles, icon: FiTrendingUp, tint: "bg-[#f0f7ed] text-[#5f8f4e]" },
          { label: "Active Days", value: stats.activeDays, icon: FiHeart, tint: "bg-[#fff3f0] text-[#ce7a63]" },
        ].map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="rounded-3xl bg-white border border-[#e8efe3] p-5 shadow-[0_10px_30px_rgba(80,105,67,0.06)]">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tint}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-[#22331b] mt-5">{value}</p>
            <p className="text-sm text-[#8a9a80] mt-1">{label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] bg-white border border-[#e8efe3] shadow-[0_10px_30px_rgba(80,105,67,0.06)] overflow-hidden">
        <div className="p-5 md:p-6 border-b border-[#e8efe3] bg-[#fbfdf8] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7d9667]">
              Breathing History
            </p>
            <h2 className="text-xl font-black text-[#22331b] mt-1">Session records</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2 rounded-2xl bg-white border border-[#e1eadb] px-4 py-3 shadow-sm">
              <FiCalendar className="text-[#7d9667]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="bg-transparent outline-none text-sm font-bold text-[#66785c]"
              />
            </label>
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="rounded-2xl bg-[#eef6ea] px-4 py-3 text-sm font-bold text-[#66785c] hover:bg-[#e1eadb] transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={fetchHistory}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7d9667] px-4 py-3 text-sm font-bold text-white hover:bg-[#6f865c] transition-all shadow-lg shadow-[#7d9667]/15"
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
