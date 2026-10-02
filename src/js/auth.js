// Importa Auth + Firestore
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Permissões por perfil
const PERMISSOES = {
  'chef.html':      ['chef', 'gerente'],
  'garcom.html':    ['garcom', 'gerente'],
  'caixa.html':     ['caixa', 'gerente'],
  'dashboard.html': ['chef', 'caixa', 'gerente'],
};

// Esconde a página até validar
document.documentElement.style.visibility = 'hidden';

// ROUTE GUARD
onAuthStateChanged(auth, async (user) => {
  const paginaAtual = window.location.pathname.split('/').pop();

  // 1. Não logado → login
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    // 2. Busca o perfil
    const docRef = doc(db, 'usuarios', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert('Usuário sem perfil. Contate o gerente.');
      await signOut(auth);
      window.location.href = 'login.html';
      return;
    }

    const perfil = docSnap.data().perfil;
    const permitidos = PERMISSOES[paginaAtual];

    // 3. Verifica permissão
    if (permitidos && !permitidos.includes(perfil)) {
      alert(`⛔ Você (${perfil}) não tem permissão para acessar esta área.`);
      await signOut(auth);
      window.location.href = 'login.html';
      return;
    }

    // 4. Libera a tela
    document.documentElement.style.visibility = 'visible';
    console.log('✅ Acesso:', user.email, '| Perfil:', perfil);

    const el = document.getElementById('usuarioLogado');
    if (el) el.textContent = `${user.email} • ${perfil}`;

  } catch (erro) {
    console.error('Erro no guard:', erro);
    document.documentElement.style.visibility = 'visible';
  }
});

// Botão Sair
window.sair = async function() {
  await signOut(auth);
  window.location.href = 'login.html';
};

// Bloqueia botão "Voltar" após logout
window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.location.reload();
});

// Se abrir em nova aba sem login → volta
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !auth.currentUser) {
    window.location.href = 'login.html';
  }
});

// Bloqueia botão direito do mouse (opcional)
document.addEventListener('contextmenu', (e) => e.preventDefault());