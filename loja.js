const PRODUCTS = 'connect-fono-products-v1';
const SESSION = 'connect-fono-session-v1';

const $ = selector => document.querySelector(selector);

const get = (key, fallback) =>
  JSON.parse(localStorage.getItem(key) || 'null') || fallback;

const put = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

const safe = value =>
  String(value || '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));

let products = get(PRODUCTS, []);

const session = get(SESSION, null);


/* ==========================================
   RENDERIZAÇÃO DA LOJA
========================================== */

function render() {

  const productArea = $('#products');

  if (!productArea) return;


  /* ==========================================
     LISTA DE PRODUTOS
  ========================================== */

  if (!products.length) {

    productArea.innerHTML = `
      <div class="empty">

        <div class="empty-icon">
          🛍️
        </div>

        <h2>Aguarde novidades!</h2>

        <p>
          A loja da CONECT FONO ainda está
          preparando seus primeiros produtos.
        </p>

      </div>
    `;

  } else {

    productArea.innerHTML = products.map(product => {

      /*
       * Se o produto tiver uma foto salva,
       * usamos a foto.
       *
       * Se não tiver, mostramos um espaço
       * neutro para não quebrar o card.
       */

      const image = product.image
        ? safe(product.image)
        : '';

      const price = product.price
        ? safe(product.price)
        : 'Consulte';

      const whatsapp = String(
        product.whatsapp || ''
      ).replace(/\D/g, '');

      const message = encodeURIComponent(
        'Olá! Tenho interesse no produto: ' +
        product.name
      );


      return `

        <article class="card">

          ${
            image
              ? `
                <div class="product-image">

                  <img
                    src="${image}"
                    alt="${safe(product.name)}"
                  >

                </div>
              `
              : `
                <div class="product-image no-image">

                  <span>
                    🛍️
                  </span>

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
                ${price}
              </strong>


              <a
                class="button buy"
                target="_blank"
                rel="noopener"
                href="https://wa.me/${whatsapp}?text=${message}"
              >
                Falar no WhatsApp →
              </a>

            </div>


            ${
              session?.role === 'admin'
                ? `
                  <button
                    class="delete"
                    data-remove="${product.id}"
                  >
                    Remover produto
                  </button>
                `
                : ''
            }

          </div>

        </article>

      `;

    }).join('');

  }


  /* ==========================================
     ÁREA ADMINISTRATIVA
  ========================================== */

  const adminArea = $('#store-admin');

  if (!adminArea) return;


  if (session?.role !== 'admin') {

    adminArea.innerHTML = '';

    return;
  }


  adminArea.innerHTML = `

    <section class="store-admin-box">

      <div class="admin-heading">

        <span class="eyebrow">
          ADMINISTRAÇÃO
        </span>

        <h2>
          Adicionar produto
        </h2>

        <p class="admin-note">
          Somente a conta administradora
          visualiza esta área.
        </p>

      </div>


      <form id="product-form">


        <!-- ==========================
             FOTO
        =========================== -->

        <label>

          Foto do produto

          <div
            class="photo-upload"
            id="photo-upload"
          >

            <input
              id="product-image"
              type="file"
              accept="image/*"
              hidden
            >

            <div
              class="photo-upload-content"
              id="photo-upload-content"
            >

              <div class="photo-icon">
                📷
              </div>

              <strong>
                Escolher foto
              </strong>

              <span>
                Clique aqui para selecionar
                uma imagem do computador
              </span>

            </div>

          </div>

        </label>


        <!-- ==========================
             NOME
        =========================== -->

        <label>

          Nome do produto

          <input
            id="product-name"
            type="text"
            required
            placeholder="Ex.: Camiseta CONECT FONO"
          >

        </label>


        <!-- ==========================
             PREÇO + WHATSAPP
        =========================== -->

        <div class="row">


          <label>

            Preço

            <input
              id="product-price"
              type="text"
              placeholder="Ex.: R$ 49,90"
            >

          </label>


          <label>

            WhatsApp de atendimento

            <input
              id="product-whatsapp"
              type="text"
              required
              placeholder="Ex.: 5584999999999"
            >

          </label>


        </div>


        <!-- ==========================
             DESCRIÇÃO
        =========================== -->

        <label>

          Descrição

          <textarea
            id="product-description"
            required
            placeholder="Descreva o produto..."
          ></textarea>

        </label>


        <!-- ==========================
             BOTÃO
        =========================== -->

        <button
          class="button"
          type="submit"
        >
          Publicar produto →
        </button>


      </form>

    </section>

  `;


  /* ==========================================
     SELEÇÃO DA FOTO
  ========================================== */

  const imageInput =
    $('#product-image');

  const photoUpload =
    $('#photo-upload');

  const photoContent =
    $('#photo-upload-content');


  if (photoUpload && imageInput) {

    photoUpload.onclick = () => {
      imageInput.click();
    };


    imageInput.onchange = event => {

      const file =
        event.target.files[0];

      if (!file) return;


      /*
       * Verifica se realmente é uma imagem
       */

      if (!file.type.startsWith('image/')) {

        alert(
          'Por favor, escolha uma imagem.'
        );

        imageInput.value = '';

        return;
      }


      /*
       * Limite de tamanho:
       * 5 MB
       */

      if (file.size > 5 * 1024 * 1024) {

        alert(
          'A imagem deve ter no máximo 5 MB.'
        );

        imageInput.value = '';

        return;
      }


      /*
       * FileReader transforma a imagem
       * em Base64 para podermos salvar
       * no localStorage.
       */

      const reader =
        new FileReader();


      reader.onload = e => {

        const imageData =
          e.target.result;


        photoContent.innerHTML = `

          <img
            src="${imageData}"
            alt="Prévia do produto"
            class="photo-preview"
          >

          <div class="photo-change">
            Clique para trocar a foto
          </div>

        `;


        /*
         * Guardamos temporariamente
         * a imagem no formulário.
         */

        photoUpload.dataset.image =
          imageData;

      };


      reader.readAsDataURL(file);

    };

  }


  /* ==========================================
     FORMULÁRIO
  ========================================== */

  const form =
    $('#product-form');


  if (!form) return;


  form.onsubmit = event => {

    event.preventDefault();


    const name =
      $('#product-name')
        .value
        .trim();


    const price =
      $('#product-price')
        .value
        .trim();


    const whatsapp =
      $('#product-whatsapp')
        .value
        .trim();


    const description =
      $('#product-description')
        .value
        .trim();


    const image =
      photoUpload?.dataset.image || '';


    /*
     * Cria o produto
     */

    const product = {

      id: crypto.randomUUID(),

      name,

      price,

      whatsapp,

      description,

      image

    };


    /*
     * Adiciona à lista
     */

    products.push(product);


    /*
     * Salva no navegador
     */

    put(
      PRODUCTS,
      products
    );


    /*
     * Atualiza a loja
     */

    render();


    alert(
      'Produto publicado com sucesso!'
    );

  };

}


/* ==========================================
   REMOVER PRODUTO
========================================== */

const productArea =
  $('#products');


if (productArea) {

  productArea.onclick = event => {

    const id =
      event.target.dataset.remove;


    if (!id) return;


    const confirmDelete =
      confirm(
        'Tem certeza que deseja remover este produto?'
      );


    if (!confirmDelete) return;


    products =
      products.filter(
        product =>
          product.id !== id
      );


    put(
      PRODUCTS,
      products
    );


    render();

  };

}


/* ==========================================
   INICIAR
========================================== */

render();
