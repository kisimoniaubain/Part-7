import { useState, useEffect } from 'react'
import anecdoteService from '../services/anecdotes'

// Shared module-level state variables to synchronize components
let globalAnecdotes = []
let listeners = []

const updateListeners = () => {
  listeners.forEach(listener => listener([...globalAnecdotes]))
}

// 1. The useField Hook (Clean and ready for forms)
export const useField = (type) => {
  const [value, setValue] = useState('')
  
  const onChange = (event) => setValue(event.target.value)
  const reset = () => setValue('')
  
  return { 
    type, 
    value, 
    onChange, 
    reset 
  }
}

// 2. Your existing useAnecdotes Hook (Preserved perfectly)
export const useAnecdotes = () => {
  const [anecdotes, setAnecdotes] = useState(globalAnecdotes)

  useEffect(() => {
    // Sync current instance state with global store immediately on mount
    setAnecdotes([...globalAnecdotes])

    // Register this component's setAnecdotes state setter
    listeners.push(setAnecdotes)

    // Only fetch from server once if the global list is empty
    if (globalAnecdotes.length === 0) {
      anecdoteService.getAll().then(data => {
        globalAnecdotes = data
        updateListeners()
      })
    }

    // Cleanup listener when component unmounts
    return () => {
      listeners = listeners.filter(listener => listener !== setAnecdotes)
    }
  }, [])

  const addAnecdote = async (anecdoteObject) => {
    const newAnecdote = await anecdoteService.createNew(anecdoteObject)
    globalAnecdotes = globalAnecdotes.concat(newAnecdote)
    updateListeners()
  }

  const deleteAnecdote = async (id) => {
    await anecdoteService.deleteOne(id)
    globalAnecdotes = globalAnecdotes.filter(a => a.id !== id)
    updateListeners()
  }

  return {
    anecdotes,
    addAnecdote,
    deleteAnecdote
  }
}