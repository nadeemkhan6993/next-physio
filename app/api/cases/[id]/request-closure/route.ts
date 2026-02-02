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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
    }

    const caseData = await Case.findById(id);
    if (!caseData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Case not found',
      }, { status: 404 });
    }

    if (caseData.status !== 'open') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Case is not open',
      }, { status: 400 });
    }

    caseData.status = 'pending_closure';
    caseData.closureRequestedBy = userId as any;
    caseData.closureRequestTimestamp = new Date();
    await caseData.save();
    await caseData.populate('patientId physiotherapistId', '-password');

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: caseData,
      message: 'Closure requested successfully',
    });
  } catch (error) {
    console.error('Error requesting closure:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to request closure',
    }, { status: 500 });
  }
}
