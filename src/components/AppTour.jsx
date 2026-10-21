import React, { useEffect, useRef, useState } from "react";

const TOUR_KEY = "ms_tour_done";

const STEPS = [
  { icon: "🏠", title: "Your Dashboard", text: "See today's progress, your streak, XP and web app usage at a glance. Use the period selector to review any time range." },
  { icon: "📝", title: "Daily Intentions", text: "Start your day with purpose. Set an intention, then look back at your progress gently." },
  { icon: "🌬️", title: "Breathing & Meditation", text: "Choose Breathing, Silent Meditation, Affirmations or the Meditation playlist from the menu on the left." },
  { icon: "🏆", title: "Achievements & Streaks", text: "Earn milestones, protect your streak with streak freezes and watch your profile ring change as your XP grows." },
  { icon: "👤", title: "Profile & Subscription", text: "Set your weekly off days, manage your plan and share Mental Swasthya with friends from your profile and subscription pages." },
];

const isDone = () => {
  try {
    return localStorage.getItem(TOUR_KEY) === "true";
  } catch (e) {
    return true; // storage unavailable: don't nag on every visit
  }
};

// First-visit guided tour of the web application. Skippable; shown once per browser.
const AppTour = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const nextRef = useRef(null);

  useEffect(() => {
    if (isDone()) return undefined;
    const t = setTimeout(() => setOpen(true), 1200); // let the dashboard settle first
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open && nextRef.current) nextRef.current.focus();
  }, [open, step]);

  const finish = () => {
    try {
      localStorage.setItem(TOUR_KEY, "true");
    } catch (e) { /* ignore */ }
    setOpen(false);
  };

  if (!open) return null;
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Web application tour"
      onKeyDown={(e) => e.key === "Escape" && finish()}
      className="fixed inset-0 z-[9997] flex items-end sm:items-center justify-center bg-black/40 p-3"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl text-[#22331b]">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
          Quick tour · {step + 1} of {STEPS.length}
        </p>
        <div className="text-3xl mt-3" aria-hidden="true">{current.icon}</div>
        <h2 className="text-lg font-black mt-2">{current.title}</h2>
        <p className="text-sm text-gray-600 mt-1.5 leading-6">{current.text}</p>
        <div className="flex items-center justify-between gap-2 mt-5">
          <button type="button" onClick={finish} className="min-h-[44px] px-3 text-xs font-bold text-gray-400 hover:text-gray-600">
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="min-h-[44px] px-4 rounded-xl border border-[#dbe7d3] text-xs font-bold text-[#3a4d31]"
              >
                Back
              </button>
            )}
            <button
              ref={nextRef}
              type="button"
              onClick={() => (last ? finish() : setStep((s) => s + 1))}
              className="min-h-[44px] px-5 rounded-xl bg-[#1e382b] hover:bg-[#14281e] text-xs font-bold text-white"
            >
              {last ? "Get started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTour;
