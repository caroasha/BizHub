import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl mb-4">💥</span>
          <h2 className="text-xl font-semibold text-[var(--text)]">Something went wrong</h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })} className="mt-4 text-[var(--primary)] hover:underline">Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}