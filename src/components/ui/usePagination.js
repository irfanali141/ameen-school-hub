/* eslint-disable */
import { useState, useEffect, useMemo } from "react";

/**
 * usePagination
 * Slices any array into pages. Resets to page 1 when data changes.
 *
 * @param {Array}  data      — full array to paginate
 * @param {number} pageSize  — items per page (default 24)
 * @returns {{ paged, page, totalPages, setPage, PaginationBar }}
 */
export function usePagination(data, pageSize = 24) {
  const [page, setPageRaw] = useState(1);

  // Reset to page 1 whenever data length or content changes
  useEffect(() => { setPageRaw(1); }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const setPage = (p) => setPageRaw(Math.min(Math.max(1, p), totalPages));

  const paged = useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize]
  );

  return { paged, page, totalPages, setPage };
}

/**
 * PaginationBar
 * Renders prev / page numbers / next controls.
 * Props: page, totalPages, setPage, total (optional — shows record count)
 */
export function PaginationBar({ page, totalPages, setPage, total, pageSize }) {
  if (totalPages <= 1) return null;

  const G = "#d4af37";
  const btnBase = {
    padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent", color: "rgba(241,245,249,0.55)", fontSize: "0.72rem",
    fontWeight: "600", cursor: "pointer", fontFamily: "'Public Sans',sans-serif",
    transition: "all 0.12s",
  };
  const btnActive = {
    ...btnBase, background: "rgba(212,175,55,0.18)",
    border: `1px solid ${G}`, color: G,
  };
  const btnDisabled = { ...btnBase, opacity: 0.3, cursor: "default" };

  // Show at most 5 page numbers around current page
  const pages = [];
  const delta = 2;
  const left  = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);
  for (let i = left; i <= right; i++) pages.push(i);

  const start = (page - 1) * (pageSize || 24) + 1;
  const end   = Math.min(page * (pageSize || 24), total || 0);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: "6px", padding: "16px 0 4px", flexWrap: "wrap",
    }}>
      {/* Prev */}
      <button
        style={page === 1 ? btnDisabled : btnBase}
        onClick={() => page > 1 && setPage(page - 1)}
        disabled={page === 1}
      >← Prev</button>

      {/* First page + ellipsis */}
      {left > 1 && <>
        <button style={btnBase} onClick={() => setPage(1)}>1</button>
        {left > 2 && <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem" }}>…</span>}
      </>}

      {/* Page numbers */}
      {pages.map(p => (
        <button key={p} style={p === page ? btnActive : btnBase} onClick={() => setPage(p)}>
          {p}
        </button>
      ))}

      {/* Last page + ellipsis */}
      {right < totalPages && <>
        {right < totalPages - 1 && <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem" }}>…</span>}
        <button style={btnBase} onClick={() => setPage(totalPages)}>{totalPages}</button>
      </>}

      {/* Next */}
      <button
        style={page === totalPages ? btnDisabled : btnBase}
        onClick={() => page < totalPages && setPage(page + 1)}
        disabled={page === totalPages}
      >Next →</button>

      {/* Record count */}
      {total > 0 && (
        <span style={{ color: "rgba(241,245,249,0.3)", fontSize: "0.65rem", marginLeft: "8px" }}>
          {start}–{end} of {total}
        </span>
      )}
    </div>
  );
}
