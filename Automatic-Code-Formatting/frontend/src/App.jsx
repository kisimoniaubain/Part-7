import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Menu from './components/Menu'
import AnecdoteList from './components/AnecdoteList'
import CreateNew from './components/CreateNew'
import About from './components/About'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import PageNotFound from './components/PageNotFound'

const App = () => {
  return (
    <Router>
      <div>
        {/* The Blue Banner stays at the top of EVERY single page */}
        <div
          style={{
            backgroundColor: '#1976d2',
            padding: '20px',
            color: 'white',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Blog App</span>
        </div>

        <Routes>
          {/* Valid Routes: Menu, Component Content, and Footer are rendered together */}
          <Route
            path="/"
            element={
              <div>
                <Menu />
                <ErrorBoundary>
                  <AnecdoteList />
                </ErrorBoundary>
                <Footer />
              </div>
            }
          />
          <Route
            path="/create"
            element={
              <div>
                <Menu />
                <ErrorBoundary>
                  <CreateNew />
                </ErrorBoundary>
                <Footer />
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div>
                <Menu />
                <ErrorBoundary>
                  <About />
                </ErrorBoundary>
                <Footer />
              </div>
            }
          />

          {/* The Splat Route: Catches ANY invalid url, hiding the menu/footer completely */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App