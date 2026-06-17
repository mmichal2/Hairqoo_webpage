/** HairQoo Intelligence Layer — ETAP 4 public API + bootstrap. */

export { readStore, writeStore, getSessionProfile } from "./session-store.js";
export {
  computeHairQooScore,
  getHairQooScore,
  getHairQooScoreValue,
  getScoreTier,
  updateScore,
  enrichEntityScore,
  engagementComponent,
  qualityComponent,
  trustComponent,
  popularityComponent,
  recencyComponent,
  interactionVelocity,
  SCORE_TIERS,
  SCORE_REFERENCE_DATE,
} from "./score-system.js";
export {
  getVerifiedStatus,
  applyVerifiedBoost,
  getVerifiedSearchBoost,
  computeTrustScore,
  VERIFICATION_TYPES,
  VERIFICATION_LEVELS,
} from "./verified-trust.js";
export { computeRelevanceScore, rankSearchResultsWithFeedback } from "./search-ranking.js";
export {
  AWARD_CATEGORIES,
  vote,
  voteForAward,
  getAwardRankings,
  computeAwardScore,
  computeAwardRankPotential,
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
  calculateUserLevel,
  getLevelProgress,
  updatePassportProgress,
  updatePassportProgressById,
  getPassportProgress,
  getPassportSummary,
} from "./passport-system.js";
export {
  enrichEntityIntelligence,
  enrichEntityPool,
  getEntityIntelligenceContract,
  computePopularityIndex,
} from "./entity-intelligence.js";
export {
  logUserInteraction,
  updateAIContext,
  improveRankingFromFeedback,
  getAIContext,
  inferBehavioralTypeHint,
  getUserPreferenceVector,
} from "./ai-learning.js";

export {
  initPersonalization,
  initSession,
  getSessionContext,
  updateSessionMemory,
  resetSession,
  storeInteractionEvent,
  buildUserVector,
  updateUserVector,
  compareEntityToUserVector,
  updateLearningModel,
  adjustRankingWeights,
  getRankingWeights,
  rankSearchResultsPersonalized,
  computeUserAffinity,
  getPersonalizedFeed,
  generateFeedRanking,
  filterFeedByPreferences,
  enhanceAIContext,
  personalizedAIResponse,
} from "./personalization/index.js";

import { logUserInteraction } from "./ai-learning.js";
import { updatePassportProgressById } from "./passport-system.js";
import { voteForAward, getUserVote, AWARD_CATEGORIES } from "./awards-system.js";
import { getDataSessionId } from "../data/interactions.js";
import { initPersonalization } from "./personalization/index.js";
import { initGlobalBrain } from "./global/index.js";

export {
  initGlobalBrain,
  createEntityGraph,
  addEntityRelation,
  getEntityConnections,
  findRelatedEntities,
  getEntityGraph,
  retrieveContext,
  buildContextWindow,
  rankKnowledgeChunks,
  getRegionalRanking,
  normalizeGlobalScores,
  applyCountryBiasBoost,
  getRegionContext,
  detectQueryLanguage,
  mapSemanticMeaningAcrossLanguages,
  unifyEntityTagsAcrossLanguages,
  computeGlobalIntelligenceScore,
  rankByGlobalIntelligence,
  computeGraphCentrality,
  computeInfluenceScore,
  buildAIContext,
  enhanceAIResponseWithGraph,
  buildGlobalBrainResponse,
  GLOBAL_REGIONS,
  FUSION_WEIGHTS,
} from "./global/index.js";

let initialized = false;

export function initIntelligence() {
  if (initialized || typeof document === "undefined") return;
  initialized = true;
  initPersonalization();

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

    const sessionId = getDataSessionId();
    if (getUserVote(category) === entityId) {
      btn.textContent = dictSlice.voted;
      btn.classList.add("cc-award__vote--voted");
      btn.disabled = true;
    }

    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      voteForAward(sessionId, entityId, category);
      updatePassportProgressById(sessionId, { type: "award_vote", entityId, meta: { category } });
      btn.textContent = dictSlice.voted;
      btn.classList.add("cc-award__vote--voted");
      btn.disabled = true;
    });
  });
}

export function awardCategoryKeys() {
  return Object.keys(AWARD_CATEGORIES);
}
