/* eslint-disable */
import { useState, useEffect } from "react";
import { confirm } from '../ui/ConfirmDialog';
import { supabase } from "../../supabase";

const G = "#d4af37"; const W = "#f1f5f9";
const glass = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(212,175,55,0.18)", borderRadius:"14px" };
const inp = { width:"100%", padding:"10px 14px", borderRadius:"10px", border:"1px solid rgba(212,175,55,0.25)", background:"rgba(255,255,255,0.06)", color:W, fontSize:"0.8rem", fontFamily:"'Public Sans',sans-serif", outline:"none", boxSizing:"border-box" };
const lbl = { fontSize:"0.7rem", color:"rgba(255,255,255,0.5)", marginBottom:"4px", display:"block" };
const btn = (bg, col) => ({ background:bg, color:col||W, border:"none", borderRadius:"9px", padding:"8px 16px", fontSize:"0.75rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" });

export default function ClassesAndSections() {
  const [classes, setClasses]   = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Class form
  const [showClassForm, setShowClassForm] = useState(false);
  const [editClass, setEditClass]         = useState(null); // null = add mode
  const [classF, setClassF]               = useState({ name:"", display_order:0 });

  // Section form
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editSection, setEditSection]         = useState(null);
  const [sectionF, setSectionF]               = useState({ class_id:"", name:"" });

  // Which class is expanded to show its sections
  const [expandedClass, setExpandedClass] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: c } = await supabase.from("classes").select("*").order("display_order").order("name");
    const { data: s } = await supabase.from("sections").select("*").order("name");
    setClasses(c || []);
    setSections(s || []);
    setLoading(false);
  };

  // ── CLASS CRUD ──────────────────────────────────────────────
  const openAddClass = () => {
    setEditClass(null);
    setClassF({ name:"", display_order: classes.length });
    setShowClassForm(true);
  };
  const openEditClass = (cls) => {
    setEditClass(cls);
    setClassF({ name: cls.name, display_order: cls.display_order || 0 });
    setShowClassForm(true);
  };
  const saveClass = async () => {
    if (!classF.name.trim()) return;
    if (editClass) {
      await supabase.from("classes").update({ name: classF.name.trim(), display_order: Number(classF.display_order) }).eq("id", editClass.id);
    } else {
      await supabase.from("classes").insert([{ name: classF.name.trim(), display_order: Number(classF.display_order) }]);
    }
    setShowClassForm(false);
    load();
  };
  const deleteClass = async (id) => {
    if (!await confirm("Delete this class? All its sections will also be deleted.")) return;
    await supabase.from("classes").delete().eq("id", id);
    load();
  };

  // ── SECTION CRUD ─────────────────────────────────────────────
  const openAddSection = (classId) => {
    setEditSection(null);
    setSectionF({ class_id: classId, name:"" });
    setShowSectionForm(true);
  };
  const openEditSection = (sec) => {
    setEditSection(sec);
    setSectionF({ class_id: sec.class_id, name: sec.name });
    setShowSectionForm(true);
  };
  const saveSection = async () => {
    if (!sectionF.name.trim() || !sectionF.class_id) return;
    if (editSection) {
      await supabase.from("sections").update({ name: sectionF.name.trim(), class_id: sectionF.class_id }).eq("id", editSection.id);
    } else {
      await supabase.from("sections").insert([{ class_id: sectionF.class_id, name: sectionF.name.trim() }]);
    }
    setShowSectionForm(false);
    load();
  };
  const deleteSection = async (id) => {
    if (!await confirm("Delete this section?")) return;
    await supabase.from("sections").delete().eq("id", id);
    load();
  };

  const sectionsOf = (classId) => sections.filter(s => s.class_id === classId);

  return (
    <div style={{ padding:"24px", maxWidth:"960px", margin:"0 auto", background:"linear-gradient(135deg,#0f172a,#1e293b)", minHeight:"100vh", fontFamily:"'Public Sans',sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <div style={{ fontSize:"1.3rem", fontWeight:800, color:G }}>🏫 Classes & Sections</div>
          <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.4)", marginTop:"4px" }}>
            {classes.length} classes · {sections.length} sections total
          </div>
        </div>
        <button onClick={openAddClass} style={{ ...btn(G,"#0f172a"), padding:"10px 22px", fontSize:"0.82rem" }}>
          + Add Class
        </button>
      </div>

      {loading && <div style={{ color:"rgba(255,255,255,0.4)", textAlign:"center", padding:"60px" }}>Loading…</div>}

      {!loading && classes.length === 0 && (
        <div style={{ ...glass, padding:"48px", textAlign:"center" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:"12px" }}>🏫</div>
          <div style={{ color:G, fontWeight:700, marginBottom:"8px" }}>No classes yet</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.78rem", marginBottom:"20px" }}>
            Create classes first (e.g. Grade 6, Grade 7), then add sections to each class.
          </div>
          <button onClick={openAddClass} style={{ ...btn(G,"#0f172a"), padding:"10px 24px" }}>
            + Create First Class
          </button>
        </div>
      )}

      {/* Class list */}
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {classes.map(cls => {
          const clsSections = sectionsOf(cls.id);
          const isExpanded = expandedClass === cls.id;
          return (
            <div key={cls.id} style={{ ...glass }}>
              {/* Class header row */}
              <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 18px", cursor:"pointer" }}
                   onClick={() => setExpandedClass(isExpanded ? null : cls.id)}>
                <div style={{ fontSize:"1rem", color:G, fontWeight:800, flex:1 }}>
                  {isExpanded ? "▾" : "▸"} {cls.name}
                </div>
                <span style={{ background:"rgba(212,175,55,0.12)", color:G, borderRadius:"20px", padding:"2px 12px", fontSize:"0.65rem", fontWeight:700 }}>
                  {clsSections.length} section{clsSections.length!==1?"s":""}
                </span>
                <button onClick={e=>{e.stopPropagation();openAddSection(cls.id);}}
                  style={{ ...btn("rgba(34,197,94,0.12)","#4ade80"), border:"1px solid rgba(34,197,94,0.25)", padding:"5px 12px", fontSize:"0.68rem" }}>
                  + Section
                </button>
                <button onClick={e=>{e.stopPropagation();openEditClass(cls);}}
                  style={{ ...btn("rgba(212,175,55,0.1)",G), border:"1px solid rgba(212,175,55,0.25)", padding:"5px 12px", fontSize:"0.68rem" }}>
                  ✏️ Edit
                </button>
                <button onClick={e=>{e.stopPropagation();deleteClass(cls.id);}}
                  style={{ ...btn("rgba(239,68,68,0.1)","#f87171"), border:"1px solid rgba(239,68,68,0.25)", padding:"5px 12px", fontSize:"0.68rem" }}>
                  🗑
                </button>
              </div>

              {/* Sections */}
              {isExpanded && (
                <div style={{ borderTop:"1px solid rgba(212,175,55,0.1)", padding:"14px 18px" }}>
                  {clsSections.length === 0 ? (
                    <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.75rem", textAlign:"center", padding:"16px 0" }}>
                      No sections yet — click "+ Section" above to add one
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
                      {clsSections.map(sec => (
                        <div key={sec.id} style={{ display:"flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,175,55,0.15)", borderRadius:"10px", padding:"8px 14px" }}>
                          <span style={{ color:W, fontWeight:700, fontSize:"0.82rem" }}>{sec.name}</span>
                          <button onClick={() => openEditSection(sec)}
                            style={{ background:"none", border:"none", color:G, cursor:"pointer", fontSize:"0.75rem", padding:"0 4px" }}>✏️</button>
                          <button onClick={() => deleteSection(sec.id)}
                            style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", fontSize:"0.75rem", padding:"0 4px" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── CLASS FORM MODAL ─────────────────────────────────── */}
      {showClassForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
             onClick={e=>{if(e.target===e.currentTarget)setShowClassForm(false);}}>
          <div style={{ ...glass, padding:"28px", width:"100%", maxWidth:"420px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <div style={{ color:G, fontSize:"1rem", fontWeight:800 }}>{editClass?"Edit Class":"Add New Class"}</div>
              <button onClick={()=>setShowClassForm(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:"1.2rem", cursor:"pointer" }}>✕</button>
            </div>
            <label style={lbl}>Class Name *</label>
            <input style={{ ...inp, marginBottom:"14px" }} placeholder="e.g. Grade 6, Class Alif" value={classF.name}
              onChange={e=>setClassF({...classF,name:e.target.value})} autoFocus/>
            <label style={lbl}>Display Order (lower = first in lists)</label>
            <input style={{ ...inp, marginBottom:"20px" }} type="number" placeholder="0" value={classF.display_order}
              onChange={e=>setClassF({...classF,display_order:e.target.value})}/>
            <button onClick={saveClass} disabled={!classF.name.trim()}
              style={{ ...btn(G,"#0f172a"), width:"100%", padding:"12px", fontSize:"0.85rem", opacity:classF.name.trim()?1:0.5 }}>
              ✅ {editClass?"Update Class":"Add Class"}
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION FORM MODAL ───────────────────────────────── */}
      {showSectionForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
             onClick={e=>{if(e.target===e.currentTarget)setShowSectionForm(false);}}>
          <div style={{ ...glass, padding:"28px", width:"100%", maxWidth:"420px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <div style={{ color:G, fontSize:"1rem", fontWeight:800 }}>{editSection?"Edit Section":"Add Section"}</div>
              <button onClick={()=>setShowSectionForm(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:"1.2rem", cursor:"pointer" }}>✕</button>
            </div>
            <label style={lbl}>Class *</label>
            <select style={{ ...inp, marginBottom:"14px" }} value={sectionF.class_id}
              onChange={e=>setSectionF({...sectionF,class_id:e.target.value})}>
              <option value="">— Select Class —</option>
              {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label style={lbl}>Section Name *</label>
            <input style={{ ...inp, marginBottom:"20px" }} placeholder="e.g. A, B, Orchid, Lily" value={sectionF.name}
              onChange={e=>setSectionF({...sectionF,name:e.target.value})} autoFocus/>
            <button onClick={saveSection} disabled={!sectionF.name.trim()||!sectionF.class_id}
              style={{ ...btn(G,"#0f172a"), width:"100%", padding:"12px", fontSize:"0.85rem", opacity:(sectionF.name.trim()&&sectionF.class_id)?1:0.5 }}>
              ✅ {editSection?"Update Section":"Add Section"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
