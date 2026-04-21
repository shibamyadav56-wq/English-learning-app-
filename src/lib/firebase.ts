import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB99DUl0DVOJGssuNsP0yIDz-SO5h9jTJY",
  authDomain: "english-learning-app-81985.firebaseapp.com",
  projectId: "english-learning-app-81985",
  storageBucket: "english-learning-app-81985.appspot.com",
  messagingSenderId: "886871494264",
  appId: "1:886871494264:web:ca27f3a3e4e4e0fa88278d",
  measurementId: "G-MZQ12ZLN6N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function testConnection() {
  try {
    // Attempt to read a small dummy document
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful");
  } catch (error) {
    if(error instanceof Error) {
      console.error("Firestore connection failed:", error.message);
    }
  }
}
