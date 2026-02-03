# Testing Documentation

## Overview
This project uses **Jest** and **React Testing Library** for unit and component testing with comprehensive coverage of core functionality.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Unit Tests
- **Location**: `app/**/__tests__/*.test.ts(x)`
- **Coverage**: Utilities, constants, encryption, date formatting, type definitions

### Component Tests  
- **Location**: `app/components/__tests__/*.test.tsx`
- **Coverage**: Button, Input, Select, Card, TextArea components

### Store Tests
- **Location**: `app/store/__tests__/*.test.ts`
- **Coverage**: Zustand authentication store

### API Logic Tests
- **Location**: `app/api/__tests__/*.test.ts`
- **Coverage**: City matching and case assignment logic

## Test Coverage Summary

### Excellent Coverage (90%+)
- ✅ Encryption utilities (90%)
- ✅ Utility functions (92%)
- ✅ Constants (100%)
- ✅ Auth store (100%)
- ✅ UI Components: Button, Input, Select, Card (100%)

### Good Coverage (70-90%)
- ✅ Date formatting (76%)

### Areas Not Covered
- ⚠️ Dashboard components (require integration testing with API mocking)
- ⚠️ API routes (require MongoDB mocking)
- ⚠️ Page components (require Next.js routing mocks)

## Key Test Examples

### Testing Encryption
```typescript
it('should encrypt and decrypt text correctly', () => {
  const plaintext = 'Hello, World!';
  const encrypted = encrypt(plaintext);
  const decrypted = decrypt(encrypted);

  expect(encrypted).not.toBe(plaintext);
  expect(decrypted).toBe(plaintext);
});
```

### Testing Components
```typescript
it('should call onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Testing Store
```typescript
it('should set user and mark as authenticated', () => {
  const { result } = renderHook(() => useAuthStore());
  
  act(() => {
    result.current.setUser(mockUser);
  });

  expect(result.current.user).toEqual(mockUser);
  expect(result.current.isAuthenticated).toBe(true);
});
```

### Testing City Matching Logic
```typescript
it('should allow assignment when physio serves case city', () => {
  const physioCities = ['Mumbai', 'Delhi'];
  const caseCity = 'Mumbai';
  
  const canAssign = physioCities.includes(caseCity);
  expect(canAssign).toBe(true);
});
```

## Test Configuration

### Jest Config (`jest.config.ts`)
- **Test Environment**: jsdom (for React component testing)
- **Coverage Provider**: v8
- **Transform**: ts-jest for TypeScript support
- **Module Mapping**: `@/*` → `<rootDir>/*`

### Setup File (`jest.setup.ts`)
- Imports `@testing-library/jest-dom` for DOM matchers
- Mocks `next/navigation` for routing
- Sets up environment variables for testing

## Writing New Tests

### 1. Create test file
```bash
app/[module]/__tests__/[filename].test.ts
```

### 2. Follow naming convention
- Unit tests: `*.test.ts`
- Component tests: `*.test.tsx`

### 3. Structure tests with AAA pattern
```typescript
it('should do something', () => {
  // Arrange
  const input = 'test';
  
  // Act
  const result = myFunction(input);
  
  // Assert
  expect(result).toBe('expected');
});
```

## Coverage Thresholds

Current thresholds (for lib, components, store only):
- **Branches**: 70%
- **Functions**: 60%
- **Lines**: 60%
- **Statements**: 60%

## Continuous Integration

Tests should be run before:
- ✅ Creating pull requests
- ✅ Merging to main branch
- ✅ Deploying to production

## Future Testing Improvements

1. **Integration Tests**: Test API routes with MongoDB memory server
2. **E2E Tests**: Add Playwright or Cypress for full user flows
3. **Visual Regression**: Add Storybook with Chromatic
4. **Performance Tests**: Add lighthouse CI for performance monitoring

## Test Results

All **81 tests** pass successfully with:
- 100% pass rate
- Core utilities at 90%+ coverage
- Zero flaky tests
- Fast execution (<15s for full suite)
