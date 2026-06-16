import { DATA_CONFIG } from "./config.js";

function headers(prefer = "return=representation") {
  const { anonKey } = DATA_CONFIG.supabase;
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
    Prefer: prefer,
  };
}

function baseUrl() {
  return `${DATA_CONFIG.supabase.url.replace(/\/$/, "")}/rest/v1`;
}

export async function supabaseRequest(table, { method = "GET", query = "", body = null, prefer } = {}) {
  const url = `${baseUrl()}/${table}${query}`;
  const res = await fetch(url, {
    method,
    headers: headers(prefer ?? (method === "GET" ? "return=representation" : "return=representation")),
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${method} ${table} failed (${res.status}): ${text}`);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function supabaseRpc(fn, args = {}) {
  const url = `${DATA_CONFIG.supabase.url.replace(/\/$/, "")}/rest/v1/rpc/${fn}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers("return=representation"),
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase RPC ${fn} failed (${res.status}): ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function buildQuery(params) {
  const parts = [];
  for (const [key, val] of Object.entries(params)) {
    if (val == null || val === "") continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}
