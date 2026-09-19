const params = new URLSearchParams(location.search);

const area =
  params.get('area') ||
  'conteudos';

const postSlug =
  params.get('post');

const labels = {
  conteudos: [
    'CONTEÚDOS',
    'Conteúdos para a sua <em>jornada.</em>',
    'Artigos científicos, materiais e referências para aprender continuamente.'
  ],

  oportunidades: [
    'OPORTUNIDADES',
    'Encontre sua próxima <em>oportunidade.</em>',
    'Vagas, experiências e caminhos para construir sua trajetória.'
  ],

  pesquisa: [
    'CIÊNCIA & PESQUISA',
    'Conhecimento que <em>transforma.</em>',
    'Pesquisas, notícias científicas e descobertas da comunidade.'
  ],

  projetos: [
    'PROJETOS',
    'Ideias em <em>movimento.</em>',
    'Projetos, iniciativas e histórias da comunidade CONECT FONO.'
  ]
}[area] || [
  'CONECT FONO',
  'Em breve.',
  ''
];

document.querySelector('#eyebrow').textContent = labels[0];
document.querySelector('#title').innerHTML = labels[1];
document.querySelector('#intro').textContent = labels[2];

const supabaseClient =
  window.supabase.createClient(
    document.documentElement.dataset.supabaseUrl,
    document.documentElement.dataset.supabaseKey
  );

const entriesContainer =
  document.querySelector('#entries');

const emptyState = () => `
  <div class="empty">
    <h2>Nenhuma publicação encontrada.</h2>
    <p>
      Volte em breve para acompanhar as novidades
      da comunidade CONECT FONO.
    </p>
  </div>
`;

const formatDate = date => {
  if (!date) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
};

const escapeHTML = value =>
  String(value ?? '').replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));

async function loadPost() {
  if (!postSlug) return;

  const postContainer =
    document.querySelector('#post');

  const entriesContainer =
    document.querySelector('#entries');

  const { data: post, error } =
    await supabaseClient
      .from('content_entries')
      .select('*')
      .eq('area', area)
      .eq('slug', postSlug)
      .eq('published', true)
      .maybeSingle();

  if (error) {
    console.error(
      'Erro ao carregar publicação:',
      error
    );

    return;
  }

  if (!post) {
    postContainer.hidden = false;

    postContainer.innerHTML = `
      <div class="empty">
        <h2>Publicação não encontrada.</h2>
        <p>
          A publicação que você tentou acessar
          não está disponível.
        </p>
      </div>
    `;

    entriesContainer.hidden = true;

    return;
  }

  document.querySelector('#eyebrow').textContent =
    area === 'pesquisa'
      ? 'CIÊNCIA & PESQUISA'
      : 'PROJETOS';

  document.querySelector('#title').textContent =
    post.title;

  document.querySelector('#intro').textContent =
    '';

  entriesContainer.hidden = true;

  postContainer.hidden = false;

  postContainer.innerHTML = `
    ${
      post.cover_url
        ? `
          <img
            src="${escapeHTML(post.cover_url)}"
            alt="${escapeHTML(post.title)}"
            loading="lazy"
          />
        `
        : ''
    }

    <small>
      ${
        post.author_name
          ? `Por ${escapeHTML(post.author_name)}`
          : ''
      }

      ${
        post.published_at
          ? ` · ${formatDate(post.published_at)}`
          : ''
      }
    </small>

    <h2>
      ${escapeHTML(post.title)}
    </h2>

    ${
      post.description
        ? `
          <p>
            ${escapeHTML(post.description)}
          </p>
        `
        : ''
    }

    ${
      post.body
        ? `
          <div class="post-body">
            ${escapeHTML(post.body)}
          </div>
        `
        : ''
    }

    <p>
      <a href="portal.html?area=${encodeURIComponent(area)}">
        ← Voltar para publicações
      </a>
    </p>
  `;
}

async function loadEntries() {
  const { data, error } =
    await supabaseClient
      .from('content_entries')
      .select('*')
      .eq('area', area)
      .eq('published', true)
      .order('published_at', {
        ascending: false,
        nullsFirst: false
      })
      .order('created_at', {
        ascending: false
      });

  if (error) {
    console.error(
      'Erro ao carregar conteúdos:',
      error
    );

    entriesContainer.innerHTML =
      emptyState();

    return;
  }

  const entries = data || [];

  if (!entries.length) {
    entriesContainer.innerHTML =
      emptyState();

    return;
  }

  entriesContainer.innerHTML =
    entries.map(entry => {

      const isBlog =
        area === 'pesquisa' ||
        area === 'projetos';

      if (isBlog) {
  return `
    <article class="card">

      ${
        entry.cover_url
          ? `
            <img
              src="${escapeHTML(entry.cover_url)}"
              alt="${escapeHTML(entry.title)}"
              loading="lazy"
            />
          `
          : ''
      }

      <div>

        <small>
          ${
            entry.author_name
              ? `Por ${escapeHTML(entry.author_name)}`
              : ''
          }

          ${
            entry.published_at
              ? ` · ${formatDate(entry.published_at)}`
              : ''
          }
        </small>

        <h2>
          ${escapeHTML(entry.title)}
        </h2>

        <p>
          ${escapeHTML(entry.description || '')}
        </p>

        ${
          entry.slug
            ? `
              <a
                href="portal.html?area=${encodeURIComponent(area)}&post=${encodeURIComponent(entry.slug)}"
              >
                Ler publicação →
              </a>
            `
            : ''
        }

      </div>

    </article>
  `;
}

      return `
        <article class="card">

          <h2>
            ${escapeHTML(entry.title)}
          </h2>

          <p>
            ${escapeHTML(entry.description || '')}
          </p>

          ${
            entry.url
              ? `
                <a
                  href="${escapeHTML(entry.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Acessar conteúdo →
                </a>
              `
              : ''
          }

        </article>
      `;
    }).join('');
}

if (postSlug) {
  loadPost();
} else {
  loadEntries();
}
