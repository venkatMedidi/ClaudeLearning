import { useEffect, useMemo, useState } from 'react'
import { api } from './api/client.js'
import TodoItem from './TodoItem.jsx'

const FILTERS = {
  all: () => true,
  active: (t) => !t.done,
  done: (t) => t.done,
}

export default function App() {
  const [todos, setTodos] = useState(null)
  const [error, setError] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [adding, setAdding] = useState(false)

  function load() {
    api('/todos').then(setTodos).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function handleAdd(e) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setAdding(true)
    setError('')
    try {
      const todo = await api('/todos', { method: 'POST', body: JSON.stringify({ title }) })
      setTodos((prev) => [todo, ...prev])
      setNewTitle('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleToggle(id, done) {
    const prev = todos
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, done } : t)))
    try {
      await api(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) })
    } catch (err) {
      setTodos(prev)
      setError(err.message)
    }
  }

  async function handleRename(id, title) {
    const prev = todos
    setTodos((cur) => cur.map((t) => (t.id === id ? { ...t, title } : t)))
    try {
      await api(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) })
    } catch (err) {
      setTodos(prev)
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    const prev = todos
    setTodos((cur) => cur.filter((t) => t.id !== id))
    try {
      await api(`/todos/${id}`, { method: 'DELETE' })
    } catch (err) {
      setTodos(prev)
      setError(err.message)
    }
  }

  const visibleTodos = useMemo(
    () => (todos || []).filter(FILTERS[filter]),
    [todos, filter],
  )
  const remaining = useMemo(() => (todos || []).filter((t) => !t.done).length, [todos])

  return (
    <div className="app">
      <h1>📝 Todo</h1>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="What needs doing?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" disabled={adding || !newTitle.trim()}>Add</button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {todos === null ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="filters">
            {Object.keys(FILTERS).map((key) => (
              <button
                key={key}
                className={`filter-btn${filter === key ? ' active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          {visibleTodos.length === 0 ? (
            <p className="empty-state">Nothing here.</p>
          ) : (
            <ul className="todo-list">
              {visibleTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}

          <p className="remaining">{remaining} item{remaining === 1 ? '' : 's'} left</p>
        </>
      )}
    </div>
  )
}
