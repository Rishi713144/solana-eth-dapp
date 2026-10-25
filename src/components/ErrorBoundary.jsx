import { Component } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Vela crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="glass w-full max-w-md rounded-3xl p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
              <ShieldAlert size={24} />
            </div>
            <h1 className="font-display text-2xl font-semibold text-white">Something went wrong</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Vela hit an unexpected error. Your encrypted vault remains stored on this device.
            </p>
            <Button className="mt-6 w-full" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Reload Vela
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
