import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';
import { isClerkEnabled, CLERK_PUBLISHABLE_KEY, CLERK_PROXY_URL } from './components/parent/ParentClerkSync';
import { initializeSentry } from './observability/sentry';

initializeSentry();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}

const rootElement = document.getElementById('root')!;

if (isClerkEnabled && CLERK_PUBLISHABLE_KEY) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} proxyUrl={CLERK_PROXY_URL}>
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
