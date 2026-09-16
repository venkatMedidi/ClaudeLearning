const { pool } = require('./db');

function rowToTodo(row) {
  return { id: row.id, title: row.title, done: !!row.done, createdAt: row.created_at };
}

async function getTodos() {
  const [rows] = await pool.query('SELECT * FROM todos ORDER BY id DESC');
  return rows.map(rowToTodo);
}

async function getTodo(id) {
  const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
  return rows[0] ? rowToTodo(rows[0]) : null;
}

async function createTodo(title) {
  if (!title || !title.trim()) {
    return { error: 'Title is required' };
  }
  const [result] = await pool.query('INSERT INTO todos (title) VALUES (?)', [title.trim()]);
  return { todo: await getTodo(result.insertId) };
}

async function updateTodo(id, updates) {
  const existing = await getTodo(id);
  if (!existing) {
    return { error: 'Todo not found' };
  }
  const title = updates.title !== undefined ? updates.title : existing.title;
  const done = updates.done !== undefined ? updates.done : existing.done;
  if (!title || !String(title).trim()) {
    return { error: 'Title is required' };
  }
  await pool.query('UPDATE todos SET title = ?, done = ? WHERE id = ?', [
    String(title).trim(),
    done ? 1 : 0,
    id,
  ]);
  return { todo: await getTodo(id) };
}

async function deleteTodo(id) {
  const existing = await getTodo(id);
  if (!existing) {
    return { error: 'Todo not found' };
  }
  await pool.query('DELETE FROM todos WHERE id = ?', [id]);
  return { success: true };
}

module.exports = { getTodos, getTodo, createTodo, updateTodo, deleteTodo };
