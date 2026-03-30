/* eslint-disable */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://ryxjptmkicvupaqprdfa.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "sb_publishable_TQBixCySY8LJAi_qVN9RHw_cIWleR7q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== AUTH FUNCTIONS =====
export const signInWithEmailAndPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const createUserWithEmailAndPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn("signOut network error (ignored):", e?.message);
  }
};

export const onAuthStateChanged = (callback) => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    callback(session?.user || null);
  });
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
};

// ===== CASE NORMALISATION =====
// Supabase stores snake_case; legacy components read camelCase.
// These helpers bridge both directions so no component file needs editing.

const toSnake = (str) => str.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const keyToSnake = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [toSnake(k), v])
  );
};

const keyToCamel = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const camel = toCamel(k);
      // keep both snake and camel keys so code using either name works
      return [camel, v];
    })
  );
};

// Add camelCase aliases onto every row (keeps original snake_case keys too)
const normaliseRow = (row) => {
  if (!row || typeof row !== "object") return row;
  const out = { ...row };
  Object.keys(row).forEach((k) => {
    const camel = toCamel(k);
    if (camel !== k) out[camel] = row[k]; // e.g. out.houseId = row.house_id
  });
  // Special alias: Firebase used createdAt.toDate() — expose created_at as a plain Date
  if (out.created_at && !out.createdAt) {
    const d = new Date(out.created_at);
    out.createdAt = { toDate: () => d };
  }
  return out;
};

const normaliseRows = (rows) => (rows || []).map(normaliseRow);

// ===== DATABASE FUNCTIONS =====
export const addData = async (table, data) => {
  // Convert camelCase keys to snake_case before inserting
  const snake = keyToSnake({ ...data, created_at: new Date().toISOString() });
  const { error } = await supabase.from(table).insert([snake]);
  if (error) { console.error("addData error [" + table + "]:", error.message); throw error; }
};

export const getData = async (table) => {
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) { console.error("getData error [" + table + "]:", error.message); return []; }
  return normaliseRows(data);
};

export const updateData = async (table, id, updates) => {
  const snake = keyToSnake(updates);
  const { error } = await supabase.from(table).update(snake).eq("id", id);
  if (error) { console.error("updateData error [" + table + "]:", error.message); throw error; }
};

export const deleteData = async (table, id) => {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) { console.error("deleteData error [" + table + "]:", error.message); throw error; }
};

export const subscribeToTable = (table, callback, options = {}) => {
  // Initial fetch
  getData(table).then(callback);

  // Real-time subscription
  const subscription = supabase
    .channel(`${table}_changes`)
    .on("postgres_changes", { event: "*", schema: "public", table }, () => {
      getData(table).then(callback);
    })
    .subscribe();

  return () => supabase.removeChannel(subscription);
};
