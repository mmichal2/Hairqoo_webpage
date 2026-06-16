/**
 * ETAP 6 — Multi-language semantic normalization.
 */

import { TAG_SEMANTIC_MAP, QUERY_LANG_HINTS } from "./constants.js";

export function detectQueryLanguage(query) {
  const q = String(query ?? "");
  let best = "en";
  let bestScore = 0;
  for (const [lang, re] of Object.entries(QUERY_LANG_HINTS)) {
    const matches = (q.match(re) ?? []).length;
    if (matches > bestScore) {
      bestScore = matches;
      best = lang;
    }
  }
  if (/[ąćęłńóśźż]/i.test(q)) return "pl";
  if (/[ñ¿¡]/i.test(q) || /\b(curso|formación)\b/i.test(q)) return "es";
  if (/[àâçéèêëîïôùûü]/i.test(q) || /\b(cours|formation)\b/i.test(q)) return "fr";
  if (/\b(formação|você)\b/i.test(q)) return "pt";
  return bestScore > 0 ? best : "en";
}

export function mapSemanticMeaningAcrossLanguages(query) {
  const tokens = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);
  const expanded = new Set(tokens);

  for (const token of tokens) {
    for (const [canonical, variants] of Object.entries(TAG_SEMANTIC_MAP)) {
      if (variants.some((v) => v.includes(token) || token.includes(v))) {
        expanded.add(canonical);
        for (const v of variants) expanded.add(v);
      }
    }
  }

  return {
    original: query,
    language: detectQueryLanguage(query),
    tokens: [...tokens],
    expandedTokens: [...expanded],
    normalizedQuery: [...expanded].join(" "),
  };
}

export function unifyEntityTagsAcrossLanguages(entity) {
  const tags = entity.tags ?? [];
  const unified = new Set(tags);
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    unified.add(lower);
    for (const [canonical, variants] of Object.entries(TAG_SEMANTIC_MAP)) {
      if (variants.includes(lower) || lower === canonical) {
        unified.add(canonical);
        for (const v of variants) unified.add(v);
      }
    }
  }
  return { ...entity, unifiedTags: [...unified] };
}

export function semanticMatchScore(querySemantic, entity) {
  const unified = unifyEntityTagsAcrossLanguages(entity);
  const hay = [entity.title, entity.description, ...(unified.unifiedTags ?? [])].join(" ").toLowerCase();

  let hits = 0;
  for (const t of querySemantic.expandedTokens) {
    if (hay.includes(t.toLowerCase())) hits += 1;
  }
  return querySemantic.expandedTokens.length
    ? Math.min(1, hits / querySemantic.expandedTokens.length)
    : 0;
}
