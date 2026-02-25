import express from "express";
import { resources } from "../config/resources.js";
import { requireAuth } from "../middleware/auth.js";
import { readDb, writeDb } from "../services/db.js";
import { normalizePayload } from "../services/normalize.js";
import { createId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

function sortItems(items, orderField = "createdAt", order = "desc") {
  const direction = order === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const left = a?.[orderField] ? new Date(a[orderField]).getTime() : 0;
    const right = b?.[orderField] ? new Date(b[orderField]).getTime() : 0;
    return (left - right) * direction;
  });
}

function applyFilters(items, query) {
  let result = [...items];

  if (query.slug) {
    result = result.filter((item) => item.slug === query.slug);
  }

  if (query.status) {
    result = result.filter((item) => item.status === query.status);
  }

  if (query.title) {
    const needle = String(query.title).toLowerCase();
    result = result.filter((item) => String(item.title || "").toLowerCase().includes(needle));
  }

  return result;
}

export function createResourceRouter(resourceName) {
  const config = resources[resourceName];
  const router = express.Router();

  if (!config) {
    throw new Error(`Unknown resource: ${resourceName}`);
  }

  router.get("/", async (req, res) => {
    const db = await readDb();
    const orderBy = req.query.orderBy || "createdAt";
    const order = req.query.order || "desc";
    const limit = Number(req.query.limit || 0);

    let items = applyFilters(db[config.key] || [], req.query);
    items = sortItems(items, orderBy, order);

    if (limit > 0) {
      items = items.slice(0, limit);
    }

    res.json({ data: items });
  });

  router.get("/:id", async (req, res) => {
    const db = await readDb();
    const item = (db[config.key] || []).find((entry) => entry.id === req.params.id);

    if (!item) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.json({ data: item });
  });

  router.post("/", requireAuth, async (req, res) => {
    const payload = normalizePayload(req.body || {});
    const nextItem = {
      id: createId(),
      ...payload,
      createdAt: payload.createdAt || nowIso(),
      updatedAt: nowIso()
    };

    await writeDb(async (db) => {
      db[config.key].push(nextItem);
      return db;
    });

    res.status(201).json({ data: nextItem });
  });

  router.put("/:id", requireAuth, async (req, res) => {
    const payload = normalizePayload(req.body || {});
    let updated = null;

    await writeDb(async (db) => {
      const index = db[config.key].findIndex((entry) => entry.id === req.params.id);

      if (index === -1) {
        return db;
      }

      const previous = db[config.key][index];
      updated = {
        ...previous,
        ...payload,
        id: previous.id,
        createdAt: previous.createdAt || payload.createdAt || nowIso(),
        updatedAt: nowIso()
      };

      db[config.key][index] = updated;
      return db;
    });

    if (!updated) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.json({ data: updated });
  });

  router.delete("/:id", requireAuth, async (req, res) => {
    let deleted = false;

    await writeDb(async (db) => {
      const prevLength = db[config.key].length;
      db[config.key] = db[config.key].filter((entry) => entry.id !== req.params.id);
      deleted = db[config.key].length !== prevLength;
      return db;
    });

    if (!deleted) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.status(204).send();
  });

  return router;
}
