// Importa Route Guard e dados
import './auth.js';
import { getPedidos, atualizarPedido, registrarLog, mm, hora, min, urg } from './dados.js';

// ==========================================
// SOM DE NOTIFICAÇÃO
// ==========================================
const SOM_NOTIFICACAO = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
let totalPedidosAnterior = -1;

// ==========================================
// RENDERIZA A FILA
// ==========================================
async function renderChef() {
  const pedidos = await getPedidos();
  const fila = pedidos.filter(p => p.st === 'novo').sort((a, b) => a.t - b.t);
  const tickets = document.getElementById('tickets');

  // Toca som se chegou pedido novo
  if (totalPedidosAnterior >= 0 && fila.length > totalPedidosAnterior) {
    try { new Audio(SOM_NOTIFICACAO).play(); } catch (e) {}
  }
  totalPedidosAnterior = fila.length;

  if (fila.length === 0) {
    tickets.innerHTML = '<div class="empty-state">Nenhum pedido na fila.</div>';
    return;
  }

  tickets.innerHTML = fila.map((o, i) => {
    const minutos = min(o.t);
    const u = urg(minutos);
    const itensPizza = o.items.filter(i => i.k).map(i => `${i.q}× ${i.n}`).join('<br>');

    return `
      <article class="ticket c-${u}">
        <div class="num">#${i + 1}</div>
        <div class="mut" style="margin-bottom:8px;">Pedido #${String(o.id).slice(-4)} · ${o.nome}</div>
        <div class="row" style="margin:8px 0;">
          <span class="mesa">Mesa ${mm(o.mesa)}</span>
          <span class="tag t-${u}">${minutos} min</span>
        </div>
        <p class="mut" style="margin:0 0 6px;">Entrou às ${hora(o.t)}</p>
        <p><b>${itensPizza || '(sem pizza)'}</b></p>
        <button class="btn" style="margin-top:10px;" data-acao="pronto" data-id="${o.id}">
          ✅ Marcar como Pronta
        </button>
        <button class="btn" style="margin-top:6px; background:#555;" data-acao="imprimir" data-id="${o.id}">
          🖨️ Imprimir
        </button>
      </article>
    `;
  }).join('');
}

// ==========================================
// AÇÃO: marcar como pronto OU imprimir
// ==========================================
document.getElementById('tickets').addEventListener('click', async e => {
  const btn = e.target.closest('button[data-acao]');
  if (!btn) return;

  const acao = btn.dataset.acao;
  const id = btn.dataset.id;

  if (acao === 'pronto') {
    await atualizarPedido(id, { st: 'pronto' });
    await registrarLog('Marcou pedido como pronto', id);
    renderChef();
  }

  if (acao === 'imprimir') {
    const pedidos = await getPedidos();
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) imprimirComanda(pedido);
  }
});

// ==========================================
// IMPRIMIR COMANDA (via iframe invisível)
// ==========================================
function imprimirComanda(pedido) {
  const total = pedido.items.reduce((s, i) => s + i.q * i.p, 0);
  const dataHora = new Date(pedido.t).toLocaleString('pt-BR');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Comanda #${String(pedido.id).slice(-4)}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          padding: 20px;
          max-width: 300px;
          margin: 0 auto;
          color: #000;
        }
        h1 {
          text-align: center;
          font-size: 20px;
          margin: 0 0 4px;
          letter-spacing: 2px;
        }
        .sub {
          text-align: center;
          font-size: 11px;
          margin-bottom: 12px;
        }
        hr {
          border: none;
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        .linha {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 2px 0;
        }
        .info { font-size: 12px; margin: 3px 0; }
        .destaque {
          font-weight: bold;
          font-size: 15px;
          text-align: center;
          padding: 8px 0;
          background: #000;
          color: #fff;
          margin: 8px 0;
        }
        .total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 16px;
          padding: 8px 0;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          margin: 8px 0;
        }
        .rodape {
          text-align: center;
          font-size: 10px;
          margin-top: 12px;
          font-style: italic;
        }
        @media print {
          body { padding: 0; }
          @page { margin: 10mm; }
        }
      </style>
    </head>
    <body>
      <h1>🍕 BELLA MASSA</h1>
      <div class="sub">COMANDA DA COZINHA</div>
      <hr>
      <div class="destaque">PEDIDO #${String(pedido.id).slice(-4)}</div>
      <div class="info"><b>Mesa:</b> ${mm(pedido.mesa)}</div>
      <div class="info"><b>Cliente:</b> ${pedido.nome}</div>
      <div class="info"><b>Hora:</b> ${dataHora}</div>
      <hr>
      ${pedido.items.map(i => `
        <div class="linha">
          <span>${i.q}× ${i.n}</span>
          <span>${i.q * i.p > 0 ? 'R$ ' + (i.q * i.p).toFixed(2) : ''}</span>
        </div>
      `).join('')}
      <hr>
      <div class="total">
        <span>TOTAL</span>
        <span>R$ ${total.toFixed(2).replace('.', ',')}</span>
      </div>
      <div class="rodape">
        ✨ Bom trabalho! ✨<br>
        ${dataHora}
      </div>
    </body>
    </html>
  `;

  // Cria iframe invisível
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  // Escreve o HTML no iframe
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  // Espera carregar e imprime
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  };
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
renderChef();
setInterval(renderChef, 5000);