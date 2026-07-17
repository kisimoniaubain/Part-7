import { create } from 'zustand'
import anecdoteService from '../services/anecdotes'

const useBlogStore = create((set, get) => ({
  blogs: [],

  fetchBlogs: async () => {
    try {
      const anecdotes = await anecdoteService.getAll()
      // Keeping your sorting logic if needed
      set({ blogs: anecdotes })
    } catch (error) {
      console.error('Failed to fetch anecdotes:', error)
    }
  },

  createBlog: async (newAnecdoteObject) => {
    try {
      const createdAnecdote = await anecdoteService.createNew(newAnecdoteObject)
      set({ blogs: get().blogs.concat(createdAnecdote) })
    } catch (error) {
      console.error('Failed to create anecdote:', error)
      throw error 
    }
  },

  // ADD THIS ACTION FOR THE DELETE FUNCTION
  deleteBlog: async (id) => {
    try {
      await anecdoteService.deleteOne(id)
      // Filter out the deleted item from global state instantly
      set({ blogs: get().blogs.filter(blog => blog.id !== id) })
    } catch (error) {
      console.error('Failed to delete anecdote:', error)
    }
  }
}))

export default useBlogStore