import { useState } from 'react'

export default function TodoItem({ todo, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  function saveEdit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.title) onRename(todo.id, trimmed)
    else setDraft(todo.title)
    setEditing(false)
  }

  return (
    <li className={`todo-item${todo.done ? ' done' : ''}`}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id, !todo.done)}
      />

      {editing ? (
        <input
          className="todo-edit-input"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit()
            if (e.key === 'Escape') {
              setDraft(todo.title)
              setEditing(false)
            }
          }}
        />
      ) : (
        <span className="todo-title" onDoubleClick={() => setEditing(true)}>
          {todo.title}
        </span>
      )}

      <button className="icon-btn" title="Edit" onClick={() => setEditing(true)}>✎</button>
      <button className="icon-btn danger" title="Delete" onClick={() => onDelete(todo.id)}>✕</button>
    </li>
  )
}
