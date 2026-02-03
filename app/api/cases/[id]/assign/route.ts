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
    const { physiotherapistId } = body;

    if (!physiotherapistId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Physiotherapist ID is required',
      }, { status: 400 });
    }

    // Find and update case
    const caseData = await Case.findById(id);
    if (!caseData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Case not found',
      }, { status: 404 });
    }

    if (caseData.physiotherapistId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Case already assigned to a physiotherapist',
      }, { status: 400 });
    }

    // Verify physiotherapist exists
    const physio = await User.findById(physiotherapistId);
    if (!physio || physio.role !== 'physiotherapist') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid physiotherapist ID',
      }, { status: 400 });
    }

    // Verify city matching - physiotherapist must serve the case city
    const caseCity = caseData.city;
    const physioCities = physio.citiesAvailable || [];
    
    if (!physioCities.includes(caseCity)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Physiotherapist does not serve ${caseCity}. Available cities: ${physioCities.join(', ')}`,
      }, { status: 400 });
    }

    caseData.physiotherapistId = physiotherapistId as any;
    caseData.status = 'in_progress';
    await caseData.save();
    await caseData.populate('patientId physiotherapistId', '-password');

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: caseData,
      message: 'Case assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning case:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to assign case',
    }, { status: 500 });
  }
}
