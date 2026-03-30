/* eslint-disable */
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { HOUSES } from "../../constants";

// ── Quick template messages ──────────────────────────────────────────────────
const TEMPLATES = [
  { id:"fee",    icon:"💰", label:"فیس یاددہانی",   en:"Fee Reminder",
    text:"السلام علیکم۔ آپ کے بچے کی فیس باقی ہے۔ براہ کرم جلد از جلد جمع کروائیں۔ شکریہ۔" },
  { id:"absent", icon:"⚠️", label:"غیر حاضری",      en:"Absence Alert",
    text:"السلام علیکم۔ آج آپ کا بچہ اسکول میں غیر حاضر تھا۔ براہ کرم وجہ سے آگاہ فرمائیں۔" },
  { id:"praise", icon:"🌟", label:"تعریف",           en:"Well Done",
    text:"السلام علیکم۔ آپ کے بچے نے آج بہت اچھی کارکردگی دکھائی۔ آپ کو مبارکباد۔" },
  { id:"meet",   icon:"📅", label:"ملاقات طلب",     en:"Meeting Request",
    text:"السلام علیکم۔ ہم آپ سے ملاقات کرنا چاہتے ہیں۔ براہ کرم اسکول میں تشریف لائیں یا وقت بتائیں۔" },
  { id:"result", icon:"📊", label:"نتیجہ اطلاع",    en:"Result Notice",
    text:"السلام علیکم۔ آپ کے بچے کا نتیجہ تیار ہے۔ اسکول پورٹل پر دیکھیں یا دفتر سے لے لیں۔" },
  { id:"uniform",icon:"👕", label:"یونیفارم",        en:"Uniform",
    text:"السلام علیکم۔ آپ کا بچہ آج مکمل یونیفارم میں نہیں تھا۔ کل یقینی بنائیں۔" },
];

const N  = "#0f172a";
const N2 = "#1e293b";
const G  = "#d4af37";
const glass = {
  background:"rgba(255,255,255,0.06)",
  backdropFilter:"blur(20px)",
  WebkitBackdropFilter:"blur(20px)",
  border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:"14px",
};

function timeAgo(iso){
  if(!iso) return "";
  const d = new Date(iso), now = new Date();
  const diff = Math.floor((now - d)/1000);
  if(diff < 60)  return "ابھی";
  if(diff < 3600) return `${Math.floor(diff/60)} منٹ پہلے`;
  if(diff < 86400) return `${Math.floor(diff/3600)} گھنٹے پہلے`;
  return d.toLocaleDateString("en-PK");
}

function msgTypeColor(t){
  if(t==="fee")     return "#f59e0b";
  if(t==="absent")  return "#f87171";
  if(t==="praise")  return "#4ade80";
  if(t==="meet")    return "#818cf8";
  if(t==="result")  return "#38bdf8";
  if(t==="uniform") return "#fb923c";
  return "#94a3b8";
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ParentMessaging({ students, user, userRole }){
  const [messages, setMessages]     = useState([]);
  const [selStudent, setSelStudent] = useState(null);
  const [text, setText]             = useState("");
  const [sending, setSending]       = useState(false);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filter, setFilter]         = useState("all"); // all | unread | fee | absent
  const bottomRef = useRef(null);

  const isStaff = !["parent","student"].includes(userRole);
  const senderRole = isStaff ? "staff" : "parent";
  const senderName = user?.email?.split("@")[0] || "اسٹاف";

  // ── Load messages ──────────────────────────────────────────────────────────
  useEffect(()=>{
    loadMessages();
    const sub = supabase
      .channel("parent_messages_realtime")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"parent_messages"},
        payload => setMessages(prev=>[...prev, payload.new]))
      .subscribe();
    return ()=>{ supabase.removeChannel(sub); };
  },[]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("parent_messages")
        .select("*")
        .order("created_at",{ascending:true})
        .limit(500);
      setMessages(data||[]);
    } catch(e){ console.warn("msgs load:",e.message); }
    setLoading(false);
  };

  // ── Scroll to bottom on new message ──────────────────────────────────────
  useEffect(()=>{
    if(selStudent) bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages, selStudent]);

  // ── Mark as read ─────────────────────────────────────────────────────────
  const markRead = async (studentId) => {
    const unread = messages.filter(m=>m.student_id===studentId&&!m.is_read&&m.sender_role!==senderRole);
    if(!unread.length) return;
    const ids = unread.map(m=>m.id);
    await supabase.from("parent_messages").update({is_read:true}).in("id",ids);
    setMessages(prev=>prev.map(m=>ids.includes(m.id)?{...m,is_read:true}:m));
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const send = async (customText, type="general") => {
    const t = customText || text;
    if(!t.trim() || !selStudent) return;
    setSending(true);
    try {
      const { data, error } = await supabase.from("parent_messages").insert({
        student_id:  selStudent.id,
        sender_role: senderRole,
        sender_name: senderName,
        text:        t.trim(),
        msg_type:    type,
        is_read:     false,
      }).select().single();
      if(!error && data) setMessages(prev=>[...prev, data]);
      setText("");
      setShowTemplates(false);
    } catch(e){ console.warn("send error:",e.message); }
    setSending(false);
  };

  // ── Per-student unread counts ─────────────────────────────────────────────
  const unreadFor = (sid) =>
    messages.filter(m=>m.student_id===sid&&!m.is_read&&m.sender_role!==senderRole).length;

  const lastMsgFor = (sid) => {
    const arr = messages.filter(m=>m.student_id===sid);
    return arr.length ? arr[arr.length-1] : null;
  };

  // ── Filtered student list ─────────────────────────────────────────────────
  const filteredStudents = students.filter(s=>{
    const q = search.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.studentCode?.includes(q);
    if(!matchSearch) return false;
    if(filter==="unread") return unreadFor(s.id) > 0;
    if(filter==="fee"){
      const last = lastMsgFor(s.id);
      return last?.msg_type==="fee";
    }
    if(filter==="absent"){
      const last = lastMsgFor(s.id);
      return last?.msg_type==="absent";
    }
    return true;
  }).sort((a,b)=>{
    // sort by last message time desc
    const la = lastMsgFor(a.id), lb = lastMsgFor(b.id);
    if(!la && !lb) return 0;
    if(!la) return 1;
    if(!lb) return -1;
    return new Date(lb.created_at) - new Date(la.created_at);
  });

  // ── Conversation messages ─────────────────────────────────────────────────
  const convo = selStudent
    ? messages.filter(m=>m.student_id===selStudent.id)
    : [];

  // ── Total unread badge ────────────────────────────────────────────────────
  const totalUnread = students.reduce((acc,s)=>acc+unreadFor(s.id),0);

  // ── Open student conversation ─────────────────────────────────────────────
  const openConvo = (s) => {
    setSelStudent(s);
    markRead(s.id);
  };

  const house = selStudent ? HOUSES.find(h=>h.id===selStudent.houseId)||{} : {};

  // ─────────────────────────────────────────────────────────────────────────
  // PARENT VIEW (simplified — only sees their child's messages)
  // ─────────────────────────────────────────────────────────────────────────
  if(!isStaff){
    // parent sees all messages for all students (in real app filter by parent_id)
    return (
      <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,${N} 100%)`,
        padding:"20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",
            background:`linear-gradient(135deg,${G},#b8960a)`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>💬</div>
          <div>
            <div style={{fontSize:"1.2rem",fontWeight:"800",color:"#f1f5f9"}}>والدین پیغامات</div>
            <div style={{fontSize:"0.68rem",color:"rgba(212,175,55,0.7)"}}>اسکول کی طرف سے پیغامات</div>
          </div>
        </div>
        {students.map(s=>{
          const sMessages = messages.filter(m=>m.student_id===s.id);
          if(!sMessages.length) return null;
          const h = HOUSES.find(x=>x.id===s.houseId)||{};
          return (
            <div key={s.id} style={{...glass,padding:"16px",marginBottom:"14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px",
                borderBottom:"1px solid rgba(255,255,255,0.06)",paddingBottom:"10px"}}>
                <div style={{width:"36px",height:"36px",borderRadius:"50%",
                  background:h.gradient||"linear-gradient(135deg,#1e3a5f,#2563eb)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>{h.emoji||"👤"}</div>
                <div>
                  <div style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>{s.name}</div>
                  <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)"}}>{s.grade}</div>
                </div>
              </div>
              <div style={{maxHeight:"240px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"8px"}}>
                {sMessages.map(m=>(
                  <div key={m.id} style={{
                    padding:"10px 12px",borderRadius:"10px",
                    background: m.sender_role==="staff"
                      ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.05)",
                    borderRight: m.sender_role==="staff"
                      ? `3px solid ${msgTypeColor(m.msg_type)}` : "3px solid #475569",
                    textAlign:"right",
                  }}>
                    <div style={{fontSize:"0.72rem",color:"#e2e8f0",lineHeight:"1.6"}}>{m.text}</div>
                    <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"4px"}}>
                      {m.sender_role==="staff"?"اسکول":"والدین"} • {timeAgo(m.created_at)}
                    </div>
                  </div>
                ))}
              </div>
              {/* Parent reply */}
              <div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
                <input
                  value={selStudent?.id===s.id?text:""}
                  onChange={e=>{ setSelStudent(s); setText(e.target.value); }}
                  onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send(text))}
                  placeholder="جواب لکھیں..."
                  style={{flex:1,padding:"9px 12px",borderRadius:"8px",
                    border:"1px solid rgba(255,255,255,0.12)",
                    background:"rgba(255,255,255,0.06)",color:"#f1f5f9",
                    fontSize:"0.8rem",outline:"none",direction:"rtl"}}
                />
                <button onClick={()=>{ setSelStudent(s); send(selStudent?.id===s.id?text:""); }}
                  style={{padding:"9px 14px",borderRadius:"8px",background:G,
                    border:"none",color:N,fontWeight:"700",fontSize:"0.8rem",cursor:"pointer"}}>
                  ارسال
                </button>
              </div>
            </div>
          );
        })}
        {!students.length&&<div style={{...glass,padding:"60px",textAlign:"center"}}>
          <div style={{fontSize:"2.5rem",marginBottom:"12px"}}>💬</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.8rem"}}>کوئی پیغام نہیں</div>
        </div>}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAFF VIEW — two-panel layout
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",
      background:`linear-gradient(160deg,${N} 0%,#0d1f3c 60%,${N} 100%)`,
      fontFamily:"'Public Sans',sans-serif"}}>

      {/* ── Header ── */}
      <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)",
        display:"flex",alignItems:"center",gap:"14px",flexShrink:0}}>
        <div style={{width:"40px",height:"40px",borderRadius:"10px",
          background:`linear-gradient(135deg,${G},#b8960a)`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem"}}>💬</div>
        <div style={{flex:1}}>
          <div style={{fontSize:"1.1rem",fontWeight:"800",color:"#f1f5f9",direction:"rtl"}}>
            والدین پیغام رسانی
            {totalUnread>0&&<span style={{
              marginRight:"8px",background:"#ef4444",color:"#fff",
              borderRadius:"20px",padding:"1px 8px",fontSize:"0.6rem",fontWeight:"700"}}>
              {totalUnread}
            </span>}
          </div>
          <div style={{fontSize:"0.65rem",color:"rgba(212,175,55,0.6)",direction:"rtl"}}>
            {students.length} طالب علم • حقیقی وقت پیغام رسانی
          </div>
        </div>
        {/* Filter pills */}
        <div style={{display:"flex",gap:"6px"}}>
          {[["all","سب"],["unread","غیر پڑھے"],["fee","فیس"],["absent","غیر حاضر"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              style={{padding:"4px 10px",borderRadius:"20px",border:"none",fontSize:"0.62rem",
                cursor:"pointer",fontWeight:"700",transition:"all 0.14s",direction:"rtl",
                background:filter===v?"rgba(212,175,55,0.25)":"rgba(255,255,255,0.05)",
                color:filter===v?G:"rgba(255,255,255,0.45)"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two panel body ── */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* ── LEFT: Student list ── */}
        <div style={{width:"300px",flexShrink:0,borderLeft:"1px solid rgba(255,255,255,0.06)",
          display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"10px 12px",flexShrink:0}}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="🔍 نام یا کوڈ تلاش کریں..."
              style={{width:"100%",padding:"9px 12px",borderRadius:"9px",
                border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.05)",color:"#f1f5f9",
                fontSize:"0.75rem",outline:"none",direction:"rtl",boxSizing:"border-box"}}/>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"4px 8px"}}>
            {loading&&<div style={{textAlign:"center",padding:"40px",
              color:"rgba(255,255,255,0.3)",fontSize:"0.75rem"}}>لوڈ ہو رہا ہے...</div>}
            {filteredStudents.map(s=>{
              const h = HOUSES.find(x=>x.id===s.houseId)||{};
              const unread = unreadFor(s.id);
              const last   = lastMsgFor(s.id);
              const active = selStudent?.id===s.id;
              return (
                <div key={s.id} onClick={()=>openConvo(s)}
                  style={{padding:"10px 12px",borderRadius:"10px",cursor:"pointer",
                    marginBottom:"3px",transition:"all 0.13s",direction:"rtl",
                    background:active?"rgba(212,175,55,0.14)":"rgba(255,255,255,0.03)",
                    border:`1px solid ${active?"rgba(212,175,55,0.3)":"rgba(255,255,255,0.05)"}`,
                    borderRight:`3px solid ${h.color||G}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                    <div style={{width:"34px",height:"34px",borderRadius:"50%",flexShrink:0,
                      background:h.gradient||"linear-gradient(135deg,#1e3a5f,#2563eb)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:"0.9rem"}}>{h.emoji||"👤"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:"0.78rem",fontWeight:"700",color:"#f1f5f9",
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
                        {unread>0&&<span style={{background:"#ef4444",color:"#fff",
                          borderRadius:"20px",padding:"1px 7px",fontSize:"0.6rem",
                          fontWeight:"700",flexShrink:0,marginRight:"4px"}}>{unread}</span>}
                      </div>
                      <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {last ? last.text.slice(0,40)+"…" : "کوئی پیغام نہیں"}
                      </div>
                      {last&&<div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.2)",marginTop:"2px"}}>
                        {timeAgo(last.created_at)}
                      </div>}
                    </div>
                  </div>
                </div>
              );
            })}
            {!filteredStudents.length&&!loading&&(
              <div style={{textAlign:"center",padding:"40px",color:"rgba(255,255,255,0.25)",
                fontSize:"0.72rem",direction:"rtl"}}>کوئی نتیجہ نہیں</div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Conversation ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {!selStudent ? (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
              flexDirection:"column",gap:"12px"}}>
              <div style={{fontSize:"3.5rem",opacity:0.25}}>💬</div>
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.85rem",direction:"rtl"}}>
                بائیں سے طالب علم منتخب کریں
              </div>
            </div>
          ) : (
            <>
              {/* Student header */}
              <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",
                flexShrink:0,display:"flex",alignItems:"center",gap:"12px",direction:"rtl"}}>
                <div style={{width:"40px",height:"40px",borderRadius:"50%",
                  background:house.gradient||"linear-gradient(135deg,#1e3a5f,#2563eb)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"1.1rem",flexShrink:0}}>{house.emoji||"👤"}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.92rem",fontWeight:"800",color:"#f1f5f9"}}>{selStudent.name}</div>
                  <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)"}}>
                    {selStudent.grade} • {house.nameEn||"—"} • {selStudent.fatherName||"—"}
                  </div>
                </div>
                <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.5)",
                  fontFamily:"monospace",direction:"ltr"}}>{selStudent.studentCode}</div>
              </div>

              {/* Messages */}
              <div style={{flex:1,overflowY:"auto",padding:"16px 20px",
                display:"flex",flexDirection:"column",gap:"10px"}}>
                {convo.length===0&&<div style={{textAlign:"center",padding:"60px",
                  color:"rgba(255,255,255,0.25)",direction:"rtl",fontSize:"0.8rem"}}>
                  ابھی تک کوئی پیغام نہیں — پہلا پیغام بھیجیں
                </div>}
                {convo.map(m=>{
                  const isMe = m.sender_role==="staff";
                  return (
                    <div key={m.id} style={{display:"flex",
                      justifyContent:isMe?"flex-end":"flex-start"}}>
                      <div style={{maxWidth:"72%"}}>
                        {/* Type badge */}
                        {m.msg_type!=="general"&&<div style={{
                          fontSize:"0.55rem",fontWeight:"700",marginBottom:"3px",
                          textAlign:isMe?"right":"left",direction:"rtl",
                          color:msgTypeColor(m.msg_type)}}>
                          {TEMPLATES.find(t=>t.id===m.msg_type)?.icon}
                          {" "}{TEMPLATES.find(t=>t.id===m.msg_type)?.label}
                        </div>}
                        <div style={{
                          padding:"10px 14px",borderRadius:"14px",direction:"rtl",
                          background:isMe
                            ? `linear-gradient(135deg,rgba(184,134,11,0.25),rgba(212,175,55,0.12))`
                            : "rgba(255,255,255,0.07)",
                          border:isMe
                            ? "1px solid rgba(212,175,55,0.2)"
                            : "1px solid rgba(255,255,255,0.08)",
                          borderBottomRightRadius:isMe?"4px":"14px",
                          borderBottomLeftRadius:isMe?"14px":"4px",
                        }}>
                          <div style={{fontSize:"0.78rem",color:"#e2e8f0",lineHeight:"1.7"}}>{m.text}</div>
                        </div>
                        <div style={{fontSize:"0.56rem",color:"rgba(255,255,255,0.25)",
                          marginTop:"3px",textAlign:isMe?"right":"left",direction:"rtl"}}>
                          {isMe?"اسٹاف":"والدین"} • {timeAgo(m.created_at)}
                          {isMe&&m.is_read&&<span style={{color:"#4ade80",marginRight:"4px"}}> ✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>

              {/* ── Compose area ── */}
              <div style={{padding:"12px 20px",borderTop:"1px solid rgba(255,255,255,0.06)",
                flexShrink:0,direction:"rtl"}}>

                {/* Templates panel */}
                {showTemplates&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px",
                    marginBottom:"10px",padding:"10px",
                    background:"rgba(255,255,255,0.04)",borderRadius:"10px",
                    border:"1px solid rgba(255,255,255,0.07)"}}>
                    {TEMPLATES.map(tpl=>(
                      <button key={tpl.id} onClick={()=>send(tpl.text, tpl.id)}
                        style={{padding:"5px 10px",borderRadius:"20px",border:"none",
                          background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.7)",
                          fontSize:"0.65rem",cursor:"pointer",fontWeight:"600",direction:"rtl",
                          display:"flex",alignItems:"center",gap:"4px",
                          border:`1px solid ${msgTypeColor(tpl.id)}30`}}>
                        {tpl.icon} {tpl.label}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{display:"flex",gap:"8px",alignItems:"flex-end"}}>
                  <textarea value={text} onChange={e=>setText(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}
                    placeholder="پیغام لکھیں... (Enter = ارسال)"
                    rows={2}
                    style={{flex:1,padding:"10px 13px",borderRadius:"10px",
                      border:"1px solid rgba(255,255,255,0.12)",
                      background:"rgba(255,255,255,0.06)",color:"#f1f5f9",
                      fontSize:"0.8rem",outline:"none",direction:"rtl",
                      resize:"none",fontFamily:"inherit",lineHeight:"1.5"}}/>
                  <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                    <button onClick={()=>setShowTemplates(v=>!v)}
                      title="فوری پیغامات"
                      style={{padding:"8px 10px",borderRadius:"8px",
                        border:`1px solid ${showTemplates?"rgba(212,175,55,0.4)":"rgba(255,255,255,0.1)"}`,
                        background:showTemplates?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.04)",
                        color:showTemplates?G:"rgba(255,255,255,0.5)",
                        fontSize:"0.9rem",cursor:"pointer"}}>
                      ⚡
                    </button>
                    <button onClick={()=>send()} disabled={!text.trim()||sending}
                      style={{padding:"8px 14px",borderRadius:"8px",
                        background:text.trim()&&!sending?G:"rgba(255,255,255,0.08)",
                        border:"none",
                        color:text.trim()&&!sending?N:"rgba(255,255,255,0.25)",
                        fontWeight:"700",fontSize:"0.78rem",cursor:"pointer",
                        transition:"all 0.14s",direction:"rtl"}}>
                      {sending?"...":"ارسال ↑"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
