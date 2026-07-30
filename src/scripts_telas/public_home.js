import { loginScreen } from './0_login.js';
import { PUBLIC_IMAGES_URL, SYSTEM_EMAIL } from '../main.js';

export function publicHomeScreen(app, openLogin = false) {
  const contactLink = SYSTEM_EMAIL ? `mailto:${encodeURIComponent(SYSTEM_EMAIL)}?subject=Quero cadastrar minha organização no GateGuard` : '#';
  app.innerHTML = `
    <div class="public-page">
      <header class="public-header">
        <a class="public-brand" href="#" aria-label="GateGuard - início"><img src="${PUBLIC_IMAGES_URL}/gateguard_logo.png" alt="GateGuard"><strong>GateGuard</strong></a>
        <nav aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a><a href="#recursos">Para você</a><a href="#cadastre-se">Para organizações</a>
          <button class="button button-secondary" data-login>Entrar</button>
        </nav>
      </header>
      <main>
        <section class="public-hero">
          <div class="hero-copy">
            <span class="public-eyebrow">SEUS ACESSOS E PAGAMENTOS EM UM SÓ LUGAR</span>
            <h1>Seu acesso,<br><em>sempre ao seu alcance.</em></h1>
            <p>Consulte seus serviços, acompanhe pagamentos e mantenha seus acessos ativos de forma simples e segura com a sua organização.</p>
            <div class="hero-actions"><button class="button button-primary" data-login>Acessar minha conta</button><a class="text-link" href="#como-funciona">Conheça o GateGuard <span>↓</span></a></div>
            <div class="trust-row"><span>✓ Ambiente seguro</span><span>✓ Pagamento facilitado</span><span>✓ Acesso organizado</span></div>
          </div>
          <div class="hero-visual" aria-label="Exemplo da área do cliente">
            <div class="dashboard-preview client-preview">
              <div class="preview-top"><span>Meu acesso</span><b class="active-pill">Ativo</b></div>
              <small>Próximo vencimento</small><strong class="preview-value">10 de agosto</strong>
              <div class="client-organization"><span>G</span><div><small>Organização responsável</small><b>Meu provedor</b></div></div>
              <div class="preview-stats"><span><b>Em dia</b> situação financeira</span><span><b>1</b> serviço ativo</span></div>
            </div>
            <div class="floating-card organization-card"><span class="status-dot"></span><div><b>Acesso liberado</b><small>Serviço disponível para uso</small></div></div>
            <div class="floating-card payment-card"><span>✓</span><div><b>Pagamento confirmado</b><small>Atualização automática</small></div></div>
          </div>
        </section>

        <section id="como-funciona" class="flow-section">
          <span class="public-eyebrow">SIMPLES DO INÍCIO AO ACESSO</span><h2>Você acompanha tudo com clareza</h2>
          <div class="flow-grid">
            <article><span>01</span><div class="flow-icon">E</div><h3>Entre na sua conta</h3><p>Use a organização, o login e a senha que foram fornecidos pelo seu prestador de serviço.</p></article>
            <article><span>02</span><div class="flow-icon">P</div><h3>Acompanhe pagamentos</h3><p>Consulte cobranças, vencimentos e formas disponíveis para manter seu serviço em dia.</p></article>
            <article><span>03</span><div class="flow-icon">A</div><h3>Mantenha seu acesso</h3><p>Após a confirmação do pagamento, a situação do seu acesso é atualizada pela organização.</p></article>
          </div>
          <p class="flow-rule"><b>Importante:</b> cada organização é responsável por seus clientes, planos, cobranças e regras de liberação ou bloqueio de acesso.</p>
        </section>

        <section id="recursos" class="features-section">
          <div><span class="public-eyebrow">FEITO PARA FACILITAR</span><h2>Mais autonomia para cuidar dos seus serviços.</h2></div>
          <div class="feature-list">
            <article><b>01</b><div><h3>Informações centralizadas</h3><p>Veja seus serviços e dados de acesso sem depender de conversas ou controles separados.</p></div></article>
            <article><b>02</b><div><h3>Pagamentos transparentes</h3><p>Acompanhe valores, vencimentos e a situação das cobranças emitidas pela organização.</p></div></article>
            <article><b>03</b><div><h3>Atualização de acesso</h3><p>Saiba quando seu acesso está ativo e mantenha seus compromissos organizados.</p></div></article>
          </div>
        </section>

        <section id="cadastre-se" class="signup-section">
          <div><span class="public-eyebrow">PARA LOJISTAS E ORGANIZAÇÕES</span><h2>Cadastre-se no GateGuard</h2><p>Gerencie clientes, pagamentos e permissões de acesso em uma plataforma preparada para a operação da sua organização.</p></div>
          <div class="signup-benefits"><span>Gestão de clientes e logins</span><span>Cobranças e planos mensais</span><span>Regras de bloqueio por inadimplência</span><a class="button button-light" href="${contactLink}">Cadastrar minha organização</a></div>
        </section>
      </main>
      <footer>
        <div class="footer-product"><img src="${PUBLIC_IMAGES_URL}/gateguard_logo.png" alt="GateGuard"><span>© ${new Date().getFullYear()} GateGuard<br><small>Sistema de Acessos e Pagamentos</small></span></div>
        <div class="footer-developer"><span>Desenvolvido por</span><img src="${PUBLIC_IMAGES_URL}/logo_dev.png" alt="Logo do desenvolvedor"></div>
      </footer>
    </div>`;
  const open = () => { if (!app.querySelector('.login-modal')) loginScreen(app); };
  app.querySelectorAll('[data-login]').forEach(button => { button.onclick = open; });
  if (openLogin) open();
}
