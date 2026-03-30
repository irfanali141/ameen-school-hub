/* eslint-disable */
import { supabase } from "../supabase";
import { HOUSES, SEED_S, SEED_T } from "../constants";

const now = () => new Date().toISOString();

async function seedDB() {
  // Only seed if tables are empty
  const { data: existing } = await supabase.from("students").select("id").limit(1);
  if (existing && existing.length > 0) return;

  // ── Students (only columns confirmed to exist in the schema) ──
  for (const x of SEED_S) {
    const row = {
      name:           x.name,
      grade:          x.grade,
      father_name:    x.fatherName,
      section:        x.section,
      canteen_balance: x.canteenBalance || 0,
      phone:          x.phone || "",
      created_at:     now(),
    };
    // house_id: TEXT after migration; UUID before → try, log on fail
    if (x.houseId) row.house_id = x.houseId;
    // optional columns (exist after running fix_missing_columns.sql)
    if (x.studentCode) row.student_code = x.studentCode;
    if (x.talent)      row.talent = x.talent;
    row.enrollment_status = "active";  // exists after migration

    const { error } = await supabase.from("students").insert([row]);
    if (error) {
      // Retry without columns that may not exist yet
      const safe = { name: row.name, grade: row.grade, father_name: row.father_name,
                     section: row.section, canteen_balance: row.canteen_balance,
                     phone: row.phone, created_at: row.created_at };
      const { error: e2 } = await supabase.from("students").insert([safe]);
      if (e2) console.warn("seedDB students:", e2.message);
    }
  }

  // ── Teachers (only columns confirmed to exist) ──
  for (const x of SEED_T) {
    const row = {
      name:       x.name,
      subject:    x.subject,
      phone:      x.phone || "",
      email:      x.email || "",
      created_at: now(),
    };
    // optional columns (exist after running fix_missing_columns.sql)
    if (x.grade)        row.grade = x.grade;
    if (x.houseId)      row.house_id = x.houseId;
    if (x.employeeCode) row.employee_code = x.employeeCode;
    row.is_active = true;

    const { error } = await supabase.from("teachers").insert([row]);
    if (error) {
      const safe = { name: row.name, subject: row.subject, phone: row.phone,
                     email: row.email, created_at: row.created_at };
      const { error: e2 } = await supabase.from("teachers").insert([safe]);
      if (e2) console.warn("seedDB teachers:", e2.message);
    }
  }

  // ── Houses (upsert — always safe) ──
  for (const h of HOUSES) {
    const { error } = await supabase.from("houses").upsert([{
      id: h.id, points: 0, hvs_total: 0, hvs_weeks: 0,
      updated_at: now(),
    }]);
    if (error) console.warn("seedDB houses:", error.message);
  }
}

export default seedDB;
