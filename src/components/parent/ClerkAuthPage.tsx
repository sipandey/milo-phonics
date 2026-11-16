import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { ClerkAuthRoute } from './clerkAuthRoutes';

interface ClerkAuthPageProps {
  route: ClerkAuthRoute;
}

export const ClerkAuthPage: React.FC<ClerkAuthPageProps> = ({ route }) => (
  <main className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 p-4">
    {route === 'sign-in' ? (
      <SignIn routing="hash" signUpUrl="/sign-up" />
    ) : (
      <SignUp routing="hash" signInUrl="/sign-in" />
    )}
  </main>
);
