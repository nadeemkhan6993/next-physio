import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { User } from '@/app/lib/models/User';
import { ApiResponse } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    let query: any = { role: 'physiotherapist' };
    
    if (city) {
      query.citiesAvailable = city;
    }

    // Fetch physiotherapists from database
    const physiotherapists = await User.find(query).select('-password');

    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: physiotherapists,
    });
  } catch (error) {
    console.error('Error fetching physiotherapists:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch physiotherapists',
    }, { status: 500 });
  }
}
