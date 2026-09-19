const $ = selector => document.querySelector(selector);

const config = document.documentElement.dataset;

if (
  !config.supabaseUrl ||
  !config.supabaseKey ||
  !window.supabase
) {
  throw new Error(
    'Configuração pública do Supabase ausente.'
  );
}

const supabaseClient =
  window.supabase.createClient(
    config.supabaseUrl,
    config.supabaseKey
  );

const safe = value =>
  String(value ?? '').replace(
    /[&<>"']/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char])
  );

let products = [];
let session = null;

async function loadSession() {
  const { data } =
    await supabaseClient.auth.getSession();

  const user = data.session?.user;

  if (!user) {
    session = null;
    return;
  }

  const { data: profile, error } =
    await supabaseClient
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

  if (error) {
    console.error(
      'Erro ao carregar perfil:',
      error
    );

    session = null;
    return;
  }

  session = profile;
}

function isAdmin() {
  return session?.role === 'admin';
}

function productImageUrl(imagePath) {
  if (!imagePath) return '';

  return supabaseClient
    .storage
    .from('product-images')
    .getPublicUrl(imagePath)
    .data
    .publicUrl;
}

async function loadProducts() {
  const { data, error } =
    await supabaseClient
      .from('products')
      .select(
        'id, name, price, whatsapp, description, image_path, active, created_at'
      )
      .eq('active', true)
      .order('created_at', {
        ascending: false
      });

  if (error) {
    console.error(
      'Erro ao carregar produtos:',
      error
    );

    alert(
      'Não foi possível carregar a loja agora.'
    );

    return;
  }

  products = data || [];
}

function renderProducts() {
  const productArea = $('#products');

  if (!productArea) return;

  if (!products.length) {
    productArea.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🛍️</div>

        <h2>Aguarde novidades!</h2>

        <p>
          A loja da CONECT FONO ainda está
          preparando seus primeiros produtos.
        </p>
      </div>
    `;

    return;
  }

  productArea.innerHTML =
    products
      .map(product => {

        const image =
          productImageUrl(
            product.image_path
          );

        const whatsapp =
          String(
            product.whatsapp || ''
          ).replace(/\D/g, '');

        const message =
          encodeURIComponent(
            `Olá! Tenho interesse no produto: ${product.name}`
          );

        return `
          <article class="card">

            ${
              image
                ? `
                  <div class="product-image">
                    <img
                      src="${safe(image)}"
                      alt="${safe(product.name)}"
                      loading="lazy"
                    >
                  </div>
                `
                : `
                  <div class="product-image no-image">
                    <span>🛍️</span>
                  </div>
                `
            }

            <div class="product-content">

              <h3>
                ${safe(product.name)}
              </h3>

              <p>
                ${safe(product.description)}
              </p>

              <div class="product-bottom">

                <strong class="product-price">
                  ${safe(
                    product.price ||
                    'Consulte'
                  )}
                </strong>

                ${
                  whatsapp
                    ? `
                      <a
                        class="button buy"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://wa.me/${whatsapp}?text=${message}"
                      >
                        Falar no WhatsApp →
                      </a>
                    `
                    : ''
                }

              </div>

              ${
                isAdmin()
                  ? `
                    <div
                      class="product-admin-actions"
                      style="display:flex; gap:.5rem; margin-top:1rem;"
                    >

                      <button
                        type="button"
                        class="edit"
                        data-edit-product="${product.id}"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        class="delete"
                        data-remove="${product.id}"
                      >
                        Remover
                      </button>

                    </div>
                  `
                  : ''
              }

            </div>

          </article>
        `;
      })
      .join('');
}

function renderAdmin(editingProduct = null) {
  const adminArea =
    $('#store-admin');

  if (!adminArea) return;

  if (!isAdmin()) {
    adminArea.innerHTML = '';
    return;
  }

  const isEditing =
    Boolean(editingProduct);

  adminArea.innerHTML = `
    <section class="store-admin-box">

      <div class="admin-heading">

        <span class="eyebrow">
          ADMINISTRAÇÃO
        </span>

        <h2>
          ${
            isEditing
              ? 'Editar produto'
              : 'Adicionar produto'
          }
        </h2>

        <p class="admin-note">
          Somente a conta administradora
          visualiza esta área.
        </p>

      </div>

      <form id="product-form">

        <input
          type="hidden"
          id="product-id"
          value="${
            editingProduct?.id || ''
          }"
        >

        <label>
          Foto do produto

          <div
            class="photo-upload"
            id="photo-upload"
          >

            <input
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
            >

            <div
              class="photo-upload-content"
              id="photo-upload-content"
            >

              ${
                editingProduct?.image_path
                  ? `
                    <strong>
                      Manter imagem atual
                    </strong>

                    <span>
                      Selecione uma nova imagem
                      somente se quiser substituí-la.
                    </span>
                  `
                  : `
                    <div class="photo-icon">
                      📷
                    </div>

                    <strong>
                      Escolher foto
                    </strong>

                    <span>
                      JPEG, PNG ou WebP — até 5 MB
                    </span>
                  `
              }

            </div>

          </div>

        </label>

        <label>
          Nome do produto

          <input
            id="product-name"
            type="text"
            required
            maxlength="160"
            placeholder="Ex.: Camiseta CONECT FONO"
            value="${safe(
              editingProduct?.name || ''
            )}"
          >

        </label>

        <div class="row">

          <label>
            Preço

            <input
              id="product-price"
              type="text"
              maxlength="50"
              placeholder="Ex.: R$ 49,90"
              value="${safe(
                editingProduct?.price || ''
              )}"
            >
          </label>

          <label>
            WhatsApp de atendimento

            <input
              id="product-whatsapp"
              type="text"
              required
              maxlength="20"
              placeholder="Ex.: 5584999999999"
              value="${safe(
                editingProduct?.whatsapp || ''
              )}"
            >
          </label>

        </div>

        <label>
          Descrição

          <textarea
            id="product-description"
            required
            maxlength="2000"
            placeholder="Descreva o produto..."
          >${safe(
            editingProduct?.description || ''
          )}</textarea>

        </label>

        <div
          style="display:flex; gap:.75rem; flex-wrap:wrap;"
        >

          <button
            class="button"
            type="submit"
          >
            ${
              isEditing
                ? 'Salvar alterações →'
                : 'Publicar produto →'
            }
          </button>

          ${
            isEditing
              ? `
                <button
                  class="button"
                  type="button"
                  id="cancel-product-edit"
                >
                  Cancelar
                </button>
              `
              : ''
          }

        </div>

      </form>

    </section>
  `;

  const imageInput =
    $('#product-image');

  const photoUpload =
    $('#photo-upload');

  const photoContent =
    $('#photo-upload-content');

  photoUpload.onclick = () =>
    imageInput.click();

  imageInput.onchange = () => {

    const file =
      imageInput.files[0];

    if (!file) return;

    if (
      ![
        'image/jpeg',
        'image/png',
        'image/webp'
      ].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      alert(
        'Escolha uma imagem JPEG, PNG ou WebP de até 5 MB.'
      );

      imageInput.value = '';

      return;
    }

    photoContent.innerHTML = `
      <strong>
        ${safe(file.name)}
      </strong>

      <span>
        Imagem selecionada.
        Clique para trocar.
      </span>
    `;
  };

  $('#product-form').onsubmit =
    async event => {

      event.preventDefault();

      if (!isAdmin()) {
        alert(
          'Você não tem permissão para administrar a loja.'
        );

        return;
      }

      const id =
        $('#product-id').value.trim();

      const file =
        imageInput.files[0];

      const existingProduct =
        id
          ? products.find(
              item => item.id === id
            )
          : null;

      let imagePath =
        existingProduct?.image_path ||
        null;

      let newImagePath = null;

      if (file) {

        const extension =
          file.name
            .split('.')
            .pop()
            .toLowerCase();

        newImagePath =
          `${crypto.randomUUID()}.${extension}`;

        const {
          error: uploadError
        } =
          await supabaseClient
            .storage
            .from('product-images')
            .upload(
              newImagePath,
              file,
              {
                contentType: file.type,
                upsert: false
              }
            );

        if (uploadError) {

          console.error(
            'Erro ao enviar imagem:',
            uploadError
          );

          alert(
            'Não foi possível enviar a imagem.'
          );

          return;
        }

        imagePath =
          newImagePath;
      }

      const product = {
        name:
          $('#product-name')
            .value
            .trim(),

        price:
          $('#product-price')
            .value
            .trim() || null,

        whatsapp:
          $('#product-whatsapp')
            .value
            .trim(),

        description:
          $('#product-description')
            .value
            .trim(),

        image_path:
          imagePath
      };

      let error = null;

      if (id) {

        const result =
          await supabaseClient
            .from('products')
            .update(product)
            .eq('id', id);

        error =
          result.error;

      } else {

        const result =
          await supabaseClient
            .from('products')
            .insert(product);

        error =
          result.error;
      }

      if (error) {

        if (newImagePath) {
          await supabaseClient
            .storage
            .from('product-images')
            .remove([
              newImagePath
            ]);
        }

        console.error(
          'Erro ao salvar produto:',
          error
        );

        alert(
          'Não foi possível salvar o produto.'
        );

        return;
      }

      /*
       * Se uma nova imagem substituiu
       * a antiga, remove a antiga depois
       * que o produto foi salvo.
       */
      if (
        id &&
        newImagePath &&
        existingProduct?.image_path
      ) {

        const {
          error: removeOldImageError
        } =
          await supabaseClient
            .storage
            .from('product-images')
            .remove([
              existingProduct.image_path
            ]);

        if (removeOldImageError) {
          console.error(
            'Erro ao remover imagem antiga:',
            removeOldImageError
          );
        }
      }

      await loadProducts();

      renderProducts();

      renderAdmin();

      alert(
        id
          ? 'Produto atualizado com sucesso!'
          : 'Produto publicado com sucesso!'
      );
    };

  const cancelButton =
    $('#cancel-product-edit');

  if (cancelButton) {
    cancelButton.onclick =
      () => {
        renderAdmin();
      };
  }
}

async function editProduct(id) {

  if (!isAdmin()) {
    alert(
      'Você não tem permissão para editar produtos.'
    );

    return;
  }

  const product =
    products.find(
      item => item.id === id
    );

  if (!product) return;

  renderAdmin(product);

  window.scrollTo({
    top: document.querySelector(
      '#store-admin'
    )?.offsetTop || 0,
    behavior: 'smooth'
  });
}

async function removeProduct(id) {

  if (!isAdmin()) {
    alert(
      'Você não tem permissão para remover produtos.'
    );

    return;
  }

  const product =
    products.find(
      item => item.id === id
    );

  if (
    !product ||
    !confirm(
      'Tem certeza que deseja remover este produto?'
    )
  ) {
    return;
  }

  const {
    error
  } =
    await supabaseClient
      .from('products')
      .delete()
      .eq('id', id);

  if (error) {

    console.error(
      'Erro ao remover produto:',
      error
    );

    alert(
      'Não foi possível remover o produto.'
    );

    return;
  }

  if (product.image_path) {

    const {
      error: imageError
    } =
      await supabaseClient
        .storage
        .from('product-images')
        .remove([
          product.image_path
        ]);

    if (imageError) {
      console.error(
        'Erro ao remover imagem do produto:',
        imageError
      );
    }
  }

  await loadProducts();

  renderProducts();

  renderAdmin();

  alert(
    'Produto removido com sucesso!'
  );
}

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    await loadSession();

    await loadProducts();

    renderProducts();

    renderAdmin();

    const productsArea =
      $('#products');

    if (productsArea) {

      productsArea.onclick =
        event => {

          const removeId =
            event.target
              .closest(
                '[data-remove]'
              )
              ?.dataset
              .remove;

          if (removeId) {
            removeProduct(removeId);
            return;
          }

          const editId =
            event.target
              .closest(
                '[data-edit-product]'
              )
              ?.dataset
              .editProduct;

          if (editId) {
            editProduct(editId);
          }
        };
    }
  }
);
