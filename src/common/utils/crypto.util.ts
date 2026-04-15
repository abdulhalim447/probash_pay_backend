import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.PIN_ENCRYPTION_KEY || 'probash_pay_pin_secret_key_32chr!';
// Key must be exactly 32 bytes for aes-256-cbc
const KEY = crypto.createHash('sha256').update(SECRET_KEY).digest();

export function encryptPin(plainPin: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainPin, 'utf8'), cipher.final()]);
  // Store as iv:encryptedData (both hex)
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptPin(encryptedPin: string): string {
  try {
    const [ivHex, encryptedHex] = encryptedPin.split(':');
    if (!ivHex || !encryptedHex) return '*** (bcrypt hash)';
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    // পুরনো bcrypt hash হলে decrypt হবে না — ইন্ডিকেট করে দেবে
    return '*** (পুরনো bcrypt hash — রিসেট করুন)';
  }
}

export function isBcryptHash(value: string): boolean {
  return value.startsWith('$2b$') || value.startsWith('$2a$');
}
