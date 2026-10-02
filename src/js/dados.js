// Importa Firestore
import { db } from './firebase-config.js';
import {
  collection, addDoc, getDocs, updateDoc, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// ==========================================
// CARDÁPIO
// ==========================================
export const MENU = [
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
  { n: 'Meia Lua',               p: 58, k: 1, cat: 'especial' },
  { n: 'Cinco Queijos',          p: 60, k: 1, cat: 'especial' },
  { n: 'Camarão',                p: 68, k: 1, cat: 'especial' },
  { n: 'Salmão',                 p: 72, k: 1, cat: 'especial' },
  { n: 'Rúcula com Tomate Seco', p: 58, k: 1, cat: 'especial' },
  { n: 'Brie com Damasco',       p: 66, k: 1, cat: 'especial' },
  { n: 'Refrigerante 2L',        p: 14, k: 0, cat: 'bebida' },
  { n: 'Refrigerante Lata',      p:  7, k: 0, cat: 'bebida' },
  { n: 'Suco de Laranja',        p: 12, k: 0, cat: 'bebida' },
  { n: 'Suco de Maracujá',       p: 12, k: 0, cat: 'bebida' },
  { n: 'Água Mineral',           p:  5, k: 0, cat: 'bebida' },
  { n: 'Água com Gás',           p:  6, k: 0, cat: 'bebida' },
  { n: 'Cerveja Long Neck',      p: 14, k: 0, cat: 'bebida' },
  { n: 'Vinho Taça',             p: 18, k: 0, cat: 'bebida' },
];

// ==========================================
// CRUD DE PEDIDOS
// ==========================================

// Cria um novo pedido
export async function criarPedido(pedido) {
  const ref = await addDoc(collection(db, 'pedidos'), pedido);
  return ref.id;
}

// Lê todos os pedidos
export async function getPedidos() {
  const q = query(collection(db, 'pedidos'), orderBy('t', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Atualiza um pedido
export async function atualizarPedido(id, dados) {
  const ref = doc(db, 'pedidos', id);
  await updateDoc(ref, dados);
}

// ==========================================
// LOG DE AUDITORIA
// ==========================================
export async function registrarLog(acao, pedidoId = null) {
  try {
    const { auth } = await import('./firebase-config.js');
    const usuario = auth.currentUser?.email || 'anonimo';
    await addDoc(collection(db, 'logs'), {
      usuario,
      acao,
      pedidoId,
      timestamp: Date.now(),
    });
  } catch (e) {
    console.warn('Erro ao registrar log:', e);
  }
}

// ==========================================
// HELPERS
// ==========================================
export const R = v => 'R$ ' + v.toFixed(2).replace('.', ',');
export const mm = n => String(n).padStart(2, '0');
export const hora = t => new Date(t).toLocaleTimeString('pt-BR', {
  hour: '2-digit',
  minute: '2-digit'
});
export const min = t => Math.floor((Date.now() - t) / 60000);
export const urg = x => x <= 30 ? 'ok' : x <= 50 ? 'mid' : 'late';
export const tot = o => o.items.reduce((s, i) => s + i.q * i.p, 0);

// ==========================================
// GERA HTML DO RECIBO
// ==========================================
export function gerarReciboHTML(pedido, pago = false) {
  const linhas = pedido.items.map(i =>
    `<div class="recibo-linha">
       <span>${i.q}× ${i.n}</span>
       <span>${R(i.q * i.p)}</span>
     </div>`
  ).join('');

  return `
    <div style="font-weight:700; margin-bottom:10px; color: var(--mut);">
      PEDIDO #${String(pedido.id).slice(-4)} — MESA ${mm(pedido.mesa)}
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