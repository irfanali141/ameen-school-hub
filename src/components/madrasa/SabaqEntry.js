/* eslint-disable */
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../supabase";

const G = "#d4af37"; const N = "#0f172a"; const N2 = "#1e293b"; const P = "#1B4332";

const SURAHS = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس",
];

const LOG_TYPES = [
  { id:"sabaq",         label:"سبق",         labelEn:"Sabaq",       color:"#60a5fa" },
  { id:"sabqi",         label:"سبقی",         labelEn:"Sabqi",       color:"#4ade80" },
  { id:"manzil",        label:"منزل",         labelEn:"Manzil",      color:"#f59e0b" },
  { id:"dohrai_hafta",  label:"دہرائی ہفتہ", labelEn:"Weekly",      color:"#a78bfa" },
  { id:"dohrai_mahina", label:"دہرائی ماہ",   labelEn:"Monthly",     color:"#fb923c" },
];

const SURAH_AYATS={"الفاتحة":7,"البقرة":286,"آل عمران":200,"النساء":176,"المائدة":120,"الأنعام":165,"الأعراف":206,"الأنفال":75,"التوبة":129,"يونس":109,"هود":123,"يوسف":111,"الرعد":43,"إبراهيم":52,"الحجر":99,"النحل":128,"الإسراء":111,"الكهف":110,"مريم":98,"طه":135,"الأنبياء":112,"الحج":78,"المؤمنون":118,"النور":64,"الفرقان":77,"الشعراء":227,"النمل":93,"القصص":88,"العنكبوت":69,"الروم":60,"لقمان":34,"السجدة":30,"الأحزاب":73,"سبأ":54,"فاطر":45,"يس":83,"الصافات":182,"ص":88,"الزمر":75,"غافر":85,"فصلت":54,"الشورى":53,"الزخرف":89,"الدخان":59,"الجاثية":37,"الأحقاف":35,"محمد":38,"الفتح":29,"الحجرات":18,"ق":45,"الذاريات":60,"الطور":49,"النجم":62,"القمر":55,"الرحمن":78,"الواقعة":96,"الحديد":29,"المجادلة":22,"الحشر":24,"الممتحنة":13,"الصف":14,"الجمعة":11,"المنافقون":11,"التغابن":18,"الطلاق":12,"التحريم":12,"الملك":30,"القلم":52,"الحاقة":52,"المعارج":44,"نوح":28,"الجن":28,"المزمل":20,"المدثر":56,"القيامة":40,"الإنسان":31,"المرسلات":50,"النبأ":40,"النازعات":46,"عبس":42,"التكوير":29,"الانفطار":19,"المطففين":36,"الانشقاق":25,"البروج":22,"الطارق":17,"الأعلى":19,"الغاشية":26,"الفجر":30,"البلد":20,"الشمس":15,"الليل":21,"الضحى":11,"الشرح":8,"التين":8,"العلق":19,"القدر":5,"البينة":8,"الزلزلة":8,"العاديات":11,"القارعة":11,"التكاثر":8,"العصر":3,"الهمزة":9,"الفيل":5,"قريش":4,"الماعون":7,"الكوثر":3,"الكافرون":6,"النصر":3,"المسد":5,"الإخلاص":4,"الفلق":5,"الناس":6};

const FRACTIONS = ["1/8","1/6","1/5","1/4","1/3","1/2","2/3","3/4","1"];

// ── Ability levels (ذہانت) ───────────────────────────────────────────────────
const ABILITY_LEVELS = [
  { id:"advanced",  label:"ذہین",    fraction:"1/2", color:"#4ade80", linesPerDay:8,  desc:"½ صفحہ/روز" },
  { id:"good",      label:"اچھا",    fraction:"1/3", color:"#60a5fa", linesPerDay:5,  desc:"⅓ صفحہ/روز" },
  { id:"average",   label:"درمیانہ", fraction:"1/4", color:"#f59e0b", linesPerDay:4,  desc:"¼ صفحہ/روز" },
  { id:"slow",      label:"سست",     fraction:"1/6", color:"#f87171", linesPerDay:2,  desc:"⅙ صفحہ/روز" },
];

// 30 Quran para names (short opening words)
const PARA_NAMES = [
  "الم","سيقول","تلك الرسل","لن تنالوا","والمحصنات",
  "لا يحب","وإذا سمعوا","ولو أننا","قال الملأ","واعلموا",
  "يعتذرون","وما من دابة","وما أبرئ","ربما","سبحان",
  "قال ألم","اقترب","قد أفلح","وقال الذين","أمن خلق",
  "اتل ما أوحي","ومن يقنت","ومالي","فمن أظلم","إليه يرد",
  "حم","قال فما","قد سمع","تبارك","عم",
];

// Para (Juz) boundaries: [para_num, surah_1based, first_ayat_of_para]
// Source: standard Quran division
const PARA_STARTS = [
  [1,1,1],[2,2,142],[3,2,253],[4,3,93],[5,4,24],
  [6,4,148],[7,5,82],[8,6,111],[9,7,88],[10,8,41],
  [11,9,93],[12,11,6],[13,12,53],[14,15,1],[15,17,1],
  [16,18,75],[17,21,1],[18,23,1],[19,25,21],[20,27,56],
  [21,29,46],[22,33,31],[23,36,28],[24,39,32],[25,41,47],
  [26,46,1],[27,51,31],[28,58,1],[29,67,1],[30,78,1],
];

// Returns para number (1-30) for a given surah name + ayat number
const getParaForAyat = (surahName, ayat) => {
  const si = SURAHS.indexOf(surahName) + 1;
  if (si <= 0) return null;
  const a = parseInt(ayat) || 1;
  let para = 1;
  for (const [p, s, fa] of PARA_STARTS) {
    if (s < si || (s === si && fa <= a)) para = p;
  }
  return para;
};

// Total ayats in a given para (computed from PARA_STARTS + SURAH_AYATS)
const getParaAyatTotal = (paraNum) => {
  if (paraNum < 1 || paraNum > 30) return null;
  const [, s1, a1] = PARA_STARTS[paraNum - 1];
  const next = PARA_STARTS[paraNum]; // undefined for para 30
  let total = 0;
  const s2 = next ? next[1] : 115;
  const a2 = next ? next[2] : 1;
  for (let si = s1; si <= (next ? s2 : 114); si++) {
    const max = SURAH_AYATS[SURAHS[si - 1]] || 0;
    if (si === s1 && si === s2)      total += a2 - a1;
    else if (si === s1)              total += max - a1 + 1;
    else if (next && si === s2)      total += a2 - 1;
    else                             total += max;
  }
  return total;
};

// Returns para boundaries that fall within a page of a surah
// Returns [{endingPara, newPara, atAyat}] for each para boundary in [pageFrom..pageTo]
const getParaBoundariesInPage = (surahName, pageFrom, pageTo) => {
  const si = SURAHS.indexOf(surahName) + 1;
  if (si <= 0) return [];
  return PARA_STARTS
    .filter(([p, s]) => p > 1 && s === si)
    .map(([p, , a]) => ({ endingPara: p - 1, newPara: p, atAyat: a - 1 }))
    .filter(b => b.atAyat >= pageFrom && b.atAyat <= pageTo);
};

// Returns all para boundaries for a surah (for summary display)
const getSurahParaBoundaries = (surahName) => {
  const si = SURAHS.indexOf(surahName) + 1;
  if (si <= 0) return [];
  const surahMax = SURAH_AYATS[surahName] || 0;
  const result = [];
  // Find which paras this surah belongs to
  for (let p = 1; p <= 30; p++) {
    const [, s1, a1] = PARA_STARTS[p - 1];
    const next = PARA_STARTS[p];
    const endSurah = next ? (next[2] > 1 ? next[1] : next[1] - 1) : 114;
    const endAyat  = next ? (next[1] === si && next[2] > 1 ? next[2] - 1 : surahMax) : surahMax;
    // Does this para include this surah?
    if ((s1 < si) || (s1 === si)) {
      if (endSurah >= si) {
        const from = s1 === si ? a1 : 1;
        const to   = endSurah === si ? endAyat : surahMax;
        if (from <= surahMax && to >= 1) result.push({ para: p, from, to });
      }
    }
  }
  return result;
};

// Returns all surahs with their ayat ranges within a para
const getParaSurahs = (paraNum) => {
  if (paraNum < 1 || paraNum > 30) return [];
  const [, s1, a1] = PARA_STARTS[paraNum - 1];
  let endSurah, endAyat;
  if (paraNum < 30) {
    const [, sN, aN] = PARA_STARTS[paraNum];
    if (aN > 1) { endSurah = sN; endAyat = aN - 1; }
    else { endSurah = sN - 1; endAyat = SURAH_AYATS[SURAHS[sN - 2]]; }
  } else { endSurah = 114; endAyat = SURAH_AYATS[SURAHS[113]]; }
  const surahs = [];
  for (let si = s1; si <= endSurah; si++) {
    const surah = SURAHS[si - 1];
    const from  = si === s1 ? a1 : 1;
    const to    = si === endSurah ? endAyat : SURAH_AYATS[surah];
    surahs.push({ surah, from, to, count: to - from + 1 });
  }
  return surahs;
};

// Convert coverage fraction to پاؤ label
const fractionToPawo = (f) => {
  if (f <= 0)    return null;
  if (f < 0.125) return { label:"پاؤ سے کم", color:"#94a3b8" };
  if (f < 0.30)  return { label:"پاؤ پارہ",  color:"#60a5fa" };
  if (f < 0.55)  return { label:"آدھا پارہ", color:"#4ade80" };
  if (f < 0.80)  return { label:"تین پاؤ",   color:"#f59e0b" };
  if (f < 1.0)   return { label:"تقریباً پورا", color:"#fb923c" };
  return           { label:"پورا پارہ",    color:"#f87171" };
};

// How many ayats of [ayatFrom, ayatTo] in surahName fall within paraNum
const getParaCoverageInSurah = (surahName, ayatFrom, ayatTo, paraNum) => {
  const si = SURAHS.indexOf(surahName) + 1;
  if (si <= 0) return 0;
  const surahMax = SURAH_AYATS[surahName] || 0;
  // Find where this para starts/ends within this surah
  let pStart = 1;        // default: para began before this surah
  let pEnd   = surahMax; // default: para continues to end of surah
  for (const [p, s, a] of PARA_STARTS) {
    if (p === paraNum     && s === si) pStart = a;
    if (p === paraNum + 1 && s === si) pEnd   = a - 1;
  }
  const ol1 = Math.max(ayatFrom, pStart);
  const ol2 = Math.min(ayatTo,   pEnd);
  return ol2 >= ol1 ? ol2 - ol1 + 1 : 0;
};

// Full surah breakdown for a given para
const getParaContent = (paraNum) => {
  if (paraNum < 1 || paraNum > 30) return [];
  const [, s1, a1] = PARA_STARTS[paraNum - 1];
  const next = PARA_STARTS[paraNum];
  let endSurah, endAyat;
  if (!next) {
    endSurah = 114; endAyat = SURAH_AYATS[SURAHS[113]];
  } else {
    const [, s2, a2] = next;
    if (a2 === 1) { endSurah = s2 - 1; endAyat = SURAH_AYATS[SURAHS[s2-2]]; }
    else           { endSurah = s2;     endAyat = a2 - 1; }
  }
  const result = [];
  for (let si = s1; si <= endSurah; si++) {
    const surah = SURAHS[si - 1];
    const max   = SURAH_AYATS[surah] || 0;
    const from  = si === s1 ? a1 : 1;
    const to    = si === endSurah ? endAyat : max;
    if (from <= to) result.push({ surah, from, to, count: to - from + 1 });
  }
  return result;
};

// ── Page helpers (16-line Pakistani mushaf, ~20 pages per para) ──────────────
const getSurahPrimaryPara = (surahName) => {
  const si = SURAHS.indexOf(surahName) + 1;
  if (si <= 0) return 1;
  let para = 1;
  for (const [p, s] of PARA_STARTS) { if (s <= si) para = p; }
  return para;
};

const getSurahAyatsPerPage = (surahName) => {
  const para = getSurahPrimaryPara(surahName);
  const total = getParaAyatTotal(para);
  return total / 20; // each para ≈ 20 pages
};

const getSurahPageCount = (surahName) => {
  const ayats = SURAH_AYATS[surahName] || 0;
  if (!ayats) return 1;
  return Math.max(1, Math.round(ayats / getSurahAyatsPerPage(surahName)));
};

// Returns [{page, from, to, count}] for a surah
const getSurahPageBreakdown = (surahName) => {
  const total = SURAH_AYATS[surahName] || 0;
  if (!total) return [];
  const pages = getSurahPageCount(surahName);
  const app   = total / pages;           // ayats per page (fractional)
  const result = [];
  for (let p = 1; p <= pages; p++) {
    const from = Math.round((p - 1) * app) + 1;
    const to   = p === pages ? total : Math.round(p * app);
    if (from <= to && from <= total) result.push({ page:p, from, to, count: to - from + 1 });
  }
  return result;
};

// Given fraction + starting ayat → compute ending ayat
const getEndAyatForFraction = (surahName, fromAyat, fraction) => {
  const total = SURAH_AYATS[surahName] || 0;
  if (!total) return parseInt(fromAyat) || 1;
  const app   = getSurahAyatsPerPage(surahName);
  const parts = fraction.split("/").map(Number);
  const frac  = parts[0] / (parts[1] ?? 1);
  const count = Math.max(1, Math.round(app * frac));
  return Math.min((parseInt(fromAyat) || 1) + count - 1, total);
};

// Which page (1-based) does a given ayat fall on in its surah?
const getAyatPageNum = (surahName, ayat) => {
  const bd = getSurahPageBreakdown(surahName);
  const a  = parseInt(ayat) || 1;
  const pg = bd.find(p => a >= p.from && a <= p.to);
  return pg ? pg.page : null;
};

const QUALITIES  = [
  { id:"excellent", label:"ممتاز",    emoji:"🌟", color:"#4ade80", stars:5, desc:"کوئی غلطی نہیں" },
  { id:"good",      label:"اچھا",     emoji:"✅", color:G,         stars:4, desc:"1-2 غلطیاں" },
  { id:"average",   label:"درمیانہ", emoji:"🟡", color:"#fb923c", stars:3, desc:"3-5 غلطیاں" },
  { id:"weak",      label:"کمزور",   emoji:"⚠️", color:"#f87171", stars:2, desc:"6-9 غلطیاں" },
  { id:"very_weak", label:"بہت کمزور",emoji:"❌", color:"#dc2626", stars:1, desc:"10+ غلطیاں" },
];

const MISTAKE_TYPES = [
  { id:"waqf",    label:"وقف" },
  { id:"makharij",label:"مخارج" },
  { id:"madd",    label:"مد" },
  { id:"ghunna",  label:"غنہ" },
  { id:"idgham",  label:"ادغام/اخفاء/اظہار" },
  { id:"tartib",  label:"ترتیب" },
];

const getAutoGrade = (mistakes, ayatCount) => {
  const m = parseInt(mistakes) || 0;
  const total = parseInt(ayatCount) || 0;
  if (total > 0) {
    const rate = m / total;
    if (rate === 0)    return "excellent";
    if (rate <= 0.03)  return "good";
    if (rate <= 0.08)  return "average";
    if (rate <= 0.15)  return "weak";
    return               "very_weak";
  }
  if (m === 0)  return "excellent";
  if (m <= 2)   return "good";
  if (m <= 5)   return "average";
  if (m <= 9)   return "weak";
  return          "very_weak";
};

// Line count from fraction (15 lines/page base)
const fracToLines = (frac, lpp=16) => {
  const parts = frac.split("/").map(Number);
  const n = parts[0], d = parts[1] ?? 1;
  return lpp * (n / d);
};

export default function SabaqEntry({ student, onClose, onSaved, isOnline, offlinePush, setOfflineCount }) {
  const today = new Date().toISOString().slice(0,10);

  const [form, setForm] = useState({
    log_date:        today,
    log_type:        "sabaq",
    surah_name:      "",
    ayat_from:       "",
    ayat_to:         "",
    line_fraction:   "1/6",
    duration_minutes:"",
    quality:         "good",
    mistakes_count:  0,
    ustad_rating:    3,
    ustad_notes:     "",
    daily_goal:      "",
    goal_achieved:   null,
    difficult_ayat:  "",
    main_challenge:  "",
  });

  const [abilityLevel,   setAbilityLevel]   = useState(
    () => localStorage.getItem(`hifz_ability_${student.id}`) || "average"
  );
  const [hifzProgress,   setHifzProgress]   = useState(null);
  const [sabqiHistory,   setSabqiHistory]   = useState([]); // past completed cycles
  const [pageActivity,   setPageActivity]   = useState({}); // { surahName: { pageNum: {sabaq,sabqi,manzil} } }
  const [sabqiDailyLog,  setSabqiDailyLog]  = useState([]); // [{log_date, surah_name, ayat_from, ayat_to, manzil_para}]
  // Today's sabqi custom range (overrides auto-detected)
  const [sabqiTodayFrom, setSabqiTodayFrom] = useState(""); // ayat number string
  const [sabqiTodayTo,   setSabqiTodayTo]   = useState(""); // ayat number string

  const saveAbility = (id) => {
    setAbilityLevel(id);
    localStorage.setItem(`hifz_ability_${student.id}`, id);
  };

  // Load cumulative sabaq progress since last manzil
  // Load page activity data: which pages have سبق/سبقی/منزل for a given surah
  const loadPageActivity = async (surahName) => {
    if (!surahName) return {};
    try {
      const { data: recs } = await supabase.from("hifz_daily_log")
        .select("log_type,ayat_from,ayat_to,log_date,surah_name,manzil_para")
        .eq("student_id", student.id)
        .in("log_type", ["sabaq","sabqi","manzil"]);
      const bd = getSurahPageBreakdown(surahName);
      const result = {};
      const mark = (from, to, type, date) => {
        for (const pg of bd) {
          if (pg.from <= to && pg.to >= from && from > 0 && to > 0) {
            if (!result[pg.page]) result[pg.page] = {};
            if (!result[pg.page][type]) result[pg.page][type] = [];
            result[pg.page][type].push(date);
          }
        }
      };
      for (const r of (recs||[])) {
        if (r.log_type === "sabaq" && r.surah_name === surahName) {
          mark(parseInt(r.ayat_from)||0, parseInt(r.ayat_to)||0, "sabaq", r.log_date);
        } else if (r.log_type === "sabqi" && r.manzil_para) {
          const ps = getParaSurahs(r.manzil_para).find(x => x.surah === surahName);
          if (ps) mark(ps.from, ps.to, "sabqi", r.log_date);
        } else if (r.log_type === "manzil" && r.manzil_para) {
          const ps = getParaSurahs(r.manzil_para).find(x => x.surah === surahName);
          if (ps) mark(ps.from, ps.to, "manzil", r.log_date);
        }
      }
      return result;
    } catch { return {}; }
  };

  // Fetch single ayat Arabic text from alquran.cloud
  const fetchAyatText = async (surahName, ayatNum) => {
    const sIdx = SURAHS.indexOf(surahName) + 1;
    if (sIdx <= 0 || !ayatNum) return;
    setFetchingAyat(true);
    setMistakeText(null);
    setMistakeFail(false);
    setMistakeWords(new Set());
    try {
      const res  = await fetch(`https://api.alquran.cloud/v1/ayah/${sIdx}:${ayatNum}`);
      const json = await res.json();
      if (json?.code === 200 && json?.data?.text) {
        setMistakeText(json.data.text);
      } else { setMistakeFail(true); }
    } catch { setMistakeFail(true); }
    finally { setFetchingAyat(false); }
  };

  const loadHifzProgress = async () => {
    try {
      // 1. Find last manzil
      const { data: lastManzil } = await supabase.from("hifz_daily_log")
        .select("log_date,manzil_para,ayat_to")
        .eq("student_id", student.id).eq("log_type","manzil")
        .order("log_date",{ascending:false}).limit(1).maybeSingle();

      const batchStart  = lastManzil?.log_date || "2000-01-01";
      const lastManPara = lastManzil?.ayat_to  || 0; // end para of last manzil

      // 2. Load all sabaq since last manzil
      const { data: sabaqList } = await supabase.from("hifz_daily_log")
        .select("surah_name,ayat_from,ayat_to,log_date")
        .eq("student_id", student.id).eq("log_type","sabaq")
        .gt("log_date", batchStart)
        .order("log_date",{ascending:true});

      if (!sabaqList?.length) return null;

      // 3. Cumulative ayats memorized this batch
      const cumAyats = sabaqList.reduce((sum, s) => {
        const f = parseInt(s.ayat_from)||0, t = parseInt(s.ayat_to)||0;
        return sum + (t >= f ? t - f + 1 : 0);
      }, 0);

      // 4. Current para from latest sabaq position
      const last = sabaqList[sabaqList.length - 1];
      const currPara   = getParaForAyat(last.surah_name, last.ayat_to) || 1;
      const paraTotal  = getParaAyatTotal(currPara) || 1;

      // 5. Para we're targeting = next after last manzil
      const targetPara = lastManPara ? (lastManPara % 30) + 1 : currPara;
      const targetTotal = getParaAyatTotal(targetPara) || paraTotal;

      // 6. Derive ayats/day for each ability from the surah context
      const surahApp = getSurahAyatsPerPage ? getSurahAyatsPerPage(last.surah_name) : 7;
      const first = sabaqList[0];

      return {
        cumAyats,
        targetTotal,
        targetPara,
        currPara,
        progress: Math.min(cumAyats / targetTotal, 1),
        batchDays: sabaqList.length,
        lastSabaq: last,
        isComplete: cumAyats >= targetTotal,
        lastManPara,
        ayatsPerPage: surahApp,
        batchStart,
        // Full batch range for سبقی auto-fill
        batchFirstSurah: first.surah_name,
        batchFirstAyat:  parseInt(first.ayat_from) || 1,
        batchLastSurah:  last.surah_name,
        batchLastAyat:   parseInt(last.ayat_to) || 1,
        sabaqList,
      };
    } catch { return null; }
  };

  // Load past sabqi cycles: each manzil record = 1 completed cycle
  const loadSabqiHistory = async () => {
    try {
      // All manzil records (each marks end of a sabqi cycle)
      const { data: manzils } = await supabase.from("hifz_daily_log")
        .select("log_date,manzil_para,ayat_from,ayat_to,surah_name")
        .eq("student_id", student.id).eq("log_type","manzil")
        .order("log_date",{ascending:true});
      // All sabaq records ever
      const { data: allSabaq } = await supabase.from("hifz_daily_log")
        .select("surah_name,ayat_from,ayat_to,log_date")
        .eq("student_id", student.id).eq("log_type","sabaq")
        .order("log_date",{ascending:true});
      if (!manzils?.length) return [];
      const history = [];
      let prevDate = "2000-01-01";
      for (const m of manzils) {
        const batch = (allSabaq||[]).filter(s => s.log_date > prevDate && s.log_date <= m.log_date);
        const ayats = batch.reduce((sum,s) => {
          const f=parseInt(s.ayat_from)||0, t=parseInt(s.ayat_to)||0;
          return sum+(t>=f?t-f+1:0);
        },0);
        history.push({
          manzilDate:  m.log_date,
          manzilPara:  m.manzil_para,
          batchDays:   batch.length,
          batchAyats:  ayats,
          startSurah:  batch[0]?.surah_name  || "",
          startAyat:   batch[0]?.ayat_from   || "",
          endSurah:    batch[batch.length-1]?.surah_name || "",
          endAyat:     batch[batch.length-1]?.ayat_to   || "",
        });
        prevDate = m.log_date;
      }
      return history;
    } catch { return []; }
  };

  // Load all sabqi sessions for this student (for daily timeline in surah breakdown)
  const loadSabqiDailyLog = async () => {
    try {
      const { data } = await supabase.from("hifz_daily_log")
        .select("log_date,surah_name,ayat_from,ayat_to,manzil_para,quality,mistakes_count")
        .eq("student_id", student.id).eq("log_type","sabqi")
        .order("log_date",{ascending:false}).limit(90);
      return data || [];
    } catch { return []; }
  };

  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [err,            setErr]            = useState("");
  const [ayatErr,        setAyatErr]        = useState("");
  const [todayDone,      setTodayDone]      = useState({sabaq:false,sabqi:false,manzil:false});
  const [todaySabaq,     setTodaySabaq]     = useState(null);
  const [lastSabaqNext,  setLastSabaqNext]  = useState(null); // {surah, ayat_from, prev}
  const [lastSabqiLevel, setLastSabqiLevel] = useState(null);
  const [lastManzilPara, setLastManzilPara] = useState(null);
  const [manzilPara,     setManzilPara]     = useState(null); // start para for منزل
  const [manzilCount,    setManzilCount]    = useState(1);   // how many paras today
  const [showParaDetail,     setShowParaDetail]     = useState(false);
  const [showPageBreakdown,  setShowPageBreakdown]  = useState(false);
  // Custom ayat ranges within منزل: key = `${para}_${surah}`, value = {from, to}
  const [manzilRanges,   setManzilRanges]   = useState({});
  // Per-surah mistake counters in منزل: key = `${para}_${surah}`, value = count
  // Per-surah mistake ayats: { [rKey]: Set<number> }
  const [manzilMistakeAyats, setManzilMistakeAyats] = useState({});
  const [manzilMistakeOpen,  setManzilMistakeOpen]  = useState(null);
  const [manzilEditing,  setManzilEditing]  = useState(null); // key being edited
  const [manzilEditFrom, setManzilEditFrom] = useState("");
  const [manzilEditTo,   setManzilEditTo]   = useState("");
  const [sabqiPara,      setSabqiPara]      = useState(1);    // which para in سبقی today
  const [sabqiParaAuto,  setSabqiParaAuto]  = useState(false);// was para auto-detected?
  const [sabqiCross,     setSabqiCross]     = useState(false);
  const [sabqiEndSurah,  setSabqiEndSurah]  = useState("");
  const [sabqiEndAyat,   setSabqiEndAyat]   = useState("");
  const [qualityOverridden, setQualityOverridden] = useState(false);

  // ── New detailed mistake tracker ──────────────────────────────
  // Each entry: { id, surah, ayat, arabicText, textFail, manualText, selectedWords:Set, types:Set }
  const [sabaqMistakes,  setSabaqMistakes]  = useState([]); // سبق
  const [sabqiMistakes,  setSabqiMistakes]  = useState([]); // سبقی
  const [manzilMistakes, setManzilMistakes] = useState([]); // منزل
  // Active entry being composed
  const [addingMistake,  setAddingMistake]  = useState(false);
  const [mistakeEntry,   setMistakeEntry]   = useState({ surah:"", ayat:1 });
  const [mistakeText,    setMistakeText]    = useState(null);   // fetched Arabic text
  const [mistakeFail,    setMistakeFail]    = useState(false);
  const [mistakeWords,   setMistakeWords]   = useState(new Set()); // selected word indices
  const [mistakeTypes,   setMistakeTypes]   = useState(new Set()); // selected type ids
  const [mistakeManual,  setMistakeManual]  = useState("");
  const [fetchingAyat,   setFetchingAyat]   = useState(false);

  // Auto-grade whenever mistakes_count changes (unless ustaz manually overrode)
  useEffect(() => {
    if (qualityOverridden) return;
    // For سبقی: use total ayats in para; for others: use form range
    let ayatCount = 0;
    if (form.log_type === "sabqi") {
      ayatCount = getParaAyatTotal(sabqiPara) || 0;
    } else {
      ayatCount = (parseInt(form.ayat_to)||0) - (parseInt(form.ayat_from)||0) + 1;
    }
    const grade = getAutoGrade(form.mistakes_count, ayatCount > 0 ? ayatCount : 0);
    const q = QUALITIES.find(x => x.id === grade);
    if (q) {
      setForm(f => ({ ...f, quality: grade, ustad_rating: q.stars }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.mistakes_count]);

  // Sync mistake counts → form.mistakes_count (new detailed tracker)
  useEffect(() => {
    if (form.log_type === "sabaq")  setForm(f => ({ ...f, mistakes_count: sabaqMistakes.length }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sabaqMistakes, form.log_type]);
  useEffect(() => {
    if (form.log_type === "sabqi")  setForm(f => ({ ...f, mistakes_count: sabqiMistakes.length }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sabqiMistakes, form.log_type]);
  useEffect(() => {
    if (form.log_type === "manzil") setForm(f => ({ ...f, mistakes_count: manzilMistakes.length }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manzilMistakes, form.log_type]);

  // Clear active mistake entry + sabqi range when switching log type
  useEffect(() => {
    setAddingMistake(false);
    setMistakeEntry({ surah: form.surah_name || "", ayat: 1 });
    setMistakeText(null); setMistakeFail(false);
    setMistakeWords(new Set()); setMistakeTypes(new Set()); setMistakeManual("");
    if (form.log_type !== "sabqi") { setSabqiTodayFrom(""); setSabqiTodayTo(""); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.log_type]);

  // Auto-fill سبقی form — para-based (set para from current batch, fill ayat range from para boundaries)
  useEffect(() => {
    if (form.log_type !== "sabqi") return;
    if (hifzProgress) {
      const para = getParaForAyat(hifzProgress.batchFirstSurah, hifzProgress.batchFirstAyat);
      if (para) { setSabqiPara(para); setSabqiParaAuto(true); }
      // Set form ayat range: from para start to current batch end
      const pSurahs = getParaSurahs(para || sabqiPara);
      if (pSurahs.length > 0) {
        setForm(f => ({ ...f,
          surah_name: pSurahs[0].surah,
          ayat_from:  String(pSurahs[0].from),
          ayat_to:    String(hifzProgress.batchLastAyat),
        }));
      }
    } else {
      // No progress — set from para directly
      const pSurahs = getParaSurahs(sabqiPara);
      if (pSurahs.length > 0) {
        const last = pSurahs[pSurahs.length - 1];
        setForm(f => ({ ...f,
          surah_name: pSurahs[0].surah,
          ayat_from:  String(pSurahs[0].from),
          ayat_to:    String(last.to),
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.log_type]);

  // Load page activity whenever surah changes (any log type)
  useEffect(() => {
    if (!form.surah_name) return;
    if (pageActivity[form.surah_name]) return; // already cached
    loadPageActivity(form.surah_name).then(r => {
      setPageActivity(prev => ({ ...prev, [form.surah_name]: r }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.surah_name]);

  // Re-sync para range when sabqiPara changes (manual para selection)
  useEffect(() => {
    if (form.log_type !== "sabqi") return;
    const pSurahs = getParaSurahs(sabqiPara);
    if (pSurahs.length === 0) return;
    const first = pSurahs[0];
    const last  = pSurahs[pSurahs.length - 1];
    setForm(f => ({ ...f,
      surah_name: first.surah,
      ayat_from:  String(first.from),
      ayat_to:    String(last.to),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sabqiPara]);

  // Auto-fill ayat_to in سبق when surah / ayat_from / fraction changes
  useEffect(() => {
    if (form.log_type !== "sabaq") return;
    if (!form.surah_name || !form.ayat_from || !form.line_fraction) return;
    const computed = getEndAyatForFraction(form.surah_name, form.ayat_from, form.line_fraction);
    if (computed > 0) set("ayat_to", String(computed));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.surah_name, form.ayat_from, form.line_fraction, form.log_type]);

  const maxAyat = (s) => SURAH_AYATS[s] || null;

  const handleAyatTo = (val) => {
    set("ayat_to", val);
    const max = maxAyat(form.surah_name);
    const n = parseInt(val);
    const from = parseInt(form.ayat_from) || 1;
    if (max && !isNaN(n) && n > max) setAyatErr(`${form.surah_name} میں صرف ${max} آیات ہیں`);
    else if (!isNaN(n) && !isNaN(from) && n < from) setAyatErr("آخری آیت پہلی سے کم نہیں ہو سکتی");
    else setAyatErr("");
    // Auto-detect para for سبقی (use ayat_to as the reference point)
    if (form.log_type === "sabqi" && form.surah_name) {
      const p = getParaForAyat(form.surah_name, val || form.ayat_from);
      if (p) { setSabqiPara(p); setSabqiParaAuto(true); }
    }
  };

  const handleAyatFrom = (val) => {
    set("ayat_from", val);
    const max = maxAyat(form.surah_name);
    const n = parseInt(val);
    if (max && !isNaN(n) && n > max) setAyatErr(`${form.surah_name} میں صرف ${max} آیات ہیں`);
    else setAyatErr("");
    // Auto-detect para for سبقی
    if (form.log_type === "sabqi" && form.surah_name) {
      const p = getParaForAyat(form.surah_name, val);
      if (p) { setSabqiPara(p); setSabqiParaAuto(true); }
    }
  };

  const handleSurahChange = (val) => {
    set("surah_name", val);
    setAyatErr("");
    const max = SURAH_AYATS[val];
    if (max && parseInt(form.ayat_to) > max) set("ayat_to", String(max));
    if (max && parseInt(form.ayat_from) > max) set("ayat_from", "1");
    // Auto-detect para for سبقی (use current ayat_from or ayat 1)
    if (form.log_type === "sabqi" && val) {
      const p = getParaForAyat(val, form.ayat_from || 1);
      if (p) { setSabqiPara(p); setSabqiParaAuto(true); }
    }
  };
  const [audioBlob,    setAudioBlob]    = useState(null);
  const [recording,    setRecording]    = useState(false);
  const [audioURL,     setAudioURL]     = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [audioSaved,   setAudioSaved]   = useState(false);  // uploaded to Supabase
  const [recDuration,  setRecDuration]  = useState(0);      // seconds recorded
  const [recTimer,     setRecTimer]     = useState(null);
  const [showRecWarn,  setShowRecWarn]  = useState(false);  // warn before overwrite
  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);

  // Load existing record for a given type today
  const loadTodayRecord = async (type) => {
    try {
      const { data } = await supabase.from("hifz_daily_log")
        .select("*").eq("student_id", student.id).eq("log_date", today).eq("log_type", type).maybeSingle();
      return data || null;
    } catch { return null; }
  };

  // Load last sabqi entry (any date)
  // Load last sabaq (any date) → gives next starting point
  const loadLastSabaq = async () => {
    try {
      const { data } = await supabase.from("hifz_daily_log")
        .select("surah_name,ayat_from,ayat_to,log_date")
        .eq("student_id", student.id).eq("log_type","sabaq")
        .order("log_date",{ascending:false}).limit(1).maybeSingle();
      if (!data?.surah_name) return null;
      const surahMax = SURAH_AYATS[data.surah_name] || 0;
      const lastTo   = parseInt(data.ayat_to) || 0;
      if (lastTo >= surahMax) {
        // Surah complete → move to next surah, ayat 1
        const si = SURAHS.indexOf(data.surah_name);
        const nextSurah = si >= 0 && si < 113 ? SURAHS[si + 1] : null;
        return { surah: nextSurah, ayat_from: 1, prev: data };
      }
      return { surah: data.surah_name, ayat_from: lastTo + 1, prev: data };
    } catch { return null; }
  };

  const loadLastSabqi = async () => {
    try {
      const { data } = await supabase.from("hifz_daily_log")
        .select("line_fraction,manzil_para,log_date").eq("student_id", student.id)
        .eq("log_type","sabqi").order("log_date",{ascending:false}).limit(1).maybeSingle();
      return { level: data?.line_fraction || null, para: data?.manzil_para || null };
    } catch { return { level: null, para: null }; }
  };

  // Load last manzil entry (any date) to know last para done
  const loadLastManzil = async () => {
    try {
      const { data } = await supabase.from("hifz_daily_log")
        .select("manzil_para,surah_name,log_date").eq("student_id", student.id)
        .eq("log_type","manzil").order("log_date",{ascending:false}).limit(1).maybeSingle();
      return data?.manzil_para || null;
    } catch { return null; }
  };

  // Load today's status for all 3 types
  const refreshTodayStatus = async () => {
    const [sabaq, sabqi, manzil] = await Promise.all([
      loadTodayRecord("sabaq"), loadTodayRecord("sabqi"), loadTodayRecord("manzil"),
    ]);
    setTodayDone({ sabaq:!!sabaq, sabqi:!!sabqi, manzil:!!manzil });
    if (sabaq) setTodaySabaq(sabaq);
    return { sabaq, sabqi, manzil };
  };

  // On mount: load everything
  useEffect(() => {
    (async () => {
      const [{ sabaq }, lastSQRes, lastMP, lastSB, prog, hist, dlog] = await Promise.all([
        refreshTodayStatus(),
        loadLastSabqi(),
        loadLastManzil(),
        loadLastSabaq(),
        loadHifzProgress(),
        loadSabqiHistory(),
        loadSabqiDailyLog(),
      ]);
      if (prog) setHifzProgress(prog);
      if (hist?.length) setSabqiHistory(hist);
      if (dlog?.length) setSabqiDailyLog(dlog);
      // سبقی last record
      if (lastSQRes.level) setLastSabqiLevel(lastSQRes.level);
      if (lastSQRes.para)  setSabqiPara(lastSQRes.para);
      // منزل next para
      if (lastMP) {
        setLastManzilPara(lastMP);
        const next = (lastMP % 30) + 1;
        setManzilPara(next);
      } else {
        setManzilPara(1);
      }
      // today's sabaq pre-fill (edit mode)
      if (sabaq) {
        setTodaySabaq(sabaq);
        setForm(f => ({
          ...f,
          surah_name: sabaq.surah_name || "", ayat_from: sabaq.ayat_from || "",
          ayat_to: sabaq.ayat_to || "", quality: sabaq.quality || "good",
          mistakes_count: 0, ustad_rating: 3, ustad_notes: "",
          difficult_ayat: "", main_challenge: "",
        }));
        if (sabaq.audio_url) setAudioURL(sabaq.audio_url);
      } else if (lastSB?.surah) {
        // No today's sabaq → pre-fill continuation from last session
        setLastSabaqNext(lastSB);
        setForm(f => ({
          ...f,
          surah_name: lastSB.surah,
          ayat_from:  String(lastSB.ayat_from),
          ayat_to:    "",          // fraction will auto-fill this
        }));
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  const set = (k,v) => setForm(f => ({...f, [k]:v}));

  // ── Audio recording ──────────────────────────────────────────
  const doStartRecording = async () => {
    try {
      setShowRecWarn(false);
      setAudioSaved(false);
      setRecDuration(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if(e.data.size>0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type:"audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(t=>t.stop());
        // Auto-upload immediately after stop
        if (isOnline) {
          setUploading(true);
          const fname = `hifz_${student.id}_${Date.now()}.webm`;
          supabase.storage.from("hifz-recordings").upload(fname, blob, { upsert:true })
            .then(({ error }) => {
              if (!error) {
                const { data: urlData } = supabase.storage.from("hifz-recordings").getPublicUrl(fname);
                const pubUrl = urlData?.publicUrl;
                if (pubUrl) { setAudioURL(pubUrl); setAudioSaved(true); }
              }
            })
            .finally(() => setUploading(false));
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
      // Timer
      const t = setInterval(() => setRecDuration(s => s + 1), 1000);
      setRecTimer(t);
    } catch(e) { setErr("مائیکروفون تک رسائی ممکن نہ ہو سکی: " + e.message); }
  };

  const startRecording = () => {
    // If there's already a recording, warn before overwriting
    if (audioURL && !audioSaved) { setShowRecWarn(true); return; }
    if (audioURL && audioSaved)  { setShowRecWarn(true); return; }
    doStartRecording();
  };

  const stopRecording = () => {
    if (mediaRef.current && recording) {
      mediaRef.current.stop();
      setRecording(false);
      if (recTimer) { clearInterval(recTimer); setRecTimer(null); }
    }
  };

  const uploadAudio = async () => {
    // Already uploaded via auto-upload in doStartRecording; just return stored URL
    if (!audioBlob) return null;
    if (audioSaved && audioURL && !audioURL.startsWith("blob:")) return audioURL;
    setUploading(true);
    try {
      const fname = `hifz_${student.id}_${Date.now()}.webm`;
      const { error } = await supabase.storage.from("hifz-recordings").upload(fname, audioBlob, { upsert:true });
      if (error) { console.error("audio upload:", error.message); return null; }
      const { data:url } = supabase.storage.from("hifz-recordings").getPublicUrl(fname);
      const pubUrl = url?.publicUrl || null;
      if (pubUrl) { setAudioURL(pubUrl); setAudioSaved(true); }
      return pubUrl;
    } catch { return null; }
    finally { setUploading(false); }
  };

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (form.log_type === "manzil") {
      if (!manzilPara) { setErr("پارہ نمبر منتخب کریں"); return; }
    } else if (form.log_type === "sabqi") {
      if (!sabqiPara) { setErr("پارہ نمبر منتخب کریں"); return; }
      if (!form.surah_name) { setErr("سورہ کا نام درج کریں"); return; }
      if (sabqiCross && !sabqiEndSurah) { setErr("اختتامی سورہ منتخب کریں"); return; }
      if (ayatErr) { setErr(ayatErr); return; }
    } else {
      if (!form.surah_name) { setErr("سورہ کا نام درج کریں"); return; }
      if (ayatErr) { setErr(ayatErr); return; }
      const max = maxAyat(form.surah_name);
      if (max && form.ayat_to && parseInt(form.ayat_to) > max) { setErr(`${form.surah_name} میں صرف ${max} آیات ہیں`); return; }
    }
    setSaving(true); setErr("");
    try {
      let audio_url = audioURL && !audioURL.startsWith("blob:") ? audioURL : null;
      if (audioBlob && isOnline) audio_url = await uploadAudio();

      const isManzil = form.log_type === "manzil";
      const isSabqi  = form.log_type === "sabqi";
      const lines = isManzil ? fracToLines("1") : (form.line_fraction ? fracToLines(form.line_fraction) : null);

      const payload = {
        student_id:       student.id,
        student_name:     student.name,
        house_id:         student.house_id || student.houseId || null,
        log_date:         form.log_date,
        log_type:         form.log_type,
        surah_name:       isManzil
                          ? (manzilCount > 1
                              ? `پارہ ${manzilPara}–${((manzilPara + manzilCount - 2) % 30) + 1}`
                              : `پارہ ${manzilPara}`)
                          : (isSabqi && sabqiCross && sabqiEndSurah)
                            ? `${form.surah_name} ← ${sabqiEndSurah}`
                            : form.surah_name,
        ayat_from:        isManzil ? manzilPara          // start para
                          : (form.ayat_from ? parseInt(form.ayat_from) : null),
        ayat_to:          isManzil ? ((manzilPara + manzilCount - 2) % 30) + 1  // end para
                          : (isSabqi && sabqiCross && sabqiEndAyat) ? parseInt(sabqiEndAyat)
                          : (form.ayat_to ? parseInt(form.ayat_to) : null),
        manzil_para:      isManzil ? manzilPara : isSabqi ? sabqiPara : null,
        line_fraction:    isManzil ? "1" : (isSabqi ? null : form.line_fraction),
        lines_count:      lines,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        quality:          form.quality === "very_weak" ? "weak" : form.quality,
        mistakes_count:   parseInt(form.mistakes_count)||0,
        ustad_rating:     parseInt(form.ustad_rating)||3,
        ustad_notes:      form.ustad_notes || null,
        daily_goal:       isManzil ? null : (form.daily_goal || null),
        goal_achieved:    isManzil ? null : form.goal_achieved,
        difficult_ayat:   isManzil
                          ? (manzilMistakes.length > 0
                              ? manzilMistakes.map(m=>`${m.surah} آیت ${m.ayat}${[...(m.types||[])].length?` (${[...(m.types||[])].map(t=>MISTAKE_TYPES.find(x=>x.id===t)?.label||t).join("،")})`:""}`).join("، ")
                              : null)
                          : isSabqi && sabqiMistakes.length > 0
                          ? sabqiMistakes.map(m=>`${m.surah} آیت ${m.ayat}${[...(m.types||[])].length?` (${[...(m.types||[])].map(t=>MISTAKE_TYPES.find(x=>x.id===t)?.label||t).join("،")})`:""}`).join("، ")
                          : form.log_type === "sabaq" && sabaqMistakes.length > 0
                          ? sabaqMistakes.map(m=>`${m.surah} آیت ${m.ayat}${[...(m.types||[])].length?` (${[...(m.types||[])].map(t=>MISTAKE_TYPES.find(x=>x.id===t)?.label||t).join("،")})`:""}`).join("، ")
                          : (form.difficult_ayat || null),
        main_challenge:   isManzil ? null : (form.main_challenge || null),
        audio_url,
      };

      if (!isOnline) {
        offlinePush(payload);
        setOfflineCount(c => c+1);
        setSaved(true);
        setTimeout(onSaved, 1200);
        return;
      }

      const { error } = await supabase.from("hifz_daily_log").upsert(payload,
        { onConflict:"student_id,log_date,log_type" });
      if (error) { setErr(error.message); return; }

      if (form.log_type === "sabaq") {
        await updateStreak(student.id, student.name, student.house_id||student.houseId, lines||0);
      }

      await refreshTodayStatus();

      // ── Chain: sabaq → sabqi → manzil → close ──────────────
      if (form.log_type === "sabaq") {
        setSaved(true);
        setTimeout(() => {
          setSaved(false); setErr(""); setAudioBlob(null); setAudioURL(null); setAudioSaved(false); setRecDuration(0); setShowRecWarn(false);
          setTodaySabaq({ surah_name:form.surah_name, ayat_from:form.ayat_from, ayat_to:form.ayat_to });
          setLastSabaqNext(null);
          // سبقی: clear session fields, load fresh progress, form auto-fill happens via useEffect
          setQualityOverridden(false);
          loadHifzProgress().then(p => {
            if (p) {
              setHifzProgress(p);
              // Auto-fill sabqi batch range
              const isCross = p.batchFirstSurah !== p.batchLastSurah;
              if (isCross) { setSabqiCross(true); setSabqiEndSurah(p.batchLastSurah); setSabqiEndAyat(String(p.batchLastAyat)); }
              else { setSabqiCross(false); setSabqiEndSurah(""); setSabqiEndAyat(""); }
              const para = getParaForAyat(p.batchFirstSurah, p.batchFirstAyat);
              if (para) { setSabqiPara(para); setSabqiParaAuto(true); }
              setForm(f => ({ ...f, log_type:"sabqi", quality:"excellent", mistakes_count:0,
                ustad_notes:"", duration_minutes:"", line_fraction:"",
                difficult_ayat:"", main_challenge:"", ustad_rating:5,
                surah_name: p.batchFirstSurah || f.surah_name,
                ayat_from:  String(p.batchFirstAyat),
                ayat_to:    isCross ? "" : String(p.batchLastAyat),
              }));
            } else {
              setForm(f => ({ ...f, log_type:"sabqi", quality:"excellent", mistakes_count:0,
                ustad_notes:"", duration_minutes:"", line_fraction:"",
                difficult_ayat:"", main_challenge:"", ustad_rating:5 }));
            }
          });
        }, 900);
      } else if (form.log_type === "sabqi") {
        setLastSabqiLevel(form.line_fraction);
        setSabqiPara(sabqiPara);
        setSabqiTodayFrom(""); setSabqiTodayTo("");
        // Refresh daily log so new record appears immediately
        loadSabqiDailyLog().then(d => { if (d?.length) setSabqiDailyLog(d); });
        setSaved(true);
        setTimeout(() => {
          setSaved(false); setErr(""); setAudioBlob(null); setAudioURL(null); setAudioSaved(false); setRecDuration(0); setShowRecWarn(false);
          setManzilRanges({}); setManzilEditing(null); setManzilMistakeAyats({}); setManzilMistakeOpen(null);
          setQualityOverridden(false);
          // Auto-set manzilPara to the completed سبقی cycle's target para
          if (hifzProgress?.targetPara) setManzilPara(hifzProgress.targetPara);
          setForm(f => ({ ...f, log_type:"manzil", quality:"excellent",
            mistakes_count:0, ustad_notes:"", duration_minutes:"",
            difficult_ayat:"", ustad_rating:5 }));
        }, 900);
      } else if (form.log_type === "manzil") {
        const endPara = ((manzilPara + manzilCount - 2) % 30) + 1;
        setLastManzilPara(endPara);
        const nextPara = (endPara % 30) + 1;
        setManzilPara(nextPara); setManzilCount(1);
        // Reload history after manzil recorded
        loadSabqiHistory().then(h => { if(h?.length) setSabqiHistory(h); });
        // Reload progress (fresh batch starts now)
        loadHifzProgress().then(p => { setHifzProgress(p); });
        setSaved(true);
        setTimeout(onSaved, 1400);
      } else {
        setSaved(true);
        setTimeout(onSaved, 1200);
      }
    } catch(e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const updateStreak = async (sid, sname, hid, lines) => {
    try {
      const { data:existing } = await supabase.from("sabaq_streaks").select("*").eq("student_id",sid).maybeSingle();
      const today_d = new Date().toISOString().slice(0,10);
      const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);

      let newStreak = 1;
      let longest   = existing?.longest || 1;
      if (existing?.last_date === yesterday) newStreak = (existing.streak_days||0) + 1;
      else if (existing?.last_date === today_d) newStreak = existing.streak_days || 1;
      if (newStreak > longest) longest = newStreak;

      await supabase.from("sabaq_streaks").upsert({
        student_id: sid, student_name: sname, house_id: hid,
        streak_days: newStreak, longest, last_date: today_d,
        total_sabaq_days: (existing?.total_sabaq_days||0)+1,
        total_lines_memorized: (existing?.total_lines_memorized||0) + lines,
        updated_at: new Date().toISOString(),
      }, { onConflict:"student_id" });
    } catch(e) { console.error("streak update:", e.message); }
  };

  const inp = { padding:"9px 12px", borderRadius:9, border:"1px solid rgba(212,175,55,0.25)",
    background:"rgba(255,255,255,0.06)", color:"#f1f5f9", fontSize:"0.78rem",
    fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box", colorScheme:"dark" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:9000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:12 }}
      onClick={onClose}>
      <div style={{ width:"100%", maxWidth:520, maxHeight:"95vh", overflowY:"auto",
        background:N2, borderRadius:20, boxShadow:"0 24px 64px rgba(0,0,0,0.5)" }}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:"18px 22px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)",
          background:"rgba(212,175,55,0.07)", borderRadius:"20px 20px 0 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <div style={{ color:G, fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.1em", marginBottom:2 }}>سبق اندراج</div>
              <div style={{ color:"white", fontSize:"1rem", fontWeight:800 }}>📝 {student.name}</div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:"1.3rem" }}>✕</button>
          </div>
          {/* ── آج کی پیش رفت — Connected 3-step chain ── */}
          <div style={{ display:"flex", alignItems:"center", gap:0 }}>
            {[
              {id:"sabaq",  label:"سبق",  sub:"نیا سبق",  color:"#60a5fa", icon:"📖"},
              {id:"sabqi",  label:"سبقی", sub:"دہرانا",   color:"#4ade80", icon:"🔁"},
              {id:"manzil", label:"منزل", sub:"پارہ",     color:"#f59e0b", icon:"📚"},
            ].map(({id,label,sub,color,icon},i)=>{
              const done = todayDone[id];
              const active = form.log_type === id;
              return (
                <div key={id} style={{ display:"flex", alignItems:"center", flex:1 }}>
                  {i>0 && <div style={{ flex:1, height:2, background: done||todayDone[["sabaq","sabqi","manzil"][i-1]] ? `linear-gradient(90deg,${["#60a5fa","#4ade80"][i-1]},${color})` : "rgba(255,255,255,0.1)" }}/>}
                  <button onClick={()=>set("log_type",id)} style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                    padding:"8px 10px", borderRadius:10, border:`2px solid ${active?color:done?"rgba(74,222,128,0.4)":"rgba(255,255,255,0.1)"}`,
                    background: active?`${color}18`:done?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.03)",
                    cursor:"pointer", fontFamily:"inherit", minWidth:72, transition:"all 0.15s",
                    boxShadow: active?`0 0 12px ${color}30`:"none",
                  }}>
                    <span style={{ fontSize:"1.1rem" }}>{done?"✅":active?"⬤":icon}</span>
                    <span style={{ fontSize:"0.65rem", fontWeight:800, color: active?color:done?"#4ade80":"rgba(255,255,255,0.35)" }}>{label}</span>
                    <span style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.25)" }}>{done?"مکمل":active?"جاری":sub}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:14 }}>
          {err && <div style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:9, padding:"8px 12px", color:"#f87171", fontSize:"0.72rem" }}>{err}</div>}
          {saved && <div style={{ background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:9, padding:"8px 12px", color:"#4ade80", fontSize:"0.72rem" }}>✅ محفوظ ہو گیا{!isOnline?" (آف لائن)":""}!</div>}

          {/* ── حفظ سلسلہ کارڈ ── */}
          {(() => {
            const ab = ABILITY_LEVELS.find(a => a.id === abilityLevel) || ABILITY_LEVELS[2];
            const prog = hifzProgress;
            // Ayats per day from ability level (using page helper)
            const ayatsPerDay = prog
              ? Math.max(1, Math.round(prog.ayatsPerPage * fracToLines(ab.fraction) / 16))
              : Math.round(fracToLines(ab.fraction) / 16 * 7);
            const remaining  = prog ? Math.max(0, prog.targetTotal - prog.cumAyats) : null;
            const daysLeft   = remaining !== null ? Math.ceil(remaining / Math.max(ayatsPerDay,1)) : null;
            const pct = prog ? Math.round(prog.progress * 100) : 0;
            const pctColor = pct<30?"#60a5fa":pct<60?"#f59e0b":pct<90?"#4ade80":"#f87171";

            return (
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(212,175,55,0.15)",
                borderRadius:14, overflow:"hidden", direction:"rtl" }}>
                {/* Header */}
                <div style={{ background:"rgba(212,175,55,0.07)", padding:"8px 14px",
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:"0.62rem", fontWeight:800, color:"rgba(212,175,55,0.9)" }}>
                    📿 حفظ سلسلہ
                  </span>
                  {prog?.isComplete && (
                    <span style={{ fontSize:"0.58rem", fontWeight:700, color:"#4ade80",
                      background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.3)",
                      borderRadius:8, padding:"2px 8px", animation:"pulse 1.5s infinite" }}>
                      🎉 پارہ مکمل — منزل بنائیں!
                    </span>
                  )}
                  {!prog?.isComplete && prog && (
                    <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.35)" }}>
                      پارہ {prog.targetPara} — {PARA_NAMES[prog.targetPara-1]}
                    </span>
                  )}
                </div>

                <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
                  {/* Ability level selector */}
                  <div>
                    <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.4)", marginBottom:6, fontWeight:700 }}>
                      ذہانت کی سطح (یومیہ سبق کا معیار)
                    </div>
                    <div style={{ display:"flex", gap:5 }}>
                      {ABILITY_LEVELS.map(a => {
                        const sel = abilityLevel === a.id;
                        return (
                          <button key={a.id} onClick={()=>saveAbility(a.id)} style={{
                            flex:1, padding:"6px 4px", borderRadius:9, cursor:"pointer",
                            fontFamily:"inherit", textAlign:"center", direction:"rtl",
                            background: sel?`${a.color}18`:"rgba(255,255,255,0.03)",
                            border: sel?`1.5px solid ${a.color}60`:"1px solid rgba(255,255,255,0.08)",
                            color: sel?a.color:"rgba(255,255,255,0.4)",
                            boxShadow: sel?`0 0 10px ${a.color}20`:"none",
                            transition:"all 0.15s",
                          }}>
                            <div style={{ fontSize:"0.65rem", fontWeight:sel?900:500 }}>{a.label}</div>
                            <div style={{ fontSize:"0.44rem", marginTop:2,
                              color:sel?`${a.color}99`:"rgba(255,255,255,0.2)" }}>{a.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cycle explanation */}
                  <div style={{ fontSize:"0.48rem", color:"rgba(255,255,255,0.25)", textAlign:"center",
                    background:"rgba(255,255,255,0.02)", borderRadius:7, padding:"4px 8px",
                    border:"1px solid rgba(255,255,255,0.05)" }}>
                    روزانہ نیا سبق ← سبقی میں جمع ہوتا ہے ← پارہ بھرنے پر منزل
                  </div>

                  {/* Chain visualization */}
                  <div style={{ display:"flex", alignItems:"stretch", gap:4, direction:"rtl" }}>
                    {/* سبق */}
                    <div style={{ flex:1, background:"rgba(96,165,250,0.08)",
                      border:"1px solid rgba(96,165,250,0.2)", borderRadius:9, padding:"6px 8px",
                      textAlign:"center", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                      <div style={{ fontSize:"0.48rem", color:"#60a5fa", fontWeight:700, marginBottom:2 }}>سبق</div>
                      <div style={{ fontSize:"0.7rem", fontWeight:900, color:"#60a5fa" }}>
                        ~{ayatsPerDay} آیات
                      </div>
                      <div style={{ fontSize:"0.42rem", color:"rgba(96,165,250,0.5)", marginTop:1 }}>روزانہ نیا</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", color:"rgba(255,255,255,0.2)", fontSize:"0.7rem" }}>⊕</div>
                    {/* سبقی — the growing pool */}
                    <div style={{ flex:1.6, background:"rgba(74,222,128,0.08)",
                      border:`1.5px solid ${prog?.isComplete?"rgba(74,222,128,0.6)":"rgba(74,222,128,0.25)"}`,
                      borderRadius:9, padding:"7px 9px", textAlign:"center" }}>
                      <div style={{ fontSize:"0.48rem", color:"#4ade80", fontWeight:700, marginBottom:3 }}>سبقی (جمع دہرانا)</div>
                      <div style={{ fontSize:"0.75rem", fontWeight:900, color:"#4ade80" }}>
                        {prog ? prog.cumAyats : "—"} آیات
                      </div>
                      <div style={{ fontSize:"0.4rem", color:"rgba(74,222,128,0.5)", marginTop:1 }}>
                        {prog ? `${prog.batchDays} روز کی تکرار` : "ابھی شروع نہیں"}
                      </div>
                      {/* Mini growth bar */}
                      {prog && (
                        <div style={{ marginTop:4, height:4, borderRadius:99,
                          background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:99,
                            width:`${Math.min(pct,100)}%`,
                            background:`linear-gradient(90deg,#4ade8080,${prog.isComplete?"#f59e0b":"#4ade80"})`,
                            transition:"width 0.5s" }}/>
                        </div>
                      )}
                      {prog && (
                        <div style={{ fontSize:"0.38rem", color:"rgba(74,222,128,0.4)", marginTop:2 }}>
                          {pct}% → {prog.targetTotal} آیات پر منزل
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", color:"rgba(255,255,255,0.2)", fontSize:"0.7rem" }}>→</div>
                    {/* منزل */}
                    <div style={{ flex:1, background:"rgba(245,158,11,0.08)",
                      border:"1px solid rgba(245,158,11,0.2)", borderRadius:9, padding:"6px 8px",
                      textAlign:"center", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                      <div style={{ fontSize:"0.48rem", color:"#f59e0b", fontWeight:700, marginBottom:2 }}>منزل</div>
                      <div style={{ fontSize:"0.63rem", fontWeight:900, color:"#f59e0b" }}>
                        {prog?.lastManPara ? `پارہ ${prog.lastManPara}` : "—"}
                      </div>
                      <div style={{ fontSize:"0.4rem", color:"rgba(245,158,11,0.5)", marginTop:1 }}>
                        {prog?.lastManPara ? "مکمل ✓" : "ابھی نہیں"}
                      </div>
                    </div>
                  </div>

                  {/* Sabqi range info strip */}
                  {prog && prog.batchFirstSurah && (
                    <div style={{ padding:"6px 10px", borderRadius:8,
                      background:"rgba(74,222,128,0.05)", border:"1px dashed rgba(74,222,128,0.2)",
                      fontSize:"0.5rem", color:"rgba(74,222,128,0.7)", textAlign:"right" }}>
                      <span style={{ color:"rgba(74,222,128,0.4)", marginLeft:6 }}>سبقی دائرہ:</span>
                      {prog.batchFirstSurah} {prog.batchFirstAyat}
                      {prog.batchFirstSurah !== prog.batchLastSurah
                        ? ` ← ${prog.batchLastSurah} ${prog.batchLastAyat}`
                        : ` تا آیت ${prog.batchLastAyat}`}
                    </div>
                  )}

                  {/* Progress bar toward para */}
                  {prog && (
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        fontSize:"0.52rem", marginBottom:4 }}>
                        <span style={{ color:pctColor, fontWeight:700 }}>{pct}% مکمل</span>
                        <span style={{ color:"rgba(255,255,255,0.35)" }}>
                          {prog.cumAyats} / {prog.targetTotal} آیات
                        </span>
                      </div>
                      <div style={{ height:8, borderRadius:99,
                        background:"rgba(255,255,255,0.07)", overflow:"hidden", position:"relative" }}>
                        {[25,50,75].map(m=>(
                          <div key={m} style={{ position:"absolute", left:`${m}%`, top:0, bottom:0,
                            width:1, background:"rgba(255,255,255,0.15)", zIndex:1 }}/>
                        ))}
                        <div style={{ height:"100%", borderRadius:99,
                          width:`${Math.min(pct,100)}%`,
                          background:`linear-gradient(90deg,${pctColor}80,${pctColor})`,
                          transition:"width 0.5s", position:"relative", zIndex:2 }}/>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        fontSize:"0.43rem", color:"rgba(255,255,255,0.18)", marginTop:2 }}>
                        <span>شروع</span><span>¼ پارہ</span><span>½ پارہ</span><span>¾ پارہ</span><span>مکمل</span>
                      </div>
                    </div>
                  )}

                  {/* Stats row */}
                  {prog && !prog.isComplete && (
                    <div style={{ display:"flex", gap:6 }}>
                      <div style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:8,
                        padding:"5px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:"0.42rem", color:"rgba(255,255,255,0.3)", marginBottom:1 }}>باقی آیات</div>
                        <div style={{ fontSize:"0.75rem", fontWeight:900, color:"rgba(255,255,255,0.7)" }}>{remaining}</div>
                      </div>
                      <div style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:8,
                        padding:"5px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:"0.42rem", color:"rgba(255,255,255,0.3)", marginBottom:1 }}>تخمینی دن</div>
                        <div style={{ fontSize:"0.75rem", fontWeight:900, color:ab.color }}>{daysLeft}</div>
                      </div>
                      <div style={{ flex:1.4, background:`${ab.color}10`, borderRadius:8,
                        border:`1px solid ${ab.color}25`,
                        padding:"5px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:"0.42rem", color:`${ab.color}80`, marginBottom:1 }}>آج کا مقررہ سبق</div>
                        <div style={{ fontSize:"0.6rem", fontWeight:900, color:ab.color }}>
                          {ab.fraction} صفحہ (~{ayatsPerDay} آیات)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completion CTA */}
                  {prog?.isComplete && (
                    <button onClick={()=>set("log_type","manzil")}
                      style={{ width:"100%", padding:"10px", borderRadius:10, cursor:"pointer",
                        border:"1.5px solid rgba(74,222,128,0.5)",
                        background:"rgba(74,222,128,0.1)", color:"#4ade80",
                        fontSize:"0.7rem", fontWeight:800, fontFamily:"inherit", direction:"rtl" }}>
                      ✅ پارہ مکمل ہوا — منزل میں درج کریں ←
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Date */}
          <div>
            <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700, display:"block", marginBottom:4 }}>تاریخ</label>
            <input type="date" value={form.log_date} onChange={e=>set("log_date",e.target.value)} style={inp} />
          </div>

          {/* Log type */}
          <div>
            <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700, display:"block", marginBottom:6 }}>قسم</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {LOG_TYPES.map(t => {
                const sel = form.log_type===t.id;
                const isDone = ["sabaq","sabqi","manzil"].includes(t.id) ? todayDone[t.id] : false;
                const mCount = t.id==="sabaq"?sabaqMistakes.length : t.id==="sabqi"?sabqiMistakes.length : t.id==="manzil"?manzilMistakes.length : 0;
                return (
                  <button key={t.id} onClick={()=>set("log_type",t.id)} style={{
                    padding:"7px 14px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
                    fontSize:"0.7rem", fontWeight: sel ? 700 : 500, position:"relative",
                    border:`1px solid ${sel?t.color:isDone?"rgba(74,222,128,0.35)":"rgba(255,255,255,0.08)"}`,
                    background: sel ? `${t.color}20` : isDone?"rgba(74,222,128,0.06)":"rgba(255,255,255,0.04)",
                    color: sel ? t.color : isDone?"#4ade80":"rgba(255,255,255,0.45)",
                    boxShadow: sel ? `0 0 10px ${t.color}30` : "none",
                  }}>
                    <span style={{ fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }}>
                      {isDone&&!sel?"✓ ":""}{t.label}
                    </span>
                    {mCount > 0 && (
                      <span style={{ position:"absolute", top:-5, right:-5, minWidth:16, height:16,
                        borderRadius:8, background:"#f87171", color:"#fff",
                        fontSize:"0.4rem", fontWeight:900, display:"flex", alignItems:"center",
                        justifyContent:"center", padding:"0 3px", lineHeight:1,
                        boxShadow:"0 0 6px rgba(248,113,113,0.5)" }}>
                        {mCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* ── منزل: Para selector ── */}
          {form.log_type==="manzil" ? (
            <>
              {/* آج کا سبق/سبقی reference strip */}
              {(todaySabaq || todayDone.sabqi) && (
                <div style={{ padding:"8px 14px", borderRadius:9,
                  background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.2)",
                  display:"flex", flexWrap:"wrap", gap:12, alignItems:"center" }}>
                  {todaySabaq && (
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:"0.55rem", color:"rgba(96,165,250,0.6)", fontWeight:700 }}>سبق:</span>
                      <span style={{ fontSize:"0.68rem", fontWeight:800, color:"#60a5fa", direction:"rtl" }}>{todaySabaq.surah_name}</span>
                      {todaySabaq.ayat_from&&todaySabaq.ayat_to&&(
                        <span style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.3)", direction:"rtl" }}>
                          {todaySabaq.ayat_from}–{todaySabaq.ayat_to}
                        </span>
                      )}
                    </div>
                  )}
                  {todayDone.sabqi && (
                    <div style={{ fontSize:"0.58rem", color:"rgba(74,222,128,0.6)" }}>✓ سبقی مکمل</div>
                  )}
                </div>
              )}

              <div>
                <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700, display:"block", marginBottom:6 }}>
                  آج کا پارہ منتخب کریں
                </label>

                {/* How many paras today */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.4)", flexShrink:0, direction:"rtl" }}>
                    آج کتنے پارے؟
                  </span>
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    <button onClick={()=>setManzilCount(c=>Math.max(1,c-1))} style={{
                      width:28, height:28, borderRadius:7, cursor:"pointer", fontFamily:"inherit",
                      fontSize:"1rem", fontWeight:700, border:"1px solid rgba(245,158,11,0.3)",
                      background:"rgba(245,158,11,0.08)", color:"#f59e0b" }}>−</button>
                    <span style={{ fontSize:"1.1rem", fontWeight:900, color:"#f59e0b",
                      minWidth:28, textAlign:"center" }}>{manzilCount}</span>
                    <button onClick={()=>setManzilCount(c=>Math.min(5,c+1))} style={{
                      width:28, height:28, borderRadius:7, cursor:"pointer", fontFamily:"inherit",
                      fontSize:"1rem", fontWeight:700, border:"1px solid rgba(245,158,11,0.3)",
                      background:"rgba(245,158,11,0.08)", color:"#f59e0b" }}>+</button>
                  </div>
                  <button onClick={()=>setManzilCount(c=>Math.min(5,c+1))} style={{
                    padding:"4px 12px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                    fontSize:"0.6rem", fontWeight:700,
                    border:"1px solid rgba(245,158,11,0.35)",
                    background:"rgba(245,158,11,0.07)", color:"rgba(245,158,11,0.8)" }}>
                    + اگلا پارہ شامل کریں
                  </button>
                  {manzilCount > 1 && (
                    <button onClick={()=>setManzilCount(1)} style={{
                      padding:"4px 10px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                      fontSize:"0.55rem", border:"1px solid rgba(255,255,255,0.1)",
                      background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.3)" }}>
                      صرف ایک پارہ
                    </button>
                  )}
                </div>

                {/* Rotation banner — shows all selected paras */}
                {(() => {
                  const paras = Array.from({length: manzilCount}, (_, i) =>
                    ((manzilPara - 1 + i) % 30) + 1
                  );
                  return (
                    <div style={{ padding:"10px 14px", borderRadius:10,
                      background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)",
                      marginBottom:8 }}>
                      <div style={{ fontSize:"0.52rem", color:"rgba(245,158,11,0.5)", marginBottom:6 }}>
                        آج کی باری (rotation){lastManzilPara && ` — گزشتہ: پارہ ${lastManzilPara}`}
                      </div>
                      {manzilCount === 1 ? (
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{ fontSize:"1.6rem", fontWeight:900, color:"#f59e0b", lineHeight:1 }}>{manzilPara}</div>
                          <div style={{ flex:1, fontSize:"0.8rem", fontWeight:700, color:"#f1f5f9", direction:"rtl" }}>
                            {PARA_NAMES[manzilPara-1]}
                          </div>
                          <button onClick={()=>setManzilPara(manzilPara>1?manzilPara-1:30)}
                            style={{ padding:"4px 10px", borderRadius:7, border:"1px solid rgba(245,158,11,0.3)",
                              background:"rgba(245,158,11,0.1)", color:"#f59e0b", fontSize:"0.65rem",
                              cursor:"pointer", fontFamily:"inherit" }}>← پچھلا</button>
                          <button onClick={()=>setManzilPara(manzilPara<30?manzilPara+1:1)}
                            style={{ padding:"4px 10px", borderRadius:7, border:"1px solid rgba(245,158,11,0.3)",
                              background:"rgba(245,158,11,0.1)", color:"#f59e0b", fontSize:"0.65rem",
                              cursor:"pointer", fontFamily:"inherit" }}>اگلا →</button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                            {paras.map((n,idx)=>(
                              <div key={n} style={{ display:"flex", alignItems:"center", gap:5,
                                padding:"5px 10px", borderRadius:9,
                                background: idx===0?"rgba(245,158,11,0.25)":"rgba(245,158,11,0.08)",
                                border:`1px solid ${idx===0?"rgba(245,158,11,0.5)":"rgba(245,158,11,0.2)"}` }}>
                                <span style={{ fontSize:"1rem", fontWeight:900, color:"#f59e0b" }}>{n}</span>
                                <span style={{ fontSize:"0.6rem", color:"rgba(245,158,11,0.7)", direction:"rtl" }}>
                                  {PARA_NAMES[n-1]}
                                </span>
                                {idx===0&&<span style={{ fontSize:"0.48rem", color:"rgba(245,158,11,0.4)" }}>(شروع)</span>}
                                {idx===paras.length-1&&<span style={{ fontSize:"0.48rem", color:"rgba(245,158,11,0.4)" }}>(ختم)</span>}
                              </div>
                            ))}
                          </div>
                          <div style={{ display:"flex", gap:6 }}>
                            <button onClick={()=>setManzilPara(manzilPara>1?manzilPara-1:30)}
                              style={{ padding:"4px 10px", borderRadius:7, border:"1px solid rgba(245,158,11,0.3)",
                                background:"rgba(245,158,11,0.1)", color:"#f59e0b", fontSize:"0.65rem",
                                cursor:"pointer", fontFamily:"inherit" }}>← پچھلا</button>
                            <button onClick={()=>setManzilPara(manzilPara<30?manzilPara+1:1)}
                              style={{ padding:"4px 10px", borderRadius:7, border:"1px solid rgba(245,158,11,0.3)",
                                background:"rgba(245,158,11,0.1)", color:"#f59e0b", fontSize:"0.65rem",
                                cursor:"pointer", fontFamily:"inherit" }}>اگلا →</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* 1–30 para grid with names */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:3 }}>
                  {Array.from({length:30},(_,i)=>i+1).map(n=>(
                    <button key={n} onClick={()=>setManzilPara(n)} style={{
                      padding:"6px 2px 4px", borderRadius:7, cursor:"pointer", fontFamily:"inherit",
                      textAlign:"center", transition:"all 0.12s",
                      border:`1px solid ${manzilPara===n?"#f59e0b":"rgba(255,255,255,0.08)"}`,
                      background: manzilPara===n?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.03)",
                      boxShadow: manzilPara===n?"0 0 7px rgba(245,158,11,0.25)":"none",
                    }}>
                      <div style={{ fontSize:"0.7rem", fontWeight:manzilPara===n?900:400,
                        color:manzilPara===n?"#f59e0b":"rgba(255,255,255,0.4)" }}>{n}</div>
                      <div style={{ fontSize:"0.38rem", direction:"rtl",
                        color:manzilPara===n?"rgba(245,158,11,0.7)":"rgba(255,255,255,0.18)",
                        overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", maxWidth:"100%" }}>
                        {PARA_NAMES[n-1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── پارہ کی مکمل تفصیل ── */}
              <div>
                <button onClick={()=>setShowParaDetail(v=>!v)}
                  style={{ width:"100%", padding:"7px 12px", borderRadius:9, cursor:"pointer",
                    fontFamily:"inherit", fontSize:"0.62rem", fontWeight:700, direction:"rtl",
                    border:"1px solid rgba(245,158,11,0.25)", textAlign:"right",
                    background:"rgba(245,158,11,0.05)", color:"rgba(245,158,11,0.7)" }}>
                  {showParaDetail ? "▲ تفصیل چھپائیں" : "▼ پارہ کی مکمل تفصیل دیکھیں (سورتیں + آیات)"}
                </button>

                {showParaDetail && (() => {
                  const selectedParas = Array.from({length: manzilCount}, (_, i) =>
                    ((manzilPara - 1 + i) % 30) + 1
                  );
                  return (
                    <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:8 }}>
                      {selectedParas.map(pn => {
                        const content = getParaContent(pn);
                        const totalAyat = content.reduce((s,r)=>s+r.count,0);
                        return (
                          <div key={pn} style={{ borderRadius:10, overflow:"hidden",
                            border:"1px solid rgba(245,158,11,0.2)" }}>
                            {/* Para header */}
                            <div style={{ padding:"8px 12px", background:"rgba(245,158,11,0.1)",
                              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <span style={{ fontSize:"1.2rem", fontWeight:900, color:"#f59e0b" }}>{pn}</span>
                                <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#f1f5f9", direction:"rtl" }}>
                                  {PARA_NAMES[pn-1]}
                                </span>
                              </div>
                              <div style={{ textAlign:"left", direction:"rtl" }}>
                                <div style={{ fontSize:"0.55rem", color:"rgba(245,158,11,0.6)" }}>کل آیات</div>
                                <div style={{ fontSize:"0.85rem", fontWeight:900, color:"#f59e0b" }}>{totalAyat}</div>
                              </div>
                            </div>
                            {/* Surah rows — interactive */}
                            <div style={{ padding:"4px 0" }}>
                              {content.map((row, ri) => {
                                const rKey = `${pn}_${row.surah}`;
                                const custom = manzilRanges[rKey];
                                const dispFrom = custom ? custom.from : row.from;
                                const dispTo   = custom ? custom.to   : row.to;
                                const dispCount = dispTo - dispFrom + 1;
                                const isEditing = manzilEditing === rKey;
                                const isCustom  = !!custom;
                                return (
                                  <div key={ri} style={{
                                    borderBottom: ri<content.length-1?"1px solid rgba(255,255,255,0.04)":"none",
                                    background: isCustom?"rgba(96,165,250,0.04)":"transparent",
                                  }}>
                                    {/* Main row */}
                                    {(() => {
                                      const mSet   = manzilMistakeAyats[rKey] || new Set();
                                      const mCount = mSet.size;
                                      const mColor = mCount===0?"rgba(74,222,128,0.5)":mCount<=2?"#fbbf24":"#f87171";
                                      const isMOpen = manzilMistakeOpen === rKey;
                                      return (
                                        <>
                                          <div style={{ display:"flex", alignItems:"center", gap:5,
                                            padding:"7px 12px", flexWrap:"wrap",
                                            background: mCount>0?"rgba(248,113,113,0.04)":"transparent" }}>
                                            {/* Surah name */}
                                            <div style={{ flex:1, fontSize:"0.7rem", fontWeight:700,
                                              color:"#f1f5f9", direction:"rtl", display:"flex",
                                              alignItems:"center", gap:5, minWidth:0 }}>
                                              <span style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.25)",
                                                background:"rgba(255,255,255,0.05)", padding:"1px 5px",
                                                borderRadius:9, flexShrink:0 }}>
                                                {SURAHS.indexOf(row.surah)+1}
                                              </span>
                                              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                                {row.surah}
                                              </span>
                                              {!isCustom && row.from===1 && row.to===(SURAH_AYATS[row.surah]||0) && (
                                                <span style={{ fontSize:"0.42rem", color:"rgba(74,222,128,0.5)",
                                                  border:"1px solid rgba(74,222,128,0.2)", padding:"0 4px",
                                                  borderRadius:7, flexShrink:0 }}>مکمل</span>
                                              )}
                                              {isCustom && (
                                                <span style={{ fontSize:"0.42rem", color:"#60a5fa",
                                                  border:"1px solid rgba(96,165,250,0.3)", padding:"0 4px",
                                                  borderRadius:7, flexShrink:0 }}>منتخب</span>
                                              )}
                                            </div>
                                            {/* Range + ayat count */}
                                            <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.3)",
                                              direction:"rtl", whiteSpace:"nowrap" }}>
                                              آیت {dispFrom}–{dispTo}
                                              <span style={{ color:"rgba(245,158,11,0.55)", marginRight:4 }}>({dispCount})</span>
                                            </span>
                                            {/* Mistake toggle button */}
                                            <button onClick={()=>setManzilMistakeOpen(v=>v===rKey?null:rKey)}
                                              style={{ padding:"3px 8px", borderRadius:7, cursor:"pointer",
                                                fontSize:"0.52rem", fontWeight:700, fontFamily:"inherit",
                                                border: mCount>0?"1.5px solid rgba(248,113,113,0.5)":"1px solid rgba(255,255,255,0.1)",
                                                background: isMOpen?"rgba(248,113,113,0.12)":mCount>0?"rgba(248,113,113,0.08)":"rgba(255,255,255,0.04)",
                                                color: mCount>0?mColor:"rgba(255,255,255,0.35)",
                                                boxShadow: mCount>0?"0 0 8px rgba(248,113,113,0.15)":"none",
                                                flexShrink:0 }}>
                                              غلطی {mCount>0?mCount:"—"}
                                            </button>
                                            {/* تخصیص / Reset */}
                                            <div style={{ display:"flex", gap:3, flexShrink:0 }}>
                                              <button onClick={()=>{
                                                setManzilEditing(rKey);
                                                setManzilEditFrom(String(dispFrom));
                                                setManzilEditTo(String(dispTo));
                                              }} style={{ padding:"2px 6px", borderRadius:6, cursor:"pointer",
                                                fontSize:"0.5rem", border:"1px solid rgba(96,165,250,0.25)",
                                                background:"rgba(96,165,250,0.06)", color:"rgba(96,165,250,0.7)",
                                                fontFamily:"inherit" }}>✏</button>
                                              {isCustom && (
                                                <button onClick={()=>{
                                                  setManzilRanges(r=>{ const n={...r}; delete n[rKey]; return n; });
                                                }} style={{ padding:"2px 5px", borderRadius:6, cursor:"pointer",
                                                  fontSize:"0.5rem", border:"1px solid rgba(248,113,113,0.2)",
                                                  background:"rgba(248,113,113,0.06)", color:"rgba(248,113,113,0.6)",
                                                  fontFamily:"inherit" }}>✕</button>
                                              )}
                                            </div>
                                          </div>
                                          {/* ── Ayat mistake grid (inline panel) ── */}
                                          {isMOpen && (
                                            <div style={{ padding:"10px 12px 12px",
                                              background:"rgba(248,113,113,0.05)",
                                              borderTop:"1px solid rgba(248,113,113,0.15)" }}>
                                              <div style={{ display:"flex", alignItems:"center",
                                                justifyContent:"space-between", marginBottom:8, direction:"rtl" }}>
                                                <span style={{ fontSize:"0.55rem", color:"rgba(248,113,113,0.6)", fontWeight:700 }}>
                                                  کمزور آیات — {row.surah} ({dispFrom}–{dispTo})
                                                </span>
                                                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                                                  {mCount>0 && (
                                                    <button onClick={()=>setManzilMistakeAyats(m=>({...m,[rKey]:new Set()}))}
                                                      style={{ fontSize:"0.45rem", padding:"1px 6px", borderRadius:6,
                                                        border:"1px solid rgba(248,113,113,0.3)", cursor:"pointer",
                                                        background:"rgba(248,113,113,0.08)", color:"rgba(248,113,113,0.7)",
                                                        fontFamily:"inherit" }}>صاف</button>
                                                  )}
                                                  <span style={{ fontSize:"0.9rem", fontWeight:900, color:mColor }}>
                                                    {mCount}
                                                  </span>
                                                </div>
                                              </div>
                                              {/* Chip grid */}
                                              <div style={{ display:"flex", flexWrap:"wrap", gap:4,
                                                maxHeight: dispCount>80?150:"none",
                                                overflowY: dispCount>80?"auto":"visible" }}>
                                                {Array.from({length:Math.min(dispCount,120)},(_,i)=>{
                                                  const ayat = dispFrom + i;
                                                  const has  = mSet.has(ayat);
                                                  return (
                                                    <button key={ayat}
                                                      onClick={()=>setManzilMistakeAyats(m=>{
                                                        const prev = m[rKey] ? new Set(m[rKey]) : new Set();
                                                        if (prev.has(ayat)) prev.delete(ayat); else prev.add(ayat);
                                                        return {...m, [rKey]: prev};
                                                      })}
                                                      style={{
                                                        width:30, height:30, borderRadius:7, cursor:"pointer",
                                                        fontSize:"0.55rem", fontWeight:has?900:400,
                                                        background: has?"rgba(248,113,113,0.2)":"rgba(255,255,255,0.04)",
                                                        border: has?"1.5px solid rgba(248,113,113,0.6)":"1px solid rgba(255,255,255,0.08)",
                                                        color: has?"#f87171":"rgba(255,255,255,0.35)",
                                                        boxShadow: has?"0 0 7px rgba(248,113,113,0.2)":"none",
                                                        transition:"all 0.1s", fontFamily:"inherit",
                                                      }}>
                                                      {ayat}
                                                    </button>
                                                  );
                                                })}
                                                {dispCount>120&&<span style={{ fontSize:"0.48rem", color:"rgba(255,255,255,0.2)", alignSelf:"center" }}>+{dispCount-120}</span>}
                                              </div>
                                              {/* Mistake summary */}
                                              {mCount>0 && (
                                                <div style={{ marginTop:7, fontSize:"0.55rem", color:"#f87171",
                                                  direction:"rtl", padding:"4px 6px", borderRadius:7,
                                                  background:"rgba(248,113,113,0.06)" }}>
                                                  غلطی: آیت {[...mSet].sort((a,b)=>a-b).join("، ")}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}

                                    {/* Inline editor */}
                                    {isEditing && (
                                      <div style={{ padding:"8px 12px 10px", background:"rgba(96,165,250,0.06)",
                                        borderTop:"1px solid rgba(96,165,250,0.15)" }}>
                                        <div style={{ fontSize:"0.55rem", color:"rgba(96,165,250,0.6)",
                                          marginBottom:6, direction:"rtl" }}>
                                          آیت range منتخب کریں ({row.from}–{row.to} میں سے)
                                        </div>
                                        {/* Ayat range inputs */}
                                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                                          <div style={{ flex:1 }}>
                                            <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.3)", marginBottom:2 }}>آیت سے</div>
                                            <input type="number" min={row.from} max={row.to}
                                              value={manzilEditFrom} onChange={e=>setManzilEditFrom(e.target.value)}
                                              style={{ ...inp, textAlign:"center", borderColor:"rgba(96,165,250,0.35)", fontSize:"0.8rem", padding:"6px" }} />
                                          </div>
                                          <div style={{ color:"rgba(255,255,255,0.2)", fontSize:"1rem", paddingTop:14 }}>—</div>
                                          <div style={{ flex:1 }}>
                                            <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.3)", marginBottom:2 }}>آیت تک</div>
                                            <input type="number" min={row.from} max={row.to}
                                              value={manzilEditTo} onChange={e=>setManzilEditTo(e.target.value)}
                                              style={{ ...inp, textAlign:"center", borderColor:"rgba(96,165,250,0.35)", fontSize:"0.8rem", padding:"6px" }} />
                                          </div>
                                        </div>
                                        {/* Quick preset buttons */}
                                        <div style={{ display:"flex", gap:4, marginBottom:8, flexWrap:"wrap" }}>
                                          {[
                                            {l:"مکمل",    f:row.from, t:row.to},
                                            {l:"پہلا نصف", f:row.from, t:Math.floor((row.from+row.to)/2)},
                                            {l:"دوسرا نصف",f:Math.floor((row.from+row.to)/2)+1, t:row.to},
                                            {l:"پہلا ¼",  f:row.from, t:row.from+Math.floor((row.to-row.from)/4)},
                                            {l:"آخری ¼",  f:row.to-Math.floor((row.to-row.from)/4), t:row.to},
                                          ].map(p=>(
                                            <button key={p.l} onClick={()=>{setManzilEditFrom(String(p.f));setManzilEditTo(String(p.t));}}
                                              style={{ padding:"3px 8px", borderRadius:7, cursor:"pointer",
                                                fontSize:"0.55rem", border:"1px solid rgba(96,165,250,0.2)",
                                                background:"rgba(96,165,250,0.06)", color:"rgba(96,165,250,0.7)",
                                                fontFamily:"inherit", direction:"rtl" }}>{p.l}</button>
                                          ))}
                                        </div>
                                        {/* Confirm / Cancel */}
                                        <div style={{ display:"flex", gap:6 }}>
                                          <button onClick={()=>{
                                            const f=parseInt(manzilEditFrom), t=parseInt(manzilEditTo);
                                            if (f&&t&&f>=row.from&&t<=row.to&&f<=t) {
                                              setManzilRanges(r=>({...r,[rKey]:{from:f,to:t}}));
                                            }
                                            setManzilEditing(null);
                                          }} style={{ flex:1, padding:"6px", borderRadius:8, cursor:"pointer",
                                            border:"1px solid rgba(74,222,128,0.4)", background:"rgba(74,222,128,0.12)",
                                            color:"#4ade80", fontSize:"0.65rem", fontWeight:700, fontFamily:"inherit" }}>
                                            ✓ محفوظ کریں
                                          </button>
                                          <button onClick={()=>setManzilEditing(null)}
                                            style={{ padding:"6px 12px", borderRadius:8, cursor:"pointer",
                                              border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)",
                                              color:"rgba(255,255,255,0.4)", fontSize:"0.65rem", fontFamily:"inherit" }}>
                                            ✕
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </>

          ) : form.log_type==="sabqi" ? (
            /* ── سبقی: para + surah + ayat ── */
            <>
              {/* سبقی chain info banner */}
              {hifzProgress && hifzProgress.batchFirstSurah && (
                <div style={{ padding:"10px 14px", borderRadius:10,
                  background:"rgba(74,222,128,0.07)", border:"1.5px solid rgba(74,222,128,0.25)",
                  direction:"rtl" }}>
                  <div style={{ fontSize:"0.55rem", color:"rgba(74,222,128,0.6)", fontWeight:700, marginBottom:4 }}>
                    🔁 آج کی سبقی — پورا جمع دہرانا
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:"0.75rem", fontWeight:900, color:"#4ade80" }}>
                      {hifzProgress.batchFirstSurah}
                    </span>
                    <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)" }}>
                      آیت {hifzProgress.batchFirstAyat}
                    </span>
                    {hifzProgress.batchFirstSurah !== hifzProgress.batchLastSurah && (
                      <>
                        <span style={{ color:"rgba(255,255,255,0.2)" }}>←</span>
                        <span style={{ fontSize:"0.75rem", fontWeight:900, color:"#4ade80" }}>
                          {hifzProgress.batchLastSurah}
                        </span>
                      </>
                    )}
                    <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.4)" }}>
                      تا آیت {hifzProgress.batchLastAyat}
                    </span>
                    <span style={{ fontSize:"0.55rem", color:"rgba(74,222,128,0.5)",
                      background:"rgba(74,222,128,0.1)", borderRadius:6, padding:"1px 7px", marginRight:"auto" }}>
                      {hifzProgress.cumAyats} آیات | {hifzProgress.batchDays} روز
                    </span>
                  </div>
                  <div style={{ marginTop:5, height:3, borderRadius:99,
                    background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:99,
                      width:`${Math.min(Math.round(hifzProgress.progress*100),100)}%`,
                      background:"linear-gradient(90deg,#4ade8060,#4ade80)" }}/>
                  </div>
                  <div style={{ fontSize:"0.42rem", color:"rgba(74,222,128,0.4)", marginTop:2, textAlign:"left" }}>
                    {Math.round(hifzProgress.progress*100)}% — {hifzProgress.targetTotal} آیات پر منزل
                  </div>
                </div>
              )}

              {/* ── حفظ کا سلسلہ — live chain from DB ── */}
              {(sabqiHistory.length > 0 || hifzProgress) && (() => {
                const allCycles = [
                  ...sabqiHistory.map((h, i) => ({ ...h, idx: i+1, done: true })),
                  ...(hifzProgress ? [{ idx: sabqiHistory.length+1, done: false,
                    startSurah: hifzProgress.batchFirstSurah, startAyat: hifzProgress.batchFirstAyat,
                    endSurah: hifzProgress.batchLastSurah, endAyat: hifzProgress.batchLastAyat,
                    batchDays: hifzProgress.batchDays, batchAyats: hifzProgress.cumAyats,
                    manzilPara: hifzProgress.targetPara, manzilDate: null,
                    progress: hifzProgress.progress,
                  }] : []),
                ];
                return (
                  <div style={{ borderRadius:12, overflow:"hidden",
                    border:"1px solid rgba(255,255,255,0.07)",
                    background:"rgba(0,0,0,0.2)" }}>

                    {/* Header */}
                    <div style={{ padding:"8px 14px",
                      background:"rgba(255,255,255,0.04)",
                      borderBottom:"1px solid rgba(255,255,255,0.06)",
                      display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.58rem", fontWeight:800, color:"rgba(255,255,255,0.6)" }}>
                        حفظ کا سلسلہ
                      </span>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ width:6,height:6,borderRadius:"50%",background:"#60a5fa",display:"inline-block" }}/>
                          <span style={{ fontSize:"0.42rem", color:"rgba(96,165,250,0.7)" }}>سبق</span>
                        </span>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"inline-block" }}/>
                          <span style={{ fontSize:"0.42rem", color:"rgba(74,222,128,0.7)" }}>سبقی</span>
                        </span>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ width:6,height:6,borderRadius:"50%",background:"#f59e0b",display:"inline-block" }}/>
                          <span style={{ fontSize:"0.42rem", color:"rgba(245,158,11,0.7)" }}>منزل</span>
                        </span>
                      </div>
                    </div>

                    {/* Chain nodes */}
                    <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:0 }}>
                      {allCycles.map((c, ci) => (
                        <div key={ci}>
                          {/* Cycle row */}
                          <div style={{ display:"flex", alignItems:"stretch", gap:10 }}>

                            {/* Left: number + vertical line */}
                            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:24, flexShrink:0 }}>
                              <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                background: c.done?"rgba(245,158,11,0.15)":"rgba(74,222,128,0.12)",
                                border: `2px solid ${c.done?"rgba(245,158,11,0.5)":"rgba(74,222,128,0.5)"}`,
                                fontSize:"0.52rem", fontWeight:900,
                                color: c.done?"#f59e0b":"#4ade80" }}>
                                {c.idx}
                              </div>
                              {ci < allCycles.length - 1 && (
                                <div style={{ width:2, flex:1, minHeight:16,
                                  background:"rgba(255,255,255,0.07)", margin:"2px 0" }}/>
                              )}
                            </div>

                            {/* Right: content card */}
                            <div style={{ flex:1, paddingBottom: ci < allCycles.length-1 ? 10 : 0 }}>
                              <div style={{ borderRadius:9, overflow:"hidden",
                                border:`1px solid ${c.done?"rgba(245,158,11,0.2)":"rgba(74,222,128,0.3)"}`,
                                background: c.done?"rgba(245,158,11,0.04)":"rgba(74,222,128,0.05)" }}>

                                {/* Surah range row (سبق → سبقی phase) */}
                                <div style={{ padding:"6px 10px", display:"flex", alignItems:"center",
                                  gap:6, borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                                  {/* Blue سبق pill */}
                                  <span style={{ fontSize:"0.42rem", padding:"1px 6px", borderRadius:5, flexShrink:0,
                                    background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.3)",
                                    color:"#60a5fa", fontWeight:700 }}>سبق</span>
                                  <div style={{ flex:1, direction:"rtl" }}>
                                    <span style={{ fontSize:"0.62rem", fontWeight:700, color:"#f1f5f9" }}>
                                      {c.startSurah}
                                      {c.startAyat !== undefined ? ` آیت ${c.startAyat}` : ""}
                                    </span>
                                    {(c.endSurah && c.endSurah !== c.startSurah) ? (
                                      <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.4)", marginRight:4 }}>
                                        {" "}← {c.endSurah} آیت {c.endAyat}
                                      </span>
                                    ) : c.endAyat ? (
                                      <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.4)", marginRight:4 }}>
                                        {" "}تا آیت {c.endAyat}
                                      </span>
                                    ) : null}
                                  </div>
                                  <span style={{ fontSize:"0.42rem", color:"rgba(255,255,255,0.25)", flexShrink:0 }}>
                                    {c.batchDays} روز | {c.batchAyats} آیات
                                  </span>
                                </div>

                                {/* Progress bar (only for current) */}
                                {!c.done && c.progress !== undefined && (
                                  <div>
                                    <div style={{ height:3, background:"rgba(255,255,255,0.05)" }}>
                                      <div style={{ height:"100%",
                                        width:`${Math.round(Math.min(c.progress,1)*100)}%`,
                                        background:"linear-gradient(90deg,#4ade8050,#4ade80)",
                                        transition:"width 0.3s" }}/>
                                    </div>
                                    <div style={{ padding:"3px 10px", fontSize:"0.42rem",
                                      color:"rgba(74,222,128,0.5)", direction:"rtl" }}>
                                      {Math.round(c.progress*100)}% مکمل — ہدف پارہ {c.manzilPara}
                                    </div>
                                  </div>
                                )}

                                {/* منزل row */}
                                <div style={{ padding:"4px 10px",
                                  background: c.done?"rgba(245,158,11,0.06)":"rgba(74,222,128,0.04)",
                                  display:"flex", alignItems:"center", gap:6 }}>
                                  <span style={{ fontSize:"0.42rem", padding:"1px 6px", borderRadius:5, flexShrink:0,
                                    background: c.done?"rgba(245,158,11,0.12)":"rgba(74,222,128,0.1)",
                                    border:`1px solid ${c.done?"rgba(245,158,11,0.3)":"rgba(74,222,128,0.25)"}`,
                                    color: c.done?"#f59e0b":"#4ade80", fontWeight:700 }}>
                                    {c.done ? "منزل" : "سبقی جاری"}
                                  </span>
                                  <span style={{ fontSize:"0.62rem", fontWeight:900,
                                    color: c.done?"#f59e0b":"rgba(74,222,128,0.7)", flex:1 }}>
                                    پارہ {c.manzilPara}
                                  </span>
                                  {c.done && c.manzilDate && (
                                    <span style={{ fontSize:"0.42rem", color:"rgba(245,158,11,0.4)" }}>
                                      {c.manzilDate.slice(5)}
                                    </span>
                                  )}
                                  {!c.done && (
                                    <span style={{ fontSize:"0.42rem", color:"rgba(74,222,128,0.4)" }}>
                                      ابھی جاری ہے…
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* آج کا سبق — small context strip */}
              {todaySabaq && (
                <div style={{ padding:"8px 14px", borderRadius:9,
                  background:"rgba(74,222,128,0.04)", border:"1px solid rgba(74,222,128,0.15)",
                  display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <span style={{ fontSize:"0.55rem", color:"rgba(74,222,128,0.45)", fontWeight:700 }}>📖 آج کا نیا سبق:</span>
                  <span style={{ fontSize:"0.7rem", fontWeight:800, color:"rgba(74,222,128,0.7)", direction:"rtl" }}>{todaySabaq.surah_name}</span>
                  {todaySabaq.ayat_from && todaySabaq.ayat_to && (
                    <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.35)", direction:"rtl" }}>
                      آیت {todaySabaq.ayat_from}–{todaySabaq.ayat_to}
                    </span>
                  )}
                </div>
              )}

              {/* پارہ نمبر selector */}
              <div>
                <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700, display:"block", marginBottom:6 }}>
                  آج سبقی میں کون سا پارہ سنایا؟
                </label>
                {/* Selected para name banner */}
                <div style={{ padding:"8px 14px", borderRadius:9, marginBottom:8,
                  background: sabqiParaAuto?"rgba(96,165,250,0.08)":"rgba(74,222,128,0.08)",
                  border:`1px solid ${sabqiParaAuto?"rgba(96,165,250,0.25)":"rgba(74,222,128,0.2)"}`,
                  display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:"1.4rem", fontWeight:900,
                    color: sabqiParaAuto?"#60a5fa":"#4ade80", minWidth:28, textAlign:"center" }}>{sabqiPara}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.58rem", color: sabqiParaAuto?"rgba(96,165,250,0.6)":"rgba(74,222,128,0.5)" }}>
                      {sabqiParaAuto ? "خودکار ✓ (آیت سے detect ہوا)" : "منتخب پارہ"}
                    </div>
                    <div style={{ fontSize:"0.78rem", fontWeight:700, color:"#f1f5f9", direction:"rtl" }}>
                      {PARA_NAMES[sabqiPara-1]}
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:3 }}>
                  {Array.from({length:30},(_,i)=>i+1).map(n=>(
                    <button key={n} onClick={()=>{ setSabqiPara(n); setSabqiParaAuto(false); setSabqiTodayFrom(""); setSabqiTodayTo(""); }} style={{
                      padding:"6px 2px 4px", borderRadius:7, cursor:"pointer", fontFamily:"inherit",
                      textAlign:"center", transition:"all 0.12s",
                      border:`1px solid ${sabqiPara===n?"#4ade80":"rgba(255,255,255,0.07)"}`,
                      background: sabqiPara===n?"rgba(74,222,128,0.18)":"rgba(255,255,255,0.03)",
                      boxShadow: sabqiPara===n?"0 0 7px rgba(74,222,128,0.25)":"none",
                    }}>
                      <div style={{ fontSize:"0.7rem", fontWeight: sabqiPara===n?900:400,
                        color: sabqiPara===n?"#4ade80":"rgba(255,255,255,0.4)" }}>{n}</div>
                      <div style={{ fontSize:"0.38rem", color: sabqiPara===n?"rgba(74,222,128,0.7)":"rgba(255,255,255,0.18)",
                        direction:"rtl", overflow:"hidden", whiteSpace:"nowrap",
                        textOverflow:"ellipsis", maxWidth:"100%" }}>
                        {PARA_NAMES[n-1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Para surahs — auto-computed from selected para ── */}
              {(() => {
                const pSurahs   = getParaSurahs(sabqiPara);
                const paraTotal = getParaAyatTotal(sabqiPara) || 1;
                const cumAyats  = hifzProgress?.cumAyats || 0;
                const paraPct   = Math.round(Math.min(cumAyats / paraTotal, 1) * 100);

                // Filter daily log to this para's records (current cycle only — since last manzil)
                const lastManzilDate = sabqiHistory.length > 0 ? sabqiHistory[sabqiHistory.length-1].manzilDate : "2000-01-01";
                const paraLog = sabqiDailyLog.filter(r =>
                  r.manzil_para === sabqiPara && r.log_date > lastManzilDate
                ).sort((a,b) => a.log_date.localeCompare(b.log_date));

                // Latest sabqi record = what was last covered
                const lastEntry = paraLog[paraLog.length - 1];


                return (
                  <div style={{ borderRadius:12, overflow:"hidden",
                    border:"1px solid rgba(74,222,128,0.2)",
                    background:"rgba(74,222,128,0.03)" }}>

                    {/* Header */}
                    <div style={{ padding:"7px 14px", background:"rgba(74,222,128,0.08)",
                      display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.58rem", fontWeight:800, color:"rgba(74,222,128,0.8)", direction:"rtl" }}>
                        پارہ {sabqiPara} — {PARA_NAMES[sabqiPara-1]}
                      </span>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:"0.48rem", color:"rgba(74,222,128,0.5)" }}>{paraTotal} آیات</span>
                        {paraPct > 0 && (
                          <span style={{ fontSize:"0.55rem", fontWeight:700, color:"#4ade80",
                            background:"rgba(74,222,128,0.12)", borderRadius:6, padding:"1px 7px" }}>
                            {paraPct}% مکمل
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Para overall progress bar */}
                    <div style={{ height:4, background:"rgba(255,255,255,0.05)" }}>
                      <div style={{ height:"100%", width:`${paraPct}%`,
                        background:"linear-gradient(90deg,#4ade8060,#4ade80)",
                        transition:"width 0.3s" }}/>
                    </div>

                    {/* ── Surah breakdown with daily sessions ── */}
                    <div style={{ padding:"8px 10px", display:"flex", flexDirection:"column", gap:6 }}>
                      {pSurahs.map(({ surah, from, to, count }) => {
                        const surahMax   = SURAH_AYATS[surah] || 1;
                        const isPartial  = from > 1 || to < surahMax;

                        // Sessions that touched this surah
                        const surahSessions = paraLog.filter(r => {
                          const rFrom = parseInt(r.ayat_from)||0;
                          const rTo   = parseInt(r.ayat_to)||0;
                          return r.surah_name === surah || (rFrom <= to && rTo >= from);
                        });

                        // Furthest ayat reached in this surah
                        const maxReached = surahSessions.reduce((m,r) => {
                          const rTo = parseInt(r.ayat_to)||0;
                          return rTo > m ? rTo : m;
                        }, from - 1);
                        const coveredPct = count > 0 ? Math.round(Math.max(0, Math.min(maxReached, to) - from + 1) / count * 100) : 0;
                        const isFullyCovered = maxReached >= to;

                        // Today's data for this surah
                        const todayStr = form.log_date || new Date().toISOString().slice(0,10);
                        const todaySession = surahSessions.find(r => r.log_date === todayStr);

                        return (
                          <div key={surah} style={{ borderRadius:9, overflow:"hidden",
                            border:`1px solid ${isFullyCovered?"rgba(74,222,128,0.35)":surahSessions.length>0?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.06)"}`,
                            background: isFullyCovered?"rgba(74,222,128,0.06)":"rgba(255,255,255,0.02)" }}>

                            {/* Surah name row */}
                            <div style={{ padding:"6px 10px", display:"flex", alignItems:"center", gap:8, direction:"rtl" }}>
                              <span style={{ fontSize:"0.72rem", fontWeight:700,
                                color: isFullyCovered?"#4ade80":"#f1f5f9", flex:1 }}>{surah}</span>
                              <span style={{ fontSize:"0.48rem", color:"rgba(255,255,255,0.3)",
                                background:"rgba(255,255,255,0.05)", borderRadius:5, padding:"1px 6px" }}>
                                {isPartial ? `آیت ${from}–${to}` : `1–${surahMax}`} ({count})
                              </span>
                              {isFullyCovered && (
                                <span style={{ fontSize:"0.5rem", color:"#4ade80", fontWeight:900 }}>✓</span>
                              )}
                            </div>

                            {/* Coverage progress bar */}
                            <div style={{ height:3, background:"rgba(255,255,255,0.04)", margin:"0 10px",
                              borderRadius:99, overflow:"hidden", marginBottom:6 }}>
                              <div style={{ height:"100%", width:`${coveredPct}%`, borderRadius:99,
                                background: isFullyCovered?"#4ade80":"rgba(74,222,128,0.55)",
                                transition:"width 0.3s" }}/>
                            </div>

                            {/* ── Daily session timeline ── */}
                            {surahSessions.length > 0 && (
                              <div style={{ padding:"0 10px 6px", display:"flex", flexDirection:"column", gap:3 }}>
                                {surahSessions.map((sess, si) => {
                                  const isToday = sess.log_date === todayStr;
                                  const isYest  = (() => {
                                    const d = new Date(todayStr); d.setDate(d.getDate()-1);
                                    return sess.log_date === d.toISOString().slice(0,10);
                                  })();
                                  const dayLabel = isToday ? "آج" : isYest ? "کل" : (() => {
                                    const d = new Date(sess.log_date);
                                    return `${d.getDate()}/${d.getMonth()+1}`;
                                  })();
                                  const qColor = sess.quality==="excellent"?"#4ade80":sess.quality==="good"?"#d4af37":sess.quality==="average"?"#fb923c":"#f87171";
                                  return (
                                    <div key={si} style={{ display:"flex", alignItems:"center", gap:6,
                                      padding:"3px 6px", borderRadius:6,
                                      background: isToday?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.02)",
                                      border: isToday?"1px solid rgba(74,222,128,0.25)":"1px solid rgba(255,255,255,0.04)" }}>
                                      {/* Day label */}
                                      <span style={{ fontSize:"0.48rem", fontWeight:700, minWidth:24,
                                        color: isToday?"#4ade80":isYest?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.3)",
                                        textAlign:"center" }}>{dayLabel}</span>
                                      {/* Ayat range */}
                                      <span style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.6)",
                                        flex:1, direction:"rtl" }}>
                                        آیت {sess.ayat_from}–{sess.ayat_to}
                                        <span style={{ marginRight:4, color:"rgba(255,255,255,0.25)", fontSize:"0.45rem" }}>
                                          ({(parseInt(sess.ayat_to)||0)-(parseInt(sess.ayat_from)||0)+1} آیات)
                                        </span>
                                      </span>
                                      {/* Quality dot */}
                                      <span style={{ width:6, height:6, borderRadius:"50%",
                                        background:qColor, boxShadow:`0 0 4px ${qColor}80`,
                                        display:"inline-block", flexShrink:0 }}/>
                                      {/* Mistakes */}
                                      {sess.mistakes_count > 0 && (
                                        <span style={{ fontSize:"0.42rem", color:"#f87171",
                                          background:"rgba(248,113,113,0.12)", borderRadius:4,
                                          padding:"0 4px" }}>{sess.mistakes_count}⚠</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* ── آج کی حد — today's range selector ── */}
                            {!todaySession && (
                              <div style={{ padding:"5px 10px 8px", borderTop: surahSessions.length>0?"1px solid rgba(255,255,255,0.05)":"none" }}>
                                <div style={{ fontSize:"0.45rem", color:"rgba(74,222,128,0.45)",
                                  marginBottom:4, direction:"rtl" }}>
                                  آج کتنا سنایا؟ (اختیاری)
                                </div>
                                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                                  <div style={{ flex:1 }}>
                                    <input type="number" min={from} max={to}
                                      value={sabqiTodayFrom}
                                      onChange={e => {
                                        setSabqiTodayFrom(e.target.value);
                                        setForm(f => ({ ...f, ayat_from: e.target.value }));
                                      }}
                                      placeholder={`${lastEntry ? parseInt(lastEntry.ayat_to)+1 : from}`}
                                      style={{ ...inp, fontSize:"0.6rem", padding:"4px 8px", textAlign:"center" }}/>
                                  </div>
                                  <span style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.25)" }}>←</span>
                                  <div style={{ flex:1 }}>
                                    <input type="number" min={from} max={to}
                                      value={sabqiTodayTo}
                                      onChange={e => {
                                        setSabqiTodayTo(e.target.value);
                                        setForm(f => ({ ...f, ayat_to: e.target.value, surah_name: surah }));
                                      }}
                                      placeholder={String(to)}
                                      style={{ ...inp, fontSize:"0.6rem", padding:"4px 8px", textAlign:"center",
                                        color: sabqiTodayTo?"#4ade80":undefined }}/>
                                  </div>
                                  <span style={{ fontSize:"0.48rem", color:"rgba(255,255,255,0.25)", direction:"rtl", flexShrink:0 }}>آیت</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary footer */}
                    <div style={{ padding:"6px 12px", borderTop:"1px solid rgba(255,255,255,0.05)",
                      display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                      <span style={{ fontSize:"0.48rem", color:"rgba(74,222,128,0.5)", direction:"rtl", flex:1 }}>
                        {paraLog.length > 0
                          ? `${paraLog.length} نشستیں | ${cumAyats}/${paraTotal} آیات`
                          : "ابھی کوئی سبقی نہیں ہوئی"}
                      </span>
                      {paraLog.length > 0 && (
                        <span style={{ fontSize:"0.48rem", color:"rgba(255,255,255,0.25)" }}>
                          آخری: {paraLog[paraLog.length-1]?.log_date?.slice(5)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <>
              {/* ── Continuation banner ── */}
              {lastSabaqNext && !todaySabaq && (() => {
                const { prev, surah, ayat_from } = lastSabaqNext;
                const isNewSurah = surah !== prev.surah_name;
                return (
                  <div style={{ background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.25)",
                    borderRadius:12, padding:"10px 14px", direction:"rtl" }}>
                    <div style={{ fontSize:"0.58rem", color:"rgba(96,165,250,0.6)", fontWeight:700, marginBottom:5 }}>
                      📌 گزشتہ سبق کا تسلسل
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.45)", direction:"rtl" }}>
                        گزشتہ:
                        <span style={{ color:"rgba(255,255,255,0.7)", fontWeight:700, marginRight:4 }}>{prev.surah_name}</span>
                        <span style={{ color:"rgba(255,255,255,0.4)" }}>آیت {prev.ayat_from}–{prev.ayat_to}</span>
                      </div>
                      <span style={{ color:"rgba(96,165,250,0.5)", fontSize:"0.7rem" }}>←</span>
                      <div style={{ fontSize:"0.65rem", color:"#60a5fa", fontWeight:700, direction:"rtl" }}>
                        {isNewSurah
                          ? `آج: ${surah} (نئی سورہ) آیت 1 سے`
                          : `آج: ${surah} آیت ${ayat_from} سے`
                        }
                      </div>
                    </div>
                    {isNewSurah && (
                      <div style={{ marginTop:5, fontSize:"0.52rem", color:"rgba(74,222,128,0.6)" }}>
                        ✅ {prev.surah_name} مکمل ہو گئی — {surah} شروع
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── صفحہ selector (primary) ── */}
              <div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <label style={{ color:"rgba(212,175,55,0.8)", fontSize:"0.65rem", fontWeight:700 }}>
                    آج کا سبق — صفحہ
                  </label>
                  {form.line_fraction && (
                    <span style={{ fontSize:"0.6rem", color:"#4ade80", fontWeight:700 }}>
                      {fracToLines(form.line_fraction).toFixed(0)} سطریں
                      <span style={{ color:"rgba(255,255,255,0.3)", fontWeight:400, marginRight:4 }}>(16 فی صفحہ)</span>
                    </span>
                  )}
                </div>
                {/* Big fraction button grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                  {FRACTIONS.map(f => {
                    const lines = fracToLines(f);
                    const isActive = form.line_fraction === f;
                    // Human-readable label
                    const lbl = f==="1/8"?"⅛ صفحہ":f==="1/6"?"⅙ صفحہ":f==="1/5"?"⅕ صفحہ"
                      :f==="1/4"?"¼ صفحہ":f==="1/3"?"⅓ صفحہ":f==="1/2"?"½ صفحہ"
                      :f==="2/3"?"⅔ صفحہ":f==="3/4"?"¾ صفحہ":"1 صفحہ (مکمل)";
                    return (
                      <button key={f} onClick={()=>set("line_fraction",f)} style={{
                        padding:"10px 6px", borderRadius:11, cursor:"pointer", direction:"rtl",
                        fontFamily:"'Noto Nastaliq Urdu',sans-serif", textAlign:"center",
                        background: isActive?"rgba(212,175,55,0.18)":"rgba(255,255,255,0.04)",
                        border: isActive?"1.5px solid rgba(212,175,55,0.7)":"1px solid rgba(255,255,255,0.08)",
                        color: isActive?"#d4af37":"rgba(255,255,255,0.5)",
                        boxShadow: isActive?"0 0 12px rgba(212,175,55,0.2)":"none",
                        transition:"all 0.18s",
                      }}>
                        <div style={{ fontSize:"0.82rem", fontWeight: isActive?900:600 }}>{lbl}</div>
                        <div style={{ fontSize:"0.5rem", marginTop:3,
                          color: isActive?"rgba(212,175,55,0.7)":"rgba(255,255,255,0.25)" }}>
                          ~{lines.toFixed(0)} سطریں
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── سورہ + آیت range (reference) ── */}
              <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12,
                border:"1px solid rgba(255,255,255,0.07)", padding:"12px" }}>
                {/* Header: label + page count badge */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  marginBottom:8, direction:"rtl" }}>
                  <span style={{ fontSize:"0.58rem", color:"rgba(212,175,55,0.55)", fontWeight:700 }}>
                    📖 سورہ اور آیات کا حوالہ
                  </span>
                  {form.surah_name && (() => {
                    const pgCount = getSurahPageCount(form.surah_name);
                    const app = getSurahAyatsPerPage(form.surah_name);
                    return (
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ fontSize:"0.52rem", color:"rgba(96,165,250,0.7)",
                          background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.2)",
                          borderRadius:8, padding:"2px 7px", direction:"rtl" }}>
                          {pgCount} صفحے — ~{app.toFixed(1)} آیات/صفحہ
                        </span>
                        <button onClick={()=>setShowPageBreakdown(v=>!v)}
                          style={{ fontSize:"0.52rem", padding:"2px 8px", borderRadius:8,
                            border:"1px solid rgba(212,175,55,0.3)", cursor:"pointer",
                            background: showPageBreakdown?"rgba(212,175,55,0.15)":"rgba(212,175,55,0.05)",
                            color:"rgba(212,175,55,0.8)", fontFamily:"inherit" }}>
                          {showPageBreakdown ? "▲ بند" : "▼ صفحات دیکھیں"}
                        </button>
                      </div>
                    );
                  })()}
                </div>
                {/* Surah */}
                <div style={{ marginBottom:8 }}>
                  <label style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.6rem", display:"block", marginBottom:3 }}>
                    سورہ
                    {form.surah_name && maxAyat(form.surah_name) &&
                      <span style={{ color:"rgba(255,255,255,0.25)", marginRight:5 }}> — کل آیات: {maxAyat(form.surah_name)}</span>}
                  </label>
                  <select value={form.surah_name} onChange={e=>{ handleSurahChange(e.target.value); setShowPageBreakdown(false); }}
                    style={{ ...inp, colorScheme:"dark", borderColor:"rgba(255,255,255,0.1)", fontSize:"0.72rem" }}>
                    <option value="">— سورہ منتخب کریں —</option>
                    {SURAHS.map((s,i) => <option key={i} value={s}>{i+1}. {s} ({SURAH_AYATS[s]||""})</option>)}
                  </select>
                </div>
                {/* Ayat range */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div>
                    <label style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.6rem", display:"block", marginBottom:3 }}>آیت (سے)</label>
                    <input type="number" min={1} max={maxAyat(form.surah_name)||undefined}
                      value={form.ayat_from} onChange={e=>handleAyatFrom(e.target.value)} placeholder="1"
                      style={{ ...inp, borderColor: ayatErr?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.6rem", display:"block", marginBottom:3 }}>
                      آیت (تک)
                      {form.surah_name && form.ayat_to && form.ayat_from && (
                        <span style={{ color:"#4ade80", fontWeight:700, marginRight:4 }}>
                          {" "}({(parseInt(form.ayat_to)||0)-(parseInt(form.ayat_from)||0)+1} آیات)
                        </span>
                      )}
                    </label>
                    <input type="number" min={1} max={maxAyat(form.surah_name)||undefined}
                      value={form.ayat_to} onChange={e=>handleAyatTo(e.target.value)}
                      placeholder={maxAyat(form.surah_name)?String(maxAyat(form.surah_name)):"7"}
                      style={{ ...inp, borderColor: ayatErr?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.1)",
                        color: form.ayat_to?"#4ade80":undefined }} />
                  </div>
                </div>
                {ayatErr && <div style={{ marginTop:6, padding:"5px 10px", borderRadius:7,
                  background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)",
                  color:"#f87171", fontSize:"0.65rem", direction:"rtl" }}>⚠ {ayatErr}</div>}

                {/* ── Page breakdown panel ── */}
                {showPageBreakdown && form.surah_name && (() => {
                  const bd = getSurahPageBreakdown(form.surah_name);
                  const activeFrom = parseInt(form.ayat_from) || 0;
                  const activeTo   = parseInt(form.ayat_to)   || 0;
                  const paraBounds = getSurahParaBoundaries(form.surah_name);
                  return (
                    <div style={{ marginTop:10, borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:10 }}>
                      <div style={{ fontSize:"0.55rem", color:"rgba(212,175,55,0.5)", marginBottom:6,
                        direction:"rtl", fontWeight:700 }}>
                        📄 صفحہ وار تفصیل — {form.surah_name}
                      </div>

                      {/* Para summary for this surah */}
                      {paraBounds.length > 0 && (
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
                          {paraBounds.map(({ para, from, to }) => (
                            <div key={para} style={{ padding:"3px 10px", borderRadius:7,
                              background:"rgba(245,158,11,0.1)",
                              border:"1px solid rgba(245,158,11,0.25)",
                              fontSize:"0.5rem", color:"#f59e0b", direction:"rtl" }}>
                              <span style={{ fontWeight:900 }}>پارہ {para}</span>
                              <span style={{ color:"rgba(245,158,11,0.5)", marginRight:4 }}>
                                {" "}آیت {from}–{to}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Activity legend */}
                      <div style={{ gridColumn:"1/-1", display:"flex", gap:8, flexWrap:"wrap",
                        marginBottom:6, direction:"rtl", alignItems:"center",
                        padding:"5px 8px", borderRadius:8,
                        background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.3)", marginLeft:4 }}>سرگرمی:</span>
                        {[
                          { color:"#60a5fa", bg:"rgba(96,165,250,0.15)",  label:"سبق"  },
                          { color:"#4ade80", bg:"rgba(74,222,128,0.15)",  label:"سبقی" },
                          { color:"#fbbf24", bg:"rgba(251,191,36,0.15)",  label:"منزل" },
                        ].map(({ color, bg, label }) => (
                          <span key={label} style={{ display:"flex", alignItems:"center", gap:5,
                            padding:"2px 8px", borderRadius:6, background:bg, border:`1px solid ${color}40` }}>
                            <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block",
                              boxShadow:`0 0 5px ${color}` }}/>
                            <span style={{ fontSize:"0.5rem", color, fontWeight:700 }}>{label}</span>
                          </span>
                        ))}
                      </div>

                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))", gap:5 }}>
                        {bd.map(pg => {
                          const overlap = activeTo > 0
                            ? (pg.from <= activeTo && pg.to >= activeFrom) : false;
                          const isCurrentPage = activeFrom > 0
                            ? (activeFrom >= pg.from && activeFrom <= pg.to) : false;
                          // Check if a para ends on this page
                          const pgBounds = getParaBoundariesInPage(form.surah_name, pg.from, pg.to);
                          const hasParaEnd = pgBounds.length > 0;
                          // Color-coded activity
                          const act = ((pageActivity[form.surah_name] || {})[pg.page]) || {};
                          const sabaqCnt  = act.sabaq?.length  || 0;
                          const sabqiCnt  = act.sabqi?.length  || 0;
                          const manzilCnt = act.manzil?.length || 0;
                          const hasSabaq  = sabaqCnt  > 0;
                          const hasSabqi  = sabqiCnt  > 0;
                          const hasManzil = manzilCnt > 0;
                          const hasAny = hasSabaq || hasSabqi || hasManzil;
                          // Border & bg priority: current > manzil > sabqi > sabaq > para > overlap
                          const borderColor = isCurrentPage
                            ? "rgba(212,175,55,0.7)"
                            : hasManzil ? "rgba(251,191,36,0.6)"
                            : hasSabqi  ? "rgba(74,222,128,0.55)"
                            : hasSabaq  ? "rgba(96,165,250,0.5)"
                            : hasParaEnd ? "rgba(245,158,11,0.45)"
                            : overlap ? "rgba(96,165,250,0.3)"
                            : "rgba(255,255,255,0.07)";
                          const bgColor = isCurrentPage
                            ? "rgba(212,175,55,0.18)"
                            : hasManzil ? "rgba(251,191,36,0.1)"
                            : hasSabqi  ? "rgba(74,222,128,0.08)"
                            : hasSabaq  ? "rgba(96,165,250,0.09)"
                            : hasParaEnd ? "rgba(245,158,11,0.07)"
                            : overlap ? "rgba(96,165,250,0.07)"
                            : "rgba(255,255,255,0.02)";
                          return (
                            <button key={pg.page}
                              onClick={()=>{ handleAyatFrom(String(pg.from)); }}
                              style={{
                                padding:"7px 5px 6px", borderRadius:10, cursor:"pointer",
                                direction:"rtl", textAlign:"center", fontFamily:"inherit",
                                background: bgColor,
                                border: `${isCurrentPage||hasManzil||hasSabqi||hasSabaq?"1.5px":"1px"} solid ${borderColor}`,
                                boxShadow: hasManzil ? "0 0 12px rgba(251,191,36,0.2), inset 0 0 8px rgba(251,191,36,0.06)"
                                  : hasSabqi ? "0 0 10px rgba(74,222,128,0.18), inset 0 0 6px rgba(74,222,128,0.05)"
                                  : hasSabaq ? "0 0 8px rgba(96,165,250,0.15)"
                                  : hasParaEnd ? "0 0 8px rgba(245,158,11,0.12)"
                                  : isCurrentPage ? "0 0 12px rgba(212,175,55,0.2)" : "none",
                              }}>
                              <div style={{ fontSize:"0.55rem", fontWeight:700,
                                color: isCurrentPage?"#d4af37": hasManzil?"#fbbf24": hasSabqi?"#4ade80": hasSabaq?"#60a5fa": hasParaEnd?"#f59e0b": overlap?"#60a5fa":"rgba(255,255,255,0.5)" }}>
                                صفحہ {pg.page}
                              </div>
                              <div style={{ fontSize:"0.52rem", marginTop:2,
                                color: isCurrentPage?"rgba(212,175,55,0.7)": hasManzil?"rgba(251,191,36,0.65)": hasSabqi?"rgba(74,222,128,0.65)": hasSabaq?"rgba(96,165,250,0.65)": hasParaEnd?"rgba(245,158,11,0.6)":"rgba(255,255,255,0.3)" }}>
                                آیت {pg.from}–{pg.to}
                              </div>
                              <div style={{ fontSize:"0.45rem", marginTop:1, color:"rgba(255,255,255,0.2)" }}>
                                ({pg.count} آیات)
                              </div>
                              {/* Para end badge */}
                              {pgBounds.map(b => (
                                <div key={b.newPara} style={{ marginTop:3,
                                  fontSize:"0.4rem", fontWeight:900, color:"#f59e0b",
                                  background:"rgba(245,158,11,0.18)", borderRadius:4,
                                  padding:"1px 5px", direction:"rtl" }}>
                                  ✦ پارہ {b.endingPara} ختم
                                </div>
                              ))}
                              {/* Activity badges row */}
                              {hasAny && (
                                <div style={{ display:"flex", gap:3, justifyContent:"center", flexWrap:"wrap", marginTop:5 }}>
                                  {hasSabaq && (
                                    <div style={{ display:"flex", alignItems:"center", gap:2,
                                      padding:"1px 5px", borderRadius:5,
                                      background:"rgba(96,165,250,0.18)", border:"1px solid rgba(96,165,250,0.4)" }}>
                                      <span style={{ width:5, height:5, borderRadius:"50%", background:"#60a5fa",
                                        boxShadow:"0 0 4px #60a5fa", display:"inline-block" }}/>
                                      <span style={{ fontSize:"0.42rem", color:"#60a5fa", fontWeight:700 }}>{sabaqCnt}</span>
                                    </div>
                                  )}
                                  {hasSabqi && (
                                    <div style={{ display:"flex", alignItems:"center", gap:2,
                                      padding:"1px 5px", borderRadius:5,
                                      background:"rgba(74,222,128,0.18)", border:"1px solid rgba(74,222,128,0.4)" }}>
                                      <span style={{ width:5, height:5, borderRadius:"50%", background:"#4ade80",
                                        boxShadow:"0 0 4px #4ade80", display:"inline-block" }}/>
                                      <span style={{ fontSize:"0.42rem", color:"#4ade80", fontWeight:700 }}>{sabqiCnt}</span>
                                    </div>
                                  )}
                                  {hasManzil && (
                                    <div style={{ display:"flex", alignItems:"center", gap:2,
                                      padding:"1px 5px", borderRadius:5,
                                      background:"rgba(251,191,36,0.18)", border:"1px solid rgba(251,191,36,0.4)" }}>
                                      <span style={{ width:5, height:5, borderRadius:"50%", background:"#fbbf24",
                                        boxShadow:"0 0 4px #fbbf24", display:"inline-block" }}/>
                                      <span style={{ fontSize:"0.42rem", color:"#fbbf24", fontWeight:700 }}>{manzilCnt}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* Duration */}
          <div>
            <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700, display:"block", marginBottom:4 }}>وقت (منٹ)</label>
            <input type="number" min={1} value={form.duration_minutes} onChange={e=>set("duration_minutes",e.target.value)} placeholder="20" style={inp} />
          </div>

          {/* ── Unified Mistake Tracker ── */}
          {["sabaq","sabqi","manzil"].includes(form.log_type) ? (() => {
            const activeColor = form.log_type==="sabaq"?"#60a5fa":form.log_type==="sabqi"?"#4ade80":"#f59e0b";
            const mistakes    = form.log_type==="sabaq"?sabaqMistakes:form.log_type==="sabqi"?sabqiMistakes:manzilMistakes;
            const setMistakes = form.log_type==="sabaq"?setSabaqMistakes:form.log_type==="sabqi"?setSabqiMistakes:setManzilMistakes;
            const mCount = mistakes.length;
            const mColor = mCount===0?"#4ade80":mCount<=3?"#fbbf24":"#f87171";

            // Add current entry to list
            const commitEntry = () => {
              if (!mistakeEntry.surah || !mistakeEntry.ayat) return;
              const entry = {
                id: Date.now(),
                surah: mistakeEntry.surah,
                ayat: mistakeEntry.ayat,
                arabicText: mistakeText || null,
                textFail: mistakeFail,
                manualText: mistakeManual,
                selectedWords: new Set(mistakeWords),
                types: new Set(mistakeTypes),
              };
              setMistakes(prev => [...prev, entry]);
              setAddingMistake(false);
              setMistakeEntry({ surah: mistakeEntry.surah, ayat: mistakeEntry.ayat + 1 });
              setMistakeText(null); setMistakeFail(false);
              setMistakeWords(new Set()); setMistakeTypes(new Set()); setMistakeManual("");
            };

            return (
              <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${activeColor}25`,
                borderRadius:14, padding:"12px 14px" }}>

                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  marginBottom:10, direction:"rtl" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:"0.65rem", fontWeight:700, color:"rgba(212,175,55,0.8)" }}>غلطیاں</span>
                    <span style={{ fontSize:"0.45rem", color:"rgba(255,255,255,0.2)" }}>
                      ({form.log_type==="sabaq"?"سبق":form.log_type==="sabqi"?"سبقی":"منزل"})
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    {mCount > 0 && (
                      <button onClick={()=>setMistakes([])}
                        style={{ fontSize:"0.45rem", padding:"2px 7px", borderRadius:7, cursor:"pointer",
                          border:"1px solid rgba(248,113,113,0.3)", background:"rgba(248,113,113,0.08)",
                          color:"rgba(248,113,113,0.7)", fontFamily:"inherit" }}>صاف</button>
                    )}
                    <span style={{ fontSize:"1.1rem", fontWeight:900, color:mColor, minWidth:28, textAlign:"center",
                      textShadow:mCount>0?`0 0 10px ${mColor}60`:"none" }}>{mCount}</span>
                  </div>
                </div>

                {/* Existing mistake list */}
                {mistakes.length > 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:10 }}>
                    {mistakes.map((m, i) => {
                      const words = m.arabicText ? m.arabicText.split(" ") : [];
                      const selWords = [...(m.selectedWords||[])];
                      return (
                        <div key={m.id} style={{ padding:"7px 10px", borderRadius:9,
                          background:"rgba(248,113,113,0.06)",
                          border:"1px solid rgba(248,113,113,0.25)",
                          display:"flex", flexDirection:"column", gap:4 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, direction:"rtl" }}>
                            <span style={{ fontSize:"0.6rem", fontWeight:700, color:"#f87171" }}>⚠</span>
                            <span style={{ fontSize:"0.62rem", fontWeight:700, color:"#f1f5f9" }}>{m.surah}</span>
                            <span style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.4)" }}>آیت {m.ayat}</span>
                            {[...(m.types||[])].map(t => {
                              const mt = MISTAKE_TYPES.find(x=>x.id===t);
                              return mt ? (
                                <span key={t} style={{ fontSize:"0.42rem", padding:"1px 5px", borderRadius:5,
                                  background:"rgba(248,113,113,0.12)", border:"1px solid rgba(248,113,113,0.3)",
                                  color:"#fca5a5" }}>{mt.label}</span>
                              ) : null;
                            })}
                            <button onClick={()=>setMistakes(prev=>prev.filter((_,j)=>j!==i))}
                              style={{ marginRight:"auto", fontSize:"0.55rem", color:"rgba(248,113,113,0.5)",
                                background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                          </div>
                          {/* Selected words or manual text */}
                          {selWords.length > 0 && (
                            <div style={{ direction:"rtl", display:"flex", flexWrap:"wrap", gap:3 }}>
                              {words.map((w, wi) => selWords.includes(wi) ? (
                                <span key={wi} style={{ fontSize:"0.65rem", padding:"2px 5px", borderRadius:5,
                                  background:"rgba(248,113,113,0.2)", color:"#fca5a5",
                                  border:"1px solid rgba(248,113,113,0.4)", direction:"rtl" }}>{w}</span>
                              ) : null)}
                            </div>
                          )}
                          {m.manualText && (
                            <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.4)", direction:"rtl" }}>
                              {m.manualText}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add mistake form */}
                {!addingMistake ? (
                  <button onClick={()=>{
                    setAddingMistake(true);
                    const defSurah = form.surah_name || SURAHS[0];
                    setMistakeEntry({ surah: defSurah, ayat: parseInt(form.ayat_from)||1 });
                    setMistakeText(null); setMistakeFail(false);
                    setMistakeWords(new Set()); setMistakeTypes(new Set()); setMistakeManual("");
                  }} style={{ width:"100%", padding:"8px", borderRadius:9, cursor:"pointer",
                    border:`1.5px dashed ${activeColor}50`, background:`${activeColor}08`,
                    color:activeColor, fontSize:"0.58rem", fontWeight:700, fontFamily:"inherit",
                    direction:"rtl" }}>
                    + غلطی درج کریں
                  </button>
                ) : (
                  <div style={{ borderRadius:10, border:`1px solid ${activeColor}30`,
                    background:`${activeColor}05`, padding:"10px 12px",
                    display:"flex", flexDirection:"column", gap:8 }}>

                    {/* Row 1: Surah + Ayat + Fetch */}
                    <div style={{ display:"flex", gap:6, alignItems:"flex-end", direction:"rtl" }}>
                      <div style={{ flex:2 }}>
                        <label style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.35)", display:"block", marginBottom:3 }}>سورہ</label>
                        <select value={mistakeEntry.surah}
                          onChange={e=>{ setMistakeEntry(v=>({...v,surah:e.target.value,ayat:1})); setMistakeText(null); setMistakeFail(false); }}
                          style={{ ...inp, fontSize:"0.6rem", padding:"5px 8px" }}>
                          <option value="">— منتخب کریں —</option>
                          {SURAHS.map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{ flex:1 }}>
                        <label style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.35)", display:"block", marginBottom:3 }}>آیت</label>
                        <select value={mistakeEntry.ayat}
                          onChange={e=>{ setMistakeEntry(v=>({...v,ayat:parseInt(e.target.value)})); setMistakeText(null); setMistakeFail(false); }}
                          style={{ ...inp, fontSize:"0.6rem", padding:"5px 8px" }}>
                          {Array.from({length: SURAH_AYATS[mistakeEntry.surah]||1},(_,i)=>i+1).map(n=>(
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <button onClick={()=>fetchAyatText(mistakeEntry.surah, mistakeEntry.ayat)}
                        disabled={!mistakeEntry.surah || fetchingAyat}
                        style={{ padding:"5px 10px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                          border:`1px solid ${activeColor}40`, background:`${activeColor}15`,
                          color:activeColor, fontSize:"0.55rem", fontWeight:700,
                          opacity:fetchingAyat?0.5:1 }}>
                        {fetchingAyat ? "..." : "لاؤ ↓"}
                      </button>
                    </div>

                    {/* Arabic text with word-click */}
                    {mistakeText && !mistakeFail && (
                      <div>
                        <div style={{ fontSize:"0.45rem", color:"rgba(255,255,255,0.25)", marginBottom:4, direction:"rtl" }}>
                          غلط لفظ ٹیپ کریں:
                        </div>
                        <div style={{ direction:"rtl", display:"flex", flexWrap:"wrap", gap:5, padding:"8px",
                          background:"rgba(255,255,255,0.04)", borderRadius:8,
                          border:"1px solid rgba(255,255,255,0.08)" }}>
                          {mistakeText.split(" ").map((word, wi) => {
                            const sel = mistakeWords.has(wi);
                            return (
                              <button key={wi} onClick={()=>setMistakeWords(prev=>{
                                const n=new Set(prev); sel?n.delete(wi):n.add(wi); return n;
                              })} style={{ fontSize:"1rem", fontFamily:"'Uthmanic Hafs',serif",
                                padding:"3px 7px", borderRadius:7, cursor:"pointer",
                                background:sel?"rgba(248,113,113,0.2)":"rgba(255,255,255,0.04)",
                                border:sel?"1.5px solid rgba(248,113,113,0.55)":"1px solid rgba(255,255,255,0.08)",
                                color:sel?"#fca5a5":"rgba(255,255,255,0.85)",
                                boxShadow:sel?"0 0 8px rgba(248,113,113,0.2)":"none",
                                transition:"all 0.1s" }}>
                                {word}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fallback text input if API failed */}
                    {(mistakeFail || (!mistakeText && !fetchingAyat)) && (
                      <div>
                        <label style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.3)", display:"block", marginBottom:3, direction:"rtl" }}>
                          {mistakeFail ? "⚠ API دستیاب نہیں — تفصیل لکھیں:" : "غلطی کی تفصیل (اختیاری):"}
                        </label>
                        <input value={mistakeManual} onChange={e=>setMistakeManual(e.target.value)}
                          placeholder="مثلاً: لفظ ربّ میں تشدید..."
                          style={{ ...inp, fontSize:"0.6rem", direction:"rtl" }}/>
                      </div>
                    )}

                    {/* Mistake type checkboxes */}
                    <div>
                      <div style={{ fontSize:"0.5rem", color:"rgba(255,255,255,0.3)", marginBottom:4, direction:"rtl" }}>
                        غلطی کی قسم:
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, direction:"rtl" }}>
                        {MISTAKE_TYPES.map(mt => {
                          const on = mistakeTypes.has(mt.id);
                          return (
                            <button key={mt.id} onClick={()=>setMistakeTypes(prev=>{
                              const n=new Set(prev); on?n.delete(mt.id):n.add(mt.id); return n;
                            })} style={{ padding:"4px 10px", borderRadius:8, cursor:"pointer",
                              fontSize:"0.55rem", fontWeight:on?700:400, fontFamily:"inherit",
                              border:`1px solid ${on?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.1)"}`,
                              background:on?"rgba(248,113,113,0.15)":"rgba(255,255,255,0.04)",
                              color:on?"#fca5a5":"rgba(255,255,255,0.45)",
                              transition:"all 0.1s" }}>
                              {mt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                      <button onClick={()=>setAddingMistake(false)}
                        style={{ padding:"5px 12px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                          border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)",
                          color:"rgba(255,255,255,0.4)", fontSize:"0.55rem" }}>
                        منسوخ
                      </button>
                      <button onClick={commitEntry}
                        disabled={!mistakeEntry.surah}
                        style={{ padding:"5px 14px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                          border:`1px solid ${activeColor}50`, background:`${activeColor}20`,
                          color:activeColor, fontSize:"0.58rem", fontWeight:700,
                          opacity:!mistakeEntry.surah?0.4:1 }}>
                        ✓ شامل کریں
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })() : (
            <div>
              <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700, display:"block", marginBottom:4 }}>غلطیاں</label>
              <input type="number" min={0} value={form.mistakes_count} onChange={e=>set("mistakes_count",e.target.value)} placeholder="0" style={inp} />
            </div>
          )}

          {/* Quality — auto-grade card */}
          {(() => {
            const activeQ = QUALITIES.find(q => q.id === form.quality) || QUALITIES[0];
            return (
              <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${activeQ.color}30`,
                borderRadius:14, padding:"14px", direction:"rtl" }}>
                {/* Header row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:"0.65rem", fontWeight:700, color:"rgba(212,175,55,0.8)" }}>معیار</span>
                    {!qualityOverridden && (
                      <span style={{ fontSize:"0.48rem", background:"rgba(96,165,250,0.15)",
                        color:"#60a5fa", border:"1px solid rgba(96,165,250,0.3)",
                        borderRadius:8, padding:"1px 6px" }}>خودکار</span>
                    )}
                    {qualityOverridden && (
                      <button onClick={()=>{
                        setQualityOverridden(false);
                        const ayatCount = sabqiCross
                          ? ((parseInt(form.ayat_to)||0)-(parseInt(form.ayat_from)||0)+1)+((parseInt(sabqiEndAyat)||0))
                          : ((parseInt(form.ayat_to)||0)-(parseInt(form.ayat_from)||0)+1);
                        const grade = getAutoGrade(form.mistakes_count, ayatCount > 0 ? ayatCount : 0);
                        const q2 = QUALITIES.find(x=>x.id===grade);
                        if(q2) setForm(f=>({...f, quality:grade, ustad_rating:q2.stars}));
                      }} style={{ fontSize:"0.45rem", background:"rgba(96,165,250,0.1)",
                        color:"#60a5fa", border:"1px solid rgba(96,165,250,0.25)",
                        borderRadius:7, padding:"2px 7px", cursor:"pointer", fontFamily:"inherit" }}>
                        ↩ خودکار پر واپس
                      </button>
                    )}
                  </div>
                  {/* Active grade large display */}
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:"0.9rem", fontWeight:900, color:activeQ.color,
                      textShadow:`0 0 12px ${activeQ.color}60` }}>
                      {activeQ.emoji} {activeQ.label}
                    </span>
                    {/* Stars */}
                    <div style={{ display:"flex", gap:2 }}>
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ fontSize:"0.75rem",
                          opacity: n<=activeQ.stars ? 1 : 0.18 }}>⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Threshold bar */}
                <div style={{ position:"relative", height:6, borderRadius:99,
                  background:"rgba(255,255,255,0.07)", marginBottom:10, overflow:"hidden" }}>
                  {QUALITIES.slice().reverse().map((q,i,arr)=>(
                    <div key={q.id} style={{
                      position:"absolute", top:0, left:`${(i/arr.length)*100}%`,
                      width:`${100/arr.length}%`, height:"100%",
                      background: form.quality===q.id ? q.color : `${q.color}35`,
                      transition:"background 0.3s"
                    }}/>
                  ))}
                </div>
                {/* Grade selector buttons */}
                <div style={{ display:"flex", gap:5 }}>
                  {QUALITIES.map(q => {
                    const isActive = form.quality === q.id;
                    return (
                      <button key={q.id} onClick={()=>{
                        setQualityOverridden(true);
                        const qs = QUALITIES.find(x=>x.id===q.id);
                        setForm(f=>({...f, quality:q.id, ustad_rating: qs?qs.stars:f.ustad_rating}));
                      }} style={{
                        flex:1, padding:"7px 4px", borderRadius:10, cursor:"pointer",
                        fontFamily:"'Noto Nastaliq Urdu',sans-serif", fontSize:"0.6rem",
                        fontWeight: isActive ? 900 : 500,
                        background: isActive ? `${q.color}22` : "rgba(255,255,255,0.03)",
                        color: isActive ? q.color : "rgba(255,255,255,0.35)",
                        border: isActive ? `1.5px solid ${q.color}70` : "1px solid rgba(255,255,255,0.07)",
                        transition:"all 0.2s", direction:"rtl",
                        boxShadow: isActive ? `0 0 10px ${q.color}30` : "none",
                      }}>
                        <div style={{ fontSize:"0.85rem" }}>{q.emoji}</div>
                        <div>{q.label}</div>
                        <div style={{ fontSize:"0.42rem", color: isActive?`${q.color}99`:"rgba(255,255,255,0.2)",
                          marginTop:2 }}>{q.desc}</div>
                      </button>
                    );
                  })}
                </div>
                {/* Ustaz manual star override */}
                <div style={{ marginTop:10, paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.06)",
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:"0.55rem", color:"rgba(212,175,55,0.5)" }}>استاد کی درجہ بندی</span>
                  <div style={{ display:"flex", gap:4 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={()=>{ setQualityOverridden(true); set("ustad_rating",n); }}
                        style={{ fontSize:"1.1rem", background:"none", border:"none", cursor:"pointer",
                          lineHeight:1, filter: n<=form.ustad_rating?"none":"grayscale(100%) opacity(20%)",
                          transition:"filter 0.15s", padding:"0 1px" }}>⭐</button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Audio Recorder */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700 }}>🎙️ آڈیو ریکارڈنگ</label>
              {/* Status badge */}
              {audioURL && !recording && (
                <span style={{ fontSize:"0.48rem", padding:"2px 8px", borderRadius:6, fontWeight:700,
                  background: audioSaved?"rgba(74,222,128,0.12)":uploading?"rgba(96,165,250,0.12)":"rgba(251,191,36,0.12)",
                  border: `1px solid ${audioSaved?"rgba(74,222,128,0.35)":uploading?"rgba(96,165,250,0.35)":"rgba(251,191,36,0.35)"}`,
                  color: audioSaved?"#4ade80":uploading?"#60a5fa":"#fbbf24" }}>
                  {uploading ? "☁ اپلوڈ ہو رہا ہے..." : audioSaved ? "☁ محفوظ ✓" : "⚠ صرف مقامی — save پر اپلوڈ ہوگا"}
                </span>
              )}
            </div>

            <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"10px 12px",
              border:`1px solid ${recording?"rgba(239,68,68,0.4)":audioSaved?"rgba(74,222,128,0.2)":"rgba(255,255,255,0.07)"}`,
              display:"flex", flexDirection:"column", gap:8 }}>

              {/* Overwrite warning */}
              {showRecWarn && (
                <div style={{ padding:"8px 12px", borderRadius:9,
                  background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.3)",
                  direction:"rtl", display:"flex", flexDirection:"column", gap:6 }}>
                  <div style={{ fontSize:"0.6rem", color:"#fbbf24", fontWeight:700 }}>
                    ⚠ پرانی ریکارڈنگ {audioSaved?"Supabase میں محفوظ ہے":"ابھی صرف مقامی ہے"} — نئی ریکارڈنگ سے تبدیل ہوجائے گی۔
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={doStartRecording}
                      style={{ flex:1, padding:"5px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                        fontSize:"0.58rem", fontWeight:700, border:"1px solid rgba(239,68,68,0.4)",
                        background:"rgba(239,68,68,0.12)", color:"#f87171" }}>
                      ہاں، دوبارہ ریکارڈ کریں
                    </button>
                    <button onClick={()=>setShowRecWarn(false)}
                      style={{ flex:1, padding:"5px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                        fontSize:"0.58rem", border:"1px solid rgba(255,255,255,0.1)",
                        background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.4)" }}>
                      منسوخ
                    </button>
                  </div>
                </div>
              )}

              {/* Controls row */}
              {!showRecWarn && (
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  {!recording ? (
                    <button onClick={startRecording} style={{ padding:"7px 14px", borderRadius:9,
                      background:"rgba(239,68,68,0.13)", border:"1px solid rgba(239,68,68,0.3)",
                      color:"#f87171", fontSize:"0.68rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                      display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:"#f87171", display:"inline-block" }}/>
                      {audioURL ? "دوبارہ ریکارڈ" : "ریکارڈ شروع"}
                    </button>
                  ) : (
                    <button onClick={stopRecording} style={{ padding:"7px 14px", borderRadius:9,
                      background:"rgba(239,68,68,0.25)", border:"1px solid rgba(239,68,68,0.5)",
                      color:"#f87171", fontSize:"0.68rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                      display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:"#f87171", display:"inline-block" }}/>
                      بند کریں
                    </button>
                  )}

                  {/* Live timer */}
                  {recording && (
                    <span style={{ fontSize:"0.75rem", fontWeight:900, color:"#f87171",
                      fontVariantNumeric:"tabular-nums", minWidth:36 }}>
                      {String(Math.floor(recDuration/60)).padStart(2,"0")}:{String(recDuration%60).padStart(2,"0")}
                    </span>
                  )}

                  {/* Playback */}
                  {audioURL && !recording && (
                    <audio src={audioURL} controls style={{ height:30, flex:1, minWidth:140 }} />
                  )}

                  {/* Delete recorded */}
                  {audioURL && !recording && (
                    <button onClick={()=>{ setAudioURL(null); setAudioBlob(null); setAudioSaved(false); setRecDuration(0); }}
                      style={{ padding:"5px 8px", borderRadius:7, cursor:"pointer", fontFamily:"inherit",
                        border:"1px solid rgba(248,113,113,0.25)", background:"rgba(248,113,113,0.06)",
                        color:"rgba(248,113,113,0.6)", fontSize:"0.55rem" }}>
                      ✕ حذف
                    </button>
                  )}
                </div>
              )}

              {/* Duration info after stop */}
              {audioURL && !recording && recDuration > 0 && (
                <div style={{ fontSize:"0.48rem", color:"rgba(255,255,255,0.25)", direction:"rtl" }}>
                  مدت: {String(Math.floor(recDuration/60)).padStart(2,"0")}:{String(recDuration%60).padStart(2,"0")}
                  {audioSaved ? " — Supabase میں محفوظ" : " — محفوظ کریں بٹن سے اپلوڈ ہوگا"}
                </div>
              )}
            </div>
          </div>

          {/* Ustad notes */}
          <div>
            <label style={{ color:"rgba(212,175,55,0.7)", fontSize:"0.65rem", fontWeight:700, display:"block", marginBottom:4 }}>استاد کے نوٹس</label>
            <textarea value={form.ustad_notes} onChange={e=>set("ustad_notes",e.target.value)} rows={2}
              placeholder="کوئی خاص تبصرہ…" style={{ ...inp, resize:"vertical", minHeight:54, fontFamily:"'Noto Nastaliq Urdu',sans-serif", direction:"rtl" }} />
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving||saved} style={{
            width:"100%", padding:"13px", borderRadius:12, border:"none",
            background: saved ? "rgba(74,222,128,0.2)" : `linear-gradient(135deg,${P},${P}cc)`,
            color: saved ? "#4ade80" : "#FFF", fontSize:"0.88rem", fontWeight:800,
            cursor: saving||saved ? "not-allowed" : "pointer", fontFamily:"inherit",
            opacity: saving ? 0.7 : 1
          }}>
            {saved ? "✅ محفوظ ہو گیا!" : saving ? "محفوظ ہو رہا ہے…" : `محفوظ کریں${!isOnline?" (آف لائن)":""} ✓`}
          </button>
        </div>
      </div>
    </div>
  );
}
