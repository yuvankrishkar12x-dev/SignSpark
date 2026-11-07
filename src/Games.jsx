import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CameraView from "./CameraView.jsx";
import { SIGNS, normalize, loadTemplates, distanceTo } from "./recognition.js";
import { notify, speak, getMode } from "./settings.js";
import { addXP, getBestRush, setBestRush } from "./progress.js";

const GAME_SECONDS = 45;
const TARGET_SECONDS = 6;
const HOLD = 8;        // frames you must hold the sign
const THRESHOLD = 1.0; // use the same value you found with the Strictness slider

export default function Games() {
  const templates = useMemo(() => loadTemplates(), []);
  const [phase, setPhase] = useState("idle"); // idle | playing | over
  const [target, setTarget] = useState(SIGNS[0]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [best, setBest] = useState(getBestRush());

  const phaseRef = useRef("idle");
  const targetRef = useRef(SIGNS[0]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const hold = useRef(0);
  const startedAt = useRef(0);
  const targetAt = useRef(0);
  const cooldown = useRef(0);

  const newTarget = useCallback(() => {
    const options = SIGNS.filter((s) => s !== targetRef.current);
    const next = options[Math.floor(Math.random() * options.length)];
    targetRef.current = next;
    setTarget(next);
    targetAt.current = performance.now();
    hold.current = 0;
    if (getMode() === "blind") speak(`Show ${next}`);
  }, []);

  const end = useCallback(() => {
    phaseRef.current = "over";
    setPhase("over");
    const s = scoreRef.current;
    addXP(Math.round(s / 2));
    if (s > getBestRush()) { setBestRush(s); setBest(s); }
    notify(`Time's up! You scored ${s}`, true);
  }, []);

  const start = () => {
    scoreRef.current = 0;
    comboRef.current = 0;
    cooldown.current = 0;
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_SECONDS);
    startedAt.current = performance.now();
    phaseRef.current = "playing";
    setPhase("playing");
    newTarget();
  };

  // Game clock
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      const now = performance.now();
      const left = Math.max(0, GAME_SECONDS - (now - startedAt.current) / 1000);
      setTimeLeft(Math.ceil(left));
      if (left <= 0) { clearInterval(id); end(); return; }
      if (now - targetAt.current > TARGET_SECONDS * 1000) {
        comboRef.current = 0;
        setCombo(0);
        notify("Missed", false);
        newTarget();
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, end, newTarget]);

  const onLandmarks = useCallback((lm) => {
    if (phaseRef.current !== "playing" || !lm) { hold.current = 0; return; }
    const now = performance.now();
    if (now < cooldown.current) return;

    const d = distanceTo(normalize(lm), targetRef.current, templates);
    hold.current = d !== null && d < THRESHOLD ? hold.current + 1 : 0;

    if (hold.current >= HOLD) {
      const speedBonus = Math.max(0, Math.round(TARGET_SECONDS - (now - targetAt.current) / 1000));
      comboRef.current += 1;
      scoreRef.current += 10 + speedBonus * 2 + comboRef.current * 2;
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      cooldown.current = now + 600;
      notify("Correct!", true);
      newTarget();
    }
  }, [templates, newTarget]);

  return (
    <>
      <h1>Sign Rush</h1>
      <p className="page-sub">Show each sign before the timer runs out. Fast signs and combos score more.</p>
      <CameraView onLandmarks={onLandmarks} />

      <div className="card target">
        <div className="stats">
          <div className="stat"><b>{timeLeft}</b><span className="muted">Seconds</span></div>
          <div className="stat"><b>{score}</b><span className="muted">Score</span></div>
          <div className="stat"><b>{combo}</b><span className="muted">Combo</span></div>
        </div>

        {phase === "playing" && (
          <>
            <p className="muted" style={{ marginTop: 16 }}>Show this sign</p>
            <div className="letter" role="status" aria-live="assertive">{target}</div>
          </>
        )}

        {phase === "over" && (
          <p className="result ok" role="status">Final score: {score} (+{Math.round(score / 2)} XP)</p>
        )}

        {phase !== "playing" && (
          <button className="btn" onClick={start}>
            {phase === "idle" ? "Start game" : "Play again"}
          </button>
        )}
        <p className="muted" style={{ marginTop: 12 }}>Best score: {best}</p>
      </div>
    </>
  );
}
