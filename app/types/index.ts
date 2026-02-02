// User Types
export type UserRole = 'admin' | 'physiotherapist' | 'patient';
export type Gender = 'male' | 'female' | 'other';

export interface BaseUser {
  id: string;
  _id?: string; // MongoDB _id for compatibility
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin extends BaseUser {
  role: 'admin';
}

export interface Physiotherapist extends BaseUser {
  role: 'physiotherapist';
  dob: string;
  practicingSince: string;
  degrees: string[];
  specialities: string[];
  citiesAvailable: string[];
  clinicAddresses: string[];
  mobileNumber: string;
  gender?: Gender;
}

export interface Patient extends BaseUser {
  role: 'patient';
  age: number;
  city: string;
  mobileNumber: string;
  gender: Gender;
}

export type User = Admin | Physiotherapist | Patient;

// Case/Therapy Types
export type CaseStatus = 'open' | 'pending_closure' | 'closed';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  timestamp: Date;
}

export interface Case {
  id: string;
  patientId: string;
  physiotherapistId?: string;
  issueDetails: string;
  city: string;
  canTravel: boolean;
  preferredPhysiotherapistId?: string;
  preferredGender?: Gender | 'no-preference';
  status: CaseStatus;
  comments: Comment[];
  closureRequestedBy?: string;
  closureRequestTimestamp?: Date;
  review?: {
    rating: number;
    comment: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Form Types
export interface SignupFormData {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  secretCode?: string; // Admin only
  // Physiotherapist fields
  dob?: string;
  practicingSince?: string;
  degrees?: string | string[]; // Can be comma-separated string or array
  specialities?: string | string[]; // Can be comma-separated string or array
  citiesAvailable?: string[];
  clinicAddresses?: string[];
  mobileNumber?: string;
  gender?: Gender;
  // Patient fields
  age?: number;
  city?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface CaseFormData {
  issueDetails: string;
  city: string;
  canTravel: boolean;
  preferredPhysiotherapistId?: string;
  preferredGender?: Gender | 'no-preference';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

// Dashboard Statistics
export interface AdminStats {
  totalPatients: number;
  totalPhysiotherapists: number;
  totalCases: number;
  activeCases: number;
  closedCases: number;
} 