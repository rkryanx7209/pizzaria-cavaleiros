// Importa funções do dados.js
import { MENU, criarPedido, getPedidos, atualizarPedido, R, mm, hora, gerarReciboHTML } from './dados.js';

// Estado do tablet
const S = {
  etapa: 'identificacao',
  nome: '',
  mesa: '',      // ← vazio, nada pré-selecionado
  cart: {},
  pedidoAtual: null,
};

let timerAutoReset = null;
let intervalContagem = null;
const TEMPO_RESET = 4;

// Renderiza a etapa atual
function renderTablet() {
  const etapas = {
    identificacao: 'etapaIdentificacao',
    cardapio: 'etapaCardapio',
    aguardando: 'etapaAguardando',
    pagamento: 'etapaPagamento',
    pago: 'etapaPago',
  };

  Object.values(etapas).forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(etapas[S.etapa]).classList.remove('hidden');

  // ETAPA: IDENTIFICAÇÃO
  if (S.etapa === 'identificacao') {
    const sel = document.getElementById('mesa');

    // Popula o select na primeira vez
    if (sel.options.length === 0) {
      // Placeholder "Selecione..."
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selecione sua mesa...';
      placeholder.disabled = true;
      placeholder.selected = true;
      sel.appendChild(placeholder);

      // 12 mesas
      for (let i = 1; i <= 12; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Mesa ${mm(i)}`;
        sel.appendChild(opt);
      }
    }

    sel.value = S.mesa;
    document.getElementById('nome').value = S.nome;
  }

  // ETAPA: CARDÁPIO
  if (S.etapa === 'cardapio') {
    document.getElementById('saudacao').textContent = `Olá, ${S.nome}!`;
    document.getElementById('infoMesa').textContent = `Cardápio da Mesa ${mm(S.mesa)}`;
    document.getElementById('listaItens').innerHTML = renderizarCardapio();

    const total = MENU.reduce((s, i) => s + (S.cart[i.n] || 0) * i.p, 0);
    const qtd = Object.values(S.cart).reduce((a, b) => a + b, 0);
    document.getElementById('totalPedido').textContent = R(total);
    document.getElementById('btnEnviar').disabled = qtd === 0;
  }

  // ETAPA: AGUARDANDO
  if (S.etapa === 'aguardando' && S.pedidoAtual) {
    document.getElementById('mesaAguardando').textContent = mm(S.pedidoAtual.mesa);
    document.getElementById('horaPedido').textContent = hora(S.pedidoAtual.t);
    document.getElementById('reciboAguardando').innerHTML = gerarReciboHTML(S.pedidoAtual);
  }

  // ETAPA: PAGAMENTO
  if (S.etapa === 'pagamento' && S.pedidoAtual) {
    document.getElementById('reciboPagamento').innerHTML = gerarReciboHTML(S.pedidoAtual);
  }

  // ETAPA: PAGO
  if (S.etapa === 'pago' && S.pedidoAtual) {
    document.getElementById('nomePago').textContent = S.nome;
    document.getElementById('reciboPago').innerHTML = gerarReciboHTML(S.pedidoAtual, true);
    iniciarContagemRegressiva();
  }
}

// Renderiza o cardápio
function renderizarCardapio() {
  const trad = MENU.filter(i => i.cat === 'tradicional');
  const esp = MENU.filter(i => i.cat === 'especial');
  const beb = MENU.filter(i => i.cat === 'bebida');

  return `
    <h3 class="secao-cardapio">🍕 Pizzas Tradicionais</h3>
    ${trad.map(renderizarItem).join('')}
    <h3 class="secao-cardapio">⭐ Pizzas Especiais</h3>
    ${esp.map(renderizarItem).join('')}
    <h3 class="secao-cardapio">🥤 Bebidas</h3>
    ${beb.map(renderizarItem).join('')}
  `;
}

// Renderiza um item
function renderizarItem(item) {
  const q = S.cart[item.n] || 0;
  return `
    <div class="item">
      <div><b>${item.n}</b><div class="price">${R(item.p)}</div></div>
      <div class="qty">
        <button data-a="sub" data-n="${item.n}">−</button>
        <b>${q}</b>
        <button data-a="add" data-n="${item.n}">+</button>
      </div>
    </div>`;
}

// Contagem regressiva
function iniciarContagemRegressiva() {
  const el = document.getElementById('contagem');
  if (!el) return;

  clearInterval(intervalContagem);
  clearTimeout(timerAutoReset);

  let s = TEMPO_RESET;
  el.textContent = `⏳ Voltando ao início em ${s}s...`;

  intervalContagem = setInterval(() => {
    s--;
    if (s > 0) el.textContent = `⏳ Voltando ao início em ${s}s...`;
    else { el.textContent = `⏳ Voltando ao início...`; clearInterval(intervalContagem); }
  }, 1000);

  timerAutoReset = setTimeout(() => { clearInterval(intervalContagem); resetarTablet(); }, TEMPO_RESET * 1000);
}

// Reset do tablet
function resetarTablet() {
  clearTimeout(timerAutoReset);
  clearInterval(intervalContagem);
  S.etapa = 'identificacao';
  S.nome = '';
  S.mesa = '';
  S.cart = {};
  S.pedidoAtual = null;
  renderTablet();
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  renderTablet();

  // Botão "Acessar Cardápio"
  document.getElementById('btnAcessar').addEventListener('click', () => {
    const nome = document.getElementById('nome').value.trim();
    const mesa = +document.getElementById('mesa').value;

    if (!nome) {
      alert('Por favor, informe o seu nome.');
      return;
    }

    if (!mesa) {
      alert('Por favor, selecione a sua mesa.');
      return;
    }

    S.nome = nome;
    S.mesa = mesa;
    S.etapa = 'cardapio';
    renderTablet();
  });

  // Botões + e −
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-a]');
    if (!btn) return;
    const { a, n } = btn.dataset;
    if (a === 'add') { S.cart[n] = (S.cart[n] || 0) + 1; renderTablet(); }
    if (a === 'sub' && S.cart[n]) { S.cart[n]--; if (S.cart[n] === 0) delete S.cart[n]; renderTablet(); }
  });

  // Botão "Enviar para a Cozinha"
  document.getElementById('btnEnviar').addEventListener('click', async () => {
    const items = MENU.filter(i => S.cart[i.n]).map(i => ({ n: i.n, q: S.cart[i.n], p: i.p, k: i.k }));
    if (items.length === 0) return;

    const pedido = {
      mesa: S.mesa,
      nome: S.nome,
      items,
      st: items.some(i => i.k) ? 'novo' : 'pronto',
      t: Date.now(),
      paid: 0,
      formaPagamento: null,
    };

    try {
      const id = await criarPedido(pedido);
      S.pedidoAtual = { id, ...pedido };
      S.cart = {};
      S.etapa = 'aguardando';
      renderTablet();
    } catch (erro) {
      console.error('Erro ao criar pedido:', erro);
      alert('Erro ao enviar pedido. Verifique a conexão.');
    }
  });

  // Pagamento pelo tablet
  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-pag]');
    if (!btn) return;

    const forma = btn.dataset.pag;
    try {
      await atualizarPedido(S.pedidoAtual.id, {
        formaPagamento: forma, paid: 1, st: 'pago'
      });
      S.pedidoAtual.formaPagamento = forma;
      S.pedidoAtual.paid = 1;
      S.pedidoAtual.st = 'pago';
      S.etapa = 'pago';
      renderTablet();
    } catch (erro) {
      console.error('Erro ao processar pagamento:', erro);
    }
  });

  // Botão "Iniciar Novo Atendimento"
  document.getElementById('btnNovoCliente').addEventListener('click', resetarTablet);

  // Monitora entrega pelo garçom
  setInterval(async () => {
    if (S.etapa === 'aguardando' && S.pedidoAtual) {
      try {
        const pedidos = await getPedidos();
        const atualizado = pedidos.find(p => p.id === S.pedidoAtual.id);

        if (atualizado && atualizado.st === 'entregue') {
          S.pedidoAtual = atualizado;
          S.etapa = 'pagamento';
          renderTablet();
        }
      } catch (erro) {
        console.warn('⏳ Aguardando permissão do Firestore...');
      }
    }
  }, 2000);
});