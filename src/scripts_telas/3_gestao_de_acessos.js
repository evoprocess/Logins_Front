import { api, state, shell, bindShell } from '../main.js';

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};

export async function accessScreen(app) {
  app.innerHTML = shell('<div class="panel"><p>Carregando acessos...</p></div>', 'Gestão de Acessos');
  bindShell();
  try {
    const data = await api('/api/access/systems');
    render(app, data.systems);
  } catch (error) {
    app.querySelector('.panel').innerHTML = `<p class="error">${esc(error.message)}</p>`;
  }
}

function profileOptions(selected) {
  return ['admin', 'gerente', 'supervisor', 'operador']
    .map(profile => `<option ${selected === profile ? 'selected' : ''}>${profile}</option>`).join('');
}

function levelOptions(selected = 1) {
  return [1, 2].map(level => `<option value="${level}" ${Number(selected) === level ? 'selected' : ''}>Nível ${level}</option>`).join('');
}

function render(app, systems) {
  const admin = state.session.user.perfil === 'admin';
  const systemOptions = systems
    .map(sis => `<option value="${esc(sis.id)}">${esc(sis.id)} — ${esc(sis.name)}</option>`).join('');
  const addForm = admin ? `
    <form id="add" class="add-form">
      <h2>Adicionar login</h2>
      <select name="system" required><option value="">Selecione um sistema</option>${systemOptions}</select>
      <input name="login" placeholder="novo.login" required>
      <select name="profile">${profileOptions('gerente')}</select>
      <select name="tipo" aria-label="Tipo de acesso">${levelOptions(1)}</select>
      <button>Adicionar</button>
    </form>` : '';

  const cards = systems.map(sis => {
    const systemControl = sis.id === 'SIS_0000'
      ? '<span class="badge">Administrativa</span>'
      : admin
        ? `<button data-sis-status="${esc(sis.id)}" data-active="${!sis.active}">${sis.active ? 'Inativar sistema' : 'Ativar sistema'}</button>`
        : `<span class="badge">${sis.active ? 'Ativa' : 'Inativa'}</span>`;
    const users = Object.entries(sis.logins).map(([login, user]) => {
      const protectedAdmin = user.perfil === 'admin';
      const disableProfile = !admin || protectedAdmin;
      return `<div class="user">
        <strong>${esc(login)}</strong>
        <select data-profile="${esc(sis.id)}|${esc(login)}" ${disableProfile ? 'disabled' : ''}>${profileOptions(user.perfil)}</select>
        <select data-level="${esc(sis.id)}|${esc(login)}" ${!admin ? 'disabled' : ''}>${levelOptions(user.nivel_acesso || (protectedAdmin ? 2 : 1))}</select>
        <button data-toggle="${esc(sis.id)}|${esc(login)}" data-active="${user.status_ativo_login !== true}">${user.status_ativo_login === true ? 'Inativar' : 'Ativar'}</button>
        ${admin ? `<button class="danger" data-delete="${esc(sis.id)}|${esc(login)}">Excluir</button>` : ''}
      </div>`;
    }).join('') || '<p>Nenhum login cadastrado.</p>';
    return `<article class="sis"><div class="sis-head"><div><h2>${esc(sis.name)}</h2><small>${esc(sis.id)}</small></div>${systemControl}</div><div class="table">${users}</div></article>`;
  }).join('');

  app.querySelector('.panel').outerHTML = `<div class="panel">${addForm}<div id="systems">${cards}</div><p id="feedback"></p></div>`;
  bindActions(app);
}

function bindActions(app) {
  const feedback = app.querySelector('#feedback');
  const act = async (path, body) => {
    try {
      await api(path, { method: 'PATCH', body: JSON.stringify(body) });
      await accessScreen(app);
    } catch (error) {
      feedback.textContent = error.message;
      feedback.className = 'error';
    }
  };

  app.querySelectorAll('[data-toggle]').forEach(button => {
    button.onclick = () => {
      const [system, login] = button.dataset.toggle.split('|');
      act(`/api/access/systems/${system}/logins/${encodeURIComponent(login)}`, { active: button.dataset.active === 'true' });
    };
  });
  app.querySelectorAll('[data-delete]').forEach(button => {
    button.onclick = () => {
      const [system, login] = button.dataset.delete.split('|');
      if (confirm(`Excluir ${login}?`)) act(`/api/access/systems/${system}/logins/${encodeURIComponent(login)}`, { remove: true });
    };
  });
  app.querySelectorAll('[data-profile]').forEach(select => {
    select.onchange = () => {
      const [system, login] = select.dataset.profile.split('|');
      act(`/api/access/systems/${system}/logins/${encodeURIComponent(login)}`, { perfil: select.value });
    };
  });
  app.querySelectorAll('[data-level]').forEach(select => {
    select.onchange = () => {
      const [system, login] = select.dataset.level.split('|');
      act(`/api/access/systems/${system}/logins/${encodeURIComponent(login)}`, { tipo: Number(select.value) });
    };
  });
  app.querySelectorAll('[data-sis-status]').forEach(button => {
    button.onclick = () => act(`/api/access/systems/${button.dataset.sisStatus}/status`, { active: button.dataset.active === 'true' });
  });

  const add = app.querySelector('#add');
  if (add) {
    const synchronizeProfile = () => {
      const administrative = add.system.value === 'SIS_0000';
      add.profile.value = administrative ? 'admin' : (add.profile.value === 'admin' ? 'gerente' : add.profile.value);
      [...add.profile.options].forEach(option => { option.disabled = administrative ? option.value !== 'admin' : option.value === 'admin'; });
    };
    add.system.onchange = synchronizeProfile;
    synchronizeProfile();
    add.onsubmit = event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(add));
      act(`/api/access/systems/${values.system}/logins/${encodeURIComponent(values.login.toLowerCase())}`, { perfil: values.profile, tipo: Number(values.tipo), active: true });
    };
  }
}
