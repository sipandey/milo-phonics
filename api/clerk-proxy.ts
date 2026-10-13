import { createClerkProxyRequest } from '../src/server/clerkProxy.js';

interface RuntimeProcess {
  env: Record<string, string | undefined>;
}

interface ProxyRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

interface ProxyResponse {
  statusCode: number;
  setHeader(name: string, value: string | string[]): void;
  end(body?: string | Uint8Array): void;
}

declare const process: RuntimeProcess;

const FRONTEND_API_ORIGIN = 'https://frontend-api.clerk.dev';
const CLERK_PROXY_PATH = '/__clerk';
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'host',
  'keep-alive',
  'transfer-encoding',
]);

const getClerkPath = (requestUrl: string): { path: string; query: string } => {
  const url = new URL(requestUrl, 'https://milo-phonics.vercel.app');
  const proxyIndex = url.pathname.indexOf(CLERK_PROXY_PATH);
  const path = proxyIndex >= 0 ? url.pathname.slice(proxyIndex + CLERK_PROXY_PATH.length) || '/' : url.searchParams.get('path') || '/';
  const queryParams = new URLSearchParams(url.searchParams);
  queryParams.delete('path');
  const query = queryParams.toString();
  return { path, query: query ? `?${query}` : '' };
};

const getHeader = (headers: ProxyRequest['headers'], name: string): string | undefined => {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  return undefined;
};

const getForwardedHeaders = (request: ProxyRequest): Record<string, string> => {
  const headers: Record<string, string> = {};

  for (const [name, value] of Object.entries(request.headers)) {
    const headerValue = typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : undefined;
    if (headerValue !== undefined && !HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
      headers[name] = headerValue;
    }
  }

  const forwardedFor = getHeader(request.headers, 'x-forwarded-for');
  const forwardedHost = getHeader(request.headers, 'x-forwarded-host') ?? getHeader(request.headers, 'host');
  const forwardedProto = getHeader(request.headers, 'x-forwarded-proto') ?? 'https';

  if (forwardedFor) headers['X-Forwarded-For'] = forwardedFor;
  if (forwardedHost) headers['X-Forwarded-Host'] = forwardedHost;
  headers['X-Forwarded-Proto'] = forwardedProto;

  return headers;
};

const readBody = (request: ProxyRequest): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: string[] = [];

    request.on('data', (...args: unknown[]) => {
      const chunk = args[0];
      if (typeof chunk === 'string') {
        chunks.push(chunk);
      } else if (chunk instanceof Uint8Array) {
        chunks.push(new TextDecoder().decode(chunk));
      }
    });
    request.on('end', () => resolve(chunks.join('')));
    request.on('error', (...args: unknown[]) => {
      const error = args[0];
      reject(error instanceof Error ? error : new Error('Unable to read Clerk proxy request'));
    });
  });

const proxyRequest = async (request: ProxyRequest, response: ProxyResponse): Promise<void> => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    response.statusCode = 500;
    response.end('Clerk proxy is not configured');
    return;
  }

  const { path, query } = getClerkPath(request.url ?? '/');
  const method = (request.method ?? 'GET').toUpperCase();
  const forwardedHost = getHeader(request.headers, 'x-forwarded-host') ?? getHeader(request.headers, 'host');
  const forwardedProto = getHeader(request.headers, 'x-forwarded-proto') ?? 'https';
  const proxyUrl = `${forwardedProto}://${forwardedHost ?? 'milo-phonics.vercel.app'}${CLERK_PROXY_PATH}`;
  const body = method === 'GET' || method === 'HEAD' ? undefined : await readBody(request);

  const upstreamResponse = await fetch(
    createClerkProxyRequest({
      frontendApiOrigin: FRONTEND_API_ORIGIN,
      path,
      query,
      method,
      headers: getForwardedHeaders(request),
      body,
      proxyUrl,
      secretKey,
    }),
  );

  const responseHeaders = upstreamResponse.headers as Headers & { getSetCookie?: () => string[] };
  responseHeaders.forEach((value, name) => {
    if (!HOP_BY_HOP_HEADERS.has(name) && name !== 'set-cookie') {
      response.setHeader(name, value);
    }
  });

  const setCookieHeaders = responseHeaders.getSetCookie?.();
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    response.setHeader('set-cookie', setCookieHeaders);
  }

  response.statusCode = upstreamResponse.status;
  response.end(new Uint8Array(await upstreamResponse.arrayBuffer()));
};

const handler = async (request: ProxyRequest, response: ProxyResponse): Promise<void> => {
  try {
    await proxyRequest(request, response);
  } catch (error) {
    console.error('Clerk proxy request failed', error instanceof Error ? error.message : 'unknown error');
    response.statusCode = 502;
    response.end('Clerk proxy request failed');
  }
};

export default handler;
