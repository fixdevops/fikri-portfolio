import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../data/db.json");

const defaultDb = {
  users: [],
  projects: [],
  certificates: [],
  blogs: [],
  animes: [],
  animeStories: [],
  quotes: [],
  audios: [],
  chatMessages: []
};

let writeQueue = Promise.resolve();

async function ensureDb() {
  try {
    await fs.access(dbPath);
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
  }
}

export async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return { ...defaultDb, ...parsed };
  } catch {
    return { ...defaultDb };
  }
}

export async function writeDb(updater) {
  writeQueue = writeQueue.then(async () => {
    const current = await readDb();
    const clone = JSON.parse(JSON.stringify(current));
    const next = await updater(clone);
    const safeNext = next && typeof next === "object" ? next : current;
    await fs.writeFile(dbPath, JSON.stringify(safeNext, null, 2), "utf8");
    return safeNext;
  });

  return writeQueue;
}
