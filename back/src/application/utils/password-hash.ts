import { randomBytes, scrypt } from 'node:crypto';

const CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 };

function generateKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize('NFKC'),
      salt,
      CONFIG.dkLen,
      { N: CONFIG.N, r: CONFIG.r, p: CONFIG.p, maxmem: 128 * CONFIG.N * CONFIG.r * 2 },
      (err, key) => (err ? reject(err) : resolve(key))
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = await generateKey(password, salt);
  return `${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  if (!salt || !key) {
    throw new Error('Invalid password hash');
  }
  const targetKey = await generateKey(password, salt);
  return targetKey.toString('hex') === key;
}
