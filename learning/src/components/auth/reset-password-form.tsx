'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/auth-utils';

export function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    setFormData(prev => ({ ...prev, token }));
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ResetPasswordFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setErrors({});

    try {
      // Validate form data
      const validatedData = resetPasswordSchema.parse(formData);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.details) {
          // Handle validation errors
          const fieldErrors: Partial<ResetPasswordFormData> = {};
          data.details.errors?.forEach((error: any) => {
            if (error.path[0]) {
              fieldErrors[error.path[0] as keyof ResetPasswordFormData] = error.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setError(data.error || 'Failed to reset password');
        }
      } else {
        setSuccess(data.message);
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: Partial<ResetPasswordFormData> = {};
        err.errors.forEach((error: any) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof ResetPasswordFormData] = error.message;
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

  if (!formData.token && !error) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-8 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Set New Password
        </h2>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success" className="mb-4">
            {success}
            <p className="mt-2 text-sm">Redirecting to login page...</p>
          </Alert>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText="At least 8 characters with letters and numbers"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Reset Password
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
