/** HairQoo Intelligence Layer — bootstrap + public API. */

export { readStore, writeStore, getSessionProfile } from "./session-store.js";
export {
  getHairQooScore,
  getScoreTier,
  updateScore,
  enrichEntityScore,
  SCORE_TIERS,
  SCORE_REFERENCE_DATE,
} from "./score-system.js";
export {
  getVerifiedStatus,
  applyVerifiedBoost,
  getVerifiedSearchBoost,
  VERIFICATION_TYPES,
  VERIFICATION_LEVELS,
} from "./verified-trust.js";
export { computeRelevanceScore, rankSearchResults, tokenize, haystack } from "./search-ranking.js";
export {
  AWARD_CATEGORIES,
  vote,
  getAwardRankings,
  computeAwardScore,
  getAwardNominee,
  hasVoted,
  getUserVote,
  getCurrentSeason,
} from "./awards-system.js";
export {
  XP_RULES,
  getDefaultUser,
  getPassportUser,
  calculateUserXP,
  getUserLevel,
  getLevelProgress,
  updatePassportProgress,
  getPassportProgress,
} from "./passport-system.js";
export {
  logUserInteraction,
  updateAIContext,
  improveRankingFromFeedback,
  getAIContext,
  inferBehavioralTypeHint,
} from "./ai-learning.js";

import { logUserInteraction } from "./ai-learning.js";
import { updatePassportProgress, getPassportUser } from "./passport-system.js";
import { vote as castVote, AWARD_CATEGORIES, getUserVote } from "./awards-system.js";

let initialized = false;

/** Wire global interaction hooks (delegation — no UI changes). */
export function initIntelligence() {
  if (initialized || typeof document === "undefined") return;
  initialized = true;

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href*='entity.html']");
    if (!link) return;
    try {
      const url = new URL(link.href, window.location.origin);
      const type = url.searchParams.get("type");
      const id = url.searchParams.get("id");
      if (id) logUserInteraction("click", id, { entityType: type });
    } catch {
      /* ignore malformed href */
    }
  });

  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    const q = form.querySelector('input[name="q"]')?.value?.trim();
    if (q) logUserInteraction("search", null, { query: q });
  });
}

/**
 * Bind award vote buttons already rendered in the DOM.
 * @param {HTMLElement} root
 * @param {{ awards: { vote: string, voted: string } }} dictSlice
 */
export function bindAwardVotes(root, dictSlice) {
  const categoryByType = {
    educator: "educator_of_year",
    event: "event_of_year",
    product: "product_of_year",
  };

  root.querySelectorAll(".cc-award__vote").forEach((btn) => {
    const article = btn.closest("[data-award]");
    const entityId = article?.dataset.entityId;
    const awardType = article?.dataset.award;
    const category = categoryByType[awardType];
    if (!entityId || !category) return;

    if (getUserVote(category) === entityId) {
      btn.textContent = dictSlice.voted;
      btn.classList.add("cc-award__vote--voted");
      btn.disabled = true;
    }

    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      castVote(entityId, category);
      updatePassportProgress(getPassportUser(), { type: "award_vote", entityId, meta: { category } });
      btn.textContent = dictSlice.voted;
      btn.classList.add("cc-award__vote--voted");
      btn.disabled = true;
    });
  });
}

export function awardCategoryKeys() {
  return Object.keys(AWARD_CATEGORIES);
}
