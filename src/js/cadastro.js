// Importa Auth + Firestore
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Controle: verifica o gerente UMA ÚNICA VEZ
let jaVerificou = false;
let usuarioEhGerente = false;
let nomeGerente = '';

onAuthStateChanged(auth, async (user) => {
  // Se já verificou, NUNCA mais verifica
  if (jaVerificou) return;

  // Sem usuário → login
  if (!user) {
    alert('⛔ Apenas o gerente pode cadastrar funcionários.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const docRef = doc(db, 'usuarios', user.uid);
    const docSnap = await getDoc(docRef);

    // Não é gerente → bloqueia
    if (!docSnap.exists() || docSnap.data().perfil !== 'gerente') {
      alert('⛔ Apenas o gerente pode cadastrar funcionários.');
      await signOut(auth);
      window.location.href = 'login.html';
      return;
    }

    // É gerente → libera
    usuarioEhGerente = true;
    jaVerificou = true;                    // 👈 TRAVA (não verifica mais)
    nomeGerente = docSnap.data().nome || 'Gerente';

    const el = document.getElementById('gerenteLogado');
    if (el) el.textContent = `Logado como: ${nomeGerente}`;

    console.log('✅ Gerente autenticado:', user.email);

  } catch (erro) {
    console.error(erro);
    window.location.href = 'login.html';
  }
});

// Elementos
const btnCadastrar = document.getElementById('btnCadastrar');
const btnVoltar = document.getElementById('btnVoltar');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const perfilInput = document.getElementById('perfil');
const msgErro = document.getElementById('msgErro');
const msgSucesso = document.getElementById('msgSucesso');

// Voltar
btnVoltar.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// Cadastrar
btnCadastrar.addEventListener('click', async () => {
  if (!usuarioEhGerente) {
    mostrarErro('Você não tem permissão para cadastrar.');
    return;
  }

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value;
  const perfil = perfilInput.value;

  if (!nome) { mostrarErro('Preencha o nome.'); return; }
  if (!email.includes('@')) { mostrarErro('E-mail inválido.'); return; }
  if (senha.length < 6) { mostrarErro('Senha muito curta.'); return; }
  if (!perfil) { mostrarErro('Escolha a função.'); return; }

  btnCadastrar.disabled = true;
  btnCadastrar.textContent = 'Cadastrando...';

  try {
    // Cria no Firebase Auth
    const userCred = await createUserWithEmailAndPassword(auth, email, senha);
    const novoUid = userCred.user.uid;

    // Salva no Firestore
    await setDoc(doc(db, 'usuarios', novoUid), {
      nome, email, perfil,
      criadoEm: Date.now(),
      criadoPor: nomeGerente,
    });

    // Faz logout do novo usuário
    await signOut(auth);

    mostrarSucesso(`✅ ${nome} cadastrado como "${perfil}"!`);

    // Redireciona pro login
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);

  } catch (erro) {
    console.error(erro);
    if (erro.code === 'auth/email-already-in-use') {
      mostrarErro('E-mail já cadastrado. Use outro.');
    } else {
      mostrarErro('Erro: ' + erro.message);
    }
    btnCadastrar.disabled = false;
    btnCadastrar.textContent = 'Cadastrar Funcionário';
  }
});

// Helpers
function mostrarErro(msg) {
  msgSucesso.classList.add('hidden');
  msgErro.textContent = '❌ ' + msg;
  msgErro.classList.remove('hidden');
  setTimeout(() => msgErro.classList.add('hidden'), 5000);
}

function mostrarSucesso(msg) {
  msgErro.classList.add('hidden');
  msgSucesso.textContent = msg;
  msgSucesso.classList.remove('hidden');
}

senhaInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnCadastrar.click();
});