import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // <-- Import React Query
import App from './App.jsx'
import { NotificationContextProvider } from './NotificationContext'

const queryClient = new QueryClient() // <-- Create a client instance

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <NotificationContextProvider>
        <App />
      </NotificationContextProvider>
    </Router>
  </QueryClientProvider>
)