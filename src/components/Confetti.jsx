import React, { useMemo } from "react";

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#a855f7", "#facc15"];

// Lightweight CSS confetti burst (no dependencies). Respects prefers-reduced-motion.
const Confetti = ({ pieces = 70, onDone }) => {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.6,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
      })),
    [pieces]
  );

  React.useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), 4500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-[9998] ms-confetti">
      <style>{`
        @keyframes ms-confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) { .ms-confetti { display: none; } }
      `}</style>
      {items.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `ms-confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
