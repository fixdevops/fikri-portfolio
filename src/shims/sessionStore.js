const STORAGE_KEY = "newporto_auth_session";

let state = {
  token: null,
  user: null
};

const listeners = new Set();

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      state = {
        token: parsed.token || null,
        user: parsed.user || null
      };
    }
  } catch {
    state = { token: null, user: null };
  }
}

function writeLocal() {
  if (typeof window === "undefined") return;

  try {
    if (!state.token || !state.user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // no-op
  }
}

if (typeof window !== "undefined") {
  readLocal();
}

function emit() {
  for (const listener of listeners) {
    listener(state.user);
  }
}

export function getToken() {
  return state.token;
}

export function getCurrentUser() {
  return state.user;
}

export function setSession(nextSession) {
  state = {
    token: nextSession?.token || null,
    user: nextSession?.user || null
  };
  writeLocal();
  emit();
}

export function clearSession() {
  state = { token: null, user: null };
  writeLocal();
  emit();
}

export function subscribeAuth(listener) {
  listeners.add(listener);
  listener(state.user);

  return () => {
    listeners.delete(listener);
  };
}
