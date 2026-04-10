/* eslint-disable */
import letterhead  from "../../assets/letterhead.png";
import logoAbuBakr from "../../assets/1769748237732.png";
import logoUmar    from "../../assets/1769748315462.png";
import logoUthman  from "../../assets/1769748410371.png";
import logoAli     from "../../assets/1769748548928.png";
import { HOUSES }  from "../../constants";

const HOUSE_LOGOS = { abuBakr:logoAbuBakr, umar:logoUmar, uthman:logoUthman, ali:logoAli };
const CERT_PRINT_ID = "cert-print-area";

// Convert an img src → base64 data URL so it works in a new window
const toBase64 = (src) =>
  fetch(src)
    .then(r => r.blob())
    .then(blob => new Promise(res => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result);
      reader.readAsDataURL(blob);
    }))
    .catch(() => src); // fallback: keep original

const injectPrint = async () => {
  const el = document.getElementById(CERT_PRINT_ID);
  if (!el) return;

  // Deep-clone so we don't mutate the live DOM
  const clone = el.cloneNode(true);

  // Replace every img src with an embedded base64 data URL
  const imgs = [...clone.querySelectorAll("img")];
  await Promise.all(imgs.map(async (img) => {
    if (img.src) img.src = await toBase64(img.src);
  }));

  const win = window.open("", "_blank", "width=900,height=780");
  if (!win) return; // popup blocked
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Certificate</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 0; size: A4 portrait; }
    @media print { html, body { width: 210mm; height: 297mm; overflow: hidden; } }
  </style>
</head>
<body>${clone.outerHTML}</body>
</html>`);
  win.document.close();
  // Wait for document to settle, then print
  setTimeout(() => { win.focus(); win.print(); }, 800);
};

export default function CertificateTemplate({ award, winner }) {
  const hInfo     = HOUSES.find(h => h.id === winner?.houseId);
  const hColor    = hInfo?.color || "#b7860b";
  const houseLogo = HOUSE_LOGOS[winner?.houseId] || null;
  const today     = new Date().toLocaleDateString("en-PK", { year:"numeric", month:"long", day:"numeric" });
  const urduName  = winner?.winnerNameUr && winner.winnerNameUr !== winner?.winnerName ? winner.winnerNameUr : null;

  return (
    <div>
      {/* ── Print button ── */}
      <div className="no-print" style={{
        display:"flex", justifyContent:"center", padding:"12px",
        background:"linear-gradient(135deg,#0f172a,#1e293b)",
        borderBottom:"2px solid #d4af37",
      }}>
        <button onClick={injectPrint} style={{
          padding:"9px 32px", borderRadius:"30px", border:"none", cursor:"pointer",
          fontFamily:"'Public Sans',sans-serif", fontSize:"0.8rem", fontWeight:"700",
          background:"linear-gradient(135deg,#d4af37,#9a7209)", color:"#fff",
          boxShadow:"0 4px 18px rgba(212,175,55,0.4)", letterSpacing:"0.1em",
        }}>🖨️ PRINT CERTIFICATE</button>
      </div>

      {/* ══ A4 — fixed 297mm, flex column ══ */}
      <div id={CERT_PRINT_ID} style={{
        width:"210mm", height:"297mm",
        background:"#fffef9",
        margin:"0 auto",
        boxSizing:"border-box",
        fontFamily:"'Segoe UI',Georgia,serif",
        position:"relative",
        overflow:"hidden",
        direction:"ltr",
        /* Flex column so footer is pushed to bottom */
        display:"flex", flexDirection:"column",
      }}>

        {/* ── Watermark ── */}
        <div style={{ position:"absolute", inset:0, zIndex:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
          <span style={{ fontSize:"15rem", opacity:0.022, transform:"rotate(-20deg)", userSelect:"none", lineHeight:1 }}>🏆</span>
        </div>

        {/* ── Outer double border ── */}
        <div style={{ position:"absolute", inset:"12px", border:`4px double ${hColor}`, borderRadius:"6px", pointerEvents:"none", zIndex:1 }}/>
        <div style={{ position:"absolute", inset:"20px", border:`1px solid ${hColor}40`, borderRadius:"3px", pointerEvents:"none", zIndex:1 }}/>

        {/* ── Corner ornaments ── */}
        {[
          { t:"10px",  l:"10px",  tr:"rotate(0deg)"   },
          { t:"10px",  r:"10px",  tr:"rotate(90deg)"  },
          { b:"10px",  l:"10px",  tr:"rotate(-90deg)" },
          { b:"10px",  r:"10px",  tr:"rotate(180deg)" },
        ].map((c,i)=>(
          <svg key={i} width="52" height="52" viewBox="0 0 52 52"
            style={{ position:"absolute", top:c.t, bottom:c.b, left:c.l, right:c.r, transform:c.tr, zIndex:3, pointerEvents:"none" }}>
            <polyline points="4,26 4,4 26,4" fill="none" stroke={hColor} strokeWidth="3.5"/>
            <polyline points="8,22 8,8 22,8" fill="none" stroke={hColor} strokeWidth="1.2" opacity=".4"/>
            <circle cx="4" cy="4" r="3.2" fill={hColor}/>
          </svg>
        ))}

        {/* ══ BODY — flex:1 so it fills space, centered column ══ */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", zIndex:2, padding:"26px 38px 0" }}>

          {/* ── Header: letterhead (top strip only) + house logo ── */}
          <div style={{
            display:"flex", alignItems:"stretch",
            borderRadius:"10px", overflow:"hidden",
            border:`1px solid ${hColor}22`,
            boxShadow:`0 3px 16px ${hColor}12`,
            flexShrink:0, height:"82px",
          }}>
            {/* Letterhead — object-fit:cover crops to top header strip, no absolute positioning */}
            <div style={{ flex:1, background:"#fff", overflow:"hidden" }}>
              <img src={letterhead} alt="Ameen School"
                style={{ width:"100%", height:"82px", objectFit:"cover", objectPosition:"top left", display:"block" }}
                onError={e => { e.target.style.display="none"; }}
              />
            </div>
            {/* House logo panel */}
            {houseLogo && (
              <div style={{
                width:"82px", flexShrink:0,
                borderLeft:`2px solid ${hColor}25`,
                background:`${hColor}08`,
                display:"flex", alignItems:"center", justifyContent:"center", padding:"8px",
              }}>
                <img src={houseLogo} alt={hInfo?.nameEn} style={{ width:"64px", height:"64px", objectFit:"contain" }} />
              </div>
            )}
          </div>

          {/* ── Gold divider ── */}
          <div style={{ margin:"12px 8px 0", position:"relative" }}>
            <div style={{ height:"2px", background:`linear-gradient(90deg,transparent,${hColor},transparent)` }}/>
            <span style={{ position:"absolute", left:"50%", top:"-9px", transform:"translateX(-50%)", background:"#fffef9", padding:"0 12px", color:hColor, fontSize:"1rem" }}>✦</span>
          </div>

          {/* ── Certificate heading ── */}
          <div style={{ textAlign:"center", marginTop:"10px" }}>
            <div style={{ fontSize:"0.56rem", letterSpacing:"0.3em", color:"#bbb", textTransform:"uppercase", fontFamily:"'Public Sans',sans-serif" }}>
              ✦ &nbsp; C E R T I F I C A T E &nbsp; O F &nbsp; A C H I E V E M E N T &nbsp; ✦
            </div>
            <div style={{ fontSize:"0.95rem", color:"#666", fontStyle:"italic", fontFamily:"Georgia,serif", marginTop:"3px" }}>
              Certificate of Appreciation
            </div>
          </div>

          {/* ── Award ribbon ── */}
          <div style={{ textAlign:"center", margin:"14px 0 0" }}>
            <div style={{
              display:"inline-block",
              background:`linear-gradient(135deg,${hColor},${hColor}cc)`,
              padding:"9px 68px",
              clipPath:"polygon(18px 0%,calc(100% - 18px) 0%,100% 50%,calc(100% - 18px) 100%,18px 100%,0% 50%)",
              boxShadow:`0 6px 22px ${hColor}45`,
            }}>
              <div style={{
                fontSize:"1.55rem", fontWeight:"900", color:"#fff",
                letterSpacing:"0.04em", fontFamily:"'Public Sans','Segoe UI',sans-serif",
                textShadow:"0 2px 6px rgba(0,0,0,0.28)",
              }}>
                {award?.titleEn || "Excellence Award"}
              </div>
            </div>
          </div>

          {/* ── Award icon ── */}
          <div style={{ textAlign:"center", marginTop:"14px" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:"78px", height:"78px", borderRadius:"50%",
              background:`radial-gradient(circle at 35% 35%,#fff,${hColor}15)`,
              border:`3px solid ${hColor}50`,
              fontSize:"2.6rem",
              boxShadow:`0 0 0 6px ${hColor}10, 0 6px 24px ${hColor}28`,
            }}>
              {award?.icon || "🏆"}
            </div>
          </div>

          {/* ── Urdu award title ── */}
          {award?.titleUr && (
            <div style={{ textAlign:"center", marginTop:"6px" }}>
              <div style={{ fontSize:"1.45rem", fontWeight:"900", color:hColor, fontFamily:"'Noto Nastaliq Urdu',serif", direction:"rtl", lineHeight:1.8 }}>
                {award.titleUr}
              </div>
            </div>
          )}

          {/* ── "Awarded to" label ── */}
          <div style={{ textAlign:"center", marginTop:"16px" }}>
            <div style={{ fontSize:"0.62rem", color:"#aaa", letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"'Public Sans',sans-serif", marginBottom:"10px" }}>
              This Certificate is Proudly Awarded to
            </div>

            {/* Winner name — once only */}
            <div style={{ display:"inline-block", padding:"3px 48px 10px", borderBottom:`3px solid ${hColor}` }}>
              <div style={{ fontSize:"2.5rem", fontWeight:"900", color:"#1e293b", fontFamily:"Georgia,'Times New Roman',serif", letterSpacing:"0.02em", lineHeight:1.1 }}>
                {winner?.winnerName || "—"}
              </div>
              {urduName && (
                <div style={{ fontSize:"1.2rem", fontWeight:"700", color:"#64748b", fontFamily:"'Noto Nastaliq Urdu',serif", direction:"rtl", marginTop:"3px", lineHeight:1.8 }}>
                  {urduName}
                </div>
              )}
            </div>
          </div>

          {/* ── House badge ── */}
          {hInfo && (
            <div style={{ textAlign:"center", marginTop:"10px" }}>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:"7px",
                padding:"6px 20px", borderRadius:"40px",
                background:`${hColor}10`, border:`2px solid ${hColor}40`,
                color:hColor, fontSize:"0.82rem", fontWeight:"700",
                fontFamily:"'Public Sans',sans-serif",
              }}>
                {houseLogo
                  ? <img src={houseLogo} style={{ width:"20px", height:"20px", objectFit:"contain" }} alt="" />
                  : <span>{hInfo.emoji}</span>
                }
                {hInfo.nameEn} House
              </span>
            </div>
          )}

          {/* ── Body text ── */}
          <div style={{ textAlign:"center", padding:"12px 70px 0" }}>
            <p style={{ fontSize:"0.65rem", color:"#888", lineHeight:1.85, fontFamily:"Georgia,serif", fontStyle:"italic", margin:0 }}>
              In recognition of outstanding performance and exemplary dedication,
              this certificate is presented as a mark of distinction and excellence.
            </p>
          </div>

          {/* ── Divider ── */}
          <div style={{ margin:"14px 50px 0", display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ flex:1, height:"1px", background:`linear-gradient(90deg,transparent,${hColor}35)` }}/>
            <span style={{ color:hColor, fontSize:"0.82rem", letterSpacing:"0.28em" }}>✦ ✦ ✦</span>
            <div style={{ flex:1, height:"1px", background:`linear-gradient(90deg,${hColor}35,transparent)` }}/>
          </div>

          {/* ── Flex spacer — pushes signature down but not too far ── */}
          <div style={{ flex:1, minHeight:"10px", maxHeight:"40px" }}/>

          {/* ── Signature row ── */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", padding:"0 60px" }}>
            {/* Date */}
            <div style={{ textAlign:"center", minWidth:"120px" }}>
              <div style={{ fontSize:"0.7rem", color:"#334155", fontWeight:"600", fontFamily:"'Public Sans',sans-serif", marginBottom:"5px" }}>{today}</div>
              <div style={{ height:"1px", background:`linear-gradient(90deg,${hColor}65,transparent)`, marginBottom:"4px" }}/>
              <div style={{ fontSize:"0.5rem", color:"#bbb", letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"'Public Sans',sans-serif" }}>Date</div>
            </div>

            {/* Seal */}
            <div style={{
              width:"70px", height:"70px", borderRadius:"50%",
              border:`2px solid ${hColor}50`,
              background:`radial-gradient(circle,${hColor}18,${hColor}04)`,
              boxShadow:`0 0 16px ${hColor}18`,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            }}>
              <span style={{ fontSize:"1.4rem", lineHeight:1 }}>🏅</span>
              <span style={{ fontSize:"0.38rem", color:hColor, fontWeight:"700", letterSpacing:"0.1em", fontFamily:"'Public Sans',sans-serif", marginTop:"3px" }}>OFFICIAL SEAL</span>
            </div>

            {/* Signature */}
            <div style={{ textAlign:"center", minWidth:"120px" }}>
              <div style={{ fontSize:"0.9rem", color:"#334155", fontStyle:"italic", fontFamily:"Georgia,serif", marginBottom:"5px" }}>Principal / Director</div>
              <div style={{ height:"1px", background:`linear-gradient(90deg,transparent,${hColor}65)`, marginBottom:"4px" }}/>
              <div style={{ fontSize:"0.5rem", color:"#bbb", letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"'Public Sans',sans-serif" }}>Signature</div>
            </div>
          </div>

          {/* small bottom gap before footer */}
          <div style={{ height:"14px" }}/>

        </div>{/* end body flex */}

        {/* ── Footer strip ── */}
        <div style={{
          zIndex:2, flexShrink:0,
          borderTop:`2px solid ${hColor}22`,
          background:`linear-gradient(90deg,${hColor}0a,${hColor}05,${hColor}0a)`,
          padding:"9px 40px",
          textAlign:"center",
        }}>
          <div style={{ fontSize:"0.55rem", color:hColor, fontWeight:"700", letterSpacing:"0.18em", textTransform:"uppercase", fontFamily:"'Public Sans',sans-serif" }}>
            Ameen Islamic Institute, Swat &nbsp;✦&nbsp; Faith · Character · Excellence
          </div>
        </div>

      </div>
    </div>
  );
}
