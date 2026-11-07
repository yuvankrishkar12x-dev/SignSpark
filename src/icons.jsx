// Simple line icons (no extra packages needed)
const base = {
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
};

export const HomeIcon = () => (
  <svg {...base}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></svg>
);
export const BookIcon = () => (
  <svg {...base}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /><path d="M8 7h7" /></svg>
);
export const CameraIcon = () => (
  <svg {...base}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
);
export const GameIcon = () => (
  <svg {...base}><rect x="2.5" y="7" width="19" height="11" rx="4" /><path d="M7 12.5h3M8.5 11v3" /><circle cx="15.5" cy="11.5" r=".8" fill="currentColor" /><circle cx="17.5" cy="13.5" r=".8" fill="currentColor" /></svg>
);
export const ChartIcon = () => (
  <svg {...base}><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></svg>
);
export const GearIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></svg>
);
export const HandIcon = () => (
  <svg {...base}><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11" /><path d="M11 10V4a1.5 1.5 0 0 1 3 0v7" /><path d="M14 10.5V5.5a1.5 1.5 0 0 1 3 0V13" /><path d="M8 12.5 6.6 11a1.6 1.6 0 0 0-2.4 2.1l3.3 4.4A6 6 0 0 0 12.3 20H13a5 5 0 0 0 5-5v-4" /></svg>
);
