import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6moNoUMJqg6IdKErLTBmmCZsqSVdCVDM",
  authDomain: "sample-sp-2026.firebaseapp.com",
  projectId: "sample-sp-2026",
  storageBucket: "sample-sp-2026.firebasestorage.app",
  messagingSenderId: "13605980148",
  appId: "1:13605980148:web:92922cbe871332e5b69ba1",
  measurementId: "G-T7PJZTG4FG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);