const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool, initSchema } = require('../src/db');
const store = require('../src/store');

let dbAvailable = false;

before(async () => {
  try {
    await initSchema();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
    console.log('Skipping store tests: no MySQL connection (see README for setup).');
  }
});

after(async () => {
  await pool.end();
});

beforeEach(async (t) => {
  if (!dbAvailable) {
    t.skip('MySQL not available');
    return;
  }
  await pool.query('DELETE FROM todos');
});

test('starts with no todos', async () => {
  assert.deepEqual(await store.getTodos(), []);
});

test('creates a todo', async () => {
  const result = await store.createTodo('Buy milk');
  assert.ok(result.todo);
  assert.equal(result.todo.title, 'Buy milk');
  assert.equal(result.todo.done, false);
});

test('rejects an empty title', async () => {
  const result = await store.createTodo('   ');
  assert.ok(result.error);
});

test('lists todos newest first', async () => {
  await store.createTodo('First');
  await store.createTodo('Second');
  const todos = await store.getTodos();
  assert.equal(todos[0].title, 'Second');
});

test('updates a todo (toggle done)', async () => {
  const { todo } = await store.createTodo('Walk the dog');
  const result = await store.updateTodo(todo.id, { done: true });
  assert.equal(result.todo.done, true);
  assert.equal(result.todo.title, 'Walk the dog');
});

test('updates a todo title', async () => {
  const { todo } = await store.createTodo('Old title');
  const result = await store.updateTodo(todo.id, { title: 'New title' });
  assert.equal(result.todo.title, 'New title');
});

test('rejects updating a missing todo', async () => {
  const result = await store.updateTodo(999999, { done: true });
  assert.ok(result.error);
});

test('deletes a todo', async () => {
  const { todo } = await store.createTodo('Delete me');
  const result = await store.deleteTodo(todo.id);
  assert.equal(result.success, true);
  assert.equal(await store.getTodo(todo.id), null);
});

test('rejects deleting a missing todo', async () => {
  const result = await store.deleteTodo(999999);
  assert.ok(result.error);
});
