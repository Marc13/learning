import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { resetRequestSchema, generateSecureToken } from '@/lib/auth-utils';
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = resetRequestSchema.parse(body);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      );
    }
    
    // Generate reset token
    const token = generateSecureToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Delete any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: validatedData.email },
    });
    
    // Create new reset token
    await prisma.verificationToken.create({
      data: {
        identifier: validatedData.email,
        token,
        expires,
      },
    });
    
    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(validatedData.email)}`;
    
    await sendEmail({
      to: validatedData.email,
      subject: 'Reset your password',
      html: getPasswordResetEmailTemplate(resetUrl, user.name || undefined),
    });
    
    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent a password reset link.' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Password reset request error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
