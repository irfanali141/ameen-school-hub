/* eslint-disable */
import { useState, useEffect } from "react";
import { C, S, hBadge } from "../../constants";
import { db, collection, onSnapshot, updateDoc, doc, query, orderBy, limit } from "../../firebase";

function Library({students,addData}){
  const G="#d4af37"; const N="#0f172a"; const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"rtl",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const [books,setBooks]=useState([]); const [issues,setIssues]=useState([]); const [show,setShow]=useState(false); const [tab,setTab]=useState("books");
  const [f,setF]=useState({title:"",author:"",category:"Islamic",totalCopies:1,available:1});
  const [issueF,setIssueF]=useState({bookId:"",studentId:"",dueDate:""});
  useEffect(()=>{
    const u1=onSnapshot(collection(db,"library_books"),s=>setBooks(s.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(query(collection(db,"library_issues"),orderBy("createdAt","desc"),limit(50)),s=>setIssues(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{u1();u2();};
  },[]);
  const addBook=async()=>{ if(!f.title)return; await addData("library_books",{...f,totalCopies:Number(f.totalCopies),available:Number(f.totalCopies)}); setShow(false); setF({title:"",author:"",category:"Islamic",totalCopies:1,available:1}); };
  const issueBook=async()=>{ if(!issueF.bookId||!issueF.studentId)return; await addData("library_issues",{...issueF,status:"issued",issuedDate:new Date().toISOString().split("T")[0]}); await updateDoc(doc(db,"library_books",issueF.bookId),{available:Math.max(0,(books.find(b=>b.id===issueF.bookId)?.available||1)-1)}); setIssueF({bookId:"",studentId:"",dueDate:""}); };
  const returnBook=async(issue)=>{ await updateDoc(doc(db,"library_issues",issue.id),{status:"returned",returnedDate:new Date().toISOString().split("T")[0]}); await updateDoc(doc(db,"library_books",issue.bookId),{available:(books.find(b=>b.id===issue.bookId)?.available||0)+1}); };
  const cats=["Islamic","Quran","Hadith","Science","Math","Urdu","English","History","Other"];
  const overdue=issues.filter(i=>i.status==="issued"&&i.dueDate&&new Date(i.dueDate)<new Date());
  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f172a 0%,#0d1f3c 50%,#0a1628 100%)",padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"rtl"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#d4af37,#b8960a)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>library_books</span></div>
        <div><h2 style={{margin:0,fontSize:"1.4rem",fontWeight:"800",color:"#f1f5f9"}}>لائبریری</h2><p style={{margin:0,fontSize:"0.72rem",color:"rgba(212,175,55,0.7)"}}>{books.length} کتابیں</p></div>
      </div>
      <button style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",borderRadius:"12px",border:"1px solid #d4af37",background:show?"rgba(212,175,55,0.15)":"transparent",color:"#d4af37",fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} onClick={()=>setShow(!show)}><span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"منسوخ":"نئی کتاب"}</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"20px"}}>
      {[{c:"#60a5fa",i:"library_books",n:books.length,l:"کل کتابیں"},{c:"#4ade80",i:"check_circle",n:issues.filter(i=>i.status==="issued").length,l:"جاری"},{c:"#f87171",i:"warning",n:overdue.length,l:"واجب الواپسی"},{c:"#d4af37",i:"menu_book",n:books.reduce((s,b)=>s+(b.available||0),0),l:"دستیاب"}].map((x,i)=><div key={i} style={{...glass,padding:"16px",textAlign:"center"}}><span className="material-symbols-rounded" style={{fontSize:"28px",color:x.c,display:"block",marginBottom:"8px"}}>{x.i}</span><div style={{fontSize:"1.4rem",fontWeight:"900",color:x.c}}>{x.n}</div><div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.5)"}}>{x.l}</div></div>)}
    </div>
    {show&&<div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>کتاب کا نام *</label><input style={inp} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="کتاب کا نام..."/></div>
        <div><label style={lbl}>مصنف</label><input style={inp} value={f.author} onChange={e=>setF({...f,author:e.target.value})} placeholder="مصنف کا نام..."/></div>
        <div><label style={lbl}>زمرہ</label><select style={inp} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{cats.map(c=><option key={c} style={{background:N2}}>{c}</option>)}</select></div>
        <div><label style={lbl}>کاپیاں</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="number" value={f.totalCopies} onChange={e=>setF({...f,totalCopies:e.target.value})}/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={addBook}>محفوظ کریں</button>
    </div>}
    <div style={{display:"flex",gap:"6px",marginBottom:"16px",background:"rgba(255,255,255,0.04)",padding:"4px",borderRadius:"10px",width:"fit-content"}}>{[["books","library_books","کتابیں"],["issue","upload","جاری کریں"],["issued","list_alt","جاری شدہ"]].map(([t,ic,l])=><button key={t} onClick={()=>setTab(t)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"8px 14px",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"0.65rem",fontWeight:tab===t?"700":"400",background:tab===t?"linear-gradient(135deg,#d4af37,#b8960a)":"transparent",color:tab===t?N:"rgba(255,255,255,0.5)",fontFamily:"inherit"}}><span className="material-symbols-rounded" style={{fontSize:"15px"}}>{ic}</span>{l}</button>)}</div>
    {tab==="books"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>کتاب</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>مصنف</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>زمرہ</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>کل</th><th style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>دستیاب</th></tr></thead>
      <tbody>{books.map((b,ri)=><tr key={b.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}><td style={{padding:"11px 14px",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"#f1f5f9",fontWeight:"700"}}>{b.title}</td><td style={{padding:"11px 14px",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.7)"}}>{b.author||"—"}</td><td style={{padding:"11px 14px",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.7)"}}>{b.category}</td><td style={{padding:"11px 14px",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.7)"}}>{b.totalCopies}</td><td style={{padding:"11px 14px",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)",fontWeight:"700",color:(b.available||0)>0?"#4ade80":"#f87171"}}>{b.available||0}</td></tr>)}
      {books.length===0&&<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}><span className="material-symbols-rounded" style={{fontSize:"36px",display:"block",marginBottom:"8px",color:"rgba(212,175,55,0.3)"}}>library_books</span>کوئی کتاب نہیں</td></tr>}</tbody>
    </table></div></div>}
    {tab==="issue"&&<div style={{...glass,padding:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
      <div style={{fontSize:"0.9rem",fontWeight:"700",color:G,marginBottom:"14px"}}>کتاب جاری کریں</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div><label style={lbl}>کتاب *</label><select style={inp} value={issueF.bookId} onChange={e=>setIssueF({...issueF,bookId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{books.filter(b=>(b.available||0)>0).map(b=><option key={b.id} value={b.id} style={{background:N2}}>{b.title} ({b.available})</option>)}</select></div>
        <div><label style={lbl}>طالب علم *</label><select style={inp} value={issueF.studentId} onChange={e=>setIssueF({...issueF,studentId:e.target.value})}><option value="" style={{background:N2}}>-- منتخب کریں --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>واپسی تاریخ</label><input style={{...inp,direction:"ltr",colorScheme:"dark"}} type="date" value={issueF.dueDate} onChange={e=>setIssueF({...issueF,dueDate:e.target.value})}/></div>
      </div>
      <button style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"12px",padding:"11px 26px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",fontWeight:"700"}} onClick={issueBook}>جاری کریں</button>
    </div>}
    {tab==="issued"&&<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["طالب علم","کتاب","جاری تاریخ","واپسی","حال","عمل"].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"right",fontSize:"0.65rem",color:"rgba(212,175,55,0.8)",fontWeight:"700"}}>{h}</th>)}</tr></thead>
      <tbody>{issues.map((i,ri)=>{ const st=students.find(s=>s.id===i.studentId); const bk=books.find(b=>b.id===i.bookId); const od=i.status==="issued"&&i.dueDate&&new Date(i.dueDate)<new Date(); return <tr key={i.id} style={{background:ri%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
        <td style={{padding:"11px 14px",fontSize:"0.75rem",color:"#f1f5f9",fontWeight:"700",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{st?.name||"—"}</td><td style={{padding:"11px 14px",fontSize:"0.75rem",color:"rgba(255,255,255,0.7)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{bk?.title||"—"}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{i.issuedDate}</td>
        <td style={{padding:"11px 14px",fontFamily:"monospace",direction:"ltr",fontSize:"0.6rem",color:od?"#f87171":"rgba(255,255,255,0.6)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{i.dueDate||"—"}</td>
        <td style={{padding:"11px 14px",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"700",background:i.status==="returned"?"rgba(74,222,128,0.15)":od?"rgba(248,113,113,0.15)":"rgba(251,146,60,0.15)",color:i.status==="returned"?"#4ade80":od?"#f87171":"#fb923c"}}>{i.status==="returned"?"واپس":od?"تاخیر":"جاری"}</span></td>
        <td style={{padding:"11px 14px",fontSize:"0.75rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{i.status==="issued"&&<button onClick={()=>returnBook(i)} style={{background:"linear-gradient(135deg,#d4af37,#b8960a)",color:N,border:"none",borderRadius:"8px",padding:"4px 10px",fontSize:"0.55rem",cursor:"pointer",fontWeight:"700"}}>واپس ✓</button>}</td>
      </tr>; })}{issues.length===0&&<tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>کوئی ریکارڈ نہیں</td></tr>}</tbody>
    </table></div></div>}
  </div>;
}

export default Library;
