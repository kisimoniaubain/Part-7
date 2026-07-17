import axios from 'axios'
const baseUrl = 'http://localhost:3001/anecdotes' // json-server endpoint mapper

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const createNew = async (newObject) => {
  const response = await axios.post(baseUrl, newObject)
  return response.data
}

const update = async (id, newObject) => {
  const response = await axios.put(`${baseUrl}/${id}`, newObject)
  return response.data
}

const deleteOne = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`)
  return response.data
}

// 7.19: Extends service to append comments to a specific blog id
const addComment = async (id, commentText) => {
  // First, get the current blog entry
  const currentBlog = await axios.get(`${baseUrl}/${id}`)
  const updatedBlog = {
    ...currentBlog.data,
    comments: currentBlog.data.comments ? currentBlog.data.comments.concat(commentText) : [commentText]
  }
  // Save the updated object back to json-server
  const response = await axios.put(`${baseUrl}/${id}`, updatedBlog)
  return response.data
}

export default { getAll, createNew, update, deleteOne, addComment }