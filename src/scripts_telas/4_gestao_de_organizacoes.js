import { api, state, shell, bindShell, SYSTEM_NAME, SYSTEM_EMAIL } from '../main.js';
import '../organizations.css';

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};

export async function organizationsScreen(app) {
  if (state.session.organization.id !== 'ORG_0000' || state.session.user.role !== 'admin') return;
  app.innerHTML = shell(`<div class="panel"><div id="registration-status">Verificando configuração...</div><form id="organization-registration" class="organization-form" hidden>
    <h2>Provisionamento automático</h2><p>Ao cadastrar, o sistema criará e configurará o projeto Firebase, Firestore, regras, Authentication, aplicação Web e variável no Render.</p>
    <label>Variável que será criada<input name="envName" readonly></label>
    <div class="firebase-checks">
      <label><input type="checkbox" name="firestoreCreated"> Firestore criado</label><label><input type="checkbox" name="rulesCreated"> Regras publicadas</label>
      <label><input type="checkbox" name="authCreated"> Authentication habilitado</label><label><input type="checkbox" name="webAppCreated"> Aplicação Web criada</label>
    </div>
    <fieldset id="organization-fields" disabled>
      <h2>Dados da organização</h2>
      <label>Sistema<input name="systemName" value="${esc(SYSTEM_NAME)}" readonly></label><input name="systemEmail" type="hidden" value="${esc(SYSTEM_EMAIL)}"><label>ID da Organização<input name="organization" readonly></label>
      <label>Nome da Organização*<input name="name" required maxlength="120"></label><label>CPF/CNPJ*<input name="cpfCnpj" required></label>
      <label>Razão social<input name="corporateName" maxlength="160"></label><label>Telefone*<input name="phone" required inputmode="tel"></label>
      <label class="inline-check"><input type="checkbox" name="whatsapp"> Este telefone possui WhatsApp</label><label>Link do sistema*<input name="systemUrl" type="url" required placeholder="https://sistema.com.br/organizacao"></label>
      <h2>Dados do administrador</h2>
      <label>Nome do Administrador*<input name="administratorName" required maxlength="120"></label><label>CPF<input name="administratorCpf"></label>
      <label>Cargo*<input name="administratorRole" required maxlength="100"></label><label>E-mail administrativo*<input name="adminEmail" type="email" required></label>
      <details><summary>Outros destinatários de e-mail</summary>
        <label>E-mail de acessos<input name="accessEmail" type="email"></label><label>E-mail financeiro<input name="financialEmail" type="email"></label><label>E-mail de comunicados<input name="communicationsEmail" type="email"></label>
      </details>
      <label>Login<input value="gestor" readonly></label><label>E-mail interno do Auth<input name="authEmail" readonly></label>
      <label>Senha temporária*<div class="password-generator"><input name="temporaryPassword" readonly required><button type="button" id="generate-password">Gerar senha</button></div></label>
      <button type="submit">Cadastrar organização e enviar acesso</button>
    </fieldset><p id="registration-feedback" class="error"></p>
  </form></div>`, 'Cadastro de Organizações');
  bindShell();

  try {
    const readiness = await api('/api/organization-registration/readiness');
    const form = app.querySelector('#organization-registration');
    form.hidden = false; form.organization.value = readiness.id; form.envName.value = readiness.envName;
    form.authEmail.value = `${readiness.id.toLowerCase()}-gestor@sislogin.com.br`;
    app.querySelector('#registration-status').innerHTML = readiness.configured
      ? `<p class="notice">Configuração ${esc(readiness.envName)} já detectada.</p>`
      : readiness.automaticProvisioning
        ? `<p class="notice">Provisionador pronto. O projeto Firebase de ${esc(readiness.id)} será criado automaticamente.</p>`
        : readiness.oauthAvailable
          ? '<p class="notice">Credenciais detectadas. <button type="button" id="connect-google">Conectar Google Cloud</button></p>'
          : '<p class="error">O provisionador Google Cloud/Render ainda não foi configurado no backend.</p>';
    const connect = app.querySelector('#connect-google');
    if (connect) connect.onclick = async () => { const result = await api('/api/google/oauth/start'); window.open(result.url, 'google-cloud-oauth', 'width=620,height=760'); };
    const checks = [...form.querySelectorAll('.firebase-checks input')];
    if (readiness.automaticProvisioning || readiness.configured) checks.forEach(item => { item.checked = true; item.disabled = true; });
    const ready = readiness.configured || readiness.automaticProvisioning;
    app.querySelector('#organization-fields').disabled = !ready;
    app.querySelector('#generate-password').onclick = async () => { form.temporaryPassword.value = (await api('/api/organization-registration/password')).password; };
    form.onsubmit = async event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      for (const name of ['firestoreCreated', 'rulesCreated', 'authCreated', 'webAppCreated', 'whatsapp']) values[name] = form[name].checked;
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
