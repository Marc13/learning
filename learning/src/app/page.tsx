'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            Welcome! 🎉
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Your Next.js app with NextAuth.js authentication is ready.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="px-6 py-3 bg-green-100 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
            <span className="text-green-800 dark:text-green-200 font-medium">
              ✅ NextAuth.js Ready
            </span>
          </div>
          <div className="px-6 py-3 bg-blue-100 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              ✅ 4 Auth Providers
            </span>
          </div>
          <div className="px-6 py-3 bg-purple-100 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-700">
            <span className="text-purple-800 dark:text-purple-200 font-medium">
              ✅ Email Templates
            </span>
          </div>
        </div>

        {status === 'loading' && (
          <div className="mt-8">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-32 mx-auto rounded"></div>
          </div>
        )}

        {status === 'authenticated' && session && (
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome back, {session.user?.name || 'User'}!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You are successfully signed in with: {session.user?.email}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Authentication is working perfectly! 🎯
            </div>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Get Started
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sign in to explore the authentication features:
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <a href="/login">Sign In</a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/register">Create Account</a>
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Available providers:</p>
              <p>• GitHub OAuth • Google OAuth</p>
              <p>• Email/Password • Magic Link</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check out{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
              AUTHENTICATION_SETUP.md
            </code>
            {" "}for setup instructions
          </p>
        </div>
      </div>
    </div>
  );
}
