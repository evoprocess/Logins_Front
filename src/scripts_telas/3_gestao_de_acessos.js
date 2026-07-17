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
    const data = await api('/api/access/organizations');
    render(app, data.organizations);
  } catch (error) {
    app.querySelector('.panel').innerHTML = `<p class="error">${esc(error.message)}</p>`;
  }
}

function profileOptions(selected) {
  return ['admin', 'gerente', 'supervisor', 'operador']
    .map(profile => `<option ${selected === profile ? 'selected' : ''}>${profile}</option>`).join('');
}

function render(app, organizations) {
  const admin = state.session.user.role === 'admin';
  const organizationOptions = organizations
    .map(org => `<option value="${esc(org.id)}">${esc(org.id)} — ${esc(org.name)}</option>`).join('');
  const addForm = admin ? `
    <form id="add" class="add-form">
      <h2>Adicionar login</h2>
      <select name="organization" required><option value="">Selecione uma organização</option>${organizationOptions}</select>
      <input name="login" placeholder="novo.login" required>
      <select name="profile">${profileOptions('gerente')}</select>
      <button>Adicionar</button>
    </form>` : '';

  const cards = organizations.map(org => {
    const organizationControl = org.id === 'ORG_0000'
      ? '<span class="badge">Administrativa</span>'
      : admin
        ? `<button data-org-status="${esc(org.id)}" data-active="${!org.active}">${org.active ? 'Inativar organização' : 'Ativar organização'}</button>`
        : `<span class="badge">${org.active ? 'Ativa' : 'Inativa'}</span>`;
    const users = Object.entries(org.logins).map(([login, user]) => {
      const protectedAdmin = user.perfil === 'admin';
      const disableProfile = !admin || protectedAdmin;
      return `<div class="user">
        <strong>${esc(login)}</strong>
        <select data-profile="${esc(org.id)}|${esc(login)}" ${disableProfile ? 'disabled' : ''}>${profileOptions(user.perfil)}</select>
        <button data-toggle="${esc(org.id)}|${esc(login)}" data-active="${user.status_ativo_login !== true}">${user.status_ativo_login === true ? 'Inativar' : 'Ativar'}</button>
        ${admin ? `<button class="danger" data-delete="${esc(org.id)}|${esc(login)}">Excluir</button>` : ''}
      </div>`;
    }).join('') || '<p>Nenhum login cadastrado.</p>';
    return `<article class="org"><div class="org-head"><div><h2>${esc(org.name)}</h2><small>${esc(org.id)}</small></div>${organizationControl}</div><div class="table">${users}</div></article>`;
  }).join('');

  app.querySelector('.panel').outerHTML = `<div class="panel">${addForm}<div id="orgs">${cards}</div><p id="feedback"></p></div>`;
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
      const [organization, login] = button.dataset.toggle.split('|');
      act(`/api/access/organizations/${organization}/logins/${encodeURIComponent(login)}`, { active: button.dataset.active === 'true' });
    };
  });
  app.querySelectorAll('[data-delete]').forEach(button => {
    button.onclick = () => {
      const [organization, login] = button.dataset.delete.split('|');
      if (confirm(`Excluir ${login}?`)) act(`/api/access/organizations/${organization}/logins/${encodeURIComponent(login)}`, { remove: true });
    };
  });
  app.querySelectorAll('[data-profile]').forEach(select => {
    select.onchange = () => {
      const [organization, login] = select.dataset.profile.split('|');
      act(`/api/access/organizations/${organization}/logins/${encodeURIComponent(login)}`, { profile: select.value });
    };
  });
  app.querySelectorAll('[data-org-status]').forEach(button => {
    button.onclick = () => act(`/api/access/organizations/${button.dataset.orgStatus}/status`, { active: button.dataset.active === 'true' });
  });

  const add = app.querySelector('#add');
  if (add) {
    const synchronizeProfile = () => {
      const administrative = add.organization.value === 'ORG_0000';
      add.profile.value = administrative ? 'admin' : (add.profile.value === 'admin' ? 'gerente' : add.profile.value);
      [...add.profile.options].forEach(option => { option.disabled = administrative ? option.value !== 'admin' : option.value === 'admin'; });
    };
    add.organization.onchange = synchronizeProfile;
    synchronizeProfile();
    add.onsubmit = event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(add));
      act(`/api/access/organizations/${values.organization}/logins/${encodeURIComponent(values.login.toLowerCase())}`, { profile: values.profile, active: true });
    };
  }
}
