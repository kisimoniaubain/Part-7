import React from 'react'
import { useNavigate } from 'react-router-dom' // 1. Import useNavigate
import { useField } from '../hooks'

const CreateNew = ({ addAnecdote }) => {
  const content = useField('text')
  const author = useField('text')
  const info = useField('text')
  
  const navigate = useNavigate() // 2. Initialize the navigate function

  const handleSubmit = (e) => {
    e.preventDefault()
    
    addAnecdote({
      content: content.value,
      author: author.value,
      info: info.value,
      votes: 0
    })

    content.reset()
    author.reset()
    info.reset()

    navigate('/') // 3. Redirect back to the main list route
  }

  const handleReset = (e) => {
    e.preventDefault() 
    content.reset()
    author.reset()
    info.reset()
  }

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div>
          content
          <input 
            type={content.type}
            value={content.value}
            onChange={content.onChange} 
          />
        </div>
        <div>
          author
          <input 
            type={author.type}
            value={author.value}
            onChange={author.onChange} 
          />
        </div>
        <div>
          url for more info
          <input 
            type={info.type}
            value={info.value}
            onChange={info.onChange} 
          />
        </div>
        <button type="submit">create</button>
        <button type="button" onClick={handleReset}>reset</button>
      </form>
    </div>
  )
}

export default CreateNew