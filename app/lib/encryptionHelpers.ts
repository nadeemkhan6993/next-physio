/**
 * Example: How to use encryption for specific fields in your API routes
 * 
 * This file shows practical examples of encrypting/decrypting sensitive data
 */

import { encrypt, decrypt } from './encryption';
import { Case } from './models/Case';
import { User } from './models/User';

/**
 * Example 1: Encrypt case issue details when creating a new case
 */
export async function createCaseWithEncryption(caseData: any) {
  // Encrypt sensitive medical information
  const encryptedData = {
    ...caseData,
    issueDetails: encrypt(caseData.issueDetails), // Encrypt medical details
  };
  
  const newCase = await Case.create(encryptedData);
  return newCase;
}

/**
 * Example 2: Decrypt case data when reading
 */
export async function getCaseWithDecryption(caseId: string) {
  const caseData = await Case.findById(caseId).populate('patientId physiotherapistId');
  
  if (caseData) {
    // Decrypt sensitive fields
    const decryptedCase = {
      ...caseData.toObject(),
      issueDetails: decrypt(caseData.issueDetails),
    };
    
    // Also decrypt comments if needed
    if (decryptedCase.comments) {
      decryptedCase.comments = decryptedCase.comments.map((comment: any) => ({
        ...comment,
        message: decrypt(comment.message),
      }));
    }
    
    return decryptedCase;
  }
  
  return null;
}

/**
 * Example 3: Encrypt user phone numbers (if you want extra security)
 */
export async function createUserWithEncryptedPhone(userData: any) {
  const encryptedData = {
    ...userData,
    mobileNumber: userData.mobileNumber ? encrypt(userData.mobileNumber) : undefined,
  };
  
  const newUser = await User.create(encryptedData);
  return newUser;
}

/**
 * Example 4: Decrypt user data when reading
 */
export async function getUserWithDecryption(userId: string) {
  const user = await User.findById(userId);
  
  if (user) {
    const decryptedUser = user.toJSON(); // Already removes password
    
    // Decrypt phone if it was encrypted
    if (decryptedUser.mobileNumber) {
      decryptedUser.mobileNumber = decrypt(decryptedUser.mobileNumber);
    }
    
    return decryptedUser;
  }
  
  return null;
}

/**
 * Example 5: Bulk encryption/decryption for arrays
 */
export function encryptArray(items: string[]): string[] {
  return items.map(item => encrypt(item));
}

export function decryptArray(items: string[]): string[] {
  return items.map(item => decrypt(item));
}

/**
 * Example 6: Encrypt only specific fields from an object
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const result = { ...obj };
  
  fieldsToEncrypt.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string) as any;
    }
  });
  
  return result;
}

/**
 * Example 7: Decrypt only specific fields from an object
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...obj };
  
  fieldsToDecrypt.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = decrypt(result[field] as string) as any;
    }
  });
  
  return result;
}

// Usage examples in comments:

/*
// In your API route for creating a case:
import { encryptFields } from '@/app/lib/encryptionHelpers';

const caseData = await request.json();
const encryptedData = encryptFields(caseData, ['issueDetails', 'comments']);
const newCase = await Case.create(encryptedData);


// In your API route for reading a case:
import { decryptFields } from '@/app/lib/encryptionHelpers';

const caseData = await Case.findById(id);
const decryptedData = decryptFields(caseData.toObject(), ['issueDetails']);
return NextResponse.json(decryptedData);


// For arrays (like clinic addresses):
import { encryptArray } from '@/app/lib/encryptionHelpers';

const userData = {
  ...formData,
  clinicAddresses: encryptArray(formData.clinicAddresses)
};
*/
