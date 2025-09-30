import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { resetPasswordSchema, hashPassword } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = resetPasswordSchema.parse(body);
    
    // Verify the reset token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: validatedData.token },
    });
    
    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token: validatedData.token },
    });
    
    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Password reset error:', error);
    
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
