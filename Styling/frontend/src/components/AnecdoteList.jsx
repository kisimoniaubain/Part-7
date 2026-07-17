import React from 'react'
import { useAnecdotes } from '../hooks'

const AnecdoteList = () => {
  const { anecdotes, deleteAnecdote } = useAnecdotes()

  const handleDelete = (id, content) => {
    if (window.confirm(`Delete "${content}"?`)) {
      deleteAnecdote(id)
    }
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>blogs</h2>
      <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
        {anecdotes.map(anecdote => (
          <li key={anecdote.id} style={{ fontSize: '16px', marginBottom: '10px' }}>
            <span style={{ color: '#0000ee', textDecoration: 'underline', cursor: 'pointer' }}>
              {anecdote.content}
            </span>
            {' '}by <strong>{anecdote.author || 'unknown'}</strong>
            {' '}
            <button onClick={() => handleDelete(anecdote.id, anecdote.content)}>
              delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AnecdoteList