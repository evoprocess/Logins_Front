import { API_URL, state, navigate } from '../main.js';

export function loginScreen(app) {
  app.innerHTML = `
    <div class="login-page">
      <section class="login-card">
        <div class="brand"><img src="./imagens/logo.png" alt="Logo"></div>
        <form id="login-form">
          <label>ORGANIZAÇÃO
            <input name="organization" placeholder="ORG_XXXX" required>
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
          <p id="error" class="error"></p>
          <button type="submit">ENTRAR</button>
        </form>
      </section>
    </div>`;

  const form = app.querySelector('#login-form');
  form.organization.oninput = event => {
    event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
  };
  app.querySelector('#show').onchange = event => {
    form.password.type = event.target.checked ? 'text' : 'password';
  };
  form.onsubmit = async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Falha ao entrar.');
      state.token = data.token;
      state.session = data;
      sessionStorage.setItem('login_session', data.token);
      sessionStorage.setItem('login_data', JSON.stringify(data));
      navigate('home');
    } catch (error) {
      app.querySelector('#error').textContent = error.message;
    } finally {
      button.disabled = false;
    }
  };
}
