// Renderiza a lista de pedidos prontos para entrega
function renderGarcom() {
  const pedidos = getPedidos();
  const prontos = pedidos
    .filter(p => p.st === 'pronto')
    .sort((a, b) => a.t - b.t);

  const lista = document.getElementById('lista');

  // Nada pronto no momento
  if (prontos.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        Nenhuma pizza aguardando entrega no momento.
      </div>`;
    return;
  }

  // Renderiza cada pedido pronto
  lista.innerHTML = prontos.map(o => {
    const minutos = min(o.t);
    const u = urg(minutos);

    // Lista todos os itens (pizzas + bebidas)
    const itens = o.items
      .map(i => `${i.q}× ${i.n}`)
      .join(', ');

    return `
      <div class="card-entrega">
        <div class="row">
          <span class="mesa">Mesa ${mm(o.mesa)}</span>
          <span class="tag t-${u}">${minutos} min</span>
        </div>

        <p class="mut" style="margin:6px 0;">
          Cliente: ${o.nome}
        </p>

        <p>${itens}</p>

        <button class="btn" data-id="${o.id}">
          Okay, Entregue na Mesa
        </button>
      </div>
    `;
  }).join('');
}

// Ação: marcar pedido como ENTREGUE
document.getElementById('lista').addEventListener('click', e => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;

  const id = +btn.dataset.id;
  const pedidos = getPedidos();
  const pedido = pedidos.find(p => p.id === id);

  if (pedido) {
    pedido.st = 'entregue';
    setPedidos(pedidos);
    renderGarcom();
  }
});

// Inicialização e atualização automática a cada 5 segundos
renderGarcom();
setInterval(renderGarcom, 5000);