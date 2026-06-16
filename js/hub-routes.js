/** Mapowanie tras hubu — zgodne z prototypem hairqoo3 (Next.js routes). */

export const LISTING_SECTIONS = {
  discover: { types: null },
  events: { types: ["event"] },
  educators: { types: ["educator"] },
  products: { types: ["product"] },
  education: { types: ["academy", "event"] },
  community: { types: ["post"] },
  tv: { types: ["video"] },
  career: { types: ["salon", "academy"] },
};

export const FULL_PAGES = {
  calendar: "./calendar.html",
  map: "./map.html",
  awards: "./awards.html",
  passport: "./passport.html",
  newsletter: "./newsletter.html",
};

/** URL „Zobacz wszystko” — osobna strona, nie anchor na homepage. */
export function seeAllHref(sectionKey) {
  if (FULL_PAGES[sectionKey]) return FULL_PAGES[sectionKey];
  return `./listing.html?section=${encodeURIComponent(sectionKey)}`;
}

export function entityHref(entity) {
  return `./entity.html?type=${encodeURIComponent(entity.type)}&id=${encodeURIComponent(entity.id)}`;
}

export function searchHref(query) {
  return `./search.html?q=${encodeURIComponent(query)}`;
}

export function profileHref(id) {
  return `./profile.html?id=${encodeURIComponent(id)}`;
}
