export const SENTRY_CONSENT_STORAGE_KEY = 'milo_phonics_sentry_consent_v1';

export interface SentryConsentStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

let runtimeConsentOverride: boolean | undefined;

function getBrowserStorage(): SentryConsentStorage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function getSentryConsent(
  storage?: SentryConsentStorage,
): boolean {
  if (storage === undefined && runtimeConsentOverride !== undefined) {
    return runtimeConsentOverride;
  }

  const resolvedStorage = storage ?? getBrowserStorage();

  if (!resolvedStorage) {
    return false;
  }

  try {
    return resolvedStorage.getItem(SENTRY_CONSENT_STORAGE_KEY) === 'granted';
  } catch {
    return false;
  }
}

export function setSentryConsent(
  granted: boolean,
  storage?: SentryConsentStorage,
): boolean {
  const resolvedStorage = storage ?? getBrowserStorage();

  if (!resolvedStorage) {
    if (storage === undefined) runtimeConsentOverride = false;
    return false;
  }

  try {
    resolvedStorage.setItem(SENTRY_CONSENT_STORAGE_KEY, granted ? 'granted' : 'denied');
    if (storage === undefined) runtimeConsentOverride = granted;
    return true;
  } catch {
    // Private browsing and quota failures must fail closed without disrupting play.
    if (storage === undefined) runtimeConsentOverride = false;
    return false;
  }
}
