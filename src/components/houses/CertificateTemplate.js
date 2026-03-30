/* eslint-disable */
import letterhead from "../../assets/letterhead.png";
import { HOUSES } from "../../constants";

const CERT_PRINT_ID = "cert-print-area";

const injectPrint = () => {
  if (!document.getElementById("cert-print-style")) {
    const s = document.createElement("style");
    s.id = "cert-print-style";
    s.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #${CERT_PRINT_ID}, #${CERT_PRINT_ID} * { visibility: visible !important; }
        #${CERT_PRINT_ID} {
          position: fixed !important;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: white;
          padding: 0; margin: 0;
          color: #000;
          direction: rtl;
          font-family: 'Segoe UI',Arial,serif;
        }
        .no-print { display: none !important; }
        @page { margin: 0; size: A4; }
      }
    `;
    document.head.appendChild(s);
  }
  window.print();
};

/**
 * CertificateTemplate
 * Props:
 *   award  — { icon, titleUr, titleEn }
 *   winner — { winnerName, winnerNameUr, houseId, houseColor }
 */
export default function CertificateTemplate({ award, winner }) {
  const hInfo = HOUSES.find(h => h.id === winner?.houseId);
  const houseColor = hInfo?.color || "#b7860b";
  const today = new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });
  const todayEn = new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div>
      {/* Print button — hidden on print */}
      <div className="no-print" style={{
        display: "flex", justifyContent: "center", padding: "12px",
        background: "#f0ede8", borderBottom: "1px solid #e5e7eb",
      }}>
        <button onClick={injectPrint} style={{
          padding: "10px 28px", borderRadius: "10px", border: "none",
          cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem", fontWeight: "700",
          background: "linear-gradient(135deg,#b7860b,#7a5807)", color: "#fff",
          boxShadow: "0 4px 12px rgba(183,134,11,0.3)",
        }}>
          🖨️ Print
        </button>
      </div>

      {/* A4 Certificate */}
      <div id={CERT_PRINT_ID} style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#fffdf8",
        margin: "0 auto",
        padding: "0",
        boxSizing: "border-box",
        direction:"ltr",
        fontFamily: "'Segoe UI',Arial,serif",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Decorative border */}
        <div style={{
          position: "absolute", inset: "12px",
          border: `3px solid ${houseColor}`,
          borderRadius: "4px", pointerEvents: "none",
          zIndex: 0,
        }} />
        <div style={{
          position: "absolute", inset: "18px",
          border: `1px solid ${houseColor}60`,
          borderRadius: "2px", pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* Corner ornaments */}
        {[
          { top: "8px",    right: "8px"  },
          { top: "8px",    left: "8px"   },
          { bottom: "8px", right: "8px"  },
          { bottom: "8px", left: "8px"   },
        ].map((pos, i) => (
          <div key={i} style={{
            position: "absolute", ...pos,
            width: "40px", height: "40px",
            fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center",
            color: houseColor, zIndex: 1, lineHeight: 1,
          }}>✦</div>
        ))}

        {/* Letterhead */}
        <div style={{ textAlign: "center", padding: "28px 40px 0", position: "relative", zIndex: 1 }}>
          <img
            src={letterhead}
            alt="Ameen School Letterhead"
            style={{ maxWidth: "100%", height: "auto", maxHeight: "110px", objectFit: "contain" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        </div>

        {/* Divider line */}
        <div style={{ margin: "16px 40px 0", height: "2px", background: `linear-gradient(90deg,transparent,${houseColor},transparent)`, position: "relative", zIndex: 1 }} />

        {/* "Certificate of Achievement" heading */}
        <div style={{ textAlign: "center", padding: "20px 40px 0", position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: "0.65rem", letterSpacing: "0.25em", color: "#888",
            textTransform: "uppercase", direction: "ltr", fontFamily: "'Public Sans',sans-serif",
            marginBottom: "6px",
          }}>
            CERTIFICATE OF ACHIEVEMENT
          </div>
          <div style={{ fontSize: "1.1rem", color: "#555", fontFamily: "'Segoe UI',serif" }}>
            Certificate of Appreciation
          </div>
        </div>

        {/* Award icon + name */}
        <div style={{ textAlign: "center", padding: "28px 40px 0", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: "10px" }}>{award?.icon || "🏆"}</div>

          {/* Urdu award name — large */}
          <div style={{
            fontSize: "2.2rem",
            fontWeight: "900",
            color: houseColor,
            lineHeight: 1.2,
            marginBottom: "8px",
            textShadow: `0 2px 8px ${houseColor}30`,
          }}>
            {award?.titleUr}
          </div>

          {/* English award name */}
          <div style={{
            fontSize: "0.85rem",
            color: "#777",
            fontFamily: "'Public Sans',sans-serif",
            direction: "ltr",
            letterSpacing: "0.05em",
            marginBottom: "28px",
          }}>
            {award?.titleEn}
          </div>

          {/* Awarded to */}
          <div style={{ fontSize: "0.7rem", color: "#999", marginBottom: "8px", fontFamily: "'Segoe UI',serif" }}>
            This certificate is awarded
          </div>

          {/* Winner name — most prominent */}
          <div style={{
            fontSize: "2.8rem",
            fontWeight: "900",
            color: "#1e293b",
            lineHeight: 1.1,
            marginBottom: "6px",
            borderBottom: `3px solid ${houseColor}`,
            display: "inline-block",
            paddingBottom: "6px",
            minWidth: "200px",
          }}>
            {winner?.winnerNameUr || winner?.winnerName || "—"}
          </div>

          {/* House badge */}
          {hInfo && (
            <div style={{ marginTop: "12px" }}>
              <span style={{
                display: "inline-block",
                padding: "6px 20px", borderRadius: "30px",
                background: `${houseColor}18`,
                border: `2px solid ${houseColor}40`,
                color: houseColor,
                fontSize: "0.85rem",
                fontWeight: "700",
                fontFamily: "'Public Sans',sans-serif",
              }}>
                {hInfo.emoji} {hInfo.nameEn} House — {hInfo.name}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ margin: "30px 60px", height: "1px", background: `${houseColor}30`, position: "relative", zIndex: 1 }} />

        {/* Date + Director signature */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          padding: "0 60px 40px", position: "relative", zIndex: 1,
        }}>
          {/* Date block */}
          <div style={{ textAlign: "center" }}>
            <div style={{ height: "1px", background: "#ccc", width: "140px", marginBottom: "6px" }} />
            <div style={{ fontSize: "0.72rem", color: "#666", fontFamily: "'Public Sans',sans-serif", direction: "ltr" }}>{todayEn}</div>
            <div style={{ fontSize: "0.7rem", color: "#888", fontFamily: "'Segoe UI',serif" }}>{today}</div>
            <div style={{ fontSize: "0.58rem", color: "#aaa", marginTop: "3px", fontFamily: "'Public Sans',sans-serif" }}>DATE</div>
          </div>

          {/* School seal placeholder */}
          <div style={{
            width: "70px", height: "70px", borderRadius: "50%",
            border: `2px dashed ${houseColor}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.55rem", color: "#ccc", textAlign: "center", lineHeight: 1.3,
            fontFamily: "'Public Sans',sans-serif",
          }}>
            SCHOOL<br />SEAL
          </div>

          {/* Director signature */}
          <div style={{ textAlign: "center" }}>
            <div style={{ height: "1px", background: "#ccc", width: "140px", marginBottom: "6px" }} />
            <div style={{ fontSize: "0.72rem", color: "#666", fontFamily: "'Public Sans',sans-serif" }}>Director</div>
            <div style={{ fontSize: "0.7rem", color: "#888", fontFamily: "'Segoe UI',serif" }}>Signature Director</div>
            <div style={{ fontSize: "0.58rem", color: "#aaa", marginTop: "3px", fontFamily: "'Public Sans',sans-serif" }}>SIGNATURE</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "0 40px 24px",
          fontSize: "0.58rem", color: "#bbb",
          fontFamily: "'Public Sans',sans-serif",
          position: "relative", zIndex: 1,
          direction: "ltr",
        }}>
          Ameen School — Nurturing Excellence in Faith, Character & Knowledge
        </div>
      </div>
    </div>
  );
}
