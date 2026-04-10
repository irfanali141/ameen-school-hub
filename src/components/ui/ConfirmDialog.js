/* eslint-disable */
import { useState, useCallback, createContext, useContext } from "react";

const ConfirmCtx = createContext(null);

// Global ref — confirm() usable anywhere without a hook
let _resolve = null;
let _show = null;

/**
 * confirm("Are you sure?")  →  Promise<boolean>
 * confirm("Delete?", { confirmText:"Delete", danger:true })
 */
export const confirm = (message, opts = {}) => {
  return new Promise((resolve) => {
    if (_show) {
      _resolve = resolve;
      _show({ message, ...opts });
    } else {
      // fallback if provider not mounted
      resolve(window.confirm(message));
    }
  });
};

// ── Modal UI ──────────────────────────────────────────────────────────────────
function ConfirmModal({ dialog, onAnswer }) {
  if (!dialog) return null;
  const { message, title, confirmText = "تصدیق کریں", cancelText = "منسوخ", danger = false } = dialog;

  const overlay = {
    position: "fixed", inset: 0, zIndex: 99999,
    background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    animation: "cfadeIn 0.15s ease",
  };
  const box = {
    background: "linear-gradient(135deg,#1e293b,#0f172a)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "32px 36px",
    minWidth: "320px", maxWidth: "420px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
    textAlign: "center",
    animation: "cslideUp 0.18s ease",
  };
  const btnBase = {
    padding: "11px 28px", borderRadius: "12px", border: "none",
    cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem",
    fontWeight: "700", transition: "all 0.15s", letterSpacing: "0.03em",
  };

  return (
    <div style={overlay} onClick={() => onAnswer(false)}>
      <style>{`
        @keyframes cfadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes cslideUp { from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }
      `}</style>
      <div style={box} onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div style={{ fontSize: "2.4rem", marginBottom: "12px", lineHeight: 1 }}>
          {danger ? "🗑️" : "❓"}
        </div>

        {/* Title */}
        {title && (
          <div style={{ color: "#fff", fontWeight: "800", fontSize: "1.05rem", marginBottom: "8px" }}>
            {title}
          </div>
        )}

        {/* Message */}
        <div style={{
          color: "rgba(255,255,255,0.72)", fontSize: "0.88rem",
          lineHeight: 1.6, marginBottom: "28px",
          fontFamily: message?.match(/[\u0600-\u06FF]/) ? "'Noto Nastaliq Urdu',serif" : "inherit",
          direction: message?.match(/[\u0600-\u06FF]/) ? "rtl" : "ltr",
        }}>
          {message}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => onAnswer(false)}
            style={{ ...btnBase, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => onAnswer(true)}
            style={{
              ...btnBase,
              background: danger
                ? "linear-gradient(135deg,#dc2626,#991b1b)"
                : "linear-gradient(135deg,#2563eb,#1d4ed8)",
              color: "#fff",
              boxShadow: danger ? "0 4px 16px rgba(220,38,38,0.35)" : "0 4px 16px rgba(37,99,235,0.35)",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Provider — wrap app once ──────────────────────────────────────────────────
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  // Register global handlers on mount
  const mountRef = useCallback((node) => {
    _show = (opts) => setDialog(opts);
  }, []);

  // Also set _show immediately
  if (!_show) _show = (opts) => setDialog(opts);

  const handleAnswer = (result) => {
    setDialog(null);
    _resolve?.(result);
    _resolve = null;
  };

  return (
    <ConfirmCtx.Provider value={null}>
      <div ref={mountRef} style={{ display: "contents" }}>
        {children}
        <ConfirmModal dialog={dialog} onAnswer={handleAnswer} />
      </div>
    </ConfirmCtx.Provider>
  );
}
