/* eslint-disable */
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

// ── Toast Context ─────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);

const ICONS = { success:"✅", error:"❌", warning:"⚠️", info:"ℹ️" };
const COLORS = {
  success: { bg:"rgba(34,197,94,0.12)",  border:"rgba(34,197,94,0.35)",  text:"#4ade80",  bar:"#22c55e" },
  error:   { bg:"rgba(239,68,68,0.12)",   border:"rgba(239,68,68,0.35)",   text:"#f87171",  bar:"#dc2626" },
  warning: { bg:"rgba(251,146,60,0.12)",  border:"rgba(251,146,60,0.35)",  text:"#fb923c",  bar:"#f97316" },
  info:    { bg:"rgba(96,165,250,0.12)",  border:"rgba(96,165,250,0.35)",  text:"#60a5fa",  bar:"#3b82f6" },
};

let _addToast = null;

// Global function — usable anywhere without hook
export const toast = {
  success: (msg, opts) => _addToast?.({ type:"success", msg, ...opts }),
  error:   (msg, opts) => _addToast?.({ type:"error",   msg, ...opts }),
  warning: (msg, opts) => _addToast?.({ type:"warning", msg, ...opts }),
  info:    (msg, opts) => _addToast?.({ type:"info",    msg, ...opts }),
};

// ── Single Toast item ─────────────────────────────────────────────────────────
function ToastItem({ id, type="success", msg, duration=3500, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const c = COLORS[type] || COLORS.info;

  useEffect(() => {
    // Enter animation
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto dismiss
    const t2 = setTimeout(() => dismiss(), duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 350);
  };

  return (
    <div
      onClick={dismiss}
      style={{
        position:"relative", overflow:"hidden",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius:"14px",
        padding:"13px 16px 13px 14px",
        display:"flex", alignItems:"flex-start", gap:"10px",
        cursor:"pointer", userSelect:"none",
        boxShadow:"0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
        backdropFilter:"blur(20px)",
        minWidth:"260px", maxWidth:"360px",
        fontFamily:"'Public Sans',sans-serif",
        transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        opacity: leaving ? 0 : visible ? 1 : 0,
        transform: leaving ? "translateX(120%)" : visible ? "translateX(0)" : "translateX(120%)",
        marginBottom:"8px",
      }}
    >
      {/* Icon */}
      <span style={{ fontSize:"1.1rem", flexShrink:0, marginTop:"1px" }}>{ICONS[type]}</span>

      {/* Message */}
      <div style={{ flex:1, color:"#f1f5f9", fontSize:"0.82rem", lineHeight:"1.45", fontWeight:"500" }}>
        {msg}
      </div>

      {/* Close */}
      <button onClick={e=>{e.stopPropagation();dismiss();}} style={{
        background:"none", border:"none", color:"rgba(255,255,255,0.35)",
        fontSize:"0.9rem", cursor:"pointer", padding:"0 0 0 4px", lineHeight:1, flexShrink:0
      }}>✕</button>

      {/* Progress bar */}
      <div style={{
        position:"absolute", bottom:0, left:0, height:"3px",
        background: c.bar, borderRadius:"0 0 14px 14px",
        animation: `toast-progress ${duration}ms linear forwards`,
      }}/>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback(({ type, msg, duration }) => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev.slice(-4), { id, type, msg, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Register global
  useEffect(() => { _addToast = addToast; return () => { _addToast = null; }; }, [addToast]);

  return (
    <ToastCtx.Provider value={addToast}>
      {children}
      {/* Toast container */}
      <div style={{
        position:"fixed", bottom:"24px", right:"24px",
        zIndex:99999, display:"flex", flexDirection:"column-reverse",
        alignItems:"flex-end", pointerEvents:"none",
      }}>
        <style>{`
          @keyframes toast-progress {
            from { width: 100%; }
            to   { width: 0%;   }
          }
        `}</style>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents:"all" }}>
            <ToastItem {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
