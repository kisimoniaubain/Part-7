import { useState } from 'react'
import useBlogStore from '../stores/blogStore'

const BlogForm = ({ showNotification }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  
  // Grab the creation action directly from the store
  const createBlog = useBlogStore((state) => state.createBlog)

  const handleCreateBlog = async (event) => {
    event.preventDefault()
    
    try {
      await createBlog({ title, author, url })
      
      showNotification(`A new blog "${title}" by ${author} added!`, 'success')
      
      // Clear input fields
      setTitle('')
      setAuthor('')
      setUrl('')
    } catch (error) {
      showNotification('Failed to create blog. Check your inputs.', 'error')
    }
  }

  return (
    <form onSubmit={handleCreateBlog}>
      {/* Your form inputs for title, author, and url */}
      <button type="submit">create</button>
    </form>
  )
}

export default BlogForm