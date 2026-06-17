/**
 * ETAP 6.5 — Single source of truth for active data provider.
 * Remote writes only when provider === "supabase" (not mock-fallback).
 */

import { resolveProvider } from "./config.js?version=6.6.0";

let runtimeProvider = null;

export function setRuntimeProvider(provider) {
  runtimeProvider = provider;
}

export function getRuntimeProvider() {
  return runtimeProvider ?? resolveProvider();
}

/** Supabase is configured and pool was loaded from remote (not mock-fallback). */
export function isRemoteDatastoreActive() {
  return getRuntimeProvider() === "supabase";
}

export function isLocalDatastoreActive() {
  const p = getRuntimeProvider();
  return p === "mock" || p === "mock-fallback";
}
