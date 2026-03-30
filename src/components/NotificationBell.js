/* eslint-disable */
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";

/**
 * NotificationBell
 * Shows pending award nominations count with real-time updates.
 * Props:
 *   role     — current user role string
 *   setPage  — navigate to page function
 */
export default function NotificationBell({ role, setPage }) {
  const [pending, setPending]   = useState([]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(true);
  const dropRef                 = useRef(null);

  const canApprove = ["director","admin","principal"].includes(role);

  useEffect(() => {
    loadNotifications();

    // Real-time subscription: re-fetch when award_nominations changes
    const channel = supabase
      .channel("bell_nominations")
      .on("postgres_changes", { event: "*", schema: "public", table: "award_nominations" }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await supabase
        .from("award_nominations")
        .select("id,award_code,student_name,house_id,nominated_by,created_at,status")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);
      setPending(data || []);
    } catch {}
    setLoading(false);
  };

  const count = pending.length;

  return (
    <div ref={dropRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        style={{
          position: "relative",
          background: open ? "rgba(212,175,55,0.18)" : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "10px",
          width: "36px", height: "36px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          fontSize: "1.1rem",
          transition: "background 0.15s",
        }}
      >
        🔔
        {count > 0 && (
          <span style={{
            position: "absolute", top: "-6px", right: "-6px",
            background: "#ef4444", color: "#fff",
            borderRadius: "50%",
            width: count > 9 ? "20px" : "16px",
            height: "16px",
            fontSize: "0.55rem", fontWeight: "800",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Public Sans',sans-serif",
            boxShadow: "0 0 0 2px #0f172a",
          }}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: "320px", maxHeight: "420px", overflowY: "auto",
          background: "#1e293b",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: "14px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          zIndex: 9999,
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "sticky", top: 0, background: "#1e293b", borderRadius: "14px 14px 0 0",
          }}>
            <div>
              <div style={{ color: "#d4af37", fontSize: "0.58rem", fontWeight: "700", letterSpacing: "0.1em", fontFamily: "'Public Sans',sans-serif" }}>NOTIFICATIONS</div>
              <div style={{ color: "white", fontSize: "0.85rem", fontWeight: "700" }}>
                {count > 0 ? `${count} زیر التواء نامزدگیاں` : "کوئی نامزدگی نہیں"}
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>Loading…</div>
          )}

          {/* Empty state */}
          {!loading && count === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>✅</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>All nominations reviewed</div>
            </div>
          )}

          {/* Nomination list */}
          {!loading && pending.map((nom, i) => {
            const timeAgo = formatTimeAgo(nom.created_at);
            return (
              <div key={nom.id} style={{
                padding: "12px 16px",
                borderBottom: i < pending.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                display: "flex", gap: "10px", alignItems: "flex-start",
              }}>
                <div style={{ fontSize: "1.2rem", flexShrink: 0, marginTop: "2px" }}>🏅</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "white", fontSize: "0.78rem", fontWeight: "700", marginBottom: "2px" }}>
                    {nom.student_name || "Unknown Student"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", marginBottom: "4px" }}>
                    Award: <span style={{ color: "#d4af37" }}>{nom.award_code}</span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}>
                    By {nom.nominated_by || "—"} · {timeAgo}
                  </div>
                </div>
                <span style={{
                  padding: "2px 8px", borderRadius: "20px",
                  background: "rgba(251,191,36,0.12)", color: "#fbbf24",
                  fontSize: "0.55rem", fontWeight: "700", flexShrink: 0,
                  border: "1px solid rgba(251,191,36,0.25)",
                }}>Pending</span>
              </div>
            );
          })}

          {/* Footer action */}
          {count > 0 && canApprove && setPage && (
            <div style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              position: "sticky", bottom: 0, background: "#1e293b",
              borderRadius: "0 0 14px 14px",
            }}>
              <button
                onClick={() => { setPage("houses"); setOpen(false); }}
                style={{
                  width: "100%", padding: "9px", borderRadius: "9px", border: "none",
                  background: "linear-gradient(135deg,#d4af37,#b8960a)",
                  color: "#0f172a", fontSize: "0.72rem", fontWeight: "700",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Review in Awards Hub →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
