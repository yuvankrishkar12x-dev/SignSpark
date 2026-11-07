import { SIGNS } from "./recognition.js";

export const MASTERED_AT = 3; // correct signs needed to count as "mastered"
const KEY = "progress";

const blank = () => ({ xp: 0, perSign: {}, days: {}, bestRush: 0, streak: { count: 0, last: "" } });
const dayKey = (offset = 0) => new Date(Date.now() - offset * 864e5).toLocaleDateString("en-CA");

function load() {
  try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return blank(); }
}
const save = (p) => localStorage.setItem(KEY, JSON.stringify(p));

export const getProgress = load;

function touchStreak(p) {
  const today = dayKey();
  if (p.streak.last === today) return;
  p.streak = { count: p.streak.last === dayKey(1) ? p.streak.count + 1 : 1, last: today };
}

function bump(p, n) {
  p.xp += n;
  const k = dayKey();
  p.days[k] = (p.days[k] || 0) + n;
  touchStreak(p);
}

export function addXP(n) { const p = load(); bump(p, n); save(p); }

export function recordCorrect(sign) {
  const p = load();
  const s = p.perSign[sign] || { correct: 0 };
  s.correct += 1;
  p.perSign[sign] = s;
  bump(p, 10);
  save(p);
}

// A streak only counts if you practised today or yesterday
export function getStreak(p = load()) {
  return p.streak.last === dayKey() || p.streak.last === dayKey(1) ? p.streak.count : 0;
}

export function masteredCount(p = load()) {
  return SIGNS.filter((s) => (p.perSign[s]?.correct || 0) >= MASTERED_AT).length;
}

export function lastDays(n = 7) {
  const p = load();
  return Array.from({ length: n }, (_, i) => {
    const off = n - 1 - i;
    return {
      label: new Date(Date.now() - off * 864e5).toLocaleDateString("en", { weekday: "short" }),
      xp: p.days[dayKey(off)] || 0,
    };
  });
}

export function getBestRush() { return load().bestRush; }
export function setBestRush(v) { const p = load(); p.bestRush = v; save(p); }

export function getBadges(p = load()) {
  const st = getStreak(p);
  return [
    { icon: "🌱", title: "First sign", got: Object.keys(p.perSign).length > 0 },
    { icon: "🔥", title: "3-day streak", got: st >= 3 },
    { icon: "🏆", title: "7-day streak", got: st >= 7 },
    { icon: "⭐", title: "100 XP", got: p.xp >= 100 },
    { icon: "🎓", title: "All mastered", got: masteredCount(p) === SIGNS.length },
    { icon: "⚡", title: "Rush 100+", got: p.bestRush >= 100 },
  ];
}
