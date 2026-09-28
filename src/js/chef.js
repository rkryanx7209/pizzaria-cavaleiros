// Renderiza a fila de pedidos do chef
function renderChef() {
  const pedidos = getPedidos();
  const fila = pedidos
    .filter(p => p.st === 'novo')
    .sort((a, b) => a.t - b.t);

  const tickets = document.getElementById('tickets');

  // Nenhum pedido na fila
  if (fila.length === 0) {
    tickets.innerHTML = `
      <div class="empty-state">
        Nenhum pedido na fila. Aguardando clientes...
      </div>`;
    return;
  }

  // Renderiza cada pedido como um ticket
  tickets.innerHTML = fila.map((o, i) => {
    const minutos = min(o.t);
    const u = urg(minutos);

    // Só mostra as pizzas (bebidas já saem prontas)
    const itensPizza = o.items
      .filter(i => i.k)
      .map(i => `${i.q}× ${i.n}`)
      .join('<br>');

    return `
      <article class="ticket c-${u}">
        <div class="num">#${i + 1}</div>
        <div class="mut" style="margin-bottom:8px;">
          Pedido #${o.id} · ${o.nome}
        </div>

        <div class="row" style="margin:8px 0;">
          <span class="mesa">Mesa ${mm(o.mesa)}</span>
          <span class="tag t-${u}">${minutos} min</span>
        </div>

        <p class="mut" style="margin:0 0 6px;">
          Entrou às ${hora(o.t)}
        </p>

        <p><b>${itensPizza || '(sem pizza)'}</b></p>

        <button class="btn" style="margin-top:10px;" data-id="${o.id}">
          Marcar como Pronta
        </button>
      </article>
    `;
  }).join('');
}

// Ação: marcar pedido como PRONTO
document.getElementById('tickets').addEventListener('click', e => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;

  const id = +btn.dataset.id;
  const pedidos = getPedidos();
  const pedido = pedidos.find(p => p.id === id);

  if (pedido) {
    pedido.st = 'pronto';
    setPedidos(pedidos);
    renderChef();
  }
});

// Inicialização e atualização automática a cada 5 segundos
renderChef();
setInterval(renderChef, 5000);