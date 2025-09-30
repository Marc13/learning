# NextAuth.js Authentication Setup

This project includes a complete authentication system with NextAuth.js supporting multiple providers.

## Features

- ✅ GitHub OAuth
- ✅ Google OAuth  
- ✅ Email/Password (Credentials provider)
- ✅ Email magic link (Email provider with Resend)
- ✅ User registration with email verification
- ✅ Password reset flow
- ✅ Secure password hashing with bcrypt
- ✅ Form validation with Zod
- ✅ Responsive UI components
- ✅ TypeScript support

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend Email Service
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

## Setup Instructions

### 1. GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to your `.env.local`

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set Authorized redirect URIs to: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local`

### 3. Resend Email Setup

1. Sign up at [Resend](https://resend.com/)
2. Create an API key
3. Add your domain and verify it
4. Copy API key to your `.env.local`

### 4. Database Setup

The Prisma schema is already configured with all necessary models. Run:

```bash
npx prisma migrate dev
npx prisma generate
```

## Authentication Routes

- `/login` - Sign in page with all providers
- `/register` - User registration
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form (from email link)
- `/verify-email` - Email verification (from email link)

## API Routes

- `/api/auth/[...nextauth]` - NextAuth.js API routes
- `/api/auth/register` - User registration
- `/api/auth/forgot-password` - Password reset request
- `/api/auth/reset-password` - Password reset
- `/api/auth/verify-email` - Email verification

## Usage

### Protecting Pages

```tsx
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) redirect('/login');

  return <div>Protected content</div>;
}
```

### Server-side Protection

```tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ServerProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return <div>Protected content</div>;
}
```

### Using the User Navigation Component

The `UserNav` component is already included in the layout and will show:
- Sign In/Sign Up buttons for unauthenticated users
- User info and Sign Out button for authenticated users

## Password Requirements

- Minimum 8 characters
- Must contain at least one letter
- Must contain at least one number

## Email Templates

The system includes responsive email templates for:
- Email verification
- Password reset
- Magic link sign-in
- Welcome email (optional)

## Security Features

- Passwords are hashed with bcrypt (12 salt rounds)
- Secure token generation for email verification and password reset
- CSRF protection via NextAuth.js
- Session management with JWT
- Input validation with Zod schemas
- SQL injection protection via Prisma

## Customization

### Styling
All components use Tailwind CSS and can be easily customized by modifying the classes in the component files.

### Email Templates
Email templates are in `/src/lib/email.ts` and can be customized with your branding.

### Validation Schemas
Form validation schemas are in `/src/lib/auth-utils.ts` and can be modified to match your requirements.

## Troubleshooting

### Common Issues

1. **OAuth callback errors**: Make sure your callback URLs are correctly configured in the provider settings
2. **Email not sending**: Check your Resend API key and domain verification
3. **Database connection**: Ensure your DATABASE_URL is correct and the database is accessible
4. **NEXTAUTH_SECRET**: Generate a secure secret for production: `openssl rand -base64 32`

### Development Tips

- Use `npm run dev` to start the development server
- Check the browser console and server logs for detailed error messages
- Test email flows in development by checking your email provider's logs
