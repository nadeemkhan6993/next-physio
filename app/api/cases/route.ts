import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { Case } from '@/app/lib/models/Case';
import { User } from '@/app/lib/models/User';
import { ApiResponse } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const cases = await Case.find()
      .populate('patientId', '-password')
      .populate('physiotherapistId', '-password')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: cases,
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch cases',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { patientId, issueDetails, city, canTravel, preferredPhysiotherapistId, preferredGender } = body;

    if (!patientId || !issueDetails || !city) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Patient ID, issue details, and city are required',
      }, { status: 400 });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid patient ID',
      }, { status: 400 });
    }

    const caseData: any = {
      patientId,
      issueDetails,
      city,
      canTravel: canTravel || false,
      status: 'open',
      comments: [],
    };

    if (preferredGender) {
      caseData.preferredGender = preferredGender;
    }

    // If preferred physiotherapist is selected, assign immediately
    if (preferredPhysiotherapistId) {
      const physio = await User.findById(preferredPhysiotherapistId);
      if (physio && physio.role === 'physiotherapist') {
        caseData.physiotherapistId = preferredPhysiotherapistId;
      }
    }

    const newCase = await Case.create(caseData);
    await newCase.populate('patientId physiotherapistId', '-password');

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: newCase,
      message: 'Case created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create case',
    }, { status: 500 });
  }
}
