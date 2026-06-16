/** HairQoo data layer configuration (static-site safe — no secrets in repo). */

export const DATA_CONFIG = {
  /** auto | mock | supabase */
  provider: "auto",
  supabase: {
    url: "",
    anonKey: "",
  },
  sessionKey: "hairqoo_data_session",
  tables: {
    entities: "entities",
    users: "users",
    interactions: "interactions",
    awardVotes: "award_votes",
    passportProgress: "passport_progress",
    searchIndex: "search_index",
  },
};

export function applyDataConfig(overrides = {}) {
  if (overrides.provider) DATA_CONFIG.provider = overrides.provider;
  if (overrides.supabase) Object.assign(DATA_CONFIG.supabase, overrides.supabase);
  if (overrides.sessionKey) DATA_CONFIG.sessionKey = overrides.sessionKey;
}

export function isSupabaseConfigured() {
  const { url, anonKey } = DATA_CONFIG.supabase;
  return Boolean(url && anonKey && DATA_CONFIG.provider !== "mock");
}

export function resolveProvider() {
  if (DATA_CONFIG.provider === "mock") return "mock";
  if (DATA_CONFIG.provider === "supabase" || isSupabaseConfigured()) return "supabase";
  return "mock";
}
