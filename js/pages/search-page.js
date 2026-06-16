import {
  dict,
  esc,
  renderEntityCard,
  renderHubFooter,
  renderHubHeader,
  renderHubTabbar,
  bindSearchTags,
  renderSearchBar,
} from "../hub-shared.js";
import { search } from "../data/queries.js";
import { bootHubPage } from "../hub-boot.js";

function render(root) {
  const q = new URLSearchParams(window.location.search).get("q") || "";
  const d = dict();
  const groups = q ? search(q) : [];

  const body =
    !q
      ? `<p class="cc-listing-empty">${esc(d.search?.placeholder ?? "")}</p>`
      : groups.length === 0
        ? `<p class="cc-listing-empty">${esc(d.search?.noResults ?? "Brak wyników")}</p>`
        : groups
            .map((g) => {
              const label = d.entityTypes[g.type] ?? g.type;
              return `<section class="cc-search-group">
              <h2 class="cc-search-group-title">${esc(label)} (${g.items.length})</h2>
              <div class="cc-grid">${g.items.map((e) => renderEntityCard(e, d)).join("")}</div>
            </section>`;
            })
            .join("");

  root.innerHTML = `
    ${renderHubHeader(d)}
    <main class="cc-container cc-listing-page">
      <header class="cc-listing-head">
        <a class="cc-back-link" href="./index.html">← ${esc(d.common?.backHome ?? "Wróć")}</a>
        <h1 class="cc-listing-title strand-text">${q ? `${esc(d.search?.resultsFor ?? "Wyniki dla")}: “${esc(q)}”` : esc(d.search?.placeholder ?? "Szukaj")}</h1>
      </header>
      <div style="margin-bottom:var(--space-xl)">${renderSearchBar("cc-search-page", d)}</div>
      ${body}
    </main>
    ${renderHubFooter(d)}
    ${renderHubTabbar(d, "discover")}
  `;
  bindSearchTags(root);
}

bootHubPage(render);
