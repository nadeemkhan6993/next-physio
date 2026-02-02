import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { Case } from '@/app/lib/models/Case';
import { ApiResponse } from '@/app/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { review } = body;

    if (!review || !review.rating || !review.comment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Review rating and comment are required',
      }, { status: 400 });
    }

    const caseData = await Case.findById(id);
    if (!caseData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Case not found',
      }, { status: 404 });
    }

    if (caseData.status !== 'pending_closure') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Case closure has not been requested',
      }, { status: 400 });
    }

    caseData.status = 'closed';
    caseData.review = review;
    await caseData.save();
    await caseData.populate('patientId physiotherapistId', '-password');

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: caseData,
      message: 'Case closed successfully',
    });
  } catch (error) {
    console.error('Error closing case:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to close case',
    }, { status: 500 });
  }
}
