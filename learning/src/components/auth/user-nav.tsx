'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function UserNav() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex items-center space-x-4">
        <a
          href="/login"
          className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
        >
          Sign In
        </a>
        <a
          href="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Sign Up
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="h-8 w-8 rounded-full"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {session.user?.name || 'User'}
          </span>
          <span className="text-xs text-gray-500">
            {session.user?.email}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        loading={isLoading}
        disabled={isLoading}
      >
        Sign Out
      </Button>
    </div>
  );
}
