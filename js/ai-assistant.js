import { getLang } from "./i18n.js?version=6.6.0";
import { getCcDict } from "./cc-dict.js?version=6.6.0";
import { aiAsk } from "./data/queries.js?version=6.6.0";
import { entityHref, searchHref, seeAllHref } from "./hub-routes.js?version=6.6.0";
import { esc, renderAISystemStatus, bindCollapsibleInsights } from "./hub-shared.js?version=6.6.0";
import { bindVoiceButton } from "./speech-recognition.js?version=6.6.0";
import { logUserInteraction } from "./intelligence/ai-learning.js?version=6.6.0";

const state = {
  open: false,
  thread: [],
  loading: false,
  failed: false,
};

/** ETAP 6.6 — read-only brain snapshot for UI hooks (no pipeline changes). */
let brainSnapshot = { brainContext: null, globalBrain: null };

export function getBrainContextReadOnly() {
  const c = brainSnapshot.brainContext;
  return c ? structuredClone(c) : null;
}

export function getGlobalBrainSummaryReadOnly() {
  const g = brainSnapshot.globalBrain;
  if (!g) return null;
  return structuredClone({
    entityCount: g.entities?.length ?? 0,
    relatedCount: g.relatedEntities?.length ?? 0,
    graphEdgeCount: g.graphConnections?.length ?? 0,
    scoreBreakdown: g.scoreBreakdown,
    regionContext: g.regionContext,
    languageContext: g.languageContext,
  });
}

function renderBrainInsightPanel() {
  const d = dict();
  const labels = d.aiVisibility ?? {};
  const g = brainSnapshot.globalBrain;

  if (!g?.entities?.length) {
    return `<div class="cc-ai-brain-panel cc-ai-brain-panel--placeholder" aria-label="${esc(labels.panelTitle ?? "AI Brain")}">
      ${renderAISystemStatus(d)}
      <p class="cc-ai-brain-panel__placeholder">${esc(labels.brainPlaceholder ?? "Ask the AI assistant to see a live ranking breakdown.")}</p>
    </div>`;
  }

  const top = g.entities[0];
  const L = { ...labels, ...(labels.labels ?? {}) };
  const rows = [
    { label: L.hairQooScore ?? "HairQoo Score", value: top.globalBrain?.scoreBreakdown?.hairQooScore },
    { label: L.popularity ?? "Popularity", value: top.globalBrain?.scoreBreakdown?.engagementScore },
    { label: L.countryBoost ?? "Country boost", value: top.globalBrain?.scoreBreakdown?.regionalBoost },
    { label: L.recencyBoost ?? "Recency boost", value: top.globalBrain?.scoreBreakdown?.searchRelevanceScore },
  ]
    .map((row) => {
      const val = row.value == null ? "—" : Math.round(row.value * 100);
      return `<div><dt>${esc(row.label)}</dt><dd>${val}</dd></div>`;
    })
    .join("");

  return `<div class="cc-ai-brain-panel" aria-label="${esc(labels.panelTitle ?? "AI Brain")}">
    ${renderAISystemStatus(d)}
    <h3 class="cc-ai-brain-panel__title">${esc(labels.whyThisAppears ?? labels.whySeeing ?? "Why am I seeing this?")}</h3>
    <p class="cc-ai-brain-panel__subtitle">${esc(labels.rankingTitle ?? "AI ranking explanation")}</p>
    <dl class="cc-ai-insight__grid">${rows}</dl>
    <p class="cc-ai-brain-panel__meta">${esc(labels.brainNodes ?? "Graph nodes")}: ${brainSnapshot.brainContext?.graph?.nodeCount ?? 0}</p>
  </div>`;
}

function dict() {
  return getCcDict(getLang());
}

function renderThread() {
  const d = dict();
  const parts = [];

  if (state.thread.length === 0) {
    parts.push(`<div class="cc-ai-suggest">
      <p class="cc-ai-suggest__label">${esc(d.ai.suggestionsTitle ?? "Sugestie")}</p>
      ${d.ai.prompts
        .map(
          (p) =>
            `<button type="button" class="cc-ai-suggest__btn" data-ai-suggest="${esc(p)}">${esc(p)}</button>`
        )
        .join("")}
    </div>`);
  }

  for (const msg of state.thread) {
    const roleClass = msg.role === "user" ? "cc-ai-msg--user" : "cc-ai-msg--assistant";
    let extra = "";
    if (msg.entities?.length) {
      extra += `<ul class="cc-ai-entity-list">${msg.entities
        .map(
          (e) => `<li><a class="cc-ai-entity-link" href="${entityHref(e)}" data-ai-entity-id="${esc(e.id)}" data-ai-entity-type="${esc(e.type)}">
            <span class="cc-ai-entity-title">${esc(e.title)}</span>
            ${e.location ? `<span class="cc-ai-entity-meta">${esc(e.location)}</span>` : ""}
          </a></li>`
        )
        .join("")}</ul>`;
    }
    if (msg.links?.length) {
      extra += `<div class="cc-ai-links">${msg.links
        .map((l) => `<a class="cc-ai-nav-link" href="${esc(l.href)}">${esc(l.label)} →</a>`)
        .join("")}</div>`;
    }
    parts.push(`<div class="cc-ai-msg ${roleClass}">
      <p class="cc-ai-msg__text">${esc(msg.text)}</p>${extra}
    </div>`);
  }

  if (state.loading) {
    parts.push(`<p class="cc-ai-thinking">${esc(d.ai.thinking ?? "Analizuję…")}</p>`);
  }
  if (state.failed && !state.loading) {
    parts.push(`<p class="cc-ai-thinking">${esc(d.errors?.aiFailed ?? "Coś poszło nie tak.")}</p>`);
  }

  return parts.join("");
}

function renderDrawer() {
  const d = dict();
  if (!state.open) return "";

  return `<div class="cc-ai-scrim" id="cc-ai-scrim" role="presentation">
    <aside class="cc-ai-drawer" role="dialog" aria-label="${esc(d.ai.title)}">
      <header class="cc-ai-drawer__head">
        <div>
          <h2 class="cc-ai-drawer__title">${esc(d.ai.title)}</h2>
          <p class="cc-ai-drawer__subtitle">${esc(d.ai.subtitle)}</p>
        </div>
        <button type="button" class="cc-ai-drawer__close" id="cc-ai-close" aria-label="${esc(d.common?.close ?? "Zamknij")}">✕</button>
      </header>
      <div class="cc-ai-thread" id="cc-ai-thread">${renderThread()}${renderBrainInsightPanel()}</div>
      <form class="cc-ai-input-bar" id="cc-ai-form">
        <input class="cc-ai-input" id="cc-ai-input" type="text" placeholder="${esc(d.ai.placeholder ?? "")}" aria-label="${esc(d.ai.placeholder ?? "")}" />
        <button type="button" class="cc-voice-btn" id="cc-ai-voice" aria-label="${esc(d.search?.voice ?? "Głos")}">🎙</button>
        <button type="submit" class="cc-ai-send" id="cc-ai-send" ${state.loading ? "disabled" : ""}>${esc(d.ai.send ?? "Wyślij")}</button>
      </form>
    </aside>
  </div>`;
}

function refreshUI() {
  const host = document.getElementById("cc-ai-host");
  if (!host) return;
  host.innerHTML = renderDrawer();
  bindDrawerEvents();
  bindCollapsibleInsights(host);
  const thread = document.getElementById("cc-ai-thread");
  if (thread) thread.scrollTop = thread.scrollHeight;

  thread?.querySelectorAll("[data-ai-entity-id]").forEach((link) => {
    link.addEventListener("click", () => {
      logUserInteraction("click", link.dataset.aiEntityId, {
        entityType: link.dataset.aiEntityType,
        source: "ai-assistant",
      });
    });
  });
}

function bindDrawerEvents() {
  document.getElementById("cc-ai-scrim")?.addEventListener("click", (e) => {
    if (e.target.id === "cc-ai-scrim") setAIOpen(false);
  });
  document.querySelector(".cc-ai-drawer")?.addEventListener("click", (e) => e.stopPropagation());
  document.getElementById("cc-ai-close")?.addEventListener("click", () => setAIOpen(false));

  document.getElementById("cc-ai-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("cc-ai-input");
    if (input?.value) send(input.value);
  });

  document.querySelectorAll("[data-ai-suggest]").forEach((btn) => {
    btn.addEventListener("click", () => send(btn.dataset.aiSuggest));
  });

  const voiceBtn = document.getElementById("cc-ai-voice");
  const input = document.getElementById("cc-ai-input");
  if (voiceBtn && input) {
    bindVoiceButton(voiceBtn, {
      onTranscript: (text) => {
        input.value = text;
      },
      onFinal: (text) => send(text),
    });
  }
}

export function setAIOpen(open) {
  state.open = open;
  refreshUI();
}

export async function send(prompt) {
  const trimmed = prompt.trim();
  if (!trimmed || state.loading) return;

  const lang = getLang();
  state.thread = [...state.thread, { role: "user", text: trimmed }];
  state.loading = true;
  state.failed = false;
  refreshUI();

  try {
    const res = aiAsk(trimmed, lang);
    const links = (res.links ?? []).map((l) => ({
      label: l.label,
      href: l.href.startsWith("/")
        ? l.href.startsWith("/search")
          ? searchHref(new URL(l.href, "http://x").searchParams.get("q") ?? trimmed)
          : l.href.startsWith("/entity/")
            ? `./entity.html?type=${l.href.split("/")[2]}&id=${l.href.split("/")[3]}`
            : seeAllHref(l.href.replace(/^\//, ""))
        : l.href,
    }));

    brainSnapshot = {
      brainContext: res.brainContext ? structuredClone(res.brainContext) : null,
      globalBrain: res.globalBrain ? structuredClone(res.globalBrain) : null,
    };

    state.thread = [
      ...state.thread,
      {
        role: "assistant",
        text: res.answer,
        entities: res.entities,
        links,
      },
    ];
    state.loading = false;
    state.failed = false;
  } catch {
    state.loading = false;
    state.failed = true;
  }

  refreshUI();
  const input = document.getElementById("cc-ai-input");
  if (input) input.value = "";
}

export function initAIAssistant() {
  if (window.__AI_INIT__) return;
  window.__AI_INIT__ = true;
  if (document.getElementById("cc-ai-root")) return;

  const d = dict();
  const root = document.createElement("div");
  root.id = "cc-ai-root";
  root.innerHTML = `<button type="button" class="cc-ai-fab" id="cc-ai-fab" aria-label="${esc(d.ai.open)}">
    <span aria-hidden="true">✦</span>
    <span class="cc-ai-fab__label">${esc(d.ai.title)}</span>
  </button>
  <div class="cc-ai-status-fab" role="complementary" aria-label="${esc(d.aiVisibility?.statusTitle ?? "AI System Status")}">${renderAISystemStatus(d)}</div>
  <div id="cc-ai-host"></div>`;
  document.body.appendChild(root);

  document.getElementById("cc-ai-fab")?.addEventListener("click", () => setAIOpen(true));

  window.addEventListener("hairqoo:lang", () => {
    const fab = document.getElementById("cc-ai-fab");
    const statusFab = document.querySelector(".cc-ai-status-fab");
    const d2 = dict();
    if (fab) {
      fab.setAttribute("aria-label", d2.ai.open);
      fab.querySelector(".cc-ai-fab__label").textContent = d2.ai.title;
    }
    if (statusFab) statusFab.innerHTML = renderAISystemStatus(d2);
    refreshUI();
  });
}

/** Panel na homepage — otwiera drawer i opcjonalnie wysyła prompt. */
export function openAIWithPrompt(prompt) {
  setAIOpen(true);
  if (prompt?.trim()) send(prompt);
}
