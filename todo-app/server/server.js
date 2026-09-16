const express = require('express');
const cors = require('cors');
const store = require('./src/store');
const { initSchema } = require('./src/db');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get('/api/todos', async (req, res, next) => {
  try {
    res.json(await store.getTodos());
  } catch (err) {
    next(err);
  }
});

app.post('/api/todos', async (req, res, next) => {
  try {
    const result = await store.createTodo(req.body?.title);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result.todo);
  } catch (err) {
    next(err);
  }
});

app.patch('/api/todos/:id', async (req, res, next) => {
  try {
    const result = await store.updateTodo(Number(req.params.id), req.body || {});
    if (result.error) {
      const status = result.error === 'Todo not found' ? 404 : 400;
      return res.status(status).json({ error: result.error });
    }
    res.json(result.todo);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    const result = await store.deleteTodo(Number(req.params.id));
    if (result.error) return res.status(404).json({ error: result.error });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

initSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Todo API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MySQL:', err.message);
    process.exit(1);
  });
