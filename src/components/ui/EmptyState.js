/* eslint-disable */

/**
 * EmptyState — reusable "no data" UI
 *
 * Props:
 *   icon        — emoji or text icon  (default "📭")
 *   title       — main heading        (default "کوئی ڈیٹا نہیں")
 *   subtitle    — secondary message
 *   action      — { label, onClick }  optional button
 *   compact     — boolean, smaller size for tables/sidebars
 */
export default function EmptyState({ icon = "📭", title = "کوئی ڈیٹا نہیں", subtitle, action, compact = false }) {
  const wrap = {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: compact ? "32px 16px" : "64px 24px",
    textAlign: "center", width: "100%",
    animation: "esFadeIn 0.35s ease",
  };
  const iconBox = {
    width: compact ? "64px" : "90px",
    height: compact ? "64px" : "90px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: compact ? "1.8rem" : "2.6rem",
    marginBottom: compact ? "12px" : "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  };
  const titleStyle = {
    color: "rgba(255,255,255,0.55)",
    fontSize: compact ? "0.85rem" : "1rem",
    fontWeight: "700",
    marginBottom: "6px",
    fontFamily: title?.match?.(/[\u0600-\u06FF]/) ? "'Noto Nastaliq Urdu',serif" : "'Public Sans',sans-serif",
    direction: title?.match?.(/[\u0600-\u06FF]/) ? "rtl" : "ltr",
    letterSpacing: "0.02em",
  };
  const subStyle = {
    color: "rgba(255,255,255,0.3)",
    fontSize: compact ? "0.72rem" : "0.8rem",
    lineHeight: 1.6, maxWidth: "280px",
    fontFamily: subtitle?.match?.(/[\u0600-\u06FF]/) ? "'Noto Nastaliq Urdu',serif" : "'Public Sans',sans-serif",
    direction: subtitle?.match?.(/[\u0600-\u06FF]/) ? "rtl" : "ltr",
  };
  const btnStyle = {
    marginTop: "18px", padding: "9px 24px", borderRadius: "30px",
    border: "1px solid rgba(212,175,55,0.4)",
    background: "rgba(212,175,55,0.12)", color: "#d4af37",
    fontSize: "0.8rem", fontWeight: "700", cursor: "pointer",
    fontFamily: "'Public Sans',sans-serif", letterSpacing: "0.06em",
    transition: "all 0.18s",
  };

  return (
    <div style={wrap}>
      <style>{`@keyframes esFadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <div style={iconBox}>{icon}</div>
      <div style={titleStyle}>{title}</div>
      {subtitle && <div style={subStyle}>{subtitle}</div>}
      {action && (
        <button style={btnStyle}
          onClick={action.onClick}
          onMouseEnter={e => e.currentTarget.style.background="rgba(212,175,55,0.22)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(212,175,55,0.12)"}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
