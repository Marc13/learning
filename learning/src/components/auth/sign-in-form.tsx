'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { loginSchema, type LoginFormData } from '@/lib/auth-utils';

export function SignInForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrors({});

    try {
      // Validate form data
      const validatedData = loginSchema.parse(formData);

      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // Refresh session and redirect
        await getSession();
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: Partial<LoginFormData> = {};
        err.errors.forEach((error: any) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof LoginFormData] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log(`Starting ${provider} OAuth sign-in`);
      
      const result = await signIn(provider, { 
        callbackUrl: window.location.origin,
        redirect: false
      });
      
      console.log('OAuth result:', result);
      
      if (result?.error) {
        console.error('OAuth error:', result.error);
        setError(`Failed to sign in with ${provider}: ${result.error}`);
        setIsLoading(false);
      } else if (result?.ok) {
        console.log('OAuth success, redirecting...');
        // Force redirect to home page
        window.location.replace('/');
      } else {
        // If redirect is true, NextAuth will handle the redirect
        console.log('OAuth redirect handled by NextAuth');
      }
    } catch (err) {
      console.error('OAuth exception:', err);
      setError('Failed to sign in with ' + provider);
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignIn = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required for magic link' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('email', {
        email: formData.email,
        redirect: false,
      });

      if (result?.error) {
        setError('Failed to send magic link');
      } else {
        setError('');
        // Show success message instead of error
        alert('Magic link sent! Check your email.');
      }
    } catch (err) {
      setError('Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Sign In
        </h2>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* OAuth Providers First */}
        <div className="space-y-3 mb-6">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            className="w-full flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </Button>

          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Magic Link Section */}
        <div className="mb-6">
          <Input
            label="Email for Magic Link"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
          />
          <Button
            variant="outline"
            onClick={handleMagicLinkSignIn}
            disabled={isLoading || !formData.email}
            className="w-full mt-2 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Magic Link
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with password</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            Sign In with Password
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
