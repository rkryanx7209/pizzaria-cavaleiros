// Importa Route Guard e dados
import './auth.js';
import { getPedidos, atualizarPedido, registrarLog, mm, min, urg } from './dados.js';

const SOM_NOTIFICACAO = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
let totalProntosAnterior = -1;

async function renderGarcom() {
  const pedidos = await getPedidos();
  const prontos = pedidos.filter(p => p.st === 'pronto').sort((a, b) => a.t - b.t);
  const lista = document.getElementById('lista');

  // Toca som se chegar pedido pronto novo
  if (totalProntosAnterior >= 0 && prontos.length > totalProntosAnterior) {
    try {
      new Audio(SOM_NOTIFICACAO).play();
    } catch (e) {}
  }
  totalProntosAnterior = prontos.length;

  if (prontos.length === 0) {
    lista.innerHTML = '<div class="empty-state">Nenhuma pizza aguardando entrega.</div>';
    return;
  }

  lista.innerHTML = prontos.map(o => {
    const minutos = min(o.t);
    const u = urg(minutos);
    const itens = o.items.map(i => `${i.q}× ${i.n}`).join(', ');

    return `
      <div class="card-entrega">
        <div class="row">
          <span class="mesa">Mesa ${mm(o.mesa)}</span>
          <span class="tag t-${u}">${minutos} min</span>
        </div>
        <p class="mut" style="margin:6px 0;">Cliente: ${o.nome}</p>
        <p>${itens}</p>
        <button class="btn" data-id="${o.id}">Okay, Entregue na Mesa</button>
      </div>
    `;
  }).join('');
}

document.getElementById('lista').addEventListener('click', async e => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  await atualizarPedido(btn.dataset.id, { st: 'entregue' });
  await registrarLog('Entregou pedido', btn.dataset.id);
  renderGarcom();
});

renderGarcom();
setInterval(renderGarcom, 5000);