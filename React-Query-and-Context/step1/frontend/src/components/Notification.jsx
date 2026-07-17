import { useNotificationValue } from '../NotificationContext'

const Notification = () => {
  const notification = useNotificationValue()

  // If there's absolutely no notification data, don't show anything
  if (!notification) return null

  // Extract the text message safely whether it's a raw string or an object
  const message = typeof notification === 'object' ? notification.message : notification

  if (!message) return null

  const style = {
    border: 'solid 2px #4caf50',
    padding: '10px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    margin: '15px 20px',
    fontWeight: 'bold',
    borderRadius: '4px'
  }

  return (
    <div style={style}>
      {message}
    </div>
  )
}

export default Notification