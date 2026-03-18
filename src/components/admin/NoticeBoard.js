/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { db, collection, onSnapshot, query, orderBy, limit } from "../../firebase";

function NoticeBoard({addData,user}){
  const [notices,setNotices]=useState([]); const [show,setShow]=useState(false);
  const [f,setF]=useState({title:"",content:"",category:"general",priority:"normal",pinned:false,expiryDate:""});
  useEffect(()=>{ return onSnapshot(query(collection(db,"notices"),orderBy("createdAt","desc"),limit(30)),s=>setNotices(s.docs.map(d=>({id:d.id,...d.data()}))));  },[]);
  const add=async()=>{ if(!f.title||!f.content)return; await addData("notices",{...f}); setShow(false); setF({title:"",content:"",category:"general",priority:"normal",pinned:false,expiryDate:""}); };
  const catConfig={general:{c:C.abuBakr,bg:"#dbeafe",i:"📢",l:"عام"},academic:{c:C.green,bg:"#dcfce7",i:"📚",l:"تعلیمی"},exam:{c:C.amber,bg:"#fef3c7",i:"📝",l:"امتحان"},event:{c:C.purple,bg:"#ede9fe",i:"🎭",l:"تقریب"},urgent:{c:C.red,bg:"#fee2e2",i:"🚨",l:"فوری"},hifz:{c:C.gold,bg:C.goldLight,i:"📖",l:"حفظ"}};
  const pinned=notices.filter(n=>n.pinned); const regular=notices.filter(n=>!n.pinned);

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>campaign</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>نوٹس بورڈ</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>اطلاعات، احکامات، اعلانات</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نیا نوٹس"}</button>
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>عنوان *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="نوٹس کا عنوان..."/></div>
        <div><label style={lbl}>زمرہ</label><select style={inp} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(catConfig).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.i} {v.l}</option>)}</select></div>
        <div><label style={lbl}>ترجیح</label><select style={inp} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}><option value="normal" style={{background:N2}}>عام</option><option value="high" style={{background:N2}}>اہم</option><option value="urgent" style={{background:N2}}>فوری</option></select></div>
        <div><label style={lbl}>میعاد ختم</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={f.expiryDate} onChange={e=>setF({...f,expiryDate:e.target.value})}/></div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}><input type="checkbox" checked={f.pinned} onChange={e=>setF({...f,pinned:e.target.checked})} id="pin"/><label htmlFor="pin" style={{fontSize:"0.68rem",color:"#f1f5f9",cursor:"pointer"}}>📌 اوپر پن کریں</label></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>مواد *</label><textarea style={{...inp,minHeight:"100px",resize:"vertical"}} value={f.content} onChange={e=>setF({...f,content:e.target.value})} placeholder="نوٹس کا مکمل متن..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>شائع کریں</button>
    </div>}
    {pinned.length>0&&<div style={{marginBottom:"20px"}}>
      <div style={{fontSize:"0.72rem",fontWeight:"700",color:"#d4af37",marginBottom:"10px"}}>📌 پن شدہ نوٹسز</div>
      {pinned.map(n=>{ const cc=catConfig[n.category]||catConfig.general; return <div key={n.id} style={{...glass,padding:"16px 20px",marginBottom:"10px",borderRight:`4px solid ${cc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{cc.i}</span><span style={{fontSize:"0.85rem",fontWeight:"700",color:"#f1f5f9"}}>{n.title}</span><span style={{fontSize:"0.55rem",color:"#d4af37"}}>📌</span></div></div>
          <span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)"}}>{cc.l}</span>
        </div>
        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.6)",lineHeight:"1.7"}}>{n.content}</div>
      </div>; })}
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
      {regular.map(n=>{ const cc=catConfig[n.category]||catConfig.general; return <div key={n.id} style={{...glass,padding:"16px 20px",borderRight:`4px solid ${cc.c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}><span style={{fontSize:"1rem"}}>{cc.i}</span><span style={{fontSize:"0.82rem",fontWeight:"700",color:"#f1f5f9"}}>{n.title}</span></div></div>
          <span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)"}}>{cc.l}</span>
        </div>
        <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.55)",lineHeight:"1.7"}}>{n.content}</div>
      </div>; })}
      {notices.length===0&&<div style={{...glass,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"60px"}}><span className="material-symbols-rounded" style={{fontSize:"48px",display:"block",marginBottom:"12px",color:"rgba(212,175,55,0.3)"}}>campaign</span>ابھی کوئی نوٹس نہیں!</div>}
    </div>
  </div>;
}

export default NoticeBoard;
