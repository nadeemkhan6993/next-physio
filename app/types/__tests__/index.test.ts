/**
 * Unit tests for TypeScript type definitions
 */
import { User, Case, Admin, Physiotherapist, Patient } from '../../types';

describe('Type Definitions', () => {
  describe('User Types', () => {
    it('should define Admin type correctly', () => {
      const admin: Admin = {
        id: '1',
        _id: '1',
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'hashed',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(admin.role).toBe('admin');
    });

    it('should define Patient type correctly', () => {
      const patient: Patient = {
        id: '2',
        _id: '2',
        name: 'Patient User',
        email: 'patient@test.com',
        password: 'hashed',
        role: 'patient',
        age: 30,
        city: 'Mumbai',
        mobileNumber: '1234567890',
        gender: 'male',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(patient.role).toBe('patient');
      expect(patient.age).toBe(30);
      expect(patient.city).toBe('Mumbai');
    });

    it('should define Physiotherapist type correctly', () => {
      const physio: Physiotherapist = {
        id: '3',
        _id: '3',
        name: 'Dr. Physio',
        email: 'physio@test.com',
        password: 'hashed',
        role: 'physiotherapist',
        dob: '1980-01-01',
        practicingSince: '2005',
        degrees: ['BPT', 'MPT'],
        specialities: ['Sports'],
        citiesAvailable: ['Mumbai'],
        clinicAddresses: ['Address 1'],
        mobileNumber: '1234567890',
        gender: 'female',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(physio.role).toBe('physiotherapist');
      expect(physio.degrees).toHaveLength(2);
      expect(physio.citiesAvailable).toContain('Mumbai');
    });
  });

  describe('Case Type', () => {
    it('should define Case type with all required fields', () => {
      const caseData: Case = {
        id: '1',
        patientId: 'patient1',
        physiotherapistId: 'physio1',
        issueDetails: 'Back pain',
        city: 'Mumbai',
        canTravel: true,
        preferredGender: 'female',
        status: 'in_progress',
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(caseData.status).toBe('in_progress');
      expect(caseData.city).toBe('Mumbai');
      expect(caseData.canTravel).toBe(true);
    });

    it('should allow all valid status values', () => {
      const statuses: Case['status'][] = ['open', 'in_progress', 'pending_closure', 'closed'];
      
      statuses.forEach(status => {
        const caseData: Case = {
          id: '1',
          patientId: 'patient1',
          issueDetails: 'Issue',
          city: 'Mumbai',
          canTravel: false,
          status,
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        expect(caseData.status).toBe(status);
      });
    });

    it('should handle optional physiotherapistId', () => {
      const openCase: Case = {
        id: '1',
        patientId: 'patient1',
        issueDetails: 'Issue',
        city: 'Mumbai',
        canTravel: false,
        status: 'open',
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(openCase.physiotherapistId).toBeUndefined();
    });

    it('should handle case with comments', () => {
      const caseWithComments: Case = {
        id: '1',
        patientId: 'patient1',
        physiotherapistId: 'physio1',
        issueDetails: 'Issue',
        city: 'Mumbai',
        canTravel: false,
        status: 'in_progress',
        comments: [
          {
            id: 'comment1',
            userId: 'user1',
            userName: 'John',
            userRole: 'patient',
            message: 'Hello',
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(caseWithComments.comments).toHaveLength(1);
      expect(caseWithComments.comments[0].message).toBe('Hello');
    });
  });

  describe('API Response Types', () => {
    it('should handle successful API response', () => {
      type ApiResponse<T = any> = {
        success: boolean;
        data?: T;
        error?: string;
        message?: string;
      };

      const successResponse: ApiResponse<User> = {
        success: true,
        data: {
          id: '1',
          name: 'User',
          email: 'user@test.com',
          password: 'hashed',
          role: 'patient',
          age: 25,
          city: 'Mumbai',
          mobileNumber: '1234567890',
          gender: 'male',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        message: 'Success',
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBeDefined();
    });

    it('should handle error API response', () => {
      type ApiResponse = {
        success: boolean;
        data?: any;
        error?: string;
        message?: string;
      };

      const errorResponse: ApiResponse = {
        success: false,
        error: 'Something went wrong',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('Something went wrong');
    });
  });
});
