import { createClerkProxyRequest } from '../src/server/clerkProxy';

interface RuntimeProcess {
  env: Record<string, string | undefined>;
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

const getForwardedHeaders = (request: Request): Record<string, string> => {
  const headers: Record<string, string> = {};

  request.headers.forEach((value, name) => {
    if (!HOP_BY_HOP_HEADERS.has(name)) {
      headers[name] = value;
    }
  });

  return headers;
};

const proxyRequest = async (request: Request): Promise<Response> => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return new Response('Clerk proxy is not configured', { status: 500 });
  }

  const { path, query } = getClerkPath(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const proxyUrl = `${forwardedProto}://${forwardedHost ?? 'milo-phonics.vercel.app'}${CLERK_PROXY_PATH}`;
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();

  const upstreamResponse = await fetch(
    createClerkProxyRequest({
      frontendApiOrigin: FRONTEND_API_ORIGIN,
      path,
      query,
      method: request.method,
      headers: getForwardedHeaders(request),
      body,
      proxyUrl,
      secretKey,
    }),
  );

  const responseHeaders = new Headers(upstreamResponse.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
};

const handler = async (request: Request): Promise<Response> => {
  try {
    return await proxyRequest(request);
  } catch (error) {
    console.error('Clerk proxy request failed', error instanceof Error ? error.message : 'unknown error');
    return new Response('Clerk proxy request failed', { status: 502 });
  }
};

export default { fetch: handler };
