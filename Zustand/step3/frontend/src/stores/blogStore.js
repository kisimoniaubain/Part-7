import { create } from 'zustand'
import anecdoteService from '../services/anecdotes'

const useBlogStore = create((set, get) => ({
  blogs: [],

  fetchBlogs: async () => {
    try {
      const anecdotes = await anecdoteService.getAll()
      // Automatically keep them sorted by votes from highest to lowest!
      const sorted = anecdotes.sort((a, b) => b.votes - a.votes)
      set({ blogs: sorted })
    } catch (error) {
      console.error(error)
    }
  },

  createBlog: async (newAnecdoteObject) => {
    try {
      const createdAnecdote = await anecdoteService.createNew(newAnecdoteObject)
      set({ blogs: get().blogs.concat(createdAnecdote) })
    } catch (error) {
      console.error(error)
      throw error 
    }
  },

  deleteBlog: async (id) => {
    try {
      await anecdoteService.deleteOne(id)
      set({ blogs: get().blogs.filter(blog => blog.id !== id) })
    } catch (error) {
      console.error(error)
    }
  },

  // ADD THE VOTE ACTION HERE
  voteBlog: async (id) => {
    const originalBlogs = get().blogs
    const blogToVote = originalBlogs.find(b => b.id === id)
    
    if (!blogToVote) return

    const updatedBlog = {
      ...blogToVote,
      votes: (blogToVote.votes || 0) + 1
    }

    try {
      const savedBlog = await anecdoteService.update(id, updatedBlog)
      // Update the state array and automatically re-sort it by highest votes
      const updatedArray = originalBlogs.map(b => b.id !== id ? b : savedBlog)
      set({ blogs: updatedArray.sort((a, b) => b.votes - a.votes) })
    } catch (error) {
      console.error('Failed to register vote:', error)
    }
  }
}))

export default useBlogStore