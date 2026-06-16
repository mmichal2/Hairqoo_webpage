import { getLang } from "../i18n.js";
import {
  dict,
  esc,
  renderHubFooter,
  renderHubHeader,
  renderHubTabbar,
  bindSearchTags,
  bindAwardVotes,
} from "../hub-shared.js";
import {
  getCalendarEventsByView,
  getCountriesAggregated,
  getByType,
  getAwardLeader,
} from "../data/queries.js";
import { entityHref, homeSectionHref } from "../hub-routes.js";
import { bootHubPage } from "../hub-boot.js";

const MONTHS_PL = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PASSPORT_ICONS = ["🎓", "🎟", "✂", "✦"];
const PULSE_POS = [
  { left: "28%", top: "38%" },
  { left: "52%", top: "32%" },
  { left: "68%", top: "48%" },
  { left: "38%", top: "58%" },
];

function renderCalendarRows(view = "month") {
  const months = getLang() === "en" ? MONTHS_EN : MONTHS_PL;
  return getCalendarEventsByView(view, 20)
    .map((ev) => {
      const dt = new Date(ev.dateEvent);
      return `<li class="cc-calendar__row">
        <div class="cc-calendar__date">
          <span class="cc-calendar__day">${dt.getDate()}</span>
          <span class="cc-calendar__mon">${months[dt.getMonth()]}</span>
        </div>
        <div>
          <a href="${entityHref(ev)}" style="color:var(--text);font-weight:600">${esc(ev.title)}</a>
          <div style="font-size:0.82rem;color:var(--outline)">${esc(ev.location ?? "")}</div>
        </div>
      </li>`;
    })
    .join("");
}

function renderCalendar(d) {
  const rows = renderCalendarRows("month");
  return `<div class="cc-glass cc-calendar__panel" style="padding:var(--space-lg)">
    <div class="cc-calendar__tabs" data-calendar-tabs>
      <button type="button" class="cc-calendar__tab cc-calendar__tab--on" data-calendar-view="month">${esc(d.calendar.month)}</button>
      <button type="button" class="cc-calendar__tab" data-calendar-view="week">${esc(d.calendar.week)}</button>
      <button type="button" class="cc-calendar__tab" data-calendar-view="year">${esc(d.calendar.year)}</button>
    </div>
    <ul id="hub-calendar-list" style="list-style:none;margin:0;padding:0">${rows}</ul>
  </div>`;
}

function renderMap(d) {
  const country = new URLSearchParams(window.location.search).get("country") || "";
  const countries = getCountriesAggregated()
    .map((c) => {
      const url = `./listing.html?section=discover&country=${encodeURIComponent(c.country)}`;
      return `<a class="cc-map__country" href="${url}">
        <span>${esc(c.country)}</span>
        <span class="cc-map__count">${c.count}</span>
      </a>`;
    })
    .join("");
  const pulses = PULSE_POS.map(
    (p) => `<span class="cc-map__pulse" style="left:${p.left};top:${p.top}"></span>`
  ).join("");
  return `<div class="cc-glass cc-map__panel">
    <div class="cc-map__globe"><div class="cc-map__grid"></div>${pulses}</div>
    <div>
      <p style="font-size:0.78rem;text-transform:uppercase;color:var(--outline)">${esc(d.map.ecosystemLabel)}</p>
      ${country ? `<p style="color:var(--primary)">${esc(country)}</p>` : ""}
      ${countries}
    </div>
  </div>`;
}

function renderAwards(d) {
  const cats = [
    { key: "educatorOfYear", type: "educator", category: "educator_of_year" },
    { key: "eventOfYear", type: "event", category: "event_of_year" },
    { key: "productOfYear", type: "product", category: "product_of_year" },
  ];
  return `<div class="cc-awards__grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--space-md)">
    ${cats
      .map((cat) => {
        const nominee = getAwardLeader(cat.category) ?? getByType(cat.type, 1)[0];
        if (!nominee) return "";
        return `<article class="cc-glass cc-award" data-award="${cat.type}" data-entity-id="${esc(nominee.id)}">
          <span style="font-size:0.78rem;text-transform:uppercase;color:var(--outline)">${esc(d.awards[cat.key])}</span>
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:1.8rem">🏆</span>
            <h3 style="margin:0"><a href="${entityHref(nominee)}" style="color:inherit">${esc(nominee.title)}</a></h3>
          </div>
          <button type="button" class="cc-award__vote">${esc(d.awards.vote)}</button>
        </article>`;
      })
      .join("")}
  </div>`;
}

function renderPassport(d) {
  return `<div class="cc-glass cc-passport" style="padding:var(--space-xl)">
    <ol style="list-style:none;margin:0;padding:0">
      ${d.passport.items
        .map(
          (item, i) => `<li class="cc-passport__item">
            <span class="cc-passport__icon">${PASSPORT_ICONS[i] ?? "✦"}</span>
            <div>
              <span style="font-size:0.78rem;color:var(--primary);font-weight:600">${esc(item.year)}</span>
              <div>${esc(item.label)}</div>
            </div>
          </li>`
        )
        .join("")}
    </ol>
  </div>`;
}

function renderNewsletter(d) {
  return `<div class="cc-glass cc-newsletter" style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-xl);padding:var(--space-xl)">
    <div>
      <h2 class="strand-text" style="margin:0">${esc(d.newsletter.title)}</h2>
      <p style="margin:8px 0 0;color:var(--muted)">${esc(d.newsletter.desc)}</p>
    </div>
    <form class="cc-newsletter__form" id="hub-newsletter-form">
      <input class="cc-newsletter__input" type="email" required placeholder="${esc(d.newsletter.placeholder)}" />
      <button type="submit" class="cc-newsletter__cta">${esc(d.newsletter.cta)}</button>
    </form>
  </div>`;
}

function render(root) {
  const page = document.body.dataset.hubPage || "calendar";
  const d = dict();
  const titles = {
    calendar: [d.sections.calendar, d.sections.calendarSub],
    map: [d.sections.map, d.sections.mapSub],
    awards: [d.sections.awards, d.sections.awardsSub],
    passport: [d.sections.passport, d.sections.passportSub],
    newsletter: [d.newsletter.title, d.newsletter.desc],
  };
  const [title, subtitle] = titles[page] ?? titles.calendar;

  let content = "";
  if (page === "calendar") content = renderCalendar(d);
  else if (page === "map") content = renderMap(d);
  else if (page === "awards") content = renderAwards(d);
  else if (page === "passport") content = renderPassport(d);
  else if (page === "newsletter") content = renderNewsletter(d);

  root.innerHTML = `
    ${renderHubHeader(d, page)}
    <main class="cc-container cc-listing-page">
      <header class="cc-listing-head">
        <a class="cc-back-link" href="${page === "newsletter" ? "./index.html" : homeSectionHref(page)}">← ${esc(d.common?.backHome ?? "Wróć")}</a>
        <h1 class="cc-listing-title strand-text">${esc(title)}</h1>
        <p class="cc-listing-subtitle">${esc(subtitle)}</p>
      </header>
      ${content}
    </main>
    ${renderHubFooter(d)}
    ${renderHubTabbar(d, page === "map" ? "map" : "home")}
  `;

  bindSearchTags(root);
  root.querySelectorAll("[data-calendar-view]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const view = tab.dataset.calendarView;
      root.querySelectorAll("[data-calendar-view]").forEach((t) => {
        t.classList.toggle("cc-calendar__tab--on", t === tab);
      });
      const list = document.getElementById("hub-calendar-list");
      if (list) list.innerHTML = renderCalendarRows(view);
    });
  });
  bindAwardVotes(root, d.awards);
  document.getElementById("hub-newsletter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.innerHTML = `<p class="cc-newsletter__success">${esc(d.newsletter.success)}</p>`;
  });
}

bootHubPage(render);
