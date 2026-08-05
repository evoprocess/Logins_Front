import { api, state, shell, bindShell, PUBLIC_IMAGES_URL, API_URL } from '../main.js';
import '../manuals.css';

const esc = value => {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
};

const publicManuals = [{
  title: 'Guia Público de Implantação da API GateGuard',
  version: '1.0',
  summary: 'Material entregue aos desenvolvedores das organizações para integração backend-to-backend.',
  url: `${import.meta.env.BASE_URL}docs/Manual_Implantacao_API_GateGuard.pdf`
}];

function assertOwner() {
  return state.session?.organization?.id === 'ORG_0000';
}

function manualHtml(manual) {
  const toc = manual.sections.map(section => `<li><a href="#manual-${esc(section.id)}">${esc(section.title)}</a></li>`).join('');
  const sections = manual.sections.map(section => `<section id="manual-${esc(section.id)}" class="manual-section"><h2>${esc(section.title)}</h2>${section.html}</section>`).join('');
  const changes = manual.changes.map(change => `<tr><td>v${esc(change.version)}</td><td>${esc(change.date)}</td><td>${esc(change.description)}</td></tr>`).join('');
  return `<article class="manual-document">
    <header class="manual-cover"><div class="manual-cover-art" aria-hidden="true"><i></i><i></i><i></i></div><div class="manual-brand"><img src="${esc(PUBLIC_IMAGES_URL)}/gateguard_logo.png" alt="GateGuard"><span>${esc(manual.securityLabel)}</span></div><div class="manual-cover-copy"><small>GATEGUARD · ${esc(manual.code)}</small><h1>${esc(manual.title)}</h1><p>${esc(manual.subtitle)}</p></div><div class="manual-cover-version"><b>${esc(manual.code)} · Versão ${esc(manual.version)}</b><span>Atualizado em ${esc(manual.updatedAt)}</span><span>${esc(manual.status)}</span></div></header>
    <div class="manual-running-head"><img src="${esc(PUBLIC_IMAGES_URL)}/gateguard_logo.png" alt=""><span>${esc(manual.title)}</span><b>v${esc(manual.version)}</b></div>
    <section class="manual-meta"><div><small>Status</small><strong>${esc(manual.status)}</strong></div><div><small>Público interno</small><strong>${esc(manual.audience)}</strong></div></section>
    <section class="manual-toc"><h2>Sumário</h2><ol>${toc}<li><a href="#manual-history">Histórico de versões</a></li></ol></section>
    ${sections}
    <section id="manual-history" class="manual-section manual-history"><h2>Histórico de versões</h2><table><thead><tr><th>Versão</th><th>Data</th><th>Alteração</th></tr></thead><tbody>${changes}</tbody></table><p>Este quadro registra a evolução conceitual. Não é necessário manter cópias históricas separadas do manual.</p></section>
    <footer>GateGuard · ${esc(manual.title)} · v${esc(manual.version)}</footer>
  </article>`;
}

export async function manualsScreen(app) {
  if (!assertOwner()) return;
  app.innerHTML = shell(`<div class="manuals-workspace">
    <section id="manual-catalog"><div class="manuals-intro"><div><span>BASE DE CONHECIMENTO</span><h2>Manuais Internos</h2><p>Fonte de verdade para decisões de produto, segurança, implantação e operação.</p><div class="manual-legend"><b class="is-internal">INTERNO · somente ORG_0000/admin</b><b class="is-public">PÚBLICO · pode ser compartilhado</b></div></div><div class="manuals-rule"><b>Regra de visibilidade</b><p>Este ambiente inclui documentos internos e referências públicas. A área pública nunca exibe documentos internos.</p></div></div><h2 class="manual-group-title internal-title">Documentos internos protegidos</h2><div id="internal-manual-list" class="manual-grid"><p>Carregando manuais...</p></div><h2 class="manual-group-title public-title">Manuais públicos disponíveis para consulta interna</h2><div id="public-manual-list" class="manual-grid"></div></section>
    <section id="manual-viewer" hidden><div class="manual-toolbar"><button type="button" id="manual-back">← Todos os manuais</button><div><button type="button" id="manual-print">Imprimir</button><button type="button" id="manual-download">Baixar PDF oficial</button></div></div><div id="manual-content"></div></section>
  </div>`, 'Manuais Internos');
  bindShell();

  const publicList = app.querySelector('#public-manual-list');
  publicList.innerHTML = publicManuals.map(manual => `<a class="manual-card public-manual" href="${esc(manual.url)}" target="_blank" rel="noopener"><span>MANUAL PÚBLICO</span><h3>${esc(manual.title)}</h3><p>${esc(manual.summary)}</p><footer><b>v${esc(manual.version)}</b><i>Abrir PDF ↗</i></footer></a>`).join('');

  try {
    const { manuals } = await api('/api/internal-manuals');
    const list = app.querySelector('#internal-manual-list');
    list.innerHTML = manuals.map(manual => `<button type="button" class="manual-card internal-manual security-${esc(manual.securityLevel.toLowerCase())}" data-manual="${esc(manual.slug)}"><span>MANUAL INTERNO · ${esc(manual.code)}</span><em>${esc(manual.securityLabel)}</em><h3>${esc(manual.title)}</h3><p>${esc(manual.summary)}</p><footer><b>v${esc(manual.version)}</b><i>${manual.sectionCount} seções →</i></footer></button>`).join('');
    list.querySelectorAll('[data-manual]').forEach(button => {
      button.onclick = async () => {
        button.disabled = true;
        try {
          const { manual } = await api(`/api/internal-manuals/${encodeURIComponent(button.dataset.manual)}`);
          app.querySelector('#manual-viewer').dataset.slug = manual.slug;
          app.querySelector('#manual-viewer').dataset.filename = `${manual.code}_v${manual.version}.pdf`;
          app.querySelector('#manual-content').innerHTML = manualHtml(manual);
          app.querySelector('#manual-catalog').hidden = true;
          app.querySelector('#manual-viewer').hidden = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) { alert(error.message); }
        finally { button.disabled = false; }
      };
    });
  } catch (error) {
    app.querySelector('#internal-manual-list').innerHTML = `<p class="error">${esc(error.message)}</p>`;
  }

  app.querySelector('#manual-back').onclick = () => {
    app.querySelector('#manual-viewer').hidden = true;
    app.querySelector('#manual-catalog').hidden = false;
    app.querySelector('#manual-content').innerHTML = '';
  };
  app.querySelector('#manual-print').onclick = () => window.print();
  app.querySelector('#manual-download').onclick = async () => {
    const viewer = app.querySelector('#manual-viewer');
    const download = app.querySelector('#manual-download');
    download.disabled = true;
    try {
      const response = await fetch(`${API_URL}/api/internal-manuals/${encodeURIComponent(viewer.dataset.slug)}/pdf`, { headers: { authorization: `Bearer ${state.token}` } });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'Não foi possível baixar o PDF.'); }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = viewer.dataset.filename; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { alert(error.message); }
    finally { download.disabled = false; }
  };
}
