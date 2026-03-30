/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { supabase } from "../../supabase";

function LogisticsTracker({addData}){
  const [assets,setAssets]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("assets");
  const [f,setF]=useState({name:"",category:"furniture",quantity:1,condition:"good",location:"",purchaseDate:"",purchasePrice:0,notes:""});
  const [mainF,setMainF]=useState({assetId:"",issue:"",reportedBy:"",priority:"normal",date:new Date().toISOString().split("T")[0]});
  const [maintenance,setMaintenance]=useState([]);
  useEffect(()=>{ const load=async()=>{ const {data:a}=await supabase.from("assets").select("*"); setAssets(a||[]); const {data:m}=await supabase.from("maintenance").select("*").order("created_at",{ascending:false}).limit(30); setMaintenance(m||[]); }; load(); },[]);
  const add=async()=>{ if(!f.name)return; await addData("assets",{...f,quantity:Number(f.quantity),purchasePrice:Number(f.purchasePrice)}); setShow(false); setF({name:"",category:"furniture",quantity:1,condition:"good",location:"",purchaseDate:"",purchasePrice:0,notes:""}); };
  const addMaint=async()=>{ if(!mainF.assetId||!mainF.issue)return; await addData("maintenance",{...mainF,status:"open"}); setMainF({assetId:"",issue:"",reportedBy:"",priority:"normal",date:new Date().toISOString().split("T")[0]}); };
  const resolveM=async(id)=>{ await supabase.from("maintenance").update({status:"resolved",resolved_at:new Date().toISOString()}).eq("id",id); };
  const cats={furniture:"🪑 Furniture",electronics:"💻 Electronics",sports:"⚽ Sports",kitchen:"🍽️ Kitchen",classroom:"📚 Class",other:"📦 Other"};
  const condConfig={good:{c:C.green,l:"اچھا"},fair:{c:C.amber,l:"ٹھیک"},poor:{c:C.red,l:"خراب"},broken:{c:"#888",l:"ٹوٹا"}};
  const totalValue=assets.reduce((s,a)=>s+(a.purchasePrice||0),0);

  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(212,175,55,0.4)"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>inventory_2</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>Asset Tracker</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>Equipment, Furniture, Electronics</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Asset"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:"#60a5fa",i:"📦",n:assets.length,l:"کل اثاثے"},{c:"#4ade80",i:"✅",n:assets.filter(a=>a.condition==="good").length,l:"اچھی حالت"},{c:"#f87171",i:"⚠️",n:maintenance.filter(m=>m.status==="open").length,l:"زیر مرمت"},{c:"#d4af37",i:"💰",n:`Rs.${(totalValue/1000).toFixed(0)}K`,l:"کل مالیت"}].map((x,i)=><div key={i} style={{background:`${x.c}15`,borderRadius:"16px",padding:"16px",border:`1px solid ${x.c}30`,textAlign:"center"}}><div style={{fontSize:"1.3rem"}}>{x.i}</div><div style={{fontSize:"1.2rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>نام *</label><input style={inp} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="کرسی، کمپیوٹر..."/></div>
        <div><label style={lbl}>زمرہ</label><select style={inp} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(cats).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v}</option>)}</select></div>
        <div><label style={lbl}>تعداد</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.quantity} onChange={e=>setF({...f,quantity:e.target.value})}/></div>
        <div><label style={lbl}>حالت</label><select style={inp} value={f.condition} onChange={e=>setF({...f,condition:e.target.value})}>{Object.entries(condConfig).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v.l}</option>)}</select></div>
        <div><label style={lbl}>مقام</label><input style={inp} value={f.location} onChange={e=>setF({...f,location:e.target.value})} placeholder="کمرہ 101..."/></div>
        <div><label style={lbl}>قیمت</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.purchasePrice} onChange={e=>setF({...f,purchasePrice:e.target.value})}/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={add}>Save</button>
    </div>}
    <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>{[["assets","📦 Assets"],["maintenance","🔧 Maintenance"],["report","⚠️ Issue Report"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 14px",borderRadius:"10px",border:tab===t?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"rgba(255,255,255,0.04)",color:tab===t?"#0f172a":"rgba(255,255,255,0.6)",fontFamily:"inherit"}}>{l}</button>)}</div>
    {tab==="assets"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["نام","زمرہ","تعداد","مقام","حالت","قیمت"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{assets.map((a,ri)=>{ const cc=condConfig[a.condition]||condConfig.good; return <tr key={a.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a.name}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{cats[a.category]||a.category}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a.quantity}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a.location||"—"}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:`${cc.c}20`,color:cc.c}}>{cc.l}</span></td>
        <td style={{padding:"11px 14px",color:"#d4af37",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a.purchasePrice>0?`Rs. ${a.purchasePrice.toLocaleString()}`:"—"}</td>
      </tr>; })}{assets.length===0&&<tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی اثاثہ نہیں</td></tr>}</tbody>
    </table></div></div>}
    {tab==="report"&&<div style={{...glass,padding:"24px",borderColor:"rgba(248,113,113,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>اثاثہ</label><select style={inp} value={mainF.assetId} onChange={e=>setMainF({...mainF,assetId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{assets.map(a=><option key={a.id} value={a.id} style={{background:N2}}>{a.name}</option>)}</select></div>
        <div><label style={lbl}>ترجیح</label><select style={inp} value={mainF.priority} onChange={e=>setMainF({...mainF,priority:e.target.value})}><option value="normal" style={{background:N2}}>عام</option><option value="high" style={{background:N2}}>اہم</option><option value="urgent" style={{background:N2}}>فوری</option></select></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>مسئلہ</label><textarea style={{...inp,minHeight:"60px",resize:"vertical"}} value={mainF.issue} onChange={e=>setMainF({...mainF,issue:e.target.value})} placeholder="مسئلے کی تفصیل..."/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#fb923c,#b45309)",color:"#fff",border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addMaint}>مسئلہ رپورٹ کریں</button>
    </div>}
    {tab==="maintenance"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["اثاثہ","مسئلہ","ترجیح","حیثیت","عمل"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{maintenance.map((m,ri)=>{ const a=assets.find(x=>x.id===m.assetId); const pc=m.priority==="urgent"?"#f87171":m.priority==="high"?"#fb923c":"#60a5fa"; return <tr key={m.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",color:"#f1f5f9",fontWeight:"700",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{a?.name||"—"}</td>
        <td style={{padding:"11px 14px",color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{m.issue?.slice(0,50)||"—"}</td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.6rem",fontWeight:"700",background:`${pc}20`,color:pc}}>{m.priority==="urgent"?"فوری":m.priority==="high"?"اہم":"عام"}</span></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:m.status==="resolved"?"rgba(74,222,128,0.15)":"rgba(251,191,36,0.15)",color:m.status==="resolved"?"#4ade80":"#fbbf24"}}>{m.status==="resolved"?"✅ حل شدہ":"⏳ کھلا"}</span></td>
        <td style={{padding:"11px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{m.status==="open"&&<button onClick={()=>resolveM(m.id)} style={{background:"linear-gradient(135deg,#4ade80,#16a34a)",color:"#0f172a",border:"none",borderRadius:"8px",padding:"4px 10px",fontSize:"0.6rem",cursor:"pointer",fontWeight:"700"}}>حل کریں</button>}</td>
      </tr>; })}{maintenance.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی مرمت اندراج نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

export default LogisticsTracker;
