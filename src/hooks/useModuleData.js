/* eslint-disable */
/**
 * useModuleData — gives any module its own isolated data subscription.
 *
 * USAGE (inside any module component):
 *   const { data: receipts, loading, error } = useModuleData("fee_receipts");
 *   const { data: logs } = useModuleData("hvs_logs");
 *
 * DESIGN:
 *   - Each module owns its own subscription, independent of App.js or other modules.
 *   - If the table is empty or missing, `data` is [] and `error` holds the message.
 *   - A missing table NEVER crashes the calling module — it just gets empty data.
 *   - Modules can coexist even if one table is misconfigured in Supabase.
 */
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";

const toSnake = str => str.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`);
const toCamel = str => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const normalise = row => {
  if (!row || typeof row !== "object") return row;
  const out = { ...row };
  Object.keys(row).forEach(k => {
    const c = toCamel(k);
    if (c !== k) out[c] = row[k];
  });
  return out;
};

export default function useModuleData(table, { orderBy = "created_at", ascending = false } = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!table) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        const { data: rows, error: err } = await supabase
          .from(table)
          .select("*")
          .order(orderBy, { ascending });

        if (cancelled) return;
        if (err) {
          setError(err.message);
          setData([]);
        } else {
          setError(null);
          setData((rows || []).map(normalise));
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();

    // Real-time subscription — re-fetch on any change
    channelRef.current = supabase
      .channel(`module_${table}_${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, fetch)
      .subscribe();

    return () => {
      cancelled = true;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [table]);

  return { data, loading, error };
}
