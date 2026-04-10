/* eslint-disable */
import React, { useState, useEffect } from "react";
import { RATING, HOUSES, sLabel } from "../../constants";
import { getData } from "../../supabase";
import letterhead from "../../assets/letterhead.png";
import { usePagination, PaginationBar } from "../ui/usePagination";

// ── Quran Data ────────────────────────────────────────────────────────────────
const SURAHS=["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];

const SURAH_AYATS={"الفاتحة":7,"البقرة":286,"آل عمران":200,"النساء":176,"المائدة":120,"الأنعام":165,"الأعراف":206,"الأنفال":75,"التوبة":129,"يونس":109,"هود":123,"يوسف":111,"الرعد":43,"إبراهيم":52,"الحجر":99,"النحل":128,"الإسراء":111,"الكهف":110,"مريم":98,"طه":135,"الأنبياء":112,"الحج":78,"المؤمنون":118,"النور":64,"الفرقان":77,"الشعراء":227,"النمل":93,"القصص":88,"العنكبوت":69,"الروم":60,"لقمان":34,"السجدة":30,"الأحزاب":73,"سبأ":54,"فاطر":45,"يس":83,"الصافات":182,"ص":88,"الزمر":75,"غافر":85,"فصلت":54,"الشورى":53,"الزخرف":89,"الدخان":59,"الجاثية":37,"الأحقاف":35,"محمد":38,"الفتح":29,"الحجرات":18,"ق":45,"الذاريات":60,"الطور":49,"النجم":62,"القمر":55,"الرحمن":78,"الواقعة":96,"الحديد":29,"المجادلة":22,"الحشر":24,"الممتحنة":13,"الصف":14,"الجمعة":11,"المنافقون":11,"التغابن":18,"الطلاق":12,"التحريم":12,"الملك":30,"القلم":52,"الحاقة":52,"المعارج":44,"نوح":28,"الجن":28,"المزمل":20,"المدثر":56,"القيامة":40,"الإنسان":31,"المرسلات":50,"النبأ":40,"النازعات":46,"عبس":42,"التكوير":29,"الانفطار":19,"المطففين":36,"الانشقاق":25,"البروج":22,"الطارق":17,"الأعلى":19,"الغاشية":26,"الفجر":30,"البلد":20,"الشمس":15,"الليل":21,"الضحى":11,"الشرح":8,"التين":8,"العلق":19,"القدر":5,"البينة":8,"الزلزلة":8,"العاديات":11,"القارعة":11,"التكاثر":8,"العصر":3,"الهمزة":9,"الفيل":5,"قريش":4,"الماعون":7,"الكوثر":3,"الكافرون":6,"النصر":3,"المسد":5,"الإخلاص":4,"الفلق":5,"الناس":6};

const SURAH_JUZ={"الفاتحة":1,"البقرة":1,"آل عمران":3,"النساء":4,"المائدة":6,"الأنعام":7,"الأعراف":8,"الأنفال":9,"التوبة":10,"يونس":11,"هود":11,"يوسف":12,"الرعد":13,"إبراهيم":13,"الحجر":14,"النحل":14,"الإسراء":15,"الكهف":15,"مريم":16,"طه":16,"الأنبياء":17,"الحج":17,"المؤمنون":18,"النور":18,"الفرقان":18,"الشعراء":19,"النمل":19,"القصص":20,"العنكبوت":20,"الروم":21,"لقمان":21,"السجدة":21,"الأحزاب":21,"سبأ":22,"فاطر":22,"يس":22,"الصافات":23,"ص":23,"الزمر":23,"غافر":24,"فصلت":24,"الشورى":25,"الزخرف":25,"الدخان":25,"الجاثية":25,"الأحقاف":26,"محمد":26,"الفتح":26,"الحجرات":26,"ق":26,"الذاريات":26,"الطور":27,"النجم":27,"القمر":27,"الرحمن":27,"الواقعة":27,"الحديد":27,"المجادلة":28,"الحشر":28,"الممتحنة":28,"الصف":28,"الجمعة":28,"المنافقون":28,"التغابن":28,"الطلاق":28,"التحريم":28,"الملك":29,"القلم":29,"الحاقة":29,"المعارج":29,"نوح":29,"الجن":29,"المزمل":29,"المدثر":29,"القيامة":29,"الإنسان":29,"المرسلات":29,"النبأ":30,"النازعات":30,"عبس":30,"التكوير":30,"الانفطار":30,"المطففين":30,"الانشقاق":30,"البروج":30,"الطارق":30,"الأعلى":30,"الغاشية":30,"الفجر":30,"البلد":30,"الشمس":30,"الليل":30,"الضحى":30,"الشرح":30,"التين":30,"العلق":30,"القدر":30,"البينة":30,"الزلزلة":30,"العاديات":30,"القارعة":30,"التكاثر":30,"العصر":30,"الهمزة":30,"الفيل":30,"قريش":30,"الماعون":30,"الكوثر":30,"الكافرون":30,"النصر":30,"المسد":30,"الإخلاص":30,"الفلق":30,"الناس":30};

const TODAY=new Date().toISOString().split("T")[0];

function Hifz({students,addData,hifzLogs:logsProp=[]}){
  const G="#d4af37";const N="#0f172a";const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};

  const [logs,setLogs]=useState(logsProp);
  useEffect(()=>{ setLogs(logsProp); },[logsProp]);

  const refreshLogs=()=>getData("hifz_logs").then(data=>{if(data)setLogs(data);});

  const [show,setShow]=useState(false);
  const [q,setQ]=useState("");
  const [gradeFilter,setGradeFilter]=useState("all");
  const [viewMode,setViewMode]=useState("cards");
  const [detailStudent,setDetailStudent]=useState(null);
  const [ayahErr,setAyahErr]=useState("");
  const [pendingOpen,setPendingOpen]=useState(true);
  const [f,setF]=useState({studentId:"",surah:"",ayahs:"",rating:3,type:"sabaq",notes:"",date:TODAY,manzilPara:""});
  const [csvLoading,setCsvLoading]=useState(false);
  const [csvResult,setCsvResult]=useState(null);
  const [showCsvGuide,setShowCsvGuide]=useState(false);

  const handleHifzCSV=async(e)=>{
    const file=e.target.files[0]; if(!file)return;
    setCsvLoading(true); setCsvResult(null);
    const text=await file.text();
    const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
    const isHeader=lines[0]?.toLowerCase().includes("name")||lines[0]?.toLowerCase().includes("student")||lines[0]?.toLowerCase().includes("surah");
    const dataLines=isHeader?lines.slice(1):lines;
    let ok=0,skip=0,errs=[];
    for(const line of dataLines){
      const [nameOrCode,surah,ayahs,type,ratingStr,date]=line.split(",").map(s=>s?.trim());
      if(!nameOrCode||!surah){skip++;continue;}
      const st=students.find(s=>s.name?.toLowerCase().includes(nameOrCode.toLowerCase())||(s.studentCode||s.student_code)?.toLowerCase()===nameOrCode.toLowerCase());
      if(!st){errs.push(`نہیں ملا: ${nameOrCode}`);skip++;continue;}
      const validType=["sabaq","sabqi","manzil"].includes(type)?type:"sabaq";
      try{
        await addData("hifz_logs",{
          studentId:st.id, surah, ayahs:ayahs||"",
          type:validType, rating:parseInt(ratingStr)||3,
          date:date||TODAY, notes:"",
        });
        ok++;
      }catch(err){errs.push(`${st.name}: ${err.message}`);skip++;}
    }
    setCsvResult({ok,skip,errs});
    setCsvLoading(false); e.target.value="";
  };

  // ── Core Helpers ──────────────────────────────────────────────────────────
  const maxAyat=(s)=>SURAH_AYATS[s]||null;
  const checkAyahs=(ayahs,surah)=>{
    if(!ayahs||!surah)return "";
    const max=maxAyat(surah);if(!max)return "";
    const parts=ayahs.trim().split("-");
    const end=parseInt(parts[parts.length-1]);
    const start=parseInt(parts[0]);
    if(isNaN(end))return "";
    if(end>max)return `${surah} میں صرف ${max} آیات ہیں`;
    if(!isNaN(start)&&start<1)return "آیت 1 سے شروع ہو";
    if(!isNaN(start)&&start>end)return "شروع آخر سے زیادہ نہیں";
    return "";
  };
  const handleAyahChange=(v)=>{setF({...f,ayahs:v});setAyahErr(checkAyahs(v,f.surah));};
  const handleSurahChange=(v)=>{setF({...f,surah:v,ayahs:""});setAyahErr("");};

  const add=async()=>{
    if(!f.studentId)return;
    if(f.type==="manzil"){
      if(!f.manzilPara)return;
      await addData("hifz_logs",{...f,surah:`پارہ ${f.manzilPara}`,manzil:Number(f.manzilPara),ayahs:"(مکمل پارہ)",rating:Number(f.rating)});
      await refreshLogs();
      setShow(false);setAyahErr("");
      setF({studentId:"",surah:"",ayahs:"",rating:3,type:"sabaq",notes:"",date:TODAY,manzilPara:""});
    } else if(f.type==="sabqi"){
      if(!f.surah)return;
      const err=checkAyahs(f.ayahs,f.surah);
      if(err){setAyahErr(err);return;}
      await addData("hifz_logs",{...f,rating:Number(f.rating)});
      await refreshLogs();
      setAyahErr("");
      // Auto-advance to منزل for same student
      setF(prev=>({...prev,type:"manzil",surah:"",ayahs:"",notes:"",manzilPara:""}));
    } else {
      // sabaq — save then auto-advance to سبقی with same surah/ayahs
      if(!f.surah)return;
      const err=checkAyahs(f.ayahs,f.surah);
      if(err){setAyahErr(err);return;}
      const savedSurah=f.surah;const savedAyahs=f.ayahs;
      await addData("hifz_logs",{...f,rating:Number(f.rating)});
      await refreshLogs();
      setAyahErr("");
      // Auto-advance to سبقی with the just-saved surah/ayahs pre-filled
      setF(prev=>({...prev,type:"sabqi",surah:savedSurah,ayahs:savedAyahs,notes:""}));
    }
  };

  const studentLogs=(sid)=>logs.filter(l=>(l.studentId||l.student_id)===sid);
  const sortedLogs=(sid)=>[...studentLogs(sid)].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  const avgRating=(sid)=>{const sl=studentLogs(sid);if(!sl.length)return 0;return sl.reduce((s,l)=>s+(l.rating||0),0)/sl.length;};

  const ratingInfo=(avg)=>{
    if(avg===0)return{label:"—",color:"rgba(255,255,255,0.25)",bg:"rgba(255,255,255,0.05)"};
    if(avg>=3.5)return{label:"شاندار",color:"#4ade80",bg:"rgba(74,222,128,0.12)"};
    if(avg>=2.5)return{label:"اچھا",color:"#60a5fa",bg:"rgba(96,165,250,0.12)"};
    if(avg>=1.5)return{label:"مناسب",color:"#fbbf24",bg:"rgba(251,191,36,0.12)"};
    return{label:"کمزور",color:"#f87171",bg:"rgba(248,113,113,0.12)"};
  };

  const lastLog=(sid)=>sortedLogs(sid)[0]||null;
  const lastSurah=(sid)=>lastLog(sid)?.surah||null;
  const surahPct=(sid)=>{const s=lastSurah(sid);if(!s)return 0;const i=SURAHS.indexOf(s);return i<0?0:Math.round(((i+1)/SURAHS.length)*100);};
  const currentJuz=(sid)=>{const s=lastSurah(sid);return s?SURAH_JUZ[s]||"—":"—";};
  const juzPct=(sid)=>{const j=currentJuz(sid);return j==="—"?0:Math.round((j/30)*100);};
  const juzReached=(sid)=>{
    const sl=studentLogs(sid);
    const set=new Set(sl.map(l=>SURAH_JUZ[l.surah]).filter(Boolean));
    return set;
  };
  const doneToday=(sid)=>studentLogs(sid).some(l=>(l.date||"").startsWith(TODAY));
  const streak=(sid)=>{
    const days=[...new Set(studentLogs(sid).map(l=>(l.date||"").split("T")[0]).filter(Boolean))].sort().reverse();
    let count=0;let cur=new Date(TODAY);
    for(const d of days){const dd=new Date(d);const diff=Math.round((cur-dd)/(1000*60*60*24));if(diff===0||diff===1){count++;cur=dd;}else break;}
    return count;
  };
  const weeklyLogs=(sid)=>{
    const since=new Date();since.setDate(since.getDate()-6);
    return studentLogs(sid).filter(l=>new Date(l.date||0)>=since);
  };
  const rankScore=(sid)=>{
    const j=currentJuz(sid);
    const si=SURAHS.indexOf(lastSurah(sid)||"");
    return (j==="—"?0:j)*1000+(si<0?0:si);
  };

  // ── New Helpers ────────────────────────────────────────────────────────────

  // Days since last entry (999 = never)
  const daysSinceLast=(sid)=>{
    const sl=sortedLogs(sid);
    if(!sl.length)return 999;
    const lastDate=(sl[0].date||"").split("T")[0];
    if(!lastDate)return 999;
    return Math.round((new Date(TODAY)-new Date(lastDate))/864e5);
  };

  // Total ayahs memorized from sabaq entries
  const totalAyahs=(sid)=>{
    let n=0;
    studentLogs(sid).filter(l=>!l.type||l.type==="sabaq").forEach(l=>{
      const p=(l.ayahs||"").trim().split("-");
      const s=parseInt(p[0]),e=parseInt(p[p.length-1]);
      if(!isNaN(s)&&!isNaN(e)&&e>=s)n+=e-s+1;
      else if(!isNaN(s))n+=1;
    });
    return n;
  };

  // Surahs rated weak (≤2) at least twice
  const weakSurahs=(sid)=>{
    const counts={};
    studentLogs(sid).filter(l=>(!l.type||l.type==="sabaq")&&Number(l.rating)<=2).forEach(l=>{
      if(l.surah)counts[l.surah]=(counts[l.surah]||0)+1;
    });
    return Object.entries(counts).filter(([,n])=>n>=2).map(([s])=>s);
  };

  // Surahs not in dor for 7+ days (max 5 shown)
  const revisionDue=(sid)=>{
    const sl=studentLogs(sid);
    const sabaqS=[...new Set(sl.filter(l=>!l.type||l.type==="sabaq").map(l=>l.surah).filter(Boolean))];
    const ago7=new Date(TODAY);ago7.setDate(ago7.getDate()-7);
    return sabaqS.filter(sr=>{
      const lastDor=sl.filter(l=>l.surah===sr&&(l.type==="sabqi"||l.type==="dor")).map(l=>new Date(l.date||0)).sort((a,b)=>b-a)[0];
      return !lastDor||lastDor<ago7;
    }).slice(0,5);
  };

  // 30-day activity heatmap
  const heatmap30=(sid)=>Array.from({length:30},(_,i)=>{
    const d=new Date(TODAY);d.setDate(d.getDate()-(29-i));
    const ds=d.toISOString().split("T")[0];
    const dl=studentLogs(sid).filter(l=>(l.date||"").startsWith(ds));
    return{date:ds,sabaq:dl.some(l=>!l.type||l.type==="sabaq"),sabqi:dl.some(l=>l.type==="sabqi"||l.type==="dor"),manzil:dl.some(l=>l.type==="manzil"),count:dl.length};
  });

  // Last 6 months sabaq counts
  const monthlyStats=(sid)=>Array.from({length:6},(_,i)=>{
    const d=new Date();d.setMonth(d.getMonth()-(5-i));
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label=d.toLocaleDateString("en-PK",{month:"short"});
    return{key,label,count:studentLogs(sid).filter(l=>(l.date||"").startsWith(key)&&(!l.type||l.type==="sabaq")).length};
  });

  // Juz numbers already fully passed (juz < currentJuz)
  const completedJuz=(sid)=>{
    const curJ=currentJuz(sid);
    const jSet=juzReached(sid);
    if(typeof curJ!=="number")return[];
    return[...jSet].filter(j=>j<curJ).sort((a,b)=>a-b);
  };

  // Group logs by date → {sabaq:[], sabqi:[], manzil:[]}
  const groupedByDate=(sid)=>{
    const groups={};
    sortedLogs(sid).forEach(l=>{
      const d=(l.date||"").split("T")[0]||"unknown";
      if(!groups[d])groups[d]={sabaq:[],sabqi:[],manzil:[]};
      const t=l.type==="manzil"?"manzil":(l.type==="sabqi"||l.type==="dor")?"sabqi":(!l.type||l.type==="sabaq")?"sabaq":"sabaq";
      groups[d][t].push(l);
    });
    return Object.entries(groups).sort((a,b)=>new Date(b[0])-new Date(a[0]));
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalToday=students.filter(s=>doneToday(s.id)).length;
  const grades=["all",...[...new Set(students.map(s=>s.grade).filter(Boolean))].sort()];
  const filteredStudents=students.filter(s=>(!q||s.name?.toLowerCase().includes(q.toLowerCase()))&&(gradeFilter==="all"||s.grade===gradeFilter));
  const pendingStudents=filteredStudents.filter(s=>!doneToday(s.id));
  const { paged: pagedStudents, page: hifzPage, totalPages: hifzTotalPages, setPage: setHifzPage } = usePagination(filteredStudents, 24);

  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};

  // ── Quick Entry ───────────────────────────────────────────────────────────
  const openQuickEntry=(s,e)=>{
    e.stopPropagation();
    const sl=sortedLogs(s.id);
    const last=sl[0];
    let autoSurah="",autoAyahs="",autoRating=3,autoType="sabaq";
    if(last){
      autoRating=last.rating||3;
      autoType=last.type||"sabaq";
      const lastSr=last.surah||"";
      const maxA=maxAyat(lastSr)||999;
      const parts=(last.ayahs||"").trim().split("-");
      const endNum=parseInt(parts[parts.length-1]);
      if(lastSr&&!isNaN(endNum)&&endNum>=maxA){
        const idx=SURAHS.indexOf(lastSr);
        autoSurah=idx>=0&&idx<SURAHS.length-1?SURAHS[idx+1]:lastSr;
        autoAyahs="1";
      }else if(lastSr&&!isNaN(endNum)){
        autoSurah=lastSr;autoAyahs=String(endNum+1);
      }else{autoSurah=lastSr;autoAyahs="";}
    }
    setAyahErr("");
    setF({studentId:s.id,surah:autoSurah,ayahs:autoAyahs,rating:autoRating,type:autoType,notes:"",date:TODAY});
    setShow(true);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  // ── Print: Individual Report ──────────────────────────────────────────────
  const printReport=(s)=>{
    const sl=sortedLogs(s.id);
    const avg=avgRating(s.id);
    const ri=ratingInfo(avg);
    const juz=currentJuz(s.id);
    const str=streak(s.id);
    const wl=weeklyLogs(s.id);
    const sabaqCount=sl.filter(l=>!l.type||l.type==="sabaq").length;
    const sabqiCount=sl.filter(l=>l.type==="sabqi"||l.type==="dor").length;
    const manzilCount=sl.filter(l=>l.type==="manzil").length;
    const ta=totalAyahs(s.id);
    const lhUrl=`${window.location.origin}${letterhead}`;
    const rows=sl.slice(0,40).map((l,i)=>{
      const r=RATING.find(x=>x.val===Number(l.rating))||RATING[1];
      return `<tr style="background:${i%2===0?"#f9f9f9":"#fff"};border-bottom:1px solid #eee">
        <td style="padding:7px 10px;font-family:monospace;font-size:12px;color:#555">${l.date||"—"}</td>
        <td style="padding:7px 10px;font-size:13px;direction:rtl">${l.surah||"—"}</td>
        <td style="padding:7px 10px;font-family:monospace;font-size:12px">${l.ayahs||"—"}</td>
        <td style="padding:7px 10px;font-size:11px;text-align:center"><span style="background:${r.bg};color:${r.color};padding:2px 8px;border-radius:10px;font-weight:700">${r.label}</span></td>
        <td style="padding:7px 10px;font-size:11px;color:#888;text-align:center">${l.type==="manzil"?"منزل":(l.type==="sabqi"||l.type==="dor")?"سبقی":"نیا سبق"}</td>
        <td style="padding:7px 10px;font-size:11px;color:#666">${l.notes||""}</td>
      </tr>`;
    }).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:'Segoe UI',sans-serif;margin:0;background-image:url('${lhUrl}');background-size:100% 100%;background-repeat:no-repeat}
      .content{padding:110px 32px 32px}
      h2{margin:0 0 4px;font-size:20px;color:#0f172a}
      .sub{color:#888;font-size:12px;margin-bottom:16px}
      .stats{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
      .stat{background:#f8f8f8;border:1px solid #e5e5e5;border-radius:10px;padding:10px 16px;text-align:center}
      .stat .v{font-size:18px;font-weight:900;color:#0f172a}
      .stat .l{font-size:10px;color:#888;margin-top:2px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#0f172a;color:#d4af37;padding:9px 10px;text-align:left;font-size:11px}
      @page{margin:0;size:A4} @media print{body{margin:0}}
    </style></head><body><div class="content">
      <h2>${s.name}</h2>
      <div class="sub">${s.grade||""}${s.section?" • "+s.section:""} &nbsp;|&nbsp; ${new Date().toLocaleDateString("en-PK")}</div>
      <div class="stats">
        <div class="stat"><div class="v">${sl.length}</div><div class="l">کل اندراج</div></div>
        <div class="stat"><div class="v">${sabaqCount}</div><div class="l">نیا سبق</div></div>
        <div class="stat"><div class="v">${sabqiCount}</div><div class="l">سبقی</div></div>
        <div class="stat"><div class="v">${manzilCount}</div><div class="l">منزل</div></div>
        <div class="stat"><div class="v">${ta}</div><div class="l">کل آیات</div></div>
        <div class="stat"><div class="v">پارہ ${juz}</div><div class="l">موجودہ مقام</div></div>
        <div class="stat"><div class="v">${str}🔥</div><div class="l">Streak</div></div>
        <div class="stat"><div class="v" style="color:${ri.color}">${ri.label}</div><div class="l">اوسط معیار</div></div>
        <div class="stat"><div class="v">${wl.length}</div><div class="l">اس ہفتے</div></div>
      </div>
      <table><thead><tr><th>تاریخ</th><th>سورت</th><th>آیات</th><th style="text-align:center">معیار</th><th style="text-align:center">نوع</th><th>نوٹس</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div><script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script></body></html>`;
    const w=window.open("","_blank","width=850,height=700");
    if(w){w.document.write(html);w.document.close();}
  };

  // ── Print: Full Class Report ──────────────────────────────────────────────
  const printClassReport=()=>{
    const lhUrl=`${window.location.origin}${letterhead}`;
    const sorted=[...students].sort((a,b)=>rankScore(b.id)-rankScore(a.id));
    const rows=sorted.map((s,i)=>{
      const juz=currentJuz(s.id);
      const sl=studentLogs(s.id);
      const sabaqCnt=sl.filter(l=>!l.type||l.type==="sabaq").length;
      const str=streak(s.id);
      const ta=totalAyahs(s.id);
      const done=doneToday(s.id);
      const dsLast=daysSinceLast(s.id);
      const ri=ratingInfo(avgRating(s.id));
      const wk=weeklyLogs(s.id).length;
      return `<tr>
        <td style="color:#aaa;font-size:9px;text-align:center">${i+1}</td>
        <td style="font-weight:700;font-size:11px;text-align:right;direction:rtl">${s.name}</td>
        <td style="font-size:9.5px;color:#555;text-align:right;direction:rtl">${s.grade||""}${s.section?" • "+s.section:""}</td>
        <td style="text-align:center;font-weight:900;font-size:13px;color:#c8960a">${juz}</td>
        <td style="text-align:center;font-weight:700;font-size:11px">${sabaqCnt}</td>
        <td style="text-align:center;font-size:11px">${ta}</td>
        <td style="text-align:center;font-size:11px">${wk}</td>
        <td style="text-align:center;font-size:11px">${str>0?str+"🔥":"—"}</td>
        <td style="text-align:center"><span style="background:${ri.bg};color:${ri.color};padding:1px 6px;border-radius:8px;font-size:9.5px;font-weight:700;direction:rtl">${ri.label}</span></td>
        <td style="text-align:center"><span style="background:${done?"#dcfce7":"#fee2e2"};color:${done?"#16a34a":"#dc2626"};padding:1px 6px;border-radius:8px;font-size:9.5px;font-weight:700;direction:rtl">${done?"✓ آج":"باقی"}</span></td>
        <td style="text-align:center;font-size:9.5px;color:${dsLast>=3?"#dc2626":dsLast===999?"#bbb":"#555"};font-weight:${dsLast>=3?"700":"400"};direction:rtl">${dsLast===999?"—":dsLast===0?"آج":dsLast+" دن"}</td>
      </tr>`;
    }).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}
      body{font-family:'Segoe UI',sans-serif;margin:0;padding:0;
        background-image:url('${lhUrl}');
        background-size:100% 100%;
        background-repeat:no-repeat;
        background-attachment:fixed}
      .content{padding:108px 30px 40px 30px}
      .report-title{font-size:15px;font-weight:800;color:#0f172a;margin:0 0 2px;direction:rtl}
      .sub{color:#777;font-size:10.5px;margin-bottom:12px;direction:rtl}
      table{width:100%;border-collapse:collapse;font-size:10.5px;table-layout:fixed}
      col.c-num  {width:3%}
      col.c-name {width:14%}
      col.c-grade{width:14%}
      col.c-juz  {width:6%}
      col.c-sabaq{width:6%}
      col.c-ayat {width:6%}
      col.c-week {width:6%}
      col.c-str  {width:7%}
      col.c-std  {width:9%}
      col.c-today{width:8%}
      col.c-last {width:8%}
      th{background:#0f172a;color:#d4af37;padding:7px 6px;font-size:9.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      td{padding:5px 6px;vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      tr:nth-child(even){background:#f7f7f7}
      tr:nth-child(odd){background:#fff}
      tr{border-bottom:1px solid #ececec}
      .footer{margin-top:18px;display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid #ddd}
      .sig-box{text-align:center;width:150px}
      .sig-line{border-top:1px solid #bbb;padding-top:6px;font-size:9px;color:#999}
      @page{margin:0;size:A4 landscape}
      @media print{body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><div class="content">
      <div class="report-title">Hifz Class Report — تمام طلباء کی حفظ پیش رفت</div>
      <div class="sub">${new Date().toLocaleDateString("en-PK",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} &nbsp;|&nbsp; کل طلباء: ${students.length} &nbsp;|&nbsp; آج حاضر: ${totalToday}</div>
      <table>
        <colgroup>
          <col class="c-num"><col class="c-name"><col class="c-grade"><col class="c-juz">
          <col class="c-sabaq"><col class="c-ayat"><col class="c-week"><col class="c-str">
          <col class="c-std"><col class="c-today"><col class="c-last">
        </colgroup>
        <thead><tr>
          <th>#</th>
          <th style="text-align:right">نام</th>
          <th style="text-align:right">جماعت</th>
          <th style="text-align:center">پارہ</th>
          <th style="text-align:center">سبق</th>
          <th style="text-align:center">آیات</th>
          <th style="text-align:center">ہفتہ</th>
          <th style="text-align:center">Streak</th>
          <th style="text-align:center">معیار</th>
          <th style="text-align:center">آج</th>
          <th style="text-align:center">آخری</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">
        <div class="sig-box"><div class="sig-line">استاذ الحفظ</div></div>
        <div class="sig-box"><div class="sig-line">ناظم تعلیم</div></div>
        <div class="sig-box"><div class="sig-line">مہر ادارہ</div></div>
      </div>
    </div><script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script></body></html>`;
    const w=window.open("","_blank","width=1200,height=850");
    if(w){w.document.write(html);w.document.close();}
  };

  // ── Print: Juz Certificate ────────────────────────────────────────────────
  const printCertificate=(s,juzNum)=>{
    const lhUrl=`${window.location.origin}${letterhead}`;
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{margin:0;font-family:'Segoe UI',sans-serif;background-image:url('${lhUrl}');background-size:100% 100%;background-repeat:no-repeat}
      .content{padding:120px 70px 50px;text-align:center;direction:rtl}
      .inst{font-size:22px;font-weight:900;color:#d4af37;letter-spacing:1px;direction:ltr;margin-bottom:4px}
      .sub-inst{font-size:13px;color:#666;margin-bottom:30px;direction:ltr}
      .divider{width:80px;height:3px;background:linear-gradient(90deg,#d4af37,#b8960a);margin:0 auto 30px;border-radius:2px}
      .cert-title{font-size:26px;font-weight:700;color:#0f172a;margin-bottom:24px}
      .presented{font-size:14px;color:#888;margin-bottom:12px}
      .student-name{font-size:36px;font-weight:900;color:#0f172a;margin:0 0 24px;border-bottom:2px solid #d4af7340;padding-bottom:16px}
      .body-text{font-size:15px;color:#444;line-height:2.2;margin-bottom:16px}
      .juz-display{font-size:64px;font-weight:900;color:#d4af37;line-height:1;margin:16px 0;text-shadow:0 2px 12px rgba(212,175,55,0.3)}
      .juz-label{font-size:18px;color:#555;margin-bottom:30px}
      .date{font-size:12px;color:#aaa;margin-bottom:50px}
      .sig{display:flex;justify-content:space-around;margin-top:20px}
      .sig-item{text-align:center}
      .sig-line{width:140px;border-top:1px solid #ccc;margin:0 auto;padding-top:8px;font-size:11px;color:#999}
      @page{margin:0;size:A4 landscape} @media print{body{margin:0}}
    </style></head><body><div class="content">
      <div class="inst">AMEEN ISLAMIC INSTITUTE</div>
      <div class="sub-inst">Hifz ul Quran Department</div>
      <div class="divider"></div>
      <div class="cert-title">سند حفظ — Hifz Achievement Certificate</div>
      <div class="presented">یہ سند عطا کی جاتی ہے</div>
      <div class="student-name">${s.name}</div>
      <div class="body-text">جنہوں نے قرآن مجید کا</div>
      <div class="juz-display">${juzNum}</div>
      <div class="juz-label">واں پارہ کامیابی اور خوش اسلوبی سے حفظ مکمل کیا</div>
      <div class="date">${new Date().toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"})}</div>
      <div class="sig">
        <div class="sig-item"><div class="sig-line">استاذ الحفظ</div></div>
        <div class="sig-item"><div class="sig-line">ناظم تعلیم</div></div>
        <div class="sig-item"><div class="sig-line">مہر ادارہ</div></div>
      </div>
    </div><script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script></body></html>`;
    const w=window.open("","_blank","width=1100,height=800");
    if(w){w.document.write(html);w.document.close();}
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"44px",height:"44px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px rgba(212,175,55,0.4)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"24px",color:N}}>menu_book</span>
          </div>
          <div>
            <h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>Hifz Tracker</h1>
            <p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)",fontWeight:"500"}}>{logs.length} entries • {students.length} students</p>
          </div>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <button onClick={printClassReport} style={{display:"flex",alignItems:"center",gap:"7px",padding:"10px 18px",borderRadius:"12px",border:"1px solid rgba(212,175,55,0.3)",background:"rgba(212,175,55,0.08)",color:G,fontWeight:"700",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
            <span className="material-symbols-rounded" style={{fontSize:"18px"}}>print</span>Class Report
          </button>
          <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"11px 22px",borderRadius:"12px",border:`1px solid ${G}`,background:show?"rgba(212,175,55,0.15)":"transparent",color:G,fontWeight:"700",fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
            <span className="material-symbols-rounded" style={{fontSize:"20px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"New Entry"}
          </button>
          <button onClick={()=>setShowCsvGuide(!showCsvGuide)} style={{background:"rgba(99,202,183,0.1)",color:"#63cab7",border:"1px solid rgba(99,202,183,0.3)",borderRadius:"10px",padding:"9px 14px",fontSize:"0.75rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>📋 CSV</button>
          <label style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(99,202,183,0.12)",color:"#63cab7",border:"1px solid rgba(99,202,183,0.4)",borderRadius:"10px",padding:"9px 16px",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            {csvLoading?"⏳":"📂"} CSV Upload
            <input type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleHifzCSV} disabled={csvLoading}/>
          </label>
        </div>
      </div>

      {showCsvGuide&&<div style={{background:"rgba(99,202,183,0.06)",border:"1px solid rgba(99,202,183,0.25)",borderRadius:"12px",padding:"14px 18px",marginBottom:"16px",direction:"ltr"}}>
        <div style={{color:"#63cab7",fontWeight:700,fontSize:"13px",marginBottom:"8px"}}>📄 Hifz Logs CSV Format:</div>
        <code style={{display:"block",background:"rgba(0,0,0,0.4)",padding:"10px",borderRadius:"8px",color:"#a3e6dc",fontFamily:"monospace",fontSize:"12px",lineHeight:"2",overflowX:"auto"}}>
          studentName,surah,ayahs,type,rating,date<br/>
          Ahmad Ali,سورة البقرة,1-10,sabaq,4,2024-04-01<br/>
          Bilal Khan,سورة البقرة,1-10,sabqi,3,2024-04-01<br/>
          Sara Noor,سورة آل عمران,50-60,manzil,5,2024-04-01
        </code>
        <div style={{color:"#64748b",fontSize:"11px",marginTop:"8px"}}>• type: sabaq / sabqi / manzil &nbsp;•&nbsp; rating: 1-5 &nbsp;•&nbsp; date optional &nbsp;•&nbsp; header row optional</div>
      </div>}
      {csvResult&&<div style={{background:csvResult.skip===0?"rgba(74,222,128,0.08)":"rgba(251,146,60,0.08)",border:`1px solid ${csvResult.skip===0?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,borderRadius:"10px",padding:"12px 16px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        <span style={{color:"#4ade80",fontWeight:700}}>✅ {csvResult.ok} حفظ records شامل ہوگئے</span>
        {csvResult.skip>0&&<span style={{color:"#fb923c",fontWeight:700}}>⚠️ {csvResult.skip} ناکام</span>}
        {csvResult.errs.length>0&&<span style={{color:"#fca5a5",fontSize:"12px"}}>{csvResult.errs.slice(0,3).join(" • ")}</span>}
        <button onClick={()=>setCsvResult(null)} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",marginLeft:"auto"}}>✕</button>
      </div>}

      {/* Today's summary bar */}
      <div style={{...glass,padding:"12px 20px",marginBottom:"16px",display:"flex",gap:"20px",flexWrap:"wrap",alignItems:"center",borderColor:"rgba(212,175,55,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:"1.1rem"}}>📅</span>
          <span style={{color:G,fontWeight:"800",fontSize:"0.9rem"}}>{new Date().toLocaleDateString("en-PK",{weekday:"short",day:"numeric",month:"short"})}</span>
        </div>
        <div style={{width:"1px",height:"24px",background:"rgba(255,255,255,0.1)"}}/>
        <div style={{display:"flex",gap:"16px"}}>
          <span style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.5)"}}>سبق مکمل: <span style={{color:"#4ade80",fontWeight:"800"}}>{totalToday}</span></span>
          <span style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.5)"}}>باقی: <span style={{color:"#f87171",fontWeight:"800"}}>{students.length-totalToday}</span></span>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{height:"6px",width:"120px",background:"rgba(255,255,255,0.1)",borderRadius:"3px",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${students.length?Math.round((totalToday/students.length)*100):0}%`,background:"linear-gradient(90deg,#4ade80,#22c55e)",borderRadius:"3px"}}/>
          </div>
          <span style={{color:"rgba(255,255,255,0.4)",fontSize:"0.65rem"}}>{students.length?Math.round((totalToday/students.length)*100):0}%</span>
        </div>
      </div>

      {/* آج باقی ہیں — Pending Today Panel */}
      {pendingStudents.length>0&&(
        <div style={{...glass,marginBottom:"16px",borderColor:"rgba(248,113,113,0.25)",overflow:"hidden"}}>
          <button onClick={()=>setPendingOpen(!pendingOpen)} style={{width:"100%",padding:"12px 20px",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px",fontFamily:"'Public Sans',sans-serif"}}>
            <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#f87171",boxShadow:"0 0 8px #f87171",flexShrink:0}}/>
            <span style={{color:"#f87171",fontWeight:"800",fontSize:"0.82rem"}}>آج باقی ہیں — {pendingStudents.length} طلباء</span>
            <span style={{color:"rgba(255,255,255,0.3)",fontSize:"0.65rem",marginLeft:"6px"}}>جن کا سبق ابھی نہیں ہوا</span>
            <span className="material-symbols-rounded" style={{fontSize:"18px",color:"rgba(255,255,255,0.3)",marginLeft:"auto"}}>{pendingOpen?"expand_less":"expand_more"}</span>
          </button>
          {pendingOpen&&(
            <div style={{padding:"0 16px 14px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {pendingStudents.map(s=>{
                const dsl=daysSinceLast(s.id);
                const urgent=dsl>=3;
                return(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 10px",borderRadius:"8px",background:urgent?"rgba(248,113,113,0.12)":"rgba(255,255,255,0.05)",border:`1px solid ${urgent?"rgba(248,113,113,0.3)":"rgba(255,255,255,0.1)"}`,cursor:"pointer"}} onClick={e=>openQuickEntry(s,e)}>
                    <span style={{fontSize:"0.72rem",fontWeight:"700",color:urgent?"#f87171":"rgba(241,245,249,0.7)"}}>{s.name}</span>
                    {urgent&&<span style={{fontSize:"0.55rem",color:"#f87171",fontWeight:"800"}}>{dsl}d ⚠</span>}
                    <span className="material-symbols-rounded" style={{fontSize:"14px",color:urgent?"#f87171":"rgba(212,175,55,0.5)"}}>add_circle</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Form */}
      {show&&(
        <div style={{...glass,padding:"24px",marginBottom:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"18px",flexWrap:"wrap"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"22px"}}>add_circle</span>
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>سبق اندراج</span>
            {/* Step indicator */}
            <div style={{display:"flex",alignItems:"center",gap:"4px",marginLeft:"auto"}}>
              {[{t:"sabaq",l:"نیا سبق",c:"#60a5fa"},{t:"sabqi",l:"سبقی",c:"#4ade80"},{t:"manzil",l:"منزل",c:"#f59e0b"}].map(({t,l,c},i)=>{
                const active=f.type===t;
                const done=(f.type==="sabqi"&&t==="sabaq")||(f.type==="manzil"&&(t==="sabaq"||t==="sabqi"));
                return(
                  <React.Fragment key={t}>
                    {i>0&&<div style={{width:"18px",height:"1px",background:done?"rgba(74,222,128,0.4)":"rgba(255,255,255,0.1)"}}/>}
                    <div style={{padding:"3px 8px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",
                      background:active?`${c}20`:done?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.04)",
                      color:active?c:done?"#4ade80":"rgba(255,255,255,0.25)",
                      border:`1px solid ${active?c:done?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)"}`}}>
                      {done?"✓ ":""}{l}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ── 3 Type Cards ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"18px"}}>
            {[
              {val:"sabaq", label:"نیا سبق",    sub:"آج پہلی بار نئی آیات یاد کیں",             color:"#60a5fa", icon:"auto_stories",  hint:"سورت اور آیات کا range لکھیں جو آج یاد ہوئیں"},
              {val:"sabqi", label:"سبقی",        sub:"گزشتہ 7 دنوں کا سبق دہرانا",              color:"#4ade80", icon:"history_edu",   hint:"نیچے سے پچھلے سبق منتخب کریں یا خود لکھیں"},
              {val:"manzil",label:"منزل",        sub:"پرانا حفظ — آج کا پارہ سنانا",            color:"#f59e0b", icon:"layers",        hint:"پارہ نمبر منتخب کریں جو آج مکمل سنایا"},
            ].map(({val,label,sub,color,icon,hint})=>{
              const sel=f.type===val;
              return(
                <button key={val} onClick={()=>setF({...f,type:val,surah:"",ayahs:"",manzilPara:""})}
                  style={{padding:"12px",borderRadius:"12px",
                    border:`2px solid ${sel?color:"rgba(255,255,255,0.08)"}`,
                    background:sel?`${color}15`:"rgba(255,255,255,0.02)",
                    cursor:"pointer",fontFamily:"'Public Sans',sans-serif",
                    textAlign:"right",direction:"rtl",transition:"all 0.15s",
                    boxShadow:sel?`0 0 16px ${color}25`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"5px"}}>
                    <span className="material-symbols-rounded" style={{fontSize:"20px",color:sel?color:"rgba(255,255,255,0.2)"}}>{icon}</span>
                    <span style={{fontWeight:"800",fontSize:"0.9rem",color:sel?color:"rgba(241,245,249,0.4)"}}>{label}</span>
                  </div>
                  <div style={{fontSize:"0.6rem",color:sel?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.2)",lineHeight:"1.5"}}>{sub}</div>
                  {sel&&<div style={{marginTop:"6px",fontSize:"0.55rem",color:color,background:`${color}18`,padding:"3px 7px",borderRadius:"6px",lineHeight:"1.4"}}>💡 {hint}</div>}
                </button>
              );
            })}
          </div>

          {/* ── Student selector (always shown) ── */}
          <div style={{marginBottom:"14px"}}>
            <label style={lbl}>طالب علم *</label>
            <select style={inp} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value,surah:"",ayahs:"",manzilPara:""})}>
              <option value="" style={{background:N2}}>-- منتخب کریں --</option>
              {students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{sLabel(s)}</option>)}
            </select>
          </div>

          {/* ── نیا سبق fields ── */}
          {f.type==="sabaq"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
              <div>
                <label style={lbl}>سورت * {f.surah&&maxAyat(f.surah)&&<span style={{color:"rgba(212,175,55,0.5)",fontWeight:400}}>— کل آیات: {maxAyat(f.surah)}</span>}</label>
                <select style={inp} value={f.surah} onChange={e=>handleSurahChange(e.target.value)}>
                  <option value="" style={{background:N2}}>-- سورت منتخب کریں --</option>
                  {SURAHS.map(s=><option key={s} value={s} style={{background:N2}}>{s} ({SURAH_AYATS[s]})</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>آیات * {f.surah&&maxAyat(f.surah)&&<span style={{color:"rgba(255,255,255,0.3)",fontWeight:400}}>(زیادہ سے زیادہ: {maxAyat(f.surah)})</span>}</label>
                <input style={{...inp,borderColor:ayahErr?"rgba(248,113,113,0.6)":"rgba(212,175,55,0.25)"}} value={f.ayahs} onChange={e=>handleAyahChange(e.target.value)} placeholder={f.surah?`مثلاً 1-10`:"پہلے سورت منتخب کریں"}/>
                {ayahErr&&<div style={{color:"#f87171",fontSize:"0.65rem",marginTop:"5px"}}>{ayahErr}</div>}
              </div>
              <div><label style={lbl}>معیار</label>
                <select style={inp} value={f.rating} onChange={e=>setF({...f,rating:e.target.value})}>
                  {RATING.map(r=><option key={r.val} value={r.val} style={{background:N2}}>{r.label} ({r.labelEn})</option>)}
                </select>
              </div>
              <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
              <div style={{gridColumn:"1/-1"}}><label style={lbl}>نوٹس</label><input style={inp} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="کوئی نوٹ..."/></div>
            </div>
          )}

          {/* ── سبقی fields ── */}
          {f.type==="sabqi"&&(
            <div style={{marginBottom:"16px"}}>
              {/* Recent sabaq chips */}
              {f.studentId&&(()=>{
                const since7=new Date(TODAY);since7.setDate(since7.getDate()-7);
                const recent=sortedLogs(f.studentId).filter(l=>(!l.type||l.type==="sabaq")&&new Date(l.date||0)>=since7).slice(0,10);
                const todayEntries=recent.filter(l=>(l.date||"").startsWith(TODAY));
                const olderEntries=recent.filter(l=>!(l.date||"").startsWith(TODAY));
                if(!recent.length)return null;
                return(
                  <div style={{marginBottom:"14px"}}>
                    {todayEntries.length>0&&(
                      <div style={{padding:"8px 12px",borderRadius:"8px",background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.2)",marginBottom:"10px",display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                        <span style={{fontSize:"0.6rem",color:"#4ade80",fontWeight:"800",flexShrink:0}}>📖 آج کا سبق</span>
                        {todayEntries.map((l,i)=>{
                          const sel=f.surah===l.surah&&f.ayahs===(l.ayahs||"");
                          return(
                            <button key={i} onClick={()=>setF({...f,surah:l.surah||"",ayahs:l.ayahs||""})}
                              style={{padding:"5px 10px",borderRadius:"7px",
                                border:`1px solid ${sel?"#4ade80":"rgba(74,222,128,0.35)"}`,
                                background:sel?"rgba(74,222,128,0.2)":"rgba(74,222,128,0.06)",
                                color:sel?"#4ade80":"rgba(241,245,249,0.7)",
                                fontSize:"0.7rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",direction:"rtl",textAlign:"right"}}>
                              <span style={{fontWeight:"700"}}>{l.surah}</span>
                              <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.4)",marginRight:"5px"}}> {l.ayahs||""}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {olderEntries.length>0&&(
                      <div>
                        <label style={{...lbl,marginBottom:"6px"}}>گزشتہ 7 دن کے سبق</label>
                        <div style={{display:"flex",gap:"7px",flexWrap:"wrap"}}>
                          {olderEntries.map((l,i)=>{
                            const sel=f.surah===l.surah&&f.ayahs===(l.ayahs||"");
                            return(
                              <button key={i} onClick={()=>setF({...f,surah:l.surah||"",ayahs:l.ayahs||""})}
                                style={{padding:"6px 12px",borderRadius:"8px",
                                  border:`1px solid ${sel?"rgba(74,222,128,0.6)":"rgba(255,255,255,0.1)"}`,
                                  background:sel?"rgba(74,222,128,0.12)":"rgba(255,255,255,0.04)",
                                  color:sel?"#4ade80":"rgba(241,245,249,0.6)",
                                  fontSize:"0.7rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",direction:"rtl",textAlign:"right"}}>
                                <div style={{fontWeight:"700"}}>{l.surah}</div>
                                <div style={{fontSize:"0.55rem",color:sel?"rgba(74,222,128,0.7)":"rgba(255,255,255,0.3)"}}>{l.ayahs||"—"} &nbsp;•&nbsp; {l.date}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                <div>
                  <label style={lbl}>سورت * {f.surah&&maxAyat(f.surah)&&<span style={{color:"rgba(212,175,55,0.5)",fontWeight:400}}>— کل آیات: {maxAyat(f.surah)}</span>}</label>
                  <select style={inp} value={f.surah} onChange={e=>handleSurahChange(e.target.value)}>
                    <option value="" style={{background:N2}}>-- سورت منتخب کریں --</option>
                    {SURAHS.map(s=><option key={s} value={s} style={{background:N2}}>{s} ({SURAH_AYATS[s]})</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>آیات</label>
                  <input style={{...inp,borderColor:ayahErr?"rgba(248,113,113,0.6)":"rgba(212,175,55,0.25)"}} value={f.ayahs} onChange={e=>handleAyahChange(e.target.value)} placeholder="مثلاً 1-20"/>
                  {ayahErr&&<div style={{color:"#f87171",fontSize:"0.65rem",marginTop:"5px"}}>{ayahErr}</div>}
                </div>
                <div><label style={lbl}>معیار</label>
                  <select style={inp} value={f.rating} onChange={e=>setF({...f,rating:e.target.value})}>
                    {RATING.map(r=><option key={r.val} value={r.val} style={{background:N2}}>{r.label} ({r.labelEn})</option>)}
                  </select>
                </div>
                <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
                <div style={{gridColumn:"1/-1"}}><label style={lbl}>نوٹس</label><input style={inp} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="کوئی نوٹ..."/></div>
              </div>
            </div>
          )}

          {/* ── منزل fields ── */}
          {f.type==="manzil"&&(
            <div style={{marginBottom:"16px"}}>
              {/* Next para suggestion */}
              {f.studentId&&(()=>{
                const lastM=sortedLogs(f.studentId).find(l=>l.type==="manzil");
                const lastPara=lastM?Number(lastM.manzil||0):0;
                const nextPara=lastPara>0?(lastPara%30)+1:1;
                return(
                  <div style={{padding:"12px 16px",borderRadius:"10px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",marginBottom:"14px",display:"flex",alignItems:"center",gap:"14px",flexWrap:"wrap"}}>
                    <div>
                      <div style={{fontSize:"0.62rem",color:"rgba(245,158,11,0.7)",marginBottom:"2px"}}>آج کی باری (rotation کے مطابق)</div>
                      <div style={{fontSize:"1.2rem",fontWeight:"900",color:"#f59e0b"}}>پارہ {nextPara}</div>
                    </div>
                    {lastPara>0&&<div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>گزشتہ: پارہ {lastPara} ({lastM?.date||""})</div>}
                    <button onClick={()=>setF({...f,manzilPara:String(nextPara)})}
                      style={{marginRight:"auto",padding:"6px 14px",borderRadius:"8px",border:"1px solid rgba(245,158,11,0.4)",background:"rgba(245,158,11,0.15)",color:"#f59e0b",fontSize:"0.72rem",fontWeight:"700",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
                      ✓ قبول کریں
                    </button>
                  </div>
                );
              })()}
              {/* 1-30 Para grid */}
              <label style={lbl}>پارہ نمبر منتخب کریں *</label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:"5px",marginBottom:"14px"}}>
                {Array.from({length:30},(_,i)=>i+1).map(n=>{
                  const sel=f.manzilPara===String(n);
                  return(
                    <button key={n} onClick={()=>setF({...f,manzilPara:String(n)})}
                      style={{padding:"8px 4px",borderRadius:"7px",
                        border:`1px solid ${sel?"#f59e0b":"rgba(255,255,255,0.1)"}`,
                        background:sel?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.03)",
                        color:sel?"#f59e0b":"rgba(255,255,255,0.35)",
                        fontSize:"0.75rem",fontWeight:sel?"900":"500",cursor:"pointer",
                        fontFamily:"'Public Sans',sans-serif",
                        boxShadow:sel?"0 0 8px rgba(245,158,11,0.3)":"none"}}>
                      {n}
                    </button>
                  );
                })}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                <div><label style={lbl}>معیار</label>
                  <select style={inp} value={f.rating} onChange={e=>setF({...f,rating:e.target.value})}>
                    {RATING.map(r=><option key={r.val} value={r.val} style={{background:N2}}>{r.label} ({r.labelEn})</option>)}
                  </select>
                </div>
                <div><label style={lbl}>تاریخ</label><input style={{...inp,direction:"ltr"}} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
                <div style={{gridColumn:"1/-1"}}><label style={lbl}>نوٹس</label><input style={inp} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="کوئی نوٹ..."/></div>
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>Cancel</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>محفوظ کریں
            </button>
          </div>
        </div>
      )}

      {/* Search + Grade Filter */}
      <div style={{display:"flex",gap:"10px",marginBottom:"14px",flexWrap:"wrap",alignItems:"center"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search student..." style={{padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",width:"200px",colorScheme:"dark"}}/>
        {grades.map(g=>(
          <button key={g} onClick={()=>setGradeFilter(g)} style={{padding:"8px 13px",borderRadius:"9px",border:`1px solid ${gradeFilter===g?G:"rgba(255,255,255,0.1)"}`,background:gradeFilter===g?"rgba(212,175,55,0.15)":"transparent",color:gradeFilter===g?G:"rgba(241,245,249,0.5)",fontWeight:gradeFilter===g?"700":"500",fontSize:"0.75rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
            {g==="all"?"All":g}
          </button>
        ))}
      </div>

      {/* View Mode Tabs */}
      <div style={{display:"flex",gap:"6px",marginBottom:"20px"}}>
        {[["cards","grid_view","Cards"],["leaderboard","emoji_events","Leaderboard"],["map","map","Quran Map"]].map(([m,ic,l])=>(
          <button key={m} onClick={()=>setViewMode(m)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",borderRadius:"9px",border:`1px solid ${viewMode===m?G:"rgba(255,255,255,0.1)"}`,background:viewMode===m?"rgba(212,175,55,0.12)":"transparent",color:viewMode===m?G:"rgba(241,245,249,0.45)",fontWeight:viewMode===m?"700":"500",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
            <span className="material-symbols-rounded" style={{fontSize:"16px"}}>{ic}</span>{l}
          </button>
        ))}
      </div>

      {/* ── VIEW: CARDS ── */}
      {viewMode==="cards"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"14px",marginBottom:"28px"}}>
          {pagedStudents.map(s=>{
            const cnt=studentLogs(s.id).length;
            const sabaqCnt=studentLogs(s.id).filter(l=>!l.type||l.type==="sabaq").length;
            const sabqiCnt=studentLogs(s.id).filter(l=>l.type==="sabqi"||l.type==="dor").length;
            const manzilCnt=studentLogs(s.id).filter(l=>l.type==="manzil").length;
            const avg=avgRating(s.id);
            const ri=ratingInfo(avg);
            const last=lastSurah(s.id);
            const done=doneToday(s.id);
            const juz=currentJuz(s.id);
            const jpct=juzPct(s.id);
            const str=streak(s.id);
            const h=HOUSES.find(x=>x.id===s.houseId)||{};
            const dsl=daysSinceLast(s.id);
            const absent=!done&&dsl>=3;
            const revDue=revisionDue(s.id);
            const wk=weakSurahs(s.id);
            return (
              <div key={s.id} onClick={()=>setDetailStudent(s)}
                style={{...glass,padding:"16px",
                  borderRight:`3px solid ${absent?"#f87171":h.color||G}`,
                  boxShadow:absent?"0 0 0 1px rgba(248,113,113,0.3),0 4px 20px rgba(0,0,0,0.3)":undefined,
                  cursor:"pointer",transition:"transform 0.15s",position:"relative"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";}}>

                {/* Badges row: today dot + absence warning + revision badge */}
                <div style={{position:"absolute",top:"10px",right:"10px",display:"flex",alignItems:"center",gap:"4px",flexWrap:"wrap",justifyContent:"flex-end",maxWidth:"100px"}}>
                  {absent&&(
                    <span style={{fontSize:"0.5rem",background:"rgba(248,113,113,0.2)",color:"#f87171",fontWeight:"800",padding:"2px 6px",borderRadius:"20px",border:"1px solid rgba(248,113,113,0.4)",direction:"rtl"}}>
                      {dsl}d ⚠
                    </span>
                  )}
                  {revDue.length>0&&!absent&&(
                    <span style={{fontSize:"0.48rem",background:"rgba(251,191,36,0.15)",color:"#fbbf24",fontWeight:"700",padding:"1px 5px",borderRadius:"20px",border:"1px solid rgba(251,191,36,0.3)"}}>
                      مراجعہ {revDue.length}
                    </span>
                  )}
                  <div style={{display:"flex",alignItems:"center",gap:"2px"}}>
                    <div style={{width:"7px",height:"7px",borderRadius:"50%",background:done?"#4ade80":"#f87171",boxShadow:`0 0 5px ${done?"#4ade80":"#f87171"}`}}/>
                    <span style={{fontSize:"0.5rem",color:done?"#4ade80":"#f87171",fontWeight:"700"}}>{done?"✓":"باقی"}</span>
                  </div>
                </div>

                <div style={{fontWeight:"700",color:"#f1f5f9",marginBottom:"1px",fontSize:"0.88rem",paddingRight:"70px"}}>{s.name}</div>
                <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.6)",marginBottom:"10px"}}>{s.grade}{s.section?` • ${s.section}`:""}</div>

                {/* Stats row */}
                <div style={{display:"flex",gap:"4px",marginBottom:"8px"}}>
                  <div style={{background:"rgba(96,165,250,0.12)",borderRadius:"7px",padding:"5px 5px",textAlign:"center",flex:1,border:"1px solid rgba(96,165,250,0.2)"}}>
                    <div style={{fontSize:"0.85rem",fontWeight:"900",color:"#60a5fa"}}>{sabaqCnt}</div>
                    <div style={{fontSize:"0.45rem",color:"rgba(241,245,249,0.4)"}}>سبق</div>
                  </div>
                  <div style={{background:"rgba(74,222,128,0.1)",borderRadius:"7px",padding:"5px 5px",textAlign:"center",flex:1,border:"1px solid rgba(74,222,128,0.2)"}}>
                    <div style={{fontSize:"0.85rem",fontWeight:"900",color:"#4ade80"}}>{sabqiCnt}</div>
                    <div style={{fontSize:"0.45rem",color:"rgba(241,245,249,0.4)"}}>سبقی</div>
                  </div>
                  <div style={{background:"rgba(245,158,11,0.1)",borderRadius:"7px",padding:"5px 5px",textAlign:"center",flex:1,border:"1px solid rgba(245,158,11,0.2)"}}>
                    <div style={{fontSize:"0.85rem",fontWeight:"900",color:"#f59e0b"}}>{manzilCnt}</div>
                    <div style={{fontSize:"0.45rem",color:"rgba(241,245,249,0.4)"}}>منزل</div>
                  </div>
                  <div style={{background:ri.bg,borderRadius:"7px",padding:"5px 5px",textAlign:"center",flex:1,border:`1px solid ${ri.color}25`}}>
                    <div style={{fontSize:"0.55rem",fontWeight:"800",color:ri.color,direction:"rtl"}}>{ri.label}</div>
                    <div style={{fontSize:"0.45rem",color:"rgba(241,245,249,0.4)"}}>معیار</div>
                  </div>
                </div>

                {/* Weak surah warning */}
                {wk.length>0&&(
                  <div style={{marginBottom:"7px",padding:"4px 8px",borderRadius:"6px",background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)"}}>
                    <span style={{fontSize:"0.55rem",color:"#f87171",fontWeight:"700"}}>⚠ کمزور: </span>
                    <span style={{fontSize:"0.55rem",color:"rgba(248,113,113,0.8)",direction:"rtl"}}>{wk.slice(0,2).join("، ")}{wk.length>2?` +${wk.length-2}`:""}</span>
                  </div>
                )}

                {/* Juz progress */}
                {juz!=="—"&&(
                  <div style={{marginBottom:"8px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                      <span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.35)"}}>پارہ {juz} / 30</span>
                      <span style={{fontSize:"0.58rem",color:G,fontWeight:"700"}}>{jpct}%</span>
                    </div>
                    <div style={{height:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${jpct}%`,background:`linear-gradient(90deg,${G},#b8960a)`,borderRadius:"3px"}}/>
                    </div>
                  </div>
                )}

                {/* Streak + last surah */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                  {last&&<span style={{fontSize:"0.58rem",color:"rgba(212,175,55,0.5)",direction:"rtl",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"120px"}}>{last}</span>}
                  {str>0&&<span style={{fontSize:"0.65rem",color:"#fbbf24",fontWeight:"700",flexShrink:0}}>{str}🔥</span>}
                </div>

                <button onClick={e=>openQuickEntry(s,e)} style={{width:"100%",padding:"6px",borderRadius:"8px",border:`1px solid rgba(212,175,55,0.3)`,background:"rgba(212,175,55,0.08)",color:G,fontSize:"0.68rem",fontWeight:"700",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}}>
                  <span className="material-symbols-rounded" style={{fontSize:"14px"}}>add_circle</span>سبق درج کریں
                </button>
              </div>
            );
          })}
        </div>
      )}
      {viewMode==="cards"&&<PaginationBar page={hifzPage} totalPages={hifzTotalPages} setPage={setHifzPage} total={filteredStudents.length} pageSize={24}/>}

      {/* ── VIEW: LEADERBOARD ── */}
      {viewMode==="leaderboard"&&(
        <div style={{...glass,overflow:"hidden",marginBottom:"28px"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"8px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"20px"}}>emoji_events</span>
            <span style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.9rem"}}>Leaderboard — Hifz Progress</span>
          </div>
          <div>
            {[...filteredStudents].sort((a,b)=>rankScore(b.id)-rankScore(a.id)).map((s,idx)=>{
              const juz=currentJuz(s.id);
              const jpct=juzPct(s.id);
              const ri=ratingInfo(avgRating(s.id));
              const done=doneToday(s.id);
              const str=streak(s.id);
              const sabaqCnt=studentLogs(s.id).filter(l=>!l.type||l.type==="sabaq").length;
              const dsl=daysSinceLast(s.id);
              const absent=!done&&dsl>=3;
              const medal=idx===0?"🥇":idx===1?"🥈":idx===2?"🥉":"";
              const h=HOUSES.find(x=>x.id===s.houseId)||{};
              return (
                <div key={s.id} onClick={()=>setDetailStudent(s)} style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",gap:"14px",cursor:"pointer",background:idx<3?"rgba(212,175,55,0.04)":"transparent",transition:"background 0.15s",borderLeft:absent?"3px solid rgba(248,113,113,0.5)":"3px solid transparent"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background=idx<3?"rgba(212,175,55,0.04)":"transparent"}>
                  <div style={{width:"36px",textAlign:"center",flexShrink:0}}>
                    {medal?<span style={{fontSize:"1.4rem"}}>{medal}</span>:<span style={{fontSize:"0.8rem",fontWeight:"800",color:"rgba(255,255,255,0.3)"}}>{idx+1}</span>}
                  </div>
                  <div style={{width:"4px",height:"40px",borderRadius:"2px",background:h.color||G,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:"700",color:"#f1f5f9",fontSize:"0.88rem"}}>{s.name}</div>
                    <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)"}}>{s.grade}{s.section?` • ${s.section}`:""}</div>
                  </div>
                  <div style={{width:"120px",flexShrink:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                      <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.4)"}}>پارہ {juz}/30</span>
                      <span style={{fontSize:"0.6rem",color:G,fontWeight:"700"}}>{jpct}%</span>
                    </div>
                    <div style={{height:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${jpct}%`,background:`linear-gradient(90deg,${G},#b8960a)`,borderRadius:"3px"}}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:"10px",flexShrink:0,alignItems:"center"}}>
                    <span style={{fontSize:"0.7rem",color:"#60a5fa",fontWeight:"700"}}>{sabaqCnt} سبق</span>
                    <span style={{fontSize:"0.68rem",color:ri.color,fontWeight:"700"}}>{ri.label}</span>
                    {str>0&&<span style={{fontSize:"0.7rem",color:"#fbbf24"}}>{str}🔥</span>}
                    {absent&&<span style={{fontSize:"0.6rem",color:"#f87171",fontWeight:"800"}}>{dsl}d⚠</span>}
                    <div style={{width:"8px",height:"8px",borderRadius:"50%",background:done?"#4ade80":"#f87171",flexShrink:0}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW: QURAN MAP ── */}
      {viewMode==="map"&&(
        <div style={{marginBottom:"28px"}}>
          <div style={{marginBottom:"12px",display:"flex",gap:"16px",alignItems:"center",flexWrap:"wrap"}}>
            <span style={{color:"rgba(255,255,255,0.5)",fontSize:"0.75rem"}}>کسی طالب علم کا نقشہ دیکھیں:</span>
            {filteredStudents.map(s=>(
              <button key={s.id} onClick={()=>setDetailStudent(s)} style={{padding:"6px 14px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.05)",color:"rgba(241,245,249,0.7)",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
                {s.name}
              </button>
            ))}
          </div>
          <div style={{...glass,padding:"20px"}}>
            <div style={{color:G,fontWeight:"700",fontSize:"0.88rem",marginBottom:"14px"}}>پارے — تمام طلباء {filteredStudents.length>0?`(${filteredStudents.length})`:""}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"8px"}}>
              {Array.from({length:30},(_,i)=>i+1).map(juz=>{
                const studentsInJuz=filteredStudents.filter(s=>currentJuz(s.id)===juz);
                const studentsPassedJuz=filteredStudents.filter(s=>{const j=currentJuz(s.id);return typeof j==="number"&&j>juz;});
                const total=studentsPassedJuz.length+studentsInJuz.length;
                const pct=filteredStudents.length?Math.round((studentsPassedJuz.length/filteredStudents.length)*100):0;
                const bg=studentsPassedJuz.length===filteredStudents.length&&filteredStudents.length>0?"rgba(74,222,128,0.25)":studentsInJuz.length>0?"rgba(212,175,55,0.2)":pct>0?"rgba(96,165,250,0.1)":"rgba(255,255,255,0.04)";
                const border=studentsPassedJuz.length===filteredStudents.length&&filteredStudents.length>0?"rgba(74,222,128,0.5)":studentsInJuz.length>0?G:"rgba(255,255,255,0.08)";
                return (
                  <div key={juz} style={{background:bg,border:`1px solid ${border}`,borderRadius:"10px",padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.35)",marginBottom:"2px"}}>پارہ</div>
                    <div style={{fontSize:"1.1rem",fontWeight:"900",color:studentsPassedJuz.length>0?"#4ade80":studentsInJuz.length>0?G:"rgba(255,255,255,0.25)"}}>{juz}</div>
                    {total>0&&<div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.4)",marginTop:"3px"}}>{total} طلباء</div>}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:"16px",marginTop:"14px",flexWrap:"wrap"}}>
              {[["rgba(74,222,128,0.25)","rgba(74,222,128,0.5)","مکمل"],["rgba(212,175,55,0.2)",G,"زیر تعلیم"],["rgba(255,255,255,0.04)","rgba(255,255,255,0.08)","شروع نہیں"]].map(([bg,b,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <div style={{width:"14px",height:"14px",borderRadius:"3px",background:bg,border:`1px solid ${b}`}}/>
                  <span style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)"}}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historical Logs Table */}
      <div style={{...glass,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"8px"}}>
          <span className="material-symbols-rounded" style={{color:G,fontSize:"20px"}}>history</span>
          <span style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.9rem"}}>Historical Entries</span>
          <span style={{marginLeft:"auto",fontSize:"0.68rem",color:"rgba(255,255,255,0.3)"}}>{logs.length} total</span>
        </div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
            {["Student","Grade","Surah","Ayahs","نوع","Date","Standard"].map(h=><th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:"0.65rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>{h}</th>)}
          </tr></thead>
          <tbody>{logs.slice(0,30).map((l,i)=>{
            const st=students.find(s=>s.id===(l.studentId||l.student_id));
            const r=RATING.find(x=>x.val===Number(l.rating))||RATING[1];
            const isDor=l.type==="dor";
            return (
              <tr key={l.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",background:i%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
                <td style={{padding:"10px 14px",fontWeight:"700",color:"#f1f5f9",fontSize:"0.78rem"}}>{st?.name||"—"}</td>
                <td style={{padding:"10px 14px",color:"rgba(212,175,55,0.6)",fontSize:"0.65rem"}}>{st?.grade||"—"}</td>
                <td style={{padding:"10px 14px",color:"rgba(241,245,249,0.75)",fontSize:"0.75rem"}}>{l.surah}</td>
                <td style={{padding:"10px 14px",direction:"ltr",fontFamily:"monospace",color:"rgba(212,175,55,0.7)",fontSize:"0.7rem"}}>{l.ayahs||"—"}</td>
                <td style={{padding:"10px 14px"}}><span style={{padding:"2px 8px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:l.type==="manzil"?"rgba(245,158,11,0.15)":l.type==="sabqi"||isDor?"rgba(74,222,128,0.12)":"rgba(96,165,250,0.15)",color:l.type==="manzil"?"#f59e0b":l.type==="sabqi"||isDor?"#4ade80":"#60a5fa"}}>{l.type==="manzil"?"منزل":l.type==="sabqi"||isDor?"سبقی":"سبق"}</span></td>
                <td style={{padding:"10px 14px",direction:"ltr",fontFamily:"monospace",color:"rgba(241,245,249,0.4)",fontSize:"0.65rem"}}>{l.date||"—"}</td>
                <td style={{padding:"10px 14px"}}><span style={{padding:"2px 8px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:r.bg,color:r.color,border:`1px solid ${r.color}30`}}>{r.label}</span></td>
              </tr>
            );
          })}
          {logs.length===0&&<tr><td colSpan={7} style={{padding:"50px",textAlign:"center",color:"rgba(241,245,249,0.3)"}}>
            <span className="material-symbols-rounded" style={{fontSize:"40px",display:"block",marginBottom:"10px",color:"rgba(212,175,55,0.2)"}}>menu_book</span>کوئی اندراج نہیں
          </td></tr>}
          </tbody>
        </table></div>
      </div>

      {/* ── Student Detail Modal ── */}
      {detailStudent&&(()=>{
        const s=detailStudent;
        const sl=sortedLogs(s.id);
        const avg=avgRating(s.id);
        const ri=ratingInfo(avg);
        const done=doneToday(s.id);
        const juz=currentJuz(s.id);
        const jpct=juzPct(s.id);
        const str=streak(s.id);
        const sabaqCnt=sl.filter(l=>!l.type||l.type==="sabaq").length;
        const sabqiCnt=sl.filter(l=>l.type==="sabqi"||l.type==="dor").length;
        const manzilCnt=sl.filter(l=>l.type==="manzil").length;
        const wl=weeklyLogs(s.id);
        const juzSet=juzReached(s.id);
        const h=HOUSES.find(x=>x.id===s.houseId)||{};
        const ta=totalAyahs(s.id);
        const dsl=daysSinceLast(s.id);
        const hmap=heatmap30(s.id);
        const mstats=monthlyStats(s.id);
        const maxMonth=Math.max(...mstats.map(m=>m.count),1);
        const wk=weakSurahs(s.id);
        const revDue=revisionDue(s.id);
        const compJuz=completedJuz(s.id);

        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={()=>setDetailStudent(null)}>
            <div style={{background:"#0f172a",border:`1px solid ${h.color||G}40`,borderRadius:"20px",width:"100%",maxWidth:"720px",maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}>

              {/* Modal header — sticky */}
              <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"3px",flexWrap:"wrap"}}>
                      <span style={{color:"#f1f5f9",fontWeight:"800",fontSize:"1.15rem"}}>{s.name}</span>
                      <span style={{padding:"2px 8px",borderRadius:"20px",fontSize:"0.58rem",fontWeight:"700",background:done?"rgba(74,222,128,0.15)":"rgba(248,113,113,0.15)",color:done?"#4ade80":"#f87171",border:`1px solid ${done?"rgba(74,222,128,0.3)":"rgba(248,113,113,0.3)"}`}}>{done?"✓ آج مکمل":"آج باقی"}</span>
                      {dsl>=3&&!done&&<span style={{padding:"2px 8px",borderRadius:"20px",fontSize:"0.55rem",fontWeight:"800",background:"rgba(248,113,113,0.15)",color:"#f87171",border:"1px solid rgba(248,113,113,0.3)"}}>⚠ {dsl} دن غیر حاضر</span>}
                    </div>
                    <div style={{color:"rgba(212,175,55,0.6)",fontSize:"0.7rem"}}>{s.grade}{s.section?` • ${s.section}`:""}</div>
                  </div>
                  <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                    <button onClick={()=>printReport(s)} style={{display:"flex",alignItems:"center",gap:"5px",padding:"7px 14px",borderRadius:"9px",border:`1px solid rgba(212,175,55,0.3)`,background:"rgba(212,175,55,0.1)",color:G,fontSize:"0.7rem",fontWeight:"700",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
                      <span className="material-symbols-rounded" style={{fontSize:"15px"}}>print</span>Print
                    </button>
                    <button onClick={()=>setDetailStudent(null)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"9px",width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"rgba(241,245,249,0.5)"}}>
                      <span className="material-symbols-rounded" style={{fontSize:"18px"}}>close</span>
                    </button>
                  </div>
                </div>

                {/* Stats strip */}
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"14px"}}>
                  {[
                    {v:sabaqCnt,l:"نیا سبق",c:"#60a5fa"},
                    {v:sabqiCnt,l:"سبقی",c:"#4ade80"},
                    {v:manzilCnt,l:"منزل",c:"#f59e0b"},
                    {v:ta,l:"کل آیات",c:"#38bdf8"},
                    {v:ri.label,l:"معیار",c:ri.color},
                    {v:`پارہ ${juz}`,l:"مقام",c:G},
                    {v:`${str}🔥`,l:"Streak",c:"#fbbf24"},
                    {v:wl.length,l:"اس ہفتے",c:"#34d399"},
                  ].map(({v,l,c})=>(
                    <div key={l} style={{background:"rgba(255,255,255,0.04)",borderRadius:"9px",padding:"7px 12px",textAlign:"center",border:"1px solid rgba(255,255,255,0.07)"}}>
                      <div style={{fontSize:"0.95rem",fontWeight:"900",color:c,direction:"rtl"}}>{v}</div>
                      <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.3)",marginTop:"2px"}}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Juz progress bar */}
                <div style={{marginBottom:"10px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                    <span style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.4)"}}>قرآن پیش رفت</span>
                    <span style={{fontSize:"0.62rem",color:G,fontWeight:"700"}}>پارہ {juz}/30 — {jpct}%</span>
                  </div>
                  <div style={{height:"7px",background:"rgba(255,255,255,0.08)",borderRadius:"4px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${jpct}%`,background:`linear-gradient(90deg,${G},#b8960a)`,borderRadius:"4px"}}/>
                  </div>
                </div>

                {/* Mini 30-Juz map */}
                <div style={{display:"flex",gap:"3px",flexWrap:"wrap"}}>
                  {Array.from({length:30},(_,i)=>i+1).map(j=>{
                    const cur=typeof juz==="number"&&juz===j;
                    const done2=typeof juz==="number"&&juz>j;
                    const studied=juzSet.has(j);
                    return <div key={j} title={`پارہ ${j}`} style={{width:"18px",height:"18px",borderRadius:"3px",background:done2?"rgba(74,222,128,0.3)":cur?"rgba(212,175,55,0.4)":studied?"rgba(96,165,250,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${done2?"rgba(74,222,128,0.5)":cur?G:studied?"rgba(96,165,250,0.3)":"rgba(255,255,255,0.07)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.45rem",color:done2?"#4ade80":cur?G:"rgba(255,255,255,0.2)",fontWeight:"700"}}>{j}</div>;
                  })}
                </div>
              </div>

              {/* Scrollable body */}
              <div style={{overflowY:"auto",flex:1,padding:"0"}}>

                {/* 30-day Heatmap */}
                <div style={{padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",fontWeight:"700",marginBottom:"10px"}}>30 دن کی حاضری</div>
                  <div style={{display:"flex",gap:"3px",flexWrap:"wrap"}}>
                    {hmap.map((day,i)=>{
                      const types=[day.sabaq,day.sabqi,day.manzil].filter(Boolean).length;
                      const bg=types===0?"rgba(255,255,255,0.05)":
                               types>=2?"rgba(255,255,255,0.25)":
                               day.sabaq?"rgba(74,222,128,0.55)":
                               day.sabqi?"rgba(167,139,250,0.5)":
                               "rgba(251,191,36,0.45)";
                      const isToday=day.date===TODAY;
                      const tip=`${day.date}${day.sabaq?" • نیا سبق":""}${day.sabqi?" • سبقی":""}${day.manzil?" • منزل":""}`;
                      return(
                        <div key={i} title={tip}
                          style={{width:"20px",height:"20px",borderRadius:"4px",background:bg,border:`1px solid ${isToday?G:"rgba(255,255,255,0.07)"}`,position:"relative",flexShrink:0}}>
                          {isToday&&<div style={{position:"absolute",bottom:"-4px",left:"50%",transform:"translateX(-50%)",width:"4px",height:"4px",borderRadius:"50%",background:G}}/>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display:"flex",gap:"14px",marginTop:"10px",flexWrap:"wrap"}}>
                    {[["rgba(74,222,128,0.55)","📖 نیا سبق"],["rgba(167,139,250,0.5)","🔁 سبقی"],["rgba(251,191,36,0.45)","📚 منزل"],["rgba(255,255,255,0.25)","✦ ملا جلا"],["rgba(255,255,255,0.05)","غیر حاضر"]].map(([bg,l])=>(
                      <div key={l} style={{display:"flex",alignItems:"center",gap:"5px"}}>
                        <div style={{width:"12px",height:"12px",borderRadius:"2px",background:bg,border:"1px solid rgba(255,255,255,0.1)"}}/>
                        <span style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.4)"}}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Bar Chart */}
                <div style={{padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",fontWeight:"700",marginBottom:"12px"}}>ماہانہ سبق</div>
                  <div style={{display:"flex",gap:"6px",alignItems:"flex-end",height:"60px"}}>
                    {mstats.map((m,i)=>{
                      const barH=maxMonth>0?Math.round((m.count/maxMonth)*100):0;
                      const isCurrent=i===5;
                      return(
                        <div key={m.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                          <span style={{fontSize:"0.55rem",color:isCurrent?G:"rgba(255,255,255,0.4)",fontWeight:isCurrent?"800":"400"}}>{m.count}</span>
                          <div style={{width:"100%",height:"40px",display:"flex",alignItems:"flex-end"}}>
                            <div style={{width:"100%",height:`${barH}%`,minHeight:m.count>0?3:0,background:isCurrent?`linear-gradient(180deg,${G},#b8960a)`:"rgba(255,255,255,0.12)",borderRadius:"3px 3px 0 0",transition:"height 0.3s"}}/>
                          </div>
                          <span style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.3)"}}>{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weak Surahs */}
                {wk.length>0&&(
                  <div style={{padding:"14px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{fontSize:"0.7rem",color:"#f87171",fontWeight:"700",marginBottom:"8px"}}>⚠ کمزور سورتیں (2 یا زیادہ بار ضعیف)</div>
                    <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                      {wk.map(sr=>(
                        <span key={sr} style={{padding:"4px 10px",borderRadius:"20px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",fontSize:"0.68rem",color:"#f87171",direction:"rtl"}}>{sr}</span>
                      ))}
                    </div>
                    <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,0.3)",marginTop:"6px"}}>ان سورتوں پر خصوصی توجہ اور دوبارہ مراجعہ ضروری ہے</div>
                  </div>
                )}

                {/* Revision Due */}
                {revDue.length>0&&(
                  <div style={{padding:"14px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{fontSize:"0.7rem",color:"#fbbf24",fontWeight:"700",marginBottom:"8px"}}>🔁 مراجعہ کی ضرورت (7+ دن سے سبقی نہیں ہوا)</div>
                    <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                      {revDue.map(sr=>(
                        <span key={sr} style={{padding:"4px 10px",borderRadius:"20px",background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",fontSize:"0.68rem",color:"#fbbf24",direction:"rtl"}}>{sr}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Juz Certificates */}
                {compJuz.length>0&&(
                  <div style={{padding:"14px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{fontSize:"0.7rem",color:"#4ade80",fontWeight:"700",marginBottom:"8px"}}>🏆 مکمل شدہ پارے — سند پرنٹ کریں</div>
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      {compJuz.map(j=>(
                        <button key={j} onClick={()=>printCertificate(s,j)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 14px",borderRadius:"9px",border:"1px solid rgba(74,222,128,0.3)",background:"rgba(74,222,128,0.08)",color:"#4ade80",fontSize:"0.7rem",fontWeight:"700",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
                          <span className="material-symbols-rounded" style={{fontSize:"15px"}}>workspace_premium</span>
                          پارہ {j} سند
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Date-grouped Timeline ── */}
                {sl.length===0?(
                  <div style={{padding:"40px",textAlign:"center",color:"rgba(255,255,255,0.3)"}}>
                    <span className="material-symbols-rounded" style={{fontSize:"36px",display:"block",marginBottom:"8px",color:"rgba(212,175,55,0.15)"}}>menu_book</span>
                    کوئی اندراج نہیں
                  </div>
                ):(
                  <div style={{padding:"14px 16px"}}>
                    {/* Column legend */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0",marginBottom:"10px",padding:"0 2px"}}>
                      {[
                        {label:"📖 نیا سبق",color:"#60a5fa"},
                        {label:"🔁 سبقی",color:"#4ade80"},
                        {label:"📚 منزل",color:"#f59e0b"},
                      ].map(({label,color})=>(
                        <div key={label} style={{textAlign:"center",fontSize:"0.6rem",fontWeight:"700",color:"rgba(255,255,255,0.3)",padding:"4px 0",direction:"rtl"}}>{label}</div>
                      ))}
                    </div>
                    {/* Day cards */}
                    {groupedByDate(s.id).map(([date,dayLogs])=>{
                      const isToday=date===TODAY;
                      const hasSomething=dayLogs.sabaq.length||dayLogs.sabqi.length||dayLogs.manzil.length;
                      let dayLabel="—";
                      try{dayLabel=new Date(date).toLocaleDateString("en-PK",{weekday:"short",day:"numeric",month:"short"});}catch(e){}
                      return(
                        <div key={date} style={{marginBottom:"10px",borderRadius:"12px",
                          border:`1px solid ${isToday?"rgba(74,222,128,0.35)":"rgba(255,255,255,0.07)"}`,
                          background:isToday?"rgba(74,222,128,0.04)":"rgba(255,255,255,0.02)",
                          overflow:"hidden"}}>
                          {/* Date header */}
                          <div style={{padding:"7px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:"8px",background:isToday?"rgba(74,222,128,0.07)":"rgba(255,255,255,0.02)"}}>
                            <span className="material-symbols-rounded" style={{fontSize:"13px",color:isToday?"#4ade80":"rgba(255,255,255,0.25)"}}>calendar_today</span>
                            <span style={{fontSize:"0.68rem",fontWeight:isToday?"800":"600",color:isToday?"#4ade80":"rgba(255,255,255,0.45)",fontFamily:"monospace"}}>{dayLabel}</span>
                            {isToday&&<span style={{fontSize:"0.52rem",background:"#4ade80",color:"#0f172a",padding:"1px 7px",borderRadius:"20px",fontWeight:"800"}}>آج</span>}
                          </div>
                          {/* Three columns */}
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
                            {[
                              {key:"sabaq",color:"#60a5fa",icon:"auto_stories",emptyMsg:"سبق نہیں"},
                              {key:"sabqi",color:"#4ade80",icon:"history_edu",emptyMsg:"سبقی نہیں"},
                              {key:"manzil",color:"#f59e0b",icon:"layers",emptyMsg:"منزل نہیں"},
                            ].map(({key,color,icon,emptyMsg},ci)=>{
                              const entries=dayLogs[key]||[];
                              return(
                                <div key={key} style={{padding:"10px 12px",borderRight:ci<2?"1px solid rgba(255,255,255,0.05)":"none",minHeight:"56px"}}>
                                  {entries.length===0?(
                                    <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                      <span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.1)"}}>—</span>
                                    </div>
                                  ):entries.map((e,ei)=>{
                                    const r=RATING.find(x=>x.val===Number(e.rating))||RATING[1];
                                    return(
                                      <div key={ei} style={{marginBottom:ei<entries.length-1?8:0,paddingBottom:ei<entries.length-1?8:0,borderBottom:ei<entries.length-1?"1px dashed rgba(255,255,255,0.06)":"none"}}>
                                        <div style={{fontSize:"0.72rem",color:"rgba(241,245,249,0.88)",fontWeight:"700",direction:"rtl",marginBottom:"3px",lineHeight:"1.3"}}>{e.surah}</div>
                                        {e.ayahs&&e.ayahs!=="(مکمل پارہ)"&&(
                                          <div style={{fontSize:"0.58rem",color:"rgba(212,175,55,0.65)",fontFamily:"monospace",direction:"ltr",marginBottom:"4px"}}>{e.ayahs}</div>
                                        )}
                                        <span style={{display:"inline-block",padding:"1px 7px",borderRadius:"20px",fontSize:"0.52rem",fontWeight:"700",background:r.bg,color:r.color}}>{r.label}</span>
                                        {e.notes&&<div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.28)",marginTop:"3px",direction:"rtl"}}>{e.notes}</div>}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{padding:"14px 24px",borderTop:"1px solid rgba(255,255,255,0.08)",flexShrink:0}}>
                <button onClick={e=>{setDetailStudent(null);openQuickEntry(s,{stopPropagation:()=>{}});}} style={{width:"100%",padding:"10px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
                  <span className="material-symbols-rounded" style={{fontSize:"18px"}}>add_circle</span>آج کا سبق درج کریں
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
export default Hifz;
