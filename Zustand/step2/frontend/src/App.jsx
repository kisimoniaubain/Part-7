import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate, useMatch } from 'react-router-dom'
import useBlogStore from './stores/blogStore'

// --- 1. ANECDOTES LIST VIEW (Image 1) ---
const AnecdoteList = ({ anecdotes, handleDelete }) => (
  <div>
    <h2>Anecdotes</h2>
    <ul style={{ paddingLeft: '20px' }}>
      {anecdotes.map(anecdote => (
        <li key={anecdote.id} style={{ marginBottom: '8px' }}>
          {anecdote.content} by <strong>{anecdote.author || ''}</strong>{' '}
          <button onClick={() => handleDelete(anecdote.id, anecdote.content)}>
            delete
          </button>
        </li>
      ))}
    </ul>
  </div>
)

// --- 2. CREATE NEW VIEW (Image 2) ---
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

// --- 3. ABOUT VIEW (Image 3) ---
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
  
  // Connect Zustand State and Actions
  const anecdotes = useBlogStore((state) => state.blogs)
  const fetchBlogs = useBlogStore((state) => state.fetchBlogs)
  const createBlog = useBlogStore((state) => state.createBlog)
  const deleteBlog = useBlogStore((state) => state.deleteBlog)

  // Sync data with backend on start
  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  // Creation Handler linking to Zustand
  const handleCreate = async (newAnecdote) => {
    try {
      await createBlog({
        ...newAnecdote,
        votes: 0
      })
      navigate('/') // Automatically redirect to list page after creating
    } catch (error) {
      console.error('Failed to create item:', error)
    }
  }

  // Functional Delete Handler linking to Zustand
  const handleDelete = async (id, content) => {
    if (window.confirm(`Delete "${content}"?`)) {
      await deleteBlog(id)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header Banner matching screenshots */}
      <div style={{ backgroundColor: '#1976d2', padding: '15px 20px', color: 'white', fontWeight: 'bold', fontSize: '24px' }}>
        Blog App
      </div>

      {/* Styled Route Links */}
      <nav style={{ padding: '15px 0 10px 0' }}>
        <Link to="/" style={{ marginRight: '10px', color: '#5c2d91' }}>anecdotes</Link>
        <Link to="/create" style={{ marginRight: '10px', color: '#5c2d91' }}>create new</Link>
        <Link to="/about" style={{ color: '#5c2d91' }}>about</Link>
      </nav>

      {/* Pages Router Definition */}
      <Routes>
        <Route path="/" element={<AnecdoteList anecdotes={anecdotes} handleDelete={handleDelete} />} />
        <Route path="/create" element={<CreateNew handleCreate={handleCreate} />} />
        <Route path="/about" element={<About />} />
      </Routes>

      {/* Shared Footer */}
      <footer style={{ marginTop: '30px', fontSize: '14px' }}>
        Anecdote app for <a href="https://fullstackopen.com" style={{ color: 'blue' }}>Full Stack Open</a>.
      </footer>
    </div>
  )
}

export default App