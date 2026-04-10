/* eslint-disable */
/**
 * ModuleShell — Error Boundary wrapper for every module/page.
 *
 * DESIGN PRINCIPLE: Crash isolation.
 *   - Each major module is wrapped in ModuleShell.
 *   - If a module throws any JS error, only THAT module shows an error card.
 *   - The rest of the app (nav, other modules) keeps working normally.
 *   - The user can click "Retry" to unmount/remount just that module.
 *
 * USAGE:
 *   <ModuleShell name="Fee Management">
 *     <FeeManagement ... />
 *   </ModuleShell>
 */
import React from "react";

const G = "#d4af37";
const N = "#0f172a";

class ModuleShell extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null, key: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(`[ModuleShell] ${this.props.name || "Module"} crashed:`, error, errorInfo);
  }

  retry = () => {
    this.setState(s => ({ error: null, errorInfo: null, key: s.key + 1 }));
  };

  render() {
    const { error, key } = this.state;
    const { name = "Module", children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback(error, this.retry);

      return (
        <div style={{
          minHeight: "40vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 20px",
        }}>
          <div style={{
            maxWidth: "480px", width: "100%",
            background: "rgba(239,68,68,0.06)",
            border: "1.5px solid rgba(239,68,68,0.3)",
            borderRadius: "16px",
            padding: "32px 28px",
            fontFamily: "'Public Sans', sans-serif",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2.4rem", marginBottom: "12px" }}>⚠️</div>
            <div style={{ fontSize: "1rem", fontWeight: "800", color: "#f87171", marginBottom: "6px" }}>
              {name} encountered an error
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(241,245,249,0.45)", marginBottom: "20px", lineHeight: 1.6 }}>
              This module crashed but the rest of the app is still running.
              <br />
              <span style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "rgba(248,113,113,0.6)" }}>
                {error?.message || String(error)}
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={this.retry}
                style={{
                  padding: "10px 24px", borderRadius: "10px", border: "none",
                  background: `linear-gradient(135deg,${G},#b8960a)`,
                  color: N, fontWeight: "700", fontSize: "0.85rem",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                🔄 Retry {name}
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 20px", borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent", color: "rgba(241,245,249,0.5)",
                  fontWeight: "600", fontSize: "0.82rem",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Key change forces full remount on retry
    return (
      <React.Fragment key={key}>
        {children}
      </React.Fragment>
    );
  }
}

export default ModuleShell;
