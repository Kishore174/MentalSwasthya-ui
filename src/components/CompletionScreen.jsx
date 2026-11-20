import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  refLink = "mentalswasthya.com",
  apiMessage = ""
}) {
  const navigate = useNavigate();
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
    setPausedAutoClose(true);
    const inviteMsg = `Hey,\nI came across the "Mental Swasthya" platform, which offers wellness tools that truly help you find peace of mind.\nRegister using the link below and get 14 days premium subscription free!\n\nhttps://mentalswasthya.com/login`;

    if (navigator.share) {
      try {
        // The link is already part of the message text; passing `url` too would duplicate it.
        await navigator.share({ title: "Mental Swasthya", text: inviteMsg });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return; // user closed the share sheet
        /* share unsupported / failed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(inviteMsg);
      flash("Invite message copied — paste it to a friend.");
    } catch {
      flash("Couldn't share automatically — copy the link above.");
    }
  };

  const handleDone = () => (onDone ? onDone() : flash("Returning to dashboard…"));
  const handleTomorrow = () => navigate("/");

  const [pausedAutoClose, setPausedAutoClose] = useState(false);

  useEffect(() => {
    if (pausedAutoClose) return;
    const autoCloseTimer = setTimeout(() => {
      if (onDone) onDone();
    }, 15000);
    return () => clearTimeout(autoCloseTimer);
  }, [onDone, pausedAutoClose]);

  const nextRewardAt = referralCount >= 3 ? null : referralCount + 1;

  return (
    <div onTouchStart={() => setPausedAutoClose(true)} className="fixed inset-0 z-50 h-dvh flex items-center justify-center bg-[#f3f8e8] px-3 sm:px-4 md:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:py-4 md:py-6 overflow-y-auto overscroll-contain">
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

        /* ── Share Attention Animations ──────────────────────── */
        @keyframes ms-share-pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(125, 150, 103, 0.6), 0 4px 12px rgba(30, 48, 25, 0.15);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(125, 150, 103, 0), 0 8px 22px rgba(125, 150, 103, 0.4);
            transform: scale(1.045);
          }
        }

        @keyframes ms-share-soft-bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
          60% {
            transform: translateY(-2px);
          }
        }

        @keyframes ms-glowing-ring {
          0%, 100% {
            border-color: #8fa779;
            box-shadow: 0 0 0 1px rgba(125, 150, 103, 0.35), 0 2px 8px rgba(125, 150, 103, 0.1);
          }
          50% {
            border-color: #4a6b47;
            box-shadow: 0 0 0 3px rgba(74, 107, 71, 0.4), 0 4px 16px rgba(74, 107, 71, 0.25);
          }
        }

        .ms-mount { animation: ms-rise 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .ms-aura-anim { animation: ms-aura 1.8s cubic-bezier(0.16,1,0.3,1) both; }
        .ms-track-fill { animation: ms-fill 1s cubic-bezier(0.16,1,0.3,1) 0.3s both; }

        .ms-share-btn-attention {
          animation: ms-share-pulse-glow 2.2s ease-in-out infinite, ms-share-soft-bounce 4.4s ease-in-out infinite;
        }

        .ms-share-nudge-glow {
          animation: ms-glowing-ring 2.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .ms-mount, .ms-aura-anim, .ms-track-fill, .ms-share-btn-attention, .ms-share-nudge-glow { animation: none !important; }
        }

        @keyframes ms-ring {
          0%   { transform: scale(0.35); opacity: 0.7; }
          100% { transform: scale(1);    opacity: 0; }
        }
        .ms-ring { animation: ms-ring 4.8s ease-out infinite; }
        @keyframes ms-petal {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(260deg); opacity: 0; }
        }
        .ms-petal { animation: ms-petal 9s linear infinite; }
        .ms-step { animation: ms-rise 0.6s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .ms-ring, .ms-petal, .ms-step { animation: none; }
        }
      `}</style>

      {/* Leaf backdrop — full page, sits behind the content */}
      <svg aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}>
        <defs>
          <radialGradient id="ms-bg-glow" cx="50%" cy="48%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#f3f8e8" />
            <stop offset="100%" stopColor="#e4eecf" />
          </radialGradient>
          <path id="ms-leaf" d="M0 0 C20 -110 130 -190 260 -210 C255 -80 150 30 0 0 Z" />
          <path id="ms-vein" d="M6 -4 C80 -60 150 -110 232 -190" fill="none" strokeLinecap="round" />
        </defs>
        <rect width="1440" height="900" fill="url(#ms-bg-glow)" />
        {/* bottom-left cluster */}
        <g transform="translate(40 880) rotate(-8)">
          <use href="#ms-leaf" fill="#8aab4f" transform="translate(-60 -40) rotate(-80) scale(0.9)" />
          <use href="#ms-leaf" fill="#cddfb0" transform="translate(40 -120) rotate(-20) scale(0.8)" />
          <use href="#ms-leaf" fill="#cddfb0" transform="translate(190 -10) rotate(-5) scale(0.6)" />
          <use href="#ms-leaf" fill="#8aab4f" transform="translate(140 10) rotate(10) scale(0.7)" />
          <use href="#ms-leaf" fill="#17563b" transform="translate(20 -30) rotate(-12) scale(1.7)" />
          <use href="#ms-vein" stroke="#e9f1d8" strokeWidth="9" transform="translate(20 -30) rotate(-12) scale(1.7)" />
        </g>
        {/* top-right cluster */}
        <g transform="translate(1440 0) rotate(180)">
          <use href="#ms-leaf" fill="#8aab4f" transform="translate(-10 -110) rotate(-55) scale(1.1)" />
          <use href="#ms-leaf" fill="#cddfb0" transform="translate(60 -40) rotate(-30) scale(1.0)" />
          <use href="#ms-leaf" fill="#cddfb0" transform="translate(150 -150) rotate(-60) scale(0.6)" />
          <use href="#ms-leaf" fill="#cddfb0" transform="translate(30 -260) rotate(-70) scale(0.7)" />
        </g>
        {/* deep green base bar */}
        <path d="M360 900 L420 850 L1440 850 L1440 900 Z" fill="#17563b" />
      </svg>

      <div
        className={`ms-sans relative w-full max-w-5xl my-auto rounded-[28px] sm:rounded-[34px] overflow-hidden grid lg:grid-cols-[0.95fr_1.05fr] bg-white/85 backdrop-blur-xl border border-white shadow-[0_30px_80px_-20px_rgba(23,86,59,0.38)] ${
          mounted ? "ms-mount" : "opacity-0"
        }`}
      >
        {/* ══ Left: celebration panel ══════════════════════════ */}
        <div className="relative overflow-hidden px-6 sm:px-10 py-9 sm:py-12 text-white bg-gradient-to-br from-[#0d4130] via-[#17563b] to-[#24754f]">
          {/* ripple rings */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 w-[26rem] h-[26rem]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="ms-ring absolute inset-0 rounded-full border border-white/25" style={{ animationDelay: `${i * 1.6}s` }} />
            ))}
          </div>
          {/* drifting petals */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {[8, 22, 37, 52, 66, 80, 91].map((left, i) => (
              <span
                key={left}
                className="ms-petal absolute -top-6 block w-2.5 h-4 rounded-[100%_0_100%_0] bg-[#b9d98a]/70"
                style={{ left: `${left}%`, animationDelay: `${i * 0.9}s`, animationDuration: `${7 + (i % 3) * 2}s` }}
              />
            ))}
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 border border-white/20 px-3 py-1 text-[10.5px] font-semibold tracking-[0.18em] uppercase text-[#d6ecb8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b9d98a]" /> Session complete
            </span>

            {/* emblem */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mt-7">
              {mounted && <div className="ms-aura-anim absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(185,217,138,0.55)_0%,rgba(185,217,138,0)_70%)]" />}
              <svg viewBox="0 0 120 120" className="relative w-full h-full">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeDasharray="3 6" />
                <circle cx="60" cy="60" r="42" fill="#f3f8e8" />
                {/* lotus petals */}
                <g fill="#8aab4f" opacity="0.9">
                  <path d="M60 78 C46 72 40 58 46 46 C54 52 60 62 60 78Z" />
                  <path d="M60 78 C74 72 80 58 74 46 C66 52 60 62 60 78Z" />
                </g>
                <path d="M60 80 C50 66 52 48 60 36 C68 48 70 66 60 80Z" fill="#17563b" />
                <path d="M60 80 L60 52" stroke="#f3f8e8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="ms-serif text-[2.6rem] sm:text-[3.4rem] leading-[1.02] font-medium mt-6">
              Well done<span className="text-[#b9d98a]">.</span>
            </h1>
            <p className="text-[14px] text-white/75 mt-3 max-w-sm leading-relaxed">
              You showed up for your mind today. Take a moment — notice the stillness you just made room for.
            </p>

            <div className="inline-flex items-center gap-2 mt-5 rounded-2xl bg-white/10 border border-white/15 px-4 py-2.5">
              <span className="text-lg" aria-hidden="true">🔥</span>
              <span className="ms-serif text-2xl leading-none">{streakDays}</span>
              <span className="text-[11px] uppercase tracking-[0.14em] text-white/70">day streak</span>
            </div>

            {/* today's journey */}
            <ol className="mt-8 space-y-0">
              {STEPS.map((s, i) => (
                <li key={s.key} className="ms-step relative flex items-center gap-3.5 pb-4 last:pb-0" style={{ animationDelay: `${0.35 + i * 0.12}s` }}>
                  {i < STEPS.length - 1 && <span aria-hidden="true" className="absolute left-[17px] top-9 bottom-0 w-px bg-white/20" />}
                  <span className="relative w-9 h-9 shrink-0 rounded-full bg-white/12 border border-white/25 flex items-center justify-center text-sm">
                    {s.icon}
                    {!/not yet/i.test(String(stepStatus[s.key] || "")) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#b9d98a] text-[#0d4130] flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="flex-1 text-[13.5px] font-semibold">{s.label}</span>
                  <span className="text-[11.5px] text-[#d6ecb8]">{stepStatus[s.key]}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ══ Right: rewards & actions ═════════════════════════ */}
        <div className="px-5 sm:px-10 py-8 sm:py-12 flex flex-col">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#17563b] text-[#d6ecb8] flex items-center justify-center shadow-md">
              <Gift size={16} />
            </span>
            <div>
              <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-[#7d9667]">Referral rewards</p>
              <h3 className="ms-serif text-[1.45rem] sm:text-[1.7rem] leading-tight text-[#12301f]">Share the love, get more free!</h3>
            </div>
          </div>
          <p className="text-[13px] text-[#4f6648] leading-relaxed mt-3">
            If your loved ones register using your shared link, you will get an additional 1 month subscription absolutely free (for 3 successful registrations).
          </p>

          {/* reward medallions */}
          <div className="relative mt-7">
            <div className="absolute left-[16.6%] right-[16.6%] top-7 h-1 rounded-full bg-[#e3ecd3] overflow-hidden">
              <div className="ms-track-fill h-full rounded-full bg-gradient-to-r from-[#8aab4f] to-[#17563b]" style={{ width: `${(Math.min(Math.max(referralCount - 1, 0), 2) / 2) * 100}%` }} />
            </div>
            <div className="relative grid grid-cols-3">
              {[1, 2, 3].map((n) => {
                const done = n <= referralCount;
                return (
                  <div key={n} className="flex flex-col items-center gap-2">
                    <span
                      className={`w-14 h-14 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                        done
                          ? "bg-gradient-to-br from-[#2f8a5d] to-[#17563b] text-white shadow-[0_8px_20px_-6px_rgba(23,86,59,0.6)]"
                          : "bg-[#f1f6e6] border-2 border-dashed border-[#b8cf98] text-[#8aab4f]"
                      }`}
                    >
                      {done ? <Check size={22} strokeWidth={3} /> : <Gift size={20} />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* focus card */}
          {nextRewardAt ? (
            <div className="mt-7 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#f3f8e8] to-[#e9f2d8] border border-[#d6e5bd]">
              <p className="text-[13px] font-semibold text-[#12301f]">
                Invite one more friend to unlock one month subscription free!
              </p>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3">
                <input
                  type="text"
                  readOnly
                  value={refLink}
                  onFocus={(e) => e.target.select()}
                  aria-label="Your referral link"
                  className="w-full min-w-0 min-h-[44px] sm:min-h-0 rounded-xl bg-white border border-[#d6e5bd] px-3 py-2 text-base sm:text-xs font-medium text-[#3a4d31] outline-none select-all"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={copyReferralLink}
                    onMouseEnter={() => setPausedAutoClose(true)}
                    className="flex-1 sm:flex-none min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-xl bg-white border border-[#c7dba6] hover:bg-[#f3f8e8] text-[#17563b] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Copy size={13} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={shareReferralLink}
                    onMouseEnter={() => setPausedAutoClose(true)}
                    className="ms-share-btn-attention relative flex-1 sm:flex-none min-h-[44px] sm:min-h-[36px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#0a331c] to-[#1c472d] hover:from-[#062413] hover:to-[#133520] text-white font-bold text-xs transition-all duration-300 border-2 border-[#7d9667] flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md cursor-pointer"
                  >
                    <span className="relative flex h-2 w-2 mr-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b8e2a2] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b8e2a2]"></span>
                    </span>
                    <Share2 size={13} className="text-[#cde8ba]" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-7 rounded-2xl bg-gradient-to-br from-[#f3f8e8] to-[#e9f2d8] border border-[#d6e5bd] p-4 flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#17563b] shrink-0" />
              <p className="text-[13px] font-semibold text-[#12301f]">
                All three months unlocked — Premium's on us through the year.
              </p>
            </div>
          )}
          {!nextRewardAt && (
            <p className="text-[12.5px] text-[#4f6648] text-center mt-3 leading-relaxed">
              If you enjoy using <strong>Mental Swasthya</strong>, please share it with your friends and family.
            </p>
          )}

          <p role="status" aria-live="polite" className="text-xs text-[#4f7a3c] text-center mt-4 min-h-[1rem]">
            {localApiMessage || apiMessage}
          </p>

          {/* actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-5">
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 min-h-[48px] rounded-2xl bg-[#17563b] hover:bg-[#0f4630] text-white px-5 py-3 text-sm font-semibold shadow-[0_10px_24px_-8px_rgba(23,86,59,0.7)] transition-colors"
            >
              Return to dashboard
            </button>
            <button
              type="button"
              onClick={handleTomorrow}
              className="flex-1 min-h-[48px] rounded-2xl border border-[#cfe0b4] hover:bg-[#f3f8e8] text-[#3a5b32] px-5 py-3 text-sm font-semibold transition-colors"
            >
              I'll be back tomorrow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
