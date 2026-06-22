import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('Please define TOKEN_ENCRYPTION_KEY or NEXTAUTH_SECRET in .env.local');
  }
  // Derive a 32-byte key from the secret using SHA-256.
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedToken {
  encrypted: string;
  iv: string;
  authTag: string;
}

export function encryptToken(token: string): EncryptedToken {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

export function decryptToken(payload: EncryptedToken): string {
  const key = getKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(payload.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.encrypted, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
