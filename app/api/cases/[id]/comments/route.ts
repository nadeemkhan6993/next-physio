import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { Case } from '@/app/lib/models/Case';
import { User } from '@/app/lib/models/User';
import { ApiResponse } from '@/app/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { userId, message } = body;

    if (!message || !userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID and message are required',
      }, { status: 400 });
    }

    // Find case
    const caseData = await Case.findById(id);
    if (!caseData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Case not found',
      }, { status: 404 });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    const newComment = {
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      message,
      timestamp: new Date(),
    };

    caseData.comments.push(newComment as any);
    await caseData.save();
    await caseData.populate('patientId physiotherapistId', '-password');

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: caseData,
      message: 'Comment added successfully',
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to add comment',
    }, { status: 500 });
  }
}
