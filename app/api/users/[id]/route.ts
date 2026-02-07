import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { User } from '@/app/lib/models/User';
import { ApiResponse } from '@/app/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Fetch user by ID, exclude password
    const user = await User.findById(id).select('-password');

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch user',
    }, { status: 500 });
  }
}
