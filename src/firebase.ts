// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYuzyVzK7g0GVEuiZm5-yGhQuE0NNST0g",
  authDomain: "poetry-app-5166a.firebaseapp.com",
  projectId: "poetry-app-5166a",
  storageBucket: "poetry-app-5166a.firebasestorage.app",
  messagingSenderId: "481993700488",
  appId: "1:481993700488:web:c87977c8d4a33e327d9b3d",
  measurementId: "G-0LM4LZYWFN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const auth = getAuth(app);