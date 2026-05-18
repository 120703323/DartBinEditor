import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("ErrorBoundary caught:", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-full text-muted-foreground p-8">
            <div className="text-center">
              <p className="text-lg font-ui">出错了</p>
              <p className="text-sm mt-2 text-red-500">{this.state.error?.message}</p>
              <button
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                重试
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
