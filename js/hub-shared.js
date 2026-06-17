import { getLang } from "./i18n.js?version=6.6.0";
import { getCcDict } from "./cc-dict.js?version=6.6.0";
import { getTrendingTags } from "./data/queries.js?version=6.6.0";
import { entityHref, homeSectionHref, searchHref, seeAllHref } from "./hub-routes.js?version=6.6.0";
import { bindVoiceButtons, isSpeechSupported } from "./speech-recognition.js?version=6.6.0";
import { hairqooBrandMarkup } from "./brand-logo.js?version=6.6.0";
import { icon } from "./icons.js?version=6.6.0";

/** Główne pozycje nawigacji w headerze (reszta dostępna w stopce). */
export const PRIMARY_NAV = [
  "discover",
  "events",
  "calendar",
  "map",
  "educators",
  "products",
];

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

/** ETAP 6.6 — read-only AI visibility metrics from enriched entity (no scoring logic). */
export function readAIVisibility(entity) {
  if (!entity) return null;
  const intel = entity.intelligence;
  const bd = entity.globalBrain?.scoreBreakdown;
  const hairQooScore =
    entity.score ??
    entity.hairqooScore ??
    intel?.hairQooScore?.score ??
    (bd ? Math.round(bd.hairQooScore * 100) : null);
  const popularity =
    intel?.popularityIndex ?? (bd ? Math.round(bd.engagementScore * 100) : null);
  return {
    hairQooScore: hairQooScore != null ? Math.round(hairQooScore) : null,
    verified: Boolean(intel?.verifiedStatus?.verified ?? entity.verified),
    popularity: popularity != null ? Math.round(popularity) : null,
    countryBoost: bd?.regionalBoost != null ? Math.round(bd.regionalBoost * 100) : null,
    recencyBoost:
      bd?.searchRelevanceScore != null ? Math.round(bd.searchRelevanceScore * 100) : null,
    globalScore:
      entity.globalIntelligenceScore != null
        ? Math.round(entity.globalIntelligenceScore * 100)
        : null,
  };
}

function pctLabel(value) {
  return value == null ? "—" : `${value}`;
}

/** Compact score row for cards and feed items. */
export function renderEntityAIInsight(entity, d) {
  const vis = readAIVisibility(entity);
  if (!vis) return "";
  const labels = d.aiVisibility ?? {};
  const verifiedLabel = vis.verified
    ? (labels.verifiedYes ?? "Verified")
    : (labels.verifiedNo ?? "Unverified");
  return `<div class="cc-ai-insight" aria-label="${esc(labels.panelTitle ?? "AI ranking")}">
    <span class="cc-ai-insight__title">${esc(labels.whySeeing ?? "Why am I seeing this?")}</span>
    <dl class="cc-ai-insight__grid">
      <div><dt>${esc(labels.hairQooScore ?? "HairQoo Score")}</dt><dd>${pctLabel(vis.hairQooScore)}</dd></div>
      <div><dt>${esc(labels.verified ?? "Verified")}</dt><dd>${esc(verifiedLabel)}</dd></div>
      <div><dt>${esc(labels.popularity ?? "Popularity")}</dt><dd>${pctLabel(vis.popularity)}</dd></div>
      <div><dt>${esc(labels.countryBoost ?? "Country boost")}</dt><dd>${pctLabel(vis.countryBoost)}</dd></div>
      <div><dt>${esc(labels.recencyBoost ?? "Recency boost")}</dt><dd>${pctLabel(vis.recencyBoost)}</dd></div>
    </dl>
  </div>`;
}

/** Search page — AI ranking explanation for top result (display only). */
export function renderSearchRankingExplanation(query, groups, d) {
  if (!query?.trim()) return "";
  const flat = groups.flatMap((g) => g.items ?? []);
  const top = flat[0];
  if (!top) return "";
  const vis = readAIVisibility(top);
  const labels = d.aiVisibility ?? {};
  return `<aside class="cc-ai-explain cc-glass" aria-labelledby="cc-ai-explain-title">
    <h2 id="cc-ai-explain-title" class="cc-ai-explain__title">${esc(labels.rankingTitle ?? "AI ranking explanation")}</h2>
    <p class="cc-ai-explain__lead">${esc(labels.rankingLead ?? "Score breakdown preview for the top match (read-only).")}</p>
    <p class="cc-ai-explain__entity"><strong>${esc(top.title)}</strong></p>
    ${renderEntityAIInsight(top, d)}
  </aside>`;
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
  const aiInsight = renderEntityAIInsight(entity, d);

  return `<a class="cc-glass cc-glass--interactive cc-card" href="${entityHref(entity)}">
    <div class="cc-card__media${tall ? " cc-card__media--tall" : ""}${video ? " cc-card__media--video" : ""}">
      <img src="${esc(img)}" alt="${esc(entity.title)}" loading="lazy" style="${mediaStyle(entity)}" />
      <span class="cc-card__typeTag">${esc(typeLabel)}</span>
      ${video ? `<div class="cc-card__play"><span>${icon("play")}</span></div>` : ""}
    </div>
    <div class="cc-card__body">
      <h3 class="cc-card__title">${esc(entity.title)}</h3>
      <p class="cc-card__desc">${esc(entity.description)}</p>
      <div class="cc-card__meta">${esc(meta)} ${score}</div>
      ${aiInsight}
    </div>
  </a>`;
}

export function renderFeedItem(entity, d) {
  const img = entity.media?.[0]?.url ?? "./assets/images/sections/hero-home.jpg";
  const typeLabel = d.entityTypes[entity.type] ?? entity.type;
  const tags = entity.tags.map((t) => `<span class="cc-feed__tag">#${esc(t)}</span>`).join("");
  const eng = entity.engagement;
  const href = entityHref(entity);
  const aiInsight = renderEntityAIInsight(entity, d);

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
          <span>${icon("eye")} ${fmtNum(eng.views)}</span>
          <span>${icon("heart")} ${fmtNum(eng.likes)}</span>
        </div>
        <div class="cc-feed__tags">${tags}</div>
      </div>
      ${aiInsight}
    </div>
  </article>`;
}

export function renderSearchBar(id, d, { compact = false } = {}) {
  const tags = getTrendingTags(6);
  const tagHtml = tags
    .map((t) => `<button type="button" class="cc-search__tag" data-search-tag="${esc(t)}">#${esc(t)}</button>`)
    .join("");
  const voiceBtn = isSpeechSupported()
    ? `<button type="button" class="cc-voice-btn" data-voice-btn data-voice-for="${esc(id)}" aria-label="${esc(d.search.voice ?? "Voice")}">${icon("mic")}</button>`
    : "";
  const placeholder = compact && d.search.placeholderShort ? d.search.placeholderShort : d.search.placeholder;
  const submitBtn = compact
    ? `<button type="submit" class="cc-search__submit cc-search__submit--icon" aria-label="${esc(d.search.submit)}">
        <span class="cc-search__submitIcon" aria-hidden="true">${icon("search")}</span>
      </button>`
    : `<button type="submit" class="cc-search__submit" aria-label="${esc(d.search.submit)}">
        <span class="cc-search__submitLabel">${esc(d.search.submit)}</span>
        <span class="cc-search__submitIcon" aria-hidden="true">${icon("search")}</span>
      </button>`;
  return `<form class="cc-search" id="${id}-form" action="./search.html" method="get">
    <div class="cc-search__row">
      <input class="cc-search__input" id="${esc(id)}" name="q" type="search" placeholder="${esc(placeholder)}" aria-label="${esc(d.search.placeholder)}" />
      ${voiceBtn}
      ${submitBtn}
    </div>
    <div class="cc-search__trending" aria-label="${esc(d.search.trending)}">${tagHtml}</div>
  </form>`;
}

export function renderHubHeader(d, activeSection = null, { mobileSearch = true } = {}) {
  const slimClass = mobileSearch ? "" : " cc-top-chrome--slim";
  const searchBlock = mobileSearch
    ? `<div class="cc-mobile-search cc-container">${renderSearchBar("cc-search-mobile", d, { compact: true })}</div>`
    : "";
  return `<div class="cc-top-chrome${slimClass}">
    <header class="cc-header">
      <div class="cc-header__inner">
        <a class="cc-header__brand" href="./index.html">
          ${hairqooBrandMarkup({ size: "sm" })}
        </a>
        <nav class="cc-header__nav" aria-label="${esc(d.layout.mainNav)}">${renderHubNav(d, activeSection)}</nav>
      </div>
    </header>
    ${searchBlock}
  </div>`;
}

/** Wspólna nawigacja headera — używana przez homepage i podstrony hub. */
export function renderHubNav(d, activeSection = null) {
  return PRIMARY_NAV.map((id) => {
    const label = d.nav[id] ?? id;
    const isActive = activeSection === id;
    const href = isActive ? "#" : seeAllHref(id);
    return `<a class="cc-header__navLink${isActive ? " cc-header__navLink--active" : ""}"${
      isActive ? ' aria-current="page"' : ""
    } href="${href}">${esc(label)}</a>`;
  }).join("");
}

export function renderHubFooter(d) {
  return `<footer class="cc-footer">
    <div class="cc-container">
      <div class="cc-footer__top">
        <div class="cc-footer__intro">
          <div class="cc-footer__brand">${hairqooBrandMarkup({ size: "sm" })}</div>
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
    { id: "home", href: "./index.html", icon: "home", label: d.layout.homeTab },
    { id: "discover", href: "./listing.html?section=discover", icon: "discover", label: d.nav.discover },
    { id: "events", href: "./listing.html?section=events", icon: "events", label: d.nav.events },
    { id: "map", href: "./map.html", icon: "map", label: d.nav.map },
    { id: "educators", href: "./listing.html?section=educators", icon: "educators", label: d.nav.educators },
  ];
  const html = tabs
    .map(
      (t) =>
        `<a class="cc-tabbar__tab${active === t.id ? " cc-tabbar__tab--active" : ""}" href="${t.href}"><span class="cc-tabbar__icon">${icon(t.icon)}</span>${esc(t.label)}</a>`
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

export { initIntelligence, bindAwardVotes } from "./intelligence/index.js?version=6.6.0";
export { getPassportProgress } from "./intelligence/passport-system.js?version=6.6.0";
