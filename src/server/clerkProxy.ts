export interface ClerkProxyRequestOptions {
  frontendApiOrigin: string;
  path: string;
  query: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  proxyUrl: string;
  secretKey: string;
}

const methodsWithoutBodies = new Set(['GET', 'HEAD']);

export const createClerkProxyRequest = (options: ClerkProxyRequestOptions): Request => {
  const targetUrl = new URL(`${options.path}${options.query}`, options.frontendApiOrigin);
  const headers = new Headers(options.headers);

  headers.set('Clerk-Proxy-Url', options.proxyUrl);
  headers.set('Clerk-Secret-Key', options.secretKey);

  const requestInit: RequestInit = {
    method: options.method,
    headers,
    redirect: 'manual',
  };

  if (!methodsWithoutBodies.has(options.method) && options.body !== undefined) {
    requestInit.body = options.body;
  }

  return new Request(targetUrl, requestInit);
};
