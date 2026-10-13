import * as Sentry from '@sentry/react';
import { createSentryRuntimeConfig, type SentryRuntimeEnvironment } from './sentryConfig';
import { getSentryConsent } from './sentryConsent';
import { scrubSentryEvent, scrubSentrySpan } from './sentryPrivacy';

let isSentryInitialized = false;

export function initializeSentry(
  environment: SentryRuntimeEnvironment = import.meta.env,
): void {
  if (isSentryInitialized) {
    return;
  }

  const config = createSentryRuntimeConfig(environment);

  if (!config) {
    return;
  }

  if (!getSentryConsent()) {
    return;
  }

  Sentry.init({
    ...config,
    maxBreadcrumbs: 0,
    beforeSend: (event) => (getSentryConsent() ? scrubSentryEvent(event) : null),
    beforeSendSpan: scrubSentrySpan,
    tracesSampler: () => (getSentryConsent() ? config.tracesSampleRate : false),
    integrations: [Sentry.browserTracingIntegration()],
  });
  isSentryInitialized = true;
}
