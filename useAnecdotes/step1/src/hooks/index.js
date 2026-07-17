import { useState, useEffect } from 'react'

// Hook 1: Managing Form Fields
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

// Hook 2: Fetching Anecdotes Safely from the Backend
export const useAnecdotes = () => {
  // CRITICAL: Initialize with an empty array [] so the frontend doesn't crash on the first render
  const [anecdotes, setAnecdotes] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/anecdotes')
      .then(res => res.json())
      .then(data => {
        setAnecdotes(data)
      })
      .catch(err => console.error("Error fetching data: ", err))
  }, [])

  return {
    anecdotes
  }
}