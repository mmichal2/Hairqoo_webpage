import {
  dict,
  esc,
  renderEntityCard,
  renderHubFooter,
  renderHubHeader,
  renderHubTabbar,
  bindSearchTags,
} from "../hub-shared.js?version=6.6.0";
import { getEntitiesByOwner } from "../data/queries.js?version=6.6.0";
import { bootHubPage } from "../hub-boot.js?version=6.6.0";

function getProfileId() {
  return new URLSearchParams(window.location.search).get("id") || "";
}

function render(root) {
  const id = getProfileId();
  const d = dict();
  const owned = id ? getEntitiesByOwner(id) : [];

  root.innerHTML = `
    ${renderHubHeader(d, null, { mobileSearch: false })}
    <main class="cc-container cc-listing-page">
      <a class="cc-back-link" href="./index.html">← ${esc(d.common?.backHome ?? "Wróć")}</a>
      <header class="cc-listing-head">
        <p style="text-transform:uppercase;letter-spacing:0.06em;color:var(--outline);font-size:0.8rem;margin:0">${esc(d.profile?.label ?? "Profil")}</p>
        <h1 class="cc-listing-title strand-text">${esc(id || "—")}</h1>
        <p class="cc-listing-subtitle">${owned.length} ${esc(d.profile?.itemsInEcosystem ?? d.common?.items ?? "pozycji")}</p>
      </header>
      ${
        owned.length
          ? `<div class="cc-grid">${owned.map((e) => renderEntityCard(e, d)).join("")}</div>`
          : `<p class="cc-listing-empty">${esc(d.common?.noFilterResults ?? "Brak pozycji")}</p>`
      }
    </main>
    ${renderHubFooter(d)}
    ${renderHubTabbar(d)}
  `;
  bindSearchTags(root);
}

bootHubPage(render);
