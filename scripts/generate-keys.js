/**
 * Generate secure encryption keys for .env file
 * Run with: node scripts/generate-keys.js
 */

const crypto = require('crypto');

console.log('\n=== Encryption Keys Generator ===\n');
console.log('Copy these keys to your .env file:\n');
console.log('ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('hex'));
console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('\n⚠️  IMPORTANT: Keep these keys secret and never commit them to git!\n');
