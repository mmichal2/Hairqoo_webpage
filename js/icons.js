/** Spójny zestaw line-icons Hairqoo (24x24, stroke=currentColor). */

const ICON_PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-5h4v5h5V9.5"/>',
  discover:
    '<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z"/>',
  events:
    '<rect x="3" y="4.5" width="18" height="16" rx="2.4"/><path d="M3 9.5h18M8 2.6v3.8M16 2.6v3.8"/>',
  calendar:
    '<rect x="3" y="4.5" width="18" height="16" rx="2.4"/><path d="M3 9.5h18M8 2.6v3.8M16 2.6v3.8"/>',
  map: '<path d="M12 21s-6.5-5.8-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21z"/><circle cx="12" cy="10.3" r="2.4"/>',
  educators:
    '<path d="m12 4 9.5 4.6L12 13.2 2.5 8.6z"/><path d="M6.5 10.6v4.4c0 1.5 2.5 2.8 5.5 2.8s5.5-1.3 5.5-2.8v-4.4"/>',
  products:
    '<path d="M5 8.5 12 5l7 3.5v7L12 19l-7-3.5z"/><path d="M5 8.5 12 12l7-3.5M12 12v7"/>',
  community:
    '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-2.4-4.5"/>',
  career:
    '<rect x="3.5" y="7.5" width="17" height="12" rx="2.2"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3.5 12.5h17"/>',
  tv: '<rect x="3.5" y="5.5" width="17" height="12.5" rx="2.2"/><path d="m10.5 9.5 4 2.7-4 2.7z"/>',
  awards:
    '<path d="M7 4.5h10v3a5 5 0 0 1-10 0z"/><path d="M7 5.5H4.2v.8a2.8 2.8 0 0 0 2.8 2.8M17 5.5h2.8v.8a2.8 2.8 0 0 1-2.8 2.8M9.5 14.5h5M10.2 14.5v3.5M13.8 14.5v3.5M8 19.5h8"/>',
  passport:
    '<rect x="5" y="3.5" width="14" height="17" rx="2.2"/><circle cx="12" cy="10" r="2.6"/><path d="M9 15.5h6"/>',
  salon:
    '<circle cx="6.5" cy="6.5" r="2.4"/><circle cx="6.5" cy="17.5" r="2.4"/><path d="M8.6 8 20 18M20 6 8.6 16"/>',
  client:
    '<path d="M12 3 4.5 9 12 21l7.5-12z"/><path d="M4.5 9h15M12 3 9.2 9l2.8 12 2.8-12z"/>',
  verified:
    '<path d="m12 3 2.1 1.6 2.6-.3 1 2.4 2.3 1.2-.6 2.6 1.4 2.2-1.9 1.8.1 2.6-2.6.5-1.3 2.3-2.5-.8-2.5.8-1.3-2.3-2.6-.5.1-2.6L3 14.3l1.4-2.2-.6-2.6 2.3-1.2 1-2.4 2.6.3z"/><path d="m9.3 12 1.9 1.9 3.6-3.8"/>',
  sparkle:
    '<path d="M12 3.5c.4 3.6 1.4 4.6 5 5-3.6.4-4.6 1.4-5 5-.4-3.6-1.4-4.6-5-5 3.6-.4 4.6-1.4 5-5z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 20 20"/>',
  arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  heart:
    '<path d="M12 20s-7-4.4-9.2-9A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 21.2 11C19 15.6 12 20 12 20z"/>',
  bookmark: '<path d="M6.5 4h11v16l-5.5-3.8L6.5 20z"/>',
  share:
    '<circle cx="6" cy="12" r="2.3"/><circle cx="17" cy="6" r="2.3"/><circle cx="17" cy="18" r="2.3"/><path d="M8.1 10.9 14.9 7.1M8.1 13.1l6.8 3.8"/>',
  play: '<path d="M8 5.5 18 12 8 18.5z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7"/>',
  ticket:
    '<path d="M4 7.5h16v3a1.5 1.5 0 0 0 0 3v3H4v-3a1.5 1.5 0 0 0 0-3z"/><path d="M14 7.5v9" stroke-dasharray="1.5 2"/>',
};

/**
 * @param {string} name
 * @param {string} [cls]
 */
export function icon(name, cls = "") {
  const paths = ICON_PATHS[name];
  if (!paths) return "";
  return `<svg class="hq-icon${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
