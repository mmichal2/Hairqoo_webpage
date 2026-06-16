import { getLang } from "./i18n.js";
import { getCcDict } from "./cc-dict.js";
import { aiAsk } from "./data/queries.js";
import { entityHref, searchHref, seeAllHref } from "./hub-routes.js";
import { esc } from "./hub-shared.js";
import { bindVoiceButton } from "./speech-recognition.js";
import { logUserInteraction } from "./intelligence/ai-learning.js";

const state = {
  open: false,
  thread: [],
  loading: false,
  failed: false,
};

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
      <div class="cc-ai-thread" id="cc-ai-thread">${renderThread()}</div>
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
  if (document.getElementById("cc-ai-root")) return;

  const d = dict();
  const root = document.createElement("div");
  root.id = "cc-ai-root";
  root.innerHTML = `<button type="button" class="cc-ai-fab" id="cc-ai-fab" aria-label="${esc(d.ai.open)}">
    <span aria-hidden="true">✦</span>
    <span class="cc-ai-fab__label">${esc(d.ai.title)}</span>
  </button>
  <div id="cc-ai-host"></div>`;
  document.body.appendChild(root);

  document.getElementById("cc-ai-fab")?.addEventListener("click", () => setAIOpen(true));

  window.addEventListener("hairqoo:lang", () => {
    const fab = document.getElementById("cc-ai-fab");
    const d2 = dict();
    if (fab) {
      fab.setAttribute("aria-label", d2.ai.open);
      fab.querySelector(".cc-ai-fab__label").textContent = d2.ai.title;
    }
    refreshUI();
  });
}

/** Panel na homepage — otwiera drawer i opcjonalnie wysyła prompt. */
export function openAIWithPrompt(prompt) {
  setAIOpen(true);
  if (prompt?.trim()) send(prompt);
}
