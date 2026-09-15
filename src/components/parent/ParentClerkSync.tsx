import React, { useEffect, useState } from 'react';
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react';
import { progressService } from '../../services/progressService';
import { ChildProgress } from '../../types/phonics';
import { Cloud, CheckCircle2, RefreshCw, LogIn } from 'lucide-react';

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export const isClerkEnabled = Boolean(
  CLERK_PUBLISHABLE_KEY &&
  CLERK_PUBLISHABLE_KEY.startsWith('pk_') &&
  CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder_key'
);

// Inner component that safely uses Clerk hooks only when ClerkProvider is active
const ClerkActiveSync: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      handleSyncToCloud();
    }
  }, [isLoaded, isSignedIn, user?.id]);

  const handleSyncToCloud = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const cloudData = (user.unsafeMetadata?.phonicsProgress as Partial<ChildProgress>) || undefined;
      progressService.syncWithClerk(cloudData);

      const exported = progressService.exportForClerk();
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          phonicsProgress: exported,
        },
      });
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Failed to sync progress with Clerk cloud:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-center gap-3">
        <RefreshCw className="w-5 h-5 text-sky-500 animate-spin" />
        <span className="text-xs font-bold text-sky-700">Connecting to Cloud Sync...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl border-2 border-sky-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-600" />
            <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider">Parent Cloud Backup</h4>
          </div>
          <span className="text-[10px] font-bold bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full">Clerk Auth</span>
        </div>
        <p className="text-xs text-sky-800 mb-3">
          Sign in to automatically save your child's stars, levels, and progress across all family devices (tablets, phones, web).
        </p>
        <SignInButton mode="modal">
          <button className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm squish-tap transition-all cursor-pointer">
            <LogIn className="w-4 h-4" />
            <span>Sign In with Clerk (Parent Account)</span>
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">Cloud Sync Active</h4>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="flex items-center justify-between text-xs text-emerald-800">
        <div>
          <p className="font-bold">{user.primaryEmailAddress?.emailAddress || user.fullName || 'Parent Account'}</p>
          <p className="text-[11px] text-emerald-600">
            {lastSyncTime ? `Last synced at ${lastSyncTime}` : 'Synced with Clerk cloud'}
          </p>
        </div>

        <button
          onClick={handleSyncToCloud}
          disabled={isSyncing}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm squish-tap disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    </div>
  );
};

// Fallback card when VITE_CLERK_PUBLISHABLE_KEY is not configured
const ClerkSetupNotice: React.FC = () => {
  return (
    <div className="p-4 bg-amber-50/80 rounded-2xl border-2 border-dashed border-amber-300">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
          <Cloud className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-amber-950">Parent Cloud Sync (Clerk)</h4>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">Local Mode</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            All stars and levels are currently saved securely in your browser's local storage.
          </p>
          <div className="pt-2">
            <p className="text-[11px] text-amber-700">
              💡 To enable cross-device cloud sync with Google/Apple login, add your Clerk key to <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">.env</code>:
            </p>
            <pre className="mt-1 p-2 bg-amber-100/70 rounded-lg text-[10px] font-mono text-amber-900 overflow-x-auto">
              VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ParentClerkSync: React.FC = () => {
  if (isClerkEnabled) {
    return <ClerkActiveSync />;
  }
  return <ClerkSetupNotice />;
};
