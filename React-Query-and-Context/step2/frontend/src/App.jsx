import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import anecdoteService from './services/anecdotes'
import Notification from './components/Notification'
import { useNotificationDispatch } from './NotificationContext'

// --- 1. LIST VIEW ---
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
            {/* Displays 'likes' from backend database */}
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
  const queryClient = useQueryClient()
  const dispatch = useNotificationDispatch()

  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      setUser(JSON.parse(loggedUserJSON))
    }
  }, [])

  // 1. React Query: Fetch Server Data
  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: anecdoteService.getAll,
    retry: 1
  })

  // 2. React Query Mutation: Create Post
  const newAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.createNew,
    onSuccess: (newAnecdote) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      dispatch({ type: 'SET_NOTIFICATION', payload: `Anecdote '${newAnecdote.content}' successfully created!` })
      setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
    }
  })

  // 3. React Query Mutation: Update (Like) Post
  const updateAnecdoteMutation = useMutation({
    mutationFn: ({ id, updatedObject }) => anecdoteService.update(id, updatedObject),
    onSuccess: (updatedAnecdote) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      dispatch({ type: 'SET_NOTIFICATION', payload: `You liked '${updatedAnecdote.content}'` })
      setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
    }
  })

  // 4. React Query Mutation: Delete Post
  const deleteAnecdoteMutation = useMutation({
    mutationFn: anecdoteService.deleteOne,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
    }
  })

  // ================= Event Handlers =================

  const handleLogin = (event) => {
    event.preventDefault()
    const targetUser = { username, name: 'Sample User', token: 'mock-123' }
    window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(targetUser))
    setUser(targetUser)
    setUsername('')
    setPassword('')

    // UPDATED: Dispatches the welcome banner on successful login
    dispatch({ type: 'SET_NOTIFICATION', payload: `Welcome back, ${targetUser.name}!` })
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    navigate('/')
  }

  const handleCreate = (newAnecdote) => {
    // Sets likes to 0 when creating a new blog post
    newAnecdoteMutation.mutate({ ...newAnecdote, likes: 0 })
    navigate('/')
  }

  const handleLike = (anecdote) => {
    // Increments likes property and safely handles any mixed fallback data
    const updatedObject = {
      ...anecdote,
      likes: (anecdote.likes || anecdote.votes || 0) + 1
    }
    
    // Clean up old votes property keys if present
    delete updatedObject.votes

    updateAnecdoteMutation.mutate({ id: anecdote.id, updatedObject })
  }

  const handleDelete = (id, content) => {
    if (window.confirm(`Delete "${content}"?`)) {
      deleteAnecdoteMutation.mutate(id)
      dispatch({ type: 'SET_NOTIFICATION', payload: `Deleted '${content}'` })
      setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
    }
  }

  if (result.isLoading) {
    return <div style={{ padding: '20px' }}>Loading application data...</div>
  }

  if (result.isError) {
    return <div style={{ padding: '20px', color: 'red' }}>Anecdote service is not available due to server problems.</div>
  }

  // Dynamic list sorting based entirely on item likes
  const anecdotes = result.data ? [...result.data].sort((a, b) => (b.likes || 0) - (a.likes || 0)) : []

  if (user === null) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            username <input type="text" value={username} onChange={({ target }) => setUsername(target.value)} />
          </div>
          <div style={{ marginTop: '5px', marginBottom: '10px' }}>
            password <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
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







// import { useState, useEffect } from 'react'
// import { Routes, Route, Link, useNavigate } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import anecdoteService from './services/anecdotes'
// import Notification from './components/Notification'
// import { useNotificationDispatch } from './NotificationContext'

// // --- 1. LIST VIEW ---
// const AnecdoteList = ({ anecdotes, handleLike, handleDelete }) => (
//   <div>
//     <h2>Anecdotes</h2>
//     <ul style={{ paddingLeft: '20px' }}>
//       {anecdotes.map(anecdote => (
//         <li key={anecdote.id} style={{ marginBottom: '12px' }}>
//           <div>
//             {anecdote.content} by <strong>{anecdote.author || 'unknown'}</strong>
//           </div>
//           <div style={{ marginTop: '4px', fontSize: '14px' }}>
//             {/* UPDATED: Displays 'likes' from backend database */}
//             has {anecdote.likes || 0} likes{' '}
//             <button onClick={() => handleLike(anecdote)} style={{ marginLeft: '5px', cursor: 'pointer' }}>
//               like
//             </button>
//             <button onClick={() => handleDelete(anecdote.id, anecdote.content)} style={{ marginLeft: '10px' }}>
//               delete
//             </button>
//           </div>
//         </li>
//       ))}
//     </ul>
//   </div>
// )

// // --- 2. CREATE NEW VIEW ---
// const CreateNew = ({ handleCreate }) => {
//   const [content, setContent] = useState('')
//   const [author, setAuthor] = useState('')
//   const [url, setUrl] = useState('')

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     handleCreate({ content, author, url })
//   }

//   const handleReset = (e) => {
//     e.preventDefault()
//     setContent('')
//     setAuthor('')
//     setUrl('')
//   }

//   return (
//     <div>
//       <h2>create a new anecdote</h2>
//       <form onSubmit={handleSubmit}>
//         <div style={{ marginBottom: '5px' }}>
//           content <input value={content} onChange={(e) => setContent(e.target.value)} />
//         </div>
//         <div style={{ marginBottom: '5px' }}>
//           author <input value={author} onChange={(e) => setAuthor(e.target.value)} />
//         </div>
//         <div style={{ marginBottom: '5px' }}>
//           url for more info <input value={url} onChange={(e) => setUrl(e.target.value)} />
//         </div>
//         <button type="submit">create</button>
//         <button onClick={handleReset} style={{ marginLeft: '5px' }}>reset</button>
//       </form>
//     </div>
//   )
// }

// // --- 3. ABOUT VIEW ---
// const About = () => (
//   <div>
//     <h2>About anecdote application</h2>
//     <p>According to Wikipedia:</p>
//     <p><em>An anecdote is a brief, revealing account of an individual person or an incident: "likely to be interesting or amusing, and is often related to demonstrate a point or to make people laugh."</em></p>
//   </div>
// )

// // --- MAIN APP COMPONENT ---
// const App = () => {
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()
//   const dispatch = useNotificationDispatch()

//   const [user, setUser] = useState(null)
//   const [username, setUsername] = useState('')
//   const [password, setPassword] = useState('')

//   useEffect(() => {
//     const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
//     if (loggedUserJSON) {
//       setUser(JSON.parse(loggedUserJSON))
//     }
//   }, [])

//   // 1. React Query: Fetch Server Data
//   const result = useQuery({
//     queryKey: ['anecdotes'],
//     queryFn: anecdoteService.getAll,
//     retry: 1
//   })

//   // 2. React Query Mutation: Create Post
//   const newAnecdoteMutation = useMutation({
//     mutationFn: anecdoteService.createNew,
//     onSuccess: (newAnecdote) => {
//       queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
//       dispatch({ type: 'SET_NOTIFICATION', payload: `Anecdote '${newAnecdote.content}' successfully created!` })
//       setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
//     }
//   })

//   // 3. React Query Mutation: Update (Like) Post
//   const updateAnecdoteMutation = useMutation({
//     mutationFn: ({ id, updatedObject }) => anecdoteService.update(id, updatedObject),
//     onSuccess: (updatedAnecdote) => {
//       queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
//       dispatch({ type: 'SET_NOTIFICATION', payload: `You liked '${updatedAnecdote.content}'` })
//       setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
//     }
//   })

//   // 4. React Query Mutation: Delete Post
//   const deleteAnecdoteMutation = useMutation({
//     mutationFn: anecdoteService.deleteOne,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
//     }
//   })

//   // ================= Event Handlers =================

//   const handleLogin = (event) => {
//     event.preventDefault()
//     const targetUser = { username, name: 'Sample User', token: 'mock-123' }
//     window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(targetUser))
//     setUser(targetUser)
//     setUsername('')
//     setPassword('')
//   }

//   const handleLogout = () => {
//     window.localStorage.removeItem('loggedBlogAppUser')
//     setUser(null)
//     navigate('/')
//   }

//   const handleCreate = (newAnecdote) => {
//     // UPDATED: Now sets likes to 0 when creating a new blog post
//     newAnecdoteMutation.mutate({ ...newAnecdote, likes: 0 })
//     navigate('/')
//   }

//   const handleLike = (anecdote) => {
//     // UPDATED: Increments likes property and safely handles any mixed fallback data
//     const updatedObject = {
//       ...anecdote,
//       likes: (anecdote.likes || anecdote.votes || 0) + 1
//     }
    
//     // Clean up old votes property keys if present
//     delete updatedObject.votes

//     updateAnecdoteMutation.mutate({ id: anecdote.id, updatedObject })
//   }

//   const handleDelete = (id, content) => {
//     if (window.confirm(`Delete "${content}"?`)) {
//       deleteAnecdoteMutation.mutate(id)
//       dispatch({ type: 'SET_NOTIFICATION', payload: `Deleted '${content}'` })
//       setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 5000)
//     }
//   }

//   if (result.isLoading) {
//     return <div style={{ padding: '20px' }}>Loading application data...</div>
//   }

//   if (result.isError) {
//     return <div style={{ padding: '20px', color: 'red' }}>Anecdote service is not available due to server problems.</div>
//   }

//   // UPDATED: Dynamic list sorting based entirely on item likes
//   const anecdotes = result.data ? [...result.data].sort((a, b) => (b.likes || 0) - (a.likes || 0)) : []

//   if (user === null) {
//     return (
//       <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
//         <h2>Log in to application</h2>
//         <form onSubmit={handleLogin}>
//           <div>
//             username <input type="text" value={username} onChange={({ target }) => setUsername(target.value)} />
//           </div>
//           <div style={{ marginTop: '5px', marginBottom: '10px' }}>
//             password <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
//           </div>
//           <button type="submit">login</button>
//         </form>
//       </div>
//     )
//   }

//   return (
//     <div style={{ fontFamily: 'sans-serif' }}>
//       <div style={{ backgroundColor: '#1976d2', padding: '15px 20px', color: 'white', fontWeight: 'bold', fontSize: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span>Blog App</span>
//         <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
//           {user.name} logged in <button onClick={handleLogout} style={{ marginLeft: '10px', cursor: 'pointer' }}>logout</button>
//         </span>
//       </div>

//       <nav style={{ padding: '15px 0 10px 0' }}>
//         <Link to="/" style={{ marginRight: '10px', color: '#5c2d91' }}>anecdotes</Link>
//         <Link to="/create" style={{ marginRight: '10px', color: '#5c2d91' }}>create new</Link>
//         <Link to="/about" style={{ color: '#5c2d91' }}>about</Link>
//       </nav>

//       <Notification />

//       <Routes>
//         <Route path="/" element={
//           <AnecdoteList 
//             anecdotes={anecdotes} 
//             handleLike={handleLike} 
//             handleDelete={handleDelete} 
//           />
//         } />
//         <Route path="/create" element={<CreateNew handleCreate={handleCreate} />} />
//         <Route path="/about" element={<About />} />
//       </Routes>

//       <footer style={{ marginTop: '30px', fontSize: '14px' }}>
//         Anecdote app for <a href="https://fullstackopen.com" style={{ color: 'blue' }}>Full Stack Open</a>.
//       </footer>
//     </div>
//   )
// }

// export default App