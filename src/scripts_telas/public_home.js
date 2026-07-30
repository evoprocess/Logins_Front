import { loginScreen } from './0_login.js';
import { ORGANIZATION_IMAGES_URL, PUBLIC_IMAGES_URL, SYSTEM_EMAIL } from '../main.js';
import directory from '../organizacoes_publicas.json';

export function publicHomeScreen(app, openLogin = false) {
  const contactLink = SYSTEM_EMAIL ? `mailto:${encodeURIComponent(SYSTEM_EMAIL)}?subject=Quero cadastrar minha organização no GateGuard` : '#';
  app.innerHTML = `
    <div class="public-page">
      <header class="public-header">
        <button class="public-brand" data-scroll="inicio" aria-label="GateGuard - início"><img src="${PUBLIC_IMAGES_URL}/gateguard_logo.png" alt="GateGuard"></button>
        <nav aria-label="Navegação principal"><button class="nav-tab is-active" data-scroll="inicio">Início</button><button class="nav-tab" data-scroll="localizar-organizacao">Localizar organização</button><button class="nav-tab" data-scroll="cadastre-se">Para organizações</button><button class="button button-secondary" data-login>Entrar</button></nav>
      </header>
      <main>
        <section id="inicio" class="public-hero public-screen" data-public-screen>
          <div class="hero-copy"><span class="public-eyebrow">SEUS ACESSOS E PAGAMENTOS EM UM SÓ LUGAR</span><h1>Seu acesso,<br><em>sempre ao seu alcance.</em></h1><p>Consulte seus serviços, acompanhe pagamentos e mantenha seus acessos ativos de forma simples e segura com a sua organização.</p>
            <div class="hero-actions"><button class="button button-primary" data-login>Acessar minha conta</button><button class="text-link" data-scroll="localizar-organizacao">Localizar organização <span>↓</span></button></div>
            <div class="trust-row"><span>✓ Ambiente seguro</span><span>✓ Pagamento facilitado</span><span>✓ Acesso organizado</span></div>
          </div>
          <div class="hero-visual" aria-label="Exemplo da área do cliente"><div class="dashboard-preview client-preview"><div class="preview-top"><span>Meu acesso</span><b class="active-pill">Ativo</b></div><small>Próximo vencimento</small><strong class="preview-value">10 de agosto</strong><div class="client-organization"><span>G</span><div><small>Organização responsável</small><b>Meu provedor</b></div></div><div class="preview-stats"><span><b>Em dia</b> situação financeira</span><span><b>1</b> serviço ativo</span></div></div><div class="floating-card organization-card"><span class="status-dot"></span><div><b>Acesso liberado</b><small>Serviço disponível para uso</small></div></div><div class="floating-card payment-card"><span>✓</span><div><b>Pagamento confirmado</b><small>Atualização automática</small></div></div></div>
        </section>

        <section id="localizar-organizacao" class="flow-section locator-section public-screen" data-public-screen>
          <div class="locator-heading"><div><span class="public-eyebrow">AMBIENTE INTERATIVO</span><h2>Localizar Organização</h2><p>Ande pelo corredor, aproxime-se de uma sala ativa e entre para acessar sua conta.</p></div><div class="floor-indicator"><small>PISO ATUAL</small><strong id="current-floor-label">Piso 1</strong><span>Use a escada para trocar</span></div></div>
          <div class="locator-game" tabindex="0" aria-label="Use as setas ou as teclas A e D para caminhar pelas salas."><div class="game-ceiling"><span>PISO <b id="floor-number">1</b></span><i></i><span>GATEGUARD DIRECTORY</span></div><div class="game-world"><div id="store-row" class="store-row"></div><div class="game-floor-lines"></div><div id="game-avatar" class="game-avatar"><span class="avatar-head"></span><span class="avatar-body"></span><span class="avatar-legs"></span></div></div><div id="game-prompt" class="game-prompt">Use ← → ou A D para caminhar</div></div>
          <div class="game-controls"><button data-move="-1" aria-label="Andar para esquerda">←</button><button id="enter-store" disabled>Entrar</button><button data-move="1" aria-label="Andar para direita">→</button></div><p class="game-help">Movimento: <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> ou setas. Entre com <kbd>Espaço</kbd> ou <kbd>Enter</kbd>. Saia com <kbd>Esc</kbd>.</p>
        </section>

        <section id="cadastre-se" class="signup-section public-screen" data-public-screen>
          <div><span class="public-eyebrow">PARA LOJISTAS E ORGANIZAÇÕES</span><h2>Cadastre-se no GateGuard</h2><p>Gerencie clientes, pagamentos e permissões de acesso em uma plataforma preparada para a operação da sua organização.</p></div>
          <div class="signup-benefits"><span>Gestão de clientes e logins</span><span>Cobranças e planos mensais</span><span>Regras de bloqueio por inadimplência</span><a class="button button-light" href="${contactLink}">Cadastrar minha organização</a></div>
          <footer><div class="footer-product"><img src="${PUBLIC_IMAGES_URL}/gateguard_logo.png" alt="GateGuard"><span>© ${new Date().getFullYear()} GateGuard<br><small>Sistema de Acessos e Pagamentos</small></span></div><div class="footer-developer"><span>Desenvolvido por</span><img src="${PUBLIC_IMAGES_URL}/logo_dev.png" alt="Logo do desenvolvedor"></div></footer>
        </section>
      </main>
    </div>`;
  const open = (organization, organizationName, organizationUrl, onClose) => { if (!app.querySelector('.login-modal')) loginScreen(app, typeof organization === 'string' ? { organization, organizationName, organizationUrl, lockOrganization: true, onClose } : {}); };
  app.querySelectorAll('[data-login]').forEach(button => { button.onclick = () => open(); });
  const page = app.querySelector('.public-page');
  const tabs = [...app.querySelectorAll('.nav-tab')];
  app.querySelectorAll('[data-scroll]').forEach(control => { control.onclick = () => app.querySelector(`#${control.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    tabs.forEach(tab => { const active = tab.dataset.scroll === visible.target.id; tab.classList.toggle('is-active', active); tab.setAttribute('aria-current', active ? 'page' : 'false'); });
  }, { root: page, threshold: [.55, .75] });
  app.querySelectorAll('[data-public-screen]').forEach(section => observer.observe(section));
  import('../organization-world.js').then(({ bindFirstPersonDirectory }) => {
    if (app.querySelector('.locator-game')) bindFirstPersonDirectory(app, open, directory);
  }).catch(() => {
    const prompt = app.querySelector('#game-prompt');
    if (prompt) prompt.textContent = 'O ambiente 3D não pôde ser iniciado neste dispositivo.';
  });
  if (openLogin) open();
}

function bindOrganizationGame(app, openLogin) {
  const game = app.querySelector('.locator-game');
  const storeRow = app.querySelector('#store-row');
  const avatar = app.querySelector('#game-avatar');
  const prompt = app.querySelector('#game-prompt');
  const enterButton = app.querySelector('#enter-store');
  let stores = []; let position = 0;
  const selected = () => stores[position];
  const update = () => {
    avatar.style.left = `${((position + .5) / Math.max(stores.length, 1)) * 100}%`;
    storeRow.querySelectorAll('.game-store').forEach((store, index) => store.classList.toggle('is-near', index === position));
    const current = selected(); const active = current?.status === 'active';
    enterButton.disabled = !active;
    prompt.textContent = active ? `${current.id} — pressione E para entrar` : `${current?.id || ''} — Em construção...`;
  };
  const enter = () => { if (selected()?.status === 'active') openLogin(selected().id); };
  const move = direction => { position = Math.max(0, Math.min(stores.length - 1, position + direction)); update(); };
  const render = floorId => {
    stores = directory.floors.find(floor => floor.id === floorId)?.organizations || []; position = 0;
    app.querySelector('#floor-number').textContent = floorId;
    storeRow.innerHTML = stores.map((organization, index) => `<button class="game-store is-${organization.status}" data-store="${index}"><span class="room-number">SALA ${organization.room}</span><span class="store-sign">${organization.status === 'active' ? `<img src="${ORGANIZATION_IMAGES_URL}/${organization.id}/logo.png" alt="">` : '<i>◇</i>'}<b>${organization.id}</b></span><span class="store-door">${organization.status === 'active' ? 'ENTRADA' : 'EM CONSTRUÇÃO...'}</span></button>`).join('');
    storeRow.querySelectorAll('[data-store]').forEach(button => { button.onclick = () => { position = Number(button.dataset.store); update(); if (selected()?.status === 'active') enter(); }; });
    app.querySelectorAll('[data-floor]').forEach(button => button.classList.toggle('is-active', Number(button.dataset.floor) === floorId)); update();
  };
  app.querySelectorAll('[data-floor]').forEach(button => { button.onclick = () => render(Number(button.dataset.floor)); });
  app.querySelectorAll('[data-move]').forEach(button => { button.onclick = () => move(Number(button.dataset.move)); });
  enterButton.onclick = enter;
  game.onkeydown = event => {
    if (['ArrowLeft', 'a', 'A'].includes(event.key)) { event.preventDefault(); move(-1); }
    if (['ArrowRight', 'd', 'D'].includes(event.key)) { event.preventDefault(); move(1); }
    if (['e', 'E', 'Enter'].includes(event.key)) { event.preventDefault(); enter(); }
  };
  render(1);
}
