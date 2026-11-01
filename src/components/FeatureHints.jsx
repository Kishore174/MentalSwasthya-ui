import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../Api/userApi";

const SEEN_KEY = "ms_feature_spotlight_seen";

// href → sidebar link to spotlight. Steps without an href (or whose link isn't on screen, e.g. the
// mobile drawer is closed) are shown as a centred card instead.
const STEPS = [
  { icon: "🌿", title: "Welcome to Mental Swasthya", text: "A calm space for your mind. Let's walk through every section of the app." },
  { icon: "🏠", href: "/app", title: "Dashboard", text: "Today's progress, your streak, XP and usage at a glance. Pick any time range to look back." },
  { icon: "📝", href: "/app/intentions", title: "Daily Intentions", text: "Begin each day with purpose. Set an intention and watch your journey unfold." },
  { icon: "🌬️", href: "/app/meditation", title: "Breathing & Meditation", text: "Guided breathing sessions with calming visuals to settle your mind." },
  { icon: "🎧", href: "/app/meditation-playlist", title: "Meditation Playlist", text: "Curated audio tracks for sleep, focus and calm. Add your own too." },
  { icon: "🧘", href: "/app/silent-meditation", title: "Silent Meditation", text: "A timed, distraction-free sit. Just you, your breath and the silence." },
  { icon: "💬", href: "/app/affirmations", title: "Affirmations", text: "Positive audio affirmations to reshape your inner dialogue." },
  { icon: "👤", href: "/app/profile", title: "Your Profile", text: "Set your weekly off days, review your details and share with friends." },
  { icon: "🏆", href: "/app/achievements", title: "Achievements & Streaks", text: "Earn milestones, protect your streak with freezes and level up your profile ring." },
  { icon: "🎁", href: "/app/gift-cards", title: "Gift Cards", text: "Gift peace of mind to someone you care about, or redeem a code you received." },
  { icon: "💎", href: "/app/subscription", title: "Subscription", text: "Compare Regular and Premium plans, switch billing cycle and manage auto-renewal." },
  { icon: "ℹ️", href: "/app/about", title: "About Mental Swasthya", text: "Our story, our approach and what to expect on your journey." },
  { icon: "✉️", href: "/app/contact", title: "Contact Us", text: "Questions or feedback? We'd love to hear from you." },
  { icon: "✨", title: "You're all set", text: "Take a deep breath. Your first practice is just a click away." },
];

const PAD = 8;
const CARD_W = 320;

const isSeen = (user) => {
  if (user?.hasCompletedTour) return true;
  try {
    const key = user?._id || user?.id || user?.email;
    if (key && localStorage.getItem(`${SEEN_KEY}_${key}`) === "true") return true;
    return localStorage.getItem(SEEN_KEY) === "true";
  } catch (e) {
    return true; // storage unavailable: don't nag on every visit
  }
};

const markSeen = (user) => {
  try {
    localStorage.setItem(SEEN_KEY, "true");
    const key = user?._id || user?.id || user?.email;
    if (key) {
      localStorage.setItem(`${SEEN_KEY}_${key}`, "true");
    }
  } catch (e) { /* ignore */ }
};

const measure = (href) => {
  if (!href) return null;
  const el = document.querySelector(`aside a[href="${href}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

const CSS = `
@keyframes msSpotGlow {
  0%, 100% { box-shadow: 0 0 0 9999px rgba(10,24,16,.68), 0 0 0 2px rgba(163,201,140,.9), 0 0 22px 4px rgba(125,150,103,.55); }
  50%      { box-shadow: 0 0 0 9999px rgba(10,24,16,.68), 0 0 0 4px rgba(163,201,140,.55), 0 0 38px 10px rgba(125,150,103,.35); }
}
@keyframes msCardIn { from { opacity: 0; transform: translateY(12px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes msFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes msFade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .ms-spot, .ms-card, .ms-float { animation: none !important; transition: none !important; }
}
`;

// Impressive first-visit spotlight: dims the page, glows around the real menu item, glides between steps.
// Skippable at any time (Skip button, Esc, or clicking the dimmed area).
const FeatureHints = () => {
  const { user, updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const nextRef = useRef(null);
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  useEffect(() => {
    if (isSeen(user)) return undefined;
    const t = setTimeout(() => setOpen(true), 1200); // let the dashboard settle first
    return () => clearTimeout(t);
  }, [user]);

  const update = useCallback(() => setRect(measure(current.href)), [current.href]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    // The menu is long; bring the highlighted item into view before measuring it.
    const target = current.href && document.querySelector(`aside a[href="${current.href}"]`);
    if (target && target.scrollIntoView) target.scrollIntoView({ block: "nearest" });
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, update, current.href]);

  useEffect(() => {
    if (open && nextRef.current) nextRef.current.focus();
  }, [open, step]);

  const finish = useCallback(async () => {
    markSeen(user);
    setOpen(false);

    if (user && !user.hasCompletedTour) {
      try {
        if (updateUser) {
          updateUser({ hasCompletedTour: true });
        }
        await updateUserProfile({ hasCompletedTour: true });
      } catch (err) {
        console.error("Failed to mark tour as completed in db:", err);
      }
    }
  }, [user, updateUser]);

  const go = (dir) => setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + dir)));

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  if (!open) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(CARD_W, vw - 24);
  const spot = rect && {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };
  const cardStyle = spot
    ? {
        width: cardW,
        left: Math.min(spot.left + spot.width + 20, vw - cardW - 12),
        top: Math.max(12, Math.min(spot.top + spot.height / 2 - 110, vh - 290)),
      }
    : { width: cardW, left: (vw - cardW) / 2, top: Math.max(12, vh / 2 - 150) };

  return (
    <div role="dialog" aria-modal="true" aria-label="Feature tour" className="fixed inset-0 z-[9997]">
      <style>{CSS}</style>

      {/* Click on the dimmed area skips */}
      <div className="absolute inset-0" onClick={finish} aria-hidden="true" />

      {spot ? (
        <div
          className="ms-spot pointer-events-none fixed rounded-2xl"
          style={{
            ...spot,
            animation: "msSpotGlow 2.4s ease-in-out infinite",
            transition: "top .55s cubic-bezier(.22,1,.36,1), left .55s cubic-bezier(.22,1,.36,1), width .55s cubic-bezier(.22,1,.36,1), height .55s cubic-bezier(.22,1,.36,1)",
          }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(10,24,16,.68)", animation: "msFade .4s ease" }} />
      )}

      <div
        key={step}
        className="ms-card fixed overflow-hidden rounded-3xl bg-white text-[#22331b] shadow-[0_24px_70px_rgba(10,24,16,.45)]"
        style={{ ...cardStyle, animation: "msCardIn .45s cubic-bezier(.22,1,.36,1)", transition: "left .55s cubic-bezier(.22,1,.36,1), top .55s cubic-bezier(.22,1,.36,1)" }}
      >
        <div className="relative px-5 pt-5 pb-4 text-white" style={{ background: "linear-gradient(135deg,#1e382b 0%,#2f5a42 55%,#7d9667 120%)" }}>
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
          <div className="flex items-center gap-3">
            <div
              className="ms-float flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur"
              style={{ animation: "msFloat 3s ease-in-out infinite" }}
              aria-hidden="true"
            >
              {current.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                {step + 1} / {STEPS.length}
              </p>
              <h2 className="text-base font-black leading-tight">{current.title}</h2>
            </div>
          </div>
        </div>

        <div className="px-5 pt-4 pb-5">
          <p className="text-sm leading-6 text-gray-600">{current.text}</p>

          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-500"
                style={{ background: i <= step ? "#2f5a42" : "#e3ecdc" }}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={finish}
              className="min-h-[44px] px-2 text-xs font-bold text-gray-400 transition hover:text-gray-600"
            >
              {last ? "Close" : "Skip tour"}
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="min-h-[44px] rounded-xl border border-[#dbe7d3] px-4 text-xs font-bold text-[#3a4d31] transition hover:bg-[#f3f8ef]"
                >
                  Back
                </button>
              )}
              <button
                ref={nextRef}
                type="button"
                onClick={() => (last ? finish() : go(1))}
                className="min-h-[44px] rounded-xl px-5 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: "linear-gradient(135deg,#1e382b,#2f5a42)" }}
              >
                {last ? "Get started" : step === 0 ? "Let's go" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureHints;
