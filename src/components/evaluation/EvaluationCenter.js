/* eslint-disable */
import { useState } from "react";
import EvaluationScales from "../academic/EvaluationScales";
import HVSEntry         from "../houses/HVSEntry";
import { C } from "../../constants";

const G = C.gold;

const TABS = [
  { id:"scales", icon:"🎯", label:"Student Assessment", sub:"8 Scales · Radar Chart · Monthly" },
  { id:"hvs",    icon:"🏆", label:"House Valor System",  sub:"HVS · Group Scoring · All Roles" },
];

export default function EvaluationCenter({ students, houses, addData, updateData, updateHousePoints, hvsLogs, userRole }) {
  const [tab, setTab] = useState("scales");

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${C.navyDark} 0%,#0d1f3c 60%,${C.navyDark} 100%)`, fontFamily:"'Public Sans',sans-serif" }}>

      {/* ── Top tab bar ── */}
      <div style={{ padding:"16px 20px 0", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", gap:"6px", maxWidth:"520px" }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  flex:1, padding:"12px 16px", borderRadius:"12px 12px 0 0",
                  border:`1px solid ${active ? G+"60" : "rgba(255,255,255,0.08)"}`,
                  borderBottom: active ? `1px solid ${C.navyDark}` : "1px solid rgba(255,255,255,0.08)",
                  background: active ? `rgba(212,175,55,0.12)` : "rgba(255,255,255,0.03)",
                  cursor:"pointer", fontFamily:"inherit", textAlign:"left",
                  transition:"all 0.15s",
                }}>
                <div style={{ fontSize:"0.85rem", fontWeight:"800", color: active ? G : "rgba(255,255,255,0.4)", display:"flex", alignItems:"center", gap:"7px" }}>
                  <span>{t.icon}</span> {t.label}
                </div>
                <div style={{ fontSize:"0.58rem", color: active ? "rgba(212,175,55,0.55)" : "rgba(255,255,255,0.2)", marginTop:"2px" }}>
                  {t.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      {tab === "scales" && (
        <EvaluationScales
          addData={addData}
          students={students}
        />
      )}
      {tab === "hvs" && (
        <HVSEntry
          students={students}
          houses={houses}
          addData={addData}
          updateHousePoints={updateHousePoints}
          hvsLogs={hvsLogs}
          userRole={userRole}
        />
      )}
    </div>
  );
}
