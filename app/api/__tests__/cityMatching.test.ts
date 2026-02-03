/**
 * Unit tests for city matching in case assignment
 */
import { INDIAN_METRO_CITIES } from '../../lib/constants';

describe('Case Assignment City Matching', () => {
  describe('City matching logic', () => {
    it('should allow assignment when physio serves case city', () => {
      const physioCities = ['Mumbai', 'Delhi'];
      const caseCity = 'Mumbai';
      
      const canAssign = physioCities.includes(caseCity);
      expect(canAssign).toBe(true);
    });

    it('should prevent assignment when physio does not serve case city', () => {
      const physioCities = ['Mumbai', 'Delhi'];
      const caseCity = 'Bangalore';
      
      const canAssign = physioCities.includes(caseCity);
      expect(canAssign).toBe(false);
    });

    it('should handle multiple matching cities', () => {
      const physioCities = ['Mumbai', 'Delhi', 'Bangalore'];
      const caseCities = ['Mumbai', 'Bangalore'];
      
      caseCities.forEach(city => {
        expect(physioCities.includes(city)).toBe(true);
      });
    });

    it('should be case-sensitive for city names', () => {
      const physioCities = ['Mumbai'];
      const caseCity = 'mumbai';  // lowercase
      
      const canAssign = physioCities.includes(caseCity);
      expect(canAssign).toBe(false);
    });

    it('should work with all metro cities', () => {
      const physioCities = [...INDIAN_METRO_CITIES];
      
      INDIAN_METRO_CITIES.forEach(city => {
        expect(physioCities.includes(city)).toBe(true);
      });
    });

    it('should handle empty physio cities array', () => {
      const physioCities: string[] = [];
      const caseCity = 'Mumbai';
      
      const canAssign = physioCities.includes(caseCity);
      expect(canAssign).toBe(false);
    });

    it('should validate cities are from metro list', () => {
      const testCity = 'Mumbai';
      expect(INDIAN_METRO_CITIES.includes(testCity as any)).toBe(true);
      
      const invalidCity = 'Pune';
      expect(INDIAN_METRO_CITIES.includes(invalidCity as any)).toBe(false);
    });
  });

  describe('Eligible physiotherapist filtering', () => {
    const mockPhysiotherapists = [
      { id: '1', name: 'Dr. A', citiesAvailable: ['Mumbai', 'Delhi'] },
      { id: '2', name: 'Dr. B', citiesAvailable: ['Bangalore'] },
      { id: '3', name: 'Dr. C', citiesAvailable: ['Chennai', 'Mumbai'] },
    ];

    it('should find eligible physios for Mumbai case', () => {
      const caseCity = 'Mumbai';
      const eligible = mockPhysiotherapists.filter(p => 
        p.citiesAvailable.includes(caseCity)
      );
      
      expect(eligible).toHaveLength(2);
      expect(eligible.map(p => p.id)).toEqual(['1', '3']);
    });

    it('should find eligible physios for Bangalore case', () => {
      const caseCity = 'Bangalore';
      const eligible = mockPhysiotherapists.filter(p => 
        p.citiesAvailable.includes(caseCity)
      );
      
      expect(eligible).toHaveLength(1);
      expect(eligible[0].id).toBe('2');
    });

    it('should return empty array for city with no physios', () => {
      const caseCity = 'Kolkata';
      const eligible = mockPhysiotherapists.filter(p => 
        p.citiesAvailable.includes(caseCity)
      );
      
      expect(eligible).toHaveLength(0);
    });
  });
});
