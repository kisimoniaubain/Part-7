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

// --- REUSABLE REMOVE BUTTON STYLE ---
const removeBtnStyle = {
  marginLeft: '10px',
  padding: '6px 14px',
  backgroundColor: 'white',
  color: '#d32f2f',
  border: '1px solid #f4c7c7', // Light red/pinkish border matching the UI screenshot
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '500',
  fontSize: '14px',
  textTransform: 'uppercase',
  transition: 'background-color 0.2s'
}

// --- 1. SINGLE BLOG / ANECDOTE VIEW ---
const SingleAnecdoteView = ({ anecdote, handleLike, handleAddComment, handleDelete, allUsers }) => {
  if (!anecdote) return <div style={{ padding: '20px' }}>Blog post not found.</div>
  
  const [commentInput, setCommentInput] = useState('')

  const creator = allUsers.find(
    u => u.id === anecdote.userId || u.anecdotes?.includes(anecdote.id)
  )
  const creatorName = creator ? creator.name : (anecdote.author || 'unknown')

  const onSubmitComment = (e) => {
    e.preventDefault()
    if (!commentInput.trim()) return
    handleAddComment(anecdote.id, commentInput.trim(), anecdote.content)
    setCommentInput('')
  }

  return (
    <div style={{ padding: '25px', border: '1px solid #e0e0e0', borderRadius: '4px', marginTop: '20px', backgroundColor: 'white', boxShadow: '0px 1px 3px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '32px', margin: '10px 0', fontWeight: 'normal', color: '#111' }}>{anecdote.content || 'Untitled Blog'}</h2>
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

      <div style={{ fontSize: '16px', marginBottom: '15px', color: '#555' }}>
        Added by {creatorName}
      </div>

      <div style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px', color: '#333' }}><strong>{anecdote.likes || 0}</strong> likes</span>
        <button 
          onClick={() => handleLike(anecdote)} 
          style={{ padding: '6px 16px', color: '#1a73e8', border: '1px solid #1a73e8', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase', fontWeight: '500', fontSize: '14px' }}
        >
          LIKE
        </button>
        <button 
          onClick={() => handleDelete(anecdote.id, anecdote.content)} 
          style={{ ...removeBtnStyle, marginLeft: '0px' }}
        >
          REMOVE
        </button>
      </div>

      <h3 style={{ fontSize: '24px', margin: '30px 0 15px 0', fontWeight: 'normal' }}>comments</h3>
      
      <form onSubmit={onSubmitComment} style={{ display: 'flex', gap: '10px', marginBottom: '25px', alignItems: 'center' }}>
        <input 
          type="text"
          placeholder="add a comment"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', width: '250px' }}
        />
        <button 
          type="submit"
          style={{ padding: '10px 20px', color: 'white', backgroundColor: '#1976d2', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}
        >
          ADD COMMENT
        </button>
      </form>
      
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
    <h2 style={{ fontSize: '36px', marginBottom: '20px', fontWeight: 'bold' }}>blogs</h2>
    <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
      {anecdotes.map(anecdote => (
        <li key={anecdote.id} style={{ marginBottom: '16px', fontSize: '16px' }}>
          <div>
            <Link to={`/blogs/${anecdote.id}`} style={{ color: '#1a73e8', fontWeight: 'normal', textDecoration: 'underline' }}>
              {anecdote.content || "Untitled Entry"}
            </Link> by <strong>{anecdote.author || 'unknown'}</strong>
          </div>
          <div style={{ marginTop: '6px', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
            has {anecdote.likes || 0} likes{' '}
            <button onClick={() => handleLike(anecdote)} style={{ marginLeft: '10px', cursor: 'pointer', padding: '2px 8px' }}>like</button>
            <button 
              onClick={() => handleDelete(anecdote.id, anecdote.content)} 
              style={removeBtnStyle}
            >
              REMOVE
            </button>
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

  const inputStyle = {
    width: '450px',
    padding: '12px 15px',
    fontSize: '18px',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '15px',
    display: 'block',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const btnStyle = {
    padding: '12px 24px',
    color: 'white',
    backgroundColor: '#1976d2',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.15)'
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 25px 0' }}>create new</h2>
      <form onSubmit={handleSubmit}>
        <input {...content} placeholder="title" style={inputStyle} />
        <input {...author} placeholder="author" style={inputStyle} />
        <input {...url} placeholder="url" style={inputStyle} />
        <button type="submit" style={btnStyle}>CREATE</button>
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

  const addCommentMutation = useMutation({
    mutationFn: ({ id, comment }) => anecdoteService.addComment(id, comment),
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
      navigate('/')
    }
  })

  const anecdotes = anecdoteResult.data ? [...anecdoteResult.data].sort((a, b) => (b.likes || 0) - (a.likes || 0)) : []
  const users = usersResult.data ? usersResult.data : []

  const userMatch = useMatch('/users/:id')
  const individualUser = userMatch ? users.find(u => u.id === userMatch.params.id) : null

  const blogMatch = useMatch('/blogs/:id')
  const singleAnecdote = blogMatch ? anecdotes.find(a => a.id === blogMatch.params.id) : null

  const handleLogin = (event) => {
    event.preventDefault()
    const targetUser = { username: username.value, name: 'Matti Luukkainen', token: 'mock-123' }
    saveUser(targetUser)
    userDispatch({ type: 'LOGIN', payload: targetUser })
    
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
    newAnecdoteMutation.mutate({ ...newAnecdote, likes: 0, comments: [] })
    
    notificationDispatch({ type: 'SET_NOTIFICATION', payload: `a new blog ${newAnecdote.content} by ${user?.name || 'unknown'} added` })
    setTimeout(() => notificationDispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
  }

  const handleLike = (anecdote) => {
    const updatedObject = { ...anecdote, likes: (anecdote.likes || 0) + 1 }
    if (updatedObject.votes !== undefined) delete updatedObject.votes
    updateAnecdoteMutation.mutate({ id: anecdote.id, updatedObject })
    
    notificationDispatch({ type: 'SET_NOTIFICATION', payload: `You liked '${anecdote.content}'` })
    setTimeout(() => notificationDispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
  }

  const handleAddComment = (id, comment, blogTitle) => {
    addCommentMutation.mutate({ id, comment })
    
    notificationDispatch({ type: 'SET_NOTIFICATION', payload: `Added comment: "${comment}"` })
    setTimeout(() => notificationDispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
  }

  const handleDelete = (id, content) => {
    if (window.confirm(`Remove blog "${content}"?`)) {
      deleteAnecdoteMutation.mutate(id)
      notificationDispatch({ type: 'SET_NOTIFICATION', payload: `Removed blog '${content}'` })
      setTimeout(() => notificationDispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
    }
  }

  if (anecdoteResult.isLoading || usersResult.isLoading) return <div style={{ padding: '20px' }}>Loading data...</div>
  if (anecdoteResult.isError || usersResult.isError) return <div style={{ padding: '20px' }}>Communication error...</div>

  const unloggedLinkStyle = { color: 'purple', textDecoration: 'underline', marginRight: '15px', fontSize: '18px' }
  const bannerLinkStyle = { color: 'white', textDecoration: 'none', marginLeft: '20px', fontSize: '16px', fontWeight: '500' }

  if (user === null) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <nav style={{ marginBottom: '25px' }}>
          <Link to="/" style={unloggedLinkStyle}>blogs</Link>
          <Link to="/login" style={unloggedLinkStyle}>login</Link>
        </nav>
        
        <Notification />
        
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px' }}>Log in to application</h2>
        
        <form onSubmit={handleLogin} style={{ width: '300px' }}>
          <input 
            {...username} 
            placeholder="username" 
            style={{ width: '100%', border: 'none', borderBottom: '1px solid #999', padding: '10px 5px', fontSize: '18px', marginBottom: '30px', outline: 'none' }} 
          />
          <input 
            {...password} 
            placeholder="password" 
            style={{ width: '100%', border: 'none', borderBottom: '1px solid #999', padding: '10px 5px', fontSize: '18px', marginBottom: '20px', outline: 'none' }} 
          />
          <button 
            type="submit" 
            style={{ padding: '12px 24px', color: 'white', backgroundColor: '#1976d2', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', boxShadow: '0px 2px 4px rgba(0,0,0,0.15)' }}
          >
            LOGIN
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '0 25px' }}>
      <div style={{ backgroundColor: '#1976d2', padding: '20px 25px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 -25px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
        <span style={{ fontSize: '24px', fontWeight: '500' }}>Blog App</span>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={bannerLinkStyle}>BLOGS</Link>
          <Link to="/users" style={bannerLinkStyle}>USERS</Link>
          <Link to="/create" style={bannerLinkStyle}>NEW BLOG</Link>
          <a href="#" onClick={handleLogout} style={bannerLinkStyle}>LOGOUT</a>
        </nav>
      </div>

      <Notification />

      <Routes>
        <Route path="/" element={<AnecdoteList anecdotes={anecdotes} handleLike={handleLike} handleDelete={handleDelete} />} />
        <Route path="/create" element={<CreateNew handleCreate={handleCreate} />} />
        <Route path="/users" element={<UsersView users={users} />} />
        <Route path="/users/:id" element={<UserView individualUser={individualUser} allAnecdotes={anecdotes} />} />
        <Route path="/blogs/:id" element={
          <SingleAnecdoteView 
            anecdote={singleAnecdote} 
            handleLike={handleLike} 
            handleAddComment={handleAddComment} 
            handleDelete={handleDelete}
            allUsers={users} 
          />
        } />
      </Routes>
    </div>
  )
}

export default App