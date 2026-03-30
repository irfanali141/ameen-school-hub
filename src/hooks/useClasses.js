/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

// Simple module-level cache so every component shares one fetch
let _cache = null;
let _listeners = [];

async function fetchAll() {
  const [{ data: c }, { data: s }] = await Promise.all([
    supabase.from("classes").select("*").order("display_order").order("name"),
    supabase.from("sections").select("*").order("name"),
  ]);
  _cache = { classes: c || [], sections: s || [] };
  _listeners.forEach(fn => fn(_cache));
}

// Returns { classes, sections, gradeOptions, sectionsFor(className) }
export default function useClasses() {
  const [data, setData] = useState(_cache || { classes: [], sections: [] });

  useEffect(() => {
    _listeners.push(setData);
    if (!_cache) fetchAll();
    else setData(_cache);

    // Realtime: refresh when classes/sections change
    const ch = supabase.channel("classes_sections_hook")
      .on("postgres_changes", { event: "*", schema: "public", table: "classes" },  fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "sections" }, fetchAll)
      .subscribe();

    return () => {
      _listeners = _listeners.filter(fn => fn !== setData);
      supabase.removeChannel(ch);
    };
  }, []);

  const FALLBACK_GRADES = ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"];

  const gradeOptions = data.classes.length > 0
    ? data.classes.map(c => c.name)
    : FALLBACK_GRADES;

  // Get sections for a given class name
  const sectionsFor = (className) => {
    if (!className) return [];
    if (data.classes.length === 0) return ["A","B","C"];
    const cls = data.classes.find(c => c.name === className);
    if (!cls) return [];
    return data.sections.filter(s => s.class_id === cls.id).map(s => s.name);
  };

  return {
    classes:      data.classes,
    sections:     data.sections,
    gradeOptions,
    sectionsFor,
    hasDBData:    data.classes.length > 0,
  };
}
