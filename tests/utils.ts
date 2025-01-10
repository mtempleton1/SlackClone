import { db } from '@db';
import { users } from '@db/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import type { User } from '@db/schema';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function createTestUser(overrides: Partial<User> = {}): Promise<User> {
  const [user] = await db.insert(users).values({
    email: `test-${Date.now()}@example.com`,
    displayName: 'Test User',
    password: await hashPassword('password123'),
    presenceStatus: true,
    ...overrides
  }).returning();
  
  return user;
}

export function generateRandomEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}
