import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../Api/userApi";

const SEEN_KEY = "ms_feature_spotlight_seen";

// href → sidebar link to spotlight. Steps without an href (or whose link isn't on screen, e.g. the
// mobile drawer is closed) are shown as a centred card instead.
const STEPS = [
  {"icon": "🌿", "title": "Welcome to Mental Swasthya", "text": "A calm space for your mind. Let's walk through every section of the app."},
  {"icon": "🏠", "href": "/app", "title": "Dashboard", "text": "See today's wellness tools progress, your streak, web app usage, XP and achievements at a glance.", "more": [{"body": "Use the period selector to review any time range."}]},
  {"icon": "📝", "href": "/app/intentions", "title": "Daily Intentions", "text": "Start your day with purpose.", "more": [{"body": "Set an intention using prompts or write your own thoughts, then look back at your yesterday’s intention progress gently."}]},
  {"icon": "🌬️", "href": "/app/meditation", "title": "Regulated Breathing & Meditation", "text": "Choose from Triangle, Box and Circle breathing patterns, or pick audio from the Meditation playlist.", "more": [{"heading": "Regulated Breathing", "body": "Choose different breathing patterns like Triangle, Box and Circle. You can even create your own pattern and save it. You can use preset timings, or set a custom timing. You have the option of turning sound prompts ON or OFF."}, {"heading": "Meditation", "body": "Choose the audio from the Meditation playlist of English, Hindi and Music. You can filter it too, and upload tracks of your choice."}]},
  {"icon": "🧘", "href": "/app/silent-meditation", "title": "Silent Meditation & Affirmation", "text": "Sit in silence for a time you choose, and listen to positive affirmations in English or Hindi.", "more": [{"heading": "Silent Meditation", "body": "You can select the period or set a custom one and do the silent meditation. A sound prompt will alert you when the silent meditation time is complete."}, {"heading": "Affirmation", "body": "Choose the audio from the Affirmation playlist of English and Hindi. You can filter it too, and upload tracks of your choice."}]},
  {"icon": "👤", "href": "/app/profile", "title": "Profile & Achievements", "text": "Manage your details and weekly off day, and track the milestones you earn.", "more": [{"heading": "Profile", "body": "You can enter your name and phone number, and upload your photo. You can select your rest day or weekly off. You can also delete your account from here."}, {"heading": "Achievements", "body": "Earn certificates after achieving the designated milestones, protect your streak with streak freezes and watch your profile ring change its color as your XP grows."}]},
  {"icon": "🎁", "href": "/app/gift-cards", "title": "Buy a Gift Card & Subscription", "text": "Gift a wellness subscription card to a loved one, or choose a plan for yourself.", "more": [{"heading": "Buy a Gift Card", "body": "You can buy a variety of mental wellness subscription cards and gift them to your loved ones. You can also redeem gift cards."}, {"heading": "Buy a Subscription", "body": "You can buy the Standard Calm or Wellness Pro plan, with monthly or yearly billing."}]},
  {"icon": "✉️", "href": "/app/contact", "title": "Contact Us & Feedback", "text": "Reach out to us for any enquiry, and tell us how we can improve.", "more": [{"heading": "Contact Us", "body": "You can reach out to us for a general enquiry, technical support, or billing and subscription questions. You can also reach us for grievance redressal, if any."}, {"heading": "Feedback", "body": "You can rate us and give us your candid feedback to improve our service."}]},
  {"icon": "✨", "title": "You're all set", "text": "Take a deep breath. Your first practice is just a click away."},
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
  // On phones the menu is an off-screen drawer: nothing to spotlight, so use the centred card.
  if (r.right <= 0 || r.left >= window.innerWidth || r.bottom <= 0 || r.top >= window.innerHeight) return null;
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
const FeatureHints = ({ autoStart = true }) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [rect, setRect] = useState(null);
  const nextRef = useRef(null);
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  useEffect(() => {
    if (!autoStart || isSeen(user)) return undefined;
    const t = setTimeout(() => setOpen(true), 1200); // let the dashboard settle first
    return () => clearTimeout(t);
  }, [user, autoStart]);

  const update = useCallback(() => setRect(measure(current.href)), [current.href]);

  // Each step opens the page it is describing, so the screen changes as you click Next / Back.
  useEffect(() => {
    if (!open) return;
    if (current.href) navigate(current.href);
    else if (step === STEPS.length - 1) navigate("/app");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, open]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    // The menu is long; bring the highlighted item into view before measuring it.
    const target = current.href && document.querySelector(`aside a[href="${current.href}"]`);
    const tr = target && target.getBoundingClientRect();
    // Skip when the menu is hidden off-screen (mobile drawer) — scrolling it would shift the page sideways.
    if (tr && tr.right > 0 && tr.left < window.innerWidth && target.scrollIntoView) target.scrollIntoView({ block: "nearest" });
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

  const go = (dir) => {
    setExpanded(false);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + dir)));
  };

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
    : vw < 768
      ? { width: cardW, left: (vw - cardW) / 2, bottom: 16 } // phones: bottom sheet, keeps the page visible above
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
        style={{ ...cardStyle, animation: "msCardIn .45s cubic-bezier(.22,1,.36,1)", transition: "left .55s cubic-bezier(.22,1,.36,1), top .55s cubic-bezier(.22,1,.36,1)", maxHeight: cardStyle.top != null ? `calc(100dvh - ${cardStyle.top + 12}px)` : "calc(100dvh - 32px)", overflowY: "auto" }}
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
          {/* Highlighted summary */}
          <p className="rounded-xl border-l-4 border-[#7d9667] bg-[#eef6ea] px-3 py-2.5 text-sm font-semibold leading-6 text-[#22331b]">
            {current.text}
          </p>

          {current.more && (
            <>
              {expanded && (
                <div className="mt-3 space-y-3">
                  {current.more.map((m, i) => (
                    <div key={i}>
                      {m.heading && <h3 className="text-xs font-black uppercase tracking-[0.12em] text-[#7d9667]">{m.heading}</h3>}
                      <p className="mt-1 text-sm leading-6 text-gray-600">{m.body}</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="mt-2 min-h-[36px] text-xs font-black text-[#2f5a42] underline underline-offset-2 hover:text-[#1e382b]"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            </>
          )}

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
