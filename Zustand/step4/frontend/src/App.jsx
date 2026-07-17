import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import useBlogStore from './stores/blogStore'
// Assuming you have a login service setup from earlier parts of the course
// import loginService from './services/login' 

// --- 1. ANECDOTES LIST VIEW ---
const AnecdoteList = ({ anecdotes, handleDelete, handleVote }) => (
  <div>
    <h2>Anecdotes</h2>
    <ul style={{ paddingLeft: '20px' }}>
      {anecdotes.map(anecdote => (
        <li key={anecdote.id} style={{ marginBottom: '12px' }}>
          <div>
            {anecdote.content} by <strong>{anecdote.author || 'unknown'}</strong>
          </div>
          <div style={{ marginTop: '4px', fontSize: '14px' }}>
            has {anecdote.votes || 0} votes{' '}
            <button onClick={() => handleVote(anecdote.id)} style={{ marginLeft: '5px', cursor: 'pointer' }}>
              vote
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

// --- 2. CREATE NEW VIEW ---
const CreateNew = ({ handleCreate }) => {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    handleCreate({ content, author, url })
  }

  const handleReset = (e) => {
    e.preventDefault()
    setContent('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '5px' }}>
          content <input value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div style={{ marginBottom: '5px' }}>
          author <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div style={{ marginBottom: '5px' }}>
          url for more info <input value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <button type="submit">create</button>
        <button onClick={handleReset} style={{ marginLeft: '5px' }}>reset</button>
      </form>
    </div>
  )
}

// --- 3. ABOUT VIEW ---
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
  
  // Zustand State hooks (Including the new user fields)
  const anecdotes = useBlogStore((state) => state.blogs)
  const fetchBlogs = useBlogStore((state) => state.fetchBlogs)
  const createBlog = useBlogStore((state) => state.createBlog)
  const deleteBlog = useBlogStore((state) => state.deleteBlog)
  const voteBlog = useBlogStore((state) => state.voteBlog)
  
  const user = useBlogStore((state) => state.user)         // <-- Zustand state
  const setUser = useBlogStore((state) => state.setUser)   // <-- Zustand action
  const clearUser = useBlogStore((state) => state.clearUser) // <-- Zustand action

  // Local state fields for login form
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // 1. Fetch anecdotes data on mount
  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  // 2. Check window local storage on mount for active user session
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const parsedUser = JSON.parse(loggedUserJSON)
      setUser(parsedUser) // Store straight into Zustand globally
    }
  }, [setUser])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      // Replace this object block with your actual loginService logic when ready:
      // const targetUser = await loginService.login({ username, password })
      
      const targetUser = { username, name: 'Sample User', token: 'mock-123' } // Placeholder Mock
      
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(targetUser))
      setUser(targetUser) // Set user inside Zustand store
      setUsername('')
      setPassword('')
    } catch (exception) {
      console.error('Wrong credentials')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    clearUser() // Clear out user state inside Zustand store
    navigate('/')
  }

  const handleCreate = async (newAnecdote) => {
    try {
      await createBlog({ ...newAnecdote, votes: 0 })
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id, content) => {
    if (window.confirm(`Delete "${content}"?`)) {
      await deleteBlog(id)
    }
  }

  const handleVote = async (id) => {
    await voteBlog(id)
  }

  // Render a clean login form if no global user exists in Zustand
  if (user === null) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            username{' '}
            <input type="text" value={username} onChange={({ target }) => setUsername(target.value)} />
          </div>
          <div style={{ marginTop: '5px', marginBottom: '10px' }}>
            password{' '}
            <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header Banner */}
      <div style={{ backgroundColor: '#1976d2', padding: '15px 20px', color: 'white', fontWeight: 'bold', fontSize: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Blog App</span>
        <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
          {user.name} logged in <button onClick={handleLogout} style={{ marginLeft: '10px', cursor: 'pointer' }}>logout</button>
        </span>
      </div>

      {/* Navigation links */}
      <nav style={{ padding: '15px 0 10px 0' }}>
        <Link to="/" style={{ marginRight: '10px', color: '#5c2d91' }}>anecdotes</Link>
        <Link to="/create" style={{ marginRight: '10px', color: '#5c2d91' }}>create new</Link>
        <Link to="/about" style={{ color: '#5c2d91' }}>about</Link>
      </nav>

      {/* Pages Router Definition */}
      <Routes>
        <Route path="/" element={<AnecdoteList anecdotes={anecdotes} handleDelete={handleDelete} handleVote={handleVote} />} />
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