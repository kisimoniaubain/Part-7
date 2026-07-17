import { create } from 'zustand'

const useNotificationStore = create((set) => ({
  message: null,
  // Action to change the message string
  setNotification: (message) => set({ message }),
  // Action to clear the message entirely
  clearNotification: () => set({ message: null }),
  // Helper action to handle showing it temporarily
  showNotification: (message, seconds = 5) => {
    set({ message })
    setTimeout(() => {
      set({ message: null })
    }, seconds * 1000)
  },
}))

export default useNotificationStore