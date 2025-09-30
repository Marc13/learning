'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { registerSchema, type RegisterFormData } from '@/lib/auth-utils';

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
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
      const validatedData = registerSchema.parse(formData);

      const response = await fetch('/api/auth/register', {
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
          const fieldErrors: Partial<RegisterFormData> = {};
          data.details.errors?.forEach((error: any) => {
            if (error.path[0]) {
              fieldErrors[error.path[0] as keyof RegisterFormData] = error.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setError(data.error || 'Registration failed');
        }
      } else {
        setSuccess(data.message);
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: Partial<RegisterFormData> = {};
        err.errors.forEach((error: any) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof RegisterFormData] = error.message;
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
          Create Account
        </h2>

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
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

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
            helperText="At least 8 characters with letters and numbers"
            required
          />

          <Input
            label="Confirm Password"
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
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
