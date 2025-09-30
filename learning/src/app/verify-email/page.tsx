'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`, {
          method: 'POST',
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now sign in to your account.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. The link may have expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleResendVerification = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow-lg rounded-lg px-8 py-6">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Email Verification
          </h1>

          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <>
              <Alert type="success" className="mb-6">
                {message}
              </Alert>
              <Button onClick={handleGoToLogin} className="w-full">
                Sign In to Your Account
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert type="error" className="mb-6">
                {message}
              </Alert>
              <div className="space-y-3">
                <Button onClick={handleGoToLogin} className="w-full">
                  Go to Sign In
                </Button>
                <Button variant="outline" onClick={handleResendVerification} className="w-full">
                  Request New Verification
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
