import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { User } from '@/app/lib/models/User';
import { ApiResponse } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch patients from database
    const patients = await User.find({ role: 'patient' }).select('-password');

    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: patients,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch patients',
    }, { status: 500 });
  }
}
