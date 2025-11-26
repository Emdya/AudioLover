import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmMnMv2qHxGBu-gUxmuhjnojv5sebH3YM",
  authDomain: "audiolover-60ca9.firebaseapp.com",
  projectId: "audiolover-60ca9",
  storageBucket: "audiolover-60ca9.firebasestorage.app",
  messagingSenderId: "670686594650",
  appId: "1:670686594650:web:938b960c604a2dfada7a63"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);