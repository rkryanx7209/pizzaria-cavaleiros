// Importa Route Guard e dados
import './auth.js';
import { getPedidos, mm, R, tot } from './dados.js';

// Renderiza as contas
async function renderCaixa() {
  const pedidos = await getPedidos();
  const mesas = [...new Set(pedidos.map(p => p.mesa))].sort((a, b) => a - b);
  const grid = document.getElementById('grid');

  if (mesas.length === 0) {
    grid.innerHTML = '<div class="empty-state">Nenhuma mesa com conta.</div>';
    return;
  }

  grid.innerHTML = mesas.map(mesa => {
    const os = pedidos.filter(p => p.mesa === mesa);
    const entregues = os.filter(p => p.st === 'entregue');
    const pagos = os.filter(p => p.st === 'pago');
    const emAndamento = os.filter(p => p.st === 'novo' || p.st === 'pronto');

    const totalPago = pagos.reduce((s, p) => s + tot(p), 0);
    const totalPendente = entregues.reduce((s, p) => s + tot(p), 0);
    const totalGeral = totalPago + totalPendente;
    const tudoPago = os.length > 0 && pagos.length === os.length;
    const nomes = [...new Set(os.map(p => p.nome))].join(', ');
    const formaPag = pagos.length > 0 ? pagos[0].formaPagamento : '';

    return `
      <div class="card-mesa ${tudoPago ? 'pago' : ''}">
        <div class="row">
          <span class="mesa">Mesa ${mm(mesa)}</span>
          <span class="tot">${R(totalGeral)}</span>
        </div>
        <p class="mut" style="margin:6px 0 0;">${nomes}</p>
        ${pagos.length > 0 ? `<div class="status-info status-pago">✅ Pago: ${R(totalPago)} ${formaPag ? `(${formaPag})` : ''}</div>` : ''}
        ${entregues.length > 0 ? `<div class="status-info status-pendente">⏳ Aguardando pagamento: ${R(totalPendente)}</div>` : ''}
        ${emAndamento.length > 0 ? `<div class="status-info status-andamento">🍕 Pedidos em andamento</div>` : ''}
      </div>
    `;
  }).join('');
}

// Inicialização
renderCaixa();
setInterval(renderCaixa, 3000);