import { useState, useEffect } from 'react'
import anecdoteService from '../services/anecdotes'

// The hook your CreateNew component is looking for
export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  const reset = () => {
    setValue('')
  }

  return {
    type,
    value,
    onChange,
    reset
  }
}

// Your main anecdotes hook
export const useAnecdotes = () => {
  const [anecdotes, setAnecdotes] = useState([])

  useEffect(() => {
    anecdoteService.getAll().then(data => setAnecdotes(data))
  }, [])

  const addAnecdote = async (anecdoteObject) => {
    const newAnecdote = await anecdoteService.createNew(anecdoteObject)
    setAnecdotes(anecdotes.concat(newAnecdote))
  }

  return {
    anecdotes,
    addAnecdote
  }
}