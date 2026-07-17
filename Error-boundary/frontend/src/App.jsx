import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Menu from './components/Menu'
import AnecdoteList from './components/AnecdoteList'
import CreateNew from './components/CreateNew'
import About from './components/About'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'

const App = () => {
  return (
    <Router>
      <div>
        {/* Blue Banner */}
        <div style={{ backgroundColor: '#1976d2', padding: '20px', color: 'white', marginBottom: '20px' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Blog App</span>
        </div>
        
        {/* Navigation remains outside */}
        <Menu />
        
        {/* Wrap individual components so navigating resets the boundary state */}
        <Routes>
          <Route 
            path="/" 
            element={
              <ErrorBoundary>
                <AnecdoteList />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ErrorBoundary>
                <CreateNew />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/about" 
            element={
              <ErrorBoundary>
                <About />
              </ErrorBoundary>
            } 
          />
        </Routes>

        <Footer />
      </div>
    </Router>
  )
}

export default App