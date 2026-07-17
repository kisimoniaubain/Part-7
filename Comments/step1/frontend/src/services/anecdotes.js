const baseUrl = 'http://localhost:3001/anecdotes'

const getAll = async () => {
  const response = await fetch(baseUrl)
  return response.json()
}

const createNew = async (newObject) => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newObject)
  })
  return response.json()
}

// Keep these intact for later steps
const deleteOne = async (id) => {
  await fetch(`${baseUrl}/${id}`, { method: 'DELETE' })
}

const update = async (id, newObject) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newObject)
  })
  return response.json()
}

export default { getAll, createNew, deleteOne, update }