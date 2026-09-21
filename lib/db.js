import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "wishlist.db");
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    overview TEXT,
    posterUrl TEXT,
    releaseYear TEXT,
    rating REAL,
    addedAt TEXT DEFAULT (datetime('now'))
  )
`);

export default db;