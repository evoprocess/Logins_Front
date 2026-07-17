import { api, state, shell, bindShell } from '../main.js';

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};

export async function paymentsScreen(app) {
  const admin = state.session.user.role === 'admin';
  const organizationField = admin
    ? '<select name="organization" id="payment-organization" required><option value="">Carregando organizações...</option></select>'
    : `<div class="organization-fixed"><small>Organização</small><strong>${esc(state.session.organization.id)}</strong></div>`;

  app.innerHTML = shell(`
    <div class="panel">
      <form id="payment" class="add-form">
        <h2>Nova cobrança</h2>
        ${organizationField}
        <input name="name" placeholder="Cliente" required>
        <input name="cpfCnpj" placeholder="CPF/CNPJ" required>
        <input name="email" type="email" placeholder="E-mail">
        <input name="value" type="number" min="5" step=".01" placeholder="Valor" required>
        <select name="billingType">
          <option value="PIX">Pix</option><option value="BOLETO">Boleto</option><option value="CREDIT_CARD">Cartão</option>
        </select>
        <input name="dueDate" type="date" required>
        <input name="expiresAt" type="datetime-local" required>
        <button>Criar cobrança</button>
      </form>
      <p id="pay-error" class="error"></p>
      <div id="payments">Carregando...</div>
    </div>`, 'Sistema de Pagamento');
  bindShell();

  const form = app.querySelector('#payment');
  const future = new Date(Date.now() + 7 * 86400000);
  form.dueDate.value = future.toISOString().slice(0, 10);
  form.expiresAt.value = future.toISOString().slice(0, 16);

  if (admin) {
    try {
      const data = await api('/api/organizations');
      form.organization.innerHTML = '<option value="">Selecione uma organização</option>'
        + data.organizations.map(org => `<option value="${esc(org.id)}">${esc(org.id)} — ${esc(org.name)}${org.id === 'ORG_0000' ? ' (teste sandbox)' : ''}</option>`).join('');
    } catch (error) {
      form.organization.innerHTML = '<option value="">Não foi possível carregar</option>';
      app.querySelector('#pay-error').textContent = error.message;
    }
  }

  form.onsubmit = async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      const body = Object.fromEntries(new FormData(form));
      body.value = Number(body.value);
      body.expiresAt = new Date(body.expiresAt).toISOString();
      await api('/api/payments', { method: 'POST', body: JSON.stringify(body) });
      await paymentsScreen(app);
    } catch (error) {
      app.querySelector('#pay-error').textContent = error.message;
      button.disabled = false;
    }
  };

  try {
    const data = await api('/api/payments');
    const rows = data.payments?.data || [];
    app.querySelector('#payments').innerHTML = `<h2>Cobranças recentes</h2>${rows.map(payment => `
      <div class="user"><strong>${esc(payment.externalReference)}</strong><span>${esc(payment.dueDate)}</span>
      <span>R$ ${Number(payment.value || 0).toFixed(2).replace('.', ',')}</span><span class="badge">${esc(payment.status)}</span></div>`).join('') || '<p>Nenhuma cobrança encontrada.</p>'}`;
  } catch (error) {
    app.querySelector('#payments').innerHTML = `<p class="error">${esc(error.message)}</p>`;
  }
}
