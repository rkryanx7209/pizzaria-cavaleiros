// Paleta de cores para os gráficos
const CORES = {
  vermelho: '#c4302b',
  verde: '#2f7d4f',
  dourado: '#e0a21a',
  azul: '#1976d2',
  roxo: '#7b1fa2',
  laranja: '#ef6c00',
  rosa: '#d81b60',
  ciano: '#00acc1',
};

// Calcula todos os dados do dashboard
function calcularDados() {
  const pedidos = getPedidos();

  const pagos = pedidos.filter(p => p.st === 'pago');
  const entregues = pedidos.filter(p => p.st === 'entregue' || p.st === 'pago');

  // Totais gerais
  const faturamento = pagos.reduce((s, p) => s + tot(p), 0);
  const totalPedidos = pedidos.length;
  const totalPagos = pagos.length;

  // Contagem de itens
  const contPizzas = {};
  const contBebidas = {};

  pedidos.forEach(p => {
    p.items.forEach(i => {
      if (i.k === 1) {
        contPizzas[i.n] = (contPizzas[i.n] || 0) + i.q;
      } else {
        contBebidas[i.n] = (contBebidas[i.n] || 0) + i.q;
      }
    });
  });

  const totalPizzas = Object.values(contPizzas).reduce((a, b) => a + b, 0);
  const totalBebidas = Object.values(contBebidas).reduce((a, b) => a + b, 0);

  // Ticket médio
  const ticketMedio = totalPagos > 0 ? faturamento / totalPagos : 0;

  // Tempo médio (do pedido até entrega)
  const tempos = entregues
    .filter(p => p.st === 'pago')
    .map(p => 15); // simulado
  const tempoMedio = tempos.length > 0
    ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
    : 0;

  // Formas de pagamento
  const formasPag = { Pix: 0, Cartão: 0, Dinheiro: 0 };
  pagos.forEach(p => {
    if (p.formaPagamento) {
      formasPag[p.formaPagamento] = (formasPag[p.formaPagamento] || 0) + tot(p);
    }
  });

  // Faturamento por mesa
  const porMesa = {};
  pedidos.forEach(p => {
    porMesa[p.mesa] = (porMesa[p.mesa] || 0) + tot(p);
  });

  // Top 5 pizzas
  const topPizzas = Object.entries(contPizzas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Todas as bebidas
  const topBebidas = Object.entries(contBebidas)
    .sort((a, b) => b[1] - a[1]);

  return {
    faturamento,
    totalPedidos,
    totalPizzas,
    totalBebidas,
    ticketMedio,
    tempoMedio,
    formasPag,
    porMesa,
    topPizzas,
    topBebidas,
    contPizzas,
    contBebidas,
  };
}

// Atualiza os cards de resumo
function atualizarCards(dados) {
  document.getElementById('totalFaturamento').textContent = R(dados.faturamento);
  document.getElementById('totalPedidos').textContent = dados.totalPedidos;
  document.getElementById('totalPizzas').textContent = dados.totalPizzas;
  document.getElementById('totalBebidas').textContent = dados.totalBebidas;
  document.getElementById('ticketMedio').textContent = R(dados.ticketMedio);
  document.getElementById('tempoMedio').textContent = `${dados.tempoMedio} min`;
}

// Cria gráfico de barras das pizzas
let chartPizzas = null;
function criarGraficoPizzas(dados) {
  const ctx = document.getElementById('graficoPizzas').getContext('2d');

  if (chartPizzas) chartPizzas.destroy();

  chartPizzas = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.topPizzas.map(p => p[0]),
      datasets: [{
        label: 'Quantidade vendida',
        data: dados.topPizzas.map(p => p[1]),
        backgroundColor: [
          CORES.vermelho,
          CORES.laranja,
          CORES.dourado,
          CORES.verde,
          CORES.azul,
        ],
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#66746b' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        x: {
          ticks: { color: '#66746b' },
          grid: { display: false },
        },
      },
    },
  });
}

// Cria gráfico de pizza (formas de pagamento)
let chartPagamento = null;
function criarGraficoPagamento(dados) {
  const ctx = document.getElementById('graficoPagamento').getContext('2d');

  if (chartPagamento) chartPagamento.destroy();

  const labels = Object.keys(dados.formasPag).filter(k => dados.formasPag[k] > 0);
  const valores = labels.map(k => dados.formasPag[k]);

  chartPagamento = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: [
          CORES.verde,
          CORES.azul,
          CORES.dourado,
        ],
        borderWidth: 3,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#1f2a24',
            font: { size: 13, weight: '600' },
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const valor = ctx.parsed;
              const pct = ((valor / total) * 100).toFixed(1);
              return `${ctx.label}: ${R(valor)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

// Cria gráfico de barras por mesa
let chartMesas = null;
function criarGraficoMesas(dados) {
  const ctx = document.getElementById('graficoMesas').getContext('2d');

  if (chartMesas) chartMesas.destroy();

  const mesas = Object.keys(dados.porMesa).sort((a, b) => a - b);
  const valores = mesas.map(m => dados.porMesa[m]);

  chartMesas = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: mesas.map(m => `Mesa ${String(m).padStart(2, '0')}`),
      datasets: [{
        label: 'Faturamento',
        data: valores,
        backgroundColor: CORES.verde,
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Faturamento: ${R(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#66746b',
            callback: (v) => 'R$ ' + v,
          },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        x: {
          ticks: { color: '#66746b' },
          grid: { display: false },
        },
      },
    },
  });
}

// Cria gráfico de barras horizontais (bebidas)
let chartBebidas = null;
function criarGraficoBebidas(dados) {
  const ctx = document.getElementById('graficoBebidas').getContext('2d');

  if (chartBebidas) chartBebidas.destroy();

  chartBebidas = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.topBebidas.map(b => b[0]),
      datasets: [{
        label: 'Quantidade vendida',
        data: dados.topBebidas.map(b => b[1]),
        backgroundColor: CORES.azul,
        borderRadius: 8,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: '#66746b' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          ticks: { color: '#66746b' },
          grid: { display: false },
        },
      },
    },
  });
}

// Monta o resumo detalhado
function montarResumo(dados) {
  const container = document.getElementById('resumoDetalhado');

  const linhas = [
    { nome: '💰 Faturamento total', valor: R(dados.faturamento) },
    { nome: '📦 Total de pedidos', valor: dados.totalPedidos },
    { nome: '🍕 Total de pizzas', valor: dados.totalPizzas },
    { nome: '🥤 Total de bebidas', valor: dados.totalBebidas },
    { nome: '📈 Ticket médio', valor: R(dados.ticketMedio) },
    { nome: '⏱️ Tempo médio de espera', valor: `${dados.tempoMedio} min` },
    { nome: '✅ Pedidos pagos', valor: Object.keys(dados.porMesa).length + ' mesas' },
  ];

  // Adiciona as formas de pagamento
  Object.entries(dados.formasPag).forEach(([forma, valor]) => {
    if (valor > 0) {
      linhas.push({ nome: `💳 ${forma}`, valor: R(valor) });
    }
  });

  // Adiciona as pizzas mais vendidas
  if (dados.topPizzas.length > 0) {
    linhas.push({ nome: '— TOP 5 PIZZAS —', valor: '' });
    dados.topPizzas.forEach(([nome, qtd]) => {
      linhas.push({ nome: `🍕 ${nome}`, valor: `${qtd} un.` });
    });
  }

  // Adiciona as bebidas mais vendidas
  if (dados.topBebidas.length > 0) {
    linhas.push({ nome: '— BEBIDAS —', valor: '' });
    dados.topBebidas.forEach(([nome, qtd]) => {
      linhas.push({ nome: `🥤 ${nome}`, valor: `${qtd} un.` });
    });
  }

  container.innerHTML = linhas.map(l => `
    <div class="resumo-linha">
      <span class="nome">${l.nome}</span>
      <span class="valor">${l.valor}</span>
    </div>
  `).join('');
}

// Atualiza tudo
function renderDashboard() {
  const dados = calcularDados();

  atualizarCards(dados);
  criarGraficoPizzas(dados);
  criarGraficoPagamento(dados);
  criarGraficoMesas(dados);
  criarGraficoBebidas(dados);
  montarResumo(dados);
}

// Inicialização + atualização automática
renderDashboard();
setInterval(renderDashboard, 5000);