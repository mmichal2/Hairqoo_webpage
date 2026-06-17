/** ETAP 6.5 stabilization smoke test */
import { initPassportStore, getPassportUserSync } from "../js/data/passport-store.js";
import { setRuntimeProvider } from "../js/data/provider-state.js";
import { getPassportSummary, updatePassportProgressById } from "../js/intelligence/passport-system.js";
import { ensureSessionUser, getRuntimeUserEntity } from "../js/data/users-store.js";
import { MOCK_ENTITIES } from "../js/data/entities.js";
import { enrichEntityPool } from "../js/intelligence/entity-intelligence.js";

setRuntimeProvider("mock-fallback");
await initPassportStore("test-session");
await ensureSessionUser("test-session");

const userEntity = getRuntimeUserEntity();
console.log("user entity", userEntity?.type, userEntity?.id);

updatePassportProgressById("test-session", { type: "entity_view", entityId: "event-1" });
const summary = getPassportSummary("test-session");
console.log("passport level", summary.level, "xp", summary.xpPoints);

const pool = enrichEntityPool(MOCK_ENTITIES);
console.log("pool size", pool.length);
console.log("OK — ETAP 6.5 smoke test passed");
