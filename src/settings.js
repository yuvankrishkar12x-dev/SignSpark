export const MODES = [
  { id: "deaf", icon: "🧏", title: "Deaf / Hard of hearing", desc: "Big text, visual flashes and vibration. No sound needed." },
  { id: "blind", icon: "🦯", title: "Blind / Low vision", desc: "Voice guidance, spoken feedback and sound cues." },
  { id: "speech", icon: "💬", title: "Speech-impaired", desc: "Text-first lessons with sign practice." },
];

const read = (k, d) => localStorage.getItem(k) ?? d;

export const getMode = () => read("mode", "deaf");
export const setMode = (m) => localStorage.setItem("mode", m);
export const getTextSize = () => Number(read("textSize", "100"));
export const getContrast = () => read("contrast", "off") === "on";

// Apply text size and high contrast to the whole app
export function applySettings() {
  document.documentElement.style.fontSize = `${getTextSize()}%`;
  document.documentElement.dataset.contrast = getContrast() ? "high" : "normal";
}
export function setTextSize(v) { localStorage.setItem("textSize", String(v)); applySettings(); }
export function setContrast(on) { localStorage.setItem("contrast", on ? "on" : "off"); applySettings(); }

export function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function beep(freq) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    o.frequency.value = freq;
    o.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.15);
  } catch { /* sound not available */ }
}

function flashScreen(ok) {
  document.body.classList.remove("flash-ok", "flash-bad");
  void document.body.offsetWidth; // restart the animation
  document.body.classList.add(ok ? "flash-ok" : "flash-bad");
}

// One function the whole app calls. It reacts differently in each mode.
export function notify(text, ok = true) {
  const mode = getMode();
  if (mode === "blind") {
    speak(text);
    beep(ok ? 880 : 220);
  } else if (mode === "deaf") {
    flashScreen(ok);
    navigator.vibrate?.(ok ? 100 : [80, 40, 80]);
  } else {
    flashScreen(ok);
  }
}