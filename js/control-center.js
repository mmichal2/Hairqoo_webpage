import { getLang } from "./i18n.js";
import {
  getFeedPage,
  getTrending,
  getByType,
  getCountriesAggregated,
  getCalendarEventsByView,
  getAwardLeader,
} from "./data/queries.js";
import { seeAllHref, entityHref } from "./hub-routes.js";
import { openAIWithPrompt } from "./ai-assistant.js";
import {
  esc,
  dict,
  renderEntityCard,
  renderFeedItem,
  renderSearchBar,
  renderHubFooter,
  renderHubTabbar,
  renderHubNav,
  bindSearchTags,
  bindAwardVotes,
} from "./hub-shared.js";
import { hairqooBrandMarkup } from "./brand-logo.js";
import { icon } from "./icons.js";
import { renderPassportPanel } from "./hub-passport.js";

const MONTHS_PL = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PULSE_POS = [
  { left: "28%", top: "38%" },
  { left: "52%", top: "32%" },
  { left: "68%", top: "48%" },
  { left: "38%", top: "58%" },
];

const DISCOVER_FEED_LIMIT = 18;

let feedCursor = null;
let feedLoading = false;

function sectionHeader(title, subtitle, sectionKey, seeAll) {
  return `<header class="cc-section__header">
    <div>
      <h2 class="cc-section__title strand-text">${esc(title)}</h2>
      <p class="cc-section__subtitle">${esc(subtitle)}</p>
    </div>
    <a class="cc-section__action" href="${seeAllHref(sectionKey)}">${esc(seeAll)} →</a>
  </header>`;
}

function renderCalendarRows(view = "month") {
  const d = dict();
  const months = getLang() === "en" ? MONTHS_EN : MONTHS_PL;
  return getCalendarEventsByView(view, 6)
    .map((ev) => {
      const dt = new Date(ev.dateEvent);
      return `<li class="cc-calendar__row">
        <div class="cc-calendar__date">
          <span class="cc-calendar__day">${dt.getDate()}</span>
          <span class="cc-calendar__mon">${months[dt.getMonth()]}</span>
        </div>
        <div>
          <a href="${entityHref(ev)}" style="color:var(--text);font-weight:600;text-decoration:none">${esc(ev.title)}</a>
          <div style="font-size:0.82rem;color:var(--outline)">${esc(ev.location ?? "")}</div>
        </div>
      </li>`;
    })
    .join("");
}

function renderHomepage(root) {
  const d = dict();
  const feedPage = getFeedPage(null, DISCOVER_FEED_LIMIT);
  const feedSeed = feedPage.items;
  const educationItems = [...getByType("academy", 4), ...getByType("event", 4)].slice(0, 8);
  const careerItems = [...getByType("salon", 2), ...getByType("academy", 2)];
  const awardTypes = [
    { key: "educatorOfYear", type: "educator", category: "educator_of_year" },
    { key: "eventOfYear", type: "event", category: "event_of_year" },
    { key: "productOfYear", type: "product", category: "product_of_year" },
  ];
  const navHtml = renderHubNav(d);

  const aiPrompts = d.ai.prompts
    .map((p) => `<button type="button" class="cc-ai__prompt">${esc(p)}</button>`)
    .join("");

  const calendarRows = renderCalendarRows("month");

  const mapCountries = getCountriesAggregated()
    .map(
      (c) => `<a class="cc-map__country" href="./map.html?country=${encodeURIComponent(c.country)}" style="text-decoration:none;color:inherit">
        <span>${esc(c.country)}</span>
        <span class="cc-map__count">${c.count}</span>
      </a>`
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
      const nominee = getAwardLeader(cat.category) ?? getByType(cat.type, 1)[0];
      if (!nominee) return "";
      return `<article class="cc-glass cc-award" data-award="${cat.type}" data-entity-id="${esc(nominee.id)}">
        <span style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--outline)">${esc(d.awards[cat.key])}</span>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="cc-award__medal" aria-hidden="true">${icon("awards")}</span>
          <h3 style="margin:0">${esc(nominee.title)}</h3>
        </div>
        <button type="button" class="cc-award__vote">${esc(d.awards.vote)}</button>
      </article>`;
    })
    .join("");

  root.innerHTML = `
    <div class="cc-top-chrome">
      <header class="cc-header">
        <div class="cc-header__inner">
          <a class="cc-header__brand" href="./index.html">
            ${hairqooBrandMarkup({ size: "sm" })}
          </a>
          <nav class="cc-header__nav" aria-label="${esc(d.layout.mainNav)}">${navHtml}</nav>
        </div>
      </header>
      <div class="cc-mobile-search cc-container">${renderSearchBar("cc-search-mobile", d, { compact: true })}</div>
    </div>

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
            <span class="cc-portal-tile__icon cc-portal-tile__icon--salon" aria-hidden="true">${icon("salon")}</span>
            <h3 class="cc-portal-tile__title">${esc(d.portals.salonTitle)}</h3>
            <p class="cc-portal-tile__desc">${esc(d.portals.salonDesc)}</p>
            <span class="cc-portal-tile__cta">${esc(d.portals.salonCta)}</span>
          </button>
        </div>
        <div class="cc-portals__col">
          <h2 class="cc-portals__headline cc-portals__headline--right strand-text">${esc(d.portals.clientHeadline)}</h2>
          <button type="button" class="cc-glass cc-glass--interactive cc-portal-tile cc-portal-tile--client portal-tile" data-portal="client">
            <span class="cc-portal-tile__icon cc-portal-tile__icon--client" aria-hidden="true">${icon("client")}</span>
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
        <a class="cc-section__action" href="${seeAllHref("discover")}">${esc(d.sections.seeAll)} →</a>
      </header>
      <div class="cc-feed" id="cc-feed">${feedSeed.map((e) => renderFeedItem(e, d)).join("")}</div>
      <p class="cc-feed__state" id="cc-feed-state" hidden></p>
    </section>

    <section class="cc-section cc-container" id="trending">
      ${sectionHeader(d.sections.trending, d.sections.trendingSub, "discover", d.sections.seeAll)}
      <div class="cc-hscroll">${getTrending(8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="events">
      ${sectionHeader(d.sections.events, d.sections.eventsSub, "events", d.sections.seeAll)}
      <div class="cc-hscroll">${getByType("event", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="calendar">
      ${sectionHeader(d.sections.calendar, d.sections.calendarSub, "calendar", d.sections.seeAll)}
      <div class="cc-glass cc-calendar__panel" style="padding:var(--space-lg)">
        <div class="cc-calendar__tabs" data-calendar-tabs>
          <button type="button" class="cc-calendar__tab cc-calendar__tab--on" data-calendar-view="month">${esc(d.calendar.month)}</button>
          <button type="button" class="cc-calendar__tab" data-calendar-view="week">${esc(d.calendar.week)}</button>
          <button type="button" class="cc-calendar__tab" data-calendar-view="year">${esc(d.calendar.year)}</button>
        </div>
        <ul id="cc-calendar-list" style="list-style:none;margin:0;padding:0">${calendarRows}</ul>
      </div>
    </section>

    <section class="cc-section cc-container" id="map">
      ${sectionHeader(d.sections.map, d.sections.mapSub, "map", d.sections.seeAll)}
      <div class="cc-glass cc-map__panel">
        <div class="cc-map__globe"><div class="cc-map__grid"></div>${pulses}</div>
        <div>
          <p style="font-size:0.78rem;text-transform:uppercase;color:var(--outline)">${esc(d.map.ecosystemLabel)}</p>
          ${mapCountries}
        </div>
      </div>
    </section>

    <section class="cc-section cc-container" id="education">
      ${sectionHeader(d.sections.education, d.sections.educationSub, "education", d.sections.seeAll)}
      <div class="cc-hscroll">${educationItems.map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="educators">
      ${sectionHeader(d.sections.educators, d.sections.educatorsSub, "educators", d.sections.seeAll)}
      <div class="cc-hscroll">${getByType("educator", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="products">
      ${sectionHeader(d.sections.products, d.sections.productsSub, "products", d.sections.seeAll)}
      <div class="cc-hscroll">${getByType("product", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="community">
      ${sectionHeader(d.sections.community, d.sections.communitySub, "community", d.sections.seeAll)}
      <div class="cc-hscroll">${getByType("post", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="career">
      ${sectionHeader(d.sections.career, d.sections.careerSub, "career", d.sections.seeAll)}
      <div class="cc-grid">${jobs}</div>
    </section>

    <section class="cc-section cc-container" id="tv">
      ${sectionHeader(d.sections.tv, d.sections.tvSub, "tv", d.sections.seeAll)}
      <div class="cc-hscroll">${getByType("video", 8).map((e) => renderEntityCard(e, d)).join("")}</div>
    </section>

    <section class="cc-section cc-container" id="awards">
      ${sectionHeader(d.sections.awards, d.sections.awardsSub, "awards", d.sections.seeAll)}
      <div class="cc-awards__grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--space-md)">${awards}</div>
    </section>

    <section class="cc-section cc-container" id="passport">
      ${sectionHeader(d.sections.passport, d.sections.passportSub, "passport", d.sections.seeAll)}
      ${renderPassportPanel(d)}
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

    ${renderHubFooter(d)}
    ${renderHubTabbar(d, "home")}
  `;
}

function bindInteractions(root, labyrinth) {
  bindSearchTags(root);

  root.querySelectorAll(".cc-ai__prompt").forEach((btn) => {
    btn.addEventListener("click", () => openAIWithPrompt(btn.textContent.trim()));
  });
  document.getElementById("cc-ai-open")?.addEventListener("click", () => openAIWithPrompt());

  root.querySelectorAll("[data-calendar-view]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.dataset.calendarView;
      root.querySelectorAll("[data-calendar-view]").forEach((t) => {
        t.classList.toggle("cc-calendar__tab--on", t === tab);
      });
      const list = document.getElementById("cc-calendar-list");
      if (list) list.innerHTML = renderCalendarRows(view);
    });
  });

  bindAwardVotes(root, dict().awards);

  const newsletterForm = document.getElementById("cc-newsletter-form");
  newsletterForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = dict();
    newsletterForm.innerHTML = `<p class="cc-newsletter__success">${esc(d.newsletter.success)}</p>`;
  });

  const feedEl = document.getElementById("cc-feed");
  const feedState = document.getElementById("cc-feed-state");
  feedCursor = getFeedPage(null, DISCOVER_FEED_LIMIT).nextCursor ?? "done";
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

function scrollToSectionHash() {
  const id = window.location.hash.replace("#", "");
  if (!id) return;
  const el = document.getElementById(id);
  if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
}

export function initControlCenter(labyrinth) {
  const gate = document.getElementById("gate");
  if (!gate) return;

  gate.classList.add("home-cc", "is-poster-ready");
  gate.innerHTML = '<div class="cc-app" id="cc-app"></div>';

  const root = document.getElementById("cc-app");
  renderHomepage(root);
  bindInteractions(root, labyrinth);
  scrollToSectionHash();

  window.addEventListener("hairqoo:lang", () => {
    renderHomepage(root);
    bindInteractions(root, labyrinth);
    scrollToSectionHash();
  });
}
