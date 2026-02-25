import { nowIso, toIso } from "../utils/time.js";

function normalizeValue(value) {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (typeof value === "object") {
    if (value.__serverTimestamp) {
      return nowIso();
    }

    const iso = toIso(value);
    if (iso) {
      return iso;
    }

    const next = {};
    for (const [key, nested] of Object.entries(value)) {
      if (typeof nested === "function") continue;
      next[key] = normalizeValue(nested);
    }
    return next;
  }

  return value;
}

function normalizeByKey(key, value) {
  if (value === null || value === undefined) return value;

  const lower = key.toLowerCase();
  const looksLikeDateKey =
    lower.endsWith("at") || lower.endsWith("date") || lower.includes("publishedat");

  if (looksLikeDateKey) {
    const iso = toIso(value);
    if (iso) return iso;
  }

  return normalizeValue(value);
}

export function normalizePayload(payload = {}) {
  const next = {};

  for (const [key, value] of Object.entries(payload || {})) {
    if (key === "id") continue;
    next[key] = normalizeByKey(key, value);
  }

  return next;
}
