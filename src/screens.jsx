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
export const Practice = () => <Page title="Practice" text="The camera and hand detection will go here." />;
export const Games = () => <Page title="Games" text="Sign Rush and mini games will go here." />;
export const Progress = () => <Page title="Progress" text="Your streaks, XP and accuracy will show here." />;
export const Settings = () => <Page title="Settings" text="Deaf, blind and speech-impaired modes will go here." />