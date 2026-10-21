// Today's real progress for the "session complete" page (intention, breathing, meditation, affirmation).

const readList = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
};

const isToday = (value) => {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
};

const BREATH_KEY = "ms_daily_breathing";

// Call when a breathing session finishes so the last page can show today's total.
export const recordBreathingToday = (seconds) => {
  try {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem(BREATH_KEY) || "{}");
    const base = saved.date === today ? saved.seconds || 0 : 0;
    localStorage.setItem(BREATH_KEY, JSON.stringify({ date: today, seconds: base + Math.max(0, seconds) }));
  } catch (e) { /* storage unavailable */ }
};

const minutesLabel = (seconds) => (seconds > 0 ? `${Math.max(1, Math.round(seconds / 60))} min` : "Not yet");
const countLabel = (n) => (n > 0 ? `${n} done` : "Not yet");

export const getTodayProgress = () => {
  const intentions = readList("mentalSwasthya:intentions").filter((i) => isToday(i.date || i.timestamp)).length;
  const plays = readList("mentalswasthya_play_history").filter((p) => isToday(p.timestamp));
  const medSeconds = plays
    .filter((p) => p.playlistType === "/meditation" || p.type === "meditation")
    .reduce((sum, p) => sum + (p.duration || 180), 0); // history entries without a duration count as ~3 min
  const affirmations = plays.filter((p) => p.playlistType === "/affirmation" || p.type === "affirmation").length;

  let breathingSeconds = 0;
  try {
    const saved = JSON.parse(localStorage.getItem(BREATH_KEY) || "{}");
    if (saved.date === new Date().toDateString()) breathingSeconds = saved.seconds || 0;
  } catch (e) { /* ignore */ }

  let silentSeconds = 0;
  try {
    const saved = JSON.parse(localStorage.getItem("ms_daily_silent") || "{}");
    if (saved.date === new Date().toDateString()) silentSeconds = saved.seconds || 0;
  } catch (e) { /* ignore */ }

  return {
    intention: countLabel(intentions),
    breathing: minutesLabel(breathingSeconds),
    meditation1: minutesLabel(medSeconds),
    meditation2: minutesLabel(silentSeconds),
    affirmation: countLabel(affirmations),
  };
};
