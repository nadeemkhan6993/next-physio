import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { User } from '@/app/lib/models/User';
import { ApiResponse, AuthResponse, SignupFormData } from '@/app/types';

const ADMIN_SECRET_CODE = 'ZBK897';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    const body: SignupFormData = await request.json();
    const { email, password, role, secretCode, name } = body;

    // Validate common fields
    if (!email || !password || !role || !name) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name, email, password, and role are required',
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User with this email already exists',
      }, { status: 409 });
    }

    // Validate admin secret code
    if (role === 'admin' && secretCode !== ADMIN_SECRET_CODE) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid admin secret code',
      }, { status: 403 });
    }

    // Create user data object
    let userData: any = {
      name,
      email: email.toLowerCase(),
      password,
      role,
    };

    // Role-specific validation and fields
    if (role === 'physiotherapist') {
      const {
        dob,
        practicingSince,
        degrees,
        specialities,
        citiesAvailable,
        clinicAddresses,
        mobileNumber,
        gender,
      } = body;

      if (
        !dob ||
        !practicingSince ||
        !degrees ||
        !specialities ||
        !citiesAvailable ||
        !clinicAddresses ||
        !mobileNumber ||
        !gender
      ) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'All physiotherapist fields are required',
        }, { status: 400 });
      }

      userData = {
        ...userData,
        dob,
        practicingSince,
        degrees,
        specialities,
        citiesAvailable,
        clinicAddresses,
        mobileNumber,
        gender,
      };
    } else if (role === 'patient') {
      const { age, city, mobileNumber, gender } = body;

      if (!age || !city || !mobileNumber || !gender) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'All patient fields are required',
        }, { status: 400 });
      }

      userData = {
        ...userData,
        age,
        city,
        mobileNumber,
        gender,
      };
    } else if (role === 'admin') {
      // Admins only need basic info
    } else {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid role',
      }, { status: 400 });
    }

    // Create user in database
    const newUser = await User.create(userData);

    // Return user without password
    const userResponse = newUser.toJSON();

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: {
        user: userResponse as any,
      },
      message: 'Signup successful',
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred during signup',
    }, { status: 500 });
  }
}
