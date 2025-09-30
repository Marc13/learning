import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { registerSchema, hashPassword, generateSecureToken } from '@/lib/auth-utils';
import { sendEmail, getVerificationEmailTemplate } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });
    
    // Generate verification token
    const token = generateSecureToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await prisma.verificationToken.create({
      data: {
        identifier: validatedData.email,
        token,
        expires,
      },
    });
    
    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${encodeURIComponent(validatedData.email)}`;
    
    await sendEmail({
      to: validatedData.email,
      subject: 'Verify your email address',
      html: getVerificationEmailTemplate(verificationUrl, validatedData.name),
    });
    
    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        userId: user.id 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
