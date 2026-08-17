import React from 'react';
import ReactDOM from 'react-dom/client';
import './betlens-api';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[BetLens Root Error Boundary]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-lg shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <span className="text-xl font-bold">⚠️</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Application Notice</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              BetLens encountered a temporary rendering state. Click below to refresh the workspace.
            </p>
            <pre className="bg-slate-950 p-3 rounded-xl text-[11px] text-rose-300 font-mono text-left overflow-x-auto max-h-32">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all"
            >
              Reset & Reload BetLens
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
