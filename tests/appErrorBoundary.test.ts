import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppErrorBoundary, AppErrorFallback } from '../src/components/common/AppErrorBoundary';

describe('AppErrorBoundary', () => {
  it('switches to the fallback state when a child component throws', () => {
    expect(AppErrorBoundary.getDerivedStateFromError()).toEqual({ hasError: true });
  });

  it('renders its children when nothing has failed', () => {
    const markup = renderToStaticMarkup(
      createElement(AppErrorBoundary, null, createElement('p', null, 'Milo is ready')),
    );

    expect(markup).toContain('Milo is ready');
  });

  it('shows a large restart control without technical error details', () => {
    const markup = renderToStaticMarkup(createElement(AppErrorFallback, { onRestart: () => undefined }));

    expect(markup).toContain('aria-label="Restart Milo"');
    expect(markup).toContain('min-h-[88px]');
    expect(markup).not.toMatch(/error|stack|exception/i);
  });
});
