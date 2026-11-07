import bundled from "./data/templates.json";

// Edit this list to change which signs the app teaches
export const SIGNS = ["A", "B", "C", "D", "E"];

// Make the hand pose independent of position and distance from the camera
export function normalize(lm) {
  const w = lm[0]; // wrist = origin
  const pts = lm.map((p) => [p.x - w.x, p.y - w.y, p.z - w.z]);
  const size = Math.hypot(pts[9][0], pts[9][1]) || 1; // wrist to middle-finger base
  return pts.flatMap((p) => [p[0] / size, p[1] / size, p[2] / size]); // 63 numbers
}

function dist(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; }
  return Math.sqrt(s);
}

// Samples recorded on this device (saved in the browser)
export function loadLocal() {
  try { return JSON.parse(localStorage.getItem("templates") || "{}"); }
  catch { return {}; }
}

// Bundled samples (from templates.json) + local samples
export function loadTemplates() {
  const local = loadLocal();
  const all = {};
  for (const src of [bundled, local]) {
    for (const [label, samples] of Object.entries(src)) {
      all[label] = [...(all[label] || []), ...samples];
    }
  }
  return all;
}

export function saveSamples(label, samples) {
  const all = loadLocal();
  all[label] = [...(all[label] || []), ...samples];
  localStorage.setItem("templates", JSON.stringify(all));
}

export function clearLocal() { localStorage.removeItem("templates"); }

export function countSamples(all) {
  return Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.length]));
}

export function exportTemplates() {
  const blob = new Blob([JSON.stringify(loadTemplates())], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "templates.json";
  a.click();
}

// Distance from the live hand to the closest saved sample of one sign
export function distanceTo(vec, label, templates) {
  const samples = templates[label];
  if (!samples || samples.length === 0) return null;
  let min = Infinity;
  for (const s of samples) min = Math.min(min, dist(vec, s));
  return min;
}

// Which sign does the live hand look most like?
export function recognise(vec, templates) {
  let best = null;
  for (const [label, samples] of Object.entries(templates)) {
    for (const s of samples) {
      const d = dist(vec, s);
      if (!best || d < best.d) best = { label, d };
    }
  }
  return best;
}