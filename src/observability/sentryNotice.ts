export type SentryParentNoticeStatus = 'draft' | 'approved';

export interface SentryParentPrivacyNotice {
  readonly status: SentryParentNoticeStatus;
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export const SENTRY_PARENT_PRIVACY_NOTICE: SentryParentPrivacyNotice = {
  status: 'draft',
  title: 'Privacy notice for optional technical diagnostics',
  paragraphs: [
    'This draft is shown only in the parent area. Optional Technical Diagnostics are off by default and are not required to use Milo Phonics.',
    'If you enable them, minimized browser error and performance details leave this device for Sentry so the team can repair broken sessions. The intended payload is limited to release and environment details, browser technical information, and a sanitized error stack.',
    'The app does not intentionally send child progress, audio, free text, account identifiers, breadcrumbs, replay recordings, client logs, or application metrics through this diagnostic path.',
    'The current Sentry Developer plan retains error data for 30 days. Final retention, deletion, backup, subprocessor, and international-transfer wording is pending privacy review and must be approved before production use.',
    'You can revoke this choice at any time in the Parent Dashboard. When diagnostics are off, future reports and trace sampling stop, and the app continues to work without Sentry.',
    'Sentry may infer approximate geography from connection metadata even when IP addresses are redacted. This vendor-generated metadata remains under privacy review.',
    'The Sentry data-processing terms, privacy notice, and production privacy contact are not yet approved. Do not treat this draft as legal advice or as a completed production privacy notice.',
  ],
};
