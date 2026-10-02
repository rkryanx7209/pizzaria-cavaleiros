// Importa SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Configuração do projeto Pizzaria Cavaleiros
const firebaseConfig = {
  apiKey: "AIzaSyAqr2hCUMLW90sNxiLVhw9GhdJCFd3E9pE",
  authDomain: "pizzaria-cavaleiros.firebaseapp.com",
  projectId: "pizzaria-cavaleiros",
  storageBucket: "pizzaria-cavaleiros.firebasestorage.app",
  messagingSenderId: "62833207561",
  appId: "1:62833207561:web:67138fd13c179374380bd8"
};

// Exporta instâncias
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);