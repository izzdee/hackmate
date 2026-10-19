import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

// Catches unexpected render errors so one broken page doesn't blank the whole app
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
        <AlertTriangle className="mb-2 text-red-500" size={28} />
        <p className="font-semibold text-red-800">Something went wrong on this page.</p>
        <p className="mt-1 text-sm text-red-600">{this.state.error.message}</p>
        <button className="btn-secondary btn-sm mt-4" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
}
