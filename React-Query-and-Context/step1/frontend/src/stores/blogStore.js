import { create } from 'zustand'
import anecdoteService from '../services/anecdotes'

const useBlogStore = create((set, get) => ({
  blogs: [],
  user: null, // 1. Global state holding the logged-in user object

  fetchBlogs: async () => {
    try {
      const anecdotes = await anecdoteService.getAll()
      set({ blogs: anecdotes.sort((a, b) => b.votes - a.votes) })
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

  voteBlog: async (id) => {
    const originalBlogs = get().blogs
    const blogToVote = originalBlogs.find(b => b.id === id)
    if (!blogToVote) return

    const updatedBlog = { ...blogToVote, votes: (blogToVote.votes || 0) + 1 }
    try {
      const savedBlog = await anecdoteService.update(id, updatedBlog)
      const updatedArray = originalBlogs.map(b => b.id !== id ? b : savedBlog)
      set({ blogs: updatedArray.sort((a, b) => b.votes - a.votes) })
    } catch (error) {
      console.error(error)
    }
  },

  // 2. ADD USER ACTIONS HERE
  setUser: (userObject) => {
    set({ user: userObject })
  },

  clearUser: () => {
    set({ user: null })
  }
}))

export default useBlogStore