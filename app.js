const SUPABASE_URL = 'https://drwtzwcgkqwealesdutq.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ULtSY8GdvicDrtcDBamJfw__x51Pyg1';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
console.log('CONECT FONO: Supabase conectado', supabaseClient);

const DB = {
  events: 'connect-fono-events-v2',
  users: 'connect-fono-users-v1',
  enrollments: 'connect-fono-enrollments-v1',
  session: 'connect-fono-session-v1'
};

const defaults = [
  {
    id: 'fono-experience',
    title: 'Fono Experience 2026',
    date: '2026-10-18',
    place: 'Natal, RN',
    description:
      'Um dia inteiro de conhecimento, troca e experiências reais.',
    status: 'scheduled',
    featured: true
  }
];

const seedAdmin = {
  id: 'admin-connect',
  name: 'Admin CONECT',
  email: 'admin@connectfono.com',
  password: 'connect2026',
  role: 'admin',
  createdAt: '2026-01-01'
};

const $ = s => document.querySelector(s);

const uid = () => {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return (
    'id-' +
    Date.now() +
    '-' +
    Math.random().toString(16).slice(2)
  );
};

const get = (key, fallback = []) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));

    return value !== null ? value : fallback;
  } catch {
    return fallback;
  }
};

const put = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

let events = get(DB.events, defaults);
let users = get(DB.users, [seedAdmin]);
let  = get(DB., []);
let session = get(DB.session, null);
async function syncSupabaseSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error('Erro ao recuperar sessão:', error);
    return;
  }

  const user = data.session?.user;

  if (!user) {
    session = null;
    return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('id, name, email, role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Erro ao carregar perfil:', profileError);
    return;
  }

  session = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role
  };
}
async function loadEventsFromSupabase() {
  const { data, error } = await supabaseClient
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Erro ao carregar eventos:', error);
    return;
  }

  if (data && data.length > 0) {
    events = data;
  }
}

/* =========================================================
   FUNÇÕES GERAIS
========================================================= */

function persist() {
  put(DB.events, events);
  put(DB.users, users);
  put(DB., );
  put(DB.session, session);
}

const escapeHTML = value =>
  String(value ?? '').replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));

const dateFormat = d =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
    .format(new Date(d + 'T12:00:00'))
    .replace('.', '');

const upcoming = () =>
  events
    .filter(
      e =>
        e.status === 'scheduled' &&
        e.date >= new Date().toISOString().slice(0, 10)
    )
    .sort((a, b) => a.date.localeCompare(b.date));

const eventInFocus = () =>
  events.find(
    e =>
      e.featured &&
      e.status === 'scheduled'
  ) || upcoming()[0];

function toast(text) {
  const el = $('#toast');

  if (!el) return;

  el.textContent = text;
  el.classList.add('show');

  setTimeout(() => {
    el.classList.remove('show');
  }, 3300);
}


/* =========================================================
   MENU MOBILE
========================================================= */

function initMobileMenu() {
  const menuToggle = $('.menu-toggle');
  const nav = $('#main-nav');

  if (!menuToggle || !nav) return;

  menuToggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();

    nav.classList.toggle('open');

    menuToggle.setAttribute(
      'aria-expanded',
      nav.classList.contains('open')
        ? 'true'
        : 'false'
    );
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');

      menuToggle.setAttribute(
        'aria-expanded',
        'false'
      );
    });
  });
}


/* =========================================================
   CONECT IA
========================================================= */

function openChat() {
  const box = $('#chat-box');

  if (!box) return;

  box.classList.add('open');

  box.setAttribute(
    'aria-hidden',
    'false'
  );
}

function closeChat() {
  const box = $('#chat-box');

  if (!box) return;

  box.classList.remove('open');

  box.setAttribute(
    'aria-hidden',
    'true'
  );
}

function initChat() {
  const chatToggle = $('#chat-toggle');
  const closeButton = $('#close-chat');
  const chatBox = $('#chat-box');
  const chatForm = $('#chat-form');

  /* ABRIR */

  if (chatToggle) {
    chatToggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      if (
        chatBox &&
        chatBox.classList.contains('open')
      ) {
        closeChat();
      } else {
        openChat();
      }
    });
  }

  /* FECHAR PELO X */

  if (closeButton) {
    closeButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      closeChat();
    });
  }

  /* NÃO FECHAR AO CLICAR DENTRO DA JANELA */

  if (chatBox) {
    chatBox.addEventListener('click', event => {
      event.stopPropagation();
    });
  }

  /* FORMULÁRIO DO CHAT */

  if (chatForm) {
    chatForm.addEventListener('submit', event => {
      event.preventDefault();

      const input = $('#chat-input');

      if (!input) return;

      const text = input.value.trim();

      if (!text) return;

      toast(
        'Recebemos sua mensagem! A CONECT IA responderá em breve.'
      );

      input.value = '';
    });
  }

  /* BOTÕES DE AÇÃO RÁPIDA */

  document
    .querySelectorAll('.quick-actions button')
    .forEach(button => {
      button.addEventListener('click', () => {
        const text =
          button.textContent.toLowerCase();

        if (text.includes('eventos')) {
          closeChat();

          location.hash = 'eventos';

        } else if (text.includes('comunidade')) {
          closeChat();

          if (session) {
            const community =
              $('#whatsapp-community');

            if (community) {
              community.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          } else {
            openModal('signup');
          }

        } else if (text.includes('dúvida')) {
          const input = $('#chat-input');

          if (input) {
            input.focus();

            toast(
              'Digite sua dúvida no campo abaixo.'
            );
          }

        } else if (text.includes('equipe')) {
          closeChat();

          toast(
            'Em breve você poderá falar diretamente com nossa equipe.'
          );
        }
      });
    });

  /* ESC FECHA A IA */

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeChat();
    }
  });
}


/* =========================================================
   CABEÇALHO
========================================================= */

function renderHeader() {
  const b = $('#auth-trigger');

  if (!b) return;

  if (session) {
    b.textContent =
      `Olá, ${session.name.split(' ')[0]} ▾`;

    b.onclick = () => {
      location.hash = 'admin';

      renderAdmin();
    };

  } else {
    b.textContent =
      'Entrar / Cadastrar';

    b.onclick = () => {
      openModal('login');
    };
  }
}


/* =========================================================
   COMUNIDADE WHATSAPP
========================================================= */

function renderWhatsAppCommunity() {
  const community =
    $('#whatsapp-community');

  if (!community) return;

  if (session) {
    community.style.display = 'flex';
  } else {
    community.style.display = 'none';
  }
}


/* =========================================================
   POPULAÇÃO
========================================================= */

function renderPopulation() {
  const members = users.filter(
    u =>
      u.role === 'student' ||
      u.role === 'teacher'
  );

  const count = $('#member-count');
  const avatars = $('#member-avatars');

  if (count) {
    count.textContent =
      members.length;
  }

  if (avatars) {
    avatars.innerHTML =
      members
        .slice(0, 5)
        .map(
          u =>
            `<b title="${escapeHTML(u.name)}">${escapeHTML(
              u.name[0]
            )}</b>`
        )
        .join('');
  }
}


/* =========================================================
   EVENTO EM DESTAQUE
========================================================= */

function renderFeatured() {
  const e = eventInFocus();
  const holder = $('#featured-event');

  if (!holder) return;

  if (!e) {
    holder.innerHTML = `
      <div class="event-empty">

        <h3>
          Nenhum evento programado.
        </h3>

        <p>
          Volte em breve para acompanhar
          as próximas experiências.
        </p>

      </div>
    `;

    return;
  }

  const enrolled =
    session &&
    .some(
      x =>
        x.eventId === e.id &&
        x.userId === session.id
    );

  holder.innerHTML = `
    <div class="event-copy">

      <span class="event-label">
        EM DESTAQUE
      </span>

      <h3>
        ${escapeHTML(e.title)}
      </h3>

      <div class="event-meta">

        <span>
          ▪ &nbsp;${dateFormat(e.date)}
        </span>

        <span>
          ⌖ &nbsp;${escapeHTML(e.place)}
        </span>

        <span>
          ♧ &nbsp;Comunidade CONECT
        </span>

      </div>

      <p>
        ${escapeHTML(e.description)}
      </p>

      <button
        class="event-cta"
        data-enroll="${e.id}"
        ${enrolled ? 'disabled' : ''}
      >

        ${
          enrolled
            ? 'Inscrição confirmada ✓'
            : 'Saiba mais &nbsp; →'
        }

      </button>

    </div>

    <div class="event-decoration"></div>
  `;
}


/* =========================================================
   PROTEÇÃO ADMIN
========================================================= */

function adminGuard() {
  return (
    session &&
    session.role === 'admin'
  );
}


/* =========================================================
   FORMULÁRIO DE EVENTO
========================================================= */

function eventForm() {
  return `
    <form id="event-form">

      <input
        type="hidden"
        id="event-id"
      />

      <label>
        Nome do evento

        <input
          id="title"
          required
          placeholder="Ex.: Fono Experience 2026"
        />

      </label>

      <div class="form-row">

        <label>
          Data

          <input
            id="date"
            type="date"
            required
          />

        </label>

        <label>
          Status

          <select id="status">

            <option value="scheduled">
              Programado
            </option>

            <option value="draft">
              Rascunho
            </option>

            <option value="finished">
              Encerrado
            </option>

          </select>

        </label>

      </div>

      <label>

        Local

        <input
          id="place"
          required
          placeholder="Natal, RN"
        />

      </label>

      <label>

        Descrição

        <textarea
          id="description"
          required
          placeholder="O que torna este evento especial?"
        ></textarea>

      </label>

      <label class="checkbox">

        <input
          id="featured"
          type="checkbox"
        />

        Definir como destaque

      </label>

      <div class="form-actions">

        <button
          class="button button-dark"
          type="submit"
        >
          Salvar evento →
        </button>

        <button
          class="cancel"
          type="button"
          id="cancel-edit"
          hidden
        >
          Cancelar
        </button>

      </div>

    </form>
  `;
}


/* =========================================================
   LISTA DE EVENTOS
========================================================= */

function eventList() {
  return `
    <div class="event-list">

      <h3>
        Eventos cadastrados
      </h3>

      ${
        events.length
          ? events
              .slice()
              .sort(
                (a, b) =>
                  a.date.localeCompare(b.date)
              )
              .map(
                e => `
                  <div class="event-row">

                    <div>

                      <strong>

                        ${escapeHTML(e.title)}

                        ${
                          e.featured
                            ? ' ☆'
                            : ''
                        }

                      </strong>

                      <small>

                        ${dateFormat(e.date)}
                        ·
                        ${escapeHTML(e.place)}
                        ·

                        ${
                          e.status ===
                          'scheduled'
                            ? 'Programado'
                            : e.status ===
                              'draft'
                            ? 'Rascunho'
                            : 'Encerrado'
                        }

                      </small>

                    </div>

                    <div>

                      <button
                        data-edit="${e.id}"
                      >
                        Editar
                      </button>

                      <button
                        class="delete"
                        data-delete="${e.id}"
                      >
                        Excluir
                      </button>

                    </div>

                  </div>
                `
              )
              .join('')
          : '<p>Nenhum evento cadastrado.</p>'
      }

    </div>
  `;
}


/* =========================================================
   ADMIN
========================================================= */

function manager() {
  return `
    <div class="member-top">

      <span class="member-avatar">
        ${escapeHTML(session.name[0])}
      </span>

      <div>

        <strong>
          ${escapeHTML(session.name)}
        </strong>

        <small>
          Administração CONECT
        </small>

      </div>

      <button
        id="logout"
        class="logout"
      >
        Sair
      </button>

    </div>


    <div class="manager-tabs">

      <button
        class="manager-tab active"
        data-manager="events"
      >
        Eventos
      </button>

      <button
        class="manager-tab"
        data-manager="people"
      >
        Pessoas (${Math.max(
          users.length - 1,
          0
        )})
      </button>

      <button
        class="manager-tab"
        data-manager="enrollments"
      >
        Inscrições (${enrollments.length})
      </button>

    </div>


    <div id="manager-content">

      <div class="event-manager">

        <div>
          ${eventForm()}
        </div>

        ${eventList()}

      </div>

    </div>
  `;
}


/* =========================================================
   PAINEL DO USUÁRIO
========================================================= */

function userDashboard() {
  const mine =
    enrollments
      .filter(
        x =>
          x.userId === session.id
      )
      .map(
        x =>
          events.find(
            e =>
              e.id === x.eventId
          )
      )
      .filter(Boolean);

  return `
    <div class="member-dashboard">

      <div class="member-top">

        <span class="member-avatar">
          ${escapeHTML(session.name[0])}
        </span>

        <div>

          <strong>
            ${escapeHTML(session.name)}
          </strong>

          <small>

            ${
              session.role ===
              'teacher'
                ? 'Professor(a)'
                : 'Estudante'
            }

            CONECT

          </small>

        </div>

        <button
          id="logout"
          class="logout"
        >
          Sair
        </button>

      </div>


      <h3>
        Minhas inscrições
      </h3>


      ${
        mine.length
          ? mine
              .map(
                e => `
                  <div class="event-row">

                    <div>

                      <strong>
                        ${escapeHTML(e.title)}
                      </strong>

                      <small>
                        ${dateFormat(e.date)}
                        ·
                        ${escapeHTML(e.place)}
                      </small>

                    </div>

                    <button
                      data-cancel-enrollment="${e.id}"
                    >
                      Cancelar
                    </button>

                  </div>
                `
              )
              .join('')
          : `
            <p class="empty-note">

              Você ainda não está inscrito
              em eventos.

              Escolha uma experiência
              em destaque para participar.

            </p>
          `
      }

    </div>
  `;
}


/* =========================================================
   RENDER ADMIN
========================================================= */

function renderAdmin() {
  const panel = $('#admin-panel');

  if (!panel) return;

  if (!session) {
    panel.innerHTML = `
      <div class="locked">

        <h3>
          Entre para continuar
        </h3>

        <p>

          Faça seu cadastro para se
          inscrever em eventos e
          acompanhar sua jornada CONECT.

        </p>

        <button
          class="button button-dark"
          id="locked-login"
        >
          Entrar ou criar conta →
        </button>

      </div>
    `;

    const loginButton =
      $('#locked-login');

    if (loginButton) {
      loginButton.onclick =
        () => openModal('login');
    }

    return;
  }

  panel.innerHTML =
    adminGuard()
      ? manager()
      : userDashboard();

  if (adminGuard()) {
    bindAdmin();

    panel.onclick =
      adminClick;
  } else {
    bindMember();
  }
}


/* =========================================================
   ADMIN - FUNÇÕES
========================================================= */

function bindAdmin() {
  const form =
    $('#event-form');

  if (form) {
    form.onsubmit = ev => {
      ev.preventDefault();

      const id =
        $('#event-id').value;

      const item = {
        id:
          id || uid(),

        title:
          $('#title')
            .value
            .trim(),

        date:
          $('#date')
            .value,

        place:
          $('#place')
            .value
            .trim(),

        description:
          $('#description')
            .value
            .trim(),

        status:
          $('#status')
            .value,

        featured:
          $('#featured')
            .checked
      };

      if (item.featured) {
        events.forEach(
          e =>
            e.featured = false
        );
      }

      if (id) {
        events =
          events.map(
            e =>
              e.id === id
                ? item
                : e
          );
      } else {
        events.push(item);
      }

      persist();

      renderFeatured();
      renderAdmin();

      toast(
        'Evento salvo com sucesso.'
      );
    };
  }

  const logout =
    $('#logout');

  if (logout) {
    logout.onclick =
      signOut;
  }

  const cancelEdit =
    $('#cancel-edit');

  if (cancelEdit) {
    cancelEdit.onclick =
      () => renderAdmin();
  }
}


/* =========================================================
   CLIQUES DO ADMIN
========================================================= */

function adminClick(ev) {
  const managerButton =
    ev.target.closest(
      '[data-manager]'
    );

  if (managerButton) {
    ev.preventDefault();

    renderManagerSection(
      managerButton.dataset.manager
    );

    return;
  }

  const removeUserButton =
    ev.target.closest(
      '[data-remove-user]'
    );

  if (removeUserButton) {
    const id =
      removeUserButton.dataset
        .removeUser;

    if (
      id &&
      confirm(
        'Remover este cadastro?'
      )
    ) {
      users =
        users.filter(
          u =>
            u.id !== id
        );

      enrollments =
        enrollments.filter(
          x =>
            x.userId !== id
        );

      persist();

      renderPopulation();

      renderManagerSection(
        'people'
      );

      toast(
        'Cadastro removido.'
      );
    }

    return;
  }

  const removeEnrollmentButton =
    ev.target.closest(
      '[data-remove-enrollment]'
    );

  if (removeEnrollmentButton) {
    const id =
      removeEnrollmentButton.dataset
        .removeEnrollment;

    if (
      id &&
      confirm(
        'Cancelar esta inscrição?'
      )
    ) {
      enrollments =
        enrollments.filter(
          x =>
            x.id !== id
        );

      persist();

      renderManagerSection(
        'enrollments'
      );

      toast(
        'Inscrição cancelada.'
      );
    }

    return;
  }

  const deleteButton =
    ev.target.closest(
      '[data-delete]'
    );

  if (deleteButton) {
    const id =
      deleteButton.dataset.delete;

    if (
      id &&
      confirm(
        'Excluir este evento?'
      )
    ) {
      events =
        events.filter(
          e =>
            e.id !== id
        );

      enrollments =
        enrollments.filter(
          x =>
            x.eventId !== id
        );

      persist();

      renderFeatured();
      renderAdmin();

      toast(
        'Evento excluído.'
      );
    }

    return;
  }

  const editButton =
    ev.target.closest(
      '[data-edit]'
    );

  if (editButton) {
    const id =
      editButton.dataset.edit;

    const e =
      events.find(
        x =>
          x.id === id
      );

    if (!e) return;

    const eventId =
      $('#event-id');

    const title =
      $('#title');

    const date =
      $('#date');

    const place =
      $('#place');

    const description =
      $('#description');

    const status =
      $('#status');

    const featured =
      $('#featured');

    const cancel =
      $('#cancel-edit');

    if (eventId)
      eventId.value =
        e.id;

    if (title)
      title.value =
        e.title;

    if (date)
      date.value =
        e.date;

    if (place)
      place.value =
        e.place;

    if (description)
      description.value =
        e.description;

    if (status)
      status.value =
        e.status;

    if (featured)
      featured.checked =
        e.featured;

    if (cancel)
      cancel.hidden =
        false;
  }
}


/* =========================================================
   ABAS DO ADMIN
========================================================= */

function renderManagerSection(tab) {
  const content =
    $('#manager-content');

  if (!content) return;

  document
    .querySelectorAll(
      '.manager-tab'
    )
    .forEach(button => {
      button.classList.toggle(
        'active',
        button.dataset.manager ===
          tab
      );
    });

  if (tab === 'events') {
    content.innerHTML = `
      <div class="event-manager">

        <div>
          ${eventForm()}
        </div>

        ${eventList()}

      </div>
    `;

    bindAdmin();

    return;
  }

  if (tab === 'people') {
    content.innerHTML = `
      <div class="manager-list">

        <h3>
          Cadastros
        </h3>

        ${
          users
            .filter(
              u =>
                u.role !== 'admin'
            )
            .map(
              u => `
                <div class="event-row">

                  <div>

                    <strong>
                      ${escapeHTML(u.name)}
                    </strong>

                    <small>

                      ${escapeHTML(u.email)}
                      ·
                      ${
                        u.role ===
                        'teacher'
                          ? 'Professor(a)'
                          : 'Estudante'
                      }

                    </small>

                  </div>

                  <button
                    class="delete"
                    data-remove-user="${u.id}"
                  >
                    Remover
                  </button>

                </div>
              `
            )
            .join('') ||
          '<p>Nenhum cadastro ainda.</p>'
        }

      </div>
    `;

    return;
  }

  if (tab === 'enrollments') {
    const rows =
      enrollments
        .map(en => ({
          en,

          u:
            users.find(
              u =>
                u.id ===
                en.userId
            ),

          e:
            events.find(
              e =>
                e.id ===
                en.eventId
            )
        }))
        .filter(
          x =>
            x.u &&
            x.e
        );

    content.innerHTML = `
      <div class="manager-list">

        <h3>
          Inscrições
        </h3>

        ${
          rows
            .map(
              x => `
                <div class="event-row">

                  <div>

                    <strong>
                      ${escapeHTML(
                        x.u.name
                      )}
                    </strong>

                    <small>

                      ${escapeHTML(
                        x.e.title
                      )}
                      ·
                      ${dateFormat(
                        x.e.date
                      )}
                      ·
                      ${escapeHTML(
                        x.u.email
                      )}

                    </small>

                  </div>

                  <button
                    class="delete"
                    data-remove-enrollment="${x.en.id}"
                  >
                    Cancelar
                  </button>

                </div>
              `
            )
            .join('') ||
          '<p>Nenhuma inscrição ainda.</p>'
        }

      </div>
    `;
  }
}


/* =========================================================
   ÁREA DO MEMBRO
========================================================= */

function bindMember() {
  const logout =
    $('#logout');

  if (logout) {
    logout.onclick =
      signOut;
  }

  const panel =
    $('#admin-panel');

  if (!panel) return;

  panel.onclick = async e => {
    const button =
      e.target.closest(
        '[data-cancel-enrollment]'
      );

    if (!button) return;

    const eventId =
      button.dataset
        .cancelEnrollment;

    if (!eventId) return;

    const { error } = await supabaseClient
      .from('enrollments')
      .delete()
      .eq('user_id', session.id)
      .eq('event_id', eventId);

    if (error) {
      console.error(
        'Erro ao cancelar inscrição:',
        error
      );

      toast(
        'Não foi possível cancelar a inscrição.'
      );

      return;
    }

    renderFeatured();
    renderAdmin();

    toast(
      'Inscrição cancelada.'
    );
  };
}


/* =========================================================
   SAIR
========================================================= */

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error('Erro ao sair:', error);
    alert('Não foi possível sair da conta.');
    return;
  }

  session = null;
  persist();

  renderHeader();
  renderFeatured();
  renderAdmin();
  renderWhatsAppCommunity();

  toast(
    'Você saiu da sua conta.'
  );
}


/* =========================================================
   LOGIN / CADASTRO
========================================================= */

function openModal(tab) {
  const modal =
    $('#auth-modal');

  if (!modal) return;

  modal.classList.add(
    'open'
  );

  modal.setAttribute(
    'aria-hidden',
    'false'
  );

  switchTab(tab);
}

function closeModal() {
  const modal =
    $('#auth-modal');

  if (!modal) return;

  modal.classList.remove(
    'open'
  );

  modal.setAttribute(
    'aria-hidden',
    'true'
  );
}

function switchTab(tab) {
  document
    .querySelectorAll(
      '.auth-tabs .tab'
    )
    .forEach(x => {
      x.classList.toggle(
        'active',
        x.dataset.tab ===
          tab
      );
    });

  const login =
    $('#login-form');

  const signup =
    $('#signup-form');

  if (login) {
    login.classList.toggle(
      'hidden',
      tab !== 'login'
    );
  }

  if (signup) {
    signup.classList.toggle(
      'hidden',
      tab !== 'signup'
    );
  }
}


/* =========================================================
   MODAL
========================================================= */

function initAuthModal() {
  const authModal =
    $('#auth-modal');

  if (!authModal) return;

  authModal.onclick = e => {
    if (
      e.target ===
      e.currentTarget
    ) {
      closeModal();

      return;
    }

    if (
      e.target.closest(
        '[data-close-modal]'
      )
    ) {
      closeModal();

      return;
    }

    const tabButton =
      e.target.closest(
        '[data-tab]'
      );

    if (tabButton) {
      switchTab(
        tabButton.dataset.tab
      );
    }
  };

  document.addEventListener(
    'keydown',
    e => {
      if (
        e.key ===
        'Escape'
      ) {
        closeModal();
      }
    }
  );
}


/* =========================================================
   LOGIN
========================================================= */

function initLogin() {
  const form = document.querySelector('#login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#login-email')?.value.trim();
    const password = document.querySelector('#login-password')?.value;

    if (!email || !password) {
      alert('Informe seu e-mail e sua senha.');
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Erro no login:', error);
      alert('Não foi possível entrar. Verifique seu e-mail e sua senha.');
      return;
    }

    const user = data.user;

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, name, email, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Erro ao carregar perfil:', profileError);
      alert('Login realizado, mas não foi possível carregar seu perfil.');
      return;
    }

    session = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role
    };

    persist();

    window.location.href = 'portal.html';
  });
}


/* =========================================================
   CADASTRO
========================================================= */

function initSignup() {
  const form = document.querySelector('#signup-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('#signup-name')?.value.trim();
    const email = document.querySelector('#signup-email')?.value.trim();
    const password = document.querySelector('#signup-password')?.value;
    const role = document.querySelector('#signup-role')?.value || 'student';

    if (!name || !email || !password) {
      alert('Preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (error) {
      console.error('Erro no cadastro:', error);
      alert(error.message || 'Não foi possível criar sua conta.');
      return;
    }

    if (!data.user) {
      alert('Não foi possível criar a conta.');
      return;
    }

    alert('Conta criada com sucesso!');

    window.location.reload();
  });
}


/* =========================================================
   CLIQUE NO EVENTO
========================================================= */

function initFeaturedEvent() {
  const featured =
    $('#featured-event');

  if (!featured) return;

  featured.onclick = async e => {
    const button =
      e.target.closest(
        '[data-enroll]'
      );

    if (!button) return;

    const eventId =
      button.dataset.enroll;

    if (!eventId) return;

    if (!session) {
      openModal('login');

      toast(
        'Entre ou crie uma conta para participar.'
      );

      return;
    }

    if (
      enrollments.some(
        x =>
          x.eventId ===
            eventId &&
          x.userId ===
            session.id
      )
    ) {
      return;
    }

    const { error } = await supabaseClient
  .from('enrollments')
  .insert({
    user_id: session.id,
    event_id: eventId
  });

if (error) {
  console.error('Erro ao realizar inscrição:', error);
  toast('Não foi possível realizar a inscrição.');
  return;
}

renderFeatured();
renderAdmin();

toast(
  'Inscrição confirmada! Nos vemos no evento.'
);
  };
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  async () => {
    await syncSupabaseSession();

    await loadEventsFromSupabase();

    persist();

    initMobileMenu();

    initChat();

    initAuthModal();

    initLogin();

    initSignup();

    initFeaturedEvent();

    renderHeader();

    renderPopulation();

    renderFeatured();

    renderAdmin();

    renderWhatsAppCommunity();
  }
);
