import { describe, expect, it } from 'vitest';
import { createServiceWorkerSource } from '../scripts/serviceWorker';

describe('service worker generator', () => {
  it('emits a versioned precache worker with navigation fallback', () => {
    const source = createServiceWorkerSource({
      cacheName: 'milo-precache-test',
      precacheUrls: ['/index.html', '/audio/sample.mp3'],
    });

    expect(source).toContain('const CACHE_NAME = "milo-precache-test";');
    expect(source).toContain('"/index.html"');
    expect(source).toContain('"/audio/sample.mp3"');
    expect(source).toContain("self.addEventListener('install'");
    expect(source).toContain("self.addEventListener('activate'");
    expect(source).toContain("self.addEventListener('fetch'");
    expect(source).toContain("caches.match('/index.html')");
  });
});
