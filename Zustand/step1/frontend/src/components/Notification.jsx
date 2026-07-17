import React from 'react'
import useNotificationStore from '../stores/notificationStore'

const Notification = () => {
  // Read the message state directly from the Zustand store
  const message = useNotificationStore((state) => state.message)

  // If there is no message, render absolutely nothing
  if (!message) return null

  const style = {
    border: 'solid 2px #2e7d32',
    padding: '12px',
    marginBottom: '20px',
    borderRadius: '4px',
    backgroundColor: '#edf7ed',
    color: '#1e4620',
    fontWeight: '500',
  }

  return <div style={style}>{message}</div>
}

export default Notification