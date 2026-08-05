const DB = {
  events: 'connect-fono-events-v2',
  users: 'connect-fono-users-v1',
  enrollments: 'connect-fono-enrollments-v1',
  session: 'connect-fono-session-v1'
};

const defaults = [{
  id: 'fono-experience',
  title: 'Fono Experience 2026',
  date: '2026-10-18',
  place: 'Natal, RN',
  description: 'Um dia inteiro de conhecimento, troca e experiências reais.',
  status: 'scheduled',
  featured: true
}];

const seedAdmin = {
  id: 'admin-connect',
  name: 'Admin CONECT',
  email: 'admin@connectfono.com',
  password: 'connect2026',
  role: 'admin',
  createdAt: '2026-01-01'
};

const $ = s => document.querySelector(s);

const uid = () => crypto.randomUUID();

const get = (key, fallback = []) =>
  JSON.parse(localStorage.getItem(key) || 'null') || fallback;

const put = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

let events = get(DB.events, defaults);
let users = get(DB.users, [seedAdmin]);
let enrollments = get(DB.enrollments, []);
let session = get(DB.session, null);

function persist() {
  put(DB.events, events);
  put(DB.users, users);
  put(DB.enrollments, enrollments);
  put(DB.session, session);
}

const escapeHTML = t =>
  String(t).replace(/[&<>'"]/g, c => ({
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
    e => e.featured && e.status === 'scheduled'
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

function renderHeader() {
  const b = $('#auth-trigger');

  if (!b) return;

  if (session) {
    b.textContent = `Olá, ${session.name.split(' ')[0]} ▾`;

    b.onclick = () => {
      location.hash = 'admin';
      renderAdmin();
    };
  } else {
    b.textContent = 'Entrar / Cadastrar';

    b.onclick = () => {
      openModal('login');
    };
  }
}

function renderPopulation() {
  const members = users.filter(
    u =>
      u.role === 'student' ||
      u.role === 'teacher'
  );

  const count = $('#member-count');
  const avatars = $('#member-avatars');

  if (count) {
    count.textContent = members.length;
  }

  if (avatars) {
    avatars.innerHTML = members
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

function renderFeatured() {
  const e = eventInFocus();
  const holder = $('#featured-event');

  if (!holder) return;

  if (!e) {
    holder.innerHTML = `
      <div class="event-empty">
        <h3>Nenhum evento programado.</h3>
        <p>
          Volte em breve para acompanhar as próximas experiências.
        </p>
      </div>
    `;

    return;
  }

  const enrolled =
    session &&
    enrollments.some(
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

function adminGuard() {
  return session && session.role === 'admin';
}

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
                        ${e.featured ? '☆' : ''}
                      </strong>

                      <small>
                        ${dateFormat(e.date)}
                        ·
                        ${escapeHTML(e.place)}
                        ·
                        ${
                          e.status === 'scheduled'
                            ? 'Programado'
                            : e.status === 'draft'
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
        Pessoas (${Math.max(users.length - 1, 0)})
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

function userDashboard() {
  const mine = enrollments
    .filter(
      x => x.userId === session.id
    )
    .map(
      x =>
        events.find(
          e => e.id === x.eventId
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
              session.role === 'teacher'
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
              Você ainda não está inscrito em eventos.
              Escolha uma experiência em destaque para participar.
            </p>
          `
      }

    </div>
  `;
}

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
          Faça seu cadastro para se inscrever em eventos
          e acompanhar sua jornada CONECT.
        </p>

        <button
          class="button button-dark"
          id="locked-login"
        >
          Entrar ou criar conta →
        </button>

      </div>
    `;

    const loginButton = $('#locked-login');

    if (loginButton) {
      loginButton.onclick = () => {
        openModal('login');
      };
    }

    return;
  }

  panel.innerHTML =
    adminGuard()
      ? manager()
      : userDashboard();

  if (adminGuard()) {
    bindAdmin();
  } else {
    bindMember();
  }
}

function signOut() {
  session = null;

  persist();

  renderHeader();
  renderFeatured();
  renderAdmin();

  toast('Você saiu da sua conta.');
}


/* =========================================================
   ADMIN
   ========================================================= */

function bindAdmin() {
  const form = $('#event-form');

  if (form) {
    form.onsubmit = ev => {
      ev.preventDefault();

      const id = $('#event-id').value;

      const item = {
        id: id || uid(),
        title: $('#title').value.trim(),
        date: $('#date').value,
        place: $('#place').value.trim(),
        description: $('#description').value.trim(),
        status: $('#status').value,
        featured: $('#featured').checked
      };

      if (item.featured) {
        events.forEach(
          e => (e.featured = false)
        );
      }

      if (id) {
        events = events.map(
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

      toast('Evento salvo com sucesso.');
    };
  }

  const logout = $('#logout');

  if (logout) {
    logout.onclick = signOut;
  }

  const panel = $('#admin-panel');

  if (panel) {
    /*
      CORREÇÃO:
      Antes havia addEventListener com { once: true }.
      Agora o painel continua recebendo cliques
      normalmente.
    */
    panel.onclick = adminClick;
  }

  const cancelEdit = $('#cancel-edit');

  if (cancelEdit) {
    cancelEdit.onclick = () => {
      renderAdmin();
    };
  }
}


/* =========================================================
   CLIQUES DO ADMIN
   ========================================================= */

function adminClick(ev) {

  const managerButton =
    ev.target.closest('[data-manager]');

  if (managerButton) {
    const tab =
      managerButton.dataset.manager;

    renderManagerSection(tab);

    return;
  }

  const editButton =
    ev.target.closest('[data-edit]');

  const deleteButton =
    ev.target.closest('[data-delete]');

  if (deleteButton) {

    const id =
      deleteButton.dataset.delete;

    if (
      confirm(
        'Excluir este evento?'
      )
    ) {

      events =
        events.filter(
          e => e.id !== id
        );

      enrollments =
        enrollments.filter(
          x => x.eventId !== id
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

  if (editButton) {

    const id =
      editButton.dataset.edit;

    const e =
      events.find(
        x => x.id === id
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

    if (eventId) {
      eventId.value = e.id;
    }

    if (title) {
      title.value = e.title;
    }

    if (date) {
      date.value = e.date;
    }

    if (place) {
      place.value = e.place;
    }

    if (description) {
      description.value =
        e.description;
    }

    if (status) {
      status.value =
        e.status;
    }

    if (featured) {
      featured.checked =
        e.featured;
    }

    if (cancel) {
      cancel.hidden = false;
    }

    return;
  }
}


/* =========================================================
   ABAS DO ADMIN
   ========================================================= */

function renderManagerSection(tab) {

  const content =
    $('#manager-content');

  if (!content) return;


  /* Atualiza a aba ativa */

  document
    .querySelectorAll(
      '.manager-tab'
    )
    .forEach(button => {

      button.classList.toggle(
        'active',
        button.dataset.manager === tab
      );

    });


  /* =========================
     EVENTOS
     ========================= */

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


  /* =========================
     PESSOAS
     ========================= */

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
                        u.role === 'teacher'
                          ? 'Professor(a)'
                          : 'Estudante'
                      }
                      · desde
                      ${dateFormat(
                        u.createdAt.slice(
                          0,
                          10
                        )
                      )}
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


    /*
      Eventos da lista de pessoas
    */

    content.onclick = e => {

      const removeButton =
        e.target.closest(
          '[data-remove-user]'
        );

      if (!removeButton) return;

      const id =
        removeButton.dataset.removeUser;

      if (
        id &&
        confirm(
          'Remover este cadastro?'
        )
      ) {

        users =
          users.filter(
            u => u.id !== id
          );

        enrollments =
          enrollments.filter(
            x => x.userId !== id
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

    };

    return;
  }


  /* =========================
     INSCRIÇÕES
     ========================= */

  if (tab === 'enrollments') {

    const rows =
      enrollments
        .map(en => ({
          en,

          u:
            users.find(
              u =>
                u.id === en.userId
            ),

          e:
            events.find(
              e =>
                e.id === en.eventId
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


    content.onclick = e => {

      const cancelButton =
        e.target.closest(
          '[data-remove-enrollment]'
        );

      if (!cancelButton) return;

      const id =
        cancelButton.dataset
          .removeEnrollment;

      if (
        id &&
        confirm(
          'Cancelar esta inscrição?'
        )
      ) {

        enrollments =
          enrollments.filter(
            x => x.id !== id
          );

        persist();

        renderManagerSection(
          'enrollments'
        );

        toast(
          'Inscrição cancelada.'
        );
      }

    };

    return;
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

  panel.onclick = e => {

    const button =
      e.target.closest(
        '[data-cancel-enrollment]'
      );

    if (!button) return;

    const eventId =
      button.dataset
        .cancelEnrollment;

    if (eventId) {

      enrollments =
        enrollments.filter(
          x =>
            !(
              x.userId ===
                session.id &&
              x.eventId ===
                eventId
            )
        );

      persist();

      renderFeatured();
      renderAdmin();

      toast(
        'Inscrição cancelada.'
      );
    }

  };
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
    .forEach(x =>
      x.classList.toggle(
        'active',
        x.dataset.tab === tab
      )
    );

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


const authModal =
  $('#auth-modal');

if (authModal) {

  authModal.onclick = e => {

    if (
      e.target ===
        e.currentTarget ||
      e.target.dataset
        .closeModal !==
        undefined
    ) {

      closeModal();
    }

    if (
      e.target.dataset.tab
    ) {

      switchTab(
        e.target.dataset.tab
      );
    }

  };
}


/* =========================================================
   LOGIN
   ========================================================= */

const loginForm =
  $('#login-form');

if (loginForm) {

  loginForm.onsubmit = e => {

    e.preventDefault();

    const email =
      $('#login-email')
        .value
        .trim()
        .toLowerCase();

    const password =
      $('#login-password')
        .value;

    const found =
      users.find(
        u =>
          u.email
            .toLowerCase() ===
            email &&
          u.password ===
            password
      );

    if (!found) {

      $('#login-message')
        .textContent =
        'E-mail ou senha incorretos.';

      return;
    }

    session = {

      id: found.id,

      name: found.name,

      role: found.role,

      email: found.email

    };

    persist();

    closeModal();

    renderHeader();
    renderFeatured();
    renderAdmin();

    toast(
      `Bem-vindo(a), ${
        session.name.split(' ')[0]
      }!`
    );

  };
}


/* =========================================================
   CADASTRO
   ========================================================= */

const signupForm =
  $('#signup-form');

if (signupForm) {

  signupForm.onsubmit = e => {

    e.preventDefault();

    const email =
      $('#signup-email')
        .value
        .trim()
        .toLowerCase();

    if (
      users.some(
        u =>
          u.email
            .toLowerCase() ===
          email
      )
    ) {

      $('#signup-message')
        .textContent =
        'Este e-mail já possui uma conta.';

      return;
    }

    const u = {

      id: uid(),

      name:
        $('#signup-name')
          .value
          .trim(),

      email,

      password:
        $('#signup-password')
          .value,

      role:
        $('#signup-role')
          .value,

      createdAt:
        new Date().toISOString()

    };

    users.push(u);

    session = {

      id: u.id,

      name: u.name,

      role: u.role,

      email: u.email

    };

    persist();

    closeModal();

    renderHeader();
    renderPopulation();
    renderAdmin();

    toast(
      'Sua conta foi criada. Bem-vindo(a)!'
    );

  };
}


/* =========================================================
   EVENTO EM DESTAQUE
   ========================================================= */

const featured =
  $('#featured-event');

if (featured) {

  featured.onclick = e => {

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

    enrollments.push({

      id: uid(),

      eventId,

      userId:
        session.id,

      createdAt:
        new Date().toISOString()

    });

    persist();

    renderFeatured();
    renderAdmin();

    toast(
      'Inscrição confirmada! Nos vemos no evento.'
    );

  };
}


/* =========================================================
   CHAT
   ========================================================= */

const chatToggle =
  $('#chat-toggle');

if (chatToggle) {

  chatToggle.onclick =
    () => {

      const box =
        $('#chat-box');

      if (box) {
        box.classList.add(
          'open'
        );
      }

    };
}

const closeChat =
  $('#close-chat');

if (closeChat) {

  closeChat.onclick =
    () => {

      const box =
        $('#chat-box');

      if (box) {
        box.classList.remove(
          'open'
        );
      }

    };
}

const chatForm =
  $('#chat-form');

if (chatForm) {

  chatForm.onsubmit = e => {

    e.preventDefault();

    const input =
      $('#chat-input');

    if (!input) return;

    const text =
      input.value.trim();

    if (!text) return;

    toast(
      'Recebemos sua mensagem! A CONECT IA responderá em breve.'
    );

    input.value = '';

  };
}


/* =========================================================
   AÇÕES RÁPIDAS
   ========================================================= */

document
  .querySelectorAll(
    '.quick-actions button'
  )
  .forEach(
    b =>
      (b.onclick = () => {

        const text =
          b.textContent
            .toLowerCase();

        if (
          text.includes(
            'eventos'
          )
        ) {

          location.hash =
            'eventos';

        } else if (
          text.includes(
            'comunidade'
          )
        ) {

          openModal(
            'signup'
          );

        }

      })
  );


/* =========================================================
   MENU MOBILE
   ========================================================= */

const menuToggle =
  $('.menu-toggle');

if (menuToggle) {

  menuToggle.onclick =
    () => {

      const nav =
        $('#main-nav');

      if (nav) {

        nav.classList.toggle(
          'open'
        );

      }

    };
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

persist();

renderHeader();
renderPopulation();
renderFeatured();
renderAdmin();
