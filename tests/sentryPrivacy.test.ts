import { describe, expect, it } from 'vitest';
import { scrubSentryEvent, scrubSentrySpan } from '../src/observability/sentryPrivacy';

describe('scrubSentryEvent', () => {
  it('keeps release and stack structure while removing content and identifiers', () => {
    const scrubbed = scrubSentryEvent({
      event_id: 'internal-event-id',
      message: 'Child typed a private sentence',
      release: '1.0.0',
      environment: 'production',
      request: { url: 'https://example.test/?childName=Milo' },
      user: { id: 'child-123', email: 'child@example.test' },
      breadcrumbs: [{ category: 'ui.click', message: 'typed private sentence' }],
      contexts: { browser: { name: 'Browser' } },
      tags: { childLevel: '7' },
      extra: { progress: { totalStars: 42 } },
      exception: {
        values: [
          {
            type: 'TypeError',
            value: 'Private child content in an exception',
            stacktrace: { frames: [{ filename: '/src/App.tsx', lineno: 10 }] },
          },
        ],
      },
    });

    expect(scrubbed).toEqual({
      event_id: 'internal-event-id',
      release: '1.0.0',
      environment: 'production',
      exception: {
        values: [
          {
            type: 'TypeError',
            stacktrace: { frames: [{ filename: '/src/App.tsx', lineno: 10 }] },
          },
        ],
      },
    });
  });

  it('does not invent an exception when the event has no exception', () => {
    expect(scrubSentryEvent({ release: '1.0.0', environment: 'preview' })).toEqual({
      release: '1.0.0',
      environment: 'preview',
    });
  });

  it('removes span names, attributes, and links that could contain page or child data', () => {
    expect(
      scrubSentrySpan({
        trace_id: 'trace-id',
        span_id: 'span-id',
        name: '/parent-dashboard?child=Milo',
        start_timestamp: 1,
        end_timestamp: 2,
        status: 'ok',
        is_segment: true,
        attributes: { 'http.url': 'https://example.test/?child=Milo' },
        links: [],
      }),
    ).toEqual({
      trace_id: 'trace-id',
      span_id: 'span-id',
      name: 'milo-phonics',
      start_timestamp: 1,
      end_timestamp: 2,
      status: 'ok',
      is_segment: true,
      attributes: {},
    });
  });
});
