import { describe, expect, it } from 'vitest';
import { createClerkProxyRequest } from '../src/server/clerkProxy';

describe('createClerkProxyRequest', () => {
  it('forwards the Clerk proxy headers and preserves the request query', () => {
    const request = createClerkProxyRequest({
      frontendApiOrigin: 'https://frontend-api.clerk.dev',
      path: '/v1/client',
      query: '?_clerk_js_version=5',
      method: 'GET',
      headers: {
        accept: 'application/json',
        'user-agent': 'test-agent',
      },
      proxyUrl: 'https://milo-phonics.vercel.app/__clerk',
      secretKey: 'sk_live_test-only',
    });

    expect(request.url).toBe('https://frontend-api.clerk.dev/v1/client?_clerk_js_version=5');
    expect(request.method).toBe('GET');
    expect(request.headers.get('accept')).toBe('application/json');
    expect(request.headers.get('user-agent')).toBe('test-agent');
    expect(request.headers.get('Clerk-Proxy-Url')).toBe('https://milo-phonics.vercel.app/__clerk');
    expect(request.headers.get('Clerk-Secret-Key')).toBe('sk_live_test-only');
  });

  it('forwards a request body for non-GET methods', async () => {
    const request = createClerkProxyRequest({
      frontendApiOrigin: 'https://frontend-api.clerk.dev',
      path: '/v1/client/sessions',
      query: '',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"action":"refresh"}',
      proxyUrl: 'https://milo-phonics.vercel.app/__clerk',
      secretKey: 'sk_live_test-only',
    });

    expect(await request.text()).toBe('{"action":"refresh"}');
  });
});
