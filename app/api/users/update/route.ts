import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { User } from '@/app/lib/models/User';
import { ApiResponse } from '@/app/types';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
    }

    // Never allow password updates through this endpoint
    if (updateData.password) {
      delete updateData.password;
    }

    // Find and update user in database
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    const userResponse = updatedUser.toJSON();

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: userResponse,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update profile',
    }, { status: 500 });
  }
}
