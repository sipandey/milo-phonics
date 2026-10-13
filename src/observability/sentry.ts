import * as Sentry from '@sentry/react';
import { createSentryRuntimeConfig, type SentryRuntimeEnvironment } from './sentryConfig';

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

  Sentry.init({
    ...config,
    integrations: [Sentry.browserTracingIntegration()],
  });
  isSentryInitialized = true;
}
