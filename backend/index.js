const express = require('express');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { items: [] });

async function initDB() {
  await db.read();
  db.data = db.data || { items: [] };
  await db.write();
}

initDB();

app.get('/items', async (req, res) => {
  await db.read();
  res.json(db.data.items);
});

app.get('/items/:id', async (req, res) => {
  const id = req.params.id;
  await db.read();
  const item = db.data.items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/items', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const newItem = { id: nanoid(), title, description: description || '' };
  await db.read();
  db.data.items.push(newItem);
  await db.write();
  res.status(201).json(newItem);
});

app.put('/items/:id', async (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;
  await db.read();
  const idx = db.data.items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.items[idx] = { ...db.data.items[idx], title: title ?? db.data.items[idx].title, description: description ?? db.data.items[idx].description };
  await db.write();
  res.json(db.data.items[idx]);
});

app.delete('/items/:id', async (req, res) => {
  const id = req.params.id;
  await db.read();
  const idx = db.data.items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = db.data.items.splice(idx, 1)[0];
  await db.write();
  res.json(deleted);
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));