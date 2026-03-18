/* eslint-disable */
import { db, collection, getDocs, fbAddDoc, doc, setDoc, serverTimestamp } from "../firebase";
import { HOUSES, SEED_S, SEED_T } from "../constants";

async function seedDB() {
  try {
    const s = await getDocs(collection(db,"students"));
    if (!s.empty) return;
    for (const x of SEED_S) await fbAddDoc(collection(db,"students"),{...x,enrollmentStatus:"active",createdAt:serverTimestamp()});
    for (const x of SEED_T) await fbAddDoc(collection(db,"teachers"),{...x,isActive:true,createdAt:serverTimestamp()});
    for (const h of HOUSES) await setDoc(doc(db,"houses",h.id),{id:h.id,points:0,hvs_total:0,hvs_weeks:0,updatedAt:serverTimestamp()});
  } catch(e){ console.log("seed:",e.message); }
}

export default seedDB;
