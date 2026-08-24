import React, { useState } from "react";
import { FiMessageSquare, FiX, FiCheck, FiHeart, FiStar } from "react-icons/fi";
import { toast } from "react-hot-toast";

const MOOD_LEVELS = [
  { level: 1, val: 1.0, emoji: "😡", label: "Needs Work", color: "#ef4444", bg: "#fef2f2", ring: "#fca5a5" },
  { level: 2, val: 2.0, emoji: "🙁", label: "Fair", color: "#f97316", bg: "#fff7ed", ring: "#fdba74" },
  { level: 3, val: 3.0, emoji: "😐", label: "Good", color: "#eab308", bg: "#fefce8", ring: "#fde047" },
  { level: 4, val: 4.0, emoji: "🙂", label: "Great", color: "#84cc16", bg: "#f7fee7", ring: "#bef264" },
  { level: 5, val: 5.0, emoji: "😁", label: "Loved It!", color: "#22c55e", bg: "#f0fdf4", ring: "#86efac" },
];

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(4.8);
  const [remarks, setRemarks] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hoverLevel, setHoverLevel] = useState(null);

  // Active level data
  const currentLevelObj = MOOD_LEVELS.reduce((prev, curr) =>
    Math.abs(curr.val - rating) < Math.abs(prev.val - rating) ? curr : prev
  );

  // Angle math for arc pointer (180 deg to 0 deg)
  const angle = 180 - ((rating - 1) / 4) * 180;
  const rad = (angle * Math.PI) / 180;
  
  // Center math for Gauge Arc
  const radius = 120;
  const cx = 170;
  const cy = 150;

  const needleX = cx + radius * Math.cos(rad);
  const needleY = cy - radius * Math.sin(rad);

  const handleSubmit = (e) => {
    e.preventDefault();
    const feedbackItem = {
      id: Date.now(),
      rating,
      remarks,
      date: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem("mentalswasthya_user_feedback") || "[]");
      existing.push(feedbackItem);
      localStorage.setItem("mentalswasthya_user_feedback", JSON.stringify(existing));
    } catch (err) {
      console.error("Error saving feedback", err);
    }

    setSubmitted(true);
    toast.success("Thank you for your valuable feedback!");

    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setRemarks("");
      setRating(4.8);
    }, 1600);
  };

  return (
    <>
      {/* ─── Sleek Right-Side Attached Trigger Tab ─── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-br from-[#2a4023] via-[#3a5830] to-[#547343] text-white px-3 py-4 rounded-l-2xl shadow-[0_12px_35px_rgba(30,50,20,0.25)] border-y border-l border-white/20 flex flex-col items-center gap-2.5 cursor-pointer hover:translate-x-[-3px] transition-all duration-300 group"
        title="Share your experience"
      >
        <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
          <FiMessageSquare size={15} className="text-[#d5e8cb]" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e3f0db] [writing-mode:vertical-lr] rotate-180">
          Feedback
        </span>
      </button>

      {/* ─── Ultra-Modern Feedback Modal Overlay ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          
          <div className="relative w-full max-w-[500px] bg-gradient-to-b from-[#ffffff] via-[#f7faf5] to-[#edf4e8] rounded-[36px] border border-white shadow-[0_25px_70px_rgba(20,35,15,0.3)] p-7 md:p-8 overflow-hidden">
            
            {/* Soft Ambient Background Glow */}
            <div
              className="absolute -top-24 -left-24 w-56 h-56 rounded-full blur-3xl opacity-30 transition-all duration-500 pointer-events-none"
              style={{ backgroundColor: currentLevelObj.color }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-25 transition-all duration-500 pointer-events-none"
              style={{ backgroundColor: currentLevelObj.color }}
            />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-5 top-5 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all shadow-sm z-20"
            >
              <FiX size={18} />
            </button>

            {submitted ? (
              <div className="py-14 text-center space-y-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce"
                  style={{ backgroundColor: currentLevelObj.color, color: "#ffffff" }}
                >
                  <FiCheck size={38} />
                </div>
                <h3 className="text-2xl font-black text-[#1e3019]">Feedback Submitted!</h3>
                <p className="text-sm text-[#55694a] max-w-xs mx-auto font-medium">
                  We truly appreciate your thoughts. Your feedback helps us build a better MentalSwasthya platform.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col items-center text-center space-y-5 relative z-10">
                
                {/* Header */}
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#7d9667] bg-[#eef6ea] px-3 py-1 rounded-full mb-2">
                    <FiHeart size={12} className="text-[#7d9667]" /> Your Opinion Matters
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-[#1e3019] tracking-tight">
                    Rate Your Experience
                  </h2>
                  <p className="text-xs text-[#5c6e54] mt-1 max-w-sm mx-auto font-medium">
                    Slide or tap below to share your experience with us.
                  </p>
                </div>

                {/* ─── Speedometer Arc Gauge Dial ─── */}
                <div className="relative w-full max-w-[340px] h-[190px] flex items-center justify-center my-1 select-none">
                  
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 340 180">
                    <defs>
                      <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="25%" stopColor="#f97316" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="75%" stopColor="#84cc16" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>

                      <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={currentLevelObj.color} floodOpacity="0.35" />
                      </filter>
                    </defs>

                    {/* Arc Track Background shadow */}
                    <path
                      d="M 50 150 A 120 120 0 0 1 290 150"
                      fill="none"
                      stroke="#e2ebde"
                      strokeWidth="24"
                      strokeLinecap="round"
                    />

                    {/* Glowing Gradient Arc */}
                    <path
                      d="M 50 150 A 120 120 0 0 1 290 150"
                      fill="none"
                      stroke="url(#arcGradient)"
                      strokeWidth="20"
                      strokeLinecap="round"
                      filter="url(#shadowGlow)"
                    />

                    {/* Dial Tick Marks */}
                    {[1.0, 2.0, 3.0, 4.0, 5.0].map((v) => {
                      const a = 180 - ((v - 1) / 4) * 180;
                      const r = (a * Math.PI) / 180;
                      const tx1 = 170 + 102 * Math.cos(r);
                      const ty1 = 150 - 102 * Math.sin(r);
                      const tx2 = 170 + 112 * Math.cos(r);
                      const ty2 = 150 - 112 * Math.sin(r);
                      return (
                        <line
                          key={v}
                          x1={tx1}
                          y1={ty1}
                          x2={tx2}
                          y2={ty2}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* Needle Indicator Line */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={needleX}
                      y2={needleY}
                      stroke={currentLevelObj.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="transition-all duration-150"
                    />
                    <circle cx={cx} cy={cy} r="7" fill={currentLevelObj.color} />

                    {/* Corner Emojis */}
                    <text x="32" y="172" className="text-xl select-none">😡</text>
                    <text x="288" y="172" className="text-xl select-none">😁</text>
                  </svg>

                  {/* Dynamic Glowing Rating Badge Floating over Needle */}
                  <div
                    style={{
                      left: `${needleX}px`,
                      top: `${needleY}px`,
                      transform: "translate(-50%, -50%)",
                      borderColor: currentLevelObj.color,
                      boxShadow: `0 8px 24px ${currentLevelObj.color}44`
                    }}
                    className="absolute w-16 h-16 rounded-full bg-white border-3 flex flex-col items-center justify-center z-20 pointer-events-none transition-all duration-100 scale-105"
                  >
                    <span className="text-sm font-black text-gray-900 leading-none">
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-sm mt-0.5">{currentLevelObj.emoji}</span>
                  </div>

                  {/* Hidden Range Input overlay for smooth dragging */}
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value))}
                    className="absolute bottom-2 w-full max-w-[280px] opacity-0 cursor-pointer h-16 z-30"
                  />
                </div>

                {/* ─── 5-Step Interactive Mood Level Selector Cards ─── */}
                <div className="grid grid-cols-5 gap-1.5 w-full">
                  {MOOD_LEVELS.map((item) => {
                    const isSelected = currentLevelObj.level === item.level;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setRating(item.val)}
                        onMouseEnter={() => setHoverLevel(item.level)}
                        onMouseLeave={() => setHoverLevel(null)}
                        style={{
                          backgroundColor: isSelected ? item.bg : "#ffffff",
                          borderColor: isSelected ? item.color : "#e2ebd9",
                        }}
                        className={`py-2 px-1 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? "shadow-sm font-black scale-105 ring-2"
                            : "opacity-80 hover:opacity-100 hover:scale-102"
                        }`}
                      >
                        <span className="text-lg select-none">{item.emoji}</span>
                        <span
                          className="text-[10px] font-extrabold tracking-tight line-clamp-1"
                          style={{ color: isSelected ? item.color : "#66785c" }}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ─── Remarks Input Pill ─── */}
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Enter your remarks here (optional)..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full rounded-2xl bg-white border border-[#d8e5d3] px-5 py-3.5 text-xs md:text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#7d9667] focus:ring-4 focus:ring-[#7d9667]/15 shadow-sm transition-all"
                  />
                </div>

                {/* ─── Submit Button ─── */}
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#1e3019] hover:bg-[#152312] text-white py-3.5 text-sm font-extrabold shadow-[0_10px_25px_rgba(30,48,25,0.25)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <FiStar className="text-amber-400 fill-amber-400" size={15} />
                  Submit Feedback
                </button>

              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
