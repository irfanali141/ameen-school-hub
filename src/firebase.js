/* eslint-disable */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc as fbAddDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = { apiKey: "AIzaSyAfGiUY0NlV1t2O99aaSvnqESrGBzr9PnE", authDomain: "ameen-school-hub.firebaseapp.com", projectId: "ameen-school-hub", storageBucket: "ameen-school-hub.firebasestorage.app", messagingSenderId: "793128969005", appId: "1:793128969005:web:12483cc66233eb7cdbe9a4" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, collection, getDocs, fbAddDoc, doc, setDoc, updateDoc, onSnapshot, serverTimestamp, query, orderBy, limit };
