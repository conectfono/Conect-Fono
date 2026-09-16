const area = new URLSearchParams(location.search).get('area') || 'conteudos';

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
    'Pesquisas, iniciativas científicas e descobertas da comunidade.'
  ],
  projetos: [
    'PROJETOS',
    'Ideias em <em>movimento.</em>',
    'Projetos em andamento que geram impacto na comunidade.'
  ]
}[area] || [
  'CONECT FONO',
  'Em breve.',
  ''
];

document.querySelector('#eyebrow').textContent = labels[0];
document.querySelector('#title').innerHTML = labels[1];
document.querySelector('#intro').textContent = labels[2];

const supabaseClient = window.supabase.createClient(
  document.documentElement.dataset.supabaseUrl,
  document.documentElement.dataset.supabaseKey
);

const entriesContainer = document.querySelector('#entries');

const emptyState = () => `
  <div class="empty">
    <h2>Nenhum conteúdo publicado ainda.</h2>
    <p>Volte em breve para acompanhar as novidades da comunidade CONECT FONO.</p>
  </div>
`;

async function loadEntries() {
  const { data, error } = await supabaseClient
    .from('content_entries')
    .select('*')
    .eq('category', area)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar conteúdos:', error);
    entriesContainer.innerHTML = emptyState();
    return;
  }

  const entries = data || [];

  if (!entries.length) {
    entriesContainer.innerHTML = emptyState();
    return;
  }

  entriesContainer.innerHTML = entries.map(entry => `
    <article class="card">
      <h2>${entry.title}</h2>
      <p>${entry.description || ''}</p>
    </article>
  `).join('');
}

loadEntries();
