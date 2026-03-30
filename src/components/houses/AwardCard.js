/* eslint-disable */
import { HOUSES } from "../../constants";

const G = "#d4af37";
const N = "#0f172a";
const N2 = "#1e293b";
const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
};

const CAN_NOMINATE = ["director", "housemaster", "teacher", "madrasa"];

/**
 * AwardCard
 * Props:
 *   award        — { key, titleUr, titleEn, icon, auto, basis }
 *   winner       — { winnerName, winnerNameUr, houseId, houseColor, extra } | null
 *   role         — current user role string
 *   onNominate   — () => void
 *   onCertificate — () => void | null
 */
export default function AwardCard({ award, winner, role, onNominate, onCertificate, topHouseSuggestion }) {
  const hInfo = winner?.houseId ? HOUSES.find(h => h.id === winner.houseId) : null;

  return (
    <div style={{
      ...glass,
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      borderTop: `3px solid ${hInfo?.color || G}`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "-30px", right: "-30px",
        width: "100px", height: "100px", borderRadius: "50%",
        background: `${hInfo?.color || G}08`, pointerEvents: "none",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {/* Auto / Manual badge */}
          <span style={{
            fontSize: "0.54rem", fontWeight: "700", letterSpacing: "0.08em",
            padding: "2px 8px", borderRadius: "20px",
            background: award.auto ? "rgba(74,222,128,0.12)" : "rgba(212,175,55,0.12)",
            color: award.auto ? "#4ade80" : G,
            border: `1px solid ${award.auto ? "rgba(74,222,128,0.25)" : "rgba(212,175,55,0.25)"}`,
            display: "inline-block", marginBottom: "6px",
          }}>
            {award.auto ? "Auto 🤖" : "Manual ✍️"}
          </span>
          <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#f1f5f9" }}>
            {award.icon} {award.titleUr}
          </div>
          <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", direction: "ltr", textAlign: "right" }}>
            {award.titleEn}
          </div>
        </div>

        {/* House badge */}
        {hInfo && (
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: `linear-gradient(135deg,${hInfo.color}33,${hInfo.color}11)`,
            border: `1px solid ${hInfo.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.3rem", flexShrink: 0,
          }}>
            {hInfo.emoji}
          </div>
        )}
      </div>

      {/* Winner info */}
      {/* Top house suggestion hint for star_of_week */}
      {topHouseSuggestion && !winner && (
        <div style={{ padding:"10px 12px", borderRadius:"10px", background:`${topHouseSuggestion.color}12`, border:`1px solid ${topHouseSuggestion.color}30`, marginBottom:"6px" }}>
          <div style={{ fontSize:"0.56rem", color:"rgba(212,175,55,0.6)", fontWeight:"700", letterSpacing:"0.08em", marginBottom:"3px" }}>THIS WEEK'S TOP HOUSE</div>
          <div style={{ fontSize:"0.85rem", fontWeight:"800", color:topHouseSuggestion.color }}>{topHouseSuggestion.emoji} {topHouseSuggestion.nameEn}</div>
          <div style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>Avg HVS: {topHouseSuggestion.avg} — nominate the standout student from this house</div>
        </div>
      )}

      {winner ? (
        <div style={{
          background: `${hInfo?.color || G}10`,
          borderRadius: "10px",
          padding: "12px 14px",
          border: `1px solid ${hInfo?.color || G}20`,
        }}>
          <div style={{ fontSize: "0.58rem", color: "rgba(212,175,55,0.5)", fontWeight: "700", marginBottom: "4px" }}>Winner</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "900", color: hInfo?.color || G, lineHeight: 1.1, marginBottom: "2px" }}>
            {winner.winnerNameUr || winner.winnerName}
          </div>
          {winner.winnerNameUr !== winner.winnerName && (
            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", direction: "ltr" }}>{winner.winnerName}</div>
          )}
          {hInfo && (
            <span style={{
              display: "inline-block", marginTop: "6px",
              padding: "2px 10px", borderRadius: "20px", fontSize: "0.58rem",
              background: `${hInfo.color}20`, color: hInfo.color, fontWeight: "700",
              border: `1px solid ${hInfo.color}30`,
            }}>
              {hInfo.emoji} {hInfo.nameEn}
            </span>
          )}
          {winner.extra && (
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>{winner.extra}</div>
          )}
        </div>
      ) : (
        <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>No winner yet</div>
          <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.15)", marginTop: "3px" }}>{award.basis}</div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
        {/* Nominate — role-gated */}
        {CAN_NOMINATE.includes(role) && !award.auto && (
          <button onClick={onNominate} style={{
            flex: 1, padding: "9px 12px", borderRadius: "9px", border: "none",
            cursor: "pointer", fontFamily: "inherit", fontSize: "0.68rem", fontWeight: "700",
            background: "rgba(212,175,55,0.12)", color: G,
            border: "1px solid rgba(212,175,55,0.25)",
          }}>
            ✍️ Nominate
          </button>
        )}

        {/* Print Certificate */}
        {onCertificate && winner && (
          <button onClick={onCertificate} style={{
            flex: 1, padding: "9px 12px", borderRadius: "9px", border: "none",
            cursor: "pointer", fontFamily: "inherit", fontSize: "0.68rem", fontWeight: "700",
            background: "rgba(74,222,128,0.1)", color: "#4ade80",
            border: "1px solid rgba(74,222,128,0.2)",
          }}>
            🖨️ Certificate
          </button>
        )}
      </div>
    </div>
  );
}
