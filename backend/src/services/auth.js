import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { createId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";
import { readDb, writeDb } from "./db.js";

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role || "admin",
      displayName: user.displayName || user.email
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export async function ensureAdminUser() {
  await writeDb(async (db) => {
    if (db.users.length > 0) {
      return db;
    }

    const passwordHash = await hashPassword(env.adminPassword);
    db.users.push({
      id: createId(),
      email: env.adminEmail,
      displayName: "Administrator",
      role: "admin",
      passwordHash,
      createdAt: nowIso(),
      updatedAt: nowIso()
    });

    return db;
  });
}

export async function findUserByEmail(email) {
  const db = await readDb();
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id) {
  const db = await readDb();
  return db.users.find((user) => user.id === id);
}

export function toSafeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    uid: user.id,
    email: user.email,
    role: user.role || "admin",
    displayName: user.displayName || user.email,
    photoURL: user.photoURL || null
  };
}

export async function createGuestUser() {
  const id = createId();
  return {
    id,
    uid: id,
    role: "guest",
    email: `guest-${id.slice(0, 8)}@local.chat`,
    displayName: `Guest-${id.slice(0, 5)}`,
    photoURL: `https://api.dicebear.com/9.x/adventurer/svg?seed=${id}`
  };
}
