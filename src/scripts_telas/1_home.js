import { state, shell, bindShell } from '../main.js';
export function homeScreen(app) { app.innerHTML = shell(`<div class="hero"><p>Olá,</p><h2>${escapeHtml(state.session.user.name)}</h2><p>Você entrou como <strong>${escapeHtml(state.session.user.role)}</strong> na organização <strong>${escapeHtml(state.session.organization.name)}</strong>.</p></div>`, 'Home'); bindShell(); }
function escapeHtml(v) { const e = document.createElement('span'); e.textContent = v; return e.innerHTML; }
