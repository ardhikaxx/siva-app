import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyALCxjKTb0K6XMiknovLJp8VVYHZVcRGUI",
  authDomain: "siva-app-2869c.firebaseapp.com",
  projectId: "siva-app-2869c",
  storageBucket: "siva-app-2869c.firebasestorage.app",
  messagingSenderId: "247619251694",
  appId: "1:247619251694:web:17b6d23e48442c0855b2ff",
  measurementId: "G-KQ2Z11YVGE",
  databaseURL: "https://siva-app-2869c-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);

export default app;
