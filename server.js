const express = require('express');
const db = require('./db');

const app = express();
app.use(express.static('.'));
app.use(express.json());

//verifying the tokens
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header. Access denied." });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const user = db.prepare('SELECT * FROM users WHERE token = ?').get(token);

  if (!user) {
    return res.status(401).json({ error: "Invalid token. Unauthorized." });
  }

  req.user = user;
  next();
};


app.get('/habits', authenticate, (req, res) => {
  const habits = db.prepare('SELECT id, name, frequency FROM habits WHERE user_id = ?').all(req.user.id);
  res.json({ habits });
});

//idempotency

app.post('/habits', authenticate, (req, res) => {
  const { name, frequency, idempotencyKey } = req.body;

  
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: "Validation error: 'name' is required and must be a string." });
  }
  if (!frequency || typeof frequency !== 'string') {
    return res.status(400).json({ error: "Validation error: 'frequency' is required (e.g., 'daily', 'weekly')." });
  }
  if (!idempotencyKey) {
    return res.status(400).json({ error: "Validation error: 'idempotencyKey' is required for safe retries." });
  }


try {
    //Idempotency check
    const existing = db.prepare('SELECT * FROM habits WHERE idempotency_key = ? AND user_id = ?').get(idempotencyKey, req.user.id);

    if (existing) {
      return res.status(200).json({
        message: "Duplicate request detected. Returning original result (idempotent safe retry).",
        habit: { id: existing.id, name: existing.name, frequency: existing.frequency }
      });
    }

    
    const result = db.prepare('INSERT INTO habits (user_id, name, frequency, idempotency_key) VALUES (?, ?, ?, ?)').run(
      req.user.id, name, frequency, idempotencyKey
    );

    return res.status(201).json({
      message: "Habit created successfully.",
      habit: { id: result.lastInsertRowid, name, frequency }
    });

  } catch (err) {
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
