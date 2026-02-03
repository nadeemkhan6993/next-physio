/**
 * Application constants
 */

export const INDIAN_METRO_CITIES = [
  'Delhi',
  'Bangalore',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Mumbai',
] as const;

export type IndianMetroCity = typeof INDIAN_METRO_CITIES[number];
