/* eslint-disable */
// Firebase has been replaced with Supabase.
// This file is kept as a stub so legacy imports don't break during migration.
// All app code now uses src/supabase.js directly.

export const auth = null;
export const db = null;
export const signInWithEmailAndPassword = () => Promise.reject(new Error("Use supabase"));
export const signOut = () => Promise.reject(new Error("Use supabase"));
export const onAuthStateChanged = () => () => {};
export const createUserWithEmailAndPassword = () => Promise.reject(new Error("Use supabase"));
export const collection = () => null;
export const getDocs = () => Promise.resolve({ empty: true, docs: [] });
export const fbAddDoc = () => Promise.resolve();
export const doc = () => null;
export const setDoc = () => Promise.resolve();
export const updateDoc = () => Promise.resolve();
export const onSnapshot = () => () => {};
export const serverTimestamp = () => new Date().toISOString();
export const query = (ref) => ref;
export const orderBy = () => null;
export const limit = () => null;
