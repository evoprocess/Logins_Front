import { API_URL, state, navigate } from '../main.js';

export function loginScreen(app) {
  app.innerHTML = `
    <div class="login-page">
      <section class="login-card">
        <div class="brand"><img src="./imagens/logo.png" alt="Logo"></div>
        <form id="login-form">
          <label>ORGANIZAÇÃO
            <select name="organization" required>
              <option value="">Carregando organizações...</option>
            </select>
          </label>
          <label>LOGIN
            <input name="login" placeholder="Digite seu login" required>
          </label>
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
      </section>
    </div>`;

  const form = app.querySelector('#login-form');
  let remembered = {};
  try { remembered = JSON.parse(localStorage.getItem('remembered_login') || '{}'); }
  catch { localStorage.removeItem('remembered_login'); }
  form.login.value = String(remembered.login || '');
  const markRemembered = input => {
    const savedValue = String(remembered[input.name] || '');
    input.classList.toggle('is-remembered', Boolean(savedValue) && input.value === savedValue);
  };
  markRemembered(form.login);
  form.login.oninput = event => markRemembered(event.target);
  fetch(`${API_URL}/api/organizations`)
    .then(response => response.ok ? response.json() : Promise.reject(new Error()))
    .then(data => {
      form.organization.innerHTML = '<option value="">Selecione uma organização</option>'
        + (data.organizations || []).map(org => `<option value="${org.id}">${org.id} — ${org.name}</option>`).join('');
      form.organization.value = String(remembered.organization || '');
      form.organization.classList.toggle('is-remembered', Boolean(form.organization.value));
    })
    .catch(() => {
      form.organization.innerHTML = '<option value="">Não foi possível carregar</option>';
      app.querySelector('#error').textContent = 'Não foi possível carregar as organizações.';
    });
  form.organization.onchange = () => {
    form.organization.classList.toggle('is-remembered', form.organization.value === remembered.organization);
  };
  app.querySelector('#show').onchange = event => {
    form.password.type = event.target.checked ? 'text' : 'password';
  };
  form.onsubmit = async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    const buttonText = button.querySelector('.button-text');
    const status = app.querySelector('#login-status');
    app.querySelector('#error').textContent = '';
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
      localStorage.setItem('remembered_login', JSON.stringify({
        organization: form.organization.value,
        login: form.login.value
      }));
      state.token = data.token;
      state.session = data;
      sessionStorage.setItem('login_session', data.token);
      sessionStorage.setItem('login_data', JSON.stringify(data));
      navigate('home');
    } catch (error) {
      app.querySelector('#error').textContent = error.message;
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
      button.removeAttribute('aria-busy');
      buttonText.textContent = 'ENTRAR';
      status.textContent = '';
    }
  };
}
