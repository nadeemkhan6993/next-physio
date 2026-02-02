import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { User } from '@/app/lib/models/User';
import { ApiResponse, AuthResponse } from '@/app/types';
import bcryptjs from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 });
    }

    // Find user in database
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password',
      }, { status: 401 });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password',
      }, { status: 401 });
    }

    // Return user without password
    const userResponse = user.toJSON();

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: {
        user: userResponse as any,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred during login',
    }, { status: 500 });
  }
}
