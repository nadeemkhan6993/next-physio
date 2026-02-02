import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { Case } from '@/app/lib/models/Case';
import { ApiResponse } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const citiesParam = searchParams.get('cities');
    
    if (!citiesParam) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cities parameter is required',
      }, { status: 400 });
    }

    const cities = citiesParam.split(',');
    const unmappedCases = await Case.find({
      physiotherapistId: null,
      city: { $in: cities },
      status: 'open'
    })
      .populate('patientId', '-password')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: unmappedCases,
    });
  } catch (error) {
    console.error('Error fetching unmapped cases:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch unmapped cases',
    }, { status: 500 });
  }
}
