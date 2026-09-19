const area =
  new URLSearchParams(location.search).get('area') ||
  'conteudos';

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
                entry.body
                  ? `
                    <details>
                      <summary>
                        Ler publicação →
                      </summary>

                      <div>
                        ${escapeHTML(entry.body)}
                      </div>
                    </details>
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

loadEntries();
