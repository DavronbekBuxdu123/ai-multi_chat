// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "quizapp-789ea.firebaseapp.com",
  projectId: "quizapp-789ea",
  storageBucket: "quizapp-789ea.firebasestorage.app",
  messagingSenderId: "420920130570",
  appId: "1:420920130570:web:c25bfd38ed20621b1bf3f3",
  measurementId: "G-K3RDESZDQW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
