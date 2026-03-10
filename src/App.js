import React, { useState } from 'react';
import { GraduationCap, Printer, Coffee, Sun, Snowflake } from 'lucide-react';

const TEACHERS = {
  '*': { name: "Numan",    color: "#F59E0B", bg: "#FEF3C7" },
  '@': { name: "Naseer",   color: "#10B981", bg: "#D1FAE5" },
  '#': { name: "Farman",   color: "#3B82F6", bg: "#DBEAFE" },
  '!': { name: "Azmat",    color: "#6366F1", bg: "#E0E7FF" },
  '~': { name: "Anam",     color: "#84CC16", bg: "#ECFCCB" },
  '%': { name: "Tariq",    color: "#06B6D4", bg: "#CFFAFE" },
  '&': { name: "Saif Ali", color: "#F97316", bg: "#FFEDD5" },
  '^': { name: "Farhana",  color: "#EC4899", bg: "#FCE7F3" },
  '+': { name: "New",      color: "#8B5CF6", bg: "#EDE9FE" },
  '=': { name: "Irfan",    color: "#A855F7", bg: "#F3E8FF" },
  '>': { name: "Abbas",    color: "#14B8A6", bg: "#CCFBF1" },
};

const TIMINGS = {
  summer: { periods: ["08:30","09:05","09:40","10:10","10:40","11:30","12:00","12:30","01:00"], break: ["10:40","11:30"] },
  winter: { periods: ["09:00","09:35","10:10","10:40","11:10","12:00","12:30","01:00","01:30"], break: ["11:10","12:00"] }
};

const CLASSES = [
  { name: "1st Sunflower A", emoji: "🌻", periods: ["English*","Urdu@","QT!","Math#","Phonics~","Islamiyat%","GK+"] },
  { name: "1st Sunflower B", emoji: "🌻", periods: ["Urdu@","Math#","GK+","Islamiyat!","GK%","Phonics~","QT*"] },
  { name: "2nd Tulip A",     emoji: "🌷", periods: ["QT*","Urdu#","Phonics^","GK&","English+","Math>","Islamiyat%"] },
  { name: "2nd Tulip B",     emoji: "🌷", periods: ["Phonics^","Urdu%","Math~","English+","Islamiyat*","QT#","GK&"] },
  { name: "3rd Violet A",    emoji: "💜", periods: ["GK~","Islamiyat^","English#","QT*","Math&","Urdu%","Phonics@"] },
  { name: "3rd Violet B",    emoji: "💜", periods: ["QT+","English&","Math*","Urdu%","Islamiyat=","Science^","Phonics>"] },
  { name: "4th Jasmine",     emoji: "🌸", periods: ["Islamiyat%","GK~","Science=","Urdu^","English@","Math+","GK~"] },
];

const getTeacher = (subject) => {
  for (const [sym, t] of Object.entries(TEACHERS)) {
    if (subject.includes(sym)) return t;
  }
  return { name: null, color: "#94A3B8", bg: "#F8FAFC" };
};

const clean = (s) => s.replace(/[#*@^!%$&~+=<>]/g, '');

export default function App() {
  const [season, setSeason] = useState('summer');
  const [activeClass, setActiveClass] = useState(null);
  const T = TIMINGS[season];
  const periodLabel = (i) => `${T.periods[i]}-${T.periods[i+1]}`;

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#0A0F1E", minHeight: "100vh", color: "#E2E8F0" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .period-card { transition: transform 0.2s ease; }
        .period-card:hover { transform: translateY(-3px); }
        .class-btn { transition: all 0.2s ease; border: 2px solid transparent; cursor: pointer; }
        .class-btn:hover { border-color: #F59E0B; }
        .class-btn.active { border-color: #F59E0B; background: rgba(245,158,11,0.15) !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        @media print { .no-print { display: none !important; } }
        @media (max-width: 768px) { .sidebar { display: none; } .main-grid { grid-template-columns: repeat(4, 1fr) !important; } }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ background: "linear-gradient(135deg, #001C3D, #0A1628)", borderBottom: "3px solid #F59E0B", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, background: "#F59E0B", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={30} color="#001C3D" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#FFF", fontStyle: "italic" }}>Ameen Islamic Institute</div>
              <div style={{ fontSize: 10, color: "#F59E0B", letterSpacing: 3, marginTop: 3, fontFamily: "sans-serif" }}>MASTER TIMETABLE — SESSION 2026–27</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 10, padd
