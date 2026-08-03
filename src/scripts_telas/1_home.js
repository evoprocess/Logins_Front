import { api, state, shell, bindShell, navigate } from '../main.js';

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};

export async function homeScreen(app) {
  const owner = state.session.user.perfil === 'admin' && state.session.organization.id === 'ORG_0000';
  if (!owner) {
    app.innerHTML = shell(`<div class="hero"><p>Olá,</p><h2>${esc(state.session.user.name)}</h2><p>Você entrou como <strong>${esc(state.session.user.perfil)}</strong>, tipo <strong>${esc(state.session.user.tipo)}</strong>, na organização <strong>${esc(state.session.organization.name)}</strong>.</p></div>`, 'Home');
    bindShell();
    return;
  }

  app.innerHTML = shell(`
    <section class="admin-welcome">
      <div><span>ADMINISTRAÇÃO CENTRAL</span><h2>Painel GateGuard</h2><p>Gerencie organizações, integrações, pagamentos e acessos a partir da ORG_0000.</p></div>
      <div class="admin-identity"><small>Sessão administrativa</small><strong>${esc(state.session.user.name)}</strong><span>ORG_0000 · admin</span></div>
    </section>
    <section class="admin-metrics" aria-label="Resumo administrativo">
      <article><span>Organizações</span><strong id="admin-org-count">—</strong><small>cadastradas no GateGuard</small></article>
      <article><span>Governança</span><strong>Central</strong><small>pagamentos e bloqueios</small></article>
      <article><span>Integrações</span><strong>API</strong><small>credenciais por organização</small></article>
    </section>
    <section class="admin-actions">
      <button data-admin-page="organizations"><span>01</span><div><strong>Gestão de Organizações</strong><small>Cadastrar, configurar API, consultar e excluir organizações.</small></div><b>→</b></button>
      <button data-admin-page="payments"><span>02</span><div><strong>Pagamentos e Planos</strong><small>Administrar mensalidades, vencimentos e serviços adicionais.</small></div><b>→</b></button>
      <button data-admin-page="access"><span>03</span><div><strong>Acessos e Bloqueios</strong><small>Controlar usuários, perfis e situação operacional das organizações.</small></div><b>→</b></button>
    </section>`, 'Administração');
  bindShell();
  app.querySelectorAll('[data-admin-page]').forEach(button => { button.onclick = () => navigate(button.dataset.adminPage); });
  try {
    const data = await api('/api/organizations');
    app.querySelector('#admin-org-count').textContent = data.organizations.filter(organization => organization.id !== 'ORG_0000').length;
  } catch {
    app.querySelector('#admin-org-count').textContent = '!';
  }
}
