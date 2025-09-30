import { SignInForm } from '@/components/auth/sign-in-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Welcome Back
        </h1>
        <SignInForm />
      </div>
    </div>
  );
}
