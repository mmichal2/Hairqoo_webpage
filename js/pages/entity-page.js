import {
  dict,
  esc,
  fmtNum,
  renderEntityCard,
  renderHubFooter,
  renderHubHeader,
  renderHubTabbar,
  bindSearchTags,
} from "../hub-shared.js";
import { getEntityById, getByType } from "../data/queries.js";
import { profileHref } from "../hub-routes.js";
import { bootHubPage } from "../hub-boot.js";

function render(root) {
  const p = new URLSearchParams(window.location.search);
  const type = p.get("type");
  const id = p.get("id");
  const d = dict();
  const entity = type && id ? getEntityById(type, id) : null;

  if (!entity) {
    root.innerHTML = `
      ${renderHubHeader(d)}
      <main class="cc-container cc-listing-page">
        <p class="cc-listing-empty">Nie znaleziono pozycji.</p>
        <a class="cc-back-link" href="./index.html">← ${esc(d.common?.backHome ?? "Wróć")}</a>
      </main>
      ${renderHubFooter(d)}
    `;
    return;
  }

  const cover = entity.media?.[0];
  const related = getByType(entity.type, 5).filter((e) => e.id !== entity.id).slice(0, 4);
  const meta = [entity.location, entity.country, entity.dateEvent].filter(Boolean).join(" · ");
  const tags = entity.tags.map((t) => `<li class="cc-entity-tag">#${esc(t)}</li>`).join("");
  const eng = entity.engagement;

  root.innerHTML = `
    ${renderHubHeader(d)}
    <main class="cc-container cc-entity-page">
      <a class="cc-back-link" href="./index.html">← ${esc(d.common?.backHome ?? "Wróć na stronę główną")}</a>
      <article class="cc-entity-detail">
        <div class="cc-entity-hero">
          ${cover ? `<img src="${esc(cover.url)}" alt="${esc(entity.title)}" style="object-position:${cover.focalPoint ?? "center"}" />` : ""}
        </div>
        <div class="cc-entity-head">
          <div class="cc-entity-badges">
            <span class="cc-entity-type">${esc(d.entityTypes[entity.type] ?? entity.type)}</span>
            ${entity.verified ? `<span class="cc-score">${esc(d.common?.verified ?? "Zweryfikowane")}</span>` : ""}
            ${entity.score ? `<span class="cc-score">${entity.score}</span>` : ""}
          </div>
          <h1 class="cc-entity-title strand-text">${esc(entity.title)}</h1>
          <p class="cc-entity-meta">${esc(meta)}</p>
          ${entity.ownerId ? `<p class="cc-entity-meta"><a class="cc-back-link" href="${profileHref(entity.ownerId)}">${esc(d.common?.profile ?? "Profil")}: ${esc(entity.ownerId)}</a></p>` : ""}
          <p class="cc-entity-desc">${esc(entity.description)}</p>
          <ul class="cc-entity-tags">${tags}</ul>
          <div class="cc-glass cc-entity-stats">
            <span>👁 ${fmtNum(eng.views)}</span>
            <span>♥ ${fmtNum(eng.likes)}</span>
            <span>🔖 ${fmtNum(eng.saves)}</span>
            <span>↗ ${fmtNum(eng.shares)}</span>
          </div>
        </div>
        ${
          related.length
            ? `<section class="cc-entity-related">
            <h2>${esc(d.common?.similar ?? "Podobne")}</h2>
            <div class="cc-grid">${related.map((e) => renderEntityCard(e, d)).join("")}</div>
          </section>`
            : ""
        }
      </article>
    </main>
    ${renderHubFooter(d)}
    ${renderHubTabbar(d)}
  `;
  bindSearchTags(root);
}

bootHubPage(render);
