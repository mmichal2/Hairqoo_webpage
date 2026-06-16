/** Client-side persistence for the intelligence layer (GitHub Pages — no backend). */

const STORAGE_KEY = "hairqoo_intelligence";

const DEFAULT_STORE = {
  scoreSignals: {},
  awards: { votes: {}, cycles: {}, userVotes: {} },
  passport: null,
  ai: {
    interactions: [],
    searchHistory: [],
    savedEntities: [],
    entityDwell: {},
    typeAffinity: {},
    tagAffinity: {},
    countryAffinity: {},
  },
  personalization: {
    session: null,
    userVectors: {},
    rankingWeights: {},
  },
  brain: {
    graph: { nodes: {}, edges: [] },
    centralityCache: {},
  },
};

let memoryStore = null;

function canUseLocalStorage() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function readStore() {
  try {
    if (!canUseLocalStorage()) {
      if (!memoryStore) memoryStore = structuredClone(DEFAULT_STORE);
      return structuredClone(memoryStore);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STORE);
    return deepMerge(structuredClone(DEFAULT_STORE), JSON.parse(raw));
  } catch {
    return structuredClone(DEFAULT_STORE);
  }
}

export function writeStore(mutator) {
  const store = readStore();
  const next = typeof mutator === "function" ? mutator(store) : { ...store, ...mutator };
  if (!canUseLocalStorage()) {
    memoryStore = next;
    return next;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function getSessionProfile() {
  const { ai } = readStore();
  const topEntries = (map) =>
    Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);

  return {
    preferredTypes: topEntries(ai.typeAffinity),
    preferredTags: topEntries(ai.tagAffinity),
    preferredCountries: topEntries(ai.countryAffinity),
    recentSearches: ai.searchHistory.slice(-10),
    savedEntityIds: ai.savedEntities.slice(-20),
  };
}

function deepMerge(base, patch) {
  for (const [key, val] of Object.entries(patch ?? {})) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      base[key] = deepMerge(base[key] ?? {}, val);
    } else {
      base[key] = val;
    }
  }
  return base;
}
