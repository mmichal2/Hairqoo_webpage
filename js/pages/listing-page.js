import { LISTING_SECTIONS } from "../hub-routes.js?version=6.6.0";
import {
  dict,
  esc,
  renderEntityCard,
  renderHubFooter,
  renderHubHeader,
  renderHubTabbar,
  bindSearchTags,
} from "../hub-shared.js?version=6.6.0";
import { filterEntities, getCountries, getTrendingTags } from "../data/queries.js?version=6.6.0";
import { bootHubPage } from "../hub-boot.js?version=6.6.0";

function getSection() {
  const p = new URLSearchParams(window.location.search);
  const s = p.get("section") || "discover";
  return LISTING_SECTIONS[s] ? s : "discover";
}

function render(root) {
  const section = getSection();
  const cfg = LISTING_SECTIONS[section];
  const d = dict();
  const title = d.sections[section];
  const subtitle = d.sections[`${section}Sub`];
  const country = new URLSearchParams(window.location.search).get("country") || "";
  const tag = new URLSearchParams(window.location.search).get("tag") || "";
  const tags = tag ? [tag] : [];

  const items = filterEntities({
    types: cfg.types,
    country: country || undefined,
    tags,
  });

  const countries = getCountries();
  const topTags = getTrendingTags(10);

  const countryOptions = countries
    .map(
      (c) =>
        `<option value="${esc(c)}"${c === country ? " selected" : ""}>${esc(c)}</option>`
    )
    .join("");

  const tagChips = topTags
    .map((t) => {
      const active = t === tag;
      const params = new URLSearchParams({ section });
      if (country) params.set("country", country);
      if (!active) params.set("tag", t);
      return `<a class="cc-filter-chip${active ? " cc-filter-chip--on" : ""}" href="./listing.html?${params.toString()}">#${esc(t)}</a>`;
    })
    .join("");

  const grid =
    items.length === 0
      ? `<p class="cc-listing-empty">${esc(d.common?.noFilterResults ?? "Brak wyników")}</p>`
      : `<div class="cc-grid">${items.map((e) => renderEntityCard(e, d)).join("")}</div>`;

  root.innerHTML = `
    ${renderHubHeader(d, section, { mobileSearch: false })}
    <main class="cc-container cc-listing-page">
      <header class="cc-listing-head">
        <a class="cc-back-link" href="./index.html">← ${esc(d.common?.backHome ?? "Wróć na stronę główną")}</a>
        <h1 class="cc-listing-title strand-text">${esc(title)}</h1>
        <p class="cc-listing-subtitle">${esc(subtitle)}</p>
      </header>
      <div class="cc-listing-filters">
        <form class="cc-country-filter" method="get">
          <input type="hidden" name="section" value="${esc(section)}" />
          ${tag ? `<input type="hidden" name="tag" value="${esc(tag)}" />` : ""}
          <label>
            <span class="cc-filter-label">${esc(d.common?.country ?? "Kraj")}</span>
            <select name="country" onchange="this.form.submit()">
              <option value="">${esc(d.common?.allCountries ?? "Wszystkie kraje")}</option>
              ${countryOptions}
            </select>
          </label>
        </form>
        <div class="cc-tag-chips">${tagChips}</div>
      </div>
      ${grid}
    </main>
    ${renderHubFooter(d)}
    ${renderHubTabbar(d, section === "discover" ? "discover" : section)}
  `;
  bindSearchTags(root);
}

bootHubPage(render);
