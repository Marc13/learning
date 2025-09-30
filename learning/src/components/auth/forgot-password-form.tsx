'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { resetRequestSchema, type ResetRequestFormData } from '@/lib/auth-utils';

export function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ResetRequestFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<Partial<ResetRequestFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ResetRequestFormData]) {
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
      const validatedData = resetRequestSchema.parse(formData);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
      } else {
        setSuccess(data.message);
        setFormData({ email: '' });
      }
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: Partial<ResetRequestFormData> = {};
        err.errors.forEach((error: any) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof ResetRequestFormData] = error.message;
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

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Reset Password
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success" className="mb-4">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email address"
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            Send Reset Link
          </Button>
        </form>

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
