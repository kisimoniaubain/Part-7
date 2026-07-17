import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import anecdoteService from './services/anecdotes'
import { getUser, saveUser, removeUser } from './services/persistentUser' // Named imports
import { useField } from './hooks'

import Notification from './components/Notification'
import { useNotificationDispatch } from './NotificationContext'
import { useUserValue, useUserDispatch } from './UserContext'

// --- LIST VIEW ---
const AnecdoteList = ({ anecdotes, handleLike, handleDelete }) => (
  <div>
    <h2>Anecdotes</h2>
    <ul style={{ paddingLeft: '20px' }}>
      {anecdotes.map(anecdote => (
        <li key={anecdote.id} style={{ marginBottom: '12px' }}>
          <div>
            {anecdote.content} by <strong>{anecdote.author || 'unknown'}</strong>
          </div>
          <div style={{ marginTop: '4px', fontSize: '14px' }}>
            has {anecdote.likes || 0} likes{' '}
            <button onClick={() => handleLike(anecdote)} style={{ marginLeft: '5px', cursor: 'pointer' }}>
              like
            </button>
            <button onClick={() => handleDelete(anecdote.id, anecdote.content)} style={{ marginLeft: '10px' }}>
              delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
)

// --- CREATE NEW VIEW WITH useField ---
const CreateNew = ({ handleCreate }) => {
  const { reset: resetContent, ...content } = useField('text')
  const { reset: resetAuthor, ...author } = useField('text')
  const { reset: resetUrl, ...url } = useField('text')

  const handleSubmit = (e) => {
    e.preventDefault()
    handleCreate({
      content: content.value,
      author: author.value,
      url: url.value
    })
  }

  const handleReset = (e) => {
    e.preventDefault()
    resetContent()
    resetAuthor()
    resetUrl()
  }

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '5px' }}>
          content <input {...content} />
        </div>
        <div style={{ marginBottom: '5px' }}>
          author <input {...author} />
        </div>
        <div style={{ marginBottom: '5px' }}>
          url for more info <input {...url} />
        </div>
        <button type="submit">create</button>
        <button onClick={handleReset} style={{ marginLeft: '5px' }}>reset</button>
      </form>
    </div>
  )
}

// --- ABOUT VIEW ---
const About = () => (
  <div>
    <h2>About anecdote application</h2>
    <p>According to Wikipedia:</p>
    <p><em>An anecdote is a brief, revealing account of an individual person or an incident: "likely to be interesting or amusing, and is often related to demonstrate a point or to make people laugh."</em></p>
  </div>
)

// --- MAIN APP COMPONENT ---
const App = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const notificationDispatch = useNotificationDispatch()
  
  const user = useUserValue()
  const userDispatch = useUserDispatch()

  // Login inputs using custom hooks
  const { reset: resetUsername, ...username } = useField('text')
  const { reset: resetPassword, ...password } = useField('password')

  // Clean initialization using getUser() service
  useEffect(() => {
    const savedUser = getUser()
    if (savedUser) {
      userDispatch({ type: 'LOGIN', payload: savedUser })
    }
  }, [userDispatch])

  // Queries
  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: anecdoteService.getAll,
    retry: 1
  })

  // Mutations
  const newAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.createNew,
    onSuccess: (newAnecdote) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      notificationDispatch({ type: 'SET_NOTIFICATION', payload: `Anecdote '${newAnecdote.content}' successfully created!` })
      setTimeout(() => notificationDispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
    }
  })

  const updateAnecdoteMutation = useMutation({
    mutationFn: ({ id, updatedObject }) => anecdoteService.update(id, updatedObject),
    onSuccess: (updatedAnecdote) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      notificationDispatch({ type: 'SET_NOTIFICATION', payload: `You liked '${updatedAnecdote.content}'` })
      setTimeout(() => notificationDispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
    }
  })

  const deleteAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.deleteOne,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
    }
  })

  // Event Handlers
  const handleLogin = (event) => {
    event.preventDefault()
    const targetUser = { username: username.value, name: 'Sample User', token: 'mock-123' }
    
    saveUser(targetUser) // Clean persistence function
    userDispatch({ type: 'LOGIN', payload: targetUser })
    
    resetUsername()
    resetPassword()

    notificationDispatch({ type: 'SET_NOTIFICATION', payload: `Welcome back, ${targetUser.name}!` })
    setTimeout(() => notificationDispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
  }

  const handleLogout = () => {
    removeUser() // Clean removal function
    userDispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  const handleCreate = (newAnecdote) => {
    newAnecdoteMutation.mutate({ ...newAnecdote, likes: 0 })
    navigate('/')
  }

  const handleLike = (anecdote) => {
    const updatedObject = {
      ...anecdote,
      likes: (anecdote.likes || 0) + 1
    }
    if (updatedObject.votes !== undefined) {
      delete updatedObject.votes
    }
    updateAnecdoteMutation.mutate({ id: anecdote.id, updatedObject })
  }

  const handleDelete = (id, content) => {
    if (window.confirm(`Delete "${content}"?`)) {
      deleteAnecdoteMutation.mutate(id)
      notificationDispatch({ type: 'SET_NOTIFICATION', payload: `Deleted '${content}'` })
      setTimeout(() => notificationDispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
    }
  }

  if (result.isLoading) {
    return <div style={{ padding: '20px' }}>Loading application data...</div>
  }

  if (result.isError) {
    return <div style={{ padding: '20px', color: 'red' }}>Anecdote service is not available due to server problems.</div>
  }

  const anecdotes = result.data ? [...result.data].sort((a, b) => (b.likes || 0) - (a.likes || 0)) : []

  if (user === null) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            username <input {...username} />
          </div>
          <div style={{ marginTop: '5px', marginBottom: '10px' }}>
            password <input {...password} />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#1976d2', padding: '15px 20px', color: 'white', fontWeight: 'bold', fontSize: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Blog App</span>
        <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
          {user.name} logged in <button onClick={handleLogout} style={{ marginLeft: '10px', cursor: 'pointer' }}>logout</button>
        </span>
      </div>

      <nav style={{ padding: '15px 0 10px 0' }}>
        <Link to="/" style={{ marginRight: '10px', color: '#5c2d91' }}>anecdotes</Link>
        <Link to="/create" style={{ marginRight: '10px', color: '#5c2d91' }}>create new</Link>
        <Link to="/about" style={{ color: '#5c2d91' }}>about</Link>
      </nav>

      <Notification />

      <Routes>
        <Route path="/" element={
          <AnecdoteList 
            anecdotes={anecdotes} 
            handleLike={handleLike} 
            handleDelete={handleDelete} 
          />
        } />
        <Route path="/create" element={<CreateNew handleCreate={handleCreate} />} />
        <Route path="/about" element={<About />} />
      </Routes>

      <footer style={{ marginTop: '30px', fontSize: '14px' }}>
        Anecdote app for <a href="https://fullstackopen.com" style={{ color: 'blue' }}>Full Stack Open</a>.
      </footer>
    </div>
  )
}

export default App