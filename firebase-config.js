// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS024K6CozcOvOLHMou9dKsNDh-fCw10c",
  authDomain: "usermanagr.firebaseapp.com",
  projectId: "usermanagr",
  storageBucket: "usermanagr.appspot.com",
  messagingSenderId: "201891796617",
  appId: "1:201891796617:web:ab31f6c5b0e1becb6bd858",
  measurementId: "G-WPNMDSTYXZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export { app, auth, db, storage };