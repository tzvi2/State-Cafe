// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXDV3K5RwgCgPVrvFRvusGoC0jh3jJqEc",
  authDomain: "state-cafe.firebaseapp.com",
  projectId: "state-cafe",
  storageBucket: "state-cafe.appspot.com",
  messagingSenderId: "225289956114",
  appId: "1:225289956114:web:c89faa8e9c6b3f704de1cb",
  measurementId: "G-31B51YM5GG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export {db}