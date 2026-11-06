import { NavLink, Route, Routes } from "react-router-dom";
import { Home, Lessons, Practice, Games, Progress, Settings } from "./screens.jsx";
import "./App.css";

const tabs = [
  ["/", "🏠", "Home"],
  ["/lessons", "📚", "Learn"],
  ["/practice", "📷", "Practice"],
  ["/games", "🎮", "Games"],
  ["/progress", "📈", "Progress"],
  ["/settings", "⚙️", "Settings"],
];

export default function App() {
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
        </Routes>
      </main>
      <nav className="nav" aria-label="Main navigation">
        {tabs.map(([to, icon, label]) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}>
            <span aria-hidden="true">{icon}</span>{label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}