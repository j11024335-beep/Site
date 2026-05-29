// Configuração do Firebase
// IMPORTANTE: Substitua as configurações abaixo pelas do seu projeto no Firebase Console
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
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
