/** ETAP 5 — AI Personalization Engine public API. */

export {
  initSession,
  getSessionContext,
  updateSessionMemory,
  resetSession,
  storeInteractionEvent,
} from "./session-memory.js?version=6.6.0";

export {
  buildUserVector,
  updateUserVector,
  compareEntityToUserVector,
  getUserPreferenceVector,
} from "./user-vector.js?version=6.6.0";

export {
  updateLearningModel,
  adjustRankingWeights,
  getRankingWeights,
} from "./learning-loop.js?version=6.6.0";

export { rankSearchResultsPersonalized, computeUserAffinity } from "./personalized-search.js?version=6.6.0";

export {
  getPersonalizedFeed,
  generateFeedRanking,
  filterFeedByPreferences,
} from "./personalized-feed.js?version=6.6.0";

export { enhanceAIContext, personalizedAIResponse } from "./ai-personalization.js?version=6.6.0";

import { initSession } from "./session-memory.js?version=6.6.0";
import { getDataSessionId } from "../../data/interactions.js?version=6.6.0";
import { logUserInteraction } from "../ai-learning.js?version=6.6.0";

export function initPersonalization(userId = null) {
  return initSession(userId ?? getDataSessionId());
}

/** ETAP 6.5 — single interaction pipeline (delegates to ai-learning.js). */
export { logUserInteraction };
