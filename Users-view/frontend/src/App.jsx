import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import anecdoteService from './services/anecdotes'
import userService from './services/users'
import { getUser, saveUser, removeUser } from './services/persistentUser'
import { useField } from './hooks'

import Notification from './components/Notification'
import { useNotificationDispatch } from './NotificationContext'
import { useUserValue, useUserDispatch } from './UserContext'

// --- 1. USERS VIEW COMPONENT (Matched to Screenshot Layout) ---
const UsersView = () => {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
    retry: 1
  })

  if (isLoading) return <div style={{ padding: '20px' }}>Loading user statistics...</div>
  if (isError) return <div style={{ padding: '20px' }}>Failed to fetch users from server.</div>

  return (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 'normal', margin: '10px 0 30px 0' }}>Users</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e0e0e0', textAlign: 'left' }}>
            <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '40%' }}>Name</th>
            <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '30%' }}>Username</th>
            <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '30%' }}>Blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: '20px 10px' }}>{u.name}</td>
              <td style={{ padding: '20px 10px' }}>{u.username}</td>
              <td style={{ padding: '20px 10px' }}>{u.anecdotes ? u.anecdotes.length : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- 2. LIST VIEW ---
const AnecdoteList = ({ anecdotes, handleLike, handleDelete }) => (
  <div style={{ padding: '20px 0' }}>
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

// --- 3. CREATE NEW VIEW ---
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
    <div style={{ padding: '20px 0' }}>
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

// --- 4. ABOUT VIEW ---
const About = () => (
  <div style={{ padding: '20px 0' }}>
    <h2>About anecdote application</h2>
    <p>According to Wikipedia:</p>
    <p><em>An anecdote is a brief, revealing account of an individual person or an incident...</em></p>
  </div>
)

// --- MAIN APP COMPONENT ---
const App = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const notificationDispatch = useNotificationDispatch()
  
  const user = useUserValue()
  const userDispatch = useUserDispatch()

  const { reset: resetUsername, ...username } = useField('text')
  const { reset: resetPassword, ...password } = useField('password')

  useEffect(() => {
    const savedUser = getUser()
    if (savedUser) {
      userDispatch({ type: 'LOGIN', payload: savedUser })
    }
  }, [userDispatch])

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: anecdoteService.getAll,
    retry: 1
  })

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

  const handleLogin = (event) => {
    event.preventDefault()
    const targetUser = { username: username.value, name: 'Sample User', token: 'mock-123' }
    
    saveUser(targetUser)
    userDispatch({ type: 'LOGIN', payload: targetUser })
    
    resetUsername()
    resetPassword()

    notificationDispatch({ type: 'SET_NOTIFICATION', payload: `Welcome back, ${targetUser.name}!` })
    setTimeout(() => notificationDispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
  }

  const handleLogout = (e) => {
    e.preventDefault()
    removeUser()
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

  // Global styles to match clean page layout
  const linkStyle = { color: 'white', textDecoration: 'none', marginLeft: '20px', fontSize: '16px', letterSpacing: '0.5px' }

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
    <div style={{ fontFamily: 'sans-serif', padding: '0 25px' }}>
      {/* Blue Header Row matching image exactly */}
      <div style={{ backgroundColor: '#1976d2', padding: '20px 25px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 -25px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
        <span style={{ fontSize: '24px', fontWeight: '500' }}>Blog App</span>
        <nav style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
          <Link to="/" style={linkStyle}>BLOGS</Link>
          <Link to="/users" style={linkStyle}>USERS</Link>
          <Link to="/create" style={linkStyle}>NEW BLOG</Link>
          <a href="#" onClick={handleLogout} style={linkStyle}>LOGOUT</a>
        </nav>
      </div>

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
        <Route path="/users" element={<UsersView />} />
        <Route path="/about" element={<About />} />
      </Routes>

      <footer style={{ marginTop: '40px', fontSize: '14px', borderTop: '1px solid #eee', paddingSelf: '10px 0' }}>
        Anecdote app for <a href="https://fullstackopen.com" style={{ color: 'blue' }}>Full Stack Open</a>.
      </footer>
    </div>
  )
}

export default App