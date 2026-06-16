/** ETAP 5 — AI Personalization Engine public API. */

export {
  initSession,
  getSessionContext,
  updateSessionMemory,
  resetSession,
  storeInteractionEvent,
} from "./session-memory.js";

export {
  buildUserVector,
  updateUserVector,
  compareEntityToUserVector,
  getUserPreferenceVector,
} from "./user-vector.js";

export {
  updateLearningModel,
  adjustRankingWeights,
  getRankingWeights,
} from "./learning-loop.js";

export { rankSearchResultsPersonalized, computeUserAffinity } from "./personalized-search.js";

export {
  getPersonalizedFeed,
  generateFeedRanking,
  filterFeedByPreferences,
} from "./personalized-feed.js";

export { enhanceAIContext, personalizedAIResponse } from "./ai-personalization.js";

import { initSession } from "./session-memory.js";
import { updateLearningModel } from "./learning-loop.js";
import { getDataSessionId } from "../../data/interactions.js";

export function initPersonalization(userId = null) {
  return initSession(userId ?? getDataSessionId());
}

/** Unified ETAP 5 interaction entry point. */
export function logUserInteraction(userId, eventType, entityId, metadata = {}) {
  const id = userId ?? getDataSessionId();
  return updateLearningModel(id, { type: eventType, entityId, meta: metadata });
}
