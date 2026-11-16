import { describe, expect, it } from 'vitest';
import { getClerkAuthRoute } from '../src/components/parent/clerkAuthRoutes';

describe('getClerkAuthRoute', () => {
  it('recognizes the local Clerk sign-in route', () => {
    expect(getClerkAuthRoute('/sign-in')).toBe('sign-in');
  });

  it('recognizes the local Clerk sign-up route', () => {
    expect(getClerkAuthRoute('/sign-up')).toBe('sign-up');
  });

  it('normalizes a trailing slash without treating the home page as auth', () => {
    expect(getClerkAuthRoute('/sign-in/')).toBe('sign-in');
    expect(getClerkAuthRoute('/sign-up/')).toBe('sign-up');
    expect(getClerkAuthRoute('/')).toBeNull();
    expect(getClerkAuthRoute('/parent')).toBeNull();
  });
});
