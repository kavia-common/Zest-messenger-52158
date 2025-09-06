
// FIX: Import firebase v8 compat libraries.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// IMPORTANT: Replace this with your own Firebase project configuration as per the README.md guide.
// These are placeholder values and will not work.
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXX",
  authDomain: "zest-messenger-app.firebaseapp.com",
  projectId: "zest-messenger-app",
  storageBucket: "zest-messenger-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6a7b8c9d0e1"
};

// Initialize Firebase
// FIX: Use v8 initialization to avoid re-initializing.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase services for use throughout the app
// FIX: Export v8 services.
export const db = firebase.firestore();
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
