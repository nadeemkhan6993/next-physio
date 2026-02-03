/**
 * Unit tests for encryption utilities
 */
import { encrypt, decrypt, hashPassword, comparePassword } from '../encryption';

describe('Encryption', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it('should return empty string for empty input', () => {
      expect(encrypt('')).toBe('');
      expect(decrypt('')).toBe('');
    });

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+{}[]|\\:;"<>?,./-=`~';
      const encrypted = encrypt(specialText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(specialText);
    });

    it('should handle unicode characters', () => {
      const unicodeText = '你好世界 🌍 مرحبا بالعالم';
      const encrypted = encrypt(unicodeText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(unicodeText);
    });

    it('should produce different encrypted values for same plaintext', () => {
      const plaintext = 'test';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      // Different IVs should produce different ciphertexts
      expect(encrypted1).not.toBe(encrypted2);
      // But both should decrypt to the same plaintext
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });

    it('should handle long text', () => {
      const longText = 'a'.repeat(10000);
      const encrypted = encrypt(longText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(longText);
    });
  });

  describe('hashPassword and comparePassword', () => {
    it('should hash password correctly', async () => {
      const password = 'myPassword123';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toHaveLength(60); // bcrypt hash length
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    });

    it('should verify correct password', async () => {
      const password = 'correctPassword';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'correctPassword';
      const hash = await hashPassword(password);
      const isValid = await comparePassword('wrongPassword', hash);

      expect(isValid).toBe(false);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Salts make hashes different
      expect(hash1).not.toBe(hash2);
      // But both should verify
      expect(await comparePassword(password, hash1)).toBe(true);
      expect(await comparePassword(password, hash2)).toBe(true);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hash = await hashPassword(password);
      const isValid = await comparePassword('', hash);

      expect(isValid).toBe(true);
    });
  });
});
