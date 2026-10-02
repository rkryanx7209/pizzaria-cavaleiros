// Importa Auth + Firestore
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const btnEntrar = document.getElementById('btnEntrar');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const msgErro = document.getElementById('msgErro');

btnEntrar.addEventListener('click', async () => {
  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value;

  if (!email || !senha) { mostrarErro('Preencha e-mail e senha.'); return; }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, senha);
    const uid = userCred.user.uid;

    // Busca o perfil no Firestore
    const docRef = doc(db, 'usuarios', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      mostrarErro('Usuário sem perfil. Contate o gerente.');
      await auth.signOut();
      return;
    }

    const perfil = docSnap.data().perfil;

    // Redireciona por perfil
    const destinos = {
      chef:    'chef.html',
      garcom:  'garcom.html',
      caixa:   'caixa.html',
      gerente: 'dashboard.html',
    };

    window.location.href = destinos[perfil] || 'login.html';

  } catch (erro) {
    console.error(erro);
    mostrarErro('E-mail ou senha incorretos.');
  }
});

function mostrarErro(msg) {
  msgErro.textContent = '❌ ' + msg;
  msgErro.classList.remove('hidden');
}

senhaInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnEntrar.click();
});