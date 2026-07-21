import { api, state, shell, bindShell } from '../main.js';
import '../payments.css';
import { bindDocumentValidation } from '../document-validation.js';

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};
const money = value => Number(value || 0).toFixed(2).replace('.', ',');
const payable = new Set(['PENDING', 'OVERDUE', 'DUNNING_REQUESTED', 'AWAITING_RISK_ANALYSIS']);

function bindCheckout(app) {
  app.querySelectorAll('[data-checkout]').forEach(button => {
    button.onclick = async () => {
      const box = app.querySelector('#payment-checkout');
      button.disabled = true;
      box.hidden = false;
      box.innerHTML = '<p>Gerando dados para pagamento...</p>';
      try {
        const checkout = await api(`/api/payments/${encodeURIComponent(button.dataset.checkout)}/checkout`);
        const pix = checkout.pix;
        box.innerHTML = `<button type="button" class="checkout-close" aria-label="Fechar">×</button>
          <h2>Pagar fatura</h2><p><strong>${esc(checkout.organization)}</strong> — R$ ${money(checkout.value)}</p>
          ${pix?.encodedImage ? `<img class="pix-qr" src="data:image/png;base64,${esc(pix.encodedImage)}" alt="QR Code Pix">` : ''}
          ${pix?.payload ? `<label>Pix Copia e Cola</label><textarea readonly>${esc(pix.payload)}</textarea><button type="button" data-copy-pix>Copiar código Pix</button>` : ''}
          ${checkout.invoiceUrl ? `<a class="payment-link" href="${esc(checkout.invoiceUrl)}" target="_blank" rel="noopener noreferrer">Outros métodos de pagamento</a>` : ''}`;
        box.querySelector('.checkout-close').onclick = () => { box.hidden = true; };
        const copy = box.querySelector('[data-copy-pix]');
        if (copy) copy.onclick = async () => { await navigator.clipboard.writeText(pix.payload); copy.textContent = 'Código copiado'; };
      } catch (error) {
        box.innerHTML = `<button type="button" class="checkout-close" aria-label="Fechar">×</button><p class="error">${esc(error.message)}</p>`;
        box.querySelector('.checkout-close').onclick = () => { box.hidden = true; };
      } finally { button.disabled = false; }
    };
  });
}

export async function paymentsScreen(app) {
  const administrator = state.session.user.role === 'admin' && state.session.organization.id === 'ORG_0000';
  app.innerHTML = shell(`<div class="panel">
    ${administrator ? `<form id="plan-form" class="add-form">
      <h2 id="plan-form-title">Cadastrar plano mensal</h2>
      <select name="organization" required><option value="">Carregando organizações...</option></select>
      <input name="name" placeholder="Cliente" required><input name="cpfCnpj" placeholder="CPF/CNPJ" required>
      <input name="email" type="email" placeholder="E-mail"><input name="value" type="number" min="5" step=".01" placeholder="Mensalidade" required>
      <input name="nextDueDate" type="date" required><button>Salvar plano</button><button type="button" id="cancel-edit" hidden>Cancelar edição</button>
    </form><form id="extra-form" class="add-form">
      <h2>Adicionar serviço extra</h2><select name="organization" required><option value="">Carregando organizações...</option></select>
      <input name="name" placeholder="Cliente" required><input name="cpfCnpj" placeholder="CPF/CNPJ" required><input name="email" type="email" placeholder="E-mail">
      <input name="serviceDescription" placeholder="Descrição do serviço" required><input name="value" type="number" min="5" step=".01" placeholder="Valor único" required>
      <input name="dueDate" type="date" required><button>Gerar fatura avulsa</button>
    </form>` : '<div class="notice">Aqui você acompanha seu plano mensal e paga as faturas disponíveis.</div>'}
    <p id="pay-error" class="error"></p><div id="plans">Carregando...</div><div id="payment-checkout" class="payment-checkout" hidden></div>
  </div>`, 'Sistema de Pagamento');
  bindShell();

  const form = app.querySelector('#plan-form');
  if (form) {
    const extraForm = app.querySelector('#extra-form');
    bindDocumentValidation(form.cpfCnpj);
    bindDocumentValidation(extraForm.cpfCnpj);
    form.nextDueDate.value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    extraForm.dueDate.value = form.nextDueDate.value;
    try {
      const data = await api('/api/organizations');
      const options = '<option value="">Selecione uma organização</option>' + data.organizations.filter(org => org.id !== 'ORG_0000').map(org => `<option value="${esc(org.id)}">${esc(org.id)} — ${esc(org.name)}</option>`).join('');
      form.organization.innerHTML = options; extraForm.organization.innerHTML = options;
    } catch (error) { app.querySelector('#pay-error').textContent = error.message; }
    form.onsubmit = async event => {
      event.preventDefault();
      const body = Object.fromEntries(new FormData(form));
      body.organization = form.organization.value;
      body.value = Number(body.value);
      const id = form.dataset.planId;
      try {
        await api(id ? `/api/payments/plans/${encodeURIComponent(id)}` : '/api/payments', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
        await paymentsScreen(app);
      } catch (error) { app.querySelector('#pay-error').textContent = error.message; }
    };
    extraForm.onsubmit = async event => {
      event.preventDefault();
      const body = Object.fromEntries(new FormData(extraForm));
      body.value = Number(body.value); body.billingType = 'UNDEFINED'; body.expiresAt = `${body.dueDate}T23:59:59.000Z`;
      try { await api('/api/payments/extras', { method: 'POST', body: JSON.stringify(body) }); await paymentsScreen(app); }
      catch (error) { app.querySelector('#pay-error').textContent = error.message; }
    };
    app.querySelector('#cancel-edit').onclick = () => paymentsScreen(app);
  }

  try {
    const data = await api('/api/payments');
    const plans = data.plans || [];
    const extras = data.extras || [];
    app.querySelector('#plans').innerHTML = `${plans.map(plan => `<section class="org">
      <div class="org-head"><div><h2>${esc(plan.externalReference)}</h2><p>Plano mensal — R$ ${money(plan.value)} | Próximo vencimento: ${esc(plan.nextDueDate || '—')} | ${esc(plan.status)}</p></div>
      ${administrator ? `<button type="button" data-edit-plan="${esc(plan.id)}" data-value="${esc(plan.value)}" data-due="${esc(plan.nextDueDate)}">Editar plano</button>` : ''}</div>
      <div class="table"><h3>Faturas</h3>${(plan.payments?.data || []).map(payment => `<div class="user"><strong>${esc(payment.dueDate)}</strong><span>R$ ${money(payment.value)}</span><span class="badge">${esc(payment.status)}</span>${payable.has(payment.status) ? `<button type="button" data-checkout="${esc(payment.id)}">Pagar agora</button>` : ''}</div>`).join('') || '<p>Nenhuma fatura gerada ainda.</p>'}</div>
    </section>`).join('') || '<p>Nenhum plano mensal cadastrado.</p>'}
    <section class="org"><h2>Serviços extras</h2>${extras.map(payment => `<div class="user"><strong>${esc(String(payment.description || '').replace('SERVIÇO EXTRA — ', ''))}</strong><span>${esc(payment.externalReference)}</span><span>Vencimento: ${esc(payment.dueDate)}</span><span>R$ ${money(payment.value)}</span><span class="badge">${esc(payment.status)}</span>${payable.has(payment.status) ? `<button type="button" data-checkout="${esc(payment.id)}">Pagar agora</button>` : ''}</div>`).join('') || '<p>Nenhum serviço extra faturado.</p>'}</section>`;
    bindCheckout(app);
    if (form) app.querySelectorAll('[data-edit-plan]').forEach(button => {
      button.onclick = () => {
        form.dataset.planId = button.dataset.editPlan;
        form.organization.value = button.closest('.org').querySelector('h2').textContent;
        form.organization.disabled = true;
        form.name.required = false; form.cpfCnpj.required = false;
        form.value.value = button.dataset.value; form.nextDueDate.value = button.dataset.due;
        app.querySelector('#plan-form-title').textContent = 'Editar plano mensal';
        app.querySelector('#cancel-edit').hidden = false;
        form.scrollIntoView({ behavior: 'smooth' });
      };
    });
  } catch (error) { app.querySelector('#plans').innerHTML = `<p class="error">${esc(error.message)}</p>`; }
}
