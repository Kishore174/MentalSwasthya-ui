import React, { useEffect, useState } from "react";
import {
  getUsers,
  getAttendance,
  getLeaves,
    // getShops, 
} from "../Api/dashboard.api";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiFileText,
  FiLogIn,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
 FiShoppingBag,  
  FiMinus,
} from "react-icons/fi";
import { getShops } from "../Api/shops.api";

// ─── Helpers ───────────────────────────────────────────────────────────────
const todayLabel = new Date().toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric", year: "numeric",
});

const Ring = ({ pct, color, size = 56, stroke = 5 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
};

// ─── Metric Card ───────────────────────────────────────────────────────────
const MetricCard = ({ label, value, icon: Icon, accent, sub, loading, index }) => (
  <div
    className="bg-white rounded-3xl px-6 py-5 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <div className="flex items-center justify-between">
      <span
        className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: `${accent}18`, color: accent }}
      >
        <Icon size={18} />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-300">{label}</span>
    </div>

    {loading ? (
      <div className="h-9 w-20 rounded-xl bg-gray-100 animate-pulse" />
    ) : (
      <div className="flex items-end gap-2">
        <span className="text-[2.4rem] font-black text-gray-900 leading-none tracking-tight">{value}</span>
      </div>
    )}

    {sub && !loading && (
      <span className="text-xs text-gray-400">{sub}</span>
    )}
  </div>
);

// ─── Horizontal Bar ────────────────────────────────────────────────────────
const HBar = ({ label, value, total, accent, loading }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-[6px] bg-gray-100 rounded-full overflow-hidden">
        {!loading && (
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: accent }}
          />
        )}
        {loading && <div className="h-full bg-gray-200 animate-pulse rounded-full w-full" />}
      </div>
      <span className="text-sm font-bold text-gray-700 w-10 text-right">
        {loading ? "—" : value}
      </span>
      <span className="text-xs text-gray-300 w-10 text-right">
        {loading ? "" : `${Math.round(pct)}%`}
      </span>
    </div>
  );
};

// ─── Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0, present: 0, absent: 0, pendingLeaves: 0, todayCheckins: 0,  shops: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const fetchData = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [usersRes, attRes, leaveRes,shopsRes] = await Promise.all([
        getUsers(), getAttendance(), getLeaves(),  getShops(),
      ]);
      const users      = usersRes.data?.data || [];
      const attendance = attRes.data?.data?.data || [];
      const leaves     = leaveRes.data?.data || [];
      const shops      = shopsRes.data?.data || shopsRes.data || []; 
      const todayAtt   = attendance.filter((a) => a.check_in?.startsWith(today));
      setStats({
        users:         users.length,
        present:       todayAtt.filter((a) => a.status === "checked_out").length,
        absent:        users.length - todayAtt.length,
        pendingLeaves: leaves.filter((l) => l.status === "pending").length,
        todayCheckins: todayAtt.length,
          shops:         shops.length,
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const rate = stats.users > 0 ? Math.round((stats.todayCheckins / stats.users) * 100) : 0;
  const rateColor = rate >= 75 ? "#10b981" : rate >= 50 ? "#f59e0b" : "#ef4444";

  const metrics = [
    { label: "Total Employees",   value: stats.users,         icon: FiUsers,     accent: "#6366f1", sub: "Registered workforce" },
    { label: "Present Today",     value: stats.present,       icon: FiUserCheck, accent: "#10b981", sub: "Checked out" },
    { label: "Absent Today",      value: stats.absent,        icon: FiUserX,     accent: "#ef4444", sub: "No check-in recorded" },
    { label: "Pending Leaves",    value: stats.pendingLeaves, icon: FiFileText,  accent: "#f59e0b", sub: "Awaiting approval" },
    { label: "Today's Check-ins", value: stats.todayCheckins, icon: FiLogIn,     accent: "#3b82f6", sub: "Active today" },
      { label: "Total Shops",       value: stats.shops,         icon: FiShoppingBag,  accent: "#8b5cf6", sub: "Registered locations" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc]">

      {/* ── Top banner ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Overview</h1>
          <p className="text-xs text-gray-400 mt-0.5">{todayLabel}</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 disabled:opacity-40 transition-colors"
        >
          <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="px-8 py-8 space-y-6 max-w-7xl">

        {/* ── Metric Cards ── */}
<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((m, i) => (
            <MetricCard key={m.label} {...m} loading={loading} index={i} />
          ))}
        </div>

        {/* ── Lower section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Attendance bars — wider */}
          <div className="lg:col-span-3 bg-white rounded-3xl px-7 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Attendance Breakdown</h2>
                <p className="text-xs text-gray-400 mt-0.5">Based on today's records</p>
              </div>
              {!loading && (
                <span
                  className="text-xs font-black px-3 py-1.5 rounded-full"
                  style={{ background: `${rateColor}18`, color: rateColor }}
                >
                  {rate}% rate
                </span>
              )}
            </div>
            <div className="space-y-5">
              <HBar label="Checked In"  value={stats.todayCheckins} total={stats.users} accent="#6366f1" loading={loading} />
              <HBar label="Checked Out" value={stats.present}       total={stats.users} accent="#10b981" loading={loading} />
              <HBar label="Absent"      value={stats.absent}        total={stats.users} accent="#ef4444" loading={loading} />
              <HBar label="On Leave"    value={stats.pendingLeaves} total={stats.users} accent="#f59e0b" loading={loading} />
            </div>
          </div>

          {/* Donut + summary — narrower */}
          <div className="lg:col-span-2 bg-white rounded-3xl px-7 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Today's Pulse</h2>

            {/* Donut ring */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative shrink-0">
                <Ring pct={loading ? 0 : rate} color={rateColor} size={72} stroke={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-gray-800">
                    {loading ? "—" : `${rate}%`}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 leading-none">
                  {loading ? "—" : stats.todayCheckins}
                </p>
                <p className="text-xs text-gray-400 mt-1">of {loading ? "—" : stats.users} employees</p>
                <p className="text-xs mt-1 font-semibold" style={{ color: rateColor }}>
                  {loading ? "" : rate >= 75 ? "Good attendance" : rate >= 50 ? "Moderate" : "Low attendance"}
                </p>
              </div>
            </div>

            {/* Legend rows */}
            <div className="space-y-3 flex-1">
              {[
                { label: "Total workforce",  value: stats.users,         dot: "#6366f1" },
                { label: "Checked in",       value: stats.todayCheckins, dot: "#3b82f6" },
                { label: "Fully present",    value: stats.present,       dot: "#10b981" },
                { label: "Absent",           value: stats.absent,        dot: "#ef4444" },
                { label: "Pending leaves",   value: stats.pendingLeaves, dot: "#f59e0b" },
              ].map(({ label, value, dot }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                  {loading
                    ? <div className="h-3 w-6 bg-gray-100 animate-pulse rounded" />
                    : <span className="text-xs font-black text-gray-800">{value}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;