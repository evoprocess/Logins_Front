import { loginScreen } from './0_login.js';
import { SYSTEM_NAME } from '../main.js';

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};

export function publicHomeScreen(app, openLogin = false) {
  app.innerHTML = `
    <div class="public-page">
      <header class="public-header">
        <a class="public-brand" href="#" aria-label="${esc(SYSTEM_NAME)} - início"><img src="./imagens/logo.png" alt=""><strong>${esc(SYSTEM_NAME)}</strong></a>
        <nav aria-label="Navegação principal"><a href="#como-funciona">Como funciona</a><a href="#recursos">Recursos</a><button class="button button-secondary" data-login>Entrar</button></nav>
      </header>
      <main>
        <section class="public-hero">
          <div class="hero-copy">
            <span class="public-eyebrow">CONTROLE DE ACESSO E PAGAMENTOS</span>
            <h1>Receba em dia.<br><em>Libere com segurança.</em></h1>
            <p>Uma plataforma para administrar organizações, cobranças e acessos em um único fluxo — do seu negócio até o cliente final.</p>
            <div class="hero-actions"><button class="button button-primary" data-login>Entrar na plataforma</button><a class="text-link" href="#como-funciona">Entenda o fluxo <span>↓</span></a></div>
            <div class="trust-row"><span>✓ Bloqueio automático</span><span>✓ Gestão por organização</span><span>✓ Pagamentos integrados</span></div>
          </div>
          <div class="hero-visual" aria-label="Resumo do funcionamento da plataforma">
            <div class="dashboard-preview">
              <div class="preview-top"><span>Visão financeira</span><b>Este mês</b></div><strong class="preview-value">R$ 48.920</strong><small>Receita processada</small>
              <div class="preview-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
              <div class="preview-stats"><span><b>94%</b> em dia</span><span><b>128</b> acessos ativos</span></div>
            </div>
            <div class="floating-card organization-card"><span class="status-dot"></span><div><b>Organização ativa</b><small>Plano mensal confirmado</small></div></div>
            <div class="floating-card payment-card"><span>✓</span><div><b>Pagamento recebido</b><small>Acesso liberado automaticamente</small></div></div>
          </div>
        </section>
        <section id="como-funciona" class="flow-section">
          <span class="public-eyebrow">UMA CADEIA, TODO O CONTROLE</span><h2>Cada pagamento mantém o acesso funcionando</h2>
          <div class="flow-grid">
            <article><span>01</span><div class="flow-icon">A</div><h3>Administradora</h3><p>Define planos, acompanha organizações e controla a situação financeira de cada operação.</p></article>
            <article><span>02</span><div class="flow-icon">O</div><h3>Organização</h3><p>Contrata a plataforma, gerencia seus clientes, cobranças, usuários e regras de acesso.</p></article>
            <article><span>03</span><div class="flow-icon">C</div><h3>Cliente final</h3><p>Paga à organização e mantém seu login ativo conforme as regras comerciais contratadas.</p></article>
          </div>
          <p class="flow-rule"><b>Regra automática:</b> cliente inadimplente pode ter o login bloqueado pela organização; organização inadimplente pode ter toda a operação suspensa pela administradora.</p>
        </section>
        <section id="recursos" class="features-section">
          <div><span class="public-eyebrow">GESTÃO CENTRALIZADA</span><h2>Clareza para cobrar.<br>Agilidade para liberar.</h2></div>
          <div class="feature-list">
            <article><b>01</b><div><h3>Cobranças recorrentes</h3><p>Planos mensais, vencimentos e situação de pagamento acompanhados em um só lugar.</p></div></article>
            <article><b>02</b><div><h3>Hierarquia de acessos</h3><p>Permissões específicas para administradores, gestores, operadores e clientes.</p></div></article>
            <article><b>03</b><div><h3>Bloqueio inteligente</h3><p>Regras de ativação e suspensão ligadas diretamente à situação financeira.</p></div></article>
          </div>
        </section>
      </main>
      <footer><span>© ${new Date().getFullYear()} ${esc(SYSTEM_NAME)}</span><span>Controle, transparência e segurança.</span></footer>
    </div>`;
  const open = () => { if (!app.querySelector('.login-modal')) loginScreen(app); };
  app.querySelectorAll('[data-login]').forEach(button => { button.onclick = open; });
  if (openLogin) open();
}
