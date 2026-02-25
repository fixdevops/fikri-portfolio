import { findUserById, toSafeUser, verifyToken } from "../services/auth.js";

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export async function attachAuth(req, _res, next) {
  const token = extractBearerToken(req);
  req.auth = null;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyToken(token);

    if (payload.role === "guest") {
      req.auth = {
        id: payload.sub,
        uid: payload.sub,
        role: "guest",
        email: payload.email,
        displayName: payload.displayName,
        photoURL: payload.photoURL || null
      };
      next();
      return;
    }

    const user = await findUserById(payload.sub);
    if (!user) {
      req.auth = null;
      next();
      return;
    }

    req.auth = toSafeUser(user);
    next();
  } catch {
    req.auth = null;
    next();
  }
}

export function requireAuth(req, res, next) {
  if (!req.auth) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  next();
}
