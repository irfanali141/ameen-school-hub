/* eslint-disable */
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabase";
import { C, S, hBadge, sLabel } from "../../constants";
import letterhead from "../../assets/letterhead.png";
import EmptyState from "../ui/EmptyState";

// ── Fee Structure Lookups (sourced from Fee Receipt Generator.xlsx) ───────────
const TUITION_FEES = {
  "Play Group":3000,"Nursery":3000,"KG":3000,
  "1st":3300,"2nd":3300,"3rd":3300,"4th":3600,
};
const TRANSPORT_FEES = {
  "Shin":1100,"Nalai Qala":1200,"Asala Kotanai":1500,
  "Fatehpur Benawrai":1000,"Barhampati":1200,"No Transport":0,
};
const BOOKS_FEES = {
  "Play Group":3400,"Nursery":3500,"KG":3600,
  "1st":4200,"2nd":4300,"3rd":4400,"4th":4500,
};
const EXAM_FEE_STD = 2500;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const RECEIPT_PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #fee-receipt-print-area, #fee-receipt-print-area * { visibility: visible !important; }
  #fee-receipt-print-area {
    position: fixed !important;
    top: 0; left: 0;
    width: 100%;
    background: white;
    padding: 0;
    margin: 0;
  }
  .no-print { display: none !important; }
  @page { margin: 0; size: A4; }
}
`;



function FeeManagement({students,addData,updateData,fees:feesProp=[],teachers=[],feeReceipts=[]}){
  const G="#d4af37";const N="#0f172a";const N2="#1e293b";
  const glass={background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"16px"};
  const [activeTab,setActiveTab]=useState("receipt");
  const [fees,setFees]=useState(feesProp);const [show,setShow]=useState(false);const [q,setQ]=useState("");const [filterStatus,setFilterStatus]=useState("all");
  const [selectedFee,setSelectedFee]=useState(null);
  useEffect(()=>{setFees(feesProp);},[feesProp]);

  // ── Receipt Generator State ──────────────────────────────────────────────────
  const today=new Date();
  const todayStr=`${String(today.getDate()).padStart(2,"0")}/${String(today.getMonth()+1).padStart(2,"0")}/${today.getFullYear()}`;
  const [rcRollNo,setRcRollNo]=useState("");
  const [rcStudent,setRcStudent]=useState(null);
  const [rc,setRc]=useState({
    payType:"Monthly", session:String(today.getFullYear()),
    month:MONTHS[today.getMonth()], receiptNo:"",
    date:todayStr, canteen:0,
    incBooks:false, incExam:false,
    tuitionFee:3000, transportFee:1100,
    booksFee:3400, examFee:EXAM_FEE_STD,
    amountPaid:"", // blank=full, 0=nothing paid, number=partial
  });
  const [saveStatus,setSaveStatus]=useState(null); // null|"saving"|"saved"|"error"
  const upRc=p=>setRc(prev=>({...prev,...p}));

  const searchByRoll=(roll)=>{
    if(!roll.trim()){setRcStudent(null);return;}
    const st=students.find(s=>
      (s.studentCode||"").toLowerCase()===roll.toLowerCase()||
      String(s.rollNo||"")===roll.trim()
    );
    setRcStudent(st||null);
    if(st){
      const tu=TUITION_FEES[st.grade]||rc.tuitionFee;
      const route=st.transportRoute||st.transport_route||"";
      const tr=route in TRANSPORT_FEES?TRANSPORT_FEES[route]:0;
      const bk=BOOKS_FEES[st.grade]||rc.booksFee;
      upRc({tuitionFee:tu,transportFee:tr,booksFee:bk,examFee:EXAM_FEE_STD});
    }
  };

  // ── Fee Calculations ─────────────────────────────────────────────────────────
  const isAnnual=rc.payType==="Annual";
  const tuitionMonthly=Number(rc.tuitionFee)||0;
  const transportMonthly=Number(rc.transportFee)||0;
  // Annual = 12 months shown with 1-month discount; Monthly = 1 month
  const tuitionFee=isAnnual?tuitionMonthly*12:tuitionMonthly;
  const transportFee=isAnnual?transportMonthly*12:transportMonthly;
  const annualDiscount=isAnnual?-(tuitionMonthly+transportMonthly):0;
  const booksFee=rc.incBooks?Number(rc.booksFee)||0:0;
  const examFee=rc.incExam?Number(rc.examFee)||0:0;
  const canteenFee=Number(rc.canteen)||0;
  const grandTotal=tuitionFee+transportFee+booksFee+examFee+canteenFee+annualDiscount;
  // Amount paid: blank=full, 0=nothing, number=partial
  const amountPaid=rc.amountPaid===""?grandTotal:Math.max(0,Number(rc.amountPaid)||0);
  const balanceDue=Math.max(0,grandTotal-amountPaid);
  // Arrears: sum of unpaid balance_due from previous receipts for this student
  const arrears=rcStudent?feeReceipts.filter(r=>r.student_id===rcStudent.id).reduce((s,r)=>s+(Number(r.balance_due)||0),0):0;
  const grandTotalDue=balanceDue+arrears;
  // Auto receipt number = max existing + 1
  const nextReceiptNo=feeReceipts.length>0?Math.max(...feeReceipts.map(r=>Number(r.receipt_no)||0))+1:1;

  const feeLines=useMemo(()=>[
    {sno:1,label:isAnnual?"Tuition Fee (12 months)":"Tuition Fee",amount:tuitionFee},
    ...(transportFee?[{sno:2,label:isAnnual?"Transport Fee (12 months)":"Transport Fee",amount:transportFee}]:[]),
    ...(booksFee?[{sno:3,label:"Books Charges (Annual)",amount:booksFee}]:[]),
    ...(examFee?[{sno:4,label:"Exam Fee (Annual)",amount:examFee}]:[]),
    ...(canteenFee?[{sno:5,label:"Canteen Charges",amount:canteenFee}]:[]),
    ...(annualDiscount?[{sno:6,label:"Annual Discount (1 month Tuition + Transport FREE)",amount:annualDiscount}]:[]),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ],[tuitionFee,transportFee,booksFee,examFee,canteenFee,annualDiscount,isAnnual]);

  // ── Save Receipt to DB ───────────────────────────────────────────────────────
  const [saveError,setSaveError]=useState("");
  const saveReceipt=async()=>{
    if(!rcStudent){alert("پہلے طالب علم منتخب کریں");return;}
    setSaveStatus("saving"); setSaveError("");
    const payload={
      receipt_no: Number(rc.receiptNo)||nextReceiptNo,
      date: new Date().toISOString().slice(0,10),
      student_id: String(rcStudent.id||""),
      student_name: rcStudent.name||"",
      father_name: rcStudent.fatherName||rcStudent.father_name||"",
      class: rcStudent.grade||"",
      month_period: isAnnual?"Full Year":rc.month,
      payment_type: rc.payType,
      session: rc.session,
      tuition_fee: tuitionFee,
      transport_fee: transportFee,
      books_fee: booksFee,
      exam_fee: examFee,
      canteen_fee: canteenFee,
      annual_discount: annualDiscount,
      total_amount: grandTotal,
      amount_paid: amountPaid,
      balance_due: balanceDue,
      previous_arrears: arrears,
    };
    try{
      const {error}=await supabase.from("fee_receipts").insert([payload]);
      if(error) throw error;
      // Auto-advance receipt number
      upRc({receiptNo:String((Number(rc.receiptNo)||nextReceiptNo)+1),amountPaid:""});
      setSaveStatus("saved");
      setTimeout(()=>setSaveStatus(null),3500);
    }catch(e){
      console.error("saveReceipt error:",e);
      setSaveError(e?.message||"Unknown error");
      setSaveStatus("error");
      setTimeout(()=>{setSaveStatus(null);setSaveError("");},6000);
    }
  };

  // ── Print Receipt ────────────────────────────────────────────────────────────
  const printReceiptGen=()=>{
    const st=rcStudent||{name:"_______________",fatherName:"_______________",grade:"_______________",transportRoute:""};
    const rowsHTML=feeLines.map((r,i)=>`
      <tr style="background:${i%2===0?"#fffdf8":"#fff"}">
        <td style="padding:5px 8px;text-align:center;border:1px solid #e5d98a;font-size:12px">${r.sno}</td>
        <td style="padding:5px 8px;border:1px solid #e5d98a;font-size:12px">${r.label}</td>
        <td style="padding:5px 8px;text-align:right;border:1px solid #e5d98a;font-size:12px;font-weight:700;color:${r.amount<0?"#dc2626":"#0f172a"}">
          ${r.amount<0?"("+Math.abs(r.amount).toLocaleString()+")":r.amount.toLocaleString()}
        </td>
      </tr>`).join("");

    const copyHTML=(title)=>`
      <div style="flex:1;border:2px solid #b7860b;border-radius:8px;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a">
        <div style="overflow:hidden;height:72px;background:#fff">
          <img src="${letterhead}" alt="logo" style="width:100%;display:block;margin-top:0"/>
        </div>
        <div style="background:#1e3a5f;color:#fff;text-align:center;padding:5px 4px">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.04em">Fee Collection Receipt — ${title}</div>
        </div>
        <div style="padding:10px 12px">
          <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px">
            <tr>
              <td style="padding:3px 0;color:#7a5807;font-weight:700;width:42%">Student Name:</td>
              <td style="padding:3px 0;font-weight:700">${st.name}</td>
              <td style="padding:3px 0;color:#7a5807;font-weight:700;width:28%">Receipt No:</td>
              <td style="padding:3px 0;font-family:monospace;font-weight:800">${rc.receiptNo||"—"}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;color:#7a5807;font-weight:700">Father's Name:</td>
              <td style="padding:3px 0">${st.fatherName||st.father_name||"—"}</td>
              <td style="padding:3px 0;color:#7a5807;font-weight:700">Date:</td>
              <td style="padding:3px 0;font-family:monospace">${rc.date}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;color:#7a5807;font-weight:700">Class:</td>
              <td style="padding:3px 0">${st.grade||"—"}</td>
              <td style="padding:3px 0;color:#7a5807;font-weight:700">Session:</td>
              <td style="padding:3px 0">${rc.session}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;color:#7a5807;font-weight:700">Month:</td>
              <td style="padding:3px 0">${rc.month}</td>
              <td style="padding:3px 0;color:#7a5807;font-weight:700">Payment Type:</td>
              <td style="padding:3px 0">${rc.payType}</td>
            </tr>
          </table>
          <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
            <thead>
              <tr style="background:#7a5807;color:#fff">
                <th style="padding:5px 8px;font-size:11px;width:10%">S.No</th>
                <th style="padding:5px 8px;font-size:11px;text-align:left">Fee Description</th>
                <th style="padding:5px 8px;font-size:11px;text-align:right">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
            <tfoot>
              <tr style="background:#fef9ee">
                <td colspan="2" style="padding:7px 8px;font-weight:900;font-size:13px;color:#7a5807;border-top:2px solid #b7860b">TOTAL AMOUNT</td>
                <td style="padding:7px 8px;font-weight:900;font-size:14px;text-align:right;border-top:2px solid #b7860b;color:#7a5807">${grandTotal.toLocaleString()}</td>
              </tr>
              <tr style="background:#f0fdf4">
                <td colspan="2" style="padding:6px 8px;font-weight:800;font-size:12px;color:#166534">AMOUNT PAID</td>
                <td style="padding:6px 8px;font-weight:800;font-size:13px;text-align:right;color:#166534">${amountPaid.toLocaleString()}</td>
              </tr>
              <tr style="background:#fff0f0">
                <td colspan="2" style="padding:6px 8px;font-weight:800;font-size:12px;color:#991b1b">BALANCE DUE</td>
                <td style="padding:6px 8px;font-weight:800;font-size:13px;text-align:right;color:#991b1b">${balanceDue.toLocaleString()}</td>
              </tr>
              ${arrears>0?`
              <tr style="background:#fffbeb">
                <td colspan="2" style="padding:5px 8px;font-size:11px;color:#92400e">Previous Arrears</td>
                <td style="padding:5px 8px;text-align:right;font-size:11px;color:#92400e">${arrears.toLocaleString()}</td>
              </tr>
              <tr style="background:#7a5807;color:#fff">
                <td colspan="2" style="padding:7px 8px;font-weight:900;font-size:13px">GRAND TOTAL DUE</td>
                <td style="padding:7px 8px;font-weight:900;font-size:14px;text-align:right">${grandTotalDue.toLocaleString()}</td>
              </tr>`:""}
            </tfoot>
          </table>
          <div style="display:flex;justify-content:space-between;margin-top:12px;padding-top:8px">
            <div>
              <div style="font-size:10px;font-weight:700;color:#7a5807">Received By:</div>
              <div style="border-top:1.5px solid #0f172a;margin-top:24px;padding-top:4px;font-size:9px;color:#888;min-width:120px">Signature &amp; Stamp</div>
            </div>
          </div>
          <div style="margin-top:8px;font-size:9px;color:#94a3b8;border-top:1px solid #f0ede8;padding-top:6px">
            Note: This receipt is valid only with authorized signature and school stamp.
          </div>
        </div>
      </div>`;

    const annualBreak=rc.payType==="Annual"?`
      <div style="page-break-before:always;padding:20px;font-family:'Segoe UI',Arial,sans-serif">
        <h2 style="text-align:center;color:#7a5807;margin-bottom:16px">ANNUAL PAYMENT BREAKDOWN</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#7a5807;color:#fff">
              <th style="padding:8px 12px;text-align:left">Fee Component</th>
              <th style="padding:8px 12px;text-align:right">Monthly Rate</th>
              <th style="padding:8px 12px;text-align:right">12 Months Cost</th>
              <th style="padding:8px 12px;text-align:right">Annual Cost (11 months)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#fffdf8"><td style="padding:7px 12px;border-bottom:1px solid #f5e9c8">Tuition Fee</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${tuitionFee.toLocaleString()}</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${(tuitionFee*12).toLocaleString()}</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${(tuitionFee*11).toLocaleString()}</td></tr>
            ${transportFee?`<tr><td style="padding:7px 12px;border-bottom:1px solid #f5e9c8">Transport Fee</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${transportFee.toLocaleString()}</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${(transportFee*12).toLocaleString()}</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${(transportFee*11).toLocaleString()}</td></tr>`:""}
            ${booksFee?`<tr style="background:#fffdf8"><td style="padding:7px 12px;border-bottom:1px solid #f5e9c8">Books Charges</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">—</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${booksFee.toLocaleString()}</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${booksFee.toLocaleString()}</td></tr>`:""}
            ${examFee?`<tr><td style="padding:7px 12px;border-bottom:1px solid #f5e9c8">Exam Fee</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">—</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${examFee.toLocaleString()}</td><td style="padding:7px 12px;text-align:right;border-bottom:1px solid #f5e9c8">${examFee.toLocaleString()}</td></tr>`:""}
          </tbody>
          <tfoot>
            <tr style="background:#fef9ee;font-weight:800">
              <td style="padding:8px 12px;border-top:2px solid #b7860b">TOTAL (without discount)</td>
              <td style="padding:8px 12px;text-align:right;border-top:2px solid #b7860b">—</td>
              <td style="padding:8px 12px;text-align:right;border-top:2px solid #b7860b">${(tuitionFee*12+transportFee*12+booksFee+examFee).toLocaleString()}</td>
              <td style="padding:8px 12px;text-align:right;border-top:2px solid #b7860b">${(tuitionFee*11+transportFee*11+booksFee+examFee).toLocaleString()}</td>
            </tr>
            <tr style="color:#dc2626">
              <td colspan="3" style="padding:7px 12px">Annual Discount (1 month Tuition + Transport FREE):</td>
              <td style="padding:7px 12px;text-align:right;font-weight:800">— ${Math.abs(annualDiscount).toLocaleString()}</td>
            </tr>
            <tr style="color:#16a34a;font-weight:800;font-size:14px">
              <td colspan="3" style="padding:7px 12px">YOU SAVE:</td>
              <td style="padding:7px 12px;text-align:right">${Math.abs(annualDiscount).toLocaleString()}</td>
            </tr>
            <tr style="background:#7a5807;color:#fff;font-weight:900;font-size:15px">
              <td colspan="3" style="padding:9px 12px">ANNUAL TOTAL PAYABLE:</td>
              <td style="padding:9px 12px;text-align:right">${grandTotal.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>`:
    "";

    const w=window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Fee Receipt — ${st.name||"Student"}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:20px}
      .copies{display:flex;gap:20px;max-width:900px;margin:0 auto}
      @media print{body{padding:8mm}button{display:none!important}@page{size:A4;margin:8mm}}
    </style></head><body>
    <div style="text-align:center;margin-bottom:16px;max-width:900px;margin-left:auto;margin-right:auto">
      <button onclick="window.print()" style="padding:10px 30px;background:#7a5807;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;margin-right:10px">🖨️ Print Receipt</button>
      <button onclick="window.close()" style="padding:10px 20px;background:#e2e8f0;color:#0f172a;border:none;border-radius:8px;font-size:13px;cursor:pointer">✕ Close</button>
    </div>
    <div class="copies">
      ${copyHTML("Student Copy")}
      ${copyHTML("Accounts Copy")}
    </div>
    ${annualBreak}
    <script>document.querySelector('button')&&document.querySelector('button').focus();<\/script>
    </body></html>`);
    w.document.close();
  };

  const printReceipt=(fee)=>{
    setSelectedFee(fee);
    if(!document.getElementById("fee-receipt-print-style")){
      const s=document.createElement("style");s.id="fee-receipt-print-style";s.innerHTML=RECEIPT_PRINT_STYLE;document.head.appendChild(s);
    }
    setTimeout(()=>window.print(),50);
  };
  const [f,setF]=useState({studentId:"",feeType:"monthly",amount:3000,month:"",dueDate:"",status:"pending",notes:""});
  const [bulkShow,setBulkShow]=useState(false);
  const [bulkResult,setBulkResult]=useState(null);

  const handleBulkCSV=async(e)=>{
    const file=e.target.files[0]; if(!file)return;
    const text=await file.text();
    const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
    // Skip header row if it starts with non-numeric / student name header
    const dataLines=lines[0]?.toLowerCase().includes("name")||lines[0]?.toLowerCase().includes("student")?lines.slice(1):lines;
    let ok=0,skip=0,errs=[];
    for(const line of dataLines){
      const [nameOrCode,amtStr,typeStr,monthStr]= line.split(",").map(s=>s?.trim());
      if(!nameOrCode||!amtStr){skip++;continue;}
      // Match student by name (partial, case-insensitive) or studentCode
      const st=students.find(s=>
        s.name?.toLowerCase().includes(nameOrCode.toLowerCase())||
        s.studentCode?.toLowerCase()===nameOrCode.toLowerCase()
      );
      if(!st){errs.push(`نہیں ملا: ${nameOrCode}`);skip++;continue;}
      const [yr,mo]=monthStr?monthStr.split("-").map(Number):[new Date().getFullYear(),new Date().getMonth()+1];
      try{
        await addData("fees",{
          student_id:st.id, student_name:st.name,
          amount:parseFloat(amtStr)||0,
          type:typeStr||"monthly",
          month:mo||new Date().getMonth()+1,
          year:yr||new Date().getFullYear(),
          status:"pending",
        });
        ok++;
      }catch(err){errs.push(`خرابی ${st.name}: ${err.message}`);skip++;}
    }
    setBulkResult({ok,skip,errs});
    e.target.value="";
  };
  
  const add=async()=>{
    if(!f.studentId||!f.amount)return;
    const st=students.find(s=>s.id===f.studentId);
    // Parse month string "YYYY-MM" → integer month and year
    const [yr,mo]=f.month?f.month.split("-").map(Number):[new Date().getFullYear(),new Date().getMonth()+1];
    await addData("fees",{
      student_id: f.studentId,
      student_name: st?.name||"",
      amount: Number(f.amount),
      type: f.feeType,
      month: mo||null,
      year: yr||new Date().getFullYear(),
      status: f.status,
      due_date: f.dueDate||null,
    });
    setShow(false);setF({studentId:"",feeType:"monthly",amount:3000,month:"",dueDate:"",status:"pending",notes:""});
  };
  const markPaid=async(id)=>{ try{ await updateData("fees",id,{status:"paid",paid_date:new Date().toISOString().slice(0,10)}); setFees(prev=>prev.map(f=>f.id===id?{...f,status:"paid",paid_date:new Date().toISOString().slice(0,10)}:f)); }catch(e){ console.error("markPaid error:",e.message); } };
  const todayISO=new Date().toISOString().slice(0,10);
  const isOverdue=(fe)=>fe.status==="pending"&&fe.due_date&&fe.due_date<todayISO;
  const overdueFees=fees.filter(fe=>isOverdue(fe));
  const totalOverdue=overdueFees.reduce((s,fe)=>s+(fe.amount||0),0);
  const filtered=fees.filter(fe=>{ const st=students.find(s=>s.id===fe.studentId); const matchQ=!q||st?.name?.includes(q)||st?.studentCode?.includes(q); const matchS=filterStatus==="all"||fe.status===filterStatus||(filterStatus==="overdue"&&isOverdue(fe)); return matchQ&&matchS; });
  const totalPending=fees.filter(fe=>fe.status==="pending").reduce((s,fe)=>s+(fe.amount||0),0);
  const totalPaid=fees.filter(fe=>fe.status==="paid").reduce((s,fe)=>s+(fe.amount||0),0);
  const feeTypes={"monthly":"Monthly Fee","admission":"Admission Fee","exam":"Exam Fee","canteen":"Canteen","hostel":"Hostel","transport":"Transport","other":"Other"};
  const inp={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.8rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",direction:"ltr",colorScheme:"dark"};
  const lbl={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};
  const inp2={width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(212,175,55,0.25)",background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.82rem",fontFamily:"'Public Sans',sans-serif",outline:"none",boxSizing:"border-box",colorScheme:"dark"};
  const lbl2={fontSize:"0.7rem",color:"rgba(212,175,55,0.8)",marginBottom:"6px",display:"block",fontWeight:"600"};

  // ══════════════════════════ TC STATE & PRINT ══════════════════════════════════
  const [tcSt,setTcSt]=useState(null);
  const [tc,setTc]=useState({srNo:"",issueDate:new Date().toLocaleDateString("en-PK"),admissionDate:"",leavingDate:new Date().toLocaleDateString("en-PK"),lastClass:"",reason:"",conduct:"Good",remarks:""});
  const upTc=p=>setTc(prev=>({...prev,...p}));
  const CONDUCT_OPTS=["Excellent","Very Good","Good","Satisfactory","Fair"];

  const printTC=()=>{
    const st=tcSt||{name:"_______________",fatherName:"_______________",grade:"_______________",studentCode:"—",section:""};
    const w=window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Transfer Certificate — ${st.name}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#0f172a}
    .wrap{max-width:700px;margin:0 auto;padding:20px}
    table{width:100%;border-collapse:collapse}td{padding:10px 14px;border:1px solid #d4af37;font-size:13px}
    .label{font-weight:700;color:#7a5807;width:40%;background:#fffdf8}.value{font-weight:500;color:#1e293b}
    .title{text-align:center;font-size:20px;font-weight:900;color:#7a5807;margin:12px 0 4px;text-transform:uppercase;letter-spacing:2px}
    .subtitle{text-align:center;font-size:11px;color:#94a3b8;margin-bottom:16px}
    .sigs{display:flex;justify-content:space-between;margin-top:48px}
    .sig{text-align:center;min-width:160px}.sig-line{border-top:1.5px solid #0f172a;padding-top:6px;font-size:11px;color:#64748b;margin-top:40px}
    .sr{text-align:right;font-size:11px;color:#94a3b8;margin-bottom:8px}
    @media print{@page{size:A4;margin:15mm}button{display:none!important}}</style></head><body>
    <div class="wrap">
      <div class="sr">SR No: <strong>${tc.srNo||"___"}</strong> &nbsp;&nbsp; Date: <strong>${tc.issueDate}</strong></div>
      <img src="${letterhead}" style="width:100%;display:block;margin-bottom:8px"/>
      <div class="title">Transfer Certificate</div>
      <div class="subtitle">This is to certify that the student whose particulars are given below was a bonafide student of this institution.</div>
      <table style="margin-bottom:20px">
        <tr><td class="label">Student Full Name</td><td class="value">${st.name}</td></tr>
        <tr><td class="label">Father's Name</td><td class="value">${st.fatherName||st.father_name||"—"}</td></tr>
        <tr><td class="label">Registration / Roll No</td><td class="value">${st.studentCode||"—"}</td></tr>
        <tr><td class="label">Class Last Attended</td><td class="value">${tc.lastClass||st.grade||"—"} ${st.section?"("+st.section+")":""}</td></tr>
        <tr><td class="label">Date of Admission</td><td class="value">${tc.admissionDate||"—"}</td></tr>
        <tr><td class="label">Date of Leaving</td><td class="value">${tc.leavingDate}</td></tr>
        <tr><td class="label">Reason for Leaving</td><td class="value">${tc.reason||"—"}</td></tr>
        <tr><td class="label">Character & Conduct</td><td class="value" style="font-weight:800;color:#16a34a">${tc.conduct}</td></tr>
        <tr><td class="label">Remarks</td><td class="value">${tc.remarks||"—"}</td></tr>
        <tr><td class="label">Fee Clearance</td><td class="value" style="color:#16a34a;font-weight:700">✅ All dues cleared</td></tr>
      </table>
      <p style="font-size:12px;color:#64748b;text-align:center;margin-bottom:20px">This certificate is issued on the request of the parent/guardian for the purpose stated above.</p>
      <div class="sigs">
        <div class="sig"><div class="sig-line">Class Teacher</div></div>
        <div class="sig"><div class="sig-line">Stamp</div></div>
        <div class="sig"><div class="sig-line">Principal / Head of Institution</div></div>
      </div>
    </div>
    <div style="text-align:center;margin:16px 0"><button onclick="window.print()" style="padding:10px 28px;background:#7a5807;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">🖨️ Print TC</button></div>
    <script>setTimeout(()=>window.print(),700);<\/script></body></html>`);
    w.document.close();
  };

  // ══════════════════════════ SALARY SLIP STATE & PRINT ═════════════════════════
  const [slTeacher,setSlTeacher]=useState(null);
  const [sl,setSl]=useState({month:MONTHS[new Date().getMonth()],year:String(new Date().getFullYear()),basicPay:25000,houseRent:5000,transport:2000,medical:1500,other:0,absentDays:0,advance:0,remarks:""});
  const upSl=p=>setSl(prev=>({...prev,...p}));
  const slGross=Number(sl.basicPay)+Number(sl.houseRent)+Number(sl.transport)+Number(sl.medical)+Number(sl.other);
  const slDeduct=(Number(sl.absentDays)>0?Math.round(Number(sl.basicPay)/26*Number(sl.absentDays)):0)+Number(sl.advance);
  const slNet=slGross-slDeduct;

  const printSalarySlip=()=>{
    const t=slTeacher||{name:"_______________",subject:"_______________",employeeCode:"—"};
    const w=window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Salary Slip — ${t.name}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc}
    .wrap{max-width:680px;margin:0 auto;padding:20px}
    .slip{border:2px solid #b7860b;border-radius:8px;overflow:hidden;background:#fff}
    table{width:100%;border-collapse:collapse}td,th{padding:8px 12px;font-size:12.5px;border-bottom:1px solid #f0e9d2}
    th{background:#7a5807;color:#fff;font-size:11px;text-align:left}
    .lbl{color:#7a5807;font-weight:700;width:55%}.val{text-align:right;font-weight:600}
    .green{color:#16a34a;font-weight:800}.red{color:#dc2626;font-weight:800}
    .total-row{background:#fef9ee;font-weight:900;font-size:14px}
    .net{background:#7a5807;color:#fff;font-size:15px;font-weight:900}
    .sigs{display:flex;justify-content:space-between;padding:20px 20px 8px}
    .sig{text-align:center}.sig-line{border-top:1.5px solid #333;padding-top:5px;font-size:10px;color:#64748b;margin-top:36px;min-width:130px}
    @media print{@page{size:A4;margin:12mm}button{display:none!important}}</style></head><body>
    <div class="wrap">
      <img src="${letterhead}" style="width:100%;display:block;margin-bottom:10px"/>
      <div class="slip">
        <div style="background:#1e3a5f;color:#fff;text-align:center;padding:8px">
          <div style="font-size:14px;font-weight:800">SALARY SLIP</div>
          <div style="font-size:11px;opacity:0.8">${sl.month} ${sl.year}</div>
        </div>
        <div style="padding:12px 16px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;border-bottom:1px solid #f0e9d2">
          <div><span style="color:#7a5807;font-weight:700">Name: </span>${t.name}</div>
          <div><span style="color:#7a5807;font-weight:700">Employee Code: </span>${t.employeeCode||"—"}</div>
          <div><span style="color:#7a5807;font-weight:700">Designation: </span>${t.subject||"—"}</div>
          <div><span style="color:#7a5807;font-weight:700">Month/Year: </span>${sl.month} ${sl.year}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
          <div style="border-right:1px solid #f0e9d2">
            <table>
              <thead><tr><th colspan="2">💰 Earnings</th></tr></thead>
              <tbody>
                <tr><td class="lbl">Basic Pay</td><td class="val green">Rs. ${Number(sl.basicPay).toLocaleString()}</td></tr>
                <tr><td class="lbl">House Rent Allowance</td><td class="val green">Rs. ${Number(sl.houseRent).toLocaleString()}</td></tr>
                <tr><td class="lbl">Transport Allowance</td><td class="val green">Rs. ${Number(sl.transport).toLocaleString()}</td></tr>
                <tr><td class="lbl">Medical Allowance</td><td class="val green">Rs. ${Number(sl.medical).toLocaleString()}</td></tr>
                ${sl.other>0?`<tr><td class="lbl">Other Allowance</td><td class="val green">Rs. ${Number(sl.other).toLocaleString()}</td></tr>`:""}
                <tr class="total-row"><td class="lbl">GROSS SALARY</td><td class="val" style="color:#7a5807">Rs. ${slGross.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <table>
              <thead><tr><th colspan="2">➖ Deductions</th></tr></thead>
              <tbody>
                <tr><td class="lbl">Absent Days (${sl.absentDays})</td><td class="val red">Rs. ${(Number(sl.absentDays)>0?Math.round(Number(sl.basicPay)/26*Number(sl.absentDays)):0).toLocaleString()}</td></tr>
                <tr><td class="lbl">Advance Recovery</td><td class="val red">Rs. ${Number(sl.advance).toLocaleString()}</td></tr>
                <tr class="total-row"><td class="lbl">TOTAL DEDUCTIONS</td><td class="val" style="color:#dc2626">Rs. ${slDeduct.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <table><tr class="net"><td style="padding:10px 14px;color:#fff">NET PAYABLE SALARY</td><td style="padding:10px 14px;text-align:right;color:#ffd700;font-size:16px">Rs. ${slNet.toLocaleString()}</td></tr></table>
        ${sl.remarks?`<div style="padding:8px 14px;font-size:11px;color:#64748b;border-top:1px solid #f0e9d2">Remarks: ${sl.remarks}</div>`:""}
        <div class="sigs">
          <div class="sig"><div class="sig-line">Employee Signature</div></div>
          <div class="sig"><div class="sig-line">Accounts Officer</div></div>
          <div class="sig"><div class="sig-line">Principal</div></div>
        </div>
        <div style="padding:0 20px 12px;font-size:9px;color:#94a3b8;border-top:1px solid #f0e9d2;padding-top:8px;text-align:center">This is a computer-generated salary slip and does not require a signature for validity.</div>
      </div>
    </div>
    <div style="text-align:center;margin:12px"><button onclick="window.print()" style="padding:10px 28px;background:#7a5807;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">🖨️ Print Salary Slip</button></div>
    <script>setTimeout(()=>window.print(),700);<\/script></body></html>`);
    w.document.close();
  };

  // ══════════════════════════ ID CARD STATE & PRINT ═════════════════════════════
  const [idType,setIdType]=useState("student");
  const [idPerson,setIdPerson]=useState(null);
  const [idExtra,setIdExtra]=useState({bloodGroup:"",emergencyPhone:"",customPhoto:""});
  const upId=p=>setIdExtra(prev=>({...prev,...p}));

  const printIDCards=()=>{
    const people=idPerson?[idPerson]:
      idType==="student"?students.slice(0,8):teachers.slice(0,8);
    const cardHTML=(p)=>{
      const name=p.name||"—";
      const code=p.studentCode||p.employeeCode||"—";
      const grade=p.grade||p.subject||"—";
      const father=p.fatherName||p.father_name||"";
      const phone=p.phone||"—";
      const bg=idType==="student"?"linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)":"linear-gradient(135deg,#7a5807 0%,#4a3500 100%)";
      return `<div style="width:85mm;height:54mm;background:${bg};border-radius:8px;color:#fff;font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;position:relative;display:inline-flex;flex-direction:column;margin:4mm;page-break-inside:avoid">
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:6px;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.15)">
          <img src="${letterhead}" style="height:26px;object-fit:cover;object-position:left top;width:90px;border-radius:3px"/>
          <div style="flex:1;text-align:right">
            <div style="font-size:7px;font-weight:900;letter-spacing:0.05em;color:#ffd700">AMEEN ISLAMIC INSTITUTE</div>
            <div style="font-size:6px;opacity:0.7;color:#ffd700">${idType==="student"?"STUDENT ID CARD":"STAFF ID CARD"}</div>
          </div>
        </div>
        <!-- Body -->
        <div style="display:flex;flex:1;padding:5px 8px;gap:8px;align-items:center">
          <!-- Photo placeholder -->
          <div style="width:32px;height:38px;border:2px solid rgba(255,255,255,0.3);border-radius:4px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">👤</div>
          <!-- Info -->
          <div style="flex:1">
            <div style="font-size:9px;font-weight:900;color:#ffd700;margin-bottom:2px">${name}</div>
            ${father?`<div style="font-size:7px;opacity:0.75;margin-bottom:1px">S/O: ${father}</div>`:""}
            <div style="font-size:7px;opacity:0.8;margin-bottom:1px">${grade}</div>
            <div style="font-size:7px;font-family:monospace;color:#ffd700;margin-bottom:1px">${code}</div>
            ${idExtra.bloodGroup?`<div style="font-size:7px;color:#f87171">🩸 ${idExtra.bloodGroup}</div>`:""}
          </div>
        </div>
        <!-- Footer -->
        <div style="background:rgba(0,0,0,0.3);padding:3px 8px;display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:6px;opacity:0.6">📞 ${phone}</div>
          <div style="font-size:6px;opacity:0.6">Session: 2026</div>
        </div>
      </div>`;
    };
    const w=window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>ID Cards</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{background:#f1f5f9;padding:10mm}
    .grid{display:flex;flex-wrap:wrap;justify-content:flex-start}
    @media print{@page{size:A4;margin:8mm}body{background:#fff;padding:5mm}button{display:none!important}}</style></head><body>
    <div style="text-align:center;margin-bottom:10px"><button onclick="window.print()" style="padding:10px 28px;background:#1e3a5f;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">🖨️ Print ID Cards</button></div>
    <div class="grid">${people.map(cardHTML).join("")}</div>
    <script>setTimeout(()=>window.print(),700);<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${N} 0%,#0d1f3c 50%,#0a1628 100%)`,padding:"24px 20px",fontFamily:"'Public Sans',sans-serif",direction:"ltr"}}>
      {/* ── Page Header ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"42px",height:"42px",borderRadius:"12px",background:`linear-gradient(135deg,${G},#b8960a)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 18px rgba(212,175,55,0.35)`}}>
            <span className="material-symbols-rounded" style={{fontSize:"22px",color:N}}>payments</span>
          </div>
          <div>
            <div style={{fontSize:"1.3rem",fontWeight:"800",color:"#f1f5f9",lineHeight:1.1}}>Fee Management</div>
            <div style={{fontSize:"0.68rem",color:"rgba(212,175,55,0.65)",fontWeight:"500"}}>Receipts · Ledger · Analytics · Payroll</div>
          </div>
        </div>
        {/* Quick stats strip */}
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {[
            {label:"Receipts",val:feeReceipts.length,color:"#d4af37"},
            {label:"Collected",val:`Rs.${feeReceipts.reduce((s,r)=>s+(Number(r.amount_paid)||0),0).toLocaleString()}`,color:"#4ade80"},
            {label:"Balance",val:`Rs.${feeReceipts.reduce((s,r)=>s+(Number(r.balance_due)||0),0).toLocaleString()}`,color:"#f87171"},
          ].map(x=>(
            <div key={x.label} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",padding:"6px 14px",textAlign:"center"}}>
              <div style={{fontSize:"0.82rem",fontWeight:"800",color:x.color}}>{x.val}</div>
              <div style={{fontSize:"0.6rem",color:"rgba(241,245,249,0.4)"}}>{x.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div style={{display:"flex",gap:"4px",marginBottom:"20px",flexWrap:"wrap",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",padding:"5px"}}>
        {[["receipt","🧾","Receipt"],["ledger","📖","Ledger"],["tracker","✅","Outstanding"],["analytics","📊","Analytics"],["fees","💰","Fee Entries"],["tc","📋","TC"],["salary","💼","Salary"],["idcard","💳","ID Card"]].map(([tab,icon,label])=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"7px 14px",borderRadius:"10px",border:"none",background:activeTab===tab?`linear-gradient(135deg,rgba(212,175,55,0.2),rgba(212,175,55,0.1))`:"transparent",color:activeTab===tab?G:"rgba(241,245,249,0.45)",fontWeight:activeTab===tab?"700":"500",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",transition:"all 0.18s",boxShadow:activeTab===tab?`inset 0 0 0 1px rgba(212,175,55,0.4)`:"none",display:"flex",alignItems:"center",gap:"5px"}}>
            <span style={{fontSize:"0.85rem"}}>{icon}</span><span style={{whiteSpace:"nowrap"}}>{label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ RECEIPT GENERATOR ══ */}
      {activeTab==="receipt"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:"18px",alignItems:"start"}}>

          {/* ── LEFT: Form ── */}
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>

            {/* Student Selection */}
            <div style={{...glass,padding:"18px 20px",borderColor:"rgba(212,175,55,0.25)"}}>
              <div style={{fontSize:"0.68rem",color:G,fontWeight:"700",letterSpacing:"0.08em",marginBottom:"12px"}}>👤 STUDENT SELECTION</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"8px",alignItems:"end",marginBottom:"12px"}}>
                <div>
                  <label style={lbl2}>Roll No / Code</label>
                  <input style={inp2} placeholder="e.g. AII-2026-001" value={rcRollNo}
                    onChange={e=>{setRcRollNo(e.target.value);if(!e.target.value)setRcStudent(null);}}
                    onKeyDown={e=>e.key==="Enter"&&searchByRoll(rcRollNo)}/>
                </div>
                <button onClick={()=>searchByRoll(rcRollNo)} style={{padding:"9px 16px",borderRadius:"10px",border:`1px solid ${G}`,background:"rgba(212,175,55,0.15)",color:G,fontWeight:"700",fontSize:"0.78rem",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",marginBottom:"1px"}}>🔍 Find</button>
                <div>
                  <label style={lbl2}>Or pick from list</label>
                  <select style={inp2} value={rcStudent?.id||""} onChange={e=>{ const st=students.find(s=>s.id===e.target.value); setRcStudent(st||null); if(st){const tu=TUITION_FEES[st.grade]||rc.tuitionFee;const route=st.transportRoute||st.transport_route||"";const tr=route in TRANSPORT_FEES?TRANSPORT_FEES[route]:0;const bk=BOOKS_FEES[st.grade]||rc.booksFee;upRc({tuitionFee:tu,transportFee:tr,booksFee:bk,examFee:EXAM_FEE_STD});} }}>
                    <option value="" style={{background:N2}}>-- Select --</option>
                    {students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name} — {s.grade||""} {s.studentCode?`(${s.studentCode})`:""}</option>)}
                  </select>
                </div>
              </div>
              {rcStudent&&(
                <div style={{background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:"10px",padding:"10px 14px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px"}}>
                  {[["Student",rcStudent.name],["Father",rcStudent.fatherName||rcStudent.father_name||"—"],["Class",rcStudent.grade||"—"],["Transport",rcStudent.transportRoute||rcStudent.transport_route||"—"]].map(([l,v])=>(
                    <div key={l}><div style={{fontSize:"0.58rem",color:"rgba(74,222,128,0.65)",fontWeight:"600"}}>{l}</div><div style={{color:"#f1f5f9",fontWeight:"700",fontSize:"0.78rem",marginTop:"1px"}}>{v}</div></div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div style={{...glass,padding:"18px 20px"}}>
              <div style={{fontSize:"0.68rem",color:G,fontWeight:"700",letterSpacing:"0.08em",marginBottom:"12px"}}>💳 PAYMENT DETAILS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"12px"}}>
                <div>
                  <label style={lbl2}>Type</label>
                  <select style={inp2} value={rc.payType} onChange={e=>upRc({payType:e.target.value})}>
                    <option style={{background:N2}}>Monthly</option>
                    <option style={{background:N2}}>Annual</option>
                  </select>
                </div>
                <div>
                  <label style={lbl2}>Month</label>
                  <select style={inp2} value={rc.month} onChange={e=>upRc({month:e.target.value})}>
                    {MONTHS.map(m=><option key={m} style={{background:N2}}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl2}>Session</label>
                  <input style={inp2} value={rc.session} onChange={e=>upRc({session:e.target.value})}/>
                </div>
                <div>
                  <label style={lbl2}>Receipt # <span style={{color:"rgba(255,255,255,0.25)",fontSize:"0.58rem"}}>auto:{nextReceiptNo}</span></label>
                  <input style={inp2} placeholder={String(nextReceiptNo)} value={rc.receiptNo} onChange={e=>upRc({receiptNo:e.target.value})}/>
                </div>
                <div>
                  <label style={lbl2}>Date</label>
                  <input style={inp2} value={rc.date} onChange={e=>upRc({date:e.target.value})}/>
                </div>
                <div>
                  <label style={lbl2}>Canteen (Rs)</label>
                  <input style={inp2} type="number" min={0} value={rc.canteen} onChange={e=>upRc({canteen:e.target.value})}/>
                </div>
                <div style={{gridColumn:"span 2"}}>
                  <label style={lbl2}>Amount Paid (Rs) <span style={{color:"rgba(255,255,255,0.25)",fontSize:"0.58rem"}}>blank=full</span></label>
                  <input style={{...inp2,borderColor:rc.amountPaid!==""?"rgba(212,175,55,0.5)":"rgba(255,255,255,0.15)",color:rc.amountPaid!==""?G:"rgba(241,245,249,0.6)"}} type="number" min={0} placeholder={`${grandTotal.toLocaleString()} (full)`} value={rc.amountPaid} onChange={e=>upRc({amountPaid:e.target.value})}/>
                </div>
              </div>
              {/* Toggles row */}
              <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
                {[["incBooks","📚 Books Fee"],["incExam","📝 Exam Fee"]].map(([key,label])=>(
                  <button key={key} onClick={()=>upRc({[key]:!rc[key]})} style={{padding:"7px 16px",borderRadius:"9px",border:`1px solid ${rc[key]?"rgba(74,222,128,0.5)":"rgba(255,255,255,0.1)"}`,background:rc[key]?"rgba(74,222,128,0.1)":"transparent",color:rc[key]?"#4ade80":"rgba(241,245,249,0.4)",fontWeight:"700",fontSize:"0.76rem",cursor:"pointer",fontFamily:"inherit"}}>
                    {rc[key]?"✅":"⬜"} {label}
                  </button>
                ))}
              </div>
              {/* Fee amounts editable */}
              <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:"12px"}}>
                <div style={{fontSize:"0.62rem",color:"rgba(212,175,55,0.55)",marginBottom:"10px",fontWeight:"600",letterSpacing:"0.06em"}}>OVERRIDE FEE AMOUNTS</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px"}}>
                  {[["Tuition","tuitionFee"],["Transport","transportFee"],["Books","booksFee"],["Exam","examFee"]].map(([label,key])=>(
                    <div key={key}>
                      <label style={{...lbl2,color:"rgba(255,255,255,0.35)"}}>{label}</label>
                      <input style={{...inp2,color:G,fontWeight:"700",fontSize:"0.82rem"}} type="number" min={0} value={rc[key]} onChange={e=>upRc({[key]:e.target.value})}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>{/* end LEFT */}

          {/* ── RIGHT: Sticky Preview + Actions ── */}
          <div style={{position:"sticky",top:"16px",display:"flex",flexDirection:"column",gap:"12px"}}>

            {/* Arrears warning */}
            {arrears>0&&rcStudent&&(
              <div style={{background:"rgba(251,191,36,0.08)",border:"2px solid rgba(251,191,36,0.35)",borderRadius:"12px",padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px"}}>
                <span style={{fontSize:"1.2rem"}}>⚠️</span>
                <div>
                  <div style={{fontWeight:"800",color:"#fbbf24",fontSize:"0.78rem"}}>Previous Arrears</div>
                  <div style={{fontSize:"0.65rem",color:"rgba(251,191,36,0.7)",marginTop:"2px"}}>Rs. {arrears.toLocaleString()} unpaid — Grand Total Due: Rs. {grandTotalDue.toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Fee Preview Card */}
            <div style={{...glass,padding:"18px 20px",borderColor:"rgba(212,175,55,0.2)"}}>
              <div style={{fontSize:"0.68rem",color:G,fontWeight:"700",letterSpacing:"0.08em",marginBottom:"14px"}}>📊 FEE PREVIEW</div>

              {/* Student name mini */}
              {rcStudent&&<div style={{fontSize:"0.75rem",fontWeight:"700",color:"rgba(241,245,249,0.7)",marginBottom:"12px",paddingBottom:"10px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                {rcStudent.name} · {rcStudent.grade||"—"} · {isAnnual?"Annual":"Monthly — "+rc.month}
              </div>}

              {/* Fee lines */}
              <div style={{marginBottom:"12px"}}>
                {feeLines.map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"0.78rem"}}>
                    <span style={{color:"rgba(241,245,249,0.55)"}}>{r.label}</span>
                    <span style={{fontWeight:"700",color:r.amount<0?"#f87171":G,fontFamily:"monospace"}}>{r.amount<0?"−":""} Rs.{Math.abs(r.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{borderTop:"2px solid rgba(212,175,55,0.35)",paddingTop:"10px",display:"flex",flexDirection:"column",gap:"6px"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontWeight:"800",color:"#f1f5f9",fontSize:"0.9rem"}}>TOTAL</span>
                  <span style={{fontWeight:"900",color:G,fontSize:"1rem",fontFamily:"monospace"}}>Rs.{grandTotal.toLocaleString()}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"rgba(74,222,128,0.8)",fontSize:"0.78rem",fontWeight:"700"}}>Paid</span>
                  <span style={{fontWeight:"800",color:"#4ade80",fontFamily:"monospace",fontSize:"0.85rem"}}>Rs.{amountPaid.toLocaleString()}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"rgba(248,113,113,0.8)",fontSize:"0.78rem",fontWeight:"700"}}>Balance Due</span>
                  <span style={{fontWeight:"800",color:balanceDue>0?"#f87171":"#4ade80",fontFamily:"monospace",fontSize:"0.85rem"}}>Rs.{balanceDue.toLocaleString()}</span>
                </div>
                {arrears>0&&<div style={{display:"flex",justifyContent:"space-between",marginTop:"4px",padding:"8px 10px",borderRadius:"8px",background:"rgba(251,191,36,0.07)"}}>
                  <span style={{color:"rgba(251,191,36,0.8)",fontSize:"0.75rem",fontWeight:"700"}}>Grand Total Due</span>
                  <span style={{fontWeight:"900",color:"#fbbf24",fontFamily:"monospace",fontSize:"0.88rem"}}>Rs.{grandTotalDue.toLocaleString()}</span>
                </div>}
              </div>

              {isAnnual&&annualDiscount<0&&(
                <div style={{marginTop:"10px",background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:"8px",padding:"8px 12px",fontSize:"0.7rem",color:"#4ade80",fontWeight:"700"}}>
                  🎉 You save Rs.{Math.abs(annualDiscount).toLocaleString()} with Annual plan
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button onClick={printReceiptGen} style={{padding:"13px",borderRadius:"12px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"800",fontSize:"0.88rem",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"8px",boxShadow:`0 4px 20px rgba(212,175,55,0.3)`,justifyContent:"center"}}>
              🖨️ Print Receipt (2 Copies)
            </button>
            <button onClick={saveReceipt} disabled={saveStatus==="saving"} style={{padding:"12px",borderRadius:"12px",border:`1px solid ${saveStatus==="saved"?"rgba(74,222,128,0.5)":saveStatus==="error"?"rgba(248,113,113,0.5)":"rgba(99,202,183,0.4)"}`,background:saveStatus==="saved"?"rgba(74,222,128,0.12)":saveStatus==="error"?"rgba(248,113,113,0.08)":"rgba(99,202,183,0.08)",color:saveStatus==="saved"?"#4ade80":saveStatus==="error"?"#f87171":"#63cab7",fontWeight:"800",fontSize:"0.85rem",cursor:saveStatus==="saving"?"wait":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"8px",justifyContent:"center",opacity:saveStatus==="saving"?0.7:1}}>
              {saveStatus==="saving"?"⏳ Saving...":saveStatus==="saved"?"✅ Saved to Ledger!":saveStatus==="error"?"❌ Save Failed — Retry":"💾 Save to Ledger"}
            </button>
            {saveStatus==="error"&&saveError&&<div style={{fontSize:"0.62rem",color:"#f87171",textAlign:"center",padding:"5px 8px",background:"rgba(248,113,113,0.07)",borderRadius:"7px",wordBreak:"break-all"}}>{saveError}</div>}
            {isAnnual&&<div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.3)",textAlign:"center"}}>Annual breakdown included in print</div>}

          </div>{/* end RIGHT */}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ FEE MANAGEMENT ══ */}
      {activeTab==="fees"&&<div>
      {/* Compact toolbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"8px"}}>
        <div style={{fontSize:"0.7rem",fontWeight:"700",color:"rgba(212,175,55,0.7)",letterSpacing:"0.08em"}}>💰 FEE ENTRIES — {fees.length} records</div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <label style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"10px",border:"1px solid rgba(99,202,183,0.4)",background:"rgba(99,202,183,0.06)",color:"#63cab7",fontWeight:"700",fontSize:"0.76rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
            <span className="material-symbols-rounded" style={{fontSize:"16px"}}>upload_file</span>CSV
            <input type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleBulkCSV}/>
          </label>
          <button onClick={()=>setBulkShow(!bulkShow)} style={{padding:"8px 12px",borderRadius:"10px",border:"1px solid rgba(99,202,183,0.25)",background:"transparent",color:"rgba(99,202,183,0.7)",fontWeight:"600",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>? Format</button>
          <button onClick={()=>setShow(!show)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 18px",borderRadius:"10px",border:`1px solid ${G}`,background:show?"rgba(212,175,55,0.15)":"transparent",color:G,fontWeight:"700",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
            <span className="material-symbols-rounded" style={{fontSize:"18px"}}>{show?"close":"add_circle"}</span>{show?"Cancel":"+ New Fee"}
          </button>
        </div>
      </div>

      {/* CSV Format Guide */}
      {bulkShow&&<div style={{background:"rgba(99,202,183,0.08)",border:"1px solid rgba(99,202,183,0.3)",borderRadius:"12px",padding:"16px 20px",marginBottom:"16px",fontSize:"0.78rem",color:"#63cab7"}}>
        <div style={{fontWeight:"700",marginBottom:"8px"}}>📄 CSV فائل کا format (کوما سے الگ):</div>
        <code style={{display:"block",background:"rgba(0,0,0,0.3)",padding:"10px",borderRadius:"8px",color:"#a3e6dc",direction:"ltr",fontFamily:"monospace",lineHeight:"1.8"}}>
          student_name,amount,type,YYYY-MM<br/>
          Ahmad Ali,3000,monthly,2024-04<br/>
          Bilal Khan,2500,monthly,2024-04<br/>
          Sara Noor,3000,admission,
        </code>
        <div style={{marginTop:"8px",opacity:0.7}}>• پہلی row header ہو سکتی ہے (خود پہچانے گا) • type: monthly/admission/exam/hostel • YYYY-MM optional</div>
      </div>}

      {/* Bulk Result */}
      {bulkResult&&<div style={{background: bulkResult.skip===0?"rgba(74,222,128,0.1)":"rgba(251,146,60,0.1)",border:`1px solid ${bulkResult.skip===0?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`,borderRadius:"12px",padding:"14px 18px",marginBottom:"16px",fontSize:"0.8rem"}}>
        <span style={{color:"#4ade80",fontWeight:"700"}}>✅ {bulkResult.ok} کامیاب</span>
        {bulkResult.skip>0&&<span style={{color:"#fb923c",fontWeight:"700",marginLeft:"16px"}}>⚠️ {bulkResult.skip} ناکام</span>}
        {bulkResult.errs.length>0&&<div style={{marginTop:"8px",color:"#fca5a5",fontSize:"0.72rem"}}>{bulkResult.errs.slice(0,5).join(" • ")}</div>}
        <button onClick={()=>setBulkResult(null)} style={{marginLeft:"16px",background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:"0.75rem"}}>✕</button>
      </div>}

      {/* Overdue Alert Banner */}
      {overdueFees.length>0&&<div style={{background:"rgba(220,38,38,0.1)",border:"2px solid rgba(220,38,38,0.4)",borderRadius:"14px",padding:"14px 18px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"14px"}}>
        <span style={{fontSize:"1.6rem"}}>🚨</span>
        <div style={{flex:1}}>
          <div style={{fontSize:"0.82rem",fontWeight:"800",color:"#f87171"}}>Overdue Fees Alert!</div>
          <div style={{fontSize:"0.68rem",color:"rgba(248,113,113,0.75)",marginTop:"2px"}}>{overdueFees.length} fee {overdueFees.length===1?"entry":"entries"} past due — total Rs. {totalOverdue.toLocaleString()}</div>
        </div>
        <button onClick={()=>setFilterStatus("overdue")} style={{padding:"7px 16px",borderRadius:"10px",border:"1px solid rgba(220,38,38,0.5)",background:"rgba(220,38,38,0.2)",color:"#f87171",fontWeight:"700",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",whiteSpace:"nowrap"}}>View Overdue</button>
      </div>}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"14px",marginBottom:"24px"}}>
        {[
          {icon:"alarm",label:"Overdue",val:overdueFees.length,color:"#f87171"},
          {icon:"warning",label:"Pending Amount",val:`Rs. ${totalPending.toLocaleString()}`,color:"#fb923c"},
          {icon:"check_circle",label:"Collected",val:`Rs. ${totalPaid.toLocaleString()}`,color:"#4ade80"},
          {icon:"receipt_long",label:"Total Entries",val:fees.length,color:G},
        ].map(s=>(
          <div key={s.label} className="hv-stat" style={{...glass,padding:"18px 16px",display:"flex",alignItems:"center",gap:"14px"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"10px",background:`${s.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span className="material-symbols-rounded" style={{fontSize:"22px",color:s.color}}>{s.icon}</span>
            </div>
            <div><div style={{fontSize:"1.1rem",fontWeight:"800",color:"#f1f5f9",lineHeight:1.1}}>{s.val}</div><div style={{fontSize:"0.65rem",color:"rgba(241,245,249,0.45)",marginTop:"3px"}}>{s.label}</div></div>
          </div>
        ))}
      </div>
      {/* Add Form */}
      {show&&(
        <div style={{...glass,padding:"24px",marginBottom:"24px",borderColor:"rgba(212,175,55,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
            <span className="material-symbols-rounded" style={{color:G,fontSize:"22px"}}>add_circle</span>
            <span style={{color:G,fontWeight:"700",fontSize:"1rem"}}>New Fee Entry</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
            <div><label style={lbl}>Student *</label><select style={inp} value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="" style={{background:N2}}>-- Select --</option>{students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{sLabel(s)}</option>)}</select></div>
            <div><label style={lbl}>Type</label><select style={inp} value={f.feeType} onChange={e=>setF({...f,feeType:e.target.value})}>{Object.entries(feeTypes).map(([k,v])=><option key={k} value={k} style={{background:N2}}>{v}</option>)}</select></div>
            <div><label style={lbl}>Amount (Rs) *</label><input style={{...inp,direction:"ltr"}} type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
            <div><label style={lbl}>Month</label><input style={{...inp,direction:"ltr"}} type="month" value={f.month} onChange={e=>setF({...f,month:e.target.value})}/></div>
            <div><label style={lbl}>Due Date</label><input style={{...inp,direction:"ltr"}} type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})}/></div>
            <div><label style={lbl}>Status</label><select style={inp} value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="pending" style={{background:N2}}>Pending</option><option value="paid" style={{background:N2}}>Paid</option></select></div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>Notes</label><input style={inp} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="نوٹس"/></div>
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
            <button onClick={()=>setShow(false)} style={{padding:"10px 20px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(241,245,249,0.6)",fontWeight:"600",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>Cancel</button>
            <button onClick={add} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",borderRadius:"10px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>
              <span className="material-symbols-rounded" style={{fontSize:"18px"}}>save</span>Save
            </button>
          </div>
        </div>
      )}
      {/* Search & Filter */}
      <div style={{...glass,padding:"14px 18px",marginBottom:"20px",display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:1,minWidth:"200px",position:"relative"}}>
          <span className="material-symbols-rounded" style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",color:"rgba(212,175,55,0.6)",fontSize:"20px",pointerEvents:"none"}}>search</span>
          <input style={{...inp,paddingRight:"40px"}} placeholder="Search by name or code..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        {[["all","سب"],["pending","باقی"],["paid","ادا"],["overdue","Overdue 🚨"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterStatus(v)} style={{padding:"9px 16px",borderRadius:"9px",border:`1px solid ${filterStatus===v?(v==="overdue"?"rgba(220,38,38,0.6)":G):"rgba(255,255,255,0.1)"}`,background:filterStatus===v?(v==="overdue"?"rgba(220,38,38,0.2)":"rgba(212,175,55,0.15)"):"transparent",color:filterStatus===v?(v==="overdue"?"#f87171":G):"rgba(241,245,249,0.5)",fontWeight:filterStatus===v?"700":"500",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}}>{l}</button>
        ))}
        <div style={{color:"rgba(241,245,249,0.35)",fontSize:"0.72rem"}}>{filtered.length} Results</div>
      </div>
      {/* Table */}
      <div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
          {["Receipt No.","Student","Type","Amount","Month","Status","Action"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:"0.68rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>{h}</th>)}
        </tr></thead>
        <tbody>{filtered.length===0&&<tr><td colSpan="7"><EmptyState icon="💰" title="کوئی فیس ریکارڈ نہیں" subtitle={fees.length===0?"ابھی کوئی فیس اندراج نہیں — اوپر New Fee Entry سے شامل کریں":"فلٹر سے کوئی نتیجہ نہیں ملا"} compact/></td></tr>}
        {filtered.map((fee,i)=>{ const st=students.find(s=>s.id===fee.studentId); const paid=fee.status==="paid"; const od=isOverdue(fee); return (
          <tr key={fee.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:od?"rgba(220,38,38,0.06)":i%2===0?"rgba(255,255,255,0.02)":"transparent",borderLeft:od?"3px solid rgba(220,38,38,0.5)":"3px solid transparent"}}>
            <td style={{padding:"11px 16px",fontFamily:"'Courier New',monospace",fontWeight:"700",color:G,fontSize:"0.72rem",letterSpacing:"0.04em",direction:"ltr",whiteSpace:"nowrap"}}>{fee.receipt_no||"—"}</td>
            <td style={{padding:"11px 16px",fontWeight:"700",color:"#f1f5f9",fontSize:"0.82rem"}}>{st?.name||"—"}{od&&<span style={{marginLeft:"6px",fontSize:"0.55rem",padding:"1px 6px",borderRadius:"10px",background:"rgba(220,38,38,0.2)",color:"#f87171",fontWeight:"700",verticalAlign:"middle"}}>Overdue</span>}</td>
            <td style={{padding:"11px 16px",color:"rgba(241,245,249,0.6)",fontSize:"0.75rem"}}>{feeTypes[fee.type||fee.feeType]||fee.type||fee.feeType}</td>
            <td style={{padding:"11px 16px",fontWeight:"800",color:od?"#f87171":G,fontSize:"0.85rem",direction:"ltr"}}>Rs. {(fee.amount||0).toLocaleString()}</td>
            <td style={{padding:"11px 16px",direction:"ltr",fontFamily:"monospace",color:"rgba(241,245,249,0.45)",fontSize:"0.68rem"}}>{fee.month||"—"}</td>
            <td style={{padding:"11px 16px"}}>
              {od?<span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"700",background:"rgba(220,38,38,0.18)",color:"#f87171",border:"1px solid rgba(220,38,38,0.4)"}}>🚨 Overdue</span>
              :<span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"0.62rem",fontWeight:"700",background:paid?"rgba(74,222,128,0.15)":"rgba(251,146,60,0.15)",color:paid?"#4ade80":"#fb923c",border:`1px solid ${paid?"rgba(74,222,128,0.3)":"rgba(251,146,60,0.3)"}`}}>{paid?"ادا":"باقی"}</span>}
            </td>
            <td style={{padding:"11px 16px",display:"flex",gap:"6px",alignItems:"center"}}>
              {!paid&&<button onClick={()=>markPaid(fee.id)} style={{padding:"6px 14px",borderRadius:"8px",border:"none",background:`linear-gradient(135deg,${G},#b8960a)`,color:N,fontWeight:"700",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif"}} className="ur">ادا ✓</button>}
              {paid&&<button onClick={()=>printReceipt(fee)} style={{padding:"6px 12px",borderRadius:"8px",border:"1px solid rgba(74,222,128,0.4)",background:"rgba(74,222,128,0.12)",color:"#4ade80",fontWeight:"700",fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Public Sans',sans-serif",display:"flex",alignItems:"center",gap:"4px"}}>🖨️ Receipt</button>}
            </td>
          </tr>
        ); })}
        {filtered.length===0&&<tr><td colSpan={7} style={{padding:"50px",textAlign:"center",color:"rgba(241,245,249,0.3)"}}>
          <span className="material-symbols-rounded" style={{fontSize:"40px",display:"block",marginBottom:"10px",color:"rgba(212,175,55,0.2)"}}>payments</span><span className="ur">کوئی اندراج نہیں</span>
        </td></tr>}
        </tbody>
      </table></div></div>

      </div>}{/* end activeTab==="fees" */}

      {/* ══════════════════════════════════════════ FEE LEDGER ══════════════════ */}
      {activeTab==="ledger"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",flexWrap:"wrap",gap:"8px"}}>
            <div style={{fontSize:"0.7rem",fontWeight:"700",color:"rgba(212,175,55,0.7)",letterSpacing:"0.08em"}}>📖 LEDGER — {feeReceipts.length} receipts saved</div>
            <div style={{fontSize:"0.72rem",color:"rgba(241,245,249,0.45)"}}>
              Collected: <span style={{color:"#4ade80",fontWeight:"700"}}>Rs. {feeReceipts.reduce((s,r)=>s+(Number(r.amount_paid)||0),0).toLocaleString()}</span>
              &nbsp;·&nbsp; Balance: <span style={{color:"#f87171",fontWeight:"700"}}>Rs. {feeReceipts.reduce((s,r)=>s+(Number(r.balance_due)||0),0).toLocaleString()}</span>
            </div>
          </div>
          {feeReceipts.length===0
            ?<div style={{...glass,padding:"60px",textAlign:"center"}}><span style={{fontSize:"3rem",display:"block",marginBottom:"12px"}}>📖</span><div style={{color:"rgba(241,245,249,0.5)",fontSize:"0.9rem"}}>No receipts saved yet — generate a receipt and click "Save to Ledger"</div></div>
            :<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:"900px"}}>
                <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>
                  {["#","Date","Student","Father","Class","Month","Tuition","Transport","Books","Exam","Canteen","Total","Paid","Balance"].map(h=>(
                    <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:"0.62rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[...feeReceipts].sort((a,b)=>(b.receipt_no||0)-(a.receipt_no||0)).map((r,i)=>{
                    const bal=Number(r.balance_due)||0;
                    return(
                      <tr key={r.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:bal>0?"rgba(248,113,113,0.04)":i%2===0?"rgba(255,255,255,0.02)":"transparent",borderLeft:bal>0?"3px solid rgba(248,113,113,0.4)":"3px solid transparent"}}>
                        <td style={{padding:"9px 12px",fontFamily:"monospace",color:G,fontWeight:"700",fontSize:"0.75rem"}}>#{r.receipt_no||"—"}</td>
                        <td style={{padding:"9px 12px",fontSize:"0.72rem",color:"rgba(241,245,249,0.55)",whiteSpace:"nowrap"}}>{r.date||"—"}</td>
                        <td style={{padding:"9px 12px",fontWeight:"700",color:"#f1f5f9",fontSize:"0.78rem",whiteSpace:"nowrap"}}>{r.student_name||"—"}</td>
                        <td style={{padding:"9px 12px",fontSize:"0.72rem",color:"rgba(241,245,249,0.5)",whiteSpace:"nowrap"}}>{r.father_name||"—"}</td>
                        <td style={{padding:"9px 12px",fontSize:"0.72rem",color:"rgba(212,175,55,0.7)",whiteSpace:"nowrap"}}>{r.class||"—"}</td>
                        <td style={{padding:"9px 12px",fontSize:"0.72rem",color:"rgba(241,245,249,0.55)",whiteSpace:"nowrap"}}>{r.month_period||"—"}</td>
                        {["tuition_fee","transport_fee","books_fee","exam_fee","canteen_fee","total_amount"].map(k=>(
                          <td key={k} style={{padding:"9px 12px",fontSize:"0.72rem",color:"rgba(241,245,249,0.6)",fontFamily:"monospace",textAlign:"right"}}>
                            {Number(r[k])||0?`${(Number(r[k])||0).toLocaleString()}`:"—"}
                          </td>
                        ))}
                        <td style={{padding:"9px 12px",fontWeight:"800",color:"#4ade80",fontSize:"0.78rem",fontFamily:"monospace",textAlign:"right"}}>{(Number(r.amount_paid)||0).toLocaleString()}</td>
                        <td style={{padding:"9px 12px",fontWeight:"800",color:bal>0?"#f87171":"#4ade80",fontSize:"0.78rem",fontFamily:"monospace",textAlign:"right"}}>{bal.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot><tr style={{background:"rgba(212,175,55,0.06)",borderTop:"2px solid rgba(212,175,55,0.2)"}}>
                  <td colSpan={11} style={{padding:"10px 12px",fontWeight:"700",color:"rgba(212,175,55,0.7)",fontSize:"0.72rem"}}>TOTALS ({feeReceipts.length} receipts)</td>
                  <td style={{padding:"10px 12px",fontWeight:"900",color:G,fontFamily:"monospace",textAlign:"right",fontSize:"0.82rem"}}>{feeReceipts.reduce((s,r)=>s+(Number(r.total_amount)||0),0).toLocaleString()}</td>
                  <td style={{padding:"10px 12px",fontWeight:"900",color:"#4ade80",fontFamily:"monospace",textAlign:"right",fontSize:"0.82rem"}}>{feeReceipts.reduce((s,r)=>s+(Number(r.amount_paid)||0),0).toLocaleString()}</td>
                  <td style={{padding:"10px 12px",fontWeight:"900",color:"#f87171",fontFamily:"monospace",textAlign:"right",fontSize:"0.82rem"}}>{feeReceipts.reduce((s,r)=>s+(Number(r.balance_due)||0),0).toLocaleString()}</td>
                </tr></tfoot>
              </table>
            </div></div>
          }
        </div>
      )}

      {/* ══════════════════════════════════════ OUTSTANDING TRACKER ═════════════ */}
      {activeTab==="tracker"&&(()=>{
        const months12=["January","February","March","April","May","June","July","August","September","October","November","December"];
        const activeStudents=students.filter(s=>!s.status||s.status==="Active");
        return(
          <div>
            <div style={{marginBottom:"14px",fontSize:"0.7rem",fontWeight:"700",color:"rgba(212,175,55,0.7)",letterSpacing:"0.08em"}}>
              ✅ OUTSTANDING TRACKER — {activeStudents.length} students &nbsp;·&nbsp; <span style={{color:"rgba(241,245,249,0.4)",fontWeight:"500"}}>✔ fully paid · ⚠ partial · blank = unpaid</span>
            </div>
            {activeStudents.length===0
              ?<div style={{...glass,padding:"60px",textAlign:"center"}}><span style={{fontSize:"3rem"}}>👥</span><div style={{color:"rgba(241,245,249,0.5)",marginTop:"12px"}}>No active students found</div></div>
              :<div style={{...glass,overflow:"hidden"}}><div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:"900px"}}>
                  <thead>
                    <tr style={{background:"rgba(255,255,255,0.04)"}}>
                      <th style={{padding:"10px 12px",textAlign:"left",fontSize:"0.62rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)",whiteSpace:"nowrap"}}>Student</th>
                      <th style={{padding:"10px 12px",textAlign:"left",fontSize:"0.62rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>Class</th>
                      {months12.map(m=><th key={m} style={{padding:"8px 6px",textAlign:"center",fontSize:"0.58rem",fontWeight:"700",color:"rgba(212,175,55,0.8)",borderBottom:"1px solid rgba(255,255,255,0.08)",whiteSpace:"nowrap"}}>{m.slice(0,3)}</th>)}
                      <th style={{padding:"10px 8px",textAlign:"center",fontSize:"0.62rem",fontWeight:"700",color:"#4ade80",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>Paid</th>
                      <th style={{padding:"10px 8px",textAlign:"center",fontSize:"0.62rem",fontWeight:"700",color:"#f87171",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStudents.map((st,si)=>{
                      const stReceipts=feeReceipts.filter(r=>r.student_id===st.id&&r.payment_type!=="Annual");
                      let paidCount=0;
                      return(
                        <tr key={st.id} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",background:si%2===0?"rgba(255,255,255,0.02)":"transparent"}}>
                          <td style={{padding:"9px 12px",fontWeight:"700",color:"#f1f5f9",fontSize:"0.78rem",whiteSpace:"nowrap"}}>{st.name}</td>
                          <td style={{padding:"9px 12px",fontSize:"0.72rem",color:"rgba(212,175,55,0.7)",whiteSpace:"nowrap"}}>{st.grade||"—"}</td>
                          {months12.map(m=>{
                            const mr=stReceipts.find(r=>r.month_period===m);
                            const bal=Number(mr?.balance_due)||0;
                            const paid=mr&&bal===0;
                            const partial=mr&&bal>0;
                            if(paid)paidCount++;
                            return(
                              <td key={m} style={{padding:"6px",textAlign:"center"}}>
                                {paid&&<span title={`Rs.${(Number(mr.amount_paid)||0).toLocaleString()} paid`} style={{fontSize:"0.85rem",cursor:"default"}}>✔</span>}
                                {partial&&<span title={`Partial — Rs.${bal.toLocaleString()} balance`} style={{fontSize:"0.75rem",color:"#fbbf24",cursor:"default"}}>⚠</span>}
                              </td>
                            );
                          })}
                          <td style={{padding:"9px 8px",textAlign:"center",fontWeight:"800",color:"#4ade80",fontSize:"0.78rem"}}>{paidCount}</td>
                          <td style={{padding:"9px 8px",textAlign:"center",fontWeight:"800",color:12-paidCount>0?"#f87171":"#4ade80",fontSize:"0.78rem"}}>{12-paidCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div></div>
            }
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════ ANALYTICS DASHBOARD ══════════ */}
      {activeTab==="analytics"&&(()=>{
        const totalReceipts=feeReceipts.length;
        const totalCollected=feeReceipts.reduce((s,r)=>s+(Number(r.amount_paid)||0),0);
        const totalBalance=feeReceipts.reduce((s,r)=>s+(Number(r.balance_due)||0),0);
        const totalBilled=feeReceipts.reduce((s,r)=>s+(Number(r.total_amount)||0),0);
        const classes=["Play Group","Nursery","KG","1st","2nd","3rd","4th"];
        const months12=["January","February","March","April","May","June","July","August","September","October","November","December","Full Year"];
        const byClass=classes.map(c=>{
          const recs=feeReceipts.filter(r=>r.class===c);
          return{label:c,count:recs.length,collected:recs.reduce((s,r)=>s+(Number(r.amount_paid)||0),0),balance:recs.reduce((s,r)=>s+(Number(r.balance_due)||0),0)};
        }).filter(x=>x.count>0);
        const byMonth=months12.map(m=>{
          const recs=feeReceipts.filter(r=>r.month_period===m);
          return{label:m,count:recs.length,collected:recs.reduce((s,r)=>s+(Number(r.amount_paid)||0),0),balance:recs.reduce((s,r)=>s+(Number(r.balance_due)||0),0)};
        }).filter(x=>x.count>0);
        const maxCollected=Math.max(1,...byMonth.map(x=>x.collected));
        return(
          <div>
            <div style={{marginBottom:"16px",fontSize:"0.7rem",fontWeight:"700",color:"rgba(212,175,55,0.7)",letterSpacing:"0.08em"}}>📊 ANALYTICS — based on {totalReceipts} saved receipts</div>
            {/* Summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"14px",marginBottom:"28px"}}>
              {[
                {icon:"receipt_long",label:"Total Receipts",val:totalReceipts,color:G},
                {icon:"payments",label:"Total Billed",val:`Rs. ${totalBilled.toLocaleString()}`,color:"rgba(241,245,249,0.7)"},
                {icon:"check_circle",label:"Total Collected",val:`Rs. ${totalCollected.toLocaleString()}`,color:"#4ade80"},
                {icon:"warning",label:"Total Balance Due",val:`Rs. ${totalBalance.toLocaleString()}`,color:"#f87171"},
              ].map(s=>(
                <div key={s.label} className="hv-stat" style={{...glass,padding:"18px 16px",display:"flex",alignItems:"center",gap:"14px"}}>
                  <div style={{width:"40px",height:"40px",borderRadius:"10px",background:`${s.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span className="material-symbols-rounded" style={{fontSize:"22px",color:s.color}}>{s.icon}</span>
                  </div>
                  <div><div style={{fontSize:"1rem",fontWeight:"800",color:"#f1f5f9",lineHeight:1.2}}>{s.val}</div><div style={{fontSize:"0.62rem",color:"rgba(241,245,249,0.4)",marginTop:"3px"}}>{s.label}</div></div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
              {/* By Class */}
              <div style={{...glass,padding:"20px"}}>
                <div style={{color:G,fontWeight:"700",fontSize:"0.9rem",marginBottom:"16px"}}>📚 Collection by Class</div>
                {byClass.length===0?<div style={{color:"rgba(241,245,249,0.3)",fontSize:"0.8rem",textAlign:"center",padding:"20px"}}>No data yet</div>
                :byClass.map(c=>(
                  <div key={c.label} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{minWidth:"70px",fontSize:"0.75rem",fontWeight:"700",color:"rgba(212,175,55,0.8)"}}>{c.label}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"0.68rem",color:"#4ade80",fontWeight:"700"}}>Rs. {c.collected.toLocaleString()} collected</div>
                      {c.balance>0&&<div style={{fontSize:"0.62rem",color:"#f87171"}}>Rs. {c.balance.toLocaleString()} due</div>}
                    </div>
                    <div style={{background:"rgba(255,255,255,0.08)",borderRadius:"10px",padding:"2px 8px",fontSize:"0.62rem",color:"rgba(241,245,249,0.4)"}}>{c.count} rcpt</div>
                  </div>
                ))}
              </div>
              {/* By Month */}
              <div style={{...glass,padding:"20px"}}>
                <div style={{color:G,fontWeight:"700",fontSize:"0.9rem",marginBottom:"16px"}}>📅 Collection by Month</div>
                {byMonth.length===0?<div style={{color:"rgba(241,245,249,0.3)",fontSize:"0.8rem",textAlign:"center",padding:"20px"}}>No data yet</div>
                :byMonth.map(m=>(
                  <div key={m.label} style={{marginBottom:"10px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.72rem",marginBottom:"4px"}}>
                      <span style={{color:"rgba(241,245,249,0.7)",fontWeight:"600"}}>{m.label}</span>
                      <span style={{color:"#4ade80",fontWeight:"700"}}>Rs. {m.collected.toLocaleString()}</span>
                    </div>
                    <div style={{height:"6px",borderRadius:"3px",background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:"3px",background:"linear-gradient(90deg,#4ade80,#16a34a)",width:`${Math.round((m.collected/maxCollected)*100)}%`,transition:"width 0.4s"}}/>
                    </div>
                    {m.balance>0&&<div style={{fontSize:"0.6rem",color:"#f87171",marginTop:"2px"}}>Rs. {m.balance.toLocaleString()} balance</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════ TC GENERATOR ══════════════════════════════════════ */}
      {activeTab==="tc"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
            <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:"22px"}}>📋</span></div>
            <div><h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>Transfer Certificate</h1><p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)"}}>Student leaving school — official TC</p></div>
          </div>
          <div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(59,130,246,0.3)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={lbl2}>Student Select</label>
                <select style={inp2} value={tcSt?.id||""} onChange={e=>{const s=students.find(x=>x.id===e.target.value);setTcSt(s||null);upTc({lastClass:s?.grade||""});}}>
                  <option value="" style={{background:N2}}>-- Select Student --</option>
                  {students.map(s=><option key={s.id} value={s.id} style={{background:N2}}>{s.name} — {s.grade||""} {s.studentCode?`(${s.studentCode})`:""}</option>)}
                </select>
              </div>
              {tcSt&&<div style={{gridColumn:"1/-1",background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:"10px",padding:"12px 16px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",fontSize:"0.8rem"}}>
                {[["Name",tcSt.name],["Father",tcSt.fatherName||"—"],["Class",tcSt.grade||"—"]].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:"0.6rem",color:"rgba(99,130,246,0.8)",fontWeight:"600"}}>{l}</div><div style={{color:"#f1f5f9",fontWeight:"700"}}>{v}</div></div>
                ))}
              </div>}
              <div><label style={lbl2}>SR No</label><input style={inp2} placeholder="e.g. 42" value={tc.srNo} onChange={e=>upTc({srNo:e.target.value})}/></div>
              <div><label style={lbl2}>Issue Date</label><input style={inp2} value={tc.issueDate} onChange={e=>upTc({issueDate:e.target.value})}/></div>
              <div><label style={lbl2}>Date of Admission</label><input style={inp2} placeholder="e.g. 01/04/2022" value={tc.admissionDate} onChange={e=>upTc({admissionDate:e.target.value})}/></div>
              <div><label style={lbl2}>Date of Leaving</label><input style={inp2} value={tc.leavingDate} onChange={e=>upTc({leavingDate:e.target.value})}/></div>
              <div><label style={lbl2}>Class Last Attended</label><input style={inp2} value={tc.lastClass} onChange={e=>upTc({lastClass:e.target.value})}/></div>
              <div><label style={lbl2}>Reason for Leaving</label><input style={inp2} placeholder="e.g. Family relocation" value={tc.reason} onChange={e=>upTc({reason:e.target.value})}/></div>
              <div><label style={lbl2}>Character & Conduct</label>
                <select style={inp2} value={tc.conduct} onChange={e=>upTc({conduct:e.target.value})}>
                  {CONDUCT_OPTS.map(o=><option key={o} style={{background:N2}}>{o}</option>)}
                </select>
              </div>
              <div><label style={lbl2}>Remarks</label><input style={inp2} placeholder="Optional" value={tc.remarks} onChange={e=>upTc({remarks:e.target.value})}/></div>
            </div>
            <div style={{marginTop:"20px",textAlign:"center"}}>
              <button onClick={printTC} style={{padding:"13px 36px",borderRadius:"12px",border:"none",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",fontWeight:"800",fontSize:"0.95rem",cursor:"pointer",fontFamily:"inherit"}}>🖨️ Print Transfer Certificate</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ SALARY SLIP ═══════════════════════════════════════ */}
      {activeTab==="salary"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
            <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:"22px"}}>💼</span></div>
            <div><h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>Salary Slip Generator</h1><p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)"}}>Teacher/Staff monthly salary slip</p></div>
          </div>
          <div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(16,185,129,0.3)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"14px"}}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={lbl2}>Teacher / Staff Select</label>
                <select style={inp2} value={slTeacher?.id||""} onChange={e=>{const t=teachers.find(x=>x.id===e.target.value);setSlTeacher(t||null);}}>
                  <option value="" style={{background:N2}}>-- Select --</option>
                  {teachers.map(t=><option key={t.id} value={t.id} style={{background:N2}}>{t.name} — {t.subject||""}</option>)}
                </select>
              </div>
              <div><label style={lbl2}>Month</label><select style={inp2} value={sl.month} onChange={e=>upSl({month:e.target.value})}>{MONTHS.map(m=><option key={m} style={{background:N2}}>{m}</option>)}</select></div>
              <div><label style={lbl2}>Year</label><input style={inp2} value={sl.year} onChange={e=>upSl({year:e.target.value})}/></div>
              <div><label style={lbl2}>Basic Pay (Rs)</label><input style={{...inp2,color:"#4ade80",fontWeight:"700"}} type="number" value={sl.basicPay} onChange={e=>upSl({basicPay:e.target.value})}/></div>
            </div>
            <div style={{marginTop:"16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
              <div style={{background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:"10px",padding:"14px"}}>
                <div style={{color:"#4ade80",fontWeight:"700",fontSize:"0.75rem",marginBottom:"10px"}}>💰 ALLOWANCES</div>
                {[["houseRent","House Rent"],["transport","Transport"],["medical","Medical"],["other","Other"]].map(([k,l])=>(
                  <div key={k} style={{marginBottom:"10px"}}><label style={{...lbl2,color:"rgba(74,222,128,0.7)"}}>{l} (Rs)</label><input style={inp2} type="number" min={0} value={sl[k]} onChange={e=>upSl({[k]:e.target.value})}/></div>
                ))}
                <div style={{color:"#4ade80",fontWeight:"800",fontSize:"0.9rem",borderTop:"1px solid rgba(74,222,128,0.2)",paddingTop:"8px"}}>Gross: Rs. {slGross.toLocaleString()}</div>
              </div>
              <div style={{background:"rgba(248,113,113,0.05)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:"10px",padding:"14px"}}>
                <div style={{color:"#f87171",fontWeight:"700",fontSize:"0.75rem",marginBottom:"10px"}}>➖ DEDUCTIONS</div>
                {[["absentDays","Absent Days"],["advance","Advance Recovery (Rs)"]].map(([k,l])=>(
                  <div key={k} style={{marginBottom:"10px"}}><label style={{...lbl2,color:"rgba(248,113,113,0.7)"}}>{l}</label><input style={inp2} type="number" min={0} value={sl[k]} onChange={e=>upSl({[k]:e.target.value})}/></div>
                ))}
                <div style={{color:"#f87171",fontWeight:"800",fontSize:"0.9rem",borderTop:"1px solid rgba(248,113,113,0.2)",paddingTop:"8px"}}>Deductions: Rs. {slDeduct.toLocaleString()}</div>
              </div>
            </div>
            <div style={{marginTop:"16px",background:"rgba(212,175,55,0.08)",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"10px",padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><label style={lbl2}>Remarks</label><input style={{...inp2,width:"300px"}} placeholder="Optional" value={sl.remarks} onChange={e=>upSl({remarks:e.target.value})}/></div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"0.7rem",color:"rgba(212,175,55,0.7)"}}>NET PAYABLE</div>
                <div style={{fontSize:"1.8rem",fontWeight:"900",color:G}}>Rs. {slNet.toLocaleString()}</div>
                <button onClick={printSalarySlip} style={{marginTop:"8px",padding:"12px 28px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",fontWeight:"800",fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit"}}>🖨️ Print Salary Slip</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ ID CARD ════════════════════════════════════════════ */}
      {activeTab==="idcard"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
            <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"linear-gradient(135deg,#8b5cf6,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:"22px"}}>💳</span></div>
            <div><h1 style={{margin:0,fontSize:"1.5rem",fontWeight:"800",color:"#f1f5f9"}}>ID Card Generator</h1><p style={{margin:0,fontSize:"0.75rem",color:"rgba(212,175,55,0.7)"}}>Student ya Staff ID card — A4 per 8 cards</p></div>
          </div>
          <div style={{...glass,padding:"24px",marginBottom:"20px",borderColor:"rgba(139,92,246,0.3)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"14px",marginBottom:"16px"}}>
              <div>
                <label style={lbl2}>Card Type</label>
                <select style={inp2} value={idType} onChange={e=>{setIdType(e.target.value);setIdPerson(null);}}>
                  <option value="student" style={{background:N2}}>👨‍🎓 Student</option>
                  <option value="teacher" style={{background:N2}}>👨‍🏫 Teacher / Staff</option>
                </select>
              </div>
              <div>
                <label style={lbl2}>Select Person (optional — blank = all)</label>
                <select style={inp2} value={idPerson?.id||""} onChange={e=>{const list=idType==="student"?students:teachers;setIdPerson(list.find(x=>x.id===e.target.value)||null);}}>
                  <option value="" style={{background:N2}}>-- Print All (batch) --</option>
                  {(idType==="student"?students:teachers).map(p=><option key={p.id} value={p.id} style={{background:N2}}>{p.name}</option>)}
                </select>
              </div>
              <div><label style={lbl2}>Blood Group</label><input style={inp2} placeholder="e.g. O+" value={idExtra.bloodGroup} onChange={e=>upId({bloodGroup:e.target.value})}/></div>
            </div>
            {/* Preview card */}
            <div style={{background:"rgba(139,92,246,0.05)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:"10px",padding:"16px",marginBottom:"16px"}}>
              <div style={{fontSize:"0.7rem",color:"rgba(139,92,246,0.8)",fontWeight:"700",marginBottom:"10px"}}>👁️ PREVIEW (first card)</div>
              <div style={{background:"linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)",borderRadius:"8px",overflow:"hidden",maxWidth:"280px",color:"#fff",fontFamily:"'Segoe UI',Arial,sans-serif"}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 10px",borderBottom:"1px solid rgba(255,255,255,0.15)",background:"rgba(0,0,0,0.2)"}}>
                  <div style={{fontSize:"0.6rem",fontWeight:"900",color:"#ffd700"}}>AMEEN ISLAMIC INSTITUTE &nbsp;|&nbsp; {idType==="student"?"STUDENT ID":"STAFF ID"}</div>
                </div>
                <div style={{display:"flex",padding:"8px 10px",gap:"10px",alignItems:"center"}}>
                  <div style={{width:"40px",height:"48px",border:"2px solid rgba(255,255,255,0.3)",borderRadius:"4px",background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",flexShrink:0}}>👤</div>
                  <div>
                    <div style={{fontSize:"0.8rem",fontWeight:"900",color:"#ffd700"}}>{idPerson?.name||"Student Name"}</div>
                    <div style={{fontSize:"0.65rem",opacity:0.75}}>{idPerson?.grade||idPerson?.subject||"Class / Subject"}</div>
                    <div style={{fontSize:"0.65rem",fontFamily:"monospace",color:"#ffd700"}}>{idPerson?.studentCode||idPerson?.employeeCode||"AII-2026-XXX"}</div>
                    {idExtra.bloodGroup&&<div style={{fontSize:"0.6rem",color:"#f87171"}}>🩸 {idExtra.bloodGroup}</div>}
                  </div>
                </div>
                <div style={{background:"rgba(0,0,0,0.3)",padding:"4px 10px",display:"flex",justifyContent:"space-between",fontSize:"0.55rem",opacity:0.7}}>
                  <span>📞 {idPerson?.phone||"—"}</span><span>Session: 2026</span>
                </div>
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <button onClick={printIDCards} style={{padding:"13px 36px",borderRadius:"12px",border:"none",background:"linear-gradient(135deg,#8b5cf6,#6d28d9)",color:"#fff",fontWeight:"800",fontSize:"0.95rem",cursor:"pointer",fontFamily:"inherit"}}>
                🖨️ Print {idPerson?"1 ID Card":"All ID Cards (batch)"}
              </button>
              <div style={{marginTop:"8px",fontSize:"0.65rem",color:"rgba(255,255,255,0.3)"}}>Credit card size (85×54mm) — 8 cards per A4</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Receipt print area (hidden on screen, visible on print) ── */}
      <div id="fee-receipt-print-area" style={{position:"absolute",left:"-9999px",top:0,width:"210mm"}}>
        {selectedFee&&(()=>{
          const st=students.find(s=>s.id===selectedFee.studentId);
          const receiptNo=selectedFee.receipt_no||selectedFee.id?.slice(0,8).toUpperCase()||"—";
          const dateStr=selectedFee.date||selectedFee.created_at?.slice(0,10)||new Date().toISOString().slice(0,10);
          return (
            <div style={{background:"#fff",padding:"0",fontFamily:"'Segoe UI',Arial,serif",direction:"ltr",color:"#0f172a"}}>
              {/* Letterhead */}
              <img src={letterhead} alt="" style={{width:"100%",display:"block"}}/>

              {/* Receipt title */}
              <div style={{textAlign:"center",padding:"18px 40px 10px",borderBottom:"2px solid #b7860b"}}>
                <div style={{fontSize:"1.3rem",fontWeight:"800",color:"#7a5807",fontFamily:"'Noto Nastaliq Urdu',serif"}}>فیس رسید</div>
                <div style={{fontSize:"0.75rem",color:"#888",fontFamily:"'Public Sans',sans-serif",marginTop:"2px"}}>Ameen Islamic Institute</div>
              </div>

              {/* Receipt details table */}
              <div style={{padding:"24px 48px"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.88rem"}}>
                  <tbody>
                    {[
                      ["رسید نمبر",   receiptNo,          true],
                      ["تاریخ",               dateStr,            true],
                      ["طالب علم",  st?.name||"—",      false],
                      ["جماعت",              st?.grade||"—",     false],
                      ["فیس مہینہ",          selectedFee.month||"—", false],
                      ["فیس کی قسم",      feeTypes[selectedFee.feeType]||selectedFee.feeType||"—", false],
                      ["رقم",               `Rs. ${(selectedFee.amount||0).toLocaleString()}`, true],
                      ["حیثیت",           "✅ ادا", false],
                    ].map(([label,val,mono],i)=>(
                      <tr key={i} style={{background:i%2===0?"#fffdf8":"#fff"}}>
                        <td style={{padding:"10px 14px",fontWeight:"700",color:"#7a5807",width:"45%",borderBottom:"1px solid #f5e9c8",fontSize:"0.82rem"}}>{label}</td>
                        <td style={{padding:"10px 14px",color:"#1e293b",borderBottom:"1px solid #f5e9c8",fontFamily:mono?"'Courier New',monospace":"inherit",fontWeight:mono?"800":"500",direction:"ltr",textAlign:"left",fontSize:"0.85rem"}}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Amount in words placeholder */}
                <div style={{margin:"18px 0",padding:"12px 16px",background:"#fffdf8",border:"1px solid #f5e9c8",borderRadius:"8px",fontSize:"0.78rem",color:"#555"}}>
                  <span style={{fontWeight:"700",color:"#7a5807",fontFamily:"'Noto Nastaliq Urdu',serif"}}>الفاظ میں: </span>
                  <span style={{direction:"ltr",display:"inline-block"}}>{(selectedFee.amount||0).toLocaleString()}</span>
                </div>

                {/* Signature lines */}
                <div style={{display:"flex",justifyContent:"space-between",marginTop:"48px",paddingTop:"8px"}}>
                  <div style={{textAlign:"center",minWidth:"160px"}}>
                    <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.75rem",color:"#444",fontWeight:"600",fontFamily:"'Noto Nastaliq Urdu',serif",direction:"rtl"}}>کیشیئر کا دستخط</div>
                  </div>
                  <div style={{textAlign:"center",minWidth:"160px"}}>
                    <div style={{borderTop:"1.5px solid #0f172a",paddingTop:"8px",fontSize:"0.75rem",color:"#444",fontWeight:"600",fontFamily:"'Noto Nastaliq Urdu',serif",direction:"rtl"}}>پرنسپل کا دستخط</div>
                  </div>
                </div>

                {/* Footer note */}
                <div style={{marginTop:"32px",textAlign:"center",fontSize:"0.65rem",color:"#aaa",borderTop:"1px solid #f0ede8",paddingTop:"10px",fontFamily:"'Public Sans',sans-serif"}}>
                  Ameen Islamic Institute • Shin, Nawa Kalay, Swat
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default FeeManagement;
