/**
 * Calculate years of work experience from practicing since date
 */
export function calculateWorkExperience(practicingSince: string): number {
  const startDate = new Date(practicingSince);
  const currentDate = new Date();
  
  const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
  const monthDiff = currentDate.getMonth() - startDate.getMonth();
  
  // If we haven't passed the anniversary month yet, subtract one year
  if (monthDiff < 0) {
    return yearsDiff - 1;
  }
  
  return yearsDiff;
}

/**
 * Get formatted work experience string
 */
export function getWorkExperienceText(practicingSince: string): string {
  const years = calculateWorkExperience(practicingSince);
  return years === 1 ? '1 year' : `${years} years`;
}
