// Importa
import './auth.js';
import { getPedidos, R, tot } from './dados.js';
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const CORES = {
  vermelho: '#c4302b', verde: '#2f7d4f', dourado: '#e0a21a',
  azul: '#1976d2', laranja: '#ef6c00',
};

let chartPizzas = null, chartPagamento = null, chartMesas = null,
    chartBebidas = null, chartHoras = null;

let periodoAtual = 'hoje';

// ==========================================
// BOTÃO SÓ PARA GERENTE
// ==========================================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const docSnap = await getDoc(doc(db, 'usuarios', user.uid));
  const btn = document.getElementById('btnCadastrarFuncionario');
  if (docSnap.exists() && docSnap.data().perfil === 'gerente') {
    if (btn) btn.style.display = 'flex';
  }
});

// ==========================================
// FILTRO DE PERÍODO
// ==========================================
document.querySelectorAll('.btn-filtro').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    periodoAtual = btn.dataset.periodo;
    renderDashboard();
  });
});

function filtrarPorPeriodo(pedidos) {
  const agora = Date.now();
  const umDia = 24 * 60 * 60 * 1000;

  if (periodoAtual === 'hoje') {
    return pedidos.filter(p => agora - p.t < umDia);
  }
  if (periodoAtual === 'semana') {
    return pedidos.filter(p => agora - p.t < 7 * umDia);
  }
  if (periodoAtual === 'mes') {
    return pedidos.filter(p => agora - p.t < 30 * umDia);
  }
  return pedidos;
}

// ==========================================
// CALCULA DADOS
// ==========================================
async function calcularDados() {
  const todosPedidos = await getPedidos();
  const pedidos = filtrarPorPeriodo(todosPedidos);

  const pagos = pedidos.filter(p => p.st === 'pago');
  const faturamento = pagos.reduce((s, p) => s + tot(p), 0);
  const totalPagos = pagos.length;

  const contPizzas = {}, contBebidas = {};
  pedidos.forEach(p => p.items.forEach(i => {
    if (i.k === 1) contPizzas[i.n] = (contPizzas[i.n] || 0) + i.q;
    else contBebidas[i.n] = (contBebidas[i.n] || 0) + i.q;
  }));

  const totalPizzas = Object.values(contPizzas).reduce((a, b) => a + b, 0);
  const totalBebidas = Object.values(contBebidas).reduce((a, b) => a + b, 0);
  const ticketMedio = totalPagos > 0 ? faturamento / totalPagos : 0;

  const formasPag = { Pix: 0, 'Cartão': 0, Dinheiro: 0 };
  pagos.forEach(p => { if (p.formaPagamento) formasPag[p.formaPagamento] += tot(p); });

  const porMesa = {};
  pedidos.forEach(p => porMesa[p.mesa] = (porMesa[p.mesa] || 0) + tot(p));

  // Faturamento por hora
  const porHora = Array(24).fill(0);
  pagos.forEach(p => {
    const h = new Date(p.t).getHours();
    porHora[h] += tot(p);
  });

  const topPizzas = Object.entries(contPizzas).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topBebidas = Object.entries(contBebidas).sort((a, b) => b[1] - a[1]);

  return { faturamento, totalPedidos: pedidos.length, totalPizzas, totalBebidas,
           ticketMedio, tempoMedio: 15, formasPag, porMesa, porHora, topPizzas, topBebidas };
}

// ==========================================
// ATUALIZA CARDS
// ==========================================
function atualizarCards(d) {
  document.getElementById('totalFaturamento').textContent = R(d.faturamento);
  document.getElementById('totalPedidos').textContent = d.totalPedidos;
  document.getElementById('totalPizzas').textContent = d.totalPizzas;
  document.getElementById('totalBebidas').textContent = d.totalBebidas;
  document.getElementById('ticketMedio').textContent = R(d.ticketMedio);
  document.getElementById('tempoMedio').textContent = `${d.tempoMedio} min`;
}

// ==========================================
// GRÁFICOS
// ==========================================
function criarGraficos(d) {

  // Top 5 Pizzas
  if (chartPizzas) chartPizzas.destroy();
  const dadosPizzas = d.topPizzas.length > 0 ? d.topPizzas : [['Sem dados', 0]];
  chartPizzas = new Chart(document.getElementById('graficoPizzas'), {
    type: 'bar',
    data: {
      labels: dadosPizzas.map(p => p[0]),
      datasets: [{
        data: dadosPizzas.map(p => p[1]),
        backgroundColor: [CORES.vermelho, CORES.laranja, CORES.dourado, CORES.verde, CORES.azul],
        borderRadius: 10, borderSkipped: false,
      }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
  });

  // Formas de Pagamento
  const labelsPag = Object.keys(d.formasPag).filter(k => d.formasPag[k] > 0);
  const dadosPag = labelsPag.length > 0 ? labelsPag : ['Sem dados'];
  const valoresPag = labelsPag.length > 0 ? labelsPag.map(k => d.formasPag[k]) : [1];

  if (chartPagamento) chartPagamento.destroy();
  chartPagamento = new Chart(document.getElementById('graficoPagamento'), {
    type: 'doughnut',
    data: {
      labels: dadosPag,
      datasets: [{ data: valoresPag,
        backgroundColor: [CORES.verde, CORES.azul, CORES.dourado],
        borderWidth: 4, borderColor: '#fff' }],
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: { legend: { position: 'bottom' } } },
  });

  // Faturamento por Hora
  if (chartHoras) chartHoras.destroy();
  chartHoras = new Chart(document.getElementById('graficoHoras'), {
    type: 'line',
    data: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
      datasets: [{
        label: 'Faturamento por hora',
        data: d.porHora,
        borderColor: CORES.vermelho,
        backgroundColor: 'rgba(196, 48, 43, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CORES.vermelho,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => R(ctx.parsed.y) } } },
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => 'R$ ' + v } } } },
  });

  // Faturamento por Mesa
  const mesas = Object.keys(d.porMesa).sort((a, b) => a - b);
  const dadosMesas = mesas.length > 0 ? mesas : ['Sem dados'];
  const valoresMesas = mesas.length > 0 ? mesas.map(m => d.porMesa[m]) : [0];

  if (chartMesas) chartMesas.destroy();
  chartMesas = new Chart(document.getElementById('graficoMesas'), {
    type: 'bar',
    data: {
      labels: dadosMesas.map(m => typeof m === 'number' ? `Mesa ${String(m).padStart(2, '0')}` : m),
      datasets: [{ data: valoresMesas, backgroundColor: CORES.verde, borderRadius: 10 }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => R(ctx.parsed.y) } } },
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => 'R$ ' + v } } } },
  });

  // Bebidas
  const dadosBebidas = d.topBebidas.length > 0 ? d.topBebidas : [['Sem dados', 0]];
  if (chartBebidas) chartBebidas.destroy();
  chartBebidas = new Chart(document.getElementById('graficoBebidas'), {
    type: 'bar',
    data: {
      labels: dadosBebidas.map(b => b[0]),
      datasets: [{ data: dadosBebidas.map(b => b[1]), backgroundColor: CORES.azul, borderRadius: 10 }],
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } },
  });
}

// ==========================================
// RESUMO DETALHADO
// ==========================================
function montarResumo(d) {
  const c = document.getElementById('resumoDetalhado');
  const linhas = [
    { nome: '💰 Faturamento total', valor: R(d.faturamento) },
    { nome: '📦 Total de pedidos', valor: d.totalPedidos },
    { nome: '🍕 Total de pizzas', valor: d.totalPizzas },
    { nome: '🥤 Total de bebidas', valor: d.totalBebidas },
    { nome: '📈 Ticket médio', valor: R(d.ticketMedio) },
    { nome: '⏱️ Tempo médio', valor: `${d.tempoMedio} min` },
  ];

  Object.entries(d.formasPag).forEach(([f, v]) => {
    if (v > 0) linhas.push({ nome: `💳 ${f}`, valor: R(v) });
  });

  if (d.topPizzas.length > 0) {
    linhas.push({ nome: '— TOP 5 PIZZAS —', valor: '' });
    d.topPizzas.forEach(([n, q]) => linhas.push({ nome: `🍕 ${n}`, valor: `${q} un.` }));
  }

  if (d.topBebidas.length > 0) {
    linhas.push({ nome: '— BEBIDAS —', valor: '' });
    d.topBebidas.forEach(([n, q]) => linhas.push({ nome: `🥤 ${n}`, valor: `${q} un.` }));
  }

  c.innerHTML = linhas.map(l => `
    <div class="resumo-linha">
      <span class="nome">${l.nome}</span>
      <span class="valor">${l.valor}</span>
    </div>
  `).join('');
}

// ==========================================
// RENDER
// ==========================================
async function renderDashboard() {
  const d = await calcularDados();
  atualizarCards(d);
  criarGraficos(d);
  montarResumo(d);
}

renderDashboard();
setInterval(renderDashboard, 5000);