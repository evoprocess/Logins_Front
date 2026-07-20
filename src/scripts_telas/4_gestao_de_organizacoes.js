import { api, state, shell, bindShell, SYSTEM_NAME, SYSTEM_EMAIL, SYSTEM_URL } from '../main.js';
import '../organizations.css';

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};

export async function organizationsScreen(app) {
  if (state.session.organization.id !== 'ORG_0000' || state.session.user.role !== 'admin') return;
  app.innerHTML = shell(`<div class="panel"><div id="registration-status">Verificando configuração...</div><form id="organization-registration" class="organization-form" hidden>
    <fieldset id="organization-fields" disabled>
      <h2>Dados da organização</h2>
      <label>Sistema<input name="systemName" value="${esc(SYSTEM_NAME)}" readonly></label><input name="systemEmail" type="hidden" value="${esc(SYSTEM_EMAIL)}"><input name="systemUrl" type="hidden" value="${esc(SYSTEM_URL)}"><label>ID da Organização<input name="organization" readonly></label>
      <label>Nome da Organização*<input name="name" required maxlength="120"></label><label>CPF/CNPJ*<input name="cpfCnpj" required></label>
      <label>Razão social* (para CNPJ)<input name="corporateName" maxlength="160"></label><div class="phone-field"><label>Telefone*<input name="phone" required inputmode="tel"></label><label class="inline-check"><input type="checkbox" name="whatsapp"> Este telefone possui WhatsApp</label></div>
      <h2>Dados do administrador</h2>
      <label>Nome do Administrador*<input name="administratorName" required maxlength="120"></label><label>CPF*<input name="administratorCpf" required inputmode="numeric"></label>
      <label>Cargo*<input name="administratorRole" required maxlength="100"></label><label>E-mail administrativo*<input name="adminEmail" type="email" required></label>
      <details><summary>Outros destinatários de e-mail</summary>
        <label>E-mail de acessos<input name="accessEmail" type="email"></label><label>E-mail financeiro<input name="financialEmail" type="email"></label><label>E-mail de comunicados<input name="communicationsEmail" type="email"></label>
      </details>
      <label>Login<input value="gestor" readonly></label>
      <label>Senha temporária*<div class="password-generator"><input name="temporaryPassword" readonly required><button type="button" id="generate-password">Gerar senha</button></div></label>
      <button type="submit">Cadastrar organização e enviar acesso</button>
    </fieldset><p id="registration-feedback" class="error"></p>
  </form>
  <section class="organization-danger">
    <h2>Excluir organização</h2>
    <p><strong>Atenção:</strong> esta ação é irreversível. O cadastro, os acessos e o projeto Firebase da organização serão removidos.</p>
    <label>Organização a excluir*<select id="delete-organization" required><option value="">Carregando organizações...</option></select></label>
    <label>Senha administrativa de exclusão*<input id="delete-password" type="password" autocomplete="current-password" required disabled></label>
    <button type="button" id="authorize-deletion" class="danger-button" disabled>Validar senha para continuar</button>
    <div id="deletion-confirmations" hidden>
      <p class="error"><strong>Confirmação necessária:</strong> não será possível desfazer esta operação.</p>
      <label class="inline-check"><input id="confirm-irreversible" type="checkbox"> Confirmo a exclusão definitiva de todos os dados e acessos desta organização.</label>
      <label class="inline-check"><input id="confirm-firebase" type="checkbox"> Confirmo que o projeto Firebase desta organização também será excluído.</label>
      <button type="button" id="delete-organization-button" class="danger-button" disabled>Excluir organização definitivamente</button>
    </div>
    <p id="deletion-feedback" class="error"></p>
  </section></div>`, 'Cadastro de Organizações');
  bindShell();

  try {
    const [readiness, organizationData] = await Promise.all([api('/api/organization-registration/readiness'), api('/api/organizations')]);
    const form = app.querySelector('#organization-registration');
    form.hidden = false; form.organization.value = readiness.id;
    app.querySelector('#registration-status').innerHTML = readiness.configured || readiness.automaticProvisioning
      ? ''
        : readiness.oauthAvailable
          ? '<p class="notice">Credenciais detectadas. <button type="button" id="connect-google">Conectar Google Cloud</button></p>'
          : '<p class="error">O provisionador Google Cloud/Render ainda não foi configurado no backend.</p>';
    const connect = app.querySelector('#connect-google');
    if (connect) connect.onclick = async () => { const result = await api('/api/google/oauth/start'); window.open(result.url, 'google-cloud-oauth', 'width=620,height=760'); };
    const ready = readiness.configured || readiness.automaticProvisioning;
    app.querySelector('#organization-fields').disabled = !ready;
    app.querySelector('#generate-password').onclick = async () => { form.temporaryPassword.value = (await api('/api/organization-registration/password')).password; };
    const deleteSelect = app.querySelector('#delete-organization');
    const removable = organizationData.organizations.filter(item => item.id !== 'ORG_0000');
    deleteSelect.innerHTML = '<option value="">Selecione uma organização</option>' + removable.map(item => `<option value="${esc(item.id)}">${esc(item.id)} — ${esc(item.name)}</option>`).join('');
    const deletePassword = app.querySelector('#delete-password');
    const authorizeDeletion = app.querySelector('#authorize-deletion');
    const confirmations = app.querySelector('#deletion-confirmations');
    const irreversible = app.querySelector('#confirm-irreversible');
    const firebase = app.querySelector('#confirm-firebase');
    const deleteButton = app.querySelector('#delete-organization-button');
    const deletionFeedback = app.querySelector('#deletion-feedback');
    const lockDeletion = () => { confirmations.hidden = true; irreversible.checked = false; firebase.checked = false; deleteButton.disabled = true; };
    deleteSelect.onchange = () => {
      lockDeletion();
      deletePassword.value = '';
      deletePassword.disabled = !deleteSelect.value;
      authorizeDeletion.disabled = true;
      deletionFeedback.textContent = deleteSelect.value ? 'Informe a senha administrativa para continuar.' : '';
      deletionFeedback.className = '';
      if (deleteSelect.value) deletePassword.focus();
    };
    deletePassword.oninput = () => { lockDeletion(); authorizeDeletion.disabled = !deletePassword.value; };
    authorizeDeletion.onclick = async () => {
      if (!deleteSelect.value || !deletePassword.value) { deletionFeedback.textContent = 'Selecione a organização e informe a senha administrativa.'; return; }
      deletionFeedback.textContent = 'Validando senha...';
      try {
        await api('/api/organization-deletion/verify', { method: 'POST', body: JSON.stringify({ password: deletePassword.value }) });
        deleteSelect.disabled = true;
        deletePassword.disabled = true;
        authorizeDeletion.disabled = true;
        confirmations.hidden = false;
        deletionFeedback.textContent = 'Senha validada. Leia e marque as duas confirmações para liberar a exclusão.';
        deletionFeedback.className = 'notice';
      } catch (error) { lockDeletion(); deleteSelect.disabled = false; deletePassword.disabled = false; authorizeDeletion.disabled = !deletePassword.value; deletionFeedback.textContent = error.message; deletionFeedback.className = 'error'; }
    };
    const synchronizeDeletion = () => { deleteButton.disabled = !(irreversible.checked && firebase.checked); };
    irreversible.onchange = synchronizeDeletion;
    firebase.onchange = synchronizeDeletion;
    deleteButton.onclick = async () => {
      const organization = deleteSelect.value;
      deleteButton.disabled = true;
      deletionFeedback.textContent = `Excluindo ${organization} e seu projeto Firebase. Não feche esta página...`; deletionFeedback.className = '';
      try {
        const result = await api(`/api/organizations/${encodeURIComponent(organization)}`, { method: 'DELETE', body: JSON.stringify({ password: deletePassword.value, confirmOrganization: organization, confirmIrreversible: irreversible.checked, confirmFirebase: firebase.checked }) });
        deletionFeedback.textContent = `${result.organization} e o projeto Firebase ${result.projectId} foram excluídos.`; deletionFeedback.className = 'notice';
        deleteSelect.querySelector(`option[value="${CSS.escape(organization)}"]`)?.remove();
        deleteSelect.value = ''; deleteSelect.disabled = false; deletePassword.value = ''; deletePassword.disabled = true; authorizeDeletion.disabled = true; lockDeletion();
      } catch (error) { deletionFeedback.textContent = error.message; deletionFeedback.className = 'error'; synchronizeDeletion(); }
    };
    const synchronizeCorporateName = () => { form.corporateName.required = form.cpfCnpj.value.replace(/\D/g, '').length > 11; };
    form.cpfCnpj.oninput = synchronizeCorporateName;
    form.onsubmit = async event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      values.whatsapp = form.whatsapp.checked;
      const feedback = app.querySelector('#registration-feedback');
      feedback.textContent = 'Cadastrando organização...'; feedback.className = '';
      try {
        const result = await api('/api/organization-registration', { method: 'POST', body: JSON.stringify(values) });
        feedback.textContent = `${result.organization} cadastrada. Acesso enviado para ${result.recipients.join(', ')}.`; feedback.className = 'notice';
        form.querySelector('fieldset').disabled = true;
      } catch (error) { feedback.textContent = error.message; feedback.className = 'error'; }
    };
  } catch (error) { app.querySelector('#registration-status').innerHTML = `<p class="error">${esc(error.message)}</p>`; }
}
