// src/components/Notification.jsx
import { useNotificationValue } from '../NotificationContext'

const Notification = () => {
  const notification = useNotificationValue()

  if (!notification) return null

  // Styles based on your screenshot:
  // Light green background, dark green text, checkmark icon
  const style = {
    backgroundColor: '#e8f5e9', // Light green
    color: '#2e7d32',           // Darker green text
    padding: '15px',
    border: '1px solid #c8e6c9',
    borderRadius: '4px',
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500'
  }

  return (
    <div style={style}>
      <span style={{ marginRight: '10px' }}>✓</span> 
      {notification}
    </div>
  )
}

export default Notification