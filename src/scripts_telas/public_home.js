import { loginScreen } from './0_login.js';
import { ORGANIZATION_IMAGES_URL, PUBLIC_IMAGES_URL, SYSTEM_EMAIL } from '../main.js';
import directory from '../organizacoes_publicas.json';
import '../developer-guide.css';
import '../responsibilities.css';
import '../plans-public.css';

const developerGuideUrl = `${import.meta.env.BASE_URL}docs/Manual_Implantacao_API_GateGuard.pdf`;

export function publicHomeScreen(app, openLogin = false) {
  const contactLink = SYSTEM_EMAIL ? `mailto:${encodeURIComponent(SYSTEM_EMAIL)}?subject=Quero cadastrar minha organização no GateGuard` : '#';
  app.innerHTML = `
    <div class="public-page">
      <header class="public-header">
        <button class="public-brand" data-scroll="inicio" aria-label="GateGuard - início"><img src="${PUBLIC_IMAGES_URL}/gateguard_logo.png" alt="GateGuard"></button>
        <nav aria-label="Navegação principal"><button class="nav-tab is-active" data-scroll="inicio">Início</button><button class="nav-tab" data-scroll="localizar-organizacao">Localizar organização</button><button class="nav-tab" data-scroll="planos">Planos</button><button class="nav-tab" data-scroll="como-funciona">Como Funciona</button><button class="nav-tab" data-scroll="desenvolvedores">Desenvolvedores</button><button class="button button-secondary" data-login>Entrar</button></nav>
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
          <div class="locator-heading"><div><span class="public-eyebrow">AMBIENTE INTERATIVO</span><h2>Localizar Organização</h2><p>Ande pelo corredor, aproxime-se de uma sala ativa e entre para acessar sua conta.</p></div><div class="locator-tools"><div class="floor-indicator"><small>PISO ATUAL</small><strong id="current-floor-label">Piso 1</strong><span>Use a escada para trocar</span></div><button type="button" id="movement-legend-button" class="movement-legend-button"><small>AJUDA</small><strong>Legenda de Movimentos</strong><span>Consultar controles</span></button></div></div>
          <form id="store-search-form" class="store-search" autocomplete="off"><label for="store-search">Pesquisar Organização</label><div><div class="store-combobox"><input id="store-search" role="combobox" aria-autocomplete="both" aria-expanded="false" aria-controls="store-options"><button type="button" id="toggle-store-options" aria-label="Exibir todas as organizações">⌄</button><div id="store-options" class="store-options" role="listbox" hidden>${directory.floors.flatMap(floor => floor.organizations).filter(organization => organization.status === 'active').map(organization => `<button type="button" role="option" data-store-option="${organization.name}">${organization.name}</button>`).join('')}</div></div><button type="submit">Ir correndo</button></div><span id="store-search-feedback" class="sr-only" aria-live="polite"></span></form>
          <div class="locator-game" tabindex="0" aria-label="Use as setas ou as teclas A e D para caminhar pelas salas."><div class="game-ceiling"><span>PISO <b id="floor-number">1</b></span><i></i><span>GATEGUARD DIRECTORY</span></div><div class="game-world"><div id="store-row" class="store-row"></div><div class="game-floor-lines"></div><div id="game-avatar" class="game-avatar"><span class="avatar-head"></span><span class="avatar-body"></span><span class="avatar-legs"></span></div></div><div id="game-prompt" class="game-prompt">Use ← → ou A D para caminhar</div></div>
          <div id="movement-legend-popup" class="movement-legend-popup" hidden><div><button type="button" id="close-movement-legend" aria-label="Fechar legenda">&times;</button><span>CONTROLES DO AMBIENTE</span><h3>Legenda de movimentos</h3><ul><li><kbd>W A S D</kbd><span>Caminhar pelo ambiente</span></li><li><kbd>↑ ↓ ← →</kbd><span>Movimentação alternativa</span></li><li><kbd>Mouse</kbd><span>Controlar a câmera</span></li><li><kbd>Espaço / Enter</kbd><span>Entrar na organização</span></li><li><kbd>Esc</kbd><span>Liberar o cursor</span></li></ul></div></div>
        </section>

        <section id="planos" class="plans-section public-screen" data-public-screen>
          <div class="plans-heading"><span class="public-eyebrow">PLANOS GATEGUARD</span><h2>Gestão de acessos e pagamentos</h2><p>O GateGuard autentica usuários, informa seus perfis e gerencia pagamentos sem depender do banco de dados utilizado pela organização.</p></div>
          <div class="plans-grid">
            <article class="plan-card"><h3>API de Pagamentos</h3><p>Emita pagamentos avulsos e faturas para clientes, com acompanhamento da situação financeira.</p><ul><li>Pagamentos avulsos</li><li>Emissão de faturas avulsas ou por cliente</li><li>Cadastro e autenticação de clientes</li><li>Histórico financeiro por cliente</li><li>Status ativo ou inativo do login</li><li>Acesso condicionado ao pagamento quando aplicável</li></ul><a href="${contactLink}" class="plan-contact">Consultar valor</a></article>
            <article class="plan-card"><h3>API de Acessos</h3><p>Autenticação de usuários e identificação do perfil e nível para uso no sistema da organização.</p><ul><li>Autenticação centralizada de usuários</li><li>Status ativo ou inativo do login</li><li>Perfis: gerente, supervisor e operador</li><li>Até 6 níveis de acesso e hierarquia</li><li>API de validação de perfil e nível</li><li>Compatível com bancos SQL e NoSQL</li></ul><a href="${contactLink}" class="plan-contact">Consultar valor</a></article>
            <article class="plan-card is-featured"><b class="recommended-badge">PLANO PLUS</b><h3>API de Pagamentos e Acessos</h3><p>Gestão financeira e autenticação operacional reunidas em uma única integração com o GateGuard.</p><ul><li>Todos os recursos da API de Pagamentos</li><li>Todos os recursos da API de Acessos</li><li>Autenticação de clientes e usuários internos</li><li>Perfil e nível informados à organização</li><li>Acesso condicionado ao pagamento quando aplicável</li><li>APIs integradas de pagamentos e acessos</li></ul><a href="${contactLink}" class="plan-contact">Consultar valor</a></article>
            <article class="plan-card is-coming-soon"><b class="coming-soon-badge">EM BREVE</b><h3>Segurança Avançada</h3><p>Camadas adicionais de proteção para organizações que precisam reforçar a segurança dos acessos.</p><ul><li>Autenticação multifator (MFA)</li><li>Autenticação biométrica</li><li>Reconhecimento facial</li><li>Proteção adicional contra acessos indevidos</li><li>Monitoramento e auditoria de autenticações</li><li>Recursos de cibersegurança em desenvolvimento</li></ul><span class="plan-contact is-disabled" aria-disabled="true">Em desenvolvimento</span></article>
          </div>
          <div class="plans-actions"><button type="button" id="compare-plans-button" class="compare-plans-button">Comparar Planos</button><p class="plans-pricing-note">* Taxa GateGuard de R$ 0,50 por transação</p></div>
          <dialog id="plans-comparison-modal" class="plans-comparison-modal" aria-labelledby="plans-comparison-title"><div class="plans-comparison"><button type="button" id="close-plans-comparison" class="plans-modal-close" aria-label="Fechar comparação">&times;</button><h3 id="plans-comparison-title">Comparação dos planos</h3><div class="plans-table-wrap"><table><thead><tr><th>Funcionalidade</th><th>Pagamentos Avulsos e Faturas</th><th>API de Acessos</th><th>Plus</th><th>Segurança Avançada<br><small>Em breve</small></th></tr></thead><tbody><tr><td>Pagamentos avulsos</td><td>✓</td><td>—</td><td>✓</td><td>—</td></tr><tr><td>Faturas avulsas ou por cliente</td><td>✓</td><td>—</td><td>✓</td><td>—</td></tr><tr><td>Login vinculado à situação financeira</td><td>✓</td><td>—</td><td>✓</td><td>—</td></tr><tr><td>Autenticação de usuários operacionais</td><td>—</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>Status ativo ou inativo do login</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>Perfis gerente, supervisor e operador</td><td>—</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>Até 6 níveis de acesso e hierarquia</td><td>—</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>API de validação de perfil e nível</td><td>—</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>Pagamentos e acessos integrados</td><td>—</td><td>—</td><td>✓</td><td>—</td></tr><tr><td>MFA, biometria e reconhecimento facial</td><td>—</td><td>—</td><td>—</td><td>Em breve</td></tr><tr><td>Compatível com bancos SQL e NoSQL</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr></tbody></table></div><p>O GateGuard autentica o usuário e informa seu perfil e nível. A organização determina as permissões de até 6 níveis de acesso e hierarquia e mantém seu próprio sistema e banco de dados. O perfil admin é reservado à administração interna do GateGuard. Os recursos de Segurança Avançada ainda estão em desenvolvimento.</p></div></dialog>
        </section>

        <section id="como-funciona" class="responsibilities-section public-screen" data-public-screen>
          <div class="responsibilities-heading"><span class="public-eyebrow">SIMPLES, SEGURO E SOB MEDIDA</span><h2>Como funciona o GateGuard?</h2><p>O GateGuard centraliza pagamentos e identidades sem interferir na tecnologia ou no banco de dados utilizado pela organização.</p></div>
          <div class="how-steps"><article><span>1</span><h3>Escolha seu plano</h3><p>Contrate pagamentos, autenticação de acessos ou os dois serviços no Plano Plus.</p></article><article><span>2</span><h3>Integre seu sistema</h3><p>O sistema da organização consulta as APIs do GateGuard para validar o login, o status e o perfil informado.</p></article><article><span>3</span><h3>Aplique suas permissões</h3><p>A organização decide o que cada perfil pode visualizar ou executar dentro do próprio sistema.</p></article></div>
          <div class="responsibilities-grid">
            <article><span>G</span><h3>O GateGuard cuida</h3><ul><li>Autenticação e status dos logins</li><li>Identificação do perfil do usuário</li><li>Pagamentos e liberações financeiras contratadas</li></ul></article>
            <article><span>O</span><h3>Sua organização mantém</h3><ul><li>Seu banco de dados e seu sistema</li><li>As permissões associadas a cada perfil</li><li>As regras e os processos do próprio negócio</li></ul></article>
          </div>
          <p class="responsibilities-limit"><strong>Responsabilidades bem definidas:</strong> o GateGuard confirma quem entrou e informa seu perfil e nível; a organização define as permissões de até 6 níveis de acesso e hierarquia.</p>
        </section>

        <section id="desenvolvedores" class="developer-section public-screen" data-public-screen>
          <div class="developer-copy"><span class="public-eyebrow">ÁREA PARA DESENVOLVEDORES</span><h2>Integração preparada para o seu backend</h2><p>Documentação prática para incorporar a chave privada, conectar o botão Entrar ao modal GateGuard e validar pagamentos e acessos sem expor credenciais no navegador.</p><ul><li>Integração segura entre servidores</li><li>Variável protegida no ambiente do backend</li><li>Modal de login reutilizável</li><li>Contrato da API, erros e checklist de homologação</li></ul><a class="developer-guide-cta" href="${developerGuideUrl}" target="_blank" rel="noopener">Abrir Guia de Instalação</a></div>
          <div class="developer-preview"><span>API_GATEGUARD</span><strong>Backend → GateGuard</strong><code>{"id_org":"ORG_XXXX","KEYGG":"gg_live_••••••••"}</code><p>A chave completa permanece somente no servidor do sistema integrado.</p></div>
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
