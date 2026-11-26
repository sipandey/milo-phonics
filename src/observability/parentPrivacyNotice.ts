export type ParentPrivacyNoticeStatus = 'draft' | 'approved';

export interface ParentPrivacyNoticeSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface ParentPrivacyNotice {
  readonly status: ParentPrivacyNoticeStatus;
  readonly title: string;
  readonly contact: string;
  readonly sections: readonly ParentPrivacyNoticeSection[];
}

export const PARENT_PRIVACY_NOTICE: ParentPrivacyNotice = {
  status: 'draft',
  title: 'Milo Phonics privacy notice',
  contact: 'Privacy contact: not yet supplied — privacy-owner/legal review is required before publication.',
  sections: [
    {
      heading: 'Core play and browser storage',
      paragraphs: [
        'Milo Phonics can be used without an account. Core progress is kept in this browser using LocalStorage, including the current level, stars, explored letters and objects, tap counts, last-played position, and focus-mode setting.',
        'The current progress key is playful_phonics_progress_v2; an older playful_phonics_progress_v1 key may be read once for migration. Browser storage remains on this device unless a parent signs in to sync progress. Clearing site data or using Reset All Progress removes the local progress held by this app.',
      ],
    },
    {
      heading: 'Parent account and cloud backup',
      paragraphs: [
        'If a parent chooses to sign in, the optional Clerk integration may process parent account details such as an email address or name, authentication data, and the progress metadata that the parent chooses to sync across devices. The current implementation stores the exported progress in the Clerk user profile metadata and merges it back into this browser.',
        'The sign-in and sync path is parent-gated, but the arithmetic gate is a product access control and is not proof of age, parental responsibility, legal consent, or identity. Account deletion, export, retention, controller/processor roles, and international-transfer details still require privacy-owner and vendor review.',
      ],
    },
    {
      heading: 'Audio, fonts, and content services',
      paragraphs: [
        'The browser currently plays bundled audio files and uses browser audio APIs. The browser does not call OpenAI and does not use Cloudinary as an audio fallback. OpenAI and Cloudinary are development or publishing services referenced by the generation pipeline; their account, retention, access, and contract details remain under review.',
        'The page currently requests Fredoka and Nunito from Google Fonts using fonts.googleapis.com and fonts.gstatic.com. Those requests can transmit normal browser connection metadata to Google. Font version, licence, hosting location, retention, and whether the fonts should be self-hosted remain open review items.',
      ],
    },
    {
      heading: 'Error monitoring and analytics',
      paragraphs: [
        'No error-monitoring or analytics service is used. If the app fails to display, it shows a restart screen on this device and sends no error report.',
      ],
    },
    {
      heading: 'Hosting, support, payments, and retention',
      paragraphs: [
        'The app is hosted as a web application. Hosting providers may receive ordinary request, security, and operational log data. The exact provider retention, region, subprocessors, and deletion process must be recorded before this notice is approved.',
        'No payment or in-app purchase flow, support desk, advertising SDK, microphone, camera, or location feature is implemented in the reviewed application. If payments, support, or future analytics are added, their data, purpose, retention, international transfers, and parent controls must be added to this notice before enablement.',
      ],
    },
    {
      heading: 'Questions and deletion requests',
      paragraphs: [
        'For now, the privacy contact is not supplied. A real controller contact and an approved process for local deletion, account deletion, access, export, and complaints must be added before publication. This draft is not legal advice and is not a compliance certification.',
      ],
    },
  ],
};
