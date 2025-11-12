// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

//  Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBnAnuAWrodlJk3ctlB6dO0LF6z6Zu95TI",
  authDomain: "clothing-store-8d50c.firebaseapp.com",
  projectId: "clothing-store-8d50c",
  storageBucket: "clothing-store-8d50c.firebasestorage.app",
  messagingSenderId: "284774865577",
  appId: "1:284774865577:web:b80b4c0f7a78aafa30e7b8",
};

//  Prevent re-initialization during Next.js hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Export commonly used Firebase services
export const auth = getAuth(app); // for login/signup
export const db = getFirestore(app); // for database
export default app;
