import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CameraView from "./CameraView.jsx";
import { SIGNS, normalize, loadTemplates, distanceTo, recognise } from "./recognition.js";
import {
  MODES, getMode, setMode, getTextSize, getContrast,
  setTextSize, setContrast, notify, speak,
} from "./settings.js";

export function Home() {
  return (
    <>
      <h1>SignSpark ✋</h1>
      <p className="muted">Learn sign language with your camera.</p>
      <div className="stats">
        <div className="stat"><b>🔥 0</b><span className="muted">Streak</span></div>
        <div className="stat"><b>⭐ 0</b><span className="muted">XP</span></div>
        <div className="stat"><b>0</b><span className="muted">Signs</span></div>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Today's lesson</h2>
        <p className="muted">Alphabet basics: A to E</p>
        <Link className="btn" to="/practice">Start practice</Link>
      </div>
    </>
  );
}

const Page = ({ title, text }) => (
  <>
    <h1>{title}</h1>
    <div className="card"><p className="muted">{text}</p></div>
  </>
);

export const Lessons = () => <Page title="Lessons" text="Alphabet, numbers and common words will appear here." />;
export const Games = () => <Page title="Games" text="Sign Rush and mini games will go here." />;
export const Progress = () => <Page title="Progress" text="Your streaks, XP and accuracy will show here." />;

const HOLD_FRAMES = 10; // how long you must hold a sign (about 0.3 seconds)

export function Practice() {
  const templates = useMemo(() => loadTemplates(), []);
  const [target, setTarget] = useState(SIGNS[0]);
  const [done, setDone] = useState([]);
  const [flash, setFlash] = useState(false);
  const [threshold, setThreshold] = useState(1.5);
  const [info, setInfo] = useState({ hand: false, hold: 0, d: null, best: null, ok: false });

  const targetRef = useRef(SIGNS[0]);
  const thresholdRef = useRef(1.5);
  thresholdRef.current = threshold;
  const hold = useRef(0);
  const frame = useRef(0);
  const cooldown = useRef(0);
  const lastHint = useRef(0);

  useEffect(() => {
    if (getMode() === "blind") speak(`Practice. Show the sign for ${SIGNS[0]}.`);
  }, []);

  const advance = useCallback(() => {
    const t = targetRef.current;
    setDone((p) => (p.includes(t) ? p : [...p, t]));
    const next = SIGNS[(SIGNS.indexOf(t) + 1) % SIGNS.length];
    targetRef.current = next;
    setTarget(next);
    setFlash(true);
    notify(`Correct! Next sign: ${next}`, true);
    setTimeout(() => setFlash(false), 1000);
  }, []);

  const pick = (s) => { targetRef.current = s; setTarget(s); hold.current = 0; };

  const onLandmarks = useCallback((lm) => {
    frame.current += 1;
    const now = performance.now();
    const update = frame.current % 4 === 0; // refresh the screen every 4th frame

    if (!lm) {
      hold.current = 0;
      if (getMode() === "blind" && now - lastHint.current > 5000) {
        lastHint.current = now;
        speak("I can't see your hand. Move it into the frame.");
      }
      if (update) setInfo({ hand: false, hold: 0, d: null, best: null, ok: false });
      return;
    }

    const vec = normalize(lm);
    const d = distanceTo(vec, targetRef.current, templates);
    const ok = d !== null && d < thresholdRef.current;

    if (now < cooldown.current) {
      hold.current = 0;
    } else {
      hold.current = ok ? hold.current + 1 : 0;
      if (hold.current >= HOLD_FRAMES) {
        hold.current = 0;
        cooldown.current = now + 1500;
        advance();
      }
    }

    if (update) setInfo({ hand: true, hold: hold.current, d, best: recognise(vec, templates), ok });
  }, [templates, advance]);

  const message = flash
    ? "✅ Correct!"
    : !info.hand ? "Show your hand"
    : info.d === null ? `No samples for ${target} yet. Record it at /record`
    : info.ok ? "Hold it steady…"
    : "Not quite. Adjust your fingers";

  return (
    <>
      <h1>Practice 📷</h1>
      <p className="muted">Make the sign for the letter below and hold it steady.</p>
      <CameraView onLandmarks={onLandmarks} />

      <div className="card target">
        <p className="muted">Show this sign</p>
        <div className="letter">{target}</div>
        <div className="bar"><div style={{ width: `${Math.min(100, (info.hold / HOLD_FRAMES) * 100)}%` }} /></div>
        <p className={`result ${flash ? "ok" : ""}`} role="status" aria-live="polite">{message}</p>
        <div className="chips">
          {SIGNS.map((s) => (
            <button key={s} onClick={() => pick(s)}
              className={`chip ${s === target ? "active" : ""} ${done.includes(s) ? "done" : ""}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card debug muted">
        <div>
          Closest sign: <b>{info.best ? info.best.label : "–"}</b>
          {info.best ? ` (${info.best.d.toFixed(2)})` : ""} · Distance to {target}:{" "}
          <b>{info.d !== null ? info.d.toFixed(2) : "–"}</b>
        </div>
        <label>
          Strictness (lower = stricter): {threshold.toFixed(1)}
          <input type="range" min="0.5" max="4" step="0.1" value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))} />
        </label>
      </div>
    </>
  );
}

export function Settings() {
  const [mode, setModeState] = useState(getMode());
  const [size, setSize] = useState(getTextSize());
  const [contrast, setContrastState] = useState(getContrast());

  const choose = (m) => {
    setMode(m.id);
    setModeState(m.id);
    if (m.id === "blind") speak("Blind mode on. The app will speak instructions and feedback.");
    else notify(`${m.title} mode on`, true);
  };

  return (
    <>
      <h1>Settings ⚙️</h1>
      <p className="muted">Choose how SignSpark talks to you.</p>

      <div role="radiogroup" aria-label="Accessibility mode">
        {MODES.map((m) => (
          <button key={m.id} role="radio" aria-checked={mode === m.id}
            className={`mode ${mode === m.id ? "active" : ""}`} onClick={() => choose(m)}>
            <span className="mode-icon" aria-hidden="true">{m.icon}</span>
            <span><b>{m.title}</b><br /><span className="muted">{m.desc}</span></span>
          </button>
        ))}
      </div>

      <div className="card">
        <label>
          Text size: {size}%
          <input type="range" min="90" max="150" step="10" value={size}
            onChange={(e) => { const v = Number(e.target.value); setSize(v); setTextSize(v); }} />
        </label>
        <label className="row">
          <input type="checkbox" checked={contrast}
            onChange={(e) => { setContrastState(e.target.checked); setContrast(e.target.checked); }} />
          High contrast
        </label>
      </div>
    </>
  );
}