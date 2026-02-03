/**
 * Unit tests for Auth Store (Zustand)
 */
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../../store/useAuthStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with null user and not authenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set user and mark as authenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      _id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'patient' as const,
      age: 30,
      city: 'Mumbai',
      mobileNumber: '1234567890',
      gender: 'male' as const,
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout and clear user', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      _id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'patient' as const,
      age: 30,
      city: 'Mumbai',
      mobileNumber: '1234567890',
      gender: 'male' as const,
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should update user partially', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      _id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'patient' as const,
      age: 30,
      city: 'Mumbai',
      mobileNumber: '1234567890',
      gender: 'male' as const,
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    act(() => {
      result.current.updateUser({ name: 'Jane Doe', age: 25 });
    });

    expect(result.current.user?.name).toBe('Jane Doe');
    expect(result.current.user?.age).toBe(25);
    expect(result.current.user?.email).toBe('john@example.com'); // Unchanged
  });

  it('should handle physiotherapist user type', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockPhysio = {
      _id: '456',
      name: 'Dr. Smith',
      email: 'smith@example.com',
      role: 'physiotherapist' as const,
      dob: '1985-01-01',
      practicingSince: '2010',
      degrees: ['BPT', 'MPT'],
      specialities: ['Sports Injury'],
      citiesAvailable: ['Mumbai', 'Delhi'],
      clinicAddresses: ['123 Main St'],
      mobileNumber: '9876543210',
      gender: 'male' as const,
    };

    act(() => {
      result.current.setUser(mockPhysio);
    });

    expect(result.current.user).toEqual(mockPhysio);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle admin user type', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockAdmin = {
      _id: '789',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin' as const,
    };

    act(() => {
      result.current.setUser(mockAdmin);
    });

    expect(result.current.user).toEqual(mockAdmin);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle backward compatibility with id field', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      _id: '123',
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'patient' as const,
      age: 30,
      city: 'Mumbai',
      mobileNumber: '1234567890',
      gender: 'male' as const,
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user?.id).toBe('123');
    expect(result.current.user?._id).toBe('123');
  });
});
