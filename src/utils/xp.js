import { useEffect, useState } from "react";
import { getBreathingHistory } from "../Api/breathingApi";

// XP earned per completed practice (kept in sync with the Dashboard's daily XP card)
export const XP_PER = { intention: 5, breathing: 15, meditation: 15, affirmation: 20 };

// Profile ring colours by lifetime XP
export const XP_RINGS = [
  { min: 5000, name: "Diamond", color: "#7dd3fc" },
  { min: 4000, name: "Platinum", color: "#cbd5e1" },
  { min: 3000, name: "Gold", color: "#facc15" },
  { min: 2000, name: "Silver", color: "#d1d5db" },
  { min: 1000, name: "Bronze", color: "#cd7f32" },
];

export const getXpRing = (xp) => XP_RINGS.find((r) => xp >= r.min) || null;

const readJson = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
};

export const computeLifetimeXp = (completedBreathingCount = 0) => {
  const intentions = readJson("mentalSwasthya:intentions").length;
  const plays = readJson("mentalswasthya_play_history");
  const meditation = plays.filter((p) => p.type === "meditation").length;
  const affirmation = plays.filter((p) => p.type === "affirmation").length;
  return (
    intentions * XP_PER.intention +
    completedBreathingCount * XP_PER.breathing +
    meditation * XP_PER.meditation +
    affirmation * XP_PER.affirmation
  );
};

// Lifetime XP, refreshed once the breathing history has loaded.
export const useLifetimeXp = () => {
  const [xp, setXp] = useState(() => computeLifetimeXp(0));

  useEffect(() => {
    let alive = true;
    getBreathingHistory()
      .then((res) => {
        const payload = res?.data?.data ?? res?.data ?? [];
        const list = Array.isArray(payload) ? payload : payload.sessions || payload.history || [];
        if (alive) setXp(computeLifetimeXp(list.filter((s) => s.isCompleted).length));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return xp;
};
