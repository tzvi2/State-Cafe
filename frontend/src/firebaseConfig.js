// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXDV3K5RwgCgPVrvFRvusGoC0jh3jJqEc",
  authDomain: "state-cafe.firebaseapp.com",
  projectId: "state-cafe",
  storageBucket: "state-cafe.appspot.com",
  messagingSenderId: "225289956114",
  appId: "1:225289956114:web:c89faa8e9c6b3f704de1cb",
  measurementId: "G-31B51YM5GG"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app)

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting persistence: ", error);
  });

export {db, auth}