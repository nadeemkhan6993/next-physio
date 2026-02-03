import { NextResponse } from 'next/server';
import { ApiResponse } from '@/app/types';
import { INDIAN_METRO_CITIES } from '@/app/lib/constants';

export async function GET() {
  try {
    // Return hardcoded cities from constants
    // This can be easily replaced with database query in future
    const cities = INDIAN_METRO_CITIES.map(city => ({
      value: city,
      label: city,
    }));

    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: cities,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch cities',
    }, { status: 500 });
  }
}
