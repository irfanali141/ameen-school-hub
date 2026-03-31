-- ═══════════════════════════════════════════════════════════
-- Ameen School Hub — Academic Planning Tables
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scheme_of_studies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  grade text NOT NULL,
  subject text NOT NULL,
  periods_per_week integer DEFAULT 5,
  teacher_name text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE scheme_of_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sos_all" ON scheme_of_studies FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS academic_calendar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  event_date date NOT NULL,
  event_type text NOT NULL DEFAULT 'activity',
  grade text DEFAULT 'All',
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cal_all" ON academic_calendar FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS term_breakup (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  term_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  academic_year text DEFAULT '2025-2026',
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE term_breakup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "term_all" ON term_breakup FOR ALL USING (true) WITH CHECK (true);
