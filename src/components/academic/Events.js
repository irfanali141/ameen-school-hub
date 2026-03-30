/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge, HOUSES } from "../../constants";
import { supabase } from "../../supabase";

function Events({addData,houses,updateHousePoints}){
  const G="#d4af37";const N="#0f172a";const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [events,setEvents]=useState([]);const [show,setShow]=useState(false);
  const [f,setF]=useState({name:"",type:"competition",houseId:"abuBakr",points:0,month:1,notes:""});
  useEffect(()=>{ const load=async()=>{ const {data}=await supabase.from("events").select("*").order("created_at",{ascending:false}).limit(20); setEvents(data||[]); }; load(); },[]);
  const add=async()=>{ if(!f.name)return; const pts=Number(f.points); await addData("events",{...f,points:pts}); if(pts>0) await updateHousePoints(f.houseId,pts); setShow(false); setF({name:"",type:"competition",houseId:"abuBakr",points:0,month:1,notes:""}); };
  const evTypes={"competition":{l:"Competition",icon:"emoji_events",color:"#f59e0b"},"sports":{l:"Sports",icon:"sports_soccer",color:"#22c55e"},"academic":{l:"Academic",icon:"school",color:"#60a5fa"},"cultural":{l:"Cultural",icon:"theater_comedy",color:"#a78bfa"},"service":{l:"Community",icon:"volunteer_activism",color:"#34d399"}};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>theater_comedy</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>Events</h1>
            <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>Events & Competitions • {events.length} Events</p>
          </div>
        </div>
        <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G}`,background:show?"rgba(212,175,55,0.15)":"transparent",color:G,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
          <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Event"}
        </button>
      </div>
      {/* Add Form */}
      {show&&(
        <div style={{...glass,padding:"24px",marginBottom:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"22px"}}>add_circle</span>
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>New Event Entry</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>Event Name *</label><input style={inp} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Nasheed Competition..."/></div>
            <div><label style={lbl}>Type</label>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                {Object.entries(evTypes).map(([k,v])=>(
                  <button key={k} onClick={()=>setF({...f,type:k})} style={{padding:"7px 12px",borderRadius:"8px",border:`1px solid ${f.type===k?v.color:"rgba(255,255,255,0.12)"}`,background:f.type===k?`${v.color}20`:"transparent",color:f.type===k?v.color:"rgba(241,245,249,0.5)",fontWeight:"600",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",display:"flex",alignItems:"center",gap:"4px"}}>
                    <span className="material-symbols-rounded" style={{fontSize:"15px"}}>{v.icon}</span>{v.l}
                  </button>
                ))}
              </div>
            </div>
            <div><label style={lbl}>Winner House</label><select style={inp} value={f.houseId} onChange={e=>setF({...f,houseId:e.target.value})}>{HOUSES.map(h=><option key={h.id} value={h.id} style={{background:N2}}>{h.emoji} {h.nameEn}</option>)}</select></div>
            <div><label style={lbl}>Points</label><input style={{...inp,direction:"ltr"}} type="number" value={f.points} onChange={e=>setF({...f,points:e.target.value})}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>Notes</label><input style={inp} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="Details..."/></div>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>Cancel</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>Save
            </button>
          </div>
        </div>
      )}
      {/* Event Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"16px"}}>
        {events.map(ev=>{ const h=HOUSES.find(x=>x.id===ev.houseId)||{}; const et=evTypes[ev.type]||{l:ev.type,icon:"event",color:G}; return (
          <div key={ev.id} className="hv-card" style={{...glass,padding:"20px",borderRight:`3px solid ${h.color||G}`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:"-15px",left:"-15px",width:"70px",height:"70px",borderRadius:"50%",background:`${et.color}10`,pointerEvents:"none"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
              <div style={{flex:1,marginLeft:"10px"}}>
                <div style={{fontSize:"0.92rem",fontWeight:"700",color:"#f1f5f9",marginBottom:"4px"}}>{ev.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <span className="material-symbols-rounded" style={{fontSize:"14px",color:et.color}}>{et.icon}</span>
                  <span style={{fontSize:"0.65rem",color:et.color,fontWeight:"600"}}>{et.l}</span>
                </div>
              </div>
              <div style={{background:`linear-gradient(135deg,${G},#b8960a)`,borderRadius:"10px",padding:"6px 12px",textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:"0.6rem",color:N,fontWeight:"700",marginBottom:"1px"}}>Points</div>
                <div style={{fontSize:"1rem",fontWeight:"900",color:N}}>+{ev.points}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 12px",borderRadius:"10px",background:`${h.color||G}15`,border:`1px solid ${h.color||G}30`}}>
              <span style={{fontSize:"1.2rem"}}>{h.emoji}</span>
              <span style={{fontSize:"0.72rem",fontWeight:"600",color:h.color||G}}>Winner: {h.nameEn||"—"}</span>
            </div>
            {ev.notes&&<div style={{fontSize:"0.68rem",color:"rgba(241,245,249,0.45)",marginTop:"10px"}}>{ev.notes}</div>}
          </div>
        ); })}
        {events.length===0&&(
          <div style={{...glass,padding:"60px 20px",textAlign:"center",gridColumn:"1/-1"}}>
            <span className="material-symbols-rounded" style={{fontSize:"48px",color:"rgba(212,175,55,0.3)",display:"block",marginBottom:"12px"}}>theater_comedy</span>
            <div style={{color:"rgba(241,245,249,0.4)",fontSize:"0.9rem"}}>No events yet</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
