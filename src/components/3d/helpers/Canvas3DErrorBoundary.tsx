import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import i18next from 'i18next';

interface Props {
  children: React.ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
  retryKey: number;
  errorCount: number;
  gaveUp: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

export class Canvas3DErrorBoundary extends React.Component<Props, State> {
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryKey: 0, errorCount: 0, gaveUp: false };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[Canvas3DErrorBoundary] Caught error:', error.message);
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (this.state.hasError && !prevState.hasError) {
      const nextCount = this.state.errorCount + 1;

      if (nextCount >= MAX_RETRIES) {
        this.setState({ errorCount: nextCount, gaveUp: true });
        return;
      }

      this.setState({ errorCount: nextCount });
      this.resetTimer = setTimeout(() => {
        this.setState(s => ({
          hasError: false,
          retryKey: s.retryKey + 1,
        }));
      }, RETRY_DELAY_MS);
    }
  }

  componentWillUnmount() {
    if (this.resetTimer) clearTimeout(this.resetTimer);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorCount: 0, gaveUp: false, retryKey: this.state.retryKey + 1 });
  };

  render() {
    if (this.state.gaveUp) {
      return (
        <div className={cn("w-full h-full flex flex-col items-center justify-center gap-4 bg-muted/30 rounded-lg p-6 text-center", this.props.className)}>
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-foreground">{i18next.t('ui.viewer3dFailedTitle')}</p>
          <ul className="text-xs text-muted-foreground space-y-1 text-left list-disc pl-4">
            <li>{i18next.t('ui.viewer3dEnableHw')}</li>
            <li>{i18next.t('ui.viewer3dUpdateDrivers')}</li>
            <li>{i18next.t('ui.viewer3dTryBrowser')}</li>
          </ul>
          <button
            onClick={this.handleRetry}
            className="mt-2 flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            {i18next.t('common.retry', 'Reîncearcă')}
          </button>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className={cn("w-full h-full flex items-center justify-center bg-muted/30 rounded-lg", this.props.className)}>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.retryKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
