import { loginScreen } from './0_login.js';
import { PUBLIC_IMAGES_URL, SYSTEM_EMAIL } from '../main.js';
import directory from '../sistemas_publicos.json';
import '../developer-guide.css';
import '../responsibilities.css';
import '../plans-public.css';

const developerGuideUrl = `${import.meta.env.BASE_URL}docs/Manual_Implantacao_API_GateGuard.pdf`;

export function publicHomeScreen(app, openLogin = false) {
  const contactLink = SYSTEM_EMAIL ? `mailto:${encodeURIComponent(SYSTEM_EMAIL)}?subject=Quero integrar meu sistema ao GateGuard` : '#';
  app.innerHTML = `
    <div class="public-page">
      <header class="public-header">
        <button class="public-brand" data-scroll="inicio" aria-label="GateGuard - início"><img src="${PUBLIC_IMAGES_URL}/gateguard_logo.png" alt="GateGuard"></button>
        <nav aria-label="Navegação principal"><button class="nav-tab is-active" data-scroll="inicio">Início</button><button class="nav-tab" data-scroll="localizar-sistema">Localizar sistema</button><button class="nav-tab" data-scroll="planos">Planos</button><button class="nav-tab" data-scroll="como-funciona">Como Funciona</button><button class="nav-tab" data-scroll="desenvolvedores">Desenvolvedores</button><button class="button button-secondary" data-login>Entrar</button></nav>
      </header>
      <main>
        <section id="inicio" class="public-hero public-screen" data-public-screen>
          <div class="hero-copy"><span class="public-eyebrow">DUAS SOLUÇÕES, RESPONSABILIDADES BEM DEFINIDAS</span><h1>Backend seguro,<br><em>acessos e pagamentos.</em></h1><p>O GateGuard oferece Gestão de Acessos integrada ao banco do contratante e Gestão de Pagamentos com infraestrutura financeira própria.</p>
            <div class="hero-actions"><button class="button button-primary" data-login>Acessar minha conta</button><button class="text-link" data-scroll="localizar-sistema">Localizar sistema <span>↓</span></button></div>
            <div class="trust-row"><span>✓ Ambiente seguro</span><span>✓ Pagamento facilitado</span><span>✓ Acesso organizado</span></div>
          </div>
          <div class="hero-visual" aria-label="Exemplo da área do cliente"><div class="dashboard-preview client-preview"><div class="preview-top"><span>Meu acesso</span><b class="active-pill">Ativo</b></div><small>Próximo vencimento</small><strong class="preview-value">10 de agosto</strong><div class="client-system"><span>G</span><div><small>Sistema responsável</small><b>Meu provedor</b></div></div><div class="preview-stats"><span><b>Em dia</b> situação financeira</span><span><b>1</b> serviço ativo</span></div></div><div class="floating-card system-card"><span class="status-dot"></span><div><b>Acesso liberado</b><small>Serviço disponível para uso</small></div></div><div class="floating-card payment-card"><span>✓</span><div><b>Pagamento confirmado</b><small>Atualização automática</small></div></div></div>
        </section>

        <section id="localizar-sistema" class="flow-section locator-section public-screen" data-public-screen>
          <div class="locator-heading"><div><span class="public-eyebrow">AMBIENTE INTERATIVO</span><h2>Localizar Sistema</h2><p>Ande pelo corredor, aproxime-se de uma sala ativa e entre para acessar sua conta.</p></div><div class="locator-tools"><div class="floor-indicator"><small>PISO ATUAL</small><strong id="current-floor-label">Piso 1</strong><span>Use a escada para trocar</span></div><button type="button" id="movement-legend-button" class="movement-legend-button"><small>AJUDA</small><strong>Legenda de Movimentos</strong><span>Consultar controles</span></button></div></div>
          <form id="store-search-form" class="store-search" autocomplete="off"><label for="store-search">Pesquisar Sistema</label><div><div class="store-combobox"><input id="store-search" role="combobox" aria-autocomplete="both" aria-expanded="false" aria-controls="store-options"><button type="button" id="toggle-store-options" aria-label="Exibir todos os sistemas">⌄</button><div id="store-options" class="store-options" role="listbox" hidden>${directory.floors.flatMap(floor => floor.systems).filter(system => system.status === 'active').map(system => `<button type="button" role="option" data-store-option="${system.name}">${system.name}</button>`).join('')}</div></div><button type="submit">Ir correndo</button></div><span id="store-search-feedback" class="sr-only" aria-live="polite"></span></form>
          <div class="locator-game" tabindex="0" aria-label="Use as setas ou as teclas A e D para caminhar pelas salas."><div class="game-ceiling"><span>PISO <b id="floor-number">1</b></span><i></i><span>GATEGUARD DIRECTORY</span></div><div class="game-world"><div id="store-row" class="store-row"></div><div class="game-floor-lines"></div><div id="game-avatar" class="game-avatar"><span class="avatar-head"></span><span class="avatar-body"></span><span class="avatar-legs"></span></div></div><div id="game-prompt" class="game-prompt">Use ← → ou A D para caminhar</div></div>
          <div id="movement-legend-popup" class="movement-legend-popup" hidden><div><button type="button" id="close-movement-legend" aria-label="Fechar legenda">&times;</button><span>CONTROLES DO AMBIENTE</span><h3>Legenda de movimentos</h3><ul><li><kbd>W A S D</kbd><span>Caminhar pelo ambiente</span></li><li><kbd>↑ ↓ ← →</kbd><span>Movimentação alternativa</span></li><li><kbd>Mouse</kbd><span>Controlar a câmera</span></li><li><kbd>Espaço / Enter</kbd><span>Entrar no sistema</span></li><li><kbd>Esc</kbd><span>Liberar o cursor</span></li></ul></div></div>
        </section>

        <section id="planos" class="plans-section public-screen" data-public-screen>
          <div class="plans-heading"><span class="public-eyebrow">SOLUÇÕES GATEGUARD</span><h2>Dois serviços independentes</h2><p>Contrate somente a solução adequada ao seu negócio. Não existe plano combinado: Pagamentos e Acessos possuem finalidades, bancos e responsabilidades diferentes.</p></div>
          <div class="plans-grid">
            <article class="plan-card is-featured"><b class="recommended-badge">INFRAESTRUTURA GATEGUARD</b><h3>Gestão de Pagamentos</h3><p>Serviço financeiro gerenciado de ponta a ponta, com backend, banco de pagamentos e integração com gateways sob controle do GateGuard.</p><ul><li>API de pagamentos inclusa</li><li>Banco financeiro do GateGuard</li><li>Clientes, cobranças e assinaturas</li><li>Transações, checkout e webhooks</li><li>Histórico, conciliação e auditoria</li><li>Regras financeiras e isolamento por contratante</li></ul><a href="${contactLink}" class="plan-contact">Consultar Gestão de Pagamentos</a></article>
            <article class="plan-card"><b class="recommended-badge">BANCO DO CONTRATANTE</b><h3>Gestão de Acessos</h3><p>Backend seguro e gerenciado, integrado ao banco de produção do contratante, com administração de usuários, perfis e permissões por autoatendimento.</p><ul><li>Backend e API de acessos inclusos</li><li>Autenticação, sessões e auditoria</li><li>Gestão de logins pelo contratante</li><li>Perfis e permissões definidos pelo contratante</li><li>Políticas aplicadas pelo GateGuard em cada operação</li><li>Banco e dados sob responsabilidade do contratante</li></ul><a href="${contactLink}" class="plan-contact">Consultar Gestão de Acessos</a></article>
          </div>
          <div class="plans-actions"><button type="button" id="compare-plans-button" class="compare-plans-button">Entender as responsabilidades</button><p class="plans-pricing-note">* A Gestão de Pagamentos pode incluir tarifa por transação conforme o contrato vigente.</p></div>
          <dialog id="plans-comparison-modal" class="plans-comparison-modal" aria-labelledby="plans-comparison-title"><div class="plans-comparison"><button type="button" id="close-plans-comparison" class="plans-modal-close" aria-label="Fechar comparação">&times;</button><h3 id="plans-comparison-title">Responsabilidades de cada solução</h3><div class="plans-table-wrap"><table><thead><tr><th>Responsabilidade</th><th>Gestão de Pagamentos</th><th>Gestão de Acessos</th></tr></thead><tbody><tr><td>Backend do serviço</td><td>GateGuard</td><td>GateGuard</td></tr><tr><td>Banco principal</td><td>GateGuard</td><td>Contratante</td></tr><tr><td>Dados armazenados</td><td>Clientes financeiros, cobranças, assinaturas, transações e eventos</td><td>GateGuard guarda identidade, perfis, permissões e auditoria; dados de negócio ficam no banco do contratante</td></tr><tr><td>Administração cotidiana</td><td>Processos financeiros controlados pelo GateGuard</td><td>Contratante gerencia logins, perfis e permissões pelo painel</td></tr><tr><td>Aplicação das regras</td><td>GateGuard executa as regras financeiras</td><td>Contratante define; GateGuard aplica e fiscaliza</td></tr><tr><td>API</td><td>API financeira GateGuard</td><td>Backend/API GateGuard integrado ao banco do contratante</td></tr></tbody></table></div><p>As soluções podem ser contratadas separadamente e não formam um plano Plus. Cada uma possui contrato, escopo e responsabilidade próprios.</p></div></dialog>
        </section>

        <section id="como-funciona" class="responsibilities-section public-screen" data-public-screen>
          <div class="responsibilities-heading"><span class="public-eyebrow">SIMPLES, SEGURO E SOB MEDIDA</span><h2>Como funciona o GateGuard?</h2><p>Primeiro identificamos a necessidade: controlar o ciclo financeiro no ambiente GateGuard ou proteger o acesso ao banco de produção do contratante.</p></div>
          <div class="how-steps"><article><span>1</span><h3>Escolha a solução</h3><p>Gestão de Pagamentos ou Gestão de Acessos, com contratos e responsabilidades independentes.</p></article><article><span>2</span><h3>Implante com segurança</h3><p>O GateGuard configura a API, o isolamento e o ambiente correspondente à solução contratada.</p></article><article><span>3</span><h3>Administre sua operação</h3><p>Em Acessos, o gestor do contratante mantém logins, perfis e permissões pelo painel; em Pagamentos, o GateGuard controla o processo financeiro.</p></article></div>
          <div class="responsibilities-grid">
            <article><span>P</span><h3>Em Pagamentos</h3><ul><li>Backend e banco financeiro são do GateGuard</li><li>GateGuard controla cobranças, transações, webhooks e auditoria</li><li>O contratante integra sua operação pela API financeira</li></ul></article>
            <article><span>A</span><h3>Em Acessos</h3><ul><li>O backend seguro é fornecido pelo GateGuard</li><li>O banco de produção e os dados são do contratante</li><li>O contratante define e administra logins, perfis e permissões; o GateGuard aplica as políticas</li></ul></article>
          </div>
          <p class="responsibilities-limit"><strong>Responsabilidades bem definidas:</strong> em Pagamentos, o GateGuard controla o backend, o banco e o processo financeiro. Em Acessos, o GateGuard fornece o backend e aplica as políticas, enquanto o contratante conserva o banco, os dados e a decisão sobre quem pode fazer o quê.</p>
        </section>

        <section id="desenvolvedores" class="developer-section public-screen" data-public-screen>
          <div class="developer-copy"><span class="public-eyebrow">ÁREA PARA DESENVOLVEDORES</span><h2>O frontend solicita. O GateGuard decide e executa.</h2><p>O frontend descreve o que o usuário quer fazer; o backend GateGuard valida identidade, escopo, permissão e dados antes de executar o processo seguro.</p><ul><li>Frontend sem credenciais de banco ou gateway</li><li>Autorização aplicada no backend</li><li>Contratos de API e operações homologadas</li><li>Erros seguros e checklist de implantação</li></ul><a class="developer-guide-cta" href="${developerGuideUrl}" target="_blank" rel="noopener">Abrir Guia de Instalação</a></div>
          <div class="developer-preview"><span>GATEGUARD BACKEND</span><strong>Frontend → GateGuard → serviço protegido</strong><code>solicitação → autorização → execução → auditoria</code><p>Em Acessos, o destino é o banco do contratante. Em Pagamentos, o destino é a infraestrutura financeira GateGuard.</p></div>
        </section>

        <section id="cadastre-se" class="signup-section public-screen" data-public-screen>
          <div><span class="public-eyebrow">PARA SISTEMAS DE SOFTWARE</span><h2>Escolha sua solução GateGuard</h2><p>Adicione um backend seguro para administrar acessos ao seu banco ou uma infraestrutura completa para gerir pagamentos.</p></div>
          <div class="signup-benefits"><span>Gestão de Acessos com banco do contratante</span><span>Gestão de Pagamentos com banco GateGuard</span><span>Duas soluções independentes</span><a class="button button-light" href="${contactLink}">Falar sobre meu sistema</a></div>
          <footer><div class="footer-product"><img src="${PUBLIC_IMAGES_URL}/gateguard_logo.png" alt="GateGuard"><span>© ${new Date().getFullYear()} GateGuard<br><small>Gestão de Acessos e Gestão de Pagamentos</small></span></div><div class="footer-developer"><span>Desenvolvido por</span><img src="${PUBLIC_IMAGES_URL}/logo_dev.png" alt="Logo do desenvolvedor"></div></footer>
        </section>
      </main>
    </div>`;
  const open = (system, systemName, systemUrl, onClose) => { if (!app.querySelector('.login-modal')) loginScreen(app, typeof system === 'string' ? { system, systemName, systemUrl, lockSystem: true, onClose } : {}); };
  app.querySelectorAll('[data-login]').forEach(button => { button.onclick = () => open(); });
  const page = app.querySelector('.public-page');
  const tabs = [...app.querySelectorAll('.nav-tab')];
  const plansComparisonModal = app.querySelector('#plans-comparison-modal');
  app.querySelector('#compare-plans-button').onclick = () => plansComparisonModal.showModal();
  app.querySelector('#close-plans-comparison').onclick = () => plansComparisonModal.close();
  plansComparisonModal.onclick = event => { if (event.target === plansComparisonModal) plansComparisonModal.close(); };
  app.querySelectorAll('[data-scroll]').forEach(control => { control.onclick = () => app.querySelector(`#${control.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    tabs.forEach(tab => { const active = tab.dataset.scroll === visible.target.id; tab.classList.toggle('is-active', active); tab.setAttribute('aria-current', active ? 'page' : 'false'); });
  }, { root: page, threshold: [.55, .75] });
  app.querySelectorAll('[data-public-screen]').forEach(section => observer.observe(section));
  const legendPopup = app.querySelector('#movement-legend-popup');
  app.querySelector('#movement-legend-button').onclick = () => { legendPopup.hidden = false; };
  app.querySelector('#close-movement-legend').onclick = () => { legendPopup.hidden = true; };
  legendPopup.onclick = event => { if (event.target === legendPopup) legendPopup.hidden = true; };
  const searchInput = app.querySelector('#store-search');
  const storeOptions = app.querySelector('#store-options');
  const optionButtons = [...storeOptions.querySelectorAll('[data-store-option]')];
  const showOptions = (showAll = false) => {
    const query = showAll ? '' : searchInput.value.trim().toLocaleLowerCase('pt-BR');
    optionButtons.forEach(option => { option.hidden = Boolean(query) && !option.dataset.storeOption.toLocaleLowerCase('pt-BR').includes(query); });
    storeOptions.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
  };
  const hideOptions = () => { storeOptions.hidden = true; searchInput.setAttribute('aria-expanded', 'false'); };
  searchInput.oninput = event => {
    const typed = searchInput.value;
    if (event.inputType?.startsWith('insert') && typed) {
      const match = optionButtons.map(option => option.dataset.storeOption).find(name => name.toLocaleLowerCase('pt-BR').startsWith(typed.toLocaleLowerCase('pt-BR')));
      if (match && match.length > typed.length) {
        searchInput.value = match;
        searchInput.setSelectionRange(typed.length, match.length);
      }
    }
    if (!storeOptions.hidden) showOptions(false);
  };
  app.querySelector('#toggle-store-options').onclick = () => storeOptions.hidden ? showOptions(true) : hideOptions();
  optionButtons.forEach(option => { option.onclick = () => { searchInput.value = option.dataset.storeOption; hideOptions(); searchInput.focus(); }; });
  page.addEventListener('click', event => { if (!event.target.closest('.store-combobox')) hideOptions(); });
  import('../system-world.js').then(({ bindFirstPersonDirectory }) => {
    if (app.querySelector('.locator-game')) bindFirstPersonDirectory(app, open, directory);
  }).catch(() => {
    const prompt = app.querySelector('#game-prompt');
    if (prompt) prompt.textContent = 'O ambiente 3D não pôde ser iniciado neste dispositivo.';
  });
  if (openLogin) open();
}

function bindSystemGame(app, openLogin) {
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
    stores = directory.floors.find(floor => floor.id === floorId)?.systems || []; position = 0;
    app.querySelector('#floor-number').textContent = floorId;
    storeRow.innerHTML = stores.map((system, index) => `<button class="game-store is-${system.status}" data-store="${index}"><span class="room-number">SALA ${system.room}</span><span class="store-sign">${system.status === 'active' && system.logo ? `<img src="${import.meta.env.BASE_URL}${system.logo}" alt="">` : system.status === 'active' ? '' : '<i>◇</i>'}<b>${system.id}</b></span><span class="store-door">${system.status === 'active' ? 'ENTRADA' : 'EM CONSTRUÇÃO...'}</span></button>`).join('');
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
