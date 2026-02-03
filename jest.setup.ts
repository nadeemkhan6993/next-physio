import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.MONGODB_URI = Buffer.from('mongodb://localhost:27017/test', 'utf-8').toString('base64');
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
}));
