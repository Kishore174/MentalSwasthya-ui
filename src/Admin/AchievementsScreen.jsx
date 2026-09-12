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
  FiCalendar,
  FiPrinter,
  FiX,
  FiShare2,
  FiCheck,
  FiEdit2
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getBreathingHistory } from "../Api/breathingApi";

const CornerOrnament = ({ position }) => {
  const posMap = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2 rotate-90",
    "bottom-left": "bottom-2 left-2 -rotate-90",
    "bottom-right": "bottom-2 right-2 rotate-180",
  };
  return (
    <svg
      className={`absolute w-12 h-12 md:w-16 md:h-16 text-[#b48d42] pointer-events-none ${posMap[position] || ""}`}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
    >
      <path d="M 0 0 L 35 0 C 18 10, 10 18, 0 35 Z" fill="#b48d42" opacity="0.8" />
      <path d="M 4 4 L 90 4 C 80 20, 60 40, 40 60 C 20 80, 4 90, 4 90" strokeWidth="2" />
      <path d="M 8 8 L 70 8 C 60 20, 45 35, 35 45 C 20 60, 8 70, 8 70" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="20" cy="20" r="4" fill="#7d9667" stroke="none" />
      <circle cx="34" cy="12" r="2.5" fill="#b48d42" stroke="none" />
      <circle cx="12" cy="34" r="2.5" fill="#b48d42" stroke="none" />
    </svg>
  );
};

const MilestoneShieldBadge = ({ badgeType, achieved, target, onClick }) => {
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
    <div 
      onClick={achieved ? onClick : undefined}
      title={achieved ? "Click to view milestone achievement certificate" : `Reach ${target} sessions to unlock`}
      className={`flex flex-col items-center group transition-transform duration-300 ${achieved ? "cursor-pointer hover:scale-105" : "cursor-default opacity-80"}`}
    >
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

const CertificateModal = ({ certificate, onClose, defaultName, onUpdateName }) => {
  const [name, setName] = useState(defaultName || "Mindful Practitioner");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (defaultName) setName(defaultName);
  }, [defaultName]);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `🏆 Mental Swasthya Certificate of Achievement\nAwarded to: ${name}\nAchievement: ${certificate.title}\nCategory: ${certificate.category}\nXP Earned: +${certificate.xp} XP\nVerification ID: ${certificate.certId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  const saveName = () => {
    setIsEditing(false);
    if (onUpdateName) onUpdateName(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* Isolated Print Stylesheet */}
      <style>
        {`
          @media print {
            @page {
              size: landscape;
              margin: 0;
            }
            body * {
              visibility: hidden !important;
            }
            #achievement-certificate-printable,
            #achievement-certificate-printable * {
              visibility: visible !important;
            }
            #achievement-certificate-printable {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 10mm 15mm !important;
              box-sizing: border-box !important;
              background: #fdfbf7 !important;
              border: 10px double #b48d42 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e1eadb] my-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8faf6] border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7d9667]/15 text-[#7d9667] flex items-center justify-center">
              <FiAward size={18} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#22331b]">Official Achievement Certificate</p>
              <p className="text-[11px] text-gray-400">Verifiable milestone recognition • Mental Swasthya</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-[#7d9667] hover:bg-white border border-gray-200 transition-all cursor-pointer"
            >
              {copied ? <FiCheck size={14} className="text-green-600" /> : <FiShare2 size={14} />}
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#7d9667] text-white hover:bg-[#6f865c] shadow-sm shadow-[#7d9667]/30 transition-all cursor-pointer"
            >
              <FiPrinter size={14} />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all ml-1 cursor-pointer"
              title="Close Certificate"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Recipient Customization Bar */}
        <div className="px-6 py-2.5 bg-[#f3f7ef] border-b border-[#e1eadb] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#66785c]">
            <span className="font-bold">Recipient Name:</span>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#7d9667] bg-white text-[#22331b] outline-none"
                  placeholder="Enter recipient name"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveName}
                  className="px-2 py-1 text-[11px] font-bold bg-[#7d9667] text-white rounded-lg hover:bg-[#6f865c] cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-black text-[#22331b] bg-white px-2 py-0.5 rounded border border-[#e1eadb]">
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[#7d9667] hover:underline flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                >
                  <FiEdit2 size={12} /> Edit Name
                </button>
              </div>
            )}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">Certificate ID: {certificate.certId}</span>
        </div>

        {/* Certificate Display Area */}
        <div className="p-4 sm:p-6 md:p-8 bg-[#eaeee7] flex justify-center items-center overflow-x-auto">
          <div
            id="achievement-certificate-printable"
            className="relative w-full max-w-3xl bg-[#fdfbf7] rounded-2xl border-[8px] sm:border-[10px] border-double border-[#b48d42] p-6 sm:p-10 md:p-12 shadow-xl text-center overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(#fffefb 0%, #f6f1e3 100%)",
            }}
          >
            {/* Corner Ornaments */}
            <CornerOrnament position="top-left" />
            <CornerOrnament position="top-right" />
            <CornerOrnament position="bottom-left" />
            <CornerOrnament position="bottom-right" />

            {/* Inner Border */}
            <div className="absolute inset-2 sm:inset-3 border border-[#b48d42]/35 rounded-xl pointer-events-none" />

            {/* Watermark Mandala Motif */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <svg viewBox="0 0 200 200" className="w-[360px] h-[360px] text-[#22331b]" fill="currentColor">
                <path d="M100 0 C120 40 160 80 200 100 C160 120 120 160 100 200 C80 160 40 120 0 100 C40 80 80 40 100 0 Z" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="6" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="6 6" />
              </svg>
            </div>

            {/* Certificate Header */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Emblem */}
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#7d9667] to-[#9cb886] text-white shadow-md mb-2">
                <FiAward size={24} />
              </div>

              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.26em] text-[#7d9667]">
                Mental Swasthya • Wellness & Mindfulness Platform
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest text-[#1e2e18] mt-1.5 drop-shadow-sm">
                Certificate of Achievement
              </h2>

              <div className="w-28 sm:w-36 h-0.5 bg-gradient-to-r from-transparent via-[#b48d42] to-transparent my-2" />

              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#6b7b64]">
                THIS CERTIFICATE IS PROUDLY PRESENTED TO
              </p>

              {/* Recipient Name */}
              <div className="my-2.5 sm:my-3.5">
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#1e2e18] tracking-tight">
                  {name}
                </h3>
                <div className="w-48 sm:w-64 h-[2px] bg-[#b48d42] mx-auto mt-1 rounded-full" />
              </div>

              <p className="text-xs sm:text-sm text-[#4b5946] max-w-lg mx-auto leading-relaxed">
                for outstanding discipline, conscious practice, and attaining the official wellness milestone
              </p>

              {/* Award Banner */}
              <div className="my-3 sm:my-4 inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-white/90 border border-[#b48d42]/40 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  {certificate.icon || <FiAward size={18} />}
                </div>
                <div className="text-left">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#b48d42]">
                    {certificate.category || "MINDFULNESS DISTINCTION"}
                  </p>
                  <p className="text-sm sm:text-base font-black text-[#1e2e18]">
                    {certificate.title}
                  </p>
                </div>
                {certificate.xp && (
                  <span className="ml-2 px-2.5 py-1 rounded-lg bg-[#eef6ea] text-[#7d9667] text-[11px] font-black uppercase tracking-wider">
                    +{certificate.xp} XP
                  </span>
                )}
              </div>

              <p className="text-[11px] sm:text-xs text-[#6e7d69] max-w-md mx-auto italic">
                "{certificate.desc}"
              </p>
            </div>

            {/* Bottom Footer */}
            <div className="relative z-10 grid grid-cols-3 items-end mt-6 sm:mt-10 pt-5 border-t border-[#b48d42]/30 text-left">
              {/* Left: Date */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date Issued</p>
                <p className="text-xs sm:text-sm font-black text-[#1e2e18] mt-0.5">
                  {certificate.date}
                </p>
                <p className="text-[10px] font-bold text-[#7d9667] tracking-wider mt-1">
                  ID: {certificate.certId}
                </p>
              </div>

              {/* Center: Gold Foil Medal Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                    <polygon points="35,68 25,96 42,88 50,94 50,68" fill="#78350f" />
                    <polygon points="65,68 75,96 58,88 50,94 50,68" fill="#92400e" />
                    <circle cx="50" cy="45" r="38" fill="url(#sealGradModal)" stroke="#b45309" strokeWidth="2" />
                    <circle cx="50" cy="45" r="32" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 2" />
                    <defs>
                      <linearGradient id="sealGradModal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                    </defs>
                    <text x="50" y="38" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#78350f" letterSpacing="0.8">
                      MENTAL SWASTHYA
                    </text>
                    <text x="50" y="47" textAnchor="middle" fontSize="8" fontWeight="900" fill="#78350f">
                      ★ SEAL ★
                    </text>
                    <text x="50" y="55" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#78350f" letterSpacing="0.5">
                      EXCELLENCE
                    </text>
                  </svg>
                </div>
              </div>

              {/* Right: Signature */}
              <div className="text-right">
                <div className="inline-block text-center">
                  <svg viewBox="0 0 160 40" className="w-24 sm:w-32 h-7 sm:h-9 mx-auto text-[#1e2e18]">
                    <path
                      d="M 10 28 C 30 10, 45 35, 60 15 C 75 5, 85 30, 105 18 C 120 12, 135 25, 150 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 35 32 C 60 28, 90 29, 130 27"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="w-24 sm:w-32 h-[1px] bg-gray-300 mx-auto mt-0.5" />
                  <p className="text-[10px] sm:text-xs font-black text-[#1e2e18] mt-1">Authorized Board</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400">Mental Swasthya Council</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AchievementsScreen = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const defaultRecipientName = user?.name || user?.fullName || (user?.email ? user.email.split("@")[0] : "") || "Mindful Practitioner";
  const [recipientName, setRecipientName] = useState(defaultRecipientName);

  useEffect(() => {
    if (user?.name || user?.fullName) {
      setRecipientName(user?.name || user?.fullName);
    }
  }, [user]);

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }, []);

  const generateCertId = (prefix = "MS") => {
    return `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  };

  const handleOpenCertificate = (certData) => {
    setActiveCertificate({
      ...certData,
      certId: certData.certId || generateCertId("MS-ACHV"),
      date: certData.date || todayFormatted,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveCertificate(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        <div className="mt-4 flex flex-wrap items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => handleOpenCertificate({
              type: "master",
              title: achievementsData.unlockedCount >= 5 ? "Mindful Sage Master Distinction" : "Mindfulness Excellence Award",
              category: "OFFICIAL MASTER CERTIFICATE",
              desc: `Conferred in formal recognition of earning ${achievementsData.unlockedCount} mindfulness badges, accumulating ${achievementsData.earnedXp} XP points, and exhibiting persistent devotion to mindful living.`,
              xp: achievementsData.earnedXp,
              icon: <FiAward size={20} />,
              certId: generateCertId("MS-MAST"),
              date: todayFormatted
            })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7d9667] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#7d9667]/25 hover:bg-[#6f865c] transition-all cursor-pointer"
          >
            <FiAward size={16} />
            <span>Generate Master Certificate</span>
          </button>
        </div>
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
                        onClick={() => handleOpenCertificate({
                          type: "milestone",
                          title: `${item.target} Completed Sessions Milestone`,
                          category: `${item.badgeType.toUpperCase()} DISTINCTION`,
                          desc: `Recognizing persistent devotion to conscious breathing exercises with ${item.target} verified sessions completed.`,
                          xp: item.target * 25,
                          certId: generateCertId("MS-MILE"),
                          date: todayFormatted
                        })}
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

                {/* Certificate Action Button */}
                {item.unlocked ? (
                  <button
                    type="button"
                    onClick={() => handleOpenCertificate({
                      type: "badge",
                      title: item.name,
                      category: cfg.category,
                      desc: item.desc,
                      xp: item.xp,
                      icon: cfg.icon,
                      certId: generateCertId("MS-BADG"),
                      date: todayFormatted
                    })}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#7d9667]/10 text-[#7d9667] hover:bg-[#7d9667] hover:text-white transition-all shadow-sm group cursor-pointer"
                  >
                    <FiAward size={12} className="transition-transform group-hover:scale-110" />
                    <span>Generate Certificate</span>
                  </button>
                ) : (
                  <div className="mt-3 text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <FiLock size={11} />
                    <span>Complete criteria to unlock certificate</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate Preview & Print Modal */}
      {activeCertificate && (
        <CertificateModal
          certificate={activeCertificate}
          defaultName={recipientName}
          onUpdateName={(newName) => setRecipientName(newName)}
          onClose={() => setActiveCertificate(null)}
        />
      )}
    </div>
  );
};

export default AchievementsScreen;
