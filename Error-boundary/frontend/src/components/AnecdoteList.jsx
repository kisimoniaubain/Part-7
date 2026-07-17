import React from 'react'
import { useAnecdotes } from '../hooks'

const AnecdoteList = () => {
  // 1. Throwing this error forces the component to crash during rendering
  throw new Error('simulated error')

  const { anecdotes, deleteAnecdote } = useAnecdotes()

  return (
    <div>
      <h2>Anecdotes</h2>
      <ul>
        {anecdotes.map(anecdote => (
          <li key={anecdote.id}>
            {anecdote.content} by <strong>{anecdote.author}</strong>
            {' '}
            <button onClick={() => deleteAnecdote(anecdote.id)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AnecdoteList