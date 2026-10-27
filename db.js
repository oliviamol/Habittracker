const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('habits.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    token TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Insert the users for test
const insertUser = db.prepare(`INSERT OR IGNORE INTO users (username, token) VALUES (?, ?)`);
insertUser.run('alice', 'secret-token-alice');
insertUser.run('bob', 'secret-token-bob');

console.log('Database initialized successfully.');

module.exports = db;