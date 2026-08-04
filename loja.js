const PRODUCTS = 'connect-fono-products-v1';
const SESSION = 'connect-fono-session-v1';
const $ = selector => document.querySelector(selector);
const get = (key, fallback) => JSON.parse(localStorage.getItem(key) || 'null') || fallback;
const put = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const safe = value => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
let products = get(PRODUCTS, []);
const session = get(SESSION, null);

function render() {
  const productArea = $('#products');
  productArea.innerHTML = products.length
    ? products.map(product => `<article class="card"><h3>${safe(product.name)}</h3><p>${safe(product.description)}</p><strong>${safe(product.price || 'Consulte')}</strong><br><a class="button buy" target="_blank" rel="noopener" href="https://wa.me/${product.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Tenho interesse no produto: ' + product.name)}">Falar no WhatsApp →</a>${session?.role === 'admin' ? ` <button class="delete" data-remove="${product.id}">Remover</button>` : ''}</article>`).join('')
    : '<div class="empty"><h2>Aguarde novidades!</h2><p>A loja da CONECT FONO ainda está preparando seus primeiros produtos.</p></div>';
  const adminArea = $('#store-admin');
  if (session?.role !== 'admin') { adminArea.innerHTML = ''; return; }
  adminArea.innerHTML = `<h2>Adicionar produto</h2><p class="admin-note">Somente a conta administradora visualiza este formulário.</p><form id="product-form"><label>Nome do produto<input id="product-name" required></label><div class="row"><label>Preço (opcional)<input id="product-price" placeholder="Ex.: R$ 49,90"></label><label>WhatsApp de atendimento<input id="product-whatsapp" required placeholder="Ex.: 5511999999999"></label></div><label>Descrição<textarea id="product-description" required></textarea></label><button class="button">Publicar produto →</button></form>`;
  $('#product-form').onsubmit = event => {
    event.preventDefault();
    products.push({id:crypto.randomUUID(), name:$('#product-name').value, price:$('#product-price').value, whatsapp:$('#product-whatsapp').value, description:$('#product-description').value});
    put(PRODUCTS, products); render();
  };
}

$('#products').onclick = event => {
  const id = event.target.dataset.remove;
  if (!id) return;
  products = products.filter(product => product.id !== id);
  put(PRODUCTS, products); render();
};
render();
