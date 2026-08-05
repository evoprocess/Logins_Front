import { API_URL, PUBLIC_IMAGES_URL, state, navigate } from '../main.js';
import publicDirectory from '../sistemas_publicos.json';

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};

export function loginScreen(app, options = {}) {
  const gateGuardAccess = options.system === 'SIS_0000';
  const publicSystem = publicDirectory.floors.flatMap(floor => floor.systems).find(item => item.id === options.system);
  const systemLogo = gateGuardAccess ? `${PUBLIC_IMAGES_URL}/gateguard_logo.png` : publicSystem?.logo ? `${import.meta.env.BASE_URL}${publicSystem.logo}` : '';
  const modal = document.createElement('div');
  modal.className = 'login-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'login-title');
  modal.innerHTML = `
    <div class="login-backdrop" data-close-login></div>
    <section class="login-card">
      <button class="login-close" type="button" data-close-login aria-label="Fechar login">&times;</button>
      <div class="brand"><img src="${PUBLIC_IMAGES_URL}/gateguard_logo.png" alt="GateGuard"></div>
      <div class="login-heading"><span>${gateGuardAccess ? 'ACESSO INTERNO GATEGUARD' : 'ÁREA DO SISTEMA'}</span><h2 id="login-title">${gateGuardAccess ? 'Funcionários e administradores' : 'Acesso à plataforma'}</h2><p>${gateGuardAccess ? 'Área exclusiva da equipe administrativa do GateGuard.' : 'Login destinado ao sistema integrado para administrar sua conta e os pagamentos do GateGuard.'}</p></div>
      ${options.systemName ? `<div class="login-store">${systemLogo ? `<img src="${systemLogo}" alt="">` : ''}<div><small>Você está entrando em</small><strong>${esc(options.systemName)}</strong></div></div>` : ''}
      <aside class="client-access" id="client-access" ${gateGuardAccess ? 'hidden' : ''}>
        <div><span>VOCÊ É CLIENTE?</span><strong id="client-system-name">Acesse pelo site da seu sistema</strong><small id="client-access-message">Informe o sistema para localizar o portal correto.</small></div>
        <a id="client-access-link" href="#" target="_blank" rel="noopener noreferrer" hidden>Ir para o portal</a>
      </aside>
      <form id="login-form">
        <label>SISTEMA<input name="system" placeholder="SIS_XXXX" required></label>
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
  const publicSystems = publicDirectory.floors.flatMap(floor => floor.systems);
  const synchronizeClientAccess = () => {
    const system = String(form.system.value || '').toUpperCase();
    const publicSystem = publicSystems.find(item => item.id === system);
    const name = options.systemName || publicSystem?.name;
    const url = options.systemUrl || publicSystem?.publicUrl;
    const link = modal.querySelector('#client-access-link');
    modal.querySelector('#client-access').hidden = system === 'SIS_0000';
    modal.querySelector('#client-system-name').textContent = name && publicSystem?.status !== 'construction' ? name : 'Acesse pelo site da seu sistema';
    modal.querySelector('#client-access-message').textContent = url
      ? 'Clientes finais entram e consultam seus pagamentos diretamente no portal do sistema.'
      : system ? 'O link público ainda não foi configurado. Solicite o endereço à seu sistema.' : 'Informe o sistema para localizar o portal correto.';
    link.hidden = !url;
    if (url) link.href = url;
  };
  const close = (reason = 'close') => {
    document.removeEventListener('keydown', onKeydown);
    modal.remove();
    options.onClose?.({ reason });
  };
  const onKeydown = event => { if (event.key === 'Escape') close('escape'); };
  modal.querySelectorAll('[data-close-login]').forEach(element => { element.onclick = () => close('close'); });
  document.addEventListener('keydown', onKeydown);

  let remembered = {};
  try { remembered = JSON.parse(localStorage.getItem('remembered_login') || '{}'); }
  catch { localStorage.removeItem('remembered_login'); }
  form.system.value = '';
  form.login.value = String(remembered.login || '');
  if (options.system) {
    form.system.value = String(options.system).toUpperCase();
    form.system.readOnly = options.lockSystem !== false;
    form.system.classList.add('is-fixed');
  }
  const markRemembered = input => {
    const savedValue = String(remembered[input.name] || '');
    input.classList.toggle('is-remembered', Boolean(savedValue) && input.value === savedValue);
  };
  markRemembered(form.system);
  markRemembered(form.login);
  if (options.system) form.system.classList.add('is-fixed');
  form.system.oninput = event => {
    event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    markRemembered(event.target);
    synchronizeClientAccess();
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
      localStorage.setItem('remembered_login', JSON.stringify({ system: form.system.value, login: form.login.value }));
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
  synchronizeClientAccess();
  setTimeout(() => form.system.focus(), 0);
}
