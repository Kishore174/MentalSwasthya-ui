import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiAward,
  FiShield,
  FiSave,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiMoon
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, updateUserProfile } from "../Api/userApi";

const DAYS_OF_WEEK = [
  { id: "MON", label: "Mon", full: "Monday" },
  { id: "TUE", label: "Tue", full: "Tuesday" },
  { id: "WED", label: "Wed", full: "Wednesday" },
  { id: "THU", label: "Thu", full: "Thursday" },
  { id: "FRI", label: "Fri", full: "Friday" },
  { id: "SAT", label: "Sat", full: "Saturday" },
  { id: "SUN", label: "Sun", full: "Sunday" },
];

const APP_START_OPTIONS = [
  {
    id: "first_login_of_day",
    title: "First Login of the Day",
    desc: "Opens guided breathing automatically on your first visit each morning",
  },
  {
    id: "every_login",
    title: "Every Login",
    desc: "Prompts you to center and breathe on every sign in",
  },
  {
    id: "manual",
    title: "Manual Start Only",
    desc: "Launch sessions whenever you feel ready from the navigation menu",
  },
];

const ProfileScreen = () => {
  const { user: authUser, login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("individual");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [weeklyOff, setWeeklyOff] = useState(["SUN"]);
  const [appStartOption, setAppStartOption] = useState("first_login_of_day");

  // Streak State
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalSessionsCompleted: 0,
    lastSessionDate: null,
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile();
      const profile = res?.data?.data?.user || {};
      const streak = res?.data?.data?.streak || {};

      setName(profile.name || authUser?.name || "");
      setEmail(profile.email || authUser?.email || "");
      setRole(profile.role || authUser?.role || "individual");
      setIsEmailVerified(!!profile.isEmailVerified);
      setWeeklyOff(profile.weeklyOff?.length ? profile.weeklyOff : ["SUN"]);
      setAppStartOption(profile.appStartOption || "first_login_of_day");

      setStreakData({
        currentStreak: streak.currentStreak ?? 0,
        longestStreak: streak.longestStreak ?? 0,
        totalSessionsCompleted: streak.totalSessionsCompleted ?? 0,
        lastSessionDate: streak.lastSessionDate || null,
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      // Fallback to auth context
      if (authUser) {
        setName(authUser.name || "");
        setEmail(authUser.email || "");
        setRole(authUser.role || "individual");
        setWeeklyOff(authUser.weeklyOff?.length ? authUser.weeklyOff : ["SUN"]);
      }
      toast.error("Could not fetch latest profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleToggleDay = (dayId) => {
    setWeeklyOff((prev) => {
      if (prev.includes(dayId)) {
        // Prevent deselecting all days — require at least one weekly off day
        if (prev.length === 1) {
          toast("At least one weekly off day is required for streak protection.", {
            icon: "ℹ️",
          });
          return prev;
        }
        return prev.filter((d) => d !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    if (weeklyOff.length === 0) {
      toast.error("Please select at least one weekly off day.");
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        toast.error("Please enter your current password to set a new password.");
        return;
      }
      if (newPassword.length < 8) {
        toast.error("New password must be at least 8 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        weeklyOff,
        appStartOption,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      };

      const res = await updateUserProfile(payload);
      const updatedUser = res?.data?.data?.user;
      const updatedStreak = res?.data?.data?.streak;

      if (updatedUser) {
        // Update local auth user in context
        const token = localStorage.getItem("token");
        if (token) {
          login(token, { ...authUser, ...updatedUser });
        }
      }

      if (updatedStreak) {
        setStreakData({
          currentStreak: updatedStreak.currentStreak ?? streakData.currentStreak,
          longestStreak: updatedStreak.longestStreak ?? streakData.longestStreak,
          totalSessionsCompleted:
            updatedStreak.totalSessionsCompleted ?? streakData.totalSessionsCompleted,
          lastSessionDate: updatedStreak.lastSessionDate || streakData.lastSessionDate,
        });
      }

      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success(res?.data?.message || "Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update profile.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (str) => {
    if (!str) return "MS";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  const getDayNamesFormatted = () => {
    return weeklyOff
      .map((id) => DAYS_OF_WEEK.find((d) => d.id === id)?.full || id)
      .join(", ");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-[#7d9667]/20 border-t-[#29401f] rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#66785c]">Loading your profile settings...</p>
      </div>
    );
  }

  return (
    <div
      className="max-w-5xl mx-auto px-4 py-8 space-y-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ─── Header Profile Banner ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a331c] via-[#123e24] to-[#1d5232] text-white p-6 md:p-8 shadow-xl border border-[#1b4e2f]">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-48 h-48 rounded-full bg-[#7d9667]/15 pointer-events-none blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          {/* Avatar Icon */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#7d9667] to-[#405933] flex items-center justify-center text-3xl font-extrabold text-white shadow-lg border-2 border-white/20 shrink-0">
            {getInitials(name)}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {name || "Your Profile"}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {role}
              </span>
              {isEmailVerified && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-emerald-200">
                  <FiCheckCircle size={12} /> Verified
                </span>
              )}
            </div>

            <p className="text-sm text-gray-300 flex items-center justify-center md:justify-start gap-1.5">
              <FiMail size={14} className="text-[#8fb39c]" /> {email}
            </p>

            <p className="text-xs text-[#8fb39c] font-medium pt-1">
              Protected weekly off:{" "}
              <span className="text-white font-semibold underline decoration-[#7d9667]">
                {getDayNamesFormatted() || "Sunday"}
              </span>
            </p>
          </div>

          {/* Quick Streak Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md text-xl">
              <FaFire />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white leading-tight">
                {streakData.currentStreak}{" "}
                <span className="text-xs font-semibold text-amber-200 font-normal">
                  {streakData.currentStreak === 1 ? "day" : "days"}
                </span>
              </div>
              <div className="text-[11px] text-gray-300 font-medium">Active Streak</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* ─── Card 1: Weekly Off Day & Streak Protection ─── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#dde8d5] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-2 rounded-xl bg-[#eef6ea] text-[#29401f]">
                  <FiMoon size={18} />
                </span>
                <h2 className="text-lg md:text-xl font-bold text-[#29401f]">
                  Weekly Rest Day & Streak Protection
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#66785c]">
                Select your designated weekly off day(s). On these days, streak reminders are
                automatically paused and your streak continues unbroken into the next day.
              </p>
            </div>
          </div>

          {/* Interactive Day Selection Chips */}
          <div className="space-y-3 mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-[#526543] block">
              Choose Your Weekly Off Day(s)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = weeklyOff.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleDay(day.id)}
                    className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer select-none text-center ${
                      isSelected
                        ? "bg-[#0a331c] text-white border-[#0a331c] shadow-md ring-2 ring-[#7d9667]/40 scale-[1.02]"
                        : "bg-[#f8fbf6] text-[#29401f] border-[#d8e5d2] hover:bg-[#eef6ea] hover:border-[#b8cea9]"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-400 text-[#0a331c] flex items-center justify-center text-[10px] font-black">
                        <FiCheck size={10} />
                      </span>
                    )}
                    <span className="text-sm font-black">{day.id}</span>
                    <span
                      className={`text-[11px] font-medium ${
                        isSelected ? "text-emerald-200" : "text-[#66785c]"
                      }`}
                    >
                      {day.full}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanatory Callout Box */}
          <div className="rounded-2xl bg-gradient-to-r from-[#f4f9f1] to-[#eaf3e5] border border-[#d2e2cb] p-4 md:p-5 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-white text-[#29401f] shadow-sm shrink-0 mt-0.5">
              <FiInfo size={17} />
            </div>
            <div className="space-y-1 text-xs md:text-sm text-[#3b4e31]">
              <p className="font-bold text-[#223519]">How Streak Continuity Works</p>
              <p className="leading-relaxed">
                If your weekly off is set to{" "}
                <strong className="text-[#0a331c] uppercase underline">
                  {weeklyOff.join(" & ") || "SUN"}
                </strong>{" "}
                and your streak on the previous day is <strong>10 days</strong>, your streak will{" "}
                <strong>not break</strong> on your rest day or the following day. It remains at 10
                days and seamlessly progresses to <strong>11 days</strong> once you complete your
                next session.
              </p>
              <p className="text-[11px] text-[#607455] pt-0.5">
                • Streak reminder emails are also silenced on your chosen rest days so you can
                recharge guilt-free.
              </p>
            </div>
          </div>

          {/* Streak Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 mt-6 border-t border-[#edf4e8]">
            <div className="bg-[#f9fbf8] border border-[#e4eedf] rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <FaFire size={18} />
              </div>
              <div>
                <div className="text-xl font-black text-[#29401f] leading-tight">
                  {streakData.currentStreak}
                </div>
                <div className="text-xs text-[#66785c] font-medium">Current Streak</div>
              </div>
            </div>

            <div className="bg-[#f9fbf8] border border-[#e4eedf] rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                <FiAward size={18} />
              </div>
              <div>
                <div className="text-xl font-black text-[#29401f] leading-tight">
                  {streakData.longestStreak}
                </div>
                <div className="text-xs text-[#66785c] font-medium">Longest Streak</div>
              </div>
            </div>

            <div className="bg-[#f9fbf8] border border-[#e4eedf] rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
                <FiCheckCircle size={18} />
              </div>
              <div>
                <div className="text-xl font-black text-[#29401f] leading-tight">
                  {streakData.totalSessionsCompleted}
                </div>
                <div className="text-xs text-[#66785c] font-medium">Total Sessions</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Card 2: Personal Profile Details ─── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#dde8d5] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <span className="p-2 rounded-xl bg-[#eef6ea] text-[#29401f]">
              <FiUser size={18} />
            </span>
            <h2 className="text-lg md:text-xl font-bold text-[#29401f]">
              Personal Information & Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#445638] uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-sm text-[#1e2f17] font-medium outline-none focus:border-[#29401f] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#445638] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f2f4ef] border border-[#e0e5dc] text-sm text-gray-500 font-medium cursor-not-allowed outline-none"
                />
              </div>
              <p className="text-[11px] text-[#7d9070]">Email cannot be changed directly.</p>
            </div>
          </div>

          {/* App Start Mode Options */}
          <div className="space-y-3 pt-4 border-t border-[#edf4e8]">
            <label className="text-xs font-bold text-[#445638] uppercase tracking-wider flex items-center gap-1.5">
              <FiClock size={13} /> Breathing Exercise Launch Mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {APP_START_OPTIONS.map((opt) => {
                const isSelected = appStartOption === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setAppStartOption(opt.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#f4f9f1] border-[#29401f] shadow-sm ring-1 ring-[#29401f]"
                        : "bg-[#f9fbf8] border-[#e0ebd9] hover:bg-[#f1f7ee]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#29401f]">{opt.title}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-[#29401f] bg-[#29401f] text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <FiCheck size={10} />}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#66785c] leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Card 3: Change Password / Security ─── */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#dde8d5] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-[#eef6ea] text-[#29401f]">
              <FiShield size={18} />
            </span>
            <h2 className="text-lg md:text-xl font-bold text-[#29401f]">Change Password</h2>
          </div>
          <p className="text-xs md:text-sm text-[#66785c] mb-6">
            Leave password fields blank if you do not wish to change your password.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#445638] uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-sm text-[#1e2f17] outline-none focus:border-[#29401f] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#29401f]"
                >
                  {showCurrentPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#445638] uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-sm text-[#1e2f17] outline-none focus:border-[#29401f] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#29401f]"
                >
                  {showNewPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#445638] uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-sm text-[#1e2f17] outline-none focus:border-[#29401f] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#29401f]"
                >
                  {showConfirmPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Submit Actions Bar ─── */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-[#0a331c] hover:bg-[#124527] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-[#0a331c]/20 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <FiSave size={16} />
            {saving ? "Saving Changes..." : "Save Profile Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileScreen;
