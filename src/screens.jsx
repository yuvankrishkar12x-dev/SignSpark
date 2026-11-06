import CameraView from "./CameraView.jsx";
import { Link } from "react-router-dom";

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
export function Practice() {
  return (
    <>
      <h1>Practice 📷</h1>
      <p className="muted">Hold your hand in front of the camera.</p>
      <CameraView />
      <div className="card">
        <p className="muted">
          Tip: use good lighting and a plain background. Keep your whole hand inside the frame.
        </p>
      </div>
    </>
  );
}
export const Games = () => <Page title="Games" text="Sign Rush and mini games will go here." />;
export const Progress = () => <Page title="Progress" text="Your streaks, XP and accuracy will show here." />;
export const Settings = () => <Page title="Settings" text="Deaf, blind and speech-impaired modes will go here." />