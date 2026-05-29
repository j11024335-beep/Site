// Configuração do Firebase
// IMPORTANTE: Substitua as configurações abaixo pelas do seu projeto no Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAW37sIiJ8WnJNjx8of2klOyToPeh0Bjfk",
  authDomain: "cardapio-bcf38.firebaseapp.com",
  databaseURL: "https://cardapio-bcf38-default-rtdb.firebaseio.com",
  projectId: "cardapio-bcf38",
  storageBucket: "cardapio-bcf38.firebasestorage.app",
  messagingSenderId: "991711198204",
  appId: "1:991711198204:web:ba21d974f5d4d0a21c5079",
  measurementId: "G-QQKN182X35"
};
// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { 
    db, auth, 
    collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy,
    signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail
};
