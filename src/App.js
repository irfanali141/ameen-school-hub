// ===================== TARBIYAH DIARY =====================
// WHY: Har talib-e-ilm ka daily namaz aur adab record — iska data Firebase mein "tarbiyah_logs" collection mein jata hai
function TarbiyahDiary({ students, addData, updateHousePoints }) {
  const [logs, setLogs] = useState([]);
  const [show, setShow] = useState(false);
  const [tab, setTab] = useState("entry"); // "entry" | "report"
  const [f, setF] = useState({
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
    adabRating: 3, // 1-5 stars
    selfReflection: false,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "tarbiyah_logs"), orderBy("createdAt", "desc"), limit(50)),
      s => setLogs(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  // WHY: Namaz count se points calculate — jitni namaz, utne points
  const calcPoints = (f) => {
    const namazCount = [f.fajr, f.dhuhr, f.asr, f.maghrib, f.isha].filter(Boolean).length;
    const adabPts = f.adabRating >= 4 ? 5 : f.adabRating >= 3 ? 3 : 1;
    const reflectionPts = f.selfReflection ? 5 : 0;
    return namazCount * 4 + adabPts + reflectionPts;
  };

  const save = async () => {
    if (!f.studentId) return;
    setSaving(true);
    const pts = calcPoints(f);
    const student = students.find(s => s.id === f.studentId);
    await addData("tarbiyah_logs", { ...f, points: pts, houseId: student?.houseId || "" });
    if (student?.houseId && pts > 0) await updateHousePoints(student.houseId, Math.floor(pts / 5));
    setShow(false);
    setF({ studentId: "", date: new Date().toISOString().split("T")[0], fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, adabRating: 3, selfReflection: false, notes: "" });
    setSaving(false);
  };

  const SALAH = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const SALAH_UR = { fajr: "فجر", dhuhr: "ظہر", asr: "عصر", maghrib: "مغرب", isha: "عشاء" };

  const totalLogs = logs.length;
  const avgPoints = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (l.points || 0), 0) / logs.length) : 0;
  const todayLogs = logs.filter(l => l.date === new Date().toISOString().split("T")[0]);

  // Per-student summary
  const studentSummary = students.map(st => {
    const stLogs = logs.filter(l => l.studentId === st.id);
    const totalPts = stLogs.reduce((s, l) => s + (l.points || 0), 0);
    const avgAdab = stLogs.length > 0 ? (stLogs.reduce((s, l) => s + (l.adabRating || 0), 0) / stLogs.length).toFixed(1) : 0;
    const namazAvg = stLogs.length > 0 ? Math.round(stLogs.reduce((s, l) => s + [l.fajr, l.dhuhr, l.asr, l.maghrib, l.isha].filter(Boolean).length, 0) / stLogs.length) : 0;
    return { ...st, totalPts, avgAdab, namazAvg, entries: stLogs.length };
  }).sort((a, b) => b.totalPts - a.totalPts);

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: "700", color: C.navy }}>📖 تربیت ڈائری</div>
          <div style={{ fontSize: "0.62rem", color: "#888", marginTop: "2px" }}>نماز، ادب، اور روزانہ کارکردگی</div>
        </div>
        <button style={S.addBtn} onClick={() => setShow(!show)}>+ نئی اندراج</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { c: C.navy, i: "📋", n: totalLogs, l: "کل اندراجات" },
          { c: C.green, i: "🌟", n: avgPoints, l: "اوسط پوائنٹس" },
          { c: C.gold, i: "📅", n: todayLogs.length, l: "آج کے اندراجات" },
          { c: C.purple, i: "🎓", n: students.length, l: "کل طلبا" }
        ].map((x, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg,${x.c}12,${x.c}05)`, borderRadius: "16px", padding: "16px", border: `2px solid ${x.c}20`, textAlign: "center" }}>
            <div style={{ fontSize: "1.3rem" }}>{x.i}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: x.c }}>{x.n}</div>
            <div style={{ fontSize: "0.6rem", color: "#888", marginTop: "2px" }}>{x.l}</div>
          </div>
        ))}
      </div>

      {/* Entry Form */}
      {show && (
        <div style={{ ...S.card, marginBottom: "20px", background: `linear-gradient(135deg,${C.goldLight},#fdf8ee)`, border: `2px solid ${C.gold}30` }}>
          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: C.navy, marginBottom: "16px" }}>📖 روزانہ تربیت اندراج</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>طالب علم *</label>
              <select style={S.inpSm} value={f.studentId} onChange={e => setF({ ...f, studentId: e.target.value })}>
                <option value="">-- منتخب کریں --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>تاریخ</label>
              <input style={{ ...S.inpSm, direction: "ltr" }} type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} />
            </div>
          </div>

          {/* Namaz checklist */}
          <div style={{ background: C.white, borderRadius: "14px", padding: "16px", marginBottom: "14px", border: `1px solid ${C.goldLight}` }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: C.navy, marginBottom: "12px" }}>🕌 5 وقت کی نماز</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {SALAH.map(s => (
                <button key={s} onClick={() => setF({ ...f, [s]: !f[s] })} style={{
                  padding: "8px 14px", borderRadius: "12px", border: "none", cursor: "pointer",
                  fontSize: "0.68rem", fontWeight: "700", fontFamily: "inherit",
                  background: f[s] ? `linear-gradient(135deg,${C.green},#15803d)` : "#f3f4f6",
                  color: f[s] ? C.white : "#888", transition: "all 0.2s"
                }}>
                  {f[s] ? "✅" : "⬜"} {SALAH_UR[s]}
                </button>
              ))}
            </div>
            <div style={{ marginTop: "10px", fontSize: "0.65rem", color: C.gold, fontWeight: "700" }}>
              {[f.fajr, f.dhuhr, f.asr, f.maghrib, f.isha].filter(Boolean).length}/5 نماز • {[f.fajr, f.dhuhr, f.asr, f.maghrib, f.isha].filter(Boolean).length * 4} پوائنٹس
            </div>
          </div>

          {/* Adab rating */}
          <div style={{ background: C.white, borderRadius: "14px", padding: "16px", marginBottom: "14px", border: `1px solid ${C.goldLight}` }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: C.navy, marginBottom: "10px" }}>💎 ادب ریٹنگ (Adab Rating)</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setF({ ...f, adabRating: star })} style={{
                  fontSize: "1.4rem", background: "none", border: "none", cursor: "pointer",
                  color: star <= f.adabRating ? C.gold : "#ddd", transition: "color 0.15s"
                }}>★</button>
              ))}
            </div>
            <div style={{ fontSize: "0.6rem", color: "#888", marginTop: "6px" }}>
              {f.adabRating >= 4 ? "شاندار ادب ⭐" : f.adabRating >= 3 ? "اچھا ادب 👍" : "بہتری ضروری ⚠️"}
            </div>
          </div>

          {/* Self reflection */}
          <div style={{ background: C.white, borderRadius: "14px", padding: "14px", marginBottom: "14px", border: `1px solid ${C.goldLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: "700", color: C.navy }}>🪞 خود احتسابی (Self Reflection)</div>
              <div style={{ fontSize: "0.58rem", color: "#888", marginTop: "2px" }}>کیا آج اپنے اعمال پر غور کیا؟</div>
            </div>
            <button onClick={() => setF({ ...f, selfReflection: !f.selfReflection })} style={{
              padding: "8px 16px", borderRadius: "20px", border: "none", cursor: "pointer",
              fontSize: "0.65rem", fontWeight: "700", fontFamily: "inherit",
              background: f.selfReflection ? `linear-gradient(135deg,${C.gold},${C.goldDark})` : "#f3f4f6",
              color: f.selfReflection ? C.white : "#888", transition: "all 0.2s"
            }}>
              {f.selfReflection ? "✅ ہاں +5pts" : "⬜ نہیں"}
            </button>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>نوٹس</label>
            <textarea style={{ ...S.inpSm, minHeight: "60px", resize: "vertical" }} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} placeholder="آج کی کارکردگی کے بارے میں نوٹ..." />
          </div>

          {/* Total points preview */}
          <div style={{ background: C.white, borderRadius: "12px", padding: "14px", marginBottom: "14px", textAlign: "center", border: `2px solid ${C.gold}30` }}>
            <div style={{ fontSize: "0.62rem", color: "#888" }}>کل پوائنٹس</div>
            <div style={{ fontSize: "2rem", fontWeight: "900", color: C.gold }}>{calcPoints(f)}</div>
          </div>

          <button style={{ ...S.saveBtn, width: "100%" }} onClick={save} disabled={saving}>
            {saving ? "محفوظ ہو رہا ہے..." : "✅ تربیت اندراج محفوظ کریں"}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[["entry", "📋 حالیہ اندراجات"], ["report", "📊 طلبا رپورٹ"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "0.68rem", fontWeight: tab === t ? "700" : "400", background: tab === t ? `linear-gradient(135deg,${C.gold},${C.goldDark})` : C.white, color: tab === t ? C.white : "#888", fontFamily: "inherit" }}>{l}</button>
        ))}
      </div>

      {tab === "entry" && (
        <div style={S.card}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={S.th}>طالب علم</th>
                <th style={S.th}>تاریخ</th>
                <th style={S.th}>نماز</th>
                <th style={S.th}>ادب</th>
                <th style={S.th}>احتساب</th>
                <th style={S.th}>پوائنٹس</th>
              </tr></thead>
              <tbody>
                {logs.map(l => {
                  const st = students.find(s => s.id === l.studentId);
                  const namazCount = [l.fajr, l.dhuhr, l.asr, l.maghrib, l.isha].filter(Boolean).length;
                  return (
                    <tr key={l.id}>
                      <td style={{ ...S.td, fontWeight: "700" }}>{st?.name || "—"}</td>
                      <td style={{ ...S.td, fontFamily: "monospace", direction: "ltr", fontSize: "0.6rem" }}>{l.date}</td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {["fajr", "dhuhr", "asr", "maghrib", "isha"].map(s => (
                            <span key={s} style={{ fontSize: "0.65rem" }}>{l[s] ? "✅" : "⬜"}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: "0.55rem", color: namazCount === 5 ? C.green : C.amber }}>{namazCount}/5</div>
                      </td>
                      <td style={S.td}>
                        <span style={{ color: C.gold }}>{"★".repeat(l.adabRating || 0)}{"☆".repeat(5 - (l.adabRating || 0))}</span>
                      </td>
                      <td style={S.td}>{l.selfReflection ? "✅" : "—"}</td>
                      <td style={{ ...S.td, fontWeight: "800", color: C.gold, fontSize: "0.8rem" }}>{l.points || 0}</td>
                    </tr>
                  );
                })}
                {logs.length === 0 && <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#bbb", padding: "40px" }}>ابھی کوئی اندراج نہیں</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "report" && (
        <div style={S.card}>
          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: C.navy, marginBottom: "16px" }}>🏆 طلبا لیڈر بورڈ — تربیت پوائنٹس</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={S.th}>#</th>
                <th style={S.th}>طالب علم</th>
                <th style={S.th}>ہاؤس</th>
                <th style={S.th}>اندراجات</th>
                <th style={S.th}>اوسط نماز</th>
                <th style={S.th}>اوسط ادب</th>
                <th style={S.th}>کل پوائنٹس</th>
              </tr></thead>
              <tbody>
                {studentSummary.map((st, i) => {
                  const h = HOUSES.find(x => x.id === st.houseId);
                  return (
                    <tr key={st.id} style={{ background: i === 0 ? `${C.gold}08` : undefined }}>
                      <td style={{ ...S.td, fontWeight: "800", color: i === 0 ? C.gold : "#aaa" }}>{i === 0 ? "👑" : i + 1}</td>
                      <td style={{ ...S.td, fontWeight: "700" }}>{st.name}</td>
                      <td style={S.td}>{h && <span style={hBadge(h.color, h.light)}>{h.emoji}</span>}</td>
                      <td style={S.td}>{st.entries}</td>
                      <td style={S.td}>
                        <span style={{ color: st.namazAvg >= 4 ? C.green : st.namazAvg >= 2 ? C.amber : C.red, fontWeight: "700" }}>{st.namazAvg}/5</span>
                      </td>
                      <td style={S.td}><span style={{ color: C.gold }}>{"★".repeat(Math.round(st.avgAdab))}</span></td>
                      <td style={{ ...S.td, fontWeight: "900", color: C.gold, fontSize: "0.85rem" }}>{st.totalPts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== SUPER HOUSE DASHBOARD =====================
// WHY: Ye dashboard Houses ka detailed view — HVS + competition + achievements
function SuperHouseDashboard({ houses, hvsLogs, students, events }) {
  const sorted = [...houses].sort((a, b) => (b.points || 0) - (a.points || 0));
  const winner = sorted[0];
  const winnerInfo = HOUSES.find(x => x.id === winner?.id);

  const [selHouse, setSelHouse] = useState(null);

  // Per house stats
  const houseStats = HOUSES.map(h => {
    const hd = houses.find(x => x.id === h.id) || {};
    const studs = students.filter(s => s.houseId === h.id);
    const hLogs = hvsLogs.filter(l => l.houseId === h.id);
    const avgHvs = hLogs.length > 0 ? Math.round(hLogs.reduce((s, l) => s + (l.total || 0), 0) / hLogs.length) : 0;
    const bestWeek = hLogs.length > 0 ? Math.max(...hLogs.map(l => l.total || 0)) : 0;
    const rank = sorted.findIndex(x => x.id === h.id) + 1;
    return { ...h, ...hd, studs, hLogs, avgHvs, bestWeek, rank, info: h };
  });

  const selectedStats = selHouse ? houseStats.find(x => x.id === selHouse) : null;
  const selectedInfo = HOUSES.find(x => x.id === selHouse);

  return (
    <div style={S.page}>
      <div style={{ fontSize: "1.1rem", fontWeight: "700", color: C.navy, marginBottom: "6px" }}>🏆 سپر ہاؤس ڈیش بورڈ</div>
      <div style={{ fontSize: "0.62rem", color: "#888", marginBottom: "20px" }}>تفصیلی ہاؤس تجزیہ و کارکردگی</div>

      {/* Winner Banner */}
      {winner && winnerInfo && (
        <div style={{ background: winnerInfo.gradient, borderRadius: "22px", padding: "28px", marginBottom: "24px", color: C.white, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
          <div style={{ fontSize: "3rem", marginBottom: "8px" }}>👑</div>
          <div style={{ fontSize: "0.7rem", opacity: 0.8, letterSpacing: "0.2em", marginBottom: "6px" }}>سپر ہاؤس — موجودہ لیڈر</div>
          <div style={{ fontSize: "2rem", fontWeight: "900" }}>{winnerInfo.emoji} {winnerInfo.nameEn} House</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.85, margin: "8px 0", fontStyle: "italic" }}>{winnerInfo.slogan}</div>
          <div style={{ fontSize: "3rem", fontWeight: "900", opacity: 0.95 }}>{winner.points || 0}</div>
          <div style={{ fontSize: "0.65rem", opacity: 0.7 }}>کل پوائنٹس</div>
        </div>
      )}

      {/* House Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        {houseStats.map((h, i) => {
          const info = HOUSES.find(x => x.id === h.id) || {};
          const isSelected = selHouse === h.id;
          return (
            <div key={h.id} onClick={() => setSelHouse(isSelected ? null : h.id)} style={{
              ...S.card, cursor: "pointer", borderTop: `4px solid ${info.color || C.gold}`,
              border: isSelected ? `2px solid ${info.color}` : `1px solid ${C.goldLight}`,
              transform: isSelected ? "scale(1.02)" : "scale(1)", transition: "all 0.2s"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "1.5rem" }}>{info.emoji}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "800", color: info.color || C.navy, marginTop: "4px" }}>{info.nameEn}</div>
                </div>
                <div style={{ background: h.rank === 1 ? `linear-gradient(135deg,${C.gold},${C.goldDark})` : "#eee", color: h.rank === 1 ? C.white : "#aaa", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "900" }}>
                  {h.rank === 1 ? "👑" : `#${h.rank}`}
                </div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: info.color || C.navy }}>{h.points || 0}</div>
              <div style={{ fontSize: "0.58rem", color: "#888", marginBottom: "10px" }}>کل پوائنٹس</div>
              {pBar(h.points || 0, Math.max(...houses.map(x => x.points || 0), 1), info.color || C.gold)}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                <span style={{ fontSize: "0.6rem", color: "#888" }}>👥 {h.studs?.length || 0} طلبا</span>
                <span style={{ fontSize: "0.6rem", color: "#888" }}>📊 اوسط HVS: {h.avgHvs}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected House Detail */}
      {selectedStats && selectedInfo && (
        <div style={{ ...S.card, marginBottom: "24px", borderTop: `4px solid ${selectedInfo.color}` }}>
          <div style={{ fontSize: "0.9rem", fontWeight: "700", color: C.navy, marginBottom: "20px" }}>
            {selectedInfo.emoji} {selectedInfo.nameEn} House — تفصیلی جائزہ
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px", marginBottom: "20px" }}>
            {[
              { l: "کل پوائنٹس", v: selectedStats.points || 0, c: selectedInfo.color },
              { l: "طلبا", v: selectedStats.studs?.length || 0, c: C.abuBakr },
              { l: "HVS اندراجات", v: selectedStats.hLogs?.length || 0, c: C.teal },
              { l: "اوسط HVS", v: `${selectedStats.avgHvs}/${HVS_TOTAL}`, c: C.amber },
              { l: "بہترین ہفتہ", v: selectedStats.bestWeek, c: C.green },
              { l: "درجہ", v: `#${selectedStats.rank}`, c: C.gold },
            ].map((x, i) => (
              <div key={i} style={{ background: `${x.c}10`, borderRadius: "12px", padding: "14px", border: `1px solid ${x.c}20`, textAlign: "center" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "800", color: x.c }}>{x.v}</div>
                <div style={{ fontSize: "0.6rem", color: "#888", marginTop: "2px" }}>{x.l}</div>
              </div>
            ))}
          </div>

          {/* House students */}
          <div style={{ fontSize: "0.75rem", fontWeight: "700", color: C.navy, marginBottom: "12px" }}>👥 ہاؤس کے طلبا</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {selectedStats.studs?.map(s => (
              <span key={s.id} style={{ ...hBadge(selectedInfo.color, selectedInfo.light), fontSize: "0.65rem" }}>
                {s.name} • {s.grade}
              </span>
            ))}
          </div>

          {/* HVS history */}
          {selectedStats.hLogs?.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: C.navy, marginBottom: "10px" }}>📈 HVS تاریخ</div>
              {selectedStats.hLogs.slice(0, 5).map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.goldLight}` }}>
                  <span style={{ fontSize: "0.62rem", color: "#888", fontFamily: "monospace", direction: "ltr" }}>{l.week}</span>
                  <div style={{ flex: 1, margin: "0 12px" }}>{pBar(l.total || 0, HVS_TOTAL, selectedInfo.color)}</div>
                  <span style={{ fontSize: "0.68rem", fontWeight: "700", color: selectedInfo.color }}>{l.total}/{HVS_TOTAL}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comparison Table */}
      <div style={S.card}>
        <div style={{ fontSize: "0.85rem", fontWeight: "700", color: C.navy, marginBottom: "16px" }}>📊 ہاؤس موازنہ</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={S.th}>ہاؤس</th>
              <th style={S.th}>درجہ</th>
              <th style={S.th}>پوائنٹس</th>
              <th style={S.th}>طلبا</th>
              <th style={S.th}>HVS اندراجات</th>
              <th style={S.th}>اوسط HVS</th>
              <th style={S.th}>بہترین</th>
            </tr></thead>
            <tbody>
              {houseStats.map((h, i) => {
                const info = HOUSES.find(x => x.id === h.id) || {};
                return (
                  <tr key={h.id} style={{ background: i === 0 ? `${info.color}08` : undefined }}>
                    <td style={S.td}><span style={hBadge(info.color, info.light)}>{info.emoji} {info.nameEn}</span></td>
                    <td style={{ ...S.td, fontWeight: "800", color: i === 0 ? C.gold : "#888" }}>{i === 0 ? "👑 1st" : `#${i + 1}`}</td>
                    <td style={{ ...S.td, fontWeight: "800", color: info.color }}>{h.points || 0}</td>
                    <td style={S.td}>{h.studs?.length || 0}</td>
                    <td style={S.td}>{h.hLogs?.length || 0}</td>
                    <td style={S.td}>{h.avgHvs}/{HVS_TOTAL}</td>
                    <td style={{ ...S.td, color: C.green, fontWeight: "700" }}>{h.bestWeek}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===================== HPRI RISK SYSTEM =====================
// WHY: High Priority Risk Intervention — at-risk students ko early identify karna
function HPRISystem({ students, addData }) {
  const [risks, setRisks] = useState([]);
  const [show, setShow] = useState(false);
  const [f, setF] = useState({
    studentId: "", riskType: "attendance", severity: "medium",
    description: "", actionRequired: "", assignedTo: "", dueDate: "", status: "open"
  });
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "hpri_risks"), orderBy("createdAt", "desc"), limit(50)),
      s => setRisks(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const add = async () => {
    if (!f.studentId || !f.description) return;
    await addData("hpri_risks", { ...f });
    setShow(false);
    setF({ studentId: "", riskType: "attendance", severity: "medium", description: "", actionRequired: "", assignedTo: "", dueDate: "", status: "open" });
  };

  const resolveRisk = async (id) => {
    await updateDoc(doc(db, "hpri_risks", id), { status: "resolved", resolvedAt: serverTimestamp() });
  };

  const riskTypes = {
    attendance: "✅ حاضری",
    academic: "📚 تعلیمی",
    behavioral: "⚠️ رویہ",
    hifz: "📖 حفظ",
    fee: "💰 فیس",
    family: "🏠 خاندانی"
  };

  const severityConfig = {
    high: { c: C.red, bg: "#fee2e2", label: "زیادہ خطرہ" },
    medium: { c: C.amber, bg: "#fef3c7", label: "درمیانہ" },
    low: { c: C.green, bg: "#dcfce7", label: "کم خطرہ" }
  };

  const filtered = risks.filter(r => filterStatus === "all" || r.status === filterStatus);
  const openCount = risks.filter(r => r.status === "open").length;
  const highCount = risks.filter(r => r.severity === "high" && r.status === "open").length;

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: "700", color: C.navy }}>⚠️ HPRI رسک سسٹم</div>
          <div style={{ fontSize: "0.62rem", color: "#888", marginTop: "2px" }}>High Priority Risk Intervention — خطرے میں طلبا</div>
        </div>
        <button style={{ ...S.addBtn, background: `linear-gradient(135deg,${C.red},#b91c1c)` }} onClick={() => setShow(!show)}>+ نیا رسک</button>
      </div>

      {/* Alert Banner */}
      {highCount > 0 && (
        <div style={{ background: "#fee2e2", border: `2px solid ${C.red}`, borderRadius: "14px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>🚨</span>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: "700", color: C.red }}>فوری توجہ درکار!</div>
            <div style={{ fontSize: "0.62rem", color: "#888" }}>{highCount} طلبا کو فوری مداخلت کی ضرورت ہے</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { c: C.red, i: "🚨", n: highCount, l: "فوری خطرہ" },
          { c: C.amber, i: "⚠️", n: openCount, l: "کھلے کیسز" },
          { c: C.green, i: "✅", n: risks.filter(r => r.status === "resolved").length, l: "حل شدہ" },
          { c: C.navy, i: "📋", n: risks.length, l: "کل کیسز" }
        ].map((x, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg,${x.c}12,${x.c}05)`, borderRadius: "16px", padding: "16px", border: `2px solid ${x.c}20`, textAlign: "center" }}>
            <div style={{ fontSize: "1.3rem" }}>{x.i}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: x.c }}>{x.n}</div>
            <div style={{ fontSize: "0.6rem", color: "#888", marginTop: "2px" }}>{x.l}</div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {show && (
        <div style={{ ...S.card, marginBottom: "20px", background: "linear-gradient(135deg,#fee2e2,#fff5f5)", border: `2px solid ${C.red}30` }}>
          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: C.navy, marginBottom: "16px" }}>⚠️ نیا رسک کیس درج کریں</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>طالب علم *</label>
              <select style={S.inpSm} value={f.studentId} onChange={e => setF({ ...f, studentId: e.target.value })}>
                <option value="">-- منتخب کریں --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>رسک کی قسم</label>
              <select style={S.inpSm} value={f.riskType} onChange={e => setF({ ...f, riskType: e.target.value })}>
                {Object.entries(riskTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>شدت</label>
              <select style={S.inpSm} value={f.severity} onChange={e => setF({ ...f, severity: e.target.value })}>
                <option value="high">🔴 زیادہ خطرہ</option>
                <option value="medium">🟡 درمیانہ</option>
                <option value="low">🟢 کم خطرہ</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>ذمہ دار</label>
              <input style={S.inpSm} value={f.assignedTo} onChange={e => setF({ ...f, assignedTo: e.target.value })} placeholder="استاد کا نام..." />
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>آخری تاریخ</label>
              <input style={{ ...S.inpSm, direction: "ltr" }} type="date" value={f.dueDate} onChange={e => setF({ ...f, dueDate: e.target.value })} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>مسئلے کی تفصیل *</label>
              <textarea style={{ ...S.inpSm, minHeight: "70px", resize: "vertical" }} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="مسئلے کی تفصیل..." />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>مطلوبہ اقدام</label>
              <textarea style={{ ...S.inpSm, minHeight: "60px", resize: "vertical" }} value={f.actionRequired} onChange={e => setF({ ...f, actionRequired: e.target.value })} placeholder="کیا کرنا ضروری ہے..." />
            </div>
          </div>
          <button style={{ ...S.saveBtn, background: `linear-gradient(135deg,${C.red},#b91c1c)` }} onClick={add}>⚠️ رسک درج کریں</button>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[["all", "سب"], ["open", "کھلے"], ["resolved", "حل شدہ"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilterStatus(v)} style={{ padding: "7px 14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "0.62rem", fontWeight: filterStatus === v ? "700" : "400", background: filterStatus === v ? `linear-gradient(135deg,${C.red},#b91c1c)` : C.white, color: filterStatus === v ? C.white : "#888", fontFamily: "inherit" }}>{l}</button>
        ))}
      </div>

      {/* Risk Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map(r => {
          const st = students.find(s => s.id === r.studentId);
          const h = HOUSES.find(x => x.id === st?.houseId);
          const sev = severityConfig[r.severity] || severityConfig.medium;
          const isOverdue = r.dueDate && r.status === "open" && new Date(r.dueDate) < new Date();
          return (
            <div key={r.id} style={{ ...S.card, borderRight: `4px solid ${sev.c}`, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: C.navy }}>{st?.name || "—"}</span>
                    {h && <span style={hBadge(h.color, h.light)}>{h.emoji}</span>}
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.58rem", fontWeight: "700", background: sev.bg, color: sev.c }}>{sev.label}</span>
                    {isOverdue && <span style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "0.55rem", fontWeight: "700", background: "#fee2e2", color: C.red }}>⏰ تاخیر!</span>}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "#888" }}>{st?.grade} • {riskTypes[r.riskType]}</div>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "0.58rem", fontWeight: "700", background: r.status === "resolved" ? "#dcfce7" : "#fef3c7", color: r.status === "resolved" ? C.green : C.amber }}>
                  {r.status === "resolved" ? "✅ حل شدہ" : "⏳ کھلا"}
                </span>
              </div>
              <div style={{ fontSize: "0.68rem", color: "#555", marginBottom: "8px", lineHeight: "1.6" }}>{r.description}</div>
              {r.actionRequired && (
                <div style={{ background: "#fef3c7", borderRadius: "8px", padding: "8px 12px", fontSize: "0.62rem", color: C.amber, marginBottom: "8px" }}>
                  📋 مطلوبہ اقدام: {r.actionRequired}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {r.assignedTo && <span style={{ fontSize: "0.6rem", color: "#888" }}>👤 {r.assignedTo}</span>}
                  {r.dueDate && <span style={{ fontSize: "0.6rem", color: isOverdue ? C.red : "#888", fontFamily: "monospace", direction: "ltr" }}>📅 {r.dueDate}</span>}
                </div>
                {r.status === "open" && (
                  <button onClick={() => resolveRisk(r.id)} style={{ ...S.saveBtn, padding: "5px 14px", fontSize: "0.6rem" }}>✅ حل کریں</button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ ...S.card, textAlign: "center", color: "#bbb", padding: "60px" }}>
            {filterStatus === "open" ? "✅ کوئی کھلا رسک نہیں — ماشاءاللہ!" : "کوئی ریکارڈ نہیں"}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== REGISTRAR HUB =====================
// WHY: Registrar = school ka official record keeper — admissions, documents, certificates
function RegistrarHub({ students, addData }) {
  const [admissions, setAdmissions] = useState([]);
  const [show, setShow] = useState(false);
  const [tab, setTab] = useState("admissions");
  const [f, setF] = useState({
    studentName: "", fatherName: "", dob: "", address: "",
    phone: "", grade: "Grade 1", previousSchool: "",
    admissionDate: new Date().toISOString().split("T")[0],
    admissionNo: "", status: "pending", documents: ""
  });
  const [q, setQ] = useState("");

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "admissions"), orderBy("createdAt", "desc"), limit(50)),
      s => setAdmissions(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const add = async () => {
    if (!f.studentName || !f.phone) return;
    await addData("admissions", { ...f });
    setShow(false);
    setF({ studentName: "", fatherName: "", dob: "", address: "", phone: "", grade: "Grade 1", previousSchool: "", admissionDate: new Date().toISOString().split("T")[0], admissionNo: "", status: "pending", documents: "" });
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "admissions", id), { status, updatedAt: serverTimestamp() });
  };

  const statusConfig = {
    pending: { c: C.amber, bg: "#fef3c7", label: "زیر التواء" },
    approved: { c: C.green, bg: "#dcfce7", label: "منظور" },
    rejected: { c: C.red, bg: "#fee2e2", label: "مسترد" },
    enrolled: { c: C.abuBakr, bg: "#dbeafe", label: "داخل" }
  };

  const filtered = admissions.filter(a => !q || a.studentName?.includes(q) || a.admissionNo?.includes(q));
  const pending = admissions.filter(a => a.status === "pending").length;
  const approved = admissions.filter(a => a.status === "approved").length;
  const enrolled = admissions.filter(a => a.status === "enrolled").length;

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: "700", color: C.navy }}>📋 رجسٹرار ہب</div>
          <div style={{ fontSize: "0.62rem", color: "#888", marginTop: "2px" }}>داخلہ، دستاویزات، اور سرکاری ریکارڈ</div>
        </div>
        <button style={S.addBtn} onClick={() => setShow(!show)}>+ نیا داخلہ</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { c: C.amber, i: "⏳", n: pending, l: "زیر التواء" },
          { c: C.green, i: "✅", n: approved, l: "منظور شدہ" },
          { c: C.abuBakr, i: "🎓", n: enrolled, l: "داخل طلبا" },
          { c: C.navy, i: "📋", n: admissions.length, l: "کل درخواستیں" }
        ].map((x, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg,${x.c}12,${x.c}05)`, borderRadius: "16px", padding: "16px", border: `2px solid ${x.c}20`, textAlign: "center" }}>
            <div style={{ fontSize: "1.3rem" }}>{x.i}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: x.c }}>{x.n}</div>
            <div style={{ fontSize: "0.6rem", color: "#888", marginTop: "2px" }}>{x.l}</div>
          </div>
        ))}
      </div>

      {/* Pending Alert */}
      {pending > 0 && (
        <div style={{ background: "#fef3c7", border: `2px solid ${C.amber}`, borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", fontSize: "0.68rem", color: C.amber, fontWeight: "700" }}>
          ⏳ {pending} داخلہ درخواستیں زیر التواء ہیں — فیصلہ کریں!
        </div>
      )}

      {/* Add Form */}
      {show && (
        <div style={{ ...S.card, marginBottom: "20px", background: `linear-gradient(135deg,${C.goldLight},#fdf8ee)`, border: `2px solid ${C.gold}30` }}>
          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: C.navy, marginBottom: "16px" }}>📋 نئی داخلہ درخواست</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>طالب علم کا نام *</label>
              <input style={S.inpSm} value={f.studentName} onChange={e => setF({ ...f, studentName: e.target.value })} placeholder="مکمل نام..." />
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>والد کا نام</label>
              <input style={S.inpSm} value={f.fatherName} onChange={e => setF({ ...f, fatherName: e.target.value })} placeholder="والد کا نام..." />
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>تاریخ پیدائش</label>
              <input style={{ ...S.inpSm, direction: "ltr" }} type="date" value={f.dob} onChange={e => setF({ ...f, dob: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>جماعت</label>
              <select style={S.inpSm} value={f.grade} onChange={e => setF({ ...f, grade: e.target.value })}>
                {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>فون نمبر *</label>
              <input style={{ ...S.inpSm, direction: "ltr" }} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="0300-1234567" />
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>داخلہ نمبر</label>
              <input style={{ ...S.inpSm, direction: "ltr" }} value={f.admissionNo} onChange={e => setF({ ...f, admissionNo: e.target.value })} placeholder="ADM-2026-001" />
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>پچھلا اسکول</label>
              <input style={S.inpSm} value={f.previousSchool} onChange={e => setF({ ...f, previousSchool: e.target.value })} placeholder="پچھلے اسکول کا نام..." />
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>داخلہ تاریخ</label>
              <input style={{ ...S.inpSm, direction: "ltr" }} type="date" value={f.admissionDate} onChange={e => setF({ ...f, admissionDate: e.target.value })} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>پتہ</label>
              <input style={S.inpSm} value={f.address} onChange={e => setF({ ...f, address: e.target.value })} placeholder="مکمل پتہ..." />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: "0.62rem", color: "#888", marginBottom: "4px", display: "block" }}>دستاویزات (جو جمع کرائے)</label>
              <input style={S.inpSm} value={f.documents} onChange={e => setF({ ...f, documents: e.target.value })} placeholder="B-Form، تصویر، گزشتہ نتائج..." />
            </div>
          </div>
          <button style={S.saveBtn} onClick={add}>✅ درخواست محفوظ کریں</button>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input style={{ ...S.inpSm, direction: "rtl" }} placeholder="🔍 نام یا داخلہ نمبر..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {/* Table */}
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={S.th}>نام</th>
              <th style={S.th}>والد</th>
              <th style={S.th}>جماعت</th>
              <th style={S.th}>داخلہ نمبر</th>
              <th style={S.th}>فون</th>
              <th style={S.th}>تاریخ</th>
              <th style={S.th}>حال</th>
              <th style={S.th}>عمل</th>
            </tr></thead>
            <tbody>
              {filtered.map(a => {
                const sc = statusConfig[a.status] || statusConfig.pending;
                return (
                  <tr key={a.id}>
                    <td style={{ ...S.td, fontWeight: "700" }}>{a.studentName}</td>
                    <td style={S.td}>{a.fatherName || "—"}</td>
                    <td style={S.td}>{a.grade}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", direction: "ltr", fontSize: "0.6rem", color: C.gold }}>{a.admissionNo || "—"}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", direction: "ltr", fontSize: "0.6rem" }}>{a.phone}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", direction: "ltr", fontSize: "0.6rem" }}>{a.admissionDate}</td>
                    <td style={S.td}><span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "0.58rem", fontWeight: "700", background: sc.bg, color: sc.c }}>{sc.label}</span></td>
                    <td style={S.td}>
                      {a.status === "pending" && (
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button onClick={() => updateStatus(a.id, "approved")} style={{ ...S.saveBtn, padding: "4px 8px", fontSize: "0.55rem" }}>✅</button>
                          <button onClick={() => updateStatus(a.id, "rejected")} style={{ ...S.dangerBtn, padding: "4px 8px", fontSize: "0.55rem" }}>❌</button>
                        </div>
                      )}
                      {a.status === "approved" && (
                        <button onClick={() => updateStatus(a.id, "enrolled")} style={{ ...S.addBtn, padding: "4px 10px", fontSize: "0.55rem" }}>داخل کریں 🎓</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", color: "#bbb", padding: "40px" }}>کوئی ریکارڈ نہیں ملا</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
