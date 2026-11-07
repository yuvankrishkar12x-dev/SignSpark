import { useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { Home, Lessons, Practice, Progress, Settings } from "./screens.jsx";
import Games from "./Games.jsx";
import Record from "./Record.jsx";
import Welcome, { isOnboarded } from "./Welcome.jsx";
import { HomeIcon, BookIcon, CameraIcon, GameIcon, ChartIcon, GearIcon } from "./icons.jsx";
import "./App.css";

const tabs = [
  ["/", HomeIcon, "Home"],
  ["/lessons", BookIcon, "Learn"],
  ["/practice", CameraIcon, "Practice"],
  ["/games", GameIcon, "Games"],
  ["/progress", ChartIcon, "Progress"],
  ["/settings", GearIcon, "Settings"],
];

export default function App() {
  const [onboarded, setOnboarded] = useState(isOnboarded());

  if (!onboarded) return <Welcome onDone={() => setOnboarded(true)} />;

  return (
    <>
      <main className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/games" element={<Games />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/record" element={<Record />} />
        </Routes>
      </main>
      <nav className="nav" aria-label="Main navigation">
        {tabs.map(([to, Icon, label]) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}>
            <Icon />{label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
