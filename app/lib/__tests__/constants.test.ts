/**
 * Unit tests for constants
 */
import { INDIAN_METRO_CITIES } from '../constants';

describe('Constants', () => {
  describe('INDIAN_METRO_CITIES', () => {
    it('should contain exactly 6 cities', () => {
      expect(INDIAN_METRO_CITIES).toHaveLength(6);
    });

    it('should contain expected metro cities', () => {
      expect(INDIAN_METRO_CITIES).toEqual([
        'Delhi',
        'Bangalore',
        'Kolkata',
        'Chennai',
        'Hyderabad',
        'Mumbai',
      ]);
    });

    it('should be a const array', () => {
      expect(Array.isArray(INDIAN_METRO_CITIES)).toBe(true);
    });

    it('should not contain duplicates', () => {
      const uniqueCities = new Set(INDIAN_METRO_CITIES);
      expect(uniqueCities.size).toBe(INDIAN_METRO_CITIES.length);
    });
  });
});
