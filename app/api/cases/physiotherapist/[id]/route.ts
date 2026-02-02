import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { Case } from '@/app/lib/models/Case';
import { ApiResponse } from '@/app/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const cases = await Case.find({ physiotherapistId: id })
      .populate('patientId physiotherapistId', '-password')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: cases,
    });
  } catch (error) {
    console.error('Error fetching physiotherapist cases:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch physiotherapist cases',
    }, { status: 500 });
  }
}
