import React from 'react';

interface AppErrorFallbackProps {
  onRestart: () => void;
}

/**
 * Child-safe screen shown when rendering fails. It never shows technical
 * details; the large button reloads the app from the last saved progress.
 */
export const AppErrorFallback: React.FC<AppErrorFallbackProps> = ({ onRestart }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-amber-50 p-6 text-center">
    <span className="text-8xl" aria-hidden="true">🦁</span>
    <p className="text-xl font-bold text-amber-900">Milo needs a little rest. Tap to start again.</p>
    <button
      type="button"
      onClick={onRestart}
      aria-label="Restart Milo"
      className="min-h-[88px] min-w-[88px] rounded-4xl bg-amber-400 px-10 text-5xl shadow-lg active:scale-95 transition-transform cursor-pointer"
    >
      🔄
    </button>
  </div>
);

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return <AppErrorFallback onRestart={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
