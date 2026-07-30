import { API_URL, state, navigate } from '../main.js';

export function loginScreen(app) {
  const modal = document.createElement('div');
  modal.className = 'login-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'login-title');
  modal.innerHTML = `
    <div class="login-backdrop" data-close-login></div>
    <section class="login-card">
      <button class="login-close" type="button" data-close-login aria-label="Fechar login">&times;</button>
      <div class="brand"><img src="./imagens/logo.png" alt="Logo"></div>
      <div class="login-heading"><span>ÁREA SEGURA</span><h2 id="login-title">Acesse sua conta</h2><p>Entre com os dados fornecidos pela sua organização.</p></div>
      <form id="login-form">
        <label>ORGANIZAÇÃO<input name="organization" placeholder="ORG_XXXX" required></label>
        <label>LOGIN<input name="login" placeholder="Digite seu login" required></label>
        <div class="password-field">
          <label for="password">SENHA</label>
          <div class="password-row">
            <input id="password" name="password" type="password" placeholder="Digite sua senha" minlength="6" required>
            <label class="check" for="show"><input id="show" type="checkbox"> Exibir senha</label>
          </div>
        </div>
        <p id="error" class="error" role="alert"></p>
        <p id="login-status" class="login-status" aria-live="polite"></p>
        <button type="submit"><span class="button-text">ENTRAR</span><span class="login-spinner" aria-hidden="true"></span></button>
      </form>
    </section>`;
  app.appendChild(modal);

  const form = modal.querySelector('#login-form');
  const close = () => {
    document.removeEventListener('keydown', onKeydown);
    modal.remove();
  };
  const onKeydown = event => { if (event.key === 'Escape') close(); };
  modal.querySelectorAll('[data-close-login]').forEach(element => { element.onclick = close; });
  document.addEventListener('keydown', onKeydown);

  let remembered = {};
  try { remembered = JSON.parse(localStorage.getItem('remembered_login') || '{}'); }
  catch { localStorage.removeItem('remembered_login'); }
  form.organization.value = String(remembered.organization || '');
  form.login.value = String(remembered.login || '');
  const markRemembered = input => {
    const savedValue = String(remembered[input.name] || '');
    input.classList.toggle('is-remembered', Boolean(savedValue) && input.value === savedValue);
  };
  markRemembered(form.organization);
  markRemembered(form.login);
  form.organization.oninput = event => {
    event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    markRemembered(event.target);
  };
  form.login.oninput = event => markRemembered(event.target);
  modal.querySelector('#show').onchange = event => { form.password.type = event.target.checked ? 'text' : 'password'; };
  form.onsubmit = async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const buttonText = button.querySelector('.button-text');
    const status = modal.querySelector('#login-status');
    modal.querySelector('#error').textContent = '';
    button.disabled = true;
    button.classList.add('is-loading');
    button.setAttribute('aria-busy', 'true');
    buttonText.textContent = 'ENTRANDO';
    status.textContent = 'Validando acesso...';
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Falha ao entrar.');
      localStorage.setItem('remembered_login', JSON.stringify({ organization: form.organization.value, login: form.login.value }));
      state.token = data.token;
      state.session = data;
      sessionStorage.setItem('login_session', data.token);
      sessionStorage.setItem('login_data', JSON.stringify(data));
      document.removeEventListener('keydown', onKeydown);
      navigate('home');
    } catch (error) {
      modal.querySelector('#error').textContent = error.message;
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
      button.removeAttribute('aria-busy');
      buttonText.textContent = 'ENTRAR';
      status.textContent = '';
    }
  };
  setTimeout(() => form.organization.focus(), 0);
}
