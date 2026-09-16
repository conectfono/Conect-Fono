const $ = selector => document.querySelector(selector);
const config = document.documentElement.dataset;
if (!config.supabaseUrl || !config.supabaseKey || !window.supabase) {
  throw new Error('Configuração pública do Supabase ausente.');
}
const supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

let products = [];
let session = null;

async function loadSession() {
  const { data } = await supabaseClient.auth.getSession();
  const user = data.session?.user;
  if (!user) return;
  const { data: profile, error } = await supabaseClient
    .from('profiles').select('id, role').eq('id', user.id).single();
  if (error) return console.error('Erro ao carregar perfil:', error);
  session = profile;
}

function productImageUrl(imagePath) {
  if (!imagePath) return '';
  return supabaseClient.storage.from('product-images').getPublicUrl(imagePath).data.publicUrl;
}

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('id, name, price, whatsapp, description, image_path')
    .eq('active', true).order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao carregar produtos:', error);
    alert('Não foi possível carregar a loja agora.');
    return;
  }
  products = data || [];
}

function renderProducts() {
  const productArea = $('#products');
  if (!productArea) return;
  if (!products.length) {
    productArea.innerHTML = `<div class="empty"><div class="empty-icon">🛍️</div><h2>Aguarde novidades!</h2><p>A loja da CONECT FONO ainda está preparando seus primeiros produtos.</p></div>`;
    return;
  }
  productArea.innerHTML = products.map(product => {
    const image = productImageUrl(product.image_path);
    const whatsapp = String(product.whatsapp || '').replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}`);
    return `<article class="card">
      ${image ? `<div class="product-image"><img src="${safe(image)}" alt="${safe(product.name)}"></div>` : '<div class="product-image no-image"><span>🛍️</span></div>'}
      <div class="product-content"><h3>${safe(product.name)}</h3><p>${safe(product.description)}</p>
        <div class="product-bottom"><strong class="product-price">${safe(product.price || 'Consulte')}</strong><a class="button buy" target="_blank" rel="noopener" href="https://wa.me/${whatsapp}?text=${message}">Falar no WhatsApp →</a></div>
        ${session?.role === 'admin' ? `<button class="delete" data-remove="${product.id}">Remover produto</button>` : ''}
      </div></article>`;
  }).join('');
}

function renderAdmin() {
  const adminArea = $('#store-admin');
  if (!adminArea) return;
  if (session?.role !== 'admin') {
    adminArea.innerHTML = '';
    return;
  }
  adminArea.innerHTML = `<section class="store-admin-box"><div class="admin-heading"><span class="eyebrow">ADMINISTRAÇÃO</span><h2>Adicionar produto</h2><p class="admin-note">Somente a conta administradora visualiza esta área.</p></div>
    <form id="product-form"><label>Foto do produto<div class="photo-upload" id="photo-upload"><input id="product-image" type="file" accept="image/jpeg,image/png,image/webp" hidden><div class="photo-upload-content" id="photo-upload-content"><div class="photo-icon">📷</div><strong>Escolher foto</strong><span>JPEG, PNG ou WebP — até 5 MB</span></div></div></label>
    <label>Nome do produto<input id="product-name" type="text" required maxlength="160" placeholder="Ex.: Camiseta CONECT FONO"></label><div class="row"><label>Preço<input id="product-price" type="text" maxlength="50" placeholder="Ex.: R$ 49,90"></label><label>WhatsApp de atendimento<input id="product-whatsapp" type="text" required maxlength="20" placeholder="Ex.: 5584999999999"></label></div><label>Descrição<textarea id="product-description" required maxlength="2000" placeholder="Descreva o produto..."></textarea></label><button class="button" type="submit">Publicar produto →</button></form></section>`;

  const imageInput = $('#product-image');
  const photoUpload = $('#photo-upload');
  const photoContent = $('#photo-upload-content');
  photoUpload.onclick = () => imageInput.click();
  imageInput.onchange = () => {
    const file = imageInput.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      alert('Escolha uma imagem JPEG, PNG ou WebP de até 5 MB.');
      imageInput.value = '';
      return;
    }
    photoContent.innerHTML = `<strong>${safe(file.name)}</strong><span>Imagem selecionada. Clique para trocar.</span>`;
  };

  $('#product-form').onsubmit = async event => {
    event.preventDefault();
    const file = imageInput.files[0];
    let imagePath = null;
    if (file) {
      imagePath = `${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`;
      const { error: uploadError } = await supabaseClient.storage.from('product-images')
        .upload(imagePath, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        console.error('Erro ao enviar imagem:', uploadError);
        alert('Não foi possível enviar a imagem.');
        return;
      }
    }
    const product = { name: $('#product-name').value.trim(), price: $('#product-price').value.trim() || null, whatsapp: $('#product-whatsapp').value.trim(), description: $('#product-description').value.trim(), image_path: imagePath };
    const { error } = await supabaseClient.from('products').insert(product);
    if (error) {
      if (imagePath) await supabaseClient.storage.from('product-images').remove([imagePath]);
      console.error('Erro ao publicar produto:', error);
      alert('Não foi possível publicar o produto.');
      return;
    }
    await loadProducts();
    renderProducts();
    renderAdmin();
    alert('Produto publicado com sucesso!');
  };
}

async function removeProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product || !confirm('Tem certeza que deseja remover este produto?')) return;
  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if (error) {
    console.error('Erro ao remover produto:', error);
    alert('Não foi possível remover o produto.');
    return;
  }
  if (product.image_path) await supabaseClient.storage.from('product-images').remove([product.image_path]);
  await loadProducts();
  renderProducts();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSession();
  await loadProducts();
  renderProducts();
  renderAdmin();
  $('#products').onclick = event => {
    const id = event.target.closest('[data-remove]')?.dataset.remove;
    if (id) removeProduct(id);
  };
});
