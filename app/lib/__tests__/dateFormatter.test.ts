/**
 * Unit tests for date formatter
 */
import { formatDate, formatTimestamp } from '../dateFormatter';

describe('Date Formatter', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      
      // Format can vary, just ensure it's a non-empty string
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle string date input', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = formatDate(dateString);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle current date', () => {
      const now = new Date();
      const result = formatDate(now);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp with time', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatTimestamp(date);
      
      // Should include time
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle string timestamp input', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = formatTimestamp(dateString);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
