import { useLifetimeXp, getXpRing } from "../utils/xp";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiShield,
  FiSave,
  FiCheckCircle,
  FiPhone,
  FiBriefcase,
  FiCamera,
  FiTrash2,
  FiAlertTriangle,
  FiX
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, getUserStreak, updateUserProfile, uploadProfilePhoto, deleteAccount } from "../Api/userApi";
import { axiosInstance } from "../Api/config";

const DAYS_OF_WEEK = [
  { id: "MON", label: "Mon", full: "Monday" },
  { id: "TUE", label: "Tue", full: "Tuesday" },
  { id: "WED", label: "Wed", full: "Wednesday" },
  { id: "THU", label: "Thu", full: "Thursday" },
  { id: "FRI", label: "Fri", full: "Friday" },
  { id: "SAT", label: "Sat", full: "Saturday" },
  { id: "SUN", label: "Sun", full: "Sunday" },
];

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// Relative photo paths from the API are served from the API origin
const resolvePhotoUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  const origin = (axiosInstance.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
};

// Shrink the chosen image to a 256px square JPEG so it stays small enough to keep with the account
const resizeImage = (file, size = 256) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        (blob) => (blob ? resolve({ blob, dataUrl: canvas.toDataURL("image/jpeg", 0.85) }) : reject(new Error("resize failed"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("unreadable image"));
    };
    img.src = objectUrl;
  });

const ProfileScreen = () => {
  const { user: authUser, login, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("individual");
  const [mobile, setMobile] = useState("");
  const [designation, setDesignation] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInputRef = useRef(null);

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [weeklyOff, setWeeklyOff] = useState(["SUN"]);

  // Lifetime XP drives the avatar ring colour (1000 Bronze … 5000 Diamond)
  const lifetimeXp = useLifetimeXp();
  const xpRing = getXpRing(lifetimeXp);

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
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const closePasswordDialog = () => {
    setPasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
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
    setPasswordSaving(true);
    try {
      const res = await updateUserProfile({ currentPassword, newPassword });
      toast.success(res?.data?.message || "Password changed successfully!");
      closePasswordDialog();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not change your password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Retry once so a brief network hiccup or cold server doesn't show an error.
      let res;
      try {
        res = await getUserProfile();
      } catch (firstErr) {
        if (firstErr?.response && firstErr.response.status < 500) throw firstErr;
        await new Promise((r) => setTimeout(r, 800));
        res = await getUserProfile();
      }
      const body = res?.data?.data ?? res?.data ?? {};
      const profile = body.user || body.profile || (body.email || body.name ? body : {});
      let streak = body.streak || {};
      if (!body.streak) {
        try {
          const sr = await getUserStreak();
          streak = sr?.data?.data?.streak || sr?.data?.data || sr?.data || {};
        } catch (e) { /* streak is optional */ }
      }

      setName(profile.name || authUser?.name || "");
      setEmail(profile.email || authUser?.email || "");
      setRole(profile.role || authUser?.role || "individual");
      setMobile(profile.mobile || profile.phone || authUser?.mobile || "");
      setDesignation(profile.designation || authUser?.designation || "");
      setPhoto(resolvePhotoUrl(profile.photoUrl || profile.avatar || profile.profileImage || authUser?.avatar || ""));
      setIsEmailVerified(!!profile.isEmailVerified);
      setWeeklyOff(profile.weeklyOff?.length ? profile.weeklyOff : ["SUN"]);

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
        setMobile(authUser.mobile || "");
        setDesignation(authUser.designation || "");
        setPhoto(resolvePhotoUrl(authUser.avatar || ""));
        setWeeklyOff(authUser.weeklyOff?.length ? authUser.weeklyOff : ["SUN"]);
      }
      // The profile endpoint isn't available on the server yet (404): show the signed-in user's
      // saved details instead of an error.
      if (err?.response?.status === 404) return;
      const reason = err?.response?.data?.message || (err?.response ? `error ${err.response.status}` : "network problem, check your connection");
      toast.error(`Could not fetch latest profile data (${reason}).`);
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

    const mobileDigits = mobile.replace(/[\s-]/g, "").replace(/^\+91/, "").replace(/^0/, "");
    if (mobile.trim() && !/^[6-9]\d{9}$/.test(mobileDigits)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        mobile: mobile.trim(),
        designation: designation.trim(),
        weeklyOff,
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

      toast.success(res?.data?.message || "Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update profile.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const syncAuthUser = (patch) => {
    const token = localStorage.getItem("token");
    if (token) login(token, { ...authUser, ...patch });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Photo is too large. Please choose one under 5 MB.");
      return;
    }

    setPhotoBusy(true);
    try {
      const { blob, dataUrl } = await resizeImage(file);
      let finalUrl = dataUrl;
      try {
        const res = await uploadProfilePhoto(new File([blob], "profile.jpg", { type: "image/jpeg" }));
        const serverUrl = res?.data?.data?.photoUrl || res?.data?.data?.user?.photoUrl || res?.data?.data?.avatar;
        if (serverUrl) finalUrl = resolvePhotoUrl(serverUrl);
        toast.success("Profile photo updated!");
      } catch (apiErr) {
        console.warn("Photo upload to server failed, keeping it on this device:", apiErr);
        toast.success("Photo saved on this device. It could not be uploaded to your account.");
      }
      setPhoto(finalUrl);
      syncAuthUser({ avatar: finalUrl });
    } catch (err) {
      console.error(err);
      toast.error("Could not read that image. Please try another one.");
    } finally {
      setPhotoBusy(false);
    }
  };

  const handlePhotoRemove = () => {
    setPhoto("");
    syncAuthUser({ avatar: "" });
    toast.success("Profile photo removed.");
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteText("");
    setDeletePassword("");
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteText.trim().toUpperCase() !== "DELETE") {
      toast.error('Type DELETE to confirm.');
      return;
    }
    if (!deletePassword) {
      toast.error("Enter your password to confirm.");
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      toast.success("Your account has been deleted.");
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Failed to delete account:", err);
      toast.error(err?.response?.data?.message || "Could not delete your account. Please check your password and try again.");
      setDeleting(false);
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
          <div className="relative shrink-0">
            <div
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#7d9667] to-[#405933] flex items-center justify-center text-3xl font-extrabold text-white shadow-lg border-2 border-white/20 overflow-hidden"
              style={xpRing ? { boxShadow: `0 0 0 5px ${xpRing.color}, 0 8px 24px rgba(0,0,0,0.25)` } : undefined}
              title={xpRing ? `${xpRing.name} ring · ${lifetimeXp} XP` : `${lifetimeXp} XP · reach 1000 XP for the Bronze ring`}
            >
              {photo ? <img src={photo} alt={name || "Profile photo"} className="w-full h-full object-cover" /> : getInitials(name)}
            </div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={photoBusy}
              aria-label="Change profile photo"
              title="Change profile photo"
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white text-[#29401f] shadow-lg border border-[#d8e5d2] flex items-center justify-center hover:bg-[#eef6ea] disabled:opacity-60 cursor-pointer"
            >
              {photoBusy ? <span className="w-4 h-4 border-2 border-[#29401f]/30 border-t-[#29401f] rounded-full animate-spin" /> : <FiCamera size={16} />}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
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

            {designation && (
              <p className="text-sm text-emerald-100 flex items-center justify-center md:justify-start gap-1.5">
                <FiBriefcase size={14} className="text-[#8fb39c]" /> {designation}
              </p>
            )}
            <p className="text-sm text-gray-300 flex items-center justify-center md:justify-start gap-1.5">
              <FiMail size={14} className="text-[#8fb39c]" /> {email}
            </p>
            {mobile && (
              <p className="text-sm text-gray-300 flex items-center justify-center md:justify-start gap-1.5">
                <FiPhone size={14} className="text-[#8fb39c]" /> {mobile}
              </p>
            )}

            <p className="text-xs text-[#8fb39c] font-medium pt-1">
              Protected weekly off:{" "}
              <span className="text-white font-semibold underline decoration-[#7d9667]">
                {getDayNamesFormatted() || "Sunday"}
              </span>
            </p>

            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <FiLock size={13} /> Change password
            </button>
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

            <div className="space-y-1.5">
              <label htmlFor="profile-mobile" className="text-xs font-bold text-[#445638] uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  id="profile-mobile"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={16}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^\d+\s-]/g, ""))}
                  placeholder="e.g. 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-sm text-[#1e2f17] font-medium outline-none focus:border-[#29401f] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-designation" className="text-xs font-bold text-[#445638] uppercase tracking-wider">
                Designation
              </label>
              <div className="relative">
                <FiBriefcase className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  id="profile-designation"
                  type="text"
                  maxLength={60}
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-sm text-[#1e2f17] font-medium outline-none focus:border-[#29401f] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-bold text-[#445638] uppercase tracking-wider block">Profile Photo</span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoBusy}
                  className="min-h-[44px] px-4 rounded-xl border border-[#d8e5d2] bg-[#f8fbf6] hover:bg-[#eef6ea] text-xs font-bold text-[#29401f] flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  <FiCamera size={15} /> {photo ? "Change photo" : "Upload photo"}
                </button>
                {photo && (
                  <button
                    type="button"
                    onClick={handlePhotoRemove}
                    className="min-h-[44px] px-4 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
                <span className="text-[11px] text-[#7d9070]">JPG, PNG or WebP, up to 5 MB. Applied right away.</span>
              </div>
            </div>
          </div>

          {/* Weekly off day chooser */}
          <div className="space-y-3 pt-4 border-t border-[#edf4e8]">
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

      {/* ─── Danger Zone: Delete Account ─── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-red-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 rounded-xl bg-red-50 text-red-600">
            <FiAlertTriangle size={18} />
          </span>
          <h2 className="text-lg md:text-xl font-bold text-red-700">Delete Account</h2>
        </div>
        <p className="text-xs md:text-sm text-[#66785c] mb-5">
          Permanently delete your Mental Swasthya account and all associated data, including your streaks,
          achievements and subscription. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="min-h-[44px] px-6 rounded-2xl border border-red-300 text-red-600 hover:bg-red-50 font-bold text-sm flex items-center gap-2 cursor-pointer"
        >
          <FiTrash2 size={16} /> Delete my account
        </button>
      </div>

      {passwordOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          onKeyDown={(e) => e.key === "Escape" && closePasswordDialog()}
          className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center bg-black/50 p-3"
        >
          <form onSubmit={handleChangePassword} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 id="change-password-title" className="text-lg font-black text-[#29401f] flex items-center gap-2">
                <FiShield size={18} /> Change password
              </h3>
              <button type="button" onClick={closePasswordDialog} aria-label="Close" className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <FiX size={20} />
              </button>
            </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#445638] uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-base sm:text-sm outline-none focus:border-[#7d9667]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label="Show or hide password"
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#445638] uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-base sm:text-sm outline-none focus:border-[#7d9667]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label="Show or hide password"
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#445638] uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-base sm:text-sm outline-none focus:border-[#7d9667]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Show or hide password"
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closePasswordDialog} disabled={passwordSaving} className="min-h-[44px] px-5 rounded-xl border border-[#dbe7d3] text-sm font-bold text-[#3a4d31] cursor-pointer">
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordSaving}
                className="min-h-[44px] px-5 rounded-xl bg-[#0a331c] hover:bg-[#124527] disabled:opacity-50 text-sm font-bold text-white cursor-pointer"
              >
                {passwordSaving ? "Saving..." : "Change password"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onKeyDown={(e) => e.key === "Escape" && closeDelete()}
          className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center bg-black/50 p-3"
        >
          <form onSubmit={handleDeleteAccount} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 id="delete-account-title" className="text-lg font-black text-red-700">Delete your account?</h3>
              <button type="button" onClick={closeDelete} aria-label="Close" className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <FiX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 leading-6">
              This permanently removes your account and data. To confirm, type <strong>DELETE</strong> and enter your password.
            </p>
            <input
              type="text"
              autoFocus
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="Type DELETE"
              aria-label="Type DELETE to confirm"
              className="w-full px-4 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-base sm:text-sm outline-none focus:border-red-400"
            />
            <input
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
              aria-label="Your password"
              className="w-full px-4 py-3 rounded-xl bg-[#f8fbf6] border border-[#d8e5d2] text-base sm:text-sm outline-none focus:border-red-400"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeDelete} disabled={deleting} className="min-h-[44px] px-5 rounded-xl border border-[#dbe7d3] text-sm font-bold text-[#3a4d31] cursor-pointer">
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleting || deleteText.trim().toUpperCase() !== "DELETE" || !deletePassword}
                className="min-h-[44px] px-5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-sm font-bold text-white cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
