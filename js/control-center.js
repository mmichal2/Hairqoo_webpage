import { getLang } from "./i18n.js";
import { getCcDict } from "./cc-dict.js";
import {
  getFeedPage,
  getTrending,
  getByType,
  getTrendingTags,
  getCountriesAggregated,
  getCalendarEvents,
} from "./data/queries.js";

const MONTHS_PL = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PASSPORT_ICONS = ["🎓", "🎟", "✂", "✦"];
const PULSE_POS = [
  { left: "28%", top: "38%" },
  { left: "52%", top: "32%" },
  { left: "68%", top: "48%" },
  { left: "38%", top: "58%" },
];

let feedCursor = null;
let feedLoading = false;

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtNum(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
  return String(n);
}

function dict() {
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

function renderEntityCard(entity, d) {
  const img = entity.media?.[0]?.url ?? "./assets/images/sections/hero-home.jpg";
  const typeLabel = d.entityTypes[entity.type] ?? entity.type;
  const tall = isTallCard(entity.type);
  const video = isVideoCard(entity.type);
  const score = entity.score
    ? `<span class="cc-score">${entity.score}</span>`
    : "";
  const meta = [entity.country, entity.location].filter(Boolean).join(" · ");

  return `<a class="cc-glass cc-glass--interactive cc-card" href="#discover" data-entity="${esc(entity.id)}">
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

function renderFeedItem(entity, d) {
  const img = entity.media?.[0]?.url ?? "./assets/images/sections/hero-home.jpg";
  const typeLabel = d.entityTypes[entity.type] ?? entity.type;
  const tags = entity.tags.map((t) => `<span class="cc-feed__tag">#${esc(t)}</span>`).join("");
  const eng = entity.engagement;

  return `<article class="cc-glass cc-feed__item">
    <div class="cc-feed__media">
      <img src="${esc(img)}" alt="${esc(entity.title)}" loading="lazy" style="${mediaStyle(entity)}" />
      <span class="cc-feed__type">${esc(typeLabel)}</span>
    </div>
    <div class="cc-feed__body">
      <h3 class="cc-feed__title">${esc(entity.title)}</h3>
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

function sectionHeader(title, subtitle, anchor, seeAll, d) {
  return `<header class="cc-section__header">
    <div>
      <h2 class="cc-section__title strand-text">${esc(title)}</h2>
      <p class="cc-section__subtitle">${esc(subtitle)}</p>
    </div>
    <a class="cc-section__action" href="#${anchor}">${esc(seeAll)} →</a>
  </header>`;
}

function renderSearchBar(id, d, compact = false) {
  const tags = getTrendingTags(6);
  const tagHtml = tags
    .map((t) => `<button type="button" class="cc-search__tag" data-search-tag="${esc(t)}">#${esc(t)}</button>`)
    .join("");
  return `<div class="cc-search${compact ? " cc-search--compact" : ""}" id="${id}">
    <div class="cc-search__row">
      <input class="cc-search__input" type="search" placeholder="${esc(d.search.placeholder)}" aria-label="${esc(d.search.placeholder)}" />
      <button type="button" class="cc-search__submit">${esc(d.search.submit)}</button>
    </div>
    <div class="cc-search__trending" aria-label="${esc(d.search.trending)}">${tagHtml}</div>
  </div>`;
}

function renderHomepage(root) {
  const d = dict();
  const feedSeed = getFeedPage(null).items;
  const educationItems = [...getByType("academy", 4), ...getByType("event", 4)].slice(0, 8);
  const careerItems = [...getByType("salon", 2), ...getByType("academy", 2)];
  const awardTypes = [
    { key: "educatorOfYear", type: "educator" },
    { key: "eventOfYear", type: "event" },
    { key: "productOfYear", type: "product" },
  ];
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
    .map(([id, label]) => `<a class="cc-header__navLink" href="#${id}">${esc(label)}</a>`)
    .join("");

  const aiPrompts = d.ai.prompts
    .map((p) => `<button type="button" class="cc-ai__prompt">${esc(p)}</button>`)
    .join("");

  const calendarRows = getCalendarEvents(6)
    .map((ev) => {
      const dt = new Date(ev.dateEvent);
      const months = getLang() === "en" ? MONTHS_EN : MONTHS_PL;
      return `<li class="cc-calendar__row">
        <div class="cc-calendar__date">
          <span class="cc-calendar__day">${dt.getDate()}</span>
          <span class="cc-calendar__mon">${months[dt.getMonth()]}</span>
        </div>
        <div>
          <strong>${esc(ev.title)}</strong>
          <div style="font-size:0.82rem;color:var(--outline)">${esc(ev.location ?? "")}</div>
        </div>
      </li>`;
    })
    .join("");

  const mapCountries = getCountriesAggregated()
    .map(
      (c) => `<div class="cc-map__country">
        <span>${esc(c.country)}</span>
        <span class="cc-map__count">${c.count}</span>
      </div>`
    )
    .join("");

  const pulses = PULSE_POS.map(
    (p) => `<span class="cc-map__pulse" style="left:${p.left};top:${p.top}"></span>`
  ).join("");

  const jobs = careerItems
    .map((job, i) => {
      const role = d.career.roles[i % d.career.roles.length];
      return `<article class="cc-glass cc-job">
        <span class="cc-job__role">${esc(role)}</span>
        <h3>${esc(job.title)}</h3>
        <p class="cc-card__desc">${esc(job.location ?? job.country ?? "")}</p>
        <span class="cc-portal-tile__cta">${esc(d.career.apply)}</span>
      </article>`;
    })
    .join("");

  const awards = awardTypes
    .map((cat) => {
      const nominee = getByType(cat.type, 1)[0];
      if (!nominee) return "";
      return `<article class="cc-glass cc-award" data-award="${cat.type}">
        <span style="font-size:0.78rem;text-transform:uppercase;color:var(--outline)">${esc(d.awards[cat.key])}</span>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:1.8rem">🏆</span>
          <h3 style="margin:0">${esc(nominee.title)}</h3>
        </div>
        <button type="button" class="cc-award__vote">${esc(d.awards.vote)}</button>
      </article>`;
    })
    .join("");

  const passportItems = d.passport.items
    .map(
      (item, i) => `<li class="cc-passport__item">
        <span class="cc-passport__icon">${PASSPORT_ICONS[i] ?? "✦"}</span>
        <div>
          <span style="font-size:0.78rem;color:var(--primary);font-weight:600">${esc(item.year)}</span>
          <div>${esc(item.label)}</div>
        </div>
      </li>`
    )
    .join("");

  root.innerHTML = `
    <header class="cc-header">
      <div class="cc-header__inner">
        <a class="cc-header__brand" href="#">
          <img class="cc-header__logo" src="./assets/images/hairlab_icon.png" alt="" width="30" height="30" />
          <span class="cc-header__brandText">${esc(d.brand)}</span>
        </a>
        <nav class="cc-header__nav" aria-label="${esc(d.layout.mainNav)}">${navHtml}</nav>
      </div>
    </header>

    <div class="cc-mobile-search cc-container">${renderSearchBar("cc-search-mobile", d, true)}</div>

    <section class="cc-hero">
      <div class="cc-container">
        <p class="cc-hero__kicker">${esc(d.brand)}</p>
        <h1 class="cc-hero__title strand-text">${esc(d.hero.title)} <span class="strand-text">${esc(d.hero.highlight)}</span></h1>
        <p class="cc-hero__lead">${esc(d.hero.lead)}</p>
        <div class="cc-hero__search">${renderSearchBar("cc-search-hero", d)}</div>
      </div>
    </section>

    <div class="cc-section-pad">
      <div class="cc-container">
        <div class="cc-glass cc-ai__panel">
          <div class="cc-ai__badge">AI</div>
          <h2 class="cc-ai__title strand-text">${esc(d.ai.title)}</h2>
          <p class="cc-ai__subtitle">${esc(d.ai.subtitle)}</p>
          <div class="cc-ai__prompts">${aiPrompts}</div>
          <button type="button" class="cc-ai__openBtn" id="cc-ai-open">${esc(d.ai.open)}</button>
        </div>
      </div>
    </div>

    <section class="cc-portals cc-container" id="portals">
      <div class="cc-portals__grid">
        <div class="cc-portals__col">
          <h2 class="cc-portals__headline strand-text">${esc(d.portals.businessHeadline)}</h2>
          <button type="button" class="cc-glass cc-glass--interactive cc-portal-tile cc-portal-tile--salon portal-tile" data-portal="salon">
            <span class="cc-portal-tile__icon cc-portal-tile__icon--salon" aria-hidden="true">✂</span>
            <h3 class="cc-portal-tile__title">${esc(d.portals.salonTitle)}</h3>
            <p class="cc-portal-tile__desc">${esc(d.portals.salonDesc)}</p>
            <span class="cc-portal-tile__cta">${esc(d.portals.salonCta)}</span>
          </button>
        </div>
        <div class="cc-portals__col">
          <h2 class="cc-portals__headline cc-portals__headline--right strand-text">${esc(d.portals.clientHeadline)}</h2>
          <button type="button" class="cc-glass cc-glass--interactive cc-portal-tile cc-portal-tile--client portal-tile" data-portal="client">
            <span class="cc-portal-tile__icon cc-portal-tile__icon--client" aria-hidden="true">◇</span>
            <h3 class="cc-portal-tile__title">${esc(d.portals.clientTitle)}</h3>
            <p class="cc-portal-tile__desc">${esc(d.portals.clientDesc)}</p>
            <span class="cc-portal-tile__cta">${esc(d.portals.clientCta)}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="cc-section cc-container cc-container--feed" id="discover">
      <header class="cc-section__header">
        <div>
          <h2 class="cc-section__title strand-text">${esc(d.sections.discover)}</h2>
          <p class="cc-section__subtitle">${esc(d.sections.discoverSub)}</p>
        </div>
      </header>
      <div class="cc-feed" id="cc-feed">${feedSeed.map((e) => renderFeedItem(e, d)).join("")}</div>
      <p class="cc-feed__state" id="cc-feed-state" hidden></p>
    </section>

    <section class="cc-section cc-container" id="trending">
      ${sectionHeader(d.sections.trending, d.sections.trendingSub, "discover", d.sections.seeAll, d)}
      <div class="cc-hscroll">${getTrending(8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="events">
      ${sectionHeader(d.sections.events, d.sections.eventsSub, "events", d.sections.seeAll, d)}
      <div class="cc-hscroll">${getByType("event", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="calendar">
      ${sectionHeader(d.sections.calendar, d.sections.calendarSub, "calendar", d.sections.seeAll, d)}
      <div class="cc-glass cc-calendar__panel" style="padding:var(--space-lg)">
        <div class="cc-calendar__tabs">
          <button type="button" class="cc-calendar__tab cc-calendar__tab--on">${esc(d.calendar.month)}</button>
          <button type="button" class="cc-calendar__tab">${esc(d.calendar.week)}</button>
          <button type="button" class="cc-calendar__tab">${esc(d.calendar.year)}</button>
        </div>
        <ul style="list-style:none;margin:0;padding:0">${calendarRows}</ul>
      </div>
    </section>

    <section class="cc-section cc-container" id="map">
      ${sectionHeader(d.sections.map, d.sections.mapSub, "map", d.sections.seeAll, d)}
      <div class="cc-glass cc-map__panel">
        <div class="cc-map__globe"><div class="cc-map__grid"></div>${pulses}</div>
        <div>
          <p style="font-size:0.78rem;text-transform:uppercase;color:var(--outline)">${esc(d.map.ecosystemLabel)}</p>
          ${mapCountries}
        </div>
      </div>
    </section>

    <section class="cc-section cc-container" id="education">
      ${sectionHeader(d.sections.education, d.sections.educationSub, "education", d.sections.seeAll, d)}
      <div class="cc-hscroll">${educationItems.map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="educators">
      ${sectionHeader(d.sections.educators, d.sections.educatorsSub, "educators", d.sections.seeAll, d)}
      <div class="cc-hscroll">${getByType("educator", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="products">
      ${sectionHeader(d.sections.products, d.sections.productsSub, "products", d.sections.seeAll, d)}
      <div class="cc-hscroll">${getByType("product", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="community">
      ${sectionHeader(d.sections.community, d.sections.communitySub, "community", d.sections.seeAll, d)}
      <div class="cc-hscroll">${getByType("post", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="career">
      ${sectionHeader(d.sections.career, d.sections.careerSub, "career", d.sections.seeAll, d)}
      <div class="cc-grid">${jobs}</div>
    </section>

    <section class="cc-section cc-container" id="tv">
      ${sectionHeader(d.sections.tv, d.sections.tvSub, "tv", d.sections.seeAll, d)}
      <div class="cc-hscroll">${getByType("video", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="awards">
      ${sectionHeader(d.sections.awards, d.sections.awardsSub, "awards", d.sections.seeAll, d)}
      <div class="cc-awards__grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--space-md)">${awards}</div>
    </section>

    <section class="cc-section cc-container" id="passport">
      ${sectionHeader(d.sections.passport, d.sections.passportSub, "passport", d.sections.seeAll, d)}
      <div class="cc-glass cc-passport">
        <ol style="list-style:none;margin:0;padding:0">${passportItems}</ol>
      </div>
    </section>

    <div class="cc-section-pad">
      <div class="cc-container">
        <div class="cc-glass cc-newsletter" style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-xl);padding:var(--space-xl)">
          <div>
            <h2 class="strand-text" style="margin:0;font-size:clamp(1.4rem,3vw,2rem)">${esc(d.newsletter.title)}</h2>
            <p style="margin:8px 0 0;color:var(--muted)">${esc(d.newsletter.desc)}</p>
          </div>
          <form class="cc-newsletter__form" id="cc-newsletter-form">
            <input class="cc-newsletter__input" type="email" required placeholder="${esc(d.newsletter.placeholder)}" />
            <button type="submit" class="cc-newsletter__cta">${esc(d.newsletter.cta)}</button>
          </form>
        </div>
      </div>
    </div>

    <footer class="cc-footer">
      <div class="cc-container">
        <div class="cc-footer__top" style="display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:var(--space-xl)">
          <div>
            <div class="cc-footer__brand">${esc(d.brand)}</div>
            <p class="cc-footer__tagline">${esc(d.tagline)}</p>
          </div>
          <div>
            <div class="cc-footer__colTitle">${esc(d.footer.product)}</div>
            <a class="cc-footer__link" href="#discover">${esc(d.nav.discover)}</a>
            <a class="cc-footer__link" href="#events">${esc(d.nav.events)}</a>
          </div>
          <div>
            <div class="cc-footer__colTitle">${esc(d.footer.company)}</div>
            <a class="cc-footer__link" href="#career">${esc(d.nav.career)}</a>
            <a class="cc-footer__link" href="#passport">${esc(d.nav.passport)}</a>
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
    </footer>

    <nav class="cc-tabbar" aria-label="${esc(d.layout.mobileNav)}">
      <a class="cc-tabbar__tab cc-tabbar__tab--active" href="#"><span class="cc-tabbar__icon">⌂</span>${esc(d.layout.homeTab)}</a>
      <a class="cc-tabbar__tab" href="#discover"><span class="cc-tabbar__icon">✦</span>${esc(d.nav.discover)}</a>
      <a class="cc-tabbar__tab" href="#events"><span class="cc-tabbar__icon">📅</span>${esc(d.nav.events)}</a>
      <a class="cc-tabbar__tab" href="#map"><span class="cc-tabbar__icon">🌍</span>${esc(d.nav.map)}</a>
      <a class="cc-tabbar__tab" href="#educators"><span class="cc-tabbar__icon">🎓</span>${esc(d.nav.educators)}</a>
    </nav>
  `;
}

function bindInteractions(root, labyrinth) {
  root.querySelectorAll("[data-search-tag]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.searchTag;
      root.querySelectorAll(".cc-search__input").forEach((input) => {
        input.value = q;
      });
      document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  root.querySelectorAll(".cc-search__submit").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  root.querySelectorAll(".cc-ai__prompt").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
    });
  });

  document.getElementById("cc-ai-open")?.addEventListener("click", () => {
    document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
  });

  root.querySelectorAll(".cc-award__vote").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = dict();
      btn.textContent = d.awards.voted;
      btn.classList.add("cc-award__vote--voted");
      btn.disabled = true;
    });
  });

  const newsletterForm = document.getElementById("cc-newsletter-form");
  newsletterForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = dict();
    newsletterForm.innerHTML = `<p class="cc-newsletter__success">${esc(d.newsletter.success)}</p>`;
  });

  const feedEl = document.getElementById("cc-feed");
  const feedState = document.getElementById("cc-feed-state");
  feedCursor = String(getFeedPage(null).items.length);
  feedLoading = false;
  if (feedEl) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || feedLoading || feedCursor === "done") return;
        loadMoreFeed(feedEl, feedState);
      },
      { rootMargin: "200px" }
    );
    const sentinel = document.createElement("div");
    sentinel.id = "cc-feed-sentinel";
    feedEl.after(sentinel);
    observer.observe(sentinel);
  }

  // Re-bind portal tiles for labyrinth (after innerHTML replace)
  root.querySelectorAll("[data-portal]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!labyrinth || labyrinth.isTransitioning) return;
      const { portalTilePress } = await import("./motion.js");
      await portalTilePress(btn);
      await labyrinth.enterPortal(btn.dataset.portal);
    });
  });
}

function loadMoreFeed(feedEl, feedState) {
  if (feedLoading) return;
  feedLoading = true;
  const d = dict();
  feedState.hidden = false;
  feedState.textContent = d.common.loading;

  const page = getFeedPage(feedCursor);
  if (page.items.length === 0) {
    feedCursor = "done";
    feedState.textContent = d.feed.end;
    feedLoading = false;
    return;
  }

  feedEl.insertAdjacentHTML("beforeend", page.items.map((e) => renderFeedItem(e, d)).join(""));
  feedCursor = page.nextCursor ?? "done";
  feedState.hidden = feedCursor === "done";
  if (feedCursor === "done") feedState.textContent = d.feed.end;
  else feedState.textContent = "";
  feedLoading = false;
}

export function initControlCenter(labyrinth) {
  const gate = document.getElementById("gate");
  if (!gate) return;

  gate.classList.add("home-cc", "is-poster-ready");
  gate.innerHTML = '<div class="cc-app" id="cc-app"></div>';

  const root = document.getElementById("cc-app");
  renderHomepage(root);
  bindInteractions(root, labyrinth);

  window.addEventListener("hairqoo:lang", () => {
    renderHomepage(root);
    bindInteractions(root, labyrinth);
  });
}
