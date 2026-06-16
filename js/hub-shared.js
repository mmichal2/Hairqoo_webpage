import { getLang } from "./i18n.js";
import { getCcDict } from "./cc-dict.js";
import { getTrendingTags } from "./data/queries.js";
import { entityHref, homeSectionHref, searchHref, seeAllHref } from "./hub-routes.js";
import { bindVoiceButtons, isSpeechSupported } from "./speech-recognition.js";

export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function fmtNum(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
  return String(n);
}

export function dict() {
  return getCcDict(getLang());
}

function mediaStyle(entity) {
  const m = entity.media?.[0];
  if (!m?.focalPoint) return "";
  return `object-position: ${m.focalPoint}`;
}

function isTallCard(type) {
  return ["educator", "salon", "brand", "academy"].includes(type);
}

function isVideoCard(type) {
  return type === "video" || type === "post";
}

export function renderEntityCard(entity, d) {
  const img = entity.media?.[0]?.url ?? "./assets/images/sections/hero-home.jpg";
  const typeLabel = d.entityTypes[entity.type] ?? entity.type;
  const tall = isTallCard(entity.type);
  const video = isVideoCard(entity.type);
  const score = entity.score ? `<span class="cc-score">${entity.score}</span>` : "";
  const meta = [entity.country, entity.location].filter(Boolean).join(" · ");

  return `<a class="cc-glass cc-glass--interactive cc-card" href="${entityHref(entity)}">
    <div class="cc-card__media${tall ? " cc-card__media--tall" : ""}${video ? " cc-card__media--video" : ""}">
      <img src="${esc(img)}" alt="${esc(entity.title)}" loading="lazy" style="${mediaStyle(entity)}" />
      <span class="cc-card__typeTag">${esc(typeLabel)}</span>
      ${video ? '<div class="cc-card__play"><span>▶</span></div>' : ""}
    </div>
    <div class="cc-card__body">
      <h3 class="cc-card__title">${esc(entity.title)}</h3>
      <p class="cc-card__desc">${esc(entity.description)}</p>
      <div class="cc-card__meta">${esc(meta)} ${score}</div>
    </div>
  </a>`;
}

export function renderFeedItem(entity, d) {
  const img = entity.media?.[0]?.url ?? "./assets/images/sections/hero-home.jpg";
  const typeLabel = d.entityTypes[entity.type] ?? entity.type;
  const tags = entity.tags.map((t) => `<span class="cc-feed__tag">#${esc(t)}</span>`).join("");
  const eng = entity.engagement;
  const href = entityHref(entity);

  return `<article class="cc-glass cc-feed__item">
    <a class="cc-feed__media" href="${href}" style="display:block;color:inherit">
      <img src="${esc(img)}" alt="${esc(entity.title)}" loading="lazy" style="${mediaStyle(entity)}" />
      <span class="cc-feed__type">${esc(typeLabel)}</span>
    </a>
    <div class="cc-feed__body">
      <h3 class="cc-feed__title"><a href="${href}" style="color:inherit;text-decoration:none">${esc(entity.title)}</a></h3>
      <p class="cc-feed__desc">${esc(entity.description)}</p>
      <div class="cc-feed__footer">
        <div class="cc-feed__engagement">
          <span>👁 ${fmtNum(eng.views)}</span>
          <span>♥ ${fmtNum(eng.likes)}</span>
        </div>
        <div class="cc-feed__tags">${tags}</div>
      </div>
    </div>
  </article>`;
}

export function renderSearchBar(id, d) {
  const tags = getTrendingTags(6);
  const tagHtml = tags
    .map((t) => `<button type="button" class="cc-search__tag" data-search-tag="${esc(t)}">#${esc(t)}</button>`)
    .join("");
  const voiceBtn = isSpeechSupported()
    ? `<button type="button" class="cc-voice-btn" data-voice-btn data-voice-for="${esc(id)}" aria-label="${esc(d.search.voice ?? "Voice")}">🎙</button>`
    : "";
  return `<form class="cc-search" id="${id}-form" action="./search.html" method="get">
    <div class="cc-search__row">
      <input class="cc-search__input" id="${esc(id)}" name="q" type="search" placeholder="${esc(d.search.placeholder)}" aria-label="${esc(d.search.placeholder)}" />
      ${voiceBtn}
      <button type="submit" class="cc-search__submit">${esc(d.search.submit)}</button>
    </div>
    <div class="cc-search__trending" aria-label="${esc(d.search.trending)}">${tagHtml}</div>
  </form>`;
}

export function renderHubHeader(d, activeSection = null) {
  const navLinks = [
    ["discover", d.nav.discover],
    ["events", d.nav.events],
    ["calendar", d.nav.calendar],
    ["map", d.nav.map],
    ["education", d.nav.education],
    ["educators", d.nav.educators],
    ["products", d.nav.products],
    ["community", d.nav.community],
    ["career", d.nav.career],
    ["tv", d.nav.tv],
    ["awards", d.nav.awards],
    ["passport", d.nav.passport],
  ];
  const navHtml = navLinks
    .map(([id, label]) => {
      const href = activeSection === id ? "#" : seeAllHref(id);
      return `<a class="cc-header__navLink" href="${href}">${esc(label)}</a>`;
    })
    .join("");

  return `<header class="cc-header">
    <div class="cc-header__inner">
      <a class="cc-header__brand" href="./index.html">
        <img class="cc-header__logo" src="./assets/images/hairlab_icon.png" alt="" width="30" height="30" />
        <span class="cc-header__brandText">${esc(d.brand)}</span>
      </a>
      <nav class="cc-header__nav" aria-label="${esc(d.layout.mainNav)}">${navHtml}</nav>
    </div>
  </header>
  <div class="cc-mobile-search cc-container">${renderSearchBar("cc-search-mobile", d)}</div>`;
}

export function renderHubFooter(d) {
  return `<footer class="cc-footer">
    <div class="cc-container">
      <div class="cc-footer__top" style="display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:var(--space-xl)">
        <div>
          <div class="cc-footer__brand">${esc(d.brand)}</div>
          <p class="cc-footer__tagline">${esc(d.tagline)}</p>
        </div>
        <div>
          <div class="cc-footer__colTitle">${esc(d.footer.product)}</div>
          <a class="cc-footer__link" href="${homeSectionHref("discover")}">${esc(d.nav.discover)}</a>
          <a class="cc-footer__link" href="${homeSectionHref("events")}">${esc(d.nav.events)}</a>
        </div>
        <div>
          <div class="cc-footer__colTitle">${esc(d.footer.company)}</div>
          <a class="cc-footer__link" href="${homeSectionHref("career")}">${esc(d.nav.career)}</a>
          <a class="cc-footer__link" href="${homeSectionHref("passport")}">${esc(d.nav.passport)}</a>
        </div>
        <div>
          <div class="cc-footer__colTitle">${esc(d.footer.legal)}</div>
          <a class="cc-footer__link" href="./privacy.html">${esc(d.footer.privacy)}</a>
          <a class="cc-footer__link" href="./terms.html">${esc(d.footer.terms)}</a>
        </div>
      </div>
      <div class="cc-footer__bottom">
        <span>© ${new Date().getFullYear()} ${esc(d.brand)}. ${esc(d.footer.rights)}</span>
        <div style="display:flex;gap:14px"><span>@hairqoo</span></div>
      </div>
    </div>
  </footer>`;
}

export function renderHubTabbar(d, active = "home") {
  const tabs = [
    { id: "home", href: "./index.html", icon: "⌂", label: d.layout.homeTab },
    { id: "discover", href: "./listing.html?section=discover", icon: "✦", label: d.nav.discover },
    { id: "events", href: "./listing.html?section=events", icon: "📅", label: d.nav.events },
    { id: "map", href: "./map.html", icon: "🌍", label: d.nav.map },
    { id: "educators", href: "./listing.html?section=educators", icon: "🎓", label: d.nav.educators },
  ];
  const html = tabs
    .map(
      (t) =>
        `<a class="cc-tabbar__tab${active === t.id ? " cc-tabbar__tab--active" : ""}" href="${t.href}"><span class="cc-tabbar__icon">${t.icon}</span>${esc(t.label)}</a>`
    )
    .join("");
  return `<nav class="cc-tabbar" aria-label="${esc(d.layout.mobileNav)}">${html}</nav>`;
}

export function bindSearchTags(root) {
  root.querySelectorAll("[data-search-tag]").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = searchHref(btn.dataset.searchTag);
    });
  });
  bindVoiceButtons(root);
}

export { initIntelligence, bindAwardVotes } from "./intelligence/index.js";
export { getPassportProgress } from "./intelligence/passport-system.js";
