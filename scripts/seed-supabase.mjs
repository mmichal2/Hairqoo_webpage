/**
 * Seed Supabase from mock entities (run locally with config.local.js set).
 * Usage: node scripts/seed-supabase.mjs
 */
import { MOCK_ENTITIES } from "../js/data/entities.js";
import { applyDataConfig } from "../js/data/config.js";
import { upsertEntities } from "../js/data/api.js";

try {
  const { DATA_CONFIG_LOCAL } = await import("../js/data/config.local.js");
  applyDataConfig(DATA_CONFIG_LOCAL);
} catch {
  console.error("Create js/data/config.local.js from config.example.js first.");
  process.exit(1);
}

const result = await upsertEntities(MOCK_ENTITIES);
console.log(`Seeded ${result.count} entities via ${result.provider}`);
