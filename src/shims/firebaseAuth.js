import { apiPost } from "./apiClient";
import {
  clearSession,
  getCurrentUser,
  setSession,
  subscribeAuth
} from "./sessionStore";

class AuthStore {
  get currentUser() {
    return getCurrentUser();
  }

  onAuthStateChanged(callback) {
    return subscribeAuth(callback);
  }
}

class GoogleAuthProvider {}

const authSingleton = new AuthStore();

function adaptUser(user) {
  if (!user) return null;

  return {
    ...user,
    uid: user.uid || user.id || null,
    displayName: user.displayName || user.email || "User",
    photoURL: user.photoURL || null
  };
}

function applyAuthPayload(payload) {
  const token = payload?.token || null;
  const user = adaptUser(payload?.user || null);

  if (!token || !user) {
    throw new Error("Invalid auth payload");
  }

  setSession({ token, user });
  return user;
}

export function getAuth() {
  return authSingleton;
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  const payload = await apiPost("/auth/login", { email, password });
  const user = applyAuthPayload(payload);
  return { user };
}

export async function signInWithPopup(_auth, _provider) {
  const payload = await apiPost("/auth/guest", {});
  const user = applyAuthPayload(payload);
  return { user };
}

export async function signOut() {
  clearSession();
}

export { GoogleAuthProvider };
