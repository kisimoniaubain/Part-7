import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px 0' }}>
          <h2>Something went wrong :(</h2>
          <p>Please make a bug report to mluukkai in Discord</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary