import { useState } from "react";
import { MODES, getMode, setMode, speak, notify } from "./settings.js";
import { HandIcon } from "./icons.jsx";

export const isOnboarded = () => {
  try { return localStorage.getItem("onboarded") === "yes"; } catch { return true; }
};

export default function Welcome({ onDone }) {
  const [mode, setModeState] = useState(getMode());

  const choose = (m) => {
    setMode(m.id);
    setModeState(m.id);
    if (m.id === "blind") speak("Blind mode selected. The app will speak instructions and feedback. Press Get started to continue.");
    else notify(`${m.title} mode selected`, true);
  };

  const finish = () => {
    try { localStorage.setItem("onboarded", "yes"); } catch { /* ignore */ }
    if (mode === "blind") speak("Welcome to SignSpark. You are on the home screen.");
    onDone();
  };

  return (
    <main className="welcome">
      <div className="logo"><HandIcon /></div>
      <h1>Welcome to SignSpark</h1>
      <p className="page-sub">Learn sign language with your camera, at your own pace.</p>

      <ol className="steps">
        <li><span className="num">1</span><span>Watch how each sign is made.</span></li>
        <li><span className="num">2</span><span>Show the sign to your camera and get instant feedback.</span></li>
        <li><span className="num">3</span><span>Keep a daily streak, play games and track your progress.</span></li>
      </ol>

      <h2>How should SignSpark guide you?</h2>
      <div role="radiogroup" aria-label="Accessibility mode">
        {MODES.map((m) => (
          <button key={m.id} role="radio" aria-checked={mode === m.id}
            className={`mode ${mode === m.id ? "active" : ""}`} onClick={() => choose(m)}>
            <span className="mode-icon" aria-hidden="true">{m.icon}</span>
            <span><b>{m.title}</b><br /><span className="muted">{m.desc}</span></span>
          </button>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 10, fontSize: ".85rem" }}>You can change this anytime in Settings.</p>

      <button className="btn" onClick={finish} style={{ marginTop: 20 }}>Get started</button>
    </main>
  );
}
