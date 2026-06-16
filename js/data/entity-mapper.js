/** Map Supabase rows ↔ frontend entity shape (compatible with existing UI). */

function parseCity(location, country) {
  if (!location) return "";
  const parts = String(location).split(",").map((s) => s.trim());
  if (parts.length >= 2) return parts[0];
  return location.replace(country ?? "", "").trim() || "";
}

function buildTypeData(entity) {
  const base = { ...(entity.typeData ?? {}) };
  switch (entity.type) {
    case "event":
      return {
        ...base,
        date: entity.dateEvent ?? base.date,
        location: entity.location ?? base.location,
        speakers: base.speakers ?? [],
        brandPartners: base.brandPartners ?? [],
        ticketInfo: base.ticketInfo ?? null,
      };
    case "education":
    case "academy":
      return {
        ...base,
        duration: base.duration ?? null,
        level: base.level ?? "intermediate",
        certification: base.certification ?? entity.type === "academy",
      };
    case "educator":
      return {
        ...base,
        specialties: base.specialties ?? entity.tags ?? [],
        portfolio: base.portfolio ?? [],
        socialLinks: base.socialLinks ?? {},
        rating: entity.rating ?? base.rating ?? null,
      };
    case "product":
      return {
        ...base,
        brandId: base.brandId ?? entity.ownerId ?? null,
        category: base.category ?? (entity.tags?.[0] ?? null),
        launchDate: base.launchDate ?? entity.dateCreated ?? null,
        reviews: base.reviews ?? [],
      };
    case "brand":
      return {
        ...base,
        productIds: base.productIds ?? [],
        partnerships: base.partnerships ?? [],
      };
    case "salon":
      return {
        ...base,
        team: base.team ?? [],
        services: base.services ?? [],
        ratings: base.ratings ?? entity.rating ?? null,
        location: entity.location ?? base.location,
      };
    default:
      return base;
  }
}

/** Frontend entity → DB insert/update payload. */
export function entityToRow(entity) {
  const metrics = entity.engagement ?? {};
  const ranking = {
    hairQooScore: entity.score ?? entity.hairqooScore ?? 0,
    verified: Boolean(entity.verified),
    popularity: metrics.views ?? 0,
    recencyScore: entity.recencyScore ?? 0,
    verificationLevel: entity.verificationLevel ?? null,
    verificationType: entity.verificationType ?? null,
  };

  return {
    legacy_id: entity.id,
    type: entity.type === "academy" ? "education" : entity.type,
    title: entity.title,
    description: entity.description ?? "",
    country: entity.country ?? null,
    city: entity.city ?? parseCity(entity.location, entity.country),
    language: entity.language ?? "pl",
    tags: entity.tags ?? [],
    media: entity.media ?? [],
    metrics: {
      views: metrics.views ?? 0,
      clicks: metrics.clicks ?? metrics.likes ?? 0,
      saves: metrics.saves ?? 0,
      shares: metrics.shares ?? 0,
    },
    ranking,
    owner_legacy_id: entity.ownerId ?? null,
    type_data: buildTypeData(entity),
    created_at: entity.dateCreated ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/** DB row → frontend entity (queries.js / hub-shared.js compatible). */
export function rowToEntity(row) {
  if (!row) return null;
  const metrics = row.metrics ?? {};
  const ranking = row.ranking ?? {};
  const typeData = row.type_data ?? {};
  const type = row.type === "education" && typeData.legacyType ? typeData.legacyType : row.type;
  const legacyType = row.legacy_id?.startsWith("academy") ? "academy" : type;

  const location =
    typeData.location ??
    (row.city && row.country ? `${row.city}, ${row.country}` : row.city ?? row.country ?? "");

  return {
    id: row.legacy_id ?? row.id,
    dbId: row.id,
    type: legacyType === "education" && row.legacy_id?.startsWith("academy") ? "academy" : legacyType,
    title: row.title,
    description: row.description ?? "",
    location,
    country: row.country ?? "",
    city: row.city ?? "",
    language: row.language ?? "pl",
    tags: row.tags ?? [],
    media: Array.isArray(row.media) ? row.media : [],
    rating: typeData.rating ?? typeData.ratings ?? null,
    score: ranking.hairQooScore ?? 0,
    verified: Boolean(ranking.verified),
    verificationType: ranking.verificationType ?? null,
    verificationLevel: ranking.verificationLevel ?? null,
    dateCreated: row.created_at,
    dateEvent: typeData.date ?? typeData.dateEvent ?? null,
    engagement: {
      views: metrics.views ?? 0,
      likes: metrics.clicks ?? 0,
      clicks: metrics.clicks ?? 0,
      saves: metrics.saves ?? 0,
      shares: metrics.shares ?? 0,
      comments: Math.round((metrics.clicks ?? 0) * 0.15),
    },
    ownerId: row.owner_legacy_id ?? row.owner_id ?? null,
    typeData,
    ranking: {
      hairQooScore: ranking.hairQooScore ?? 0,
      verified: Boolean(ranking.verified),
      popularity: ranking.popularity ?? metrics.views ?? 0,
      recencyScore: ranking.recencyScore ?? 0,
    },
  };
}

export function rowsToEntities(rows) {
  return (rows ?? []).map(rowToEntity).filter(Boolean);
}
