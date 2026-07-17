


import { useField } from '../hooks'

const CreateNew = () => {
  // We extract and rename 'reset' so it doesn't go into the input tag
  const { reset: resetContent, ...content } = useField('text')
  const { reset: resetAuthor, ...author } = useField('text')
  const { reset: resetInfo, ...info } = useField('text')

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const handleReset = (e) => {
    e.preventDefault()
    // Calling the renamed functions updates the hook state to ''
    resetContent()
    resetAuthor()
    resetInfo()
  }

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div>content <input {...content} /></div>
        <div>author <input {...author} /></div>
        <div>url for more info <input {...info} /></div>
        <button type="submit">create</button>
        <button type="button" onClick={handleReset}>reset</button>
      </form>
    </div>
  )
}

export default CreateNew
