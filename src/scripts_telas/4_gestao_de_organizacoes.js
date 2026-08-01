import { api, state, shell, bindShell, API_URL, SYSTEM_NAME, SYSTEM_EMAIL, SYSTEM_URL } from '../main.js';
import '../organizations.css';
import '../integration-key-preview.css';
import { bindDocumentValidation } from '../document-validation.js';
import publicDirectory from '../organizacoes_publicas.json';

const publicOrganizationNames = new Map(
  publicDirectory.floors.flatMap(floor => floor.organizations.map(organization => [organization.id, organization.name]))
);

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};

export async function organizationsScreen(app) {
  if (state.session.organization.id !== 'ORG_0000' || state.session.user.role !== 'admin') return;
  app.innerHTML = shell(`<div class="panel"><div id="registration-status">Verificando configuração...</div><form id="organization-registration" class="organization-form" hidden>
    <fieldset id="organization-fields" disabled>
      <h2 class="form-section-title">Dados da organização</h2><section class="form-section">
      <div class="organization-left-column"><div class="system-fields"><label>Sistema<input name="systemName" value="${esc(SYSTEM_NAME)}" readonly></label><input name="systemEmail" type="hidden" value="${esc(SYSTEM_EMAIL)}"><input name="systemUrl" type="hidden" value="${esc(SYSTEM_URL)}"><label>ID da Organização<input name="organization" readonly></label></div>
      <div class="organization-main-fields"><label>Nome da Organização*<input name="name" required maxlength="120"></label>
        <div class="phone-field"><label>Telefone*<input name="phone" required inputmode="tel"></label><label class="inline-check"><input type="checkbox" name="whatsapp"> Whatsapp</label></div>
      </div></div><div class="document-group">
        <div class="document-type-field"><span>Tipo de documento*</span><div class="document-type-selector" role="radiogroup" aria-label="Tipo de documento"><label><input type="radio" name="documentType" value="CPF" required><span>CPF</span></label><label><input type="radio" name="documentType" value="CNPJ" required checked><span>CNPJ</span></label></div></div>
        <label><span id="organization-document-label">CNPJ*</span><input name="cpfCnpj" required inputmode="numeric"></label>
        <label id="corporate-name-field">Razão social*<input name="corporateName" maxlength="160" required></label>
      </div></section>
      <h2 class="form-section-title">Dados do administrador</h2><section class="form-section">
      <label>Nome do Administrador*<input name="administratorName" required maxlength="120"></label><label>CPF*<input name="administratorCpf" required inputmode="numeric"></label>
      <label>Cargo*<input name="administratorRole" required maxlength="100"></label><label>E-mail administrativo*<input name="adminEmail" type="email" required></label>
      <details><summary>Outros destinatários de e-mail</summary>
        <label>E-mail de acessos<input name="accessEmail" type="email"></label><label>E-mail financeiro<input name="financialEmail" type="email"></label><label>E-mail de comunicados<input name="communicationsEmail" type="email"></label>
      </details>
      <div class="credential-fields"><label>Login<input value="gestor" readonly></label><label>Senha Temporária*<input name="temporaryPassword" readonly required></label></div>
      <div class="registration-actions"><button type="button" id="generate-password">Gerar Senha</button><button type="submit" title="Ao cadastrar a organização o acesso será enviado para os e-mails administrativo e de acessos">Cadastrar Organização</button></div></section>
    </fieldset><p id="registration-feedback" class="error"></p>
  </form>
  <section class="form-section developer-internal-manual">
    <details>
      <summary><strong>Manual interno do cadastro de organizações · ORG_0000</strong></summary>
      <p>Este fluxo é exclusivo dos desenvolvedores/administradores autenticados na <code>ORG_0000</code>.</p>
      <ol>
        <li>O sistema calcula o próximo identificador no formato <code>ORG_XXXX</code>, preservando uma numeração exclusiva de quatro algarismos.</li>
        <li>O Firebase da organização deve estar configurado no Render do backend Gate Guard, serviço <code>Logins_Back</code>, pela variável <code>DADOS_FIREBASE_ORG_XXXX</code>.</li>
        <li>Depois do redeploy, volte a esta tela, preencha o formulário e clique em <strong>Cadastrar Organização</strong>. A criação ainda não está concluída apenas com a configuração do projeto Firebase.</li>
        <li>O backend cria os acessos no Firebase Authentication, grava o administrador no Firestore da organização e cria obrigatoriamente o documento <code>logins_geral/ORG_XXXX</code> no Firestore central. Esse documento libera login, pagamentos, acessos e integrações da organização.</li>
        <li>Em seguida, o backend atualiza automaticamente <code>src/organizacoes_publicas.json</code> no repositório <code>evoprocess/Logins_Front</code>, preenchendo ID, nome, status ativo, sala e URL pública. O commit inicia a publicação normal do frontend.</li>
        <li>Para essa automação, <code>Logins_Back</code> precisa da variável secreta <code>GITHUB_FRONTEND_TOKEN</code>, com permissão de escrita apenas no repositório do frontend. Repositório, branch e caminho ficam nas variáveis <code>GITHUB_FRONTEND_REPOSITORY</code>, <code>GITHUB_FRONTEND_BRANCH</code> e <code>GITHUB_PUBLIC_ORGANIZATIONS_PATH</code>.</li>
        <li>Por fim, o sistema envia o convite de acesso. O cadastro somente é apresentado como concluído depois que todas essas etapas terminam.</li>
      </ol>
      <p><strong>Diagnóstico:</strong> se o fluxo parar em “Publicando a organização no JSON público”, verifique o token do GitHub, a permissão de escrita, a branch configurada e se o workflow de publicação do frontend foi executado.</p>
    </details>
  </section>
  <section id="api-integration" class="api-integration" hidden>
    <div class="integration-heading"><div><span>INTEGRAÇÃO EXTERNA</span><h2>API GateGuard</h2></div><span id="integration-badge" class="badge">Selecione uma organização</span></div>
    <p>Conecte sistemas externos ao controle terceirizado de login, pagamentos e bloqueios do GateGuard.</p>
    <label>Organização<select id="integration-organization"><option value="">Carregando organizações...</option></select></label>
    <div id="integration-details" hidden>
      <div class="integration-endpoint"><small>Endpoint de autenticação</small><code>POST ${esc(API_URL)}/api/integrations/authenticate</code></div>
      <div id="integration-key-preview" class="integration-key-preview" hidden><small>Chave cadastrada</small><code><span>gg_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</span><strong></strong></code><small>Compare os quatro últimos caracteres com a credencial configurada no backend do lojista.</small></div>
      <div class="integration-actions"><button type="button" id="generate-integration-key">Gerar chave</button><button type="button" id="revoke-integration-key" class="danger-button" hidden>Revogar integração</button></div>
      <div id="integration-secret" hidden><strong>Copie a chave agora. Ela será exibida somente uma vez.</strong><div><code></code><button type="button" id="copy-integration-key">Copiar</button></div></div>
      <p id="integration-feedback"></p>
    </div>
  </section>
  <section id="organization-danger" class="organization-danger" hidden>
    <h2>Excluir organização</h2>
    <p><strong>Atenção:</strong> esta ação é irreversível. O cadastro, os acessos e o projeto Firebase da organização serão removidos.</p>
    <div class="deletion-password-row">
      <label>Senha administrativa de exclusão*<input id="delete-password" type="password" autocomplete="current-password" required><span class="show-password"><input id="show-delete-password" type="checkbox"> Exibir senha</span></label>
      <button type="button" id="authorize-deletion" class="danger-button" disabled>Validar senha</button>
    </div>
    <label>Organização a excluir*<select id="delete-organization" required disabled><option value="">Carregando organizações...</option></select></label>
    <div id="deletion-confirmations" hidden>
      <p class="error"><strong>Confirmação necessária:</strong> não será possível desfazer esta operação.</p>
      <label class="inline-check"><input id="confirm-irreversible" type="checkbox"> Confirmo a exclusão definitiva de todos os dados e acessos desta organização.</label>
      <label class="inline-check"><input id="confirm-firebase" type="checkbox"> Confirmo que o projeto Firebase desta organização também será excluído.</label>
    </div>
    <button type="button" id="delete-organization-button" class="danger-button" disabled>Excluir Organização Selecionada</button>
    <p id="deletion-feedback" class="error"></p>
  </section></div>`, 'Gestão de Organizações');
  bindShell();

  try {
    const [readiness, organizationData] = await Promise.all([api('/api/organization-registration/readiness'), api('/api/organizations')]);
    const form = app.querySelector('#organization-registration');
    form.hidden = false; form.organization.value = readiness.id;
    app.querySelector('#registration-status').innerHTML = readiness.configured
      ? `<div class="notice"><strong>Firebase manual da ${esc(readiness.id)} detectado (${esc(readiness.firebase?.projectId || '')}).</strong><p>Finalize o formulário abaixo. Ao clicar em <strong>Cadastrar Organização</strong>, o sistema criará obrigatoriamente <code>${esc(readiness.centralDocumentPath || `logins_geral/${readiness.id}`)}</code> no Firebase central. Sem esse documento, login e integrações retornarão “Organização não encontrada”.</p></div>`
      : `<div class="notice"><strong>Configuração manual necessária para ${esc(readiness.id)}</strong>
          <ol><li>Crie o projeto no Firebase e um aplicativo Web.</li><li>Ative Authentication por e-mail/senha e crie o Firestore.</li><li>Publique as regras abaixo no Firestore.</li><li>Adicione no Render a variável <code>${esc(readiness.envName)}</code> com o JSON do Firebase e faça o redeploy.</li><li>Volte a esta tela e conclua o formulário. Somente essa etapa cria <code>${esc(readiness.centralDocumentPath || `logins_geral/${readiness.id}`)}</code> no Firebase central; não considere a organização criada antes da mensagem final de sucesso.</li></ol>
          <details><summary>Exibir regras do Firestore</summary><pre id="manual-firestore-rules">${esc(readiness.firestoreRules || '')}</pre><button type="button" id="copy-firestore-rules">Copiar regras</button></details>
        </div>`;
    const copyRules = app.querySelector('#copy-firestore-rules');
    if (copyRules) copyRules.onclick = async () => {
      await navigator.clipboard.writeText(readiness.firestoreRules || '');
      copyRules.textContent = 'Regras copiadas';
    };
    const ready = readiness.configured;
    app.querySelector('#organization-fields').disabled = !ready;
    app.querySelector('#generate-password').onclick = async () => { form.temporaryPassword.value = (await api('/api/organization-registration/password')).password; };
    const deleteSelect = app.querySelector('#delete-organization');
    const removable = organizationData.organizations.filter(item => item.id !== 'ORG_0000');
    const integrationSection = app.querySelector('#api-integration');
    const integrationSelect = app.querySelector('#integration-organization');
    const integrationDetails = app.querySelector('#integration-details');
    const integrationBadge = app.querySelector('#integration-badge');
    const integrationFeedback = app.querySelector('#integration-feedback');
    const integrationSecret = app.querySelector('#integration-secret');
    const integrationKeyPreview = app.querySelector('#integration-key-preview');
    const generateKey = app.querySelector('#generate-integration-key');
    const revokeKey = app.querySelector('#revoke-integration-key');
    integrationSelect.innerHTML = '<option value="">Selecione uma organização</option>' + removable.map(item => `<option value="${esc(item.id)}">${esc(item.id)} — ${esc(publicOrganizationNames.get(item.id) || item.name || item.id)}</option>`).join('');
    integrationSection.hidden = false;
    const loadIntegration = async () => {
      const organization = integrationSelect.value;
      integrationDetails.hidden = !organization;
      integrationSecret.hidden = true;
      integrationFeedback.textContent = '';
      if (!organization) { integrationBadge.textContent = 'Selecione uma organização'; return; }
      integrationBadge.textContent = 'Consultando...';
      try {
        const data = await api(`/api/organizations/${encodeURIComponent(organization)}/integration`);
        integrationBadge.textContent = data.enabled ? 'Integração ativa' : 'Integração inativa';
        integrationBadge.classList.toggle('is-inactive', !data.enabled);
        generateKey.textContent = data.enabled ? 'Rotacionar chave' : 'Gerar chave';
        revokeKey.hidden = !data.enabled;
        integrationKeyPreview.hidden = !(data.enabled && data.keySuffix);
        integrationKeyPreview.querySelector('strong').textContent = data.keySuffix || '';
      } catch (error) {
        integrationKeyPreview.hidden = true;
        integrationBadge.textContent = 'Falha na consulta';
        integrationFeedback.textContent = error.message;
        integrationFeedback.className = 'error';
      }
    };
    integrationSelect.onchange = loadIntegration;
    generateKey.onclick = async () => {
      generateKey.disabled = true;
      integrationFeedback.textContent = 'Gerando credencial segura...';
      try {
        const data = await api(`/api/organizations/${encodeURIComponent(integrationSelect.value)}/integration/key`, { method: 'POST' });
        integrationSecret.querySelector('code').textContent = data.apiKey;
        integrationFeedback.textContent = 'Chave criada. Configure-a somente no servidor do sistema externo.';
        integrationFeedback.className = 'notice';
        await loadIntegration();
        integrationSecret.hidden = false;
      } catch (error) {
        integrationFeedback.textContent = error.message;
        integrationFeedback.className = 'error';
      } finally { generateKey.disabled = false; }
    };
    app.querySelector('#copy-integration-key').onclick = async () => {
      await navigator.clipboard.writeText(integrationSecret.querySelector('code').textContent);
      app.querySelector('#copy-integration-key').textContent = 'Copiada';
    };
    revokeKey.onclick = async () => {
      if (!confirm('Revogar a integração desta organização? O sistema externo perderá o acesso imediatamente.')) return;
      try {
        await api(`/api/organizations/${encodeURIComponent(integrationSelect.value)}/integration/key`, { method: 'DELETE' });
        integrationFeedback.textContent = 'Integração revogada.';
        integrationFeedback.className = 'notice';
        await loadIntegration();
      } catch (error) {
        integrationFeedback.textContent = error.message;
        integrationFeedback.className = 'error';
      }
    };
    deleteSelect.innerHTML = '<option value="">Selecione uma organização</option>' + removable.map(item => `<option value="${esc(item.id)}">${esc(item.id)} — ${esc(item.name)}</option>`).join('');
    app.querySelector('#organization-danger').hidden = false;
    const deletePassword = app.querySelector('#delete-password');
    app.querySelector('#show-delete-password').onchange = event => { deletePassword.type = event.target.checked ? 'text' : 'password'; };
    const authorizeDeletion = app.querySelector('#authorize-deletion');
    const confirmations = app.querySelector('#deletion-confirmations');
    const irreversible = app.querySelector('#confirm-irreversible');
    const firebase = app.querySelector('#confirm-firebase');
    const deleteButton = app.querySelector('#delete-organization-button');
    const deletionFeedback = app.querySelector('#deletion-feedback');
    const lockDeletion = () => { confirmations.hidden = true; irreversible.checked = false; firebase.checked = false; deleteButton.disabled = true; };
    deleteSelect.onchange = () => {
      lockDeletion();
      confirmations.hidden = !deleteSelect.value;
      deletionFeedback.textContent = deleteSelect.value ? 'Leia e marque as duas confirmações para liberar a exclusão.' : '';
      deletionFeedback.className = '';
    };
    deletePassword.oninput = () => {
      lockDeletion();
      deleteSelect.value = '';
      deleteSelect.disabled = true;
      authorizeDeletion.disabled = !deletePassword.value;
    };
    authorizeDeletion.onclick = async () => {
      if (!deletePassword.value) { deletionFeedback.textContent = 'Informe a senha administrativa.'; deletionFeedback.className = 'error'; return; }
      deletionFeedback.textContent = 'Validando senha...';
      try {
        await api('/api/organization-deletion/verify', { method: 'POST', body: JSON.stringify({ password: deletePassword.value }) });
        deletePassword.disabled = true;
        authorizeDeletion.disabled = true;
        deleteSelect.disabled = false;
        deletionFeedback.textContent = 'Senha validada. Agora selecione a organização que deseja excluir.';
        deletionFeedback.className = 'notice';
      } catch (error) { lockDeletion(); deleteSelect.disabled = true; deletePassword.disabled = false; authorizeDeletion.disabled = !deletePassword.value; deletionFeedback.textContent = /senha.*incorreta/i.test(error.message) ? 'Senha incorreta.' : error.message; deletionFeedback.className = 'error'; }
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
        deleteSelect.value = ''; deleteSelect.disabled = true; deletePassword.value = ''; deletePassword.disabled = false; authorizeDeletion.disabled = true; lockDeletion();
      } catch (error) { deletionFeedback.textContent = error.message; deletionFeedback.className = 'error'; synchronizeDeletion(); }
    };
    const synchronizeDocumentType = () => {
      const isCnpj = form.documentType.value === 'CNPJ';
      app.querySelector('#organization-document-label').textContent = `${isCnpj ? 'CNPJ' : 'CPF'}*`;
      form.cpfCnpj.placeholder = isCnpj ? '00.000.000/0000-00' : '000.000.000-00';
      form.corporateName.required = isCnpj;
      form.corporateName.disabled = !isCnpj;
      app.querySelector('#corporate-name-field').classList.toggle('is-invisible', !isCnpj);
      if (!isCnpj) form.corporateName.value = '';
      validateOrganizationDocument();
    };
    const validateOrganizationDocument = bindDocumentValidation(form.cpfCnpj, () => form.documentType.value);
    bindDocumentValidation(form.administratorCpf, () => 'CPF');
    form.querySelectorAll('input[name="documentType"]').forEach(input => { input.onchange = synchronizeDocumentType; });
    synchronizeDocumentType();
    form.onsubmit = async event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      values.whatsapp = form.whatsapp.checked;
      const feedback = app.querySelector('#registration-feedback');
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      feedback.textContent = 'Iniciando o cadastro...'; feedback.className = 'registration-progress';
      try {
        const { jobId } = await api('/api/organization-registration/jobs', { method: 'POST', body: JSON.stringify(values) });
        let status;
        do {
          await new Promise(resolve => setTimeout(resolve, 2000));
          status = await api(`/api/organization-registration/jobs/${encodeURIComponent(jobId)}`);
          feedback.innerHTML = `<strong>Criação em andamento</strong><span>${esc(status.message)}</span><small>Este processo pode levar até 15 minutos. Não feche esta página.</small>`;
        } while (status.state === 'processing');
        if (status.state === 'failed') throw new Error(status.error || 'Não foi possível concluir o cadastro.');
        const result = status.result;
        feedback.textContent = `${result.organization} cadastrada. Acesso enviado para ${result.recipients.join(', ')}.`; feedback.className = 'notice';
        form.querySelector('fieldset').disabled = true;
      } catch (error) { feedback.textContent = error.message; feedback.className = 'error'; submit.disabled = false; }
    };
  } catch (error) { app.querySelector('#registration-status').innerHTML = `<p class="error">${esc(error.message)}</p>`; }
}
