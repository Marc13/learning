import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaClient } from '@/generated/prisma';
import { verifyPassword } from './auth-utils';
import { sendEmail, getMagicLinkEmailTemplate } from './email';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Email Magic Link Provider
    EmailProvider({
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const { host } = new URL(url);
        const user = await prisma.user.findUnique({
          where: { email },
          select: { name: true },
        });
        
        await sendEmail({
          to: email,
          subject: `Sign in to ${host}`,
          html: getMagicLinkEmailTemplate(url, user?.name || undefined),
        });
      },
    }),
    
    // Credentials Provider for Email/Password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await verifyPassword(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
  },
  
  pages: {
    signIn: '/login',
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      console.log('NextAuth session callback:', { 
        sessionUser: session.user?.email, 
        tokenId: token?.id,
        tokenSub: token?.sub 
      });
      
      if (token) {
        session.user.id = token.id as string || token.sub as string;
      }
      
      console.log('Final session:', { 
        userId: session.user?.id, 
        userEmail: session.user?.email 
      });
      
      return session;
    },
    
    async signIn({ user, account, profile }) {
      console.log('NextAuth signIn callback:', { 
        provider: account?.provider, 
        user: user?.email,
        account: account?.type 
      });
      
      // Allow OAuth sign-ins
      if (account?.provider === 'github' || account?.provider === 'google') {
        console.log(`Allowing ${account.provider} sign-in`);
        return true;
      }
      
      // Allow email magic link sign-ins
      if (account?.provider === 'email') {
        console.log('Allowing email sign-in');
        return true;
      }
      
      // Allow credentials sign-ins
      if (account?.provider === 'credentials') {
        console.log('Allowing credentials sign-in');
        return true;
      }
      
      console.log('Sign-in rejected for provider:', account?.provider);
      return false;
    },

    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect called:', { url, baseUrl });
      
      // Always redirect to home page after successful sign-in
      if (url === baseUrl || url === `${baseUrl}/` || url.includes('/api/auth/')) {
        console.log('Redirecting to home page');
        return baseUrl;
      }
      
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // If it's the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // Default to home page
      console.log('Default redirect to home');
      return baseUrl;
    },
  },
  
  events: {
    async createUser({ user }) {
      // Send welcome email when a new user is created
      if (user.email && user.name) {
        // You can uncomment this to send welcome emails
        // await sendEmail({
        //   to: user.email,
        //   subject: 'Welcome to our platform!',
        //   html: getWelcomeEmailTemplate(user.name),
        // });
      }
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
};
