/* eslint-disable */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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

// ===== DATABASE FUNCTIONS =====
export const addData = async (table, data) => {
  const { error } = await supabase.from(table).insert([{ ...data, created_at: new Date().toISOString() }]);
  if (error) { console.error("addData:", error.message); throw error; }
};

export const getData = async (table) => {
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) { console.error("getData:", error.message); return []; }
  return data || [];
};

export const updateData = async (table, id, updates) => {
  const { error } = await supabase.from(table).update(updates).eq("id", id);
  if (error) { console.error("updateData:", error.message); throw error; }
};

export const deleteData = async (table, id) => {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) { console.error("deleteData:", error.message); throw error; }
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
