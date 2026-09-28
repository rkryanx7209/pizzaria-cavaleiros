// Estado local do tablet do cliente
const S = {
  etapa: 'identificacao',
  nome: '',
  mesa: 7,
  cart: {},
  pedidoAtual: null,
};

// Timers do auto-reset e da contagem regressiva
let timerAutoReset = null;
let intervalContagem = null;

// Tempo em segundos para o tablet voltar sozinho após pagamento
const TEMPO_RESET = 4;

// Renderiza a etapa atual do tablet
function renderTablet() {
  const etapas = {
    identificacao: 'etapaIdentificacao',
    cardapio:      'etapaCardapio',
    aguardando:    'etapaAguardando',
    pagamento:     'etapaPagamento',
    pago:          'etapaPago',
  };

  // Esconde todas as etapas
  Object.values(etapas).forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });

  // Mostra a etapa atual
  document.getElementById(etapas[S.etapa]).classList.remove('hidden');

  // ETAPA: IDENTIFICAÇÃO
  if (S.etapa === 'identificacao') {
    const sel = document.getElementById('mesa');

    // Popula o select de mesas na primeira vez
    if (sel.options.length === 0) {
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

    const lista = document.getElementById('listaItens');
    lista.innerHTML = renderizarCardapio();

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

// Renderiza o cardápio com seções separadas
function renderizarCardapio() {
  const tradicionais = MENU.filter(i => i.cat === 'tradicional');
  const especiais    = MENU.filter(i => i.cat === 'especial');
  const bebidas      = MENU.filter(i => i.cat === 'bebida');

  return `
    <h3 class="secao-cardapio">🍕 Pizzas Tradicionais</h3>
    ${tradicionais.map(renderizarItem).join('')}

    <h3 class="secao-cardapio">⭐ Pizzas Especiais</h3>
    ${especiais.map(renderizarItem).join('')}

    <h3 class="secao-cardapio">🥤 Bebidas</h3>
    ${bebidas.map(renderizarItem).join('')}
  `;
}

// Renderiza um item do cardápio
function renderizarItem(item) {
  const q = S.cart[item.n] || 0;
  return `
    <div class="item">
      <div>
        <b>${item.n}</b>
        <div class="price">${R(item.p)}</div>
      </div>
      <div class="qty">
        <button data-a="sub" data-n="${item.n}">−</button>
        <b>${q}</b>
        <button data-a="add" data-n="${item.n}">+</button>
      </div>
    </div>`;
}

// Contagem regressiva visual e reset automático
function iniciarContagemRegressiva() {
  const contagemEl = document.getElementById('contagem');
  if (!contagemEl) return;

  // Limpa timers anteriores
  clearInterval(intervalContagem);
  clearTimeout(timerAutoReset);

  let segundos = TEMPO_RESET;
  contagemEl.textContent = `⏳ Voltando ao início em ${segundos}s...`;

  // Atualiza o texto a cada 1 segundo
  intervalContagem = setInterval(() => {
    segundos--;
    if (segundos > 0) {
      contagemEl.textContent = `⏳ Voltando ao início em ${segundos}s...`;
    } else {
      contagemEl.textContent = `⏳ Voltando ao início...`;
      clearInterval(intervalContagem);
    }
  }, 1000);

  // Executa o reset após o tempo definido
  timerAutoReset = setTimeout(() => {
    clearInterval(intervalContagem);
    resetarTablet();
  }, TEMPO_RESET * 1000);
}

// Botão "Acessar Cardápio"
document.getElementById('btnAcessar').addEventListener('click', () => {
  const nome = document.getElementById('nome').value.trim();
  const mesa = +document.getElementById('mesa').value;

  if (!nome) {
    alert('Por favor, informe o seu nome.');
    return;
  }

  S.nome = nome;
  S.mesa = mesa;
  S.etapa = 'cardapio';
  renderTablet();
});

// Botões de + e − (adicionar / remover itens)
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-a]');
  if (!btn) return;

  const acao = btn.dataset.a;
  const nome = btn.dataset.n;

  if (acao === 'add') {
    S.cart[nome] = (S.cart[nome] || 0) + 1;
    renderTablet();
  }

  if (acao === 'sub' && S.cart[nome]) {
    S.cart[nome]--;
    if (S.cart[nome] === 0) delete S.cart[nome];
    renderTablet();
  }
});

// Botão "Enviar para a Cozinha"
document.getElementById('btnEnviar').addEventListener('click', () => {
  const items = MENU
    .filter(i => S.cart[i.n])
    .map(i => ({ n: i.n, q: S.cart[i.n], p: i.p, k: i.k }));

  if (items.length === 0) return;

  const pedido = {
    id: proximoId(),
    mesa: S.mesa,
    nome: S.nome,
    items,
    st: items.some(i => i.k) ? 'novo' : 'pronto',
    t: Date.now(),
    paid: 0,
    formaPagamento: null,
  };

  const pedidos = getPedidos();
  pedidos.push(pedido);
  setPedidos(pedidos);

  S.pedidoAtual = pedido;
  S.cart = {};
  S.etapa = 'aguardando';
  renderTablet();
});

// Monitora se o pedido foi entregue pelo garçom
setInterval(() => {
  if (S.etapa === 'aguardando' && S.pedidoAtual) {
    const pedidos = getPedidos();
    const atualizado = pedidos.find(p => p.id === S.pedidoAtual.id);

    if (atualizado && atualizado.st === 'entregue') {
      S.pedidoAtual = atualizado;
      S.etapa = 'pagamento';
      renderTablet();
    }
  }
}, 2000);

// Pagamento pelo tablet
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-pag]');
  if (!btn) return;

  const forma = btn.dataset.pag;
  const pedidos = getPedidos();
  const pedido = pedidos.find(p => p.id === S.pedidoAtual.id);

  pedido.formaPagamento = forma;
  pedido.paid = 1;
  pedido.st = 'pago';

  setPedidos(pedidos);
  S.pedidoAtual = pedido;
  S.etapa = 'pago';
  renderTablet();
});

// Reseta o tablet para a tela inicial
function resetarTablet() {
  clearTimeout(timerAutoReset);
  clearInterval(intervalContagem);

  S.etapa = 'identificacao';
  S.nome = '';
  S.mesa = 7;
  S.cart = {};
  S.pedidoAtual = null;
  renderTablet();
}

// Botão "Iniciar Novo Atendimento"
document.getElementById('btnNovoCliente').addEventListener('click', () => {
  resetarTablet();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderTablet();
});