/* eslint-disable */
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";

const G = "#d4af37", N = "#0f172a";

const STAFF_ROLES = [
  { id:"director@ameen.edu",    name:"Director Sahib",      role:"director",    avatar:"👨‍💼" },
  { id:"admin@ameen.edu",       name:"Admin Sahib",          role:"admin",       avatar:"🖥️" },
  { id:"teacher@ameen.edu",     name:"Ustad Ji",             role:"teacher",     avatar:"👨‍🏫" },
  { id:"finance@ameen.edu",     name:"Finance Officer",      role:"finance",     avatar:"💼" },
  { id:"registrar@ameen.edu",   name:"Registrar Sahib",      role:"registrar",   avatar:"📋" },
  { id:"housemaster@ameen.edu", name:"House Master Sahib",   role:"housemaster", avatar:"🏠" },
];

const ROLE_COLOR = {
  director:"#f59e0b", admin:"#60a5fa", teacher:"#4ade80",
  finance:"#a78bfa", registrar:"#fb923c", housemaster:"#f472b6",
};

const glass = {
  background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:14,
};

export default function ChatSystem({ user, userRole }) {
  const [contacts]         = useState(STAFF_ROLES);
  const [activeContact, setActive] = useState(null);
  const [messages, setMessages]    = useState([]);
  const [text, setText]            = useState("");
  const [unread, setUnread]        = useState({});
  const bottomRef = useRef(null);
  const myEmail = user?.email || "";
  const myInfo  = STAFF_ROLES.find(s => s.id === myEmail) ||
                  { id:myEmail, name:myEmail.split("@")[0], role:userRole, avatar:"👤" };

  // load messages for active chat
  useEffect(() => {
    if (!activeContact) return;
    loadMessages(activeContact.id);
    // realtime subscription
    const channel = supabase
      .channel(`chat_${roomId(myEmail, activeContact.id)}`)
      .on("postgres_changes", {
        event:"INSERT", schema:"public", table:"chat_messages",
        filter:`room_id=eq.${roomId(myEmail, activeContact.id)}`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [activeContact]);

  // scroll to bottom on messages load
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
  }, [messages]);

  // load unread counts
  useEffect(() => {
    if (!myEmail) return;
    loadUnread();
  }, [myEmail]);

  const roomId = (a, b) => [a, b].sort().join("__");

  const loadMessages = async (contactEmail) => {
    const rid = roomId(myEmail, contactEmail);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", rid)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    // mark as read
    await supabase.from("chat_messages")
      .update({ is_read: true })
      .eq("room_id", rid)
      .eq("receiver_email", myEmail);
    setUnread(prev => ({ ...prev, [contactEmail]: 0 }));
  };

  const loadUnread = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("sender_email, is_read")
      .eq("receiver_email", myEmail)
      .eq("is_read", false);
    const counts = {};
    (data || []).forEach(m => {
      counts[m.sender_email] = (counts[m.sender_email] || 0) + 1;
    });
    setUnread(counts);
  };

  const send = async () => {
    if (!text.trim() || !activeContact) return;
    const msg = {
      room_id: roomId(myEmail, activeContact.id),
      sender_email: myEmail,
      receiver_email: activeContact.id,
      sender_name: myInfo.name,
      message: text.trim(),
      is_read: false,
    };
    setText("");
    await supabase.from("chat_messages").insert(msg);
    loadMessages(activeContact.id);
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString("ur", { hour:"2-digit", minute:"2-digit", hour12:true });
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "آج";
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    if (d.toDateString() === yesterday.toDateString()) return "کل";
    return d.toLocaleDateString("ur");
  };

  // group messages by date
  const grouped = [];
  let lastDate = null;
  messages.forEach(m => {
    const d = formatDate(m.created_at);
    if (d !== lastDate) { grouped.push({ type:"date", label:d }); lastDate = d; }
    grouped.push({ type:"msg", ...m });
  });

  const others = contacts.filter(c => c.id !== myEmail);

  return (
    <div style={{ height:"100vh", background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 60%,#0f172a 100%)",
      display:"flex", fontFamily:"'Public Sans',sans-serif", overflow:"hidden" }}>

      {/* ── LEFT: Contacts ── */}
      <div style={{ width:280, borderLeft:"1px solid rgba(255,255,255,0.08)",
        display:"flex", flexDirection:"column", flexShrink:0 }}>

        {/* Header */}
        <div style={{ padding:"20px 16px 14px",
          borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ color:G, margin:"0 0 2px", fontSize:18 }}>💬 چیٹ</h2>
          <p style={{ color:"#64748b", margin:0, fontSize:12 }}>اسٹاف پیغامات</p>
        </div>

        {/* My info */}
        <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)",
          display:"flex", alignItems:"center", gap:10,
          background:"rgba(212,175,55,0.06)" }}>
          <div style={{ width:36, height:36, borderRadius:"50%",
            background:"rgba(212,175,55,0.2)", display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:18 }}>
            {myInfo.avatar}
          </div>
          <div>
            <div style={{ color:G, fontSize:13, fontWeight:700 }}>{myInfo.name}</div>
            <div style={{ color:"#4ade80", fontSize:11 }}>● آن لائن</div>
          </div>
        </div>

        {/* Contact list */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {others.map(c => {
            const isActive = activeContact?.id === c.id;
            const cnt = unread[c.id] || 0;
            const roleColor = ROLE_COLOR[c.role] || "#94a3b8";
            return (
              <div key={c.id} onClick={() => setActive(c)}
                style={{ padding:"12px 14px", cursor:"pointer", display:"flex",
                  alignItems:"center", gap:10,
                  background: isActive ? "rgba(212,175,55,0.1)" : "transparent",
                  borderLeft: isActive ? `3px solid ${G}` : "3px solid transparent",
                  borderBottom:"1px solid rgba(255,255,255,0.04)",
                  transition:"all 0.15s" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%",
                    background:`${roleColor}20`, border:`2px solid ${roleColor}40`,
                    display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:20 }}>
                    {c.avatar}
                  </div>
                  {cnt > 0 && (
                    <div style={{ position:"absolute", top:-4, right:-4,
                      background:"#f87171", color:"#fff", borderRadius:"50%",
                      width:18, height:18, fontSize:10, fontWeight:700,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {cnt}
                    </div>
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color: isActive ? G : "#f1f5f9",
                    fontSize:13, fontWeight: isActive ? 700 : 500,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {c.name}
                  </div>
                  <div style={{ color:roleColor, fontSize:11 }}>{c.role}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Chat area ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {!activeContact ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", color:"#64748b" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>💬</div>
            <p style={{ fontSize:16 }}>بائیں طرف سے رابطہ منتخب کریں</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)",
              display:"flex", alignItems:"center", gap:12,
              background:"rgba(255,255,255,0.03)" }}>
              <div style={{ width:42, height:42, borderRadius:"50%",
                background:`${ROLE_COLOR[activeContact.role]||"#94a3b8"}20`,
                border:`2px solid ${ROLE_COLOR[activeContact.role]||"#94a3b8"}50`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                {activeContact.avatar}
              </div>
              <div>
                <div style={{ color:"#f1f5f9", fontSize:15, fontWeight:700 }}>
                  {activeContact.name}
                </div>
                <div style={{ color:ROLE_COLOR[activeContact.role]||"#94a3b8", fontSize:12 }}>
                  {activeContact.role}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:"16px 20px",
              display:"flex", flexDirection:"column", gap:4 }}>
              {grouped.length === 0 && (
                <div style={{ textAlign:"center", color:"#64748b",
                  padding:"40px 0", fontSize:13 }}>
                  ابھی تک کوئی پیغام نہیں — پہلا پیغام بھیجیں!
                </div>
              )}
              {grouped.map((item, i) => {
                if (item.type === "date") {
                  return (
                    <div key={i} style={{ textAlign:"center", margin:"12px 0 4px" }}>
                      <span style={{ background:"rgba(255,255,255,0.07)",
                        color:"#64748b", fontSize:11, padding:"3px 14px",
                        borderRadius:20 }}>{item.label}</span>
                    </div>
                  );
                }
                const isMine = item.sender_email === myEmail;
                return (
                  <div key={i} style={{ display:"flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    marginBottom:2 }}>
                    {!isMine && (
                      <div style={{ width:28, height:28, borderRadius:"50%",
                        background:"rgba(212,175,55,0.15)",
                        display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:14,
                        marginLeft:6, flexShrink:0, alignSelf:"flex-end" }}>
                        {activeContact.avatar}
                      </div>
                    )}
                    <div style={{ maxWidth:"65%" }}>
                      <div style={{
                        background: isMine
                          ? "linear-gradient(135deg,rgba(212,175,55,0.35),rgba(212,175,55,0.2))"
                          : "rgba(255,255,255,0.08)",
                        color:"#f1f5f9", padding:"9px 14px", borderRadius:12,
                        borderBottomRightRadius: isMine ? 3 : 12,
                        borderBottomLeftRadius: isMine ? 12 : 3,
                        fontSize:14, lineHeight:1.5, direction:"rtl",
                        border: isMine ? "1px solid rgba(212,175,55,0.3)"
                                       : "1px solid rgba(255,255,255,0.08)",
                        wordBreak:"break-word",
                      }}>
                        {item.message}
                      </div>
                      <div style={{ color:"#475569", fontSize:10,
                        textAlign: isMine ? "left" : "right",
                        marginTop:3, paddingRight:4 }}>
                        {formatTime(item.created_at)}
                        {isMine && <span style={{ marginRight:4 }}>
                          {item.is_read ? " ✓✓" : " ✓"}
                        </span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div style={{ padding:"12px 20px",
              borderTop:"1px solid rgba(255,255,255,0.08)",
              background:"rgba(255,255,255,0.03)",
              display:"flex", gap:10, alignItems:"center" }}>
              <input value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="پیغام لکھیں..."
                style={{ flex:1, padding:"11px 16px", borderRadius:24,
                  border:"1px solid rgba(212,175,55,0.25)",
                  background:"rgba(255,255,255,0.07)", color:"#f1f5f9",
                  fontSize:14, outline:"none", fontFamily:"inherit",
                  direction:"rtl", colorScheme:"dark" }}/>
              <button onClick={send} disabled={!text.trim()}
                style={{ background: text.trim() ? G : "rgba(255,255,255,0.1)",
                  color: text.trim() ? N : "#64748b",
                  border:"none", borderRadius:"50%", width:44, height:44,
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  fontSize:18, display:"flex", alignItems:"center",
                  justifyContent:"center", flexShrink:0 }}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
