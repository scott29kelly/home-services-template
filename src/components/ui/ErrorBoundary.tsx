import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-navy mb-3">Something went wrong</h2>
          <p className="text-text-secondary mb-6">
            We hit an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-safety-orange to-orange-500 text-white font-semibold rounded-full shadow-lg hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
}
