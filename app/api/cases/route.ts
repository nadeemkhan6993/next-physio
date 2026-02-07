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

    let warningMessage: string | undefined;

    // If preferred physiotherapist is selected, assign immediately
    if (preferredPhysiotherapistId) {
      const physio = await User.findById(preferredPhysiotherapistId);
      if (!physio || physio.role !== 'physiotherapist') {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Invalid physiotherapist ID',
        }, { status: 400 });
      }

      // Verify city matching - physiotherapist must serve the case city
      const physioCities = physio.citiesAvailable || [];
      if (!physioCities.includes(city)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `Selected physiotherapist does not serve ${city}. Please choose another therapist or let us auto-assign.`,
        }, { status: 400 });
      }

      caseData.physiotherapistId = preferredPhysiotherapistId;
      caseData.status = 'in_progress'; // Set status to in_progress when assigned
    } else {
      // Auto-assignment logic
      // Find all physiotherapists who serve this city
      const availablePhysios = await User.find({
        role: 'physiotherapist',
        citiesAvailable: city
      });

      if (availablePhysios.length > 0) {
        let selectedPhysio = null;

        // If gender preference specified, try to match
        if (preferredGender && preferredGender !== 'no-preference') {
          const genderMatchedPhysios = availablePhysios.filter(p => 
            p.gender && p.gender.toLowerCase() === preferredGender.toLowerCase()
          );

          if (genderMatchedPhysios.length > 0) {
            // Get case counts for gender-matched physiotherapists
            const physioCaseCounts = await Promise.all(
              genderMatchedPhysios.map(async (physio) => {
                const count = await Case.countDocuments({
                  physiotherapistId: physio._id,
                  status: { $in: ['open', 'in_progress', 'pending_closure'] }
                });
                return { physio, count };
              })
            );

            // Sort by case count (ascending) and pick the one with least cases
            physioCaseCounts.sort((a, b) => a.count - b.count);
            selectedPhysio = physioCaseCounts[0].physio;
          } else {
            // No gender match found - set warning
            warningMessage = `No ${preferredGender} physiotherapist available in ${city}. Please select a physiotherapist manually or remove gender preference.`;
          }
        } else {
          // No gender preference - assign based on workload
          const physioCaseCounts = await Promise.all(
            availablePhysios.map(async (physio) => {
              const count = await Case.countDocuments({
                physiotherapistId: physio._id,
                status: { $in: ['open', 'in_progress', 'pending_closure'] }
              });
              return { physio, count };
            })
          );

          // Sort by case count (ascending) and pick the one with least cases
          physioCaseCounts.sort((a, b) => a.count - b.count);
          selectedPhysio = physioCaseCounts[0].physio;
        }

        // Assign the selected physiotherapist if found
        if (selectedPhysio) {
          caseData.physiotherapistId = selectedPhysio._id;
          caseData.status = 'in_progress';
        }
      }
    }

    const newCase = await Case.create(caseData);
    await newCase.populate('patientId physiotherapistId', '-password');

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: newCase,
      message: 'Case created successfully',
      warning: warningMessage,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create case',
    }, { status: 500 });
  }
}
