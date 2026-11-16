import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { progressService } from '../../services/progressService';
import { ChildProgress } from '../../types/phonics';
import { Cloud, CheckCircle2, RefreshCw, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
export const CLERK_PROXY_URL =
  (import.meta.env.VITE_CLERK_PROXY_URL as string | undefined) ??
  (CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_') ? '/__clerk' : undefined);

export const isClerkEnabled = Boolean(
  CLERK_PUBLISHABLE_KEY &&
  (CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') || CLERK_PUBLISHABLE_KEY.startsWith('pk_live_')) &&
  CLERK_PUBLISHABLE_KEY.length > 20
);

// Inner component that safely uses Clerk hooks only when ClerkProvider is active
const ClerkActiveSync: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const lastSyncedSignatureRef = useRef<string | null>(null);
  const lastSyncedUserIdRef = useRef<string | null>(null);
  const isApplyingCloudDataRef = useRef(false);
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());

  const handleSyncToCloud = useCallback((mergeCloudData = false): Promise<void> => {
    if (!user) return Promise.resolve();
    if (lastSyncedUserIdRef.current !== user.id) {
      lastSyncedUserIdRef.current = user.id;
      lastSyncedSignatureRef.current = null;
    }
    const syncTask = async () => {
      setIsSyncing(true);
      try {
        if (mergeCloudData) {
          const cloudData = (user.unsafeMetadata?.phonicsProgress as Partial<ChildProgress>) || undefined;
          isApplyingCloudDataRef.current = true;
          try {
            progressService.syncWithClerk(cloudData);
          } finally {
            isApplyingCloudDataRef.current = false;
          }
        }

        const exported = progressService.exportForClerk();
        const { cloudSyncedAt: _cloudSyncedAt, ...stableProgress } = exported;
        const signature = JSON.stringify(stableProgress);
        if (signature !== lastSyncedSignatureRef.current) {
          await user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              phonicsProgress: exported,
            },
          });
          lastSyncedSignatureRef.current = signature;
        }
        setSyncError(null);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.warn('Failed to sync progress with Clerk cloud:', err);
        setSyncError('Progress could not be saved to your account. Check your connection and try again.');
      } finally {
        setIsSyncing(false);
      }
    };

    const queuedSync = syncQueueRef.current.then(syncTask, syncTask);
    syncQueueRef.current = queuedSync.catch(() => undefined);
    return queuedSync;
  }, [user]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = progressService.subscribe(() => {
      if (isApplyingCloudDataRef.current) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void handleSyncToCloud(false);
      }, 800);
    });

    void handleSyncToCloud(true);

    return () => {
      unsubscribe();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [isLoaded, isSignedIn, user?.id, handleSyncToCloud]);

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
          Create a parent account or sign in to back up your child's progress across devices.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <SignInButton mode="modal">
            <button type="button" className="min-h-12 px-3 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm squish-tap transition-all cursor-pointer">
              <LogIn className="w-4 h-4 shrink-0" />
              <span>Sign In</span>
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button type="button" className="min-h-12 px-3 py-2.5 bg-white hover:bg-sky-50 text-sky-900 border-2 border-sky-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm squish-tap transition-all cursor-pointer">
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Create Account</span>
            </button>
          </SignUpButton>
        </div>
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
          <p className={`text-[11px] ${syncError ? 'text-red-700' : 'text-emerald-600'}`} role={syncError ? 'alert' : undefined}>
            {syncError || (lastSyncTime ? `Last synced at ${lastSyncTime}` : 'Syncing your progress...')}
          </p>
        </div>

        <button
          onClick={() => void handleSyncToCloud(true)}
          disabled={isSyncing}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm squish-tap disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
      {syncError && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Use “Sync Now” to retry.</span>
        </div>
      )}
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
