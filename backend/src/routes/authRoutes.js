import express from "express";
import {
  createGuestUser,
  findUserByEmail,
  hashPassword,
  signToken,
  toSafeUser,
  verifyPassword
} from "../services/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { nowIso } from "../utils/time.js";
import { createId } from "../utils/ids.js";
import { writeDb } from "../services/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const isValid = await verifyPassword(password, user.passwordHash || "");
  if (!isValid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const safeUser = toSafeUser(user);
  const token = signToken(safeUser);

  res.json({
    data: {
      token,
      user: safeUser
    }
  });
});

router.post("/guest", async (_req, res) => {
  const guest = await createGuestUser();
  const token = signToken(guest);

  res.json({
    data: {
      token,
      user: guest
    }
  });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ data: req.auth });
});

router.post("/bootstrap", async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  let created = null;

  await writeDb(async (db) => {
    if (db.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      return db;
    }

    if (db.users.length > 0) {
      return db;
    }

    const passwordHash = await hashPassword(password);
    const user = {
      id: createId(),
      email,
      displayName: displayName || "Administrator",
      role: "admin",
      passwordHash,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    db.users.push(user);
    created = user;
    return db;
  });

  if (!created) {
    res.status(409).json({ message: "Admin user already exists" });
    return;
  }

  const safeUser = toSafeUser(created);
  const token = signToken(safeUser);

  res.status(201).json({
    data: {
      token,
      user: safeUser
    }
  });
});

export default router;
