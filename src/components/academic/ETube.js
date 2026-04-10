/* eslint-disable */
import { useState, useEffect } from "react";
import { confirm } from '../ui/ConfirmDialog';
import { supabase, updateData, deleteData } from "../../supabase";

const G = "#d4af37", N = "#0f172a";

const CATEGORIES = [
  "تمام","اسلامیات","قرآن و تجوید","ریاضی","سائنس","انگریزی","اردو",
  "فزکس","کیمسٹری","حیاتیات","پاکستان اسٹڈیز","کمپیوٹر","تاریخ",
  "صحت و تربیت","اساتذہ کی تربیت","دیگر"
];

const CAT_COLORS = {
  "اسلامیات":"#10b981","قرآن و تجوید":"#f59e0b","ریاضی":"#3b82f6",
  "سائنس":"#8b5cf6","انگریزی":"#ec4899","اردو":"#14b8a6",
  "فزکس":"#06b6d4","کیمسٹری":"#f97316","حیاتیات":"#22c55e",
  "کمپیوٹر":"#6366f1","اساتذہ کی تربیت":"#d4af37",
};

const getYTId = (url) => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return m ? m[1] : null;
};

const getThumb = (url) => {
  const id = getYTId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const glass = {
  background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:14,
};
const inp = {
  width:"100%", padding:"10px 13px", borderRadius:9,
  border:"1px solid rgba(212,175,55,0.25)",
  background:"rgba(255,255,255,0.06)", color:"#f1f5f9",
  fontSize:"0.8rem", outline:"none", fontFamily:"inherit",
  boxSizing:"border-box", colorScheme:"dark",
};
const lbl = {
  fontSize:"0.68rem", color:"rgba(212,175,55,0.8)",
  marginBottom:5, display:"block", fontWeight:700,
};

export default function ETube({ addData, userRole }) {
  const [videos, setVideos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [activeCategory, setCat]  = useState("تمام");
  const [search, setSearch]       = useState("");
  const [playing, setPlaying]     = useState(null);
  const [f, setF] = useState({ title:"", url:"", category:"اسلامیات", description:"", grade:"تمام" });

  const canManage = ["admin","director","teacher"].includes(userRole);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("etube_videos")
      .select("*").order("created_at", { ascending:false });
    setVideos(data || []);
    setLoading(false);
  };

  const save = async () => {
    if (!f.title || !f.url) return;
    if (editId) {
      await updateData("etube_videos", editId, f);
    } else {
      await addData("etube_videos", f);
    }
    setShowForm(false); setEditId(null);
    setF({ title:"", url:"", category:"اسلامیات", description:"", grade:"تمام" });
    load();
  };

  const startEdit = (v) => {
    setF({ title:v.title, url:v.url, category:v.category,
      description:v.description||"", grade:v.grade||"تمام" });
    setEditId(v.id); setShowForm(true);
  };

  const remove = async (id) => {
    if (!await confirm("کیا آپ یہ ویڈیو حذف کرنا چاہتے ہیں؟")) return;
    await deleteData("etube_videos", id);
    load();
  };

  const incrementView = async (id) => {
    const v = videos.find(x => x.id === id);
    if (v) await updateData("etube_videos", id, { views:(v.views||0)+1 });
  };

  const filtered = videos.filter(v => {
    const matchCat = activeCategory === "تمام" || v.category === activeCategory;
    const matchSearch = !search ||
      v.title?.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: videos.length,
    views: videos.reduce((s,v) => s+(v.views||0), 0),
    categories: new Set(videos.map(v=>v.category)).size,
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0f172a 100%)",
      padding:"24px 20px", fontFamily:"'Public Sans',sans-serif", direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ background:"linear-gradient(135deg,#ef4444,#dc2626)",
            borderRadius:12, width:48, height:48,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24, boxShadow:"0 0 20px rgba(239,68,68,0.4)" }}>
            ▶
          </div>
          <div>
            <h1 style={{ color:G, margin:"0 0 2px", fontSize:22 }}>E-Tube</h1>
            <p style={{ color:"#64748b", margin:0, fontSize:13 }}>تعلیمی ویڈیوز کی لائبریری</p>
          </div>
        </div>
        {canManage && (
          <button onClick={() => { setShowForm(true); setEditId(null);
            setF({ title:"", url:"", category:"اسلامیات", description:"", grade:"تمام" }); }}
            style={{ background:G, color:N, border:"none", borderRadius:10,
              padding:"10px 20px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
            + ویڈیو شامل کریں
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[
          ["کل ویڈیوز", stats.total, "#60a5fa"],
          ["کل مناظر",  stats.views, G],
          ["زمرے",      stats.categories, "#4ade80"],
        ].map(([label, val, color]) => (
          <div key={label} style={{ ...glass, padding:"14px 18px", textAlign:"center" }}>
            <div style={{ color, fontSize:26, fontWeight:700 }}>{val.toLocaleString()}</div>
            <div style={{ color:"#64748b", fontSize:12, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:"relative", marginBottom:16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 ویڈیو تلاش کریں..."
          style={{ ...inp, paddingRight:16, fontSize:13 }}/>
      </div>

      {/* Category pills */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
        {CATEGORIES.map(cat => {
          const color = CAT_COLORS[cat] || "#94a3b8";
          const active = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setCat(cat)}
              style={{ border:`1px solid ${active ? color : color+"40"}`,
                borderRadius:20, padding:"6px 16px", cursor:"pointer",
                fontSize:12, fontWeight:600, whiteSpace:"nowrap",
                background: active ? `${color}25` : "rgba(255,255,255,0.04)",
                color: active ? color : "#94a3b8" }}>
              {cat}
              {cat !== "تمام" && (
                <span style={{ marginRight:6, color:active?color:"#475569", fontSize:10 }}>
                  ({videos.filter(v=>v.category===cat).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ ...glass, padding:20, marginBottom:20 }}>
          <h3 style={{ color:G, margin:"0 0 16px", fontSize:16 }}>
            {editId ? "✏️ ویڈیو میں ترمیم" : "+ نئی ویڈیو"}
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label style={lbl}>عنوان *</label>
              <input value={f.title} onChange={e=>setF(x=>({...x,title:e.target.value}))}
                placeholder="ویڈیو کا نام" style={{...inp,direction:"rtl"}}/>
            </div>
            <div>
              <label style={lbl}>زمرہ</label>
              <select value={f.category} onChange={e=>setF(x=>({...x,category:e.target.value}))}
                style={{...inp,appearance:"none",direction:"rtl"}}>
                {CATEGORIES.filter(c=>c!=="تمام").map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>جماعت</label>
              <input value={f.grade} onChange={e=>setF(x=>({...x,grade:e.target.value}))}
                placeholder="تمام / Grade 6" style={{...inp,direction:"rtl"}}/>
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>YouTube URL *</label>
            <input value={f.url} onChange={e=>setF(x=>({...x,url:e.target.value}))}
              placeholder="https://www.youtube.com/watch?v=..." style={{...inp,direction:"ltr"}}/>
            {f.url && getThumb(f.url) && (
              <img src={getThumb(f.url)} alt="thumb"
                style={{ marginTop:8, height:80, borderRadius:8, border:"1px solid rgba(255,255,255,0.1)" }}/>
            )}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>تفصیل (اختیاری)</label>
            <input value={f.description} onChange={e=>setF(x=>({...x,description:e.target.value}))}
              placeholder="ویڈیو کے بارے میں..." style={{...inp,direction:"rtl"}}/>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              style={{ background:"#334155", color:"#f1f5f9", border:"none",
                borderRadius:8, padding:"9px 18px", cursor:"pointer", fontWeight:600 }}>
              منسوخ
            </button>
            <button onClick={save} disabled={!f.title||!f.url}
              style={{ background:(!f.title||!f.url)?"#334155":G,
                color:(!f.title||!f.url)?"#64748b":N,
                border:"none", borderRadius:8, padding:"9px 18px",
                cursor:(!f.title||!f.url)?"not-allowed":"pointer", fontWeight:700 }}>
              ✅ محفوظ کریں
            </button>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)",
          zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setPlaying(null)}>
          <div style={{ background:"#0f172a", borderRadius:16, overflow:"hidden",
            width:"min(860px,95vw)", boxShadow:"0 24px 64px rgba(0,0,0,0.6)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:"12px 16px", display:"flex",
              justifyContent:"space-between", alignItems:"center",
              borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:15,
                direction:"rtl" }}>{playing.title}</span>
              <button onClick={() => setPlaying(null)}
                style={{ background:"rgba(255,255,255,0.1)", border:"none",
                  borderRadius:8, color:"#f1f5f9", width:32, height:32,
                  cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
            <div style={{ position:"relative", paddingBottom:"56.25%", height:0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${getYTId(playing.url)}?autoplay=1`}
                style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%" }}
                allow="autoplay; fullscreen"
                allowFullScreen
                title={playing.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {loading ? (
        <p style={{ color:"#64748b", textAlign:"center", padding:40 }}>لوڈ ہو رہا ہے...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:56, marginBottom:12 }}>📺</div>
          <p style={{ color:"#64748b" }}>
            {search ? "کوئی نتیجہ نہیں ملا" : "ابھی کوئی ویڈیو نہیں — شامل کریں"}
          </p>
        </div>
      ) : (
        <div style={{ display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {filtered.map(v => {
            const thumb = getThumb(v.url);
            const catColor = CAT_COLORS[v.category] || "#94a3b8";
            return (
              <div key={v.id} style={{ ...glass, overflow:"hidden",
                transition:"transform 0.2s", cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.transform="translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>

                {/* Thumbnail */}
                <div style={{ position:"relative", paddingBottom:"56.25%",
                  background:"#1e293b", overflow:"hidden" }}
                  onClick={() => { setPlaying(v); incrementView(v.id); }}>
                  {thumb ? (
                    <img src={thumb} alt={v.title}
                      style={{ position:"absolute", inset:0, width:"100%",
                        height:"100%", objectFit:"cover" }}/>
                  ) : (
                    <div style={{ position:"absolute", inset:0, display:"flex",
                      alignItems:"center", justifyContent:"center",
                      background:"linear-gradient(135deg,#1e3a5f,#0f172a)" }}>
                      <span style={{ fontSize:40 }}>📺</span>
                    </div>
                  )}
                  {/* Play overlay */}
                  <div style={{ position:"absolute", inset:0, display:"flex",
                    alignItems:"center", justifyContent:"center",
                    background:"rgba(0,0,0,0.3)",
                    transition:"background 0.2s" }}>
                    <div style={{ width:52, height:52, borderRadius:"50%",
                      background:"rgba(239,68,68,0.9)",
                      display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:22,
                      boxShadow:"0 0 20px rgba(239,68,68,0.5)" }}>
                      ▶
                    </div>
                  </div>
                  {/* Category badge */}
                  <div style={{ position:"absolute", top:8, right:8 }}>
                    <span style={{ background:`${catColor}cc`, color:"#fff",
                      padding:"2px 10px", borderRadius:20,
                      fontSize:11, fontWeight:700 }}>
                      {v.category}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding:"12px 14px" }}>
                  <h4 style={{ color:"#f1f5f9", margin:"0 0 6px",
                    fontSize:14, fontWeight:700,
                    lineHeight:1.4, direction:"rtl" }}>
                    {v.title}
                  </h4>
                  {v.description && (
                    <p style={{ color:"#64748b", fontSize:12, margin:"0 0 8px",
                      direction:"rtl", lineHeight:1.5,
                      overflow:"hidden", display:"-webkit-box",
                      WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {v.description}
                    </p>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center" }}>
                    <div style={{ display:"flex", gap:10, fontSize:12, color:"#64748b" }}>
                      <span>👁️ {(v.views||0).toLocaleString()}</span>
                      {v.grade && v.grade !== "تمام" && (
                        <span style={{ color:G }}>📚 {v.grade}</span>
                      )}
                    </div>
                    {canManage && (
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => startEdit(v)}
                          style={{ background:"rgba(96,165,250,0.12)", color:"#60a5fa",
                            border:"none", borderRadius:6, padding:"4px 8px",
                            cursor:"pointer", fontSize:12 }}>✏️</button>
                        <button onClick={() => remove(v.id)}
                          style={{ background:"rgba(248,113,113,0.12)", color:"#f87171",
                            border:"none", borderRadius:6, padding:"4px 8px",
                            cursor:"pointer", fontSize:12 }}>🗑</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
