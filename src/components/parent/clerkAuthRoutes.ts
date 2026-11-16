export type ClerkAuthRoute = 'sign-in' | 'sign-up';

export const getClerkAuthRoute = (pathname: string): ClerkAuthRoute | null => {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/sign-in') return 'sign-in';
  if (normalizedPath === '/sign-up') return 'sign-up';
  return null;
};
