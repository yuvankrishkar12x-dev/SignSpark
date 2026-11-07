import { useCallback, useRef, useState } from "react";
import CameraView from "./CameraView.jsx";
import {
  SIGNS, normalize, loadLocal, saveSamples, clearLocal, exportTemplates, countSamples,
} from "./recognition.js";

export default function Record() {
  const [sign, setSign] = useState(SIGNS[0]);
  const [counts, setCounts] = useState(() => countSamples(loadLocal()));
  const [phase, setPhase] = useState("idle"); // idle | ready | recording
  const phaseRef = useRef("idle");
  const buffer = useRef([]);
  const signRef = useRef(sign);
  signRef.current = sign;

  const changePhase = (p) => { phaseRef.current = p; setPhase(p); };

  const onLandmarks = useCallback((lm) => {
    if (phaseRef.current !== "recording" || !lm) return;
    buffer.current.push(normalize(lm));
    if (buffer.current.length >= 30) {
      saveSamples(signRef.current, buffer.current);
      buffer.current = [];
      setCounts(countSamples(loadLocal()));
      phaseRef.current = "idle";
      setPhase("idle");
    }
  }, []);

  const start = () => {
    buffer.current = [];
    changePhase("ready");
    setTimeout(() => changePhase("recording"), 2000);
  };

  return (
    <>
      <h1>Record signs 🎥</h1>
      <p className="muted">
        Pick a sign, make it with the same hand every time, press Record, and slowly move
        your hand a little (closer, farther, tilted) while it captures.
      </p>
      <CameraView onLandmarks={onLandmarks} />
      <div className="card">
        <div className="chips">
          {SIGNS.map((s) => (
            <button key={s} className={`chip ${s === sign ? "active" : ""}`} onClick={() => setSign(s)}>
              {s} ({counts[s] || 0})
            </button>
          ))}
        </div>
        <button className="btn" onClick={start} disabled={phase !== "idle"}>
          {phase === "idle" ? `Record sign ${sign}` : phase === "ready" ? "Get ready…" : "Recording…"}
        </button>
        <button className="btn secondary" onClick={exportTemplates}>Export templates.json</button>
        <button
          className="btn secondary"
          onClick={() => { clearLocal(); setCounts({}); }}
        >
          Clear recordings on this device
        </button>
      </div>
    </>
  );
}