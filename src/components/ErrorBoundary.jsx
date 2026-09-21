import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  // Reset when children change (e.g. route change or key change)
  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '20px' }}>
          <h2>Something went wrong. Please try refreshing the page.</h2>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{ marginTop: 12, padding: '8px 16px', background: '#991b1b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          >
            Try Again
          </button>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: 12, fontSize: 12 }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
