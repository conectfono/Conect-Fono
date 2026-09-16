const supabaseClient = window.supabase.createClient(
  document.documentElement.dataset.supabaseUrl,
  document.documentElement.dataset.supabaseKey
);

const today = new Date().toISOString().slice(0, 10);

const fmt = d =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(d + 'T12:00:00'));

const card = (e, past = false) => `
  <article class="card event-card ${past ? 'past' : ''}">
    <span class="event-date">${fmt(e.date)} · ${e.place}</span>
    <h3>${e.title}${e.featured ? ' ★' : ''}</h3>
    <p>${e.description}</p>
  </article>
`;

const none = t => `
  <div class="empty">
    <h2>${t}</h2>
    <p>Volte em breve para acompanhar a programação.</p>
  </div>
`;

async function loadEvents() {
  const { data, error } = await supabaseClient
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Erro ao carregar eventos:', error);
    document.querySelector('#upcoming').innerHTML =
      none('Não foi possível carregar os eventos.');
    document.querySelector('#past').innerHTML = '';
    return;
  }

  const list = data || [];

  const next = list
    .filter(e => e.status === 'scheduled' && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const old = list
    .filter(e => e.date < today || e.status === 'finished')
    .sort((a, b) => b.date.localeCompare(a.date));

  document.querySelector('#upcoming').innerHTML =
    next.length
      ? next.map(e => card(e)).join('')
      : none('Nenhum evento programado.');

  document.querySelector('#past').innerHTML =
    old.length
      ? old.map(e => card(e, true)).join('')
      : none('Ainda não há eventos passados.');
}

loadEvents();
