/* eslint-disable */
/**
 * SchoolContext — single source of truth for shared school data.
 *
 * DESIGN PRINCIPLE: Loose coupling via context.
 *   - Modules READ shared data from this context (students, teachers, houses).
 *   - Modules WRITE their OWN data using addData/updateData from this context.
 *   - Each module's private tables are owned by that module alone (see useModuleData).
 *   - A crash or bad data in one module never cascades to others.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  supabase,
  addData    as sbAdd,
  getData,
  updateData as sbUpdate,
  subscribeToTable,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "../supabase";
import { DEMO, ROLE_PAGES } from "../constants";
import seedDB from "../utils/seedDB";

// ─── Context ────────────────────────────────────────────────────────────────
const SchoolContext = createContext(null);

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool must be used inside <SchoolProvider>");
  return ctx;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function inferRole(email) {
  const demo = DEMO.find(d => d.email === email);
  if (demo) return demo.role;
  if (email?.includes("housemaster")) return "housemaster";
  if (email?.includes("madrasa"))     return "madrasa";
  return "teacher";
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function SchoolProvider({ children }) {
  // ── Auth ──
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [authErr, setAuthErr] = useState("");

  // ── Shared tables (read by multiple modules) ──
  const [students,    setStudents]    = useState([]);
  const [teachers,    setTeachers]    = useState([]);
  const [houses,      setHouses]      = useState([]);
  const [hvsLogs,     setHvsLogs]     = useState([]);
  const [fees,        setFees]        = useState([]);
  const [results,     setResults]     = useState([]);
  const [hifzLogs,    setHifzLogs]    = useState([]);
  const [attendance,  setAttendance]  = useState([]);
  const [evalScales,  setEvalScales]  = useState([]);
  const [dbClasses,   setDbClasses]   = useState([]);
  const [dbSections,  setDbSections]  = useState([]);
  const [feeReceipts, setFeeReceipts] = useState([]);

  // ── Unread messages ──
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  // ── Derived role ──
  const role = user ? inferRole(user.email) : null;

  // ── Table → setter map (for instant refresh after write) ──
  const TABLE_SETTERS = {
    students:          setStudents,
    teachers:          setTeachers,
    houses:            setHouses,
    hvs_logs:          setHvsLogs,
    fees:              setFees,
    results:           setResults,
    hifz_logs:         setHifzLogs,
    attendance:        setAttendance,
    evaluation_scales: setEvalScales,
    classes:           setDbClasses,
    sections:          setDbSections,
    fee_receipts:      setFeeReceipts,
  };

  // ── Auth lifecycle ──
  useEffect(() => {
    return onAuthStateChanged(async u => {
      setUser(u);
      setLoading(false);
      if (u) await seedDB().catch(() => {});
    });
  }, []);

  // ── Subscribe to all shared tables (only when logged in) ──
  useEffect(() => {
    if (!user) return;
    const unsubs = Object.entries(TABLE_SETTERS).map(([table, setter]) =>
      subscribeToTable(table, setter)
    );
    return () => unsubs.forEach(fn => fn());
  }, [user]);

  // ── Unread parent messages ──
  useEffect(() => {
    if (!user) return;
    const senderRole = ["parent","student"].includes(role) ? "staff" : "parent";
    const fetch = async () => {
      try {
        const { count } = await supabase
          .from("parent_messages")
          .select("id", { count: "exact", head: true })
          .eq("is_read", false)
          .eq("sender_role", senderRole);
        setUnreadMsgCount(count || 0);
      } catch {}
    };
    fetch();
    const ch = supabase.channel("school_ctx_msgs")
      .on("postgres_changes", { event: "*", schema: "public", table: "parent_messages" }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [user, role]);

  // ── Write helpers ──
  const refreshTable = useCallback((table) => {
    const setter = TABLE_SETTERS[table];
    if (setter) getData(table).then(d => { if (d && !d.error) setter(d); });
  }, []);

  const addData = useCallback(async (table, data) => {
    await sbAdd(table, data);
    refreshTable(table);
  }, [refreshTable]);

  const updateDataWrapped = useCallback(async (table, id, data) => {
    await sbUpdate(table, id, data);
    refreshTable(table);
  }, [refreshTable]);

  const updateHousePoints = useCallback(async (houseId, pts) => {
    const hd = houses.find(h => h.id === houseId);
    if (!hd) return;
    await sbUpdate("houses", houseId, {
      points:     (hd.points    || 0) + pts,
      hvs_total:  (hd.hvs_total || 0) + pts,
      hvs_weeks:  (hd.hvs_weeks || 0) + 1,
    });
    refreshTable("houses");
  }, [houses, refreshTable]);

  // ── Auth actions ──
  const login = async (email, pass) => {
    setAuthErr("");
    const demoUser = DEMO.find(d => d.email === email && d.password === pass);
    try {
      try { await signInWithEmailAndPassword(email, pass); }
      catch { await createUserWithEmailAndPassword(email, pass); }
    } catch {
      if (demoUser) { setUser({ email, id: email }); setLoading(false); }
      else setAuthErr("Invalid email or password");
    }
  };
  const logout = () => signOut();

  const value = {
    // Auth
    user, loading, authErr, role, login, logout,
    // Shared data
    students, teachers, houses, hvsLogs, fees, results,
    hifzLogs, attendance, evalScales, dbClasses, dbSections,
    feeReceipts, unreadMsgCount,
    // Write helpers
    addData, updateData: updateDataWrapped, updateHousePoints,
    refreshTable,
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
}
