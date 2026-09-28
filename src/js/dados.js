// Cardápio completo da Bella Massa
const MENU = [
  // Pizzas Tradicionais
  { n: 'Margherita',             p: 42, k: 1, cat: 'tradicional' },
  { n: 'Calabresa',              p: 46, k: 1, cat: 'tradicional' },
  { n: 'Calabresa com Cebola',   p: 48, k: 1, cat: 'tradicional' },
  { n: 'Quatro Queijos',         p: 52, k: 1, cat: 'tradicional' },
  { n: 'Napolitana',             p: 48, k: 1, cat: 'tradicional' },
  { n: 'Portuguesa',             p: 50, k: 1, cat: 'tradicional' },
  { n: 'Frango com Catupiry',    p: 54, k: 1, cat: 'tradicional' },
  { n: 'Mussarela',              p: 44, k: 1, cat: 'tradicional' },
  { n: 'Presunto',               p: 45, k: 1, cat: 'tradicional' },
  { n: 'Pepperoni',              p: 56, k: 1, cat: 'tradicional' },
  { n: 'Bacon',                  p: 55, k: 1, cat: 'tradicional' },
  { n: 'Vegetariana',            p: 50, k: 1, cat: 'tradicional' },

  // Pizzas Especiais
  { n: 'Meia Lua',               p: 58, k: 1, cat: 'especial' },
  { n: 'Cinco Queijos',          p: 60, k: 1, cat: 'especial' },
  { n: 'Camarão',                p: 68, k: 1, cat: 'especial' },
  { n: 'Salmão',                 p: 72, k: 1, cat: 'especial' },
  { n: 'Rúcula com Tomate Seco', p: 58, k: 1, cat: 'especial' },
  { n: 'Brie com Damasco',       p: 66, k: 1, cat: 'especial' },

  // Bebidas
  { n: 'Refrigerante 2L',        p: 14, k: 0, cat: 'bebida' },
  { n: 'Refrigerante Lata',      p:  7, k: 0, cat: 'bebida' },
  { n: 'Suco de Laranja',        p: 12, k: 0, cat: 'bebida' },
  { n: 'Suco de Maracujá',       p: 12, k: 0, cat: 'bebida' },
  { n: 'Água Mineral',           p:  5, k: 0, cat: 'bebida' },
  { n: 'Água com Gás',           p:  6, k: 0, cat: 'bebida' },
  { n: 'Cerveja Long Neck',      p: 14, k: 0, cat: 'bebida' },
  { n: 'Vinho Taça',             p: 18, k: 0, cat: 'bebida' },
];

// Pega todos os pedidos salvos no navegador
function getPedidos() {
  return JSON.parse(localStorage.getItem('bella_pedidos') || '[]');
}

// Salva os pedidos no navegador e avisa as outras abas
function setPedidos(pedidos) {
  localStorage.setItem('bella_pedidos', JSON.stringify(pedidos));
  window.dispatchEvent(new Event('storage'));
}

// Gera o próximo ID de pedido automaticamente
function proximoId() {
  const pedidos = getPedidos();
  return pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1;
}

// Formata valor em Real brasileiro
const R = v => 'R$ ' + v.toFixed(2).replace('.', ',');

// Preenche número com zero à esquerda (7 → "07")
const mm = n => String(n).padStart(2, '0');

// Formata timestamp em hora (14:32)
const hora = t => new Date(t).toLocaleTimeString('pt-BR', {
  hour: '2-digit',
  minute: '2-digit'
});

// Calcula quantos minutos se passaram desde o timestamp
const min = t => Math.floor((Date.now() - t) / 60000);

// Classifica urgência: até 30min = ok, até 50min = mid, acima = late
const urg = x => x <= 30 ? 'ok' : x <= 50 ? 'mid' : 'late';

// Calcula o total de um pedido (soma de quantidade × preço)
const tot = o => o.items.reduce((s, i) => s + i.q * i.p, 0);

// Gera o HTML do recibo do pedido
function gerarReciboHTML(pedido, pago = false) {
  const linhas = pedido.items.map(i =>
    `<div class="recibo-linha">
       <span>${i.q}× ${i.n}</span>
       <span>${R(i.q * i.p)}</span>
     </div>`
  ).join('');

  return `
    <div style="font-weight:700; margin-bottom:10px; color: var(--mut);">
      PEDIDO #${String(pedido.id).padStart(4, '0')} — MESA ${mm(pedido.mesa)}
    </div>
    ${linhas}
    <div class="recibo-total">
      <span>TOTAL</span>
      <span>${R(tot(pedido))}</span>
    </div>
    ${pago ? `
      <div class="recibo-linha" style="margin-top:10px; color: var(--ok); font-weight:700;">
        <span>Pagamento:</span>
        <span>${pedido.formaPagamento}</span>
      </div>` : ''}
  `;
}