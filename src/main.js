const API_URL = (import.meta.env?.VITE_API_URL || 'https://logins-back.onrender.com').replace(/\/$/, '');
const form = document.querySelector('#login-form');
const password = document.querySelector('#password');
const showPassword = document.querySelector('#show-password');
const message = document.querySelector('#message');
const button = document.querySelector('#submit');
const success = document.querySelector('#success');
const brandLogo = document.querySelector('#brand-logo');
const generalLogo = brandLogo.src;

brandLogo.addEventListener('error', () => {
  if (brandLogo.src !== generalLogo) brandLogo.src = generalLogo;
});

showPassword.addEventListener('change', () => { password.type = showPassword.checked ? 'text' : 'password'; });
document.querySelector('#organization').addEventListener('input', event => { event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''); });
function loading(active) { button.disabled = active; button.classList.toggle('loading', active); button.querySelector('span:first-child').textContent = active ? 'ENTRANDO' : 'ENTRAR'; }

form.addEventListener('submit', async event => {
  event.preventDefault(); message.textContent = '';
  if (!form.reportValidity()) return;
  loading(true);
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ organization: form.organization.value, login: form.login.value, password: form.password.value }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Não foi possível entrar. Tente novamente.');
    sessionStorage.setItem('login_session', data.token);
    const organization = String(data.organization.id || '').toUpperCase();
    if (/^ORG_[A-Z0-9]{4,20}$/.test(organization)) brandLogo.src = `./imagens/${organization}/logo.png`;
    form.hidden = true; success.hidden = false;
    document.querySelector('#welcome').textContent = `${data.user.name} • ${data.user.role} • ${data.organization.name}`;
  } catch (error) { message.textContent = error.message; } finally { loading(false); }
});

document.querySelector('#logout').addEventListener('click', () => {
  sessionStorage.removeItem('login_session'); success.hidden = true; form.hidden = false;
  brandLogo.src = generalLogo;
  form.reset(); password.type = 'password';
});
