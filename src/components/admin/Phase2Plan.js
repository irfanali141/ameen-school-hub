/* eslint-disable */
import { useState } from "react";
import { C, S } from "../../constants";

// ─── colour tokens ────────────────────────────────────────────────────────────
const WA   = "#25D366"; // WhatsApp green
const JC   = "#E03A3E"; // JazzCash red
const SB   = "#3ECF8E"; // Supabase green
const RN   = "#61DAFB"; // React blue

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const Glass = ({ children, style={} }) => (
  <div style={{ background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)",
    border:"1px solid rgba(255,255,255,0.12)", borderRadius:"18px",
    padding:"22px", ...style }}>{children}</div>
);

const Badge = ({ label, color }) => (
  <span style={{ display:"inline-block", padding:"3px 12px", borderRadius:"20px",
    background:color+"25", color, fontSize:"0.68rem", fontWeight:"700",
    border:`1px solid ${color}40`, marginLeft:"8px" }}>{label}</span>
);

const CodeBlock = ({ code, lang="sql" }) => (
  <pre style={{ background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:"12px", padding:"16px", fontSize:"0.68rem", overflowX:"auto",
    color:"#e2e8f0", fontFamily:"'Courier New',monospace", lineHeight:1.6,
    direction:"ltr", textAlign:"left", margin:"10px 0" }}>{code}</pre>
);

const Step = ({ n, title, desc, done=false }) => (
  <div style={{ display:"flex", gap:"14px", alignItems:"flex-start", marginBottom:"14px" }}>
    <div style={{ minWidth:"30px", height:"30px", borderRadius:"50%",
      background: done ? C.green : "rgba(255,255,255,0.12)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:"0.7rem", fontWeight:"800", color: done ? "#fff" : "rgba(255,255,255,0.5)",
      border: done ? `2px solid ${C.green}` : "2px solid rgba(255,255,255,0.2)" }}>
      {done ? "✓" : n}
    </div>
    <div>
      <div style={{ fontSize:"0.82rem", fontWeight:"700", color:"#f1f5f9" }}>{title}</div>
      <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.55)", marginTop:"3px" }}>{desc}</div>
    </div>
  </div>
);

const SectionHead = ({ icon, title, sub, color }) => (
  <div style={{ marginBottom:"22px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
      <div style={{ fontSize:"2rem" }}>{icon}</div>
      <div>
        <div style={{ fontSize:"1.1rem", fontWeight:"800", color }}>{title}</div>
        <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)" }}>{sub}</div>
      </div>
    </div>
  </div>
);

// ─── TAB 1: Roadmap ──────────────────────────────────────────────────────────
const MILESTONES = [
  { month:"Month 1", en:"Month 1", label:"Phase 1", items:["Supabase RLS Policies", "WhatsApp Business API Setup", "Test Env"], color:"#6366f1", icon:"🏗️" },
  { month:"Month 2", en:"Month 2", label:"Payment", items:["JazzCash Merchant Account", "Online Fee Portal", "Parents Mobile View"], color:JC, icon:"💳" },
  { month:"Month 3", en:"Month 3", label:"App", items:["React Native Expo Setup", "Login + Dashboard", "Push Notifications"], color:RN, icon:"📱" },
];

const TabRoadmap = () => (
  <div>
    <div style={{ textAlign:"center", marginBottom:"28px" }}>
      <div style={{ fontSize:"1.4rem", fontWeight:"800", color:C.gold }}>Phase 2 — Technical Roadmap</div>
      <div style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.5)", marginTop:"6px" }}>Phase 2 Technical Roadmap — 1-3 Months</div>
    </div>

    {/* milestone cards */}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"18px", marginBottom:"28px" }}>
      {MILESTONES.map((m,i)=>(
        <Glass key={i} style={{ borderTop:`3px solid ${m.color}` }}>
          <div style={{ fontSize:"1.6rem", marginBottom:"8px" }}>{m.icon}</div>
          <div style={{ fontSize:"0.65rem", color:m.color, fontWeight:"800", letterSpacing:"0.06em" }}>{m.month} — {m.en}</div>
          <div style={{ fontSize:"0.95rem", fontWeight:"800", color:"#f1f5f9", marginBottom:"12px" }}>{m.label}</div>
          {m.items.map((it,j)=>(
            <div key={j} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"7px" }}>
              <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:m.color, flexShrink:0 }}/>
              <span style={{ fontSize:"0.73rem", color:"rgba(255,255,255,0.7)" }}>{it}</span>
            </div>
          ))}
        </Glass>
      ))}
    </div>

    {/* 4 pillars overview */}
    <Glass>
      <div style={{ fontSize:"0.85rem", fontWeight:"800", color:C.gold, marginBottom:"16px", textAlign:"center" }}>Four Pillars — Four Pillars</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"14px" }}>
        {[
          { icon:"💬", label:"WhatsApp Alerts", sub:"Instant parent notifications", color:WA },
          { icon:"💳", label:"JazzCash / EasyPaisa", sub:"Online fee payment", color:JC },
          { icon:"🔒", label:"Supabase RLS", sub:"Role-Based Data Security", color:SB },
          { icon:"📱", label:"React Native App", sub:"Parents + Teachers Mobile App", color:RN },
        ].map((p,i)=>(
          <div key={i} style={{ background:`${p.color}15`, border:`1px solid ${p.color}40`,
            borderRadius:"14px", padding:"16px", textAlign:"center" }}>
            <div style={{ fontSize:"1.8rem", marginBottom:"6px" }}>{p.icon}</div>
            <div style={{ fontSize:"0.8rem", fontWeight:"800", color:p.color }}>{p.label}</div>
            <div style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.55)", marginTop:"4px" }}>{p.sub}</div>
          </div>
        ))}
      </div>
    </Glass>

    {/* current status */}
    <Glass style={{ marginTop:"18px", borderTop:`2px solid ${C.gold}40` }}>
      <div style={{ fontSize:"0.82rem", fontWeight:"800", color:C.gold, marginBottom:"12px" }}>Current Status — Phase 1 Complete ✅</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"10px" }}>
        {[
          ["30+ Pages","Complete Pages","✅"],
          ["Supabase Backend","Database","✅"],
          ["4 House System","House System","✅"],
          ["HVS 300 Marks","Marks System","✅"],
          ["Sitara-e-Ameen","Annual Award","✅"],
          ["Print Templates","Print System","✅"],
        ].map(([en,ur,st],i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px",
            background:"rgba(255,255,255,0.05)", borderRadius:"10px", padding:"10px 14px" }}>
            <span style={{ fontSize:"1rem" }}>{st}</span>
            <div>
              <div style={{ fontSize:"0.75rem", fontWeight:"700", color:"#f1f5f9" }}>{en}</div>
              <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.45)" }}>{ur}</div>
            </div>
          </div>
        ))}
      </div>
    </Glass>
  </div>
);

// ─── TAB 2: WhatsApp ─────────────────────────────────────────────────────────
const WA_ALERTS = [
  { trigger:"Fee Pending", en:"Fee Overdue", template:"Dear {Name}, your child {Student}'s fee for {Month} is pending. Amount: PKR {Amount}. Please pay promptly. Thank you — Ameen School", timing:"10th of every month", icon:"💰" },
  { trigger:"Absence", en:"Absence Alert", template:"Dear {Name}, your child {Student} was absent on {Date}. Please contact: 0300-XXXXXXX", timing:"30 minutes after attendance entry", icon:"✅" },
  { trigger:"HVS Score", en:"Weekly HVS Score", template:"Dear Parent, {Student}'s HVS Score this week: {Score}/160\nHouse: {House} | Rank: {Rank}\nOpen portal for details.", timing:"Every Friday at 4pm", icon:"🏅" },
  { trigger:"Results", en:"Results Published", template:"Congratulations! {Student}'s results are published.\nSubject: {Subject} | Marks: {Marks}/{Total}\nPosition: {Position}\nPortal: ameen.edu/results", timing:"Immediately when results are published", icon:"📊" },
  { trigger:"Event Reminder", en:"Event Reminder", template:"Reminder: {Event} is on {Date} at {Time}. Your child {Student}'s participation is required. — Ameen School Management", timing:"24 hours before the event", icon:"🎭" },
];

const TabWhatsApp = () => {
  const [selAlert, setSelAlert] = useState(0);
  return (
    <div>
      <SectionHead icon="💬" title="WhatsApp Business Integration" sub="WhatsApp Business API — Automated Parent Alerts" color={WA}/>

      {/* provider options */}
      <Glass style={{ marginBottom:"18px" }}>
        <div style={{ fontSize:"0.82rem", fontWeight:"800", color:WA, marginBottom:"14px" }}>API Provider — Provider Options</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"12px" }}>
          {[
            { name:"Twilio WhatsApp API", pros:"Most reliable", cost:"$0.005/msg", link:"twilio.com", rec:false },
            { name:"WasenderAPI.com", pros:"Easy setup in Pakistan", cost:"$9/Month unlimited", link:"wasender.com", rec:true },
            { name:"BotBuz / WATI", pros:"Template manager built-in", cost:"$49/Month", link:"wati.io", rec:false },
          ].map((p,i)=>(
            <div key={i} style={{ background: p.rec ? `${WA}18` : "rgba(255,255,255,0.05)",
              border: p.rec ? `2px solid ${WA}` : "1px solid rgba(255,255,255,0.1)",
              borderRadius:"12px", padding:"14px" }}>
              {p.rec && <div style={{ fontSize:"0.6rem", color:WA, fontWeight:"800", marginBottom:"4px" }}>✨ Recommended</div>}
              <div style={{ fontSize:"0.8rem", fontWeight:"800", color:"#f1f5f9" }}>{p.name}</div>
              <div style={{ fontSize:"0.68rem", color:WA, marginTop:"4px" }}>{p.cost}</div>
              <div style={{ fontSize:"0.67rem", color:"rgba(255,255,255,0.5)", marginTop:"4px" }}>{p.pros}</div>
            </div>
          ))}
        </div>
      </Glass>

      {/* alert types */}
      <Glass style={{ marginBottom:"18px" }}>
        <div style={{ fontSize:"0.82rem", fontWeight:"800", color:WA, marginBottom:"14px" }}>Alert Templates — Alert Templates</div>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px" }}>
          {WA_ALERTS.map((a,i)=>(
            <button key={i} onClick={()=>setSelAlert(i)} style={{
              padding:"7px 14px", borderRadius:"20px", border:"none", cursor:"pointer",
              background: selAlert===i ? WA : "rgba(255,255,255,0.1)",
              color: selAlert===i ? "#fff" : "rgba(255,255,255,0.7)",
              fontSize:"0.72rem", fontWeight:"700", fontFamily:"inherit",
              transition:"all 0.2s"
            }}>{a.icon} {a.en}</button>
          ))}
        </div>
        <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:"12px", padding:"16px",
          border:`1px solid ${WA}30` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
            <div style={{ fontSize:"0.8rem", fontWeight:"800", color:WA }}>{WA_ALERTS[selAlert].trigger}</div>
            <Badge label={WA_ALERTS[selAlert].timing} color={WA}/>
          </div>
          <div style={{ fontSize:"0.73rem", color:"rgba(255,255,255,0.8)", lineHeight:1.8,
            background:"rgba(37,211,102,0.08)", borderRadius:"10px", padding:"12px",
            border:`1px solid ${WA}20`, whiteSpace:"pre-wrap", direction:"ltr", fontFamily:"inherit" }}>
            {WA_ALERTS[selAlert].template}
          </div>
          <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)", marginTop:"8px", direction:"ltr" }}>
            Variables in curly braces &#123;&#125; are filled dynamically from Supabase
          </div>
        </div>
      </Glass>

      {/* implementation steps */}
      <Glass style={{ marginBottom:"18px" }}>
        <div style={{ fontSize:"0.82rem", fontWeight:"800", color:WA, marginBottom:"14px" }}>Implementation Steps — Implementation Steps</div>
        <Step n={1} title="Create WhatsApp Business Account" desc="Apply at meta.com/business via Facebook Business Manager"/>
        <Step n={2} title="API Provider Sign Up" desc="Create account on WasenderAPI or Twilio, get API key"/>
        <Step n={3} title="Create Supabase Edge Function" desc="Edge Function named send_whatsapp triggered by webhook"/>
        <Step n={4} title="Database Trigger Mark" desc="Trigger on fees table status='pending', insert trigger on attendance"/>
        <Step n={5} title="Template Approval" desc="WhatsApp approves templates within 24 hours"/>
        <Step n={6} title="Import parent phone numbers" desc="Auto-imported from students.phone field"/>
      </Glass>

      {/* code snippet */}
      <Glass>
        <div style={{ fontSize:"0.82rem", fontWeight:"800", color:WA, marginBottom:"12px" }}>Supabase Edge Function — send_whatsapp.ts</div>
        <CodeBlock code={`// supabase/functions/send_whatsapp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { phone, template, variables } = await req.json()

  const msg = template.replace(/\\{(\\w+)\\}/g,
    (_: any, key: string) => variables[key] || '')

  const res = await fetch('https://api.wasenderapi.com/api/send', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${Deno.env.get('WASENDER_KEY')}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: \`92\${phone.replace(/^0/, '')}\`,
      message: msg,
    }),
  })

  return new Response(JSON.stringify({ ok: res.ok }), {
    headers: { 'Content-Type': 'application/json' },
  })
})`}/>
        <CodeBlock code={`-- Supabase trigger: alert on fee overdue
CREATE OR REPLACE FUNCTION notify_fee_overdue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND OLD.status != 'pending' THEN
    PERFORM net.http_post(
      url := current_setting('app.edge_function_url') || '/send_whatsapp',
      body := json_build_object(
        'phone', (SELECT phone FROM students WHERE id = NEW.student_id),
        'template', 'Dear {Name}, fee is Pending: PKR {Amount}',
        'variables', json_build_object('Name', NEW.parent_name, 'Amount', NEW.amount)
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fee_overdue_alert
AFTER UPDATE ON fees
FOR EACH ROW EXECUTE FUNCTION notify_fee_overdue();`}/>
      </Glass>
    </div>
  );
};

// ─── TAB 3: JazzCash ─────────────────────────────────────────────────────────
const TabJazzCash = () => (
  <div>
    <SectionHead icon="💳" title="JazzCash / EasyPaisa Integration" sub="Online Fee Payment Gateway — Pakistan's leading mobile wallets" color={JC}/>

    {/* flow diagram */}
    <Glass style={{ marginBottom:"18px" }}>
      <div style={{ fontSize:"0.82rem", fontWeight:"800", color:JC, marginBottom:"16px" }}>Payment Flow — Payment Flow</div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
        flexWrap:"wrap", padding:"8px 0" }}>
        {[
          { label:"Parents", sub:"Open portal", icon:"👪" },
          { arrow:"→" },
          { label:"Fee Section", sub:"View balance", icon:"💰" },
          { arrow:"→" },
          { label:"JazzCash Button", sub:"Tap Pay Now", icon:"💳" },
          { arrow:"→" },
          { label:"JazzCash Gateway", sub:"MPIN / OTP", icon:"📱" },
          { arrow:"→" },
          { label:"Callback", sub:"Supabase webhook", icon:"🔗" },
          { arrow:"→" },
          { label:"Fee Updated", sub:"paid + receipt", icon:"✅" },
        ].map((s,i)=>(
          s.arrow
            ? <div key={i} style={{ fontSize:"1.2rem", color:"rgba(255,255,255,0.3)" }}>{s.arrow}</div>
            : <div key={i} style={{ background:`${JC}15`, border:`1px solid ${JC}40`,
                borderRadius:"12px", padding:"12px 14px", textAlign:"center", minWidth:"90px" }}>
                <div style={{ fontSize:"1.4rem" }}>{s.icon}</div>
                <div style={{ fontSize:"0.7rem", fontWeight:"800", color:"#f1f5f9", marginTop:"4px" }}>{s.label}</div>
                <div style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.4)" }}>{s.sub}</div>
              </div>
        ))}
      </div>
    </Glass>

    {/* provider comparison */}
    <Glass style={{ marginBottom:"18px" }}>
      <div style={{ fontSize:"0.82rem", fontWeight:"800", color:JC, marginBottom:"14px" }}>Provider Comparison</div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", direction:"ltr" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
              {["Feature","JazzCash","EasyPaisa","HBL Pay"].map(h=>(
                <th key={h} style={{ ...S.th, color:"rgba(255,255,255,0.6)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Pakistani Users","70M+","50M+","20M+"],
              ["Transaction Fee","1.5%","1.5%","1.2%"],
              ["API Complexity","Easy","Medium","Complex"],
              ["Sandbox","✅ Free","✅ Free","❌ Limited"],
              ["Webhook","✅","✅","✅"],
              ["Proposal",<Badge key="rec" label="Recommended" color={JC}/>,"2nd Option","Bank"],
            ].map((row,i)=>(
              <tr key={i} style={{ background: i%2===0?"rgba(255,255,255,0.02)":"transparent" }}>
                {row.map((cell,j)=>(
                  <td key={j} style={{ ...S.td, color: j===0?"rgba(255,255,255,0.6)":"#f1f5f9", padding:"10px 14px" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Glass>

    {/* implementation steps */}
    <Glass style={{ marginBottom:"18px" }}>
      <div style={{ fontSize:"0.82rem", fontWeight:"800", color:JC, marginBottom:"14px" }}>Implementation Steps</div>
      <Step n={1} title="JazzCash Merchant Registration" desc="Apply at jazzcash.com.pk/merchant — get Merchant ID + Password + Integrity Salt will be provided"/>
      <Step n={2} title="Sandbox Testing" desc="Run test transactions with sandbox credentials until error-free"/>
      <Step n={3} title="Add Pay Button in Ameen Hub" desc="Add 'Pay with JazzCash' button in Fee Section"/>
      <Step n={4} title="Supabase Edge Function" desc="Create two functions: payment_initiate and payment_callback"/>
      <Step n={5} title="Update fees table" desc="On callback save status='paid', jazzcash_ref, paid_at"/>
      <Step n={6} title="WhatsApp Receipt" desc="Send WhatsApp receipt to parents on successful payment"/>
    </Glass>

    {/* schema + code */}
    <Glass>
      <div style={{ fontSize:"0.82rem", fontWeight:"800", color:JC, marginBottom:"12px" }}>Database Schema + Code</div>
      <CodeBlock code={`-- fees table extensions for JazzCash
ALTER TABLE fees ADD COLUMN IF NOT EXISTS
  jazzcash_ref       TEXT,
  payment_method     TEXT DEFAULT 'cash',  -- 'jazzcash' | 'easypaisa' | 'cash'
  paid_at            TIMESTAMPTZ,
  gateway_response   JSONB;

-- online_payments log table
CREATE TABLE IF NOT EXISTS online_payments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_id      UUID REFERENCES fees(id),
  student_id  UUID REFERENCES students(id),
  amount      NUMERIC NOT NULL,
  method      TEXT NOT NULL,           -- 'jazzcash' | 'easypaisa'
  txn_ref     TEXT UNIQUE,
  status      TEXT DEFAULT 'pending',  -- 'pending' | 'paid' | 'failed'
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  raw_response JSONB
);`}/>
      <CodeBlock code={`// Payment initiation (React — FeeManagement.js addition)
const initJazzCash = async (fee) => {
  const txnRef = \`AII-\${Date.now()}\`
  const res = await fetch('/api/payment_initiate', {
    method: 'POST',
    body: JSON.stringify({
      amount: fee.amount,
      txnRef,
      studentName: fee.student_name,
      feeId: fee.id,
    })
  })
  const { redirectUrl } = await res.json()
  window.open(redirectUrl, '_blank')  // JazzCash checkout page
}

// Callback handler (Supabase Edge Function)
// After payment → update fees.status = 'paid'
// → insert online_payments row
// → trigger WhatsApp receipt alert`}/>
    </Glass>
  </div>
);

// ─── TAB 4: Supabase RLS ─────────────────────────────────────────────────────
const RLS_POLICIES = [
  {
    table:"students", icon:"🎓",
    policies:[
      { role:"director / admin", access:"All Students — SELECT, INSERT, UPDATE, DELETE", sql:"USING (true)" },
      { role:"teacher", access:"Own class/grade students — SELECT only", sql:"USING (auth.uid() IN (SELECT teacher_uid FROM class_assignments WHERE grade = students.grade))" },
      { role:"housemaster", access:"Own house students — SELECT only", sql:"USING (house_id = (SELECT house_id FROM teachers WHERE uid = auth.uid()))" },
      { role:"parent", access:"Own child only — SELECT only", sql:"USING (id = (SELECT student_id FROM parent_links WHERE parent_uid = auth.uid()))" },
    ]
  },
  {
    table:"fees", icon:"💰",
    policies:[
      { role:"director / finance", access:"All Fee Record — SELECT, INSERT, UPDATE", sql:"USING (true)" },
      { role:"parent", access:"Own child's fee only — SELECT only", sql:"USING (student_id = (SELECT student_id FROM parent_links WHERE parent_uid = auth.uid()))" },
      { role:"teacher / housemaster", access:"Any Access No", sql:"USING (false)" },
    ]
  },
  {
    table:"hvs_logs", icon:"🏅",
    policies:[
      { role:"director / admin", access:"All — SELECT, INSERT, UPDATE", sql:"USING (true)" },
      { role:"housemaster", access:"Own house entries — SELECT, INSERT", sql:"USING (house_id = (SELECT house_id FROM teachers WHERE uid = auth.uid()))" },
      { role:"teacher", access:"View only — SELECT", sql:"USING (true)" },
      { role:"parent / student", access:"Own house summary — SELECT", sql:"USING (house_id = (SELECT house_id FROM students WHERE id = (SELECT student_id FROM parent_links WHERE parent_uid = auth.uid())))" },
    ]
  },
  {
    table:"results", icon:"📊",
    policies:[
      { role:"director / admin / registrar", access:"All — SELECT, INSERT, UPDATE", sql:"USING (true)" },
      { role:"teacher", access:"Enter results for own subject", sql:"USING (subject = (SELECT subject FROM teachers WHERE uid = auth.uid()))" },
      { role:"parent", access:"Own child's results", sql:"USING (student_id = (SELECT student_id FROM parent_links WHERE parent_uid = auth.uid()))" },
    ]
  },
];

const TabRLS = () => {
  const [selTable, setSelTable] = useState(0);
  return (
    <div>
      <SectionHead icon="🔒" title="Supabase Row Level Security" sub="Role-Based Data Protectionon" color={SB}/>

      <Glass style={{ marginBottom:"18px" }}>
        <div style={{ fontSize:"0.82rem", fontWeight:"800", color:SB, marginBottom:"14px" }}>What is RLS?</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"12px" }}>
          {[
            { icon:"🛡️", title:"Database Level Security", desc:"PostgreSQL checks before API" },
            { icon:"🎭", title:"Based on Role", desc:"Every user sees only their own data" },
            { icon:"⚡", title:"Automatic", desc:"Applied on every query — no code changes needed" },
            { icon:"✅", title:"GDPR / Privacy", desc:"Legal requirement — data protection" },
          ].map((c,i)=>(
            <div key={i} style={{ background:`${SB}10`, border:`1px solid ${SB}30`,
              borderRadius:"12px", padding:"14px" }}>
              <div style={{ fontSize:"1.4rem", marginBottom:"6px" }}>{c.icon}</div>
              <div style={{ fontSize:"0.75rem", fontWeight:"800", color:"#f1f5f9" }}>{c.title}</div>
              <div style={{ fontSize:"0.67rem", color:"rgba(255,255,255,0.5)", marginTop:"4px" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Glass>

      {/* table selector */}
      <Glass style={{ marginBottom:"18px" }}>
        <div style={{ fontSize:"0.82rem", fontWeight:"800", color:SB, marginBottom:"14px" }}>Table Policies — Table Policies</div>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"18px" }}>
          {RLS_POLICIES.map((t,i)=>(
            <button key={i} onClick={()=>setSelTable(i)} style={{
              padding:"7px 16px", borderRadius:"20px", border:"none", cursor:"pointer",
              background: selTable===i ? SB : "rgba(255,255,255,0.1)",
              color: selTable===i ? "#0f172a" : "rgba(255,255,255,0.7)",
              fontSize:"0.72rem", fontWeight:"700", fontFamily:"inherit",
            }}>{t.icon} {t.table}</button>
          ))}
        </div>
        <div>
          {RLS_POLICIES[selTable].policies.map((p,i)=>(
            <div key={i} style={{ background:"rgba(0,0,0,0.25)", borderRadius:"12px",
              padding:"14px", marginBottom:"10px", border:`1px solid ${SB}20` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                <Badge label={p.role} color={SB}/>
              </div>
              <div style={{ fontSize:"0.73rem", color:"rgba(255,255,255,0.75)", marginBottom:"8px" }}>{p.access}</div>
              <div style={{ background:"rgba(0,0,0,0.4)", borderRadius:"8px", padding:"8px 12px",
                fontSize:"0.65rem", color:SB, fontFamily:"'Courier New',monospace",
                direction:"ltr", textAlign:"left" }}>{p.sql}</div>
            </div>
          ))}
        </div>
      </Glass>

      {/* implementation */}
      <Glass style={{ marginBottom:"18px" }}>
        <div style={{ fontSize:"0.82rem", fontWeight:"800", color:SB, marginBottom:"14px" }}>Implementation Steps</div>
        <Step n={1} title="Connect Auth to Supabase Auth" desc="Replace current email/pass with supabase.auth.signInWithPassword"/>
        <Step n={2} title="Create parent_links table" desc="(parent_uid UUID, student_id UUID) — Links parents to children"/>
        <Step n={3} title="teacher_uid column Add" desc="Save auth.uid() in teachers table"/>
        <Step n={4} title="Enable RLS" desc="Supabase Dashboard → Table → RLS → Enable"/>
        <Step n={5} title="Create Policies" desc="Apply the SQL policies above on every table"/>
        <Step n={6} title="Test" desc="Login with each role and verify correct data is returned"/>
      </Glass>

      <Glass>
        <div style={{ fontSize:"0.82rem", fontWeight:"800", color:SB, marginBottom:"12px" }}>Complete RLS Setup SQL</div>
        <CodeBlock code={`-- Step 1: Enable RLS on all tables
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE hvs_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE results       ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hifz_logs     ENABLE ROW LEVEL SECURITY;

-- Step 2: parent_links helper table
CREATE TABLE parent_links (
  parent_uid  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES students(id)   ON DELETE CASCADE,
  PRIMARY KEY (parent_uid, student_id)
);

-- Step 3: helper function for current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM user_roles WHERE uid = auth.uid();
$$ LANGUAGE sql STABLE;

-- Step 4: students policies
CREATE POLICY "admin_full" ON students
  FOR ALL USING (get_my_role() IN ('director','admin','registrar'));

CREATE POLICY "teacher_read_grade" ON students
  FOR SELECT USING (get_my_role() = 'teacher');

CREATE POLICY "housemaster_read_house" ON students
  FOR SELECT USING (
    get_my_role() = 'housemaster' AND
    house_id = (SELECT house_id FROM teachers WHERE uid = auth.uid())
  );

CREATE POLICY "parent_own_child" ON students
  FOR SELECT USING (
    id IN (SELECT student_id FROM parent_links WHERE parent_uid = auth.uid())
  );`}/>
      </Glass>
    </div>
  );
};

// ─── TAB 5: React Native ─────────────────────────────────────────────────────
const RN_SCREENS = [
  {
    stack:"Auth Stack", color:"#6366f1", icon:"🔐",
    screens:["Login Screen","Forgot Password","First-time Setup"]
  },
  {
    stack:"Parent Stack", color:JC, icon:"👪",
    screens:["Dashboard","My Child Profile","Fee Payment (JazzCash)","Attendance View","Results","Notifications","HVS Progress","Chat with Teacher"]
  },
  {
    stack:"Teacher Stack", color:WA, icon:"👨‍🏫",
    screens:["Dashboard","Mark Attendance","Enter Marks","HVS Entry","Student List","Notifications","Lesson Plans"]
  },
  {
    stack:"Housemaster Stack", color:SB, icon:"🏠",
    screens:["House Dashboard","HVS Weekly Entry","Student Rankings","Leadership Roles","Bazaar Points","Sitara-e-Ameen"]
  },
];

const TabReactNative = () => (
  <div>
    <SectionHead icon="📱" title="React Native Mobile App" sub="Expo + Supabase — iOS & Android — Parents + Teachers" color={RN}/>

    {/* tech stack */}
    <Glass style={{ marginBottom:"18px" }}>
      <div style={{ fontSize:"0.82rem", fontWeight:"800", color:RN, marginBottom:"14px" }}>Tech Stack — Tech Stack</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"12px" }}>
        {[
          { lib:"Expo SDK 51+", use:"Build tool — iOS + Android together", icon:"⚡" },
          { lib:"React Native 0.74", use:"UI Framework", icon:"⚛️" },
          { lib:"@supabase/supabase-js", use:"Same backend — Web + Mobile", icon:"🔗" },
          { lib:"React Navigation v6", use:"Stack + Bottom Tab navigation", icon:"🧭" },
          { lib:"Expo Notifications", use:"Push Notifications", icon:"🔔" },
          { lib:"NativeWind (Tailwind)", use:"Fast styling", icon:"🎨" },
          { lib:"Expo SecureStore", use:"Secure token storage", icon:"🔒" },
          { lib:"React Query", use:"Data caching", icon:"⚡" },
        ].map((t,i)=>(
          <div key={i} style={{ background:`${RN}10`, border:`1px solid ${RN}25`,
            borderRadius:"12px", padding:"13px" }}>
            <div style={{ fontSize:"1.2rem", marginBottom:"6px" }}>{t.icon}</div>
            <div style={{ fontSize:"0.75rem", fontWeight:"800", color:RN }}>{t.lib}</div>
            <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.5)", marginTop:"3px" }}>{t.use}</div>
          </div>
        ))}
      </div>
    </Glass>

    {/* screen architecture */}
    <Glass style={{ marginBottom:"18px" }}>
      <div style={{ fontSize:"0.82rem", fontWeight:"800", color:RN, marginBottom:"14px" }}>Screen Architecture — Screen Architecture</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"14px" }}>
        {RN_SCREENS.map((s,i)=>(
          <div key={i} style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${s.color}40`,
            borderRadius:"14px", padding:"14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px",
              borderBottom:`1px solid ${s.color}30`, paddingBottom:"10px" }}>
              <span style={{ fontSize:"1.3rem" }}>{s.icon}</span>
              <div style={{ fontSize:"0.78rem", fontWeight:"800", color:s.color }}>{s.stack}</div>
            </div>
            {s.screens.map((sc,j)=>(
              <div key={j} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.7)" }}>{sc}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Glass>

    {/* implementation steps */}
    <Glass style={{ marginBottom:"18px" }}>
      <div style={{ fontSize:"0.82rem", fontWeight:"800", color:RN, marginBottom:"14px" }}>Implementation Steps</div>
      <Step n={1} title="Create Expo project" desc="npx create-expo-app ameen-mobile --template expo-template-blank-typescript"/>
      <Step n={2} title="Connect Supabase client" desc="Same SUPABASE_URL + ANON_KEY shared between web and mobile"/>
      <Step n={3} title="Set up Auth" desc="Use supabase.auth + Expo SecureStore for token"/>
      <Step n={4} title="Set up Navigation" desc="Show Parent Stack or Teacher Stack based on role"/>
      <Step n={5} title="Build basic screens" desc="Dashboard, Attendance, Fee Payment first — rest later"/>
      <Step n={6} title="Push Notifications" desc="Get Expo Push Token with expo-notifications, store in Supabase"/>
      <Step n={7} title="JazzCash WebView" desc="Open JazzCash checkout in WebView for payment"/>
      <Step n={8} title="Play Store / App Store" desc="Build with expo build:android and expo build:ios"/>
    </Glass>

    {/* code snippet */}
    <Glass>
      <div style={{ fontSize:"0.82rem", fontWeight:"800", color:RN, marginBottom:"12px" }}>Code Starters — Getting Started</div>
      <CodeBlock code={`# Create the mobile app
npx create-expo-app ameen-mobile --template blank-typescript
cd ameen-mobile

# Install dependencies
npx expo install @supabase/supabase-js
npx expo install expo-secure-store
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install expo-notifications expo-device
npx expo install react-native-screens react-native-safe-area-context`}/>
      <CodeBlock code={`// lib/supabase.ts — shared with web (same URL + key)
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: ExpoSecureStoreAdapter, autoRefreshToken: true, persistSession: true } }
)`}/>
      <CodeBlock code={`// App.tsx — role-based navigation
import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { supabase } from './lib/supabase'
import ParentNavigator  from './navigation/ParentNavigator'
import TeacherNavigator from './navigation/TeacherNavigator'
import AuthNavigator    from './navigation/AuthNavigator'

export default function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  // fetch role from user_roles table after login
  useEffect(() => {
    if (session) fetchRole(session.user.id).then(setRole)
  }, [session])

  return (
    <NavigationContainer>
      {!session    ? <AuthNavigator /> :
       role==='parent'  ? <ParentNavigator />  :
       role==='teacher' ? <TeacherNavigator /> :
       <TeacherNavigator />}
    </NavigationContainer>
  )
}`}/>
    </Glass>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const TABS = [
  { id:"roadmap", label:"🗺️ Roadmap",   en:"Roadmap"  },
  { id:"whatsapp",label:"💬 WhatsApp", en:"WhatsApp" },
  { id:"jazzcash",label:"💳 JazzCash",  en:"JazzCash" },
  { id:"rls",     label:"🔒 RLS",      en:"Supabase RLS" },
  { id:"rn",      label:"📱 App",      en:"React Native" },
];

export default function Phase2Plan() {
  const [tab, setTab] = useState("roadmap");

  return (
    <div style={{ ...S.page, minHeight:"90vh",
      background:"linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)" }}>

      {/* header */}
      <div style={{ textAlign:"center", padding:"28px 0 20px", marginBottom:"8px" }}>
        <div style={{ fontSize:"0.7rem", color:C.gold, fontWeight:"800",
          letterSpacing:"0.12em", marginBottom:"6px" }}>AMEEN SCHOOL HUB</div>
        <div style={{ fontSize:"1.5rem", fontWeight:"800", color:"#f1f5f9",
          marginBottom:"6px" }}>Phase 2 Planning</div>
        <div style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.45)" }}>
          Phase 2 — Technology Expansion Plan — 2026
        </div>
      </div>

      {/* tab bar */}
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"center",
        marginBottom:"24px", padding:"0 8px" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"9px 18px", borderRadius:"24px", border:"none", cursor:"pointer",
            fontFamily:"inherit", fontSize:"0.75rem", fontWeight:"700",
            background: tab===t.id
              ? `linear-gradient(135deg,${C.gold},${C.goldDark})`
              : "rgba(255,255,255,0.08)",
            color: tab===t.id ? "#fff" : "rgba(255,255,255,0.6)",
            boxShadow: tab===t.id ? `0 4px 16px ${C.goldGlow}` : "none",
            transition:"all 0.2s",
            border: tab===t.id ? "none" : "1px solid rgba(255,255,255,0.1)",
          }}>{t.en}</button>
        ))}
      </div>

      {/* tab content */}
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 4px" }}>
        {tab==="roadmap"  && <TabRoadmap/>}
        {tab==="whatsapp" && <TabWhatsApp/>}
        {tab==="jazzcash" && <TabJazzCash/>}
        {tab==="rls"      && <TabRLS/>}
        {tab==="rn"       && <TabReactNative/>}
      </div>

      {/* footer */}
      <div style={{ textAlign:"center", padding:"32px 0 16px", marginTop:"24px" }}>
        <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.2)",
          borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:"16px" }}>
          Ameen Islamic Institute — Swat • Phase 2 Planning Document • March 2026
        </div>
      </div>
    </div>
  );
}
