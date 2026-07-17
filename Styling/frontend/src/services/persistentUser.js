const STORAGE_KEY = 'loggedBlogAppUser'

export const getUser = () => {
  const loggedUserJSON = window.localStorage.getItem(STORAGE_KEY)
  return loggedUserJSON ? JSON.parse(loggedUserJSON) : null
}

export const saveUser = (user) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export const removeUser = () => {
  window.localStorage.removeItem(STORAGE_KEY)
}

// Export both individual functions and a default bundle for maximum compatibility
export default { getUser, saveUser, removeUser }