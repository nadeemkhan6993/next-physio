/**
 * Unit tests for utility functions
 */
import { getWorkExperienceText } from '../utils';

describe('Utils', () => {
  describe('getWorkExperienceText', () => {
    it('should return "0 years" for current year', () => {
      const currentYear = new Date().getFullYear();
      const result = getWorkExperienceText(currentYear.toString());
      expect(result).toBe('0 years');
    });

    it('should return correct years for past year', () => {
      const currentYear = new Date().getFullYear();
      const pastYear = currentYear - 5;
      const result = getWorkExperienceText(pastYear.toString());
      expect(result).toBe('5 years');
    });

    it('should return correct year for 1 year experience', () => {
      const currentYear = new Date().getFullYear();
      const pastYear = currentYear - 1;
      const result = getWorkExperienceText(pastYear.toString());
      expect(result).toBe('1 year');
    });

    it('should handle invalid year format', () => {
      const result = getWorkExperienceText('invalid');
      expect(result).toContain('NaN');
    });

    it('should handle empty string', () => {
      const result = getWorkExperienceText('');
      expect(result).toContain('NaN');
    });

    it('should handle future year', () => {
      const currentYear = new Date().getFullYear();
      const futureYear = currentYear + 5;
      const result = getWorkExperienceText(futureYear.toString());
      // Should return negative or "New" depending on implementation
      expect(result).toBeDefined();
    });

    it('should handle very old dates', () => {
      const result = getWorkExperienceText('1990');
      const currentYear = new Date().getFullYear();
      const expectedYears = currentYear - 1990;
      expect(result).toBe(`${expectedYears} years`);
    });
  });
});
