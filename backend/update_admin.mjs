import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');
const raw = await fs.readFile(dbPath, 'utf8');
const db = JSON.parse(raw);

const email = 'fixzdeveloper@gmail.com';
const password = 'bismillah99';
const passwordHash = await bcrypt.hash(password, 10);

if (!Array.isArray(db.users)) db.users = [];
if (db.users.length === 0) {
  db.users.push({
    id: crypto.randomUUID(),
    email,
    displayName: 'Administrator',
    role: 'admin',
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
} else {
  db.users[0].email = email;
  db.users[0].passwordHash = passwordHash;
  db.users[0].updatedAt = new Date().toISOString();
}

await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
console.log('ADMIN_UPDATED');
