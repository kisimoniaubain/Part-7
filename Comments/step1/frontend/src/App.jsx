import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useMatch } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import anecdoteService from './services/anecdotes'
import userService from './services/users'
import { getUser, saveUser, removeUser } from './services/persistentUser'
import { useField } from './hooks'

import Notification from './components/Notification'
import { useNotificationDispatch } from './NotificationContext'
import { useUserValue, useUserDispatch } from './UserContext'

// --- 1. SINGLE BLOG / ANECDOTE VIEW (7.18 - Matches Screenshot Layout Perfectly) ---
const SingleAnecdoteView = ({ anecdote, handleLike, allUsers }) => {
  if (!anecdote) return <div style={{ padding: '20px' }}>Blog post not found.</div>

  // Find the user object who created this post using the userId matching
  const creator = allUsers.find(
    u => u.id === anecdote.userId || u.anecdotes?.includes(anecdote.id)
  )
  const creatorName = creator ? creator.name : (anecdote.author || 'unknown')

  return (
    <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '4px', marginTop: '20px', backgroundColor: 'white' }}>
      <h2 style={{ fontSize: '32px', margin: '10px 0', fontWeight: 'bold' }}>{anecdote.content || 'Untitled Blog'}</h2>
      <div style={{ fontSize: '18px', color: '#555', marginBottom: '10px' }}>
        by {anecdote.author || 'unknown'}
      </div>
      <div style={{ marginBottom: '15px' }}>
        {anecdote.url ? (
          <a href={anecdote.url} target="_blank" rel="noreferrer" style={{ color: '#1a73e8', textDecoration: 'underline' }}>
            {anecdote.url}
          </a>
        ) : (
          <span style={{ color: '#999', fontStyle: 'italic' }}>No link attached</span>
        )}
      </div>

      {/* Renders the "Added by" value as requested */}
      <div style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>
        Added by {creatorName}
      </div>

      <div style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <strong style={{ marginRight: '10px' }}>{anecdote.likes || 0} likes</strong>
        <button 
          onClick={() => handleLike(anecdote)} 
          style={{ padding: '5px 15px', color: '#1a73e8', border: '1px solid #1a73e8', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 'bold' }}
        >
          LIKE
        </button>
      </div>

      <h3 style={{ fontSize: '24px', margin: '30px 0 15px 0', fontWeight: 'normal' }}>comments</h3>
      
      {!anecdote.comments || anecdote.comments.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No comments left yet.</p>
      ) : (
        <ul style={{ paddingLeft: '20px', lineHeight: '2', fontSize: '16px' }}>
          {anecdote.comments.map((comment, index) => (
            <li key={index}>{comment}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

// --- 2. INDIVIDUAL USER VIEW ---
const UserView = ({ individualUser, allAnecdotes }) => {
  if (!individualUser) return null
  const usersAnecdotes = allAnecdotes.filter(
    anecdote => anecdote.userId === individualUser.id || anecdote.author === individualUser.name
  )

  return (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ fontSize: '36px', margin: '10px 0', fontWeight: '500' }}>{individualUser.name}</h2>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '20px 0 15px 0' }}>added blogs</h3>
      <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
        {usersAnecdotes.map(anecdote => (
          <li key={anecdote.id} style={{ fontSize: '16px' }}>{anecdote.content}</li>
        ))}
      </ul>
    </div>
  )
}

// --- 3. ALL USERS LIST VIEW ---
const UsersView = ({ users }) => (
  <div style={{ padding: '20px 0' }}>
    <h2 style={{ fontSize: '32px', fontWeight: 'normal', margin: '10px 0 30px 0' }}>Users</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #e0e0e0', textAlign: 'left' }}>
          <th style={{ padding: '15px 10px', fontWeight: 'bold' }}>Name</th>
          <th style={{ padding: '15px 10px', fontWeight: 'bold' }}>Username</th>
          <th style={{ padding: '15px 10px', fontWeight: 'bold' }}>Blogs created</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={{ padding: '20px 10px' }}>
              <Link to={`/users/${u.id}`} style={{ color: '#1a73e8', textDecoration: 'underline' }}>{u.name}</Link>
            </td>
            <td style={{ padding: '20px 10px' }}>{u.username}</td>
            <td style={{ padding: '20px 10px' }}>{u.anecdotes ? u.anecdotes.length : 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// --- 4. ANECDOTES / BLOGS LIST VIEW ---
const AnecdoteList = ({ anecdotes, handleLike, handleDelete }) => (
  <div style={{ padding: '20px 0' }}>
    <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Blogs / Anecdotes</h2>
    <ul style={{ paddingLeft: '20px' }}>
      {anecdotes.map(anecdote => (
        <li key={anecdote.id} style={{ marginBottom: '16px', fontSize: '16px' }}>
          <div>
            <Link to={`/blogs/${anecdote.id}`} style={{ color: '#1a73e8', fontWeight: '500', textDecoration: 'none' }}>
              {anecdote.content || "Untitled Entry"}
            </Link> by <strong>{anecdote.author || 'unknown'}</strong>
          </div>
          <div style={{ marginTop: '4px', fontSize: '14px' }}>
            has {anecdote.likes || 0} likes{' '}
            <button onClick={() => handleLike(anecdote)} style={{ marginLeft: '5px', cursor: 'pointer' }}>like</button>
            <button onClick={() => handleDelete(anecdote.id, anecdote.content)} style={{ marginLeft: '10px' }}>delete</button>
          </div>
        </li>
      ))}
    </ul>
  </div>
)

// --- 5. CREATE NEW VIEW ---
const CreateNew = ({ handleCreate }) => {
  const { reset: resetContent, ...content } = useField('text')
  const { reset: resetAuthor, ...author } = useField('text')
  const { reset: resetUrl, ...url } = useField('text')

  const handleSubmit = (e) => {
    e.preventDefault()
    handleCreate({ content: content.value, author: author.value, url: url.value })
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '5px' }}>content <input {...content} /></div>
        <div style={{ marginBottom: '5px' }}>author <input {...author} /></div>
        <div style={{ marginBottom: '5px' }}>url for more info <input {...url} /></div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

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

  const anecdoteResult = useQuery({ queryKey: ['anecdotes'], queryFn: anecdoteService.getAll, retry: 1 })
  const usersResult = useQuery({ queryKey: ['users'], queryFn: userService.getAll, retry: 1 })

  const updateAnecdoteMutation = useMutation({
    mutationFn: ({ id, updatedObject }) => anecdoteService.update(id, updatedObject),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['anecdotes'] }) }
  })

  const newAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.createNew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/')
    }
  })

  const deleteAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.deleteOne,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const anecdotes = anecdoteResult.data ? [...anecdoteResult.data].sort((a, b) => (b.likes || 0) - (a.likes || 0)) : []
  const users = usersResult.data ? usersResult.data : []

  // Dynamic Route matching
  const userMatch = useMatch('/users/:id')
  const individualUser = userMatch ? users.find(u => u.id === userMatch.params.id) : null

  const blogMatch = useMatch('/blogs/:id')
  const singleAnecdote = blogMatch ? anecdotes.find(a => a.id === blogMatch.params.id) : null

  const handleLogin = (event) => {
    event.preventDefault()
    const targetUser = { username: username.value, name: 'Sample User', token: 'mock-123' }
    saveUser(targetUser)
    userDispatch({ type: 'LOGIN', payload: targetUser })
  }

  const handleLogout = (e) => {
    e.preventDefault()
    removeUser()
    userDispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  const handleCreate = (newAnecdote) => {
    newAnecdoteMutation.mutate({ ...newAnecdote, likes: 0, comments: [] })
  }

  const handleLike = (anecdote) => {
    const updatedObject = { ...anecdote, likes: (anecdote.likes || 0) + 1 }
    if (updatedObject.votes !== undefined) delete updatedObject.votes
    updateAnecdoteMutation.mutate({ id: anecdote.id, updatedObject })
  }

  const handleDelete = (id, content) => {
    if (window.confirm(`Delete "${content}"?`)) deleteAnecdoteMutation.mutate(id)
  }

  if (anecdoteResult.isLoading || usersResult.isLoading) return <div style={{ padding: '20px' }}>Loading data...</div>
  if (anecdoteResult.isError || usersResult.isError) return <div style={{ padding: '20px' }}>Communication error...</div>

  const linkStyle = { color: 'white', textDecoration: 'none', marginLeft: '20px', fontSize: '16px', fontWeight: '500' }

  if (user === null) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>username <input {...username} /></div>
          <div style={{ marginTop: '5px', marginBottom: '10px' }}>password <input {...password} /></div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '0 25px' }}>
      <div style={{ backgroundColor: '#1976d2', padding: '20px 25px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 -25px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
        <span style={{ fontSize: '24px', fontWeight: '500' }}>Blog App</span>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={linkStyle}>BLOGS</Link>
          <Link to="/users" style={linkStyle}>USERS</Link>
          <Link to="/create" style={linkStyle}>NEW BLOG</Link>
          <a href="#" onClick={handleLogout} style={linkStyle}>LOGOUT</a>
        </nav>
      </div>

      <Notification />

      <Routes>
        <Route path="/" element={<AnecdoteList anecdotes={anecdotes} handleLike={handleLike} handleDelete={handleDelete} />} />
        <Route path="/create" element={<CreateNew handleCreate={handleCreate} />} />
        <Route path="/users" element={<UsersView users={users} />} />
        <Route path="/users/:id" element={<UserView individualUser={individualUser} allAnecdotes={anecdotes} />} />
        {/* Pass down the users array state into the component here */}
        <Route path="/blogs/:id" element={<SingleAnecdoteView anecdote={singleAnecdote} handleLike={handleLike} allUsers={users} />} />
      </Routes>

      <footer style={{ marginTop: '40px', fontSize: '14px', borderTop: '1px solid #eee', padding: '15px 0' }}>
        Anecdote app for <a href="https://fullstackopen.com" style={{ color: 'blue' }}>Full Stack Open</a>.
      </footer>
    </div>
  )
}

export default App