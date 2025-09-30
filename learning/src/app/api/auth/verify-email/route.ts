import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      return NextResponse.json(
        { error: 'Missing token or email' },
        { status: 400 }
      );
    }
    
    // Verify the token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken || verificationToken.expires < new Date() || verificationToken.identifier !== email) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }
    
    // Find and update the user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
    
    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token },
    });
    
    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
