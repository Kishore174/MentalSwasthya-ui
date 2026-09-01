import React, { useState, useEffect, useRef } from "react";
import { FiGift as Gift, FiCopy as Copy, FiShare2 as Share2, FiCheck as Check, FiZap as Sparkles } from "react-icons/fi";

/**
 * Mental Swasthya — Session Complete
 * Built with sage / mint palette, aura breathing animation on mount,
 * session timeline, segmented referral reward track, and next reward focus card.
 */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600;700;800&display=swap');`;

const STEPS = [
  { key: "intention", label: "Intention", icon: "📄" },
  { key: "breathing", label: "Breathing", icon: "🌬️" },
  { key: "meditation1", label: "Meditation", icon: "🧘" },
  { key: "meditation2", label: "Meditation", icon: "🧘" },
  { key: "affirmation", label: "Affirmation", icon: "✨" },
];

export default function CompletionScreen({
  onDone,
  onReset,
  stepStatus = {
    intention: "Completed",
    breathing: "4 min",
    meditation1: "10 min",
    meditation2: "5 min",
    affirmation: "Completed",
  },
  streakDays = 5,
  referralCount = 2,
  refLink = "mentalswasthya.com/ref/MS-REF2026",
  apiMessage = ""
}) {
  const [localApiMessage, setLocalApiMessage] = useState(apiMessage);
  const [mounted, setMounted] = useState(false);
  const msgTimer = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const flash = (text) => {
    setLocalApiMessage(text);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setLocalApiMessage(""), 2500);
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${refLink}`);
      flash("Link copied — send it to a friend.");
    } catch {
      flash("Couldn't copy automatically — select the link to copy it.");
    }
  };

  const shareReferralLink = async () => {
    const inviteMsg = `Hey, \nI came across the "Mental Swasthya" platform, that offers a variety of wellness tools which truly helps you to find peace of mind. \n\nIt is simple, helpful, and perfect for daily relaxation.\n\nI hope you enjoy using it!\n\nClick the below link to register\nhttps://${refLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mental Swasthya",
          text: inviteMsg,
          url: `https://${refLink}`,
        });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    copyReferralLink();
  };

  const handleShare = () => shareReferralLink();
  const handleDone = () => (onDone ? onDone() : flash("Returning to dashboard…"));
  const handleTomorrow = () => (onReset ? onReset() : flash("See you tomorrow."));

  useEffect(() => {
    const autoCloseTimer = setTimeout(() => {
      if (onDone) onDone();
    }, 5000);
    return () => clearTimeout(autoCloseTimer);
  }, [onDone]);

  const nextRewardAt = referralCount >= 3 ? null : referralCount + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#f0f6f0] via-[#f7fbf7] to-[#eef6f6] p-4 md:p-6 overflow-y-auto">
      <style>{`
        ${FONT_IMPORT}
        .ms-serif { font-family: 'Fraunces', serif; }
        .ms-sans { font-family: 'Work Sans', sans-serif; }

        @keyframes ms-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ms-aura {
          0%   { opacity: 0; transform: scale(0.85); }
          55%  { opacity: 0.9; transform: scale(1.04); }
          100% { opacity: 0.55; transform: scale(1); }
        }
        @keyframes ms-fill {
          from { width: 0%; }
        }
        .ms-mount { animation: ms-rise 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .ms-aura-anim { animation: ms-aura 1.8s cubic-bezier(0.16,1,0.3,1) both; }
        .ms-track-fill { animation: ms-fill 1s cubic-bezier(0.16,1,0.3,1) 0.3s both; }

        @media (prefers-reduced-motion: reduce) {
          .ms-mount, .ms-aura-anim, .ms-track-fill { animation: none !important; }
        }
      `}</style>

      <div
        className={`ms-sans w-full max-w-2xl rounded-[28px] bg-white shadow-[0_20px_60px_-15px_rgba(30,48,25,0.18)] border border-[#e7f0e2] my-auto overflow-hidden ${
          mounted ? "ms-mount" : "opacity-0"
        }`}
      >
        {/* ── Hero ───────────────────────────────────────────── */}
        <div className="relative px-6 md:px-10 pt-10 pb-8 text-center bg-gradient-to-b from-[#f4faf1] to-white">
          <div className="relative mx-auto w-40 h-32">
            {mounted && (
              <div className="ms-aura-anim absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(184,215,205,0.55)_0%,rgba(184,215,205,0)_70%)]" />
            )}
            <svg viewBox="0 0 200 160" className="relative w-full h-full overflow-visible">
              <defs>
                <linearGradient id="ms-leaf-1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c3dec5" />
                  <stop offset="100%" stopColor="#a9cdb7" />
                </linearGradient>
                <linearGradient id="ms-leaf-2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#b9d7cd" />
                  <stop offset="100%" stopColor="#96c0b8" />
                </linearGradient>
              </defs>
              <circle cx="75" cy="50" r="22" fill="url(#ms-leaf-1)" opacity="0.85" />
              <circle cx="125" cy="50" r="22" fill="url(#ms-leaf-1)" opacity="0.85" />
              <circle cx="100" cy="35" r="25" fill="url(#ms-leaf-2)" opacity="0.9" />
              <circle cx="60" cy="70" r="18" fill="#dceade" opacity="0.75" />
              <circle cx="140" cy="70" r="18" fill="#dbe7e7" opacity="0.75" />
              <path
                d="M96 95 C96 90 94 75 92 65 C92 65 80 50 78 48 M98 68 C98 68 112 52 115 50 M104 95 C104 90 106 75 108 65"
                stroke="#5c6f52" strokeWidth="2" strokeLinecap="round" fill="none"
              />
              <path d="M96 95 L96 110 L104 110 L104 95 Z" fill="#5c6f52" />
              <circle cx="100" cy="95" r="18" stroke="#9db287" strokeWidth="1" fill="#ffffff" strokeDasharray="3 3" />
              <circle cx="100" cy="85" r="4.5" fill="#4b5563" />
              <path d="M100 89.5 L100 99" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M88 103 C92 98 108 98 112 103" stroke="#4b5563" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M94 92 C90 95 90 101 94 101 M106 92 C110 95 110 101 106 101" stroke="#4b5563" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          <h1 className="ms-serif text-[2.3rem] leading-none font-medium text-[#1e3019] mt-4">
            Well done.
          </h1>
          <p className="text-[13.5px] text-[#5c6f52] mt-3 max-w-sm mx-auto leading-relaxed">
            You showed up for your mind today. Take a moment — notice the stillness you just made room for.
          </p>
        </div>

        <div className="px-6 md:px-10 pb-8">
          {/* ── Session timeline ── */}
          <div className="rounded-2xl bg-[#f7faf5] border border-[#e6efe0] px-4 py-5 -mt-1">
            <div className="relative grid grid-cols-5 gap-1">
              <div className="absolute left-[10%] right-[10%] top-[18px] h-px bg-[#cfe0c6]" />
              {STEPS.map((s) => (
                <div key={s.key} className="relative flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-full bg-white border border-[#cfe0c6] flex items-center justify-center text-sm shadow-sm">
                    {s.icon}
                  </div>
                  <span className="text-[9.5px] font-semibold text-[#3a4d31] mt-2 leading-tight">
                    {s.label}
                  </span>
                  <span className="text-[9px] text-[#7d9667] mt-0.5">{stepStatus[s.key]}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-5 pt-4 border-t border-[#e6efe0]">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-semibold text-[#8a5a1f]">{streakDays}-day streak</span>
              <span className="text-xs text-[#8a8f7f]">— your longest run yet</span>
            </div>
          </div>

          {/* ── Share nudge ───────────────────────────────── */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full mt-4 rounded-xl bg-[#f7faf5] hover:bg-[#eef4e8] transition-colors px-4 py-3 flex items-center justify-between border border-[#e6efe0] text-left"
          >
            <span className="text-[12.5px] text-[#5c6f52]">
              Know someone who could use five calm minutes?
            </span>
            <span className="text-[12.5px] font-semibold text-[#7d9667] flex items-center gap-1 shrink-0 ml-3">
              Share <Share2 size={13} />
            </span>
          </button>

          {/* ── Referral program ─────────────────────────── */}
          <div className="rounded-2xl border border-[#e1ebd9] mt-4 p-5 md:p-6">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#f0f6ea] flex items-center justify-center">
                <Gift size={14} className="text-[#7d9667]" />
              </span>
              <h3 className="ms-serif text-[1.2rem] text-[#1e3019]">Give a month, get a month</h3>
            </div>
            <p className="text-[12.5px] text-[#5c6f52] leading-relaxed mt-2">
              Every friend who joins with your link gets a free month of Premium — and so do you, up to three months.
            </p>

            {/* Reward track */}
            <div className="mt-5">
              <div className="relative h-1.5 rounded-full bg-[#e6efe0] overflow-hidden">
                <div
                  className="ms-track-fill absolute inset-y-0 left-0 rounded-full bg-[#7d9667]"
                  style={{ width: `${(referralCount / 3) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex flex-col items-center gap-1" style={{ width: 60 }}>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        n <= referralCount
                          ? "bg-[#7d9667] text-white"
                          : "bg-white border border-[#cfe0c6] text-[#9db287]"
                      }`}
                    >
                      {n <= referralCount ? <Check size={11} /> : n}
                    </span>
                    <span className="text-[9.5px] text-[#8a8f7f]">Month {n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next reward focus card */}
            {nextRewardAt ? (
              <div className="mt-5 rounded-xl bg-[#f7faf5] border border-[#e6efe0] p-4">
                <p className="text-[12px] font-semibold text-[#22331b]">
                  Invite one more friend to unlock month {nextRewardAt}.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3">
                  <input
                    type="text"
                    readOnly
                    value={refLink}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-lg bg-white border border-[#dbe7d3] px-3 py-2 text-xs font-medium text-[#3a4d31] outline-none select-all"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={copyReferralLink}
                      className="px-3.5 py-2 rounded-lg bg-[#1e382b] hover:bg-[#14281e] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Copy size={13} /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={shareReferralLink}
                      className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#f2f6ee] text-[#3a4d31] font-semibold text-xs transition-colors border border-[#dbe7d3] flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Share2 size={13} /> Share
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[#f7faf5] border border-[#e6efe0] p-4 flex items-center gap-2.5">
                <Sparkles size={16} className="text-[#7d9667] shrink-0" />
                <p className="text-[12.5px] font-semibold text-[#22331b]">
                  All three months unlocked — Premium's on us through the year.
                </p>
              </div>
            )}
          </div>

          {(localApiMessage || apiMessage) && (
            <p className="text-xs text-[#7d9667] text-center mt-4">{localApiMessage || apiMessage}</p>
          )}

          {/* ── Actions ───────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 rounded-xl bg-[#7d9667] hover:bg-[#6f865c] text-white px-5 py-3 text-sm font-semibold shadow-sm transition-colors"
            >
              Return to dashboard
            </button>
            <button
              type="button"
              onClick={handleTomorrow}
              className="flex-1 rounded-xl border border-[#e1ebd9] hover:bg-[#f7faf5] text-[#5c6f52] px-5 py-3 text-sm font-semibold transition-colors"
            >
              I'll be back tomorrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
