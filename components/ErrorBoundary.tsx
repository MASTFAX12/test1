

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  // FIX: Removed 'public' access modifier. While valid TypeScript, it's not standard for React lifecycle methods and can cause issues with some tooling.
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  // FIX: Removed 'public' access modifier to align with standard React class component syntax. This resolves the type error on `this.props`.
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 font-sans" dir="ltr">
          <div className="w-full max-w-2xl p-8 text-center bg-white rounded-2xl shadow-2xl border-t-4 border-red-500">
            <svg className="w-20 h-20 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-800">Oops! Something went wrong.</h1>
            <p className="mt-2 text-lg text-slate-600">
              We're sorry for the inconvenience. An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reload Page
            </button>
            {this.state.error && (
              <details className="mt-6 p-4 text-left bg-slate-50 border border-slate-200 rounded-lg">
                <summary className="cursor-pointer font-medium text-slate-700">Error Details</summary>
                <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap break-all overflow-auto">
                  {this.state.error.toString()}
                  <br />
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
