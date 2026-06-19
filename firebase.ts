import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaSUqRu7eB2Li58scpQzSWbmh1yvy3zBQ",
  authDomain: "notedb-7ab19.firebaseapp.com",
  projectId: "notedb-7ab19",
  storageBucket: "notedb-7ab19.firebasestorage.app",
  messagingSenderId: "815905864587",
  appId: "1:815905864587:web:a3eddbd69f21bac7b90d8e",
};

// Prevent re-initialization in Next.js hot reload / SSR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };