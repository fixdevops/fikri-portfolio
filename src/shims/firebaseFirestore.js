import { apiDelete, apiGet, apiPost, apiPut } from "./apiClient";

const COLLECTION_TO_RESOURCE = {
  "my-project": "projects",
  "my-certificate": "certificates",
  "my-blogs": "blogs",
  animes: "animes",
  "anime-story": "anime-stories",
  "my-quotes": "quotes",
  "my-audios": "audios",
  chatMessages: "chat-messages"
};

function resolveResource(collectionName) {
  const resource = COLLECTION_TO_RESOURCE[collectionName];
  if (!resource) {
    throw new Error(`Unknown collection: ${collectionName}`);
  }
  return resource;
}

function isDateLikeString(value) {
  if (typeof value !== "string") return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time);
}

function toFirestoreTimestamp(value) {
  const date = new Date(value);
  const ms = date.getTime();

  return {
    toDate: () => new Date(ms),
    toMillis: () => ms,
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1_000_000,
    isEqual: (other) => typeof other?.toMillis === "function" && other.toMillis() === ms
  };
}

function reviveDateFields(value, key = "") {
  if (Array.isArray(value)) {
    return value.map((item) => reviveDateFields(item, key));
  }

  if (!value || typeof value !== "object") {
    if (/(at|date)$/i.test(key) && isDateLikeString(value)) {
      return toFirestoreTimestamp(value);
    }
    return value;
  }

  const next = {};
  for (const [k, v] of Object.entries(value)) {
    if (/(at|date)$/i.test(k) && isDateLikeString(v)) {
      next[k] = toFirestoreTimestamp(v);
      continue;
    }

    next[k] = reviveDateFields(v, k);
  }

  return next;
}

function serializePayload(value) {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => serializePayload(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    if (value.__serverTimestamp) {
      return new Date().toISOString();
    }

    if (value.__timestamp) {
      return value.__timestamp;
    }

    if (typeof value.toDate === "function") {
      const date = value.toDate();
      return date instanceof Date ? date.toISOString() : value;
    }

    const next = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "function") continue;
      next[k] = serializePayload(v);
    }
    return next;
  }

  return value;
}

function toDoc(entry) {
  const normalized = reviveDateFields(entry);
  return {
    id: normalized.id,
    data: () => {
      const { id, ...rest } = normalized;
      return rest;
    }
  };
}

function applyWhere(items, clause) {
  const { field, op, value } = clause;

  return items.filter((item) => {
    const left = item[field];

    if (left && typeof left.toDate === "function") {
      const leftDate = left.toDate().getTime();
      const rightDate = new Date(value).getTime();

      if (op === "==") return leftDate === rightDate;
      if (op === ">=") return leftDate >= rightDate;
      if (op === "<=") return leftDate <= rightDate;
      return false;
    }

    if (op === "==") return left === value;
    if (op === ">=") return left >= value;
    if (op === "<=") return left <= value;
    return false;
  });
}

function applySort(items, clause) {
  const { field, direction } = clause;
  const sortDir = direction === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const left = a[field];
    const right = b[field];

    const normalizedLeft = left && typeof left.toMillis === "function" ? left.toMillis() : left ?? 0;
    const normalizedRight = right && typeof right.toMillis === "function" ? right.toMillis() : right ?? 0;

    if (normalizedLeft < normalizedRight) return -1 * sortDir;
    if (normalizedLeft > normalizedRight) return 1 * sortDir;
    return 0;
  });
}

function applyClauses(entries, clauses = []) {
  let items = [...entries];

  for (const clause of clauses) {
    if (clause.type === "where") {
      items = applyWhere(items, clause);
    }
  }

  for (const clause of clauses) {
    if (clause.type === "orderBy") {
      items = applySort(items, clause);
    }
  }

  for (const clause of clauses) {
    if (clause.type === "limit") {
      items = items.slice(0, clause.value);
    }
  }

  return items;
}

function normalizeQueryRef(ref) {
  if (!ref) {
    throw new Error("Query reference is required");
  }

  if (ref.kind === "query") return ref;

  if (ref.kind === "collection") {
    return {
      kind: "query",
      collection: ref.name,
      clauses: []
    };
  }

  throw new Error("Invalid query reference");
}

export function collection(_db, name) {
  return {
    kind: "collection",
    name
  };
}

export function doc(refOrDb, maybeCollection, maybeId) {
  if (refOrDb?.kind === "collection") {
    return {
      kind: "doc",
      collection: refOrDb.name,
      id: maybeCollection
    };
  }

  return {
    kind: "doc",
    collection: maybeCollection,
    id: maybeId
  };
}

export function where(field, op, value) {
  return { type: "where", field, op, value };
}

export function orderBy(field, direction = "asc") {
  return { type: "orderBy", field, direction };
}

export function limit(value) {
  return { type: "limit", value };
}

export function query(ref, ...clauses) {
  const base = normalizeQueryRef(ref);
  return {
    ...base,
    clauses: [...(base.clauses || []), ...clauses]
  };
}

export async function getDocs(ref) {
  const queryRef = normalizeQueryRef(ref);
  const resource = resolveResource(queryRef.collection);
  const data = await apiGet(`/${resource}`);
  const docs = applyClauses((data || []).map((entry) => reviveDateFields(entry)), queryRef.clauses).map((entry) => toDoc(entry));

  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback) => docs.forEach(callback)
  };
}

export function onSnapshot(ref, onNext, onError) {
  let active = true;

  const run = async () => {
    try {
      const snapshot = await getDocs(ref);
      if (active) onNext(snapshot);
    } catch (error) {
      if (active && typeof onError === "function") {
        onError(error);
      }
    }
  };

  run();
  const timer = setInterval(run, 4000);

  return () => {
    active = false;
    clearInterval(timer);
  };
}

export async function addDoc(collectionRef, payload) {
  const resource = resolveResource(collectionRef.name);
  const data = await apiPost(`/${resource}`, serializePayload(payload));
  return { id: data.id };
}

export async function updateDoc(docRef, payload) {
  const resource = resolveResource(docRef.collection);
  await apiPut(`/${resource}/${docRef.id}`, serializePayload(payload));
}

export async function deleteDoc(docRef) {
  const resource = resolveResource(docRef.collection);
  await apiDelete(`/${resource}/${docRef.id}`);
}

export function serverTimestamp() {
  return { __serverTimestamp: true };
}

export const Timestamp = {
  now() {
    return toFirestoreTimestamp(new Date().toISOString());
  },
  fromDate(date) {
    return {
      __timestamp: date.toISOString(),
      ...toFirestoreTimestamp(date.toISOString())
    };
  }
};
