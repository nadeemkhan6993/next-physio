import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { Case } from '@/app/lib/models/Case';
import { User } from '@/app/lib/models/User';
import { ApiResponse, AdminStats } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const [totalPatients, totalPhysiotherapists, totalCases, activeCases, closedCases] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'physiotherapist' }),
      Case.countDocuments(),
      Case.countDocuments({ status: { $in: ['open', 'pending_closure'] } }),
      Case.countDocuments({ status: 'closed' }),
    ]);

    const stats: AdminStats = {
      totalPatients,
      totalPhysiotherapists,
      totalCases,
      activeCases,
      closedCases,
    };

    return NextResponse.json<ApiResponse<AdminStats>>({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch admin stats',
    }, { status: 500 });
  }
}
