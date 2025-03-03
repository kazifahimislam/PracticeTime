// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpRHSVSqeFGW-nU8TXsR7u0Rcvwlut-0I",
  authDomain: "practicetime-182c4.firebaseapp.com",
  databaseURL: "https://practicetime-182c4-default-rtdb.firebaseio.com",
  projectId: "practicetime-182c4",
  storageBucket: "practicetime-182c4.firebasestorage.app",
  messagingSenderId: "500977746147",
  appId: "1:500977746147:web:fcc1dc88283fffe2c2c5d6",
  measurementId: "G-SX3M68WRG6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// ✅ Export as a single object
const firebaseServices = { app, auth, db, provider, ref, set, get, child };
export default firebaseServices;