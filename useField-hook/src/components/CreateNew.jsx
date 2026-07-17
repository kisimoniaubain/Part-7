import { useField } from '../hooks'

const CreateNew = (props) => {
  const content = useField('text')
  const author = useField('text')
  const info = useField('text')

  const handleSubmit = (e) => {
    e.preventDefault()
    // No action needed here yet, just to stop the form from refreshing the page
    console.log('Submitted')
  }

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div>
          content 
          <input type={content.type} value={content.value} onChange={content.onChange} />
        </div>
        <div>
          author 
          <input type={author.type} value={author.value} onChange={author.onChange} />
        </div>
        <div>
          url for more info 
          <input type={info.type} value={info.value} onChange={info.onChange} />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default CreateNew