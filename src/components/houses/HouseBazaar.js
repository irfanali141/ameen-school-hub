/* eslint-disable */
import { useState, useEffect } from "react";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";
import { C, S, HOUSES } from "../../constants";

const G = C.gold; const W = C.white;
const glass  = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", borderRadius:"18px", border:"1px solid rgba(255,255,255,0.1)", padding:"20px" };
const glassS = { background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", borderRadius:"14px", border:"1px solid rgba(255,255,255,0.1)", padding:"14px" };

const DEFAULT_REWARDS = [
  { id:"r1", name:"Fancy Pencil",           nameEn:"Fancy Pencil",         price:50,   icon:"✏️",  stock:99 },
  { id:"r2", name:"Chocolate",               nameEn:"Chocolate",            price:100,  icon:"🍫",  stock:99 },
  { id:"r3", name:"Homework Pass",           nameEn:"Homework Pass",        price:500,  icon:"📄",  stock:10 },
  { id:"r4", name:"Lunch with Principal",   nameEn:"Lunch with Principal", price:1000, icon:"🍽️", stock:5  },
];

function getMonthLabel(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function fmt(n){ return Number(n||0).toLocaleString(); }

function badge(color, text){
  return <span style={{display:"inline-block",padding:"2px 9px",borderRadius:"10px",background:color+"22",color,fontSize:"0.63rem",fontWeight:"700",border:`1px solid ${color}33`}}>{text}</span>;
}

// ── Cheque Receipt Print ─────────────────────────────────────────
function printCheque(student, reward, houseInfo){
  const w=window.open("","_blank","width=700,height=500");
  w.document.write(`<!DOCTYPE html><html><body style="font-family:serif;padding:30px;background:#fffdf8;direction:rtl">
    <img src="${letterhead}" style="width:100%;max-width:600px;display:block;margin:0 auto 20px" onerror="this.style.display='none'"/>
    <div style="border:3px solid #b7860b;border-radius:16px;padding:28px;max-width:600px;margin:0 auto;background:#fff">
      <div style="text-align:center;font-size:1.4rem;font-weight:900;color:#b7860b;letter-spacing:0.08em;margin-bottom:4px">Ameen Rupees Voucher</div>
      <div style="text-align:center;font-size:0.9rem;color:#64748b;margin-bottom:20px">Ameen Rupees Voucher — House Bazaar</div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:12px">
        <div><strong>Paying:</strong> ${student?.name||"—"}</div>
        <div><strong>Date:</strong> ${new Date().toLocaleDateString("en-PK")}</div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:12px">
        <div><strong>Class:</strong> ${student?.grade||"—"}</div>
        <div><strong>House:</strong> ${houseInfo?.nameEn||"—"}</div>
      </div>
      <div style="text-align:center;margin:20px 0;padding:16px;background:#fef3c7;border-radius:10px;border:2px dashed #b7860b">
        <div style="font-size:2rem;margin-bottom:6px">${reward.icon}</div>
        <div style="font-size:1.1rem;font-weight:800;color:#1e293b">${reward.name} — ${reward.nameEn}</div>
        <div style="font-size:1.8rem;font-weight:900;color:#b7860b;margin-top:8px">${fmt(reward.price)} Ameen Rupees</div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:30px;align-items:flex-end">
        <div style="text-align:center;min-width:150px"><div style="border-top:1.5px solid #000;padding-top:5px;font-size:12px">Signature Student<br/>Student Signature</div></div>
        <div style="text-align:center;min-width:150px"><div style="border-top:1.5px solid #000;padding-top:5px;font-size:12px">Signature Principal<br/>Principal Signature</div></div>
      </div>
    </div>
    <script>window.print();window.close();<\/script>
  </body></html>`);
}

// ── Main Component ───────────────────────────────────────────────
export default function HouseBazaar({ addData, students=[] }){
  const [tab,        setTab]        = useState("bazaar");
  const [selStu,     setSelStu]     = useState("");
  const [txns,       setTxns]       = useState([]);       // bazaar_transactions
  const [rewards,    setRewards]    = useState([...DEFAULT_REWARDS]);
  const [dbRewards,  setDbRewards]  = useState([]);
  const [rewardsLoaded, setRwLoaded]= useState(false);

  // Catalog management
  const [newReward,  setNewReward]  = useState({name:"",nameEn:"",price:"",icon:"🎁",stock:""});
  const [editRid,    setEditRid]    = useState(null);

  // Bonus form
  const [bonusForm,  setBonusForm]  = useState({studentId:"",amount:"",notes:""});
  const [bonusSaving,setBonusSaving]= useState(false);
  const [bonusSaved, setBonusSaved] = useState(false);

  // Redeem confirm
  const [confirmRedeem, setConfirmRedeem] = useState(null); // {reward}

  useEffect(()=>{
    getData("bazaar_transactions").then(d=>{ if(d&&!d.error) setTxns(d); });
    getData("bazaar_rewards").then(d=>{
      if(d&&!d.error&&d.length>0){ setDbRewards(d); setRewards(d); }
      else { setRewards([...DEFAULT_REWARDS]); }
      setRwLoaded(true);
    });
  },[]);

  // ── Balance Helpers ──────────────────────────────────────────
  const stuTxns  = (sid) => txns.filter(t=>t.student_id===sid);
  const balance  = (sid) => stuTxns(sid).reduce((s,t)=> s + (t.type==="credit"?+t.amount:-+t.amount), 0);
  const spent    = (sid) => stuTxns(sid).filter(t=>t.type==="debit").reduce((s,t)=>s+(+t.amount||0),0);
  const earned   = (sid) => stuTxns(sid).filter(t=>t.type==="credit").reduce((s,t)=>s+(+t.amount||0),0);

  const student   = students.find(s=>s.id===selStu)||null;
  const houseInfo = HOUSES.find(h=>h.id===student?.houseId)||HOUSES[0];
  const bal       = balance(selStu);

  // ── Redeem ───────────────────────────────────────────────────
  const doRedeem=async(reward)=>{
    if(!selStu||bal<reward.price){ setConfirmRedeem(null); return; }
    const rec={ student_id:selStu, type:"debit", amount:reward.price,
                reward_id:reward.id, reward_name:reward.name,
                notes:`Redeemed: ${reward.nameEn}`, created_at:new Date().toISOString() };
    await addData("bazaar_transactions", rec);
    setTxns(prev=>[...prev,{...rec,id:Date.now()}]);
    setConfirmRedeem(null);
    printCheque(student, reward, houseInfo);
  };

  // ── Add Bonus ────────────────────────────────────────────────
  const addBonus=async()=>{
    if(!bonusForm.studentId||!bonusForm.amount) return;
    setBonusSaving(true);
    const rec={ student_id:bonusForm.studentId, type:"credit", amount:+bonusForm.amount,
                reward_id:"bonus", reward_name:"Bonus", notes:bonusForm.notes||"Bonus by director",
                created_at:new Date().toISOString() };
    await addData("bazaar_transactions", rec);
    setTxns(prev=>[...prev,{...rec,id:Date.now()}]);
    setBonusForm({studentId:"",amount:"",notes:""});
    setBonusSaving(false); setBonusSaved(true); setTimeout(()=>setBonusSaved(false),2000);
  };

  // ── Save Reward to Catalog ───────────────────────────────────
  const saveReward=async()=>{
    if(!newReward.name||!newReward.price) return;
    const rec={...newReward, price:+newReward.price, stock:+newReward.stock||99, id:`r${Date.now()}`};
    await addData("bazaar_rewards", rec);
    setRewards(prev=>[...prev,rec]);
    setNewReward({name:"",nameEn:"",price:"",icon:"🎁",stock:""});
  };

  const removeReward=(rid)=>setRewards(prev=>prev.filter(r=>r.id!==rid));

  // ── All txns sorted desc ─────────────────────────────────────
  const allTxns=[...txns].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));

  const TABS=[
    ["bazaar","🛍️ Bazaar"],
    ["transactions","📋 Transaction"],
    ["catalog","🎁 Rewards Catalog"],
    ["bonus","➕ Bonus"],
  ];

  return (
    <div style={{background:`linear-gradient(135deg,${C.navyDark} 0%,${C.navyMid} 60%,${C.navy} 100%)`,minHeight:"100vh",padding:"20px",direction:"ltr"}}>

      {/* Header */}
      <div style={{...glass,marginBottom:"18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <div>
          <div style={{fontSize:"1.3rem",fontWeight:"800",color:G}}>🏪 House Bazaar</div>
          <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.5)",marginTop:"3px"}}>House Bazaar — Point Economy · 100 HVS Points = 100 Ameen Rupees</div>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
          <select value={selStu} onChange={e=>setSelStu(e.target.value)}
            style={{...S.inpSm,background:"rgba(255,255,255,0.06)",color:selStu?W:"rgba(255,255,255,0.4)",border:`1px solid ${G}40`,minWidth:"200px"}}>
            <option value="">— Student Select —</option>
            {students.map(st=>(
              <option key={st.id} value={st.id} style={{background:C.navyDark,color:W}}>
                {st.name} ({st.grade}) — {fmt(balance(st.id))} ₳
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{display:"flex",gap:"6px",marginBottom:"18px",flexWrap:"wrap"}}>
        {TABS.map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:"10px 20px",borderRadius:"12px",fontFamily:"inherit",fontSize:"0.78rem",fontWeight:"700",cursor:"pointer",transition:"all 0.2s",
              border:`1.5px solid ${tab===id?G:"rgba(255,255,255,0.1)"}`,
              background:tab===id?"rgba(183,134,11,0.18)":"rgba(255,255,255,0.04)",
              color:tab===id?G:W}}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── TAB: Bazaar ── */}
      {tab==="bazaar"&&(
        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"18px",alignItems:"start"}}>

          {/* Left: Student Balance Card */}
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            {/* Balance */}
            <div style={{...glass,textAlign:"center"}}>
              {student?(
                <>
                  <div style={{width:"52px",height:"52px",borderRadius:"14px",background:houseInfo.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",margin:"0 auto 10px"}}>{houseInfo.emoji}</div>
                  <div style={{fontSize:"0.85rem",fontWeight:"700",color:W,marginBottom:"2px"}}>{student.name}</div>
                  <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.4)",marginBottom:"14px"}}>{student.grade} · {houseInfo.name}</div>
                  <div style={{fontSize:"2.4rem",fontWeight:"900",color:G,lineHeight:1}}>{fmt(bal)}</div>
                  <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.45)",marginBottom:"10px"}}>Ameen Rupees ₳</div>
                  <div style={{height:"6px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden",margin:"0 0 10px"}}>
                    <div style={{width:`${Math.min(100,Math.round((bal/1000)*100))}%`,height:"100%",background:houseInfo.gradient,borderRadius:"3px"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-around",fontSize:"0.65rem",color:"rgba(255,255,255,0.45)"}}>
                    <div><div style={{color:C.green,fontWeight:"700"}}>{fmt(earned(selStu))} ₳</div>Earned</div>
                    <div><div style={{color:C.red,fontWeight:"700"}}>{fmt(spent(selStu))} ₳</div>Expense</div>
                    <div><div style={{color:G,fontWeight:"700"}}>{fmt(bal)} ₳</div>Balance</div>
                  </div>
                </>
              ):(
                <div style={{padding:"30px 0",color:"rgba(255,255,255,0.25)",fontSize:"0.8rem"}}>Student Select</div>
              )}
            </div>

            {/* Mini transaction history */}
            {selStu&&(
              <div style={glassS}>
                <div style={{fontSize:"0.7rem",color:G,fontWeight:"700",marginBottom:"10px"}}>Latest Transaction</div>
                {stuTxns(selStu).slice(-5).reverse().map((t,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"7px",padding:"7px 10px",borderRadius:"8px",background:"rgba(255,255,255,0.04)"}}>
                    <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.6)"}}>
                      <div>{t.reward_name||t.notes||"—"}</div>
                      <div style={{color:"rgba(255,255,255,0.3)",marginTop:"1px"}}>{t.created_at?.slice(0,10)||"—"}</div>
                    </div>
                    <div style={{fontSize:"0.72rem",fontWeight:"800",color:t.type==="credit"?C.green:C.red}}>
                      {t.type==="credit"?"+":"-"}{fmt(t.amount)} ₳
                    </div>
                  </div>
                ))}
                {stuTxns(selStu).length===0&&<div style={{color:"rgba(255,255,255,0.2)",fontSize:"0.7rem",textAlign:"center"}}>Any Transaction No</div>}
              </div>
            )}
          </div>

          {/* Right: Rewards Grid */}
          <div>
            <div style={{fontSize:"0.88rem",color:G,fontWeight:"700",marginBottom:"14px"}}>🎁 Rewards Bazaar</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:"14px"}}>
              {rewards.map(reward=>{
                const canAfford=selStu&&bal>=reward.price;
                return (
                  <div key={reward.id} style={{...glassS,textAlign:"center",position:"relative",opacity:(!selStu||canAfford)?1:0.55,transition:"opacity 0.2s"}}>
                    <div style={{fontSize:"2.2rem",marginBottom:"8px"}}>{reward.icon}</div>
                    <div style={{fontSize:"0.82rem",fontWeight:"700",color:W,marginBottom:"2px"}}>{reward.name}</div>
                    <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)",marginBottom:"12px"}}>{reward.nameEn}</div>
                    <div style={{fontSize:"1.4rem",fontWeight:"900",color:G,marginBottom:"12px"}}>{fmt(reward.price)} <span style={{fontSize:"0.7rem"}}>₳</span></div>
                    <button onClick={()=>canAfford&&setConfirmRedeem(reward)}
                      disabled={!canAfford}
                      style={{padding:"9px 20px",borderRadius:"10px",border:"none",cursor:canAfford?"pointer":"not-allowed",fontFamily:"inherit",fontSize:"0.75rem",fontWeight:"700",
                        background:canAfford?`linear-gradient(135deg,${G},${C.goldDark})`:"rgba(255,255,255,0.08)",
                        color:canAfford?W:"rgba(255,255,255,0.3)",
                        boxShadow:canAfford?`0 4px 12px ${C.goldGlow}`:"none"}}>
                      {!selStu?"Select student first":canAfford?"Redeem":"Insufficient balance"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: All Transactions ── */}
      {tab==="transactions"&&(
        <div style={glass}>
          <div style={{fontSize:"0.88rem",color:G,fontWeight:"700",marginBottom:"14px"}}>📋 All Transaction</div>
          {/* Summary per selected student */}
          {selStu&&(
            <div style={{display:"flex",gap:"12px",marginBottom:"16px",flexWrap:"wrap"}}>
              {[
                [C.green,"Earned",`${fmt(earned(selStu))} ₳`],
                [C.red,"Spent",`${fmt(spent(selStu))} ₳`],
                [G,"Balance Amount",`${fmt(bal)} ₳`],
              ].map(([col,lbl,val])=>(
                <div key={lbl} style={{padding:"10px 18px",borderRadius:"12px",background:`${col}15`,border:`1px solid ${col}33`,textAlign:"center"}}>
                  <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.45)"}}>{lbl}</div>
                  <div style={{fontSize:"1rem",fontWeight:"800",color:col}}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {allTxns.length===0
            ? <div style={{textAlign:"center",padding:"50px",color:"rgba(255,255,255,0.2)"}}>Any Transaction No</div>
            : (
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:"650px"}}>
                  <thead>
                    <tr>{["Date","Student","Type","Reward / Reason","Amount","Notes"].map(h=>(
                      <th key={h} style={{...S.th,background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.5)",padding:"10px 14px"}}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {allTxns.filter(t=>!selStu||t.student_id===selStu).map((t,i)=>{
                      const stu=students.find(s=>s.id===t.student_id);
                      const isCredit=t.type==="credit";
                      return (
                        <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                          <td style={{...S.td,color:"rgba(255,255,255,0.45)",padding:"9px 14px",direction:"ltr",fontSize:"0.68rem"}}>{t.created_at?.slice(0,10)||"—"}</td>
                          <td style={{...S.td,color:W,padding:"9px 14px",fontSize:"0.72rem"}}>{stu?.name||t.student_id}</td>
                          <td style={{padding:"9px 14px"}}>
                            <span style={{display:"inline-block",padding:"3px 9px",borderRadius:"8px",background:(isCredit?C.green:C.red)+"22",color:isCredit?C.green:C.red,fontSize:"0.63rem",fontWeight:"700"}}>
                              {isCredit?"Credit":"Debit"}
                            </span>
                          </td>
                          <td style={{...S.td,color:"rgba(255,255,255,0.7)",padding:"9px 14px",fontSize:"0.72rem"}}>{t.reward_name||"—"}</td>
                          <td style={{...S.td,color:isCredit?C.green:C.red,fontWeight:"800",padding:"9px 14px",direction:"ltr"}}>
                            {isCredit?"+":"-"}{fmt(t.amount)} ₳
                          </td>
                          <td style={{...S.td,color:"rgba(255,255,255,0.4)",padding:"9px 14px",fontSize:"0.68rem"}}>{t.notes||"—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      {/* ── TAB: Rewards Catalog ── */}
      {tab==="catalog"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:"18px",alignItems:"start"}}>
          {/* Existing rewards */}
          <div style={glass}>
            <div style={{fontSize:"0.88rem",color:G,fontWeight:"700",marginBottom:"14px"}}>🎁 Rewards Catalog</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px"}}>
              {rewards.map(reward=>(
                <div key={reward.id} style={{...glassS,display:"flex",flexDirection:"column",gap:"6px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <span style={{fontSize:"1.6rem"}}>{reward.icon}</span>
                    <button onClick={()=>removeReward(reward.id)}
                      style={{background:"rgba(220,38,38,0.2)",border:"none",borderRadius:"6px",color:C.red,cursor:"pointer",padding:"3px 8px",fontSize:"0.65rem",fontWeight:"700"}}>
                      ✕
                    </button>
                  </div>
                  <div style={{fontSize:"0.78rem",fontWeight:"700",color:W}}>{reward.name}</div>
                  <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)"}}>{reward.nameEn}</div>
                  <div style={{fontSize:"1rem",fontWeight:"800",color:G}}>{fmt(reward.price)} ₳</div>
                  <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)"}}>Stock: {reward.stock||"∞"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Add new reward */}
          <div style={glass}>
            <div style={{fontSize:"0.85rem",color:G,fontWeight:"700",marginBottom:"14px"}}>+ Add New Reward</div>
            {[
              ["Reward Name","text","name","e.g. Book"],
              ["English Name","text","nameEn","e.g. Story Book"],
              ["Price (₳)","number","price","500"],
              ["Stock","number","stock","10"],
            ].map(([lbl,type,key,ph])=>(
              <div key={key} style={{marginBottom:"10px"}}>
                <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>{lbl}</div>
                <input type={type} placeholder={ph} value={newReward[key]||""}
                  onChange={e=>setNewReward(p=>({...p,[key]:e.target.value}))}
                  style={{...S.inpSm,background:"rgba(255,255,255,0.06)",color:W,border:"1px solid rgba(255,255,255,0.12)"}}/>
              </div>
            ))}
            <div style={{marginBottom:"12px"}}>
              <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>Icon (emoji)</div>
              <input placeholder="🎁" value={newReward.icon}
                onChange={e=>setNewReward(p=>({...p,icon:e.target.value}))}
                style={{...S.inpSm,background:"rgba(255,255,255,0.06)",color:W,border:"1px solid rgba(255,255,255,0.12)",width:"70px",fontSize:"1.2rem"}}/>
            </div>
            <button onClick={saveReward}
              style={{...S.addBtn,width:"100%",padding:"11px"}}>
              + Add Reward
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: Bonus ── */}
      {tab==="bonus"&&(
        <div style={{display:"grid",gridTemplateColumns:"400px 1fr",gap:"18px",alignItems:"start"}}>
          {/* Add Bonus Form */}
          <div style={glass}>
            <div style={{fontSize:"0.88rem",color:G,fontWeight:"700",marginBottom:"16px"}}>➕ Bonus Points Add</div>
            <div style={{marginBottom:"12px"}}>
              <div style={{fontSize:"0.67rem",color:"rgba(255,255,255,0.5)",marginBottom:"5px"}}>Student</div>
              <select value={bonusForm.studentId} onChange={e=>setBonusForm(p=>({...p,studentId:e.target.value}))}
                style={{...S.inpSm,background:"rgba(255,255,255,0.06)",color:bonusForm.studentId?W:"rgba(255,255,255,0.35)",border:"1px solid rgba(255,255,255,0.12)"}}>
                <option value="">— Select —</option>
                {students.map(st=>(
                  <option key={st.id} value={st.id} style={{background:C.navyDark,color:W}}>{st.name} ({st.grade})</option>
                ))}
              </select>
            </div>
            <div style={{marginBottom:"12px"}}>
              <div style={{fontSize:"0.67rem",color:"rgba(255,255,255,0.5)",marginBottom:"5px"}}>Amount (Ameen Rupees ₳)</div>
              <input type="number" placeholder="e.g. 200" value={bonusForm.amount}
                onChange={e=>setBonusForm(p=>({...p,amount:e.target.value}))}
                style={{...S.inpSm,background:"rgba(255,255,255,0.06)",color:W,border:"1px solid rgba(255,255,255,0.12)"}}/>
            </div>
            <div style={{marginBottom:"16px"}}>
              <div style={{fontSize:"0.67rem",color:"rgba(255,255,255,0.5)",marginBottom:"5px"}}>Reason / Notes</div>
              <input placeholder="e.g. Best Student of the Week" value={bonusForm.notes}
                onChange={e=>setBonusForm(p=>({...p,notes:e.target.value}))}
                style={{...S.inpSm,background:"rgba(255,255,255,0.06)",color:W,border:"1px solid rgba(255,255,255,0.12)"}}/>
            </div>
            <button onClick={addBonus} disabled={bonusSaving||!bonusForm.studentId||!bonusForm.amount}
              style={{...S.saveBtn,width:"100%",padding:"12px",opacity:(!bonusForm.studentId||!bonusForm.amount)?0.5:1}}>
              {bonusSaving?"Saving...":bonusSaved?"✅ Bonus Added!":"✔ Bonus Add"}
            </button>
          </div>

          {/* All students balance leaderboard */}
          <div style={glass}>
            <div style={{fontSize:"0.88rem",color:G,fontWeight:"700",marginBottom:"14px"}}>💰 Students Balance Amount</div>
            {students.length===0
              ? <div style={{color:"rgba(255,255,255,0.2)",textAlign:"center",padding:"30px"}}>Any Student No</div>
              : (
                <div style={{overflowY:"auto",maxHeight:"420px"}}>
                  {[...students]
                    .map(st=>({...st,bal:balance(st.id)}))
                    .sort((a,b)=>b.bal-a.bal)
                    .map((st,i)=>{
                      const hi=HOUSES.find(h=>h.id===st.houseId)||HOUSES[0];
                      return (
                        <div key={st.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderRadius:"10px",marginBottom:"6px",background:"rgba(255,255,255,0.04)",border:i===0?`1px solid ${G}40`:"1px solid transparent"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                            <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.3)",minWidth:"20px"}}>{i+1}</span>
                            <div style={{width:"28px",height:"28px",borderRadius:"7px",background:hi.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem"}}>{hi.emoji}</div>
                            <div>
                              <div style={{fontSize:"0.75rem",fontWeight:"700",color:W}}>{st.name}</div>
                              <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>{st.grade}</div>
                            </div>
                          </div>
                          <div style={{fontSize:"0.85rem",fontWeight:"900",color:st.bal>0?G:"rgba(255,255,255,0.3)",direction:"ltr"}}>{fmt(st.bal)} ₳</div>
                        </div>
                      );
                    })
                  }
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* ── Confirm Redeem Modal ── */}
      {confirmRedeem&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)"}}>
          <div style={{...glass,maxWidth:"380px",width:"90%",textAlign:"center",padding:"28px"}}>
            <div style={{fontSize:"3rem",marginBottom:"10px"}}>{confirmRedeem.icon}</div>
            <div style={{fontSize:"1rem",fontWeight:"700",color:W,marginBottom:"4px"}}>{confirmRedeem.name}</div>
            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)",marginBottom:"16px"}}>{confirmRedeem.nameEn}</div>
            <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",marginBottom:"6px"}}>Price</div>
            <div style={{fontSize:"2rem",fontWeight:"900",color:G,marginBottom:"4px"}}>{fmt(confirmRedeem.price)} ₳</div>
            <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)",marginBottom:"20px"}}>
              Balance after purchase: <span style={{color:G,fontWeight:"700"}}>{fmt(bal-confirmRedeem.price)} ₳</span>
            </div>
            <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
              <button onClick={()=>doRedeem(confirmRedeem)}
                style={{...S.addBtn,padding:"11px 24px"}}>✅ Confirm</button>
              <button onClick={()=>setConfirmRedeem(null)}
                style={{...S.dangerBtn,padding:"11px 24px"}}>Cancel</button>
            </div>
            <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.3)",marginTop:"12px"}}>Voucher will print automatically</div>
          </div>
        </div>
      )}
    </div>
  );
}
