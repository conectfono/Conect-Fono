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


/* ================================
   RENDER DA LOJA
================================ */

function render() {

  const productArea = $('#products');

  if (!productArea) return;


  /* ================================
     PRODUTOS
  ================================= */

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

      const image = product.image
        ? safe(product.image)
        : 'assets/produto-placeholder.png';

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

          <div class="product-image">

            <img
              src="${image}"
              alt="${safe(product.name)}"
              onerror="this.src='assets/produto-placeholder.png'"
            >

          </div>

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


  /* ================================
     ÁREA ADMINISTRATIVA
  ================================= */

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


        <label>

          Nome do produto

          <input
            id="product-name"
            type="text"
            required
            placeholder="Ex.: Camiseta CONECT FONO"
          >

        </label>


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


        <label>

          Link da foto do produto

          <input
            id="product-image"
            type="url"
            placeholder="https://..."
          >

        </label>


        <div
          id="image-preview"
          class="image-preview"
        >

          <span>
            A prévia da imagem aparecerá aqui
          </span>

        </div>


        <label>

          Descrição

          <textarea
            id="product-description"
            required
            placeholder="Descreva o produto..."
          ></textarea>

        </label>


        <button
          class="button"
          type="submit"
        >
          Publicar produto →
        </button>


      </form>

    </section>

  `;


  /* ================================
     PRÉVIA DA IMAGEM
  ================================= */

  const imageInput = $('#product-image');
  const imagePreview = $('#image-preview');


  imageInput.addEventListener(
    'input',
    () => {

      const url =
        imageInput.value.trim();


      if (!url) {

        imagePreview.innerHTML = `
          <span>
            A prévia da imagem aparecerá aqui
          </span>
        `;

        return;
      }


      imagePreview.innerHTML = `

        <img
          src="${safe(url)}"
          alt="Prévia do produto"
          onerror="
            this.style.display='none';
            this.parentElement.innerHTML='<span>Não foi possível carregar esta imagem.</span>';
          "
        >

      `;

    }
  );


  /* ================================
     CADASTRO DO PRODUTO
  ================================= */

  $('#product-form').onsubmit = event => {

    event.preventDefault();


    const name =
      $('#product-name').value.trim();

    const price =
      $('#product-price').value.trim();

    const whatsapp =
      $('#product-whatsapp').value.trim();

    const image =
      $('#product-image').value.trim();

    const description =
      $('#product-description').value.trim();


    const product = {

      id: crypto.randomUUID(),

      name,

      price,

      whatsapp,

      image,

      description

    };


    products.push(product);

    put(PRODUCTS, products);


    render();


    alert(
      'Produto publicado com sucesso!'
    );

  };

}


/* ================================
   REMOVER PRODUTOS
================================ */

const productArea = $('#products');

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


/* ================================
   INICIALIZAÇÃO
================================ */

render();
