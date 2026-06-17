/**
 * ETAP 6.5 — Shared passport UI (homepage + passport.html).
 */

import { getPassportSummary } from "./intelligence/passport-system.js?version=6.6.0";
import { esc } from "./hub-shared.js?version=6.6.0";

const PASSPORT_ICONS = {
  certification: "🎓",
  event: "🎟",
  education: "📚",
  achievement: "✦",
  award: "🏆",
};

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function renderPassportPanel(d) {
  const summary = getPassportSummary();
  const progressPct = Math.round((summary.progressToNextLevel ?? 0) * 100);

  const levelBlock = `<div class="cc-passport__level">
    <div class="cc-passport__levelHead">
      <span class="cc-passport__levelLabel">${esc(d.passport?.levelLabel ?? "Poziom")}</span>
      <strong class="cc-passport__levelValue">${summary.level}</strong>
    </div>
    <div class="cc-passport__xpBar" role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100">
      <span class="cc-passport__xpFill" style="width:${progressPct}%"></span>
    </div>
    <p class="cc-passport__xpMeta">${summary.xpPoints} XP · ${esc(d.passport?.toNext ?? "Do następnego")}: ${summary.xpToNext}</p>
  </div>`;

  const stats = `<ul class="cc-passport__stats">
    <li><strong>${summary.completedEvents.length}</strong><span>${esc(d.passport?.events ?? "Wydarzenia")}</span></li>
    <li><strong>${summary.completedEducation.length}</strong><span>${esc(d.passport?.education ?? "Edukacja")}</span></li>
    <li><strong>${summary.achievements.length}</strong><span>${esc(d.passport?.achievements ?? "Osiągnięcia")}</span></li>
    <li><strong>${summary.awardsWon.length}</strong><span>${esc(d.passport?.awards ?? "Nagrody")}</span></li>
  </ul>`;

  const timeline =
    summary.timeline.length === 0
      ? `<p class="cc-passport__empty">${esc(d.passport?.empty ?? "Twój passport zacznie się wypełniać po interakcjach z ekosystemem HairQoo.")}</p>`
      : `<ol class="cc-passport__timeline">
    ${summary.timeline
      .map((item) => {
        const icon = PASSPORT_ICONS[item.kind] ?? "✦";
        const label = item.label ?? item.entityId ?? item.type ?? item.kind;
        const when = formatDate(item.at);
        return `<li class="cc-passport__item">
          <span class="cc-passport__icon">${icon}</span>
          <div>
            ${when ? `<span class="cc-passport__when">${esc(when)}</span>` : ""}
            <div class="cc-passport__itemLabel">${esc(String(label))}</div>
          </div>
        </li>`;
      })
      .join("")}
  </ol>`;

  return `<div class="cc-glass cc-passport">
    ${levelBlock}
    ${stats}
    ${timeline}
  </div>`;
}
