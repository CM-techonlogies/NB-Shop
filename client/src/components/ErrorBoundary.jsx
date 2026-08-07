import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">❌</span>
              <h1 className="text-xl font-bold text-red-600">Something went wrong</h1>
            </div>
            <div className="bg-red-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-mono text-red-700 break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <details className="mb-4">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">Stack trace</summary>
              <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-auto max-h-48">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
