import { db } from '@db';
import { users, organizations } from '@db/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import type { User, Organization } from '@db/schema';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function createTestUser(overrides: Partial<User> = {}): Promise<User> {
  const timestamp = Date.now();
  const email = `test-${timestamp}@example.com`;
  const username = `user-${timestamp}`;
  const displayName = `Test User ${timestamp}`;

  const [user] = await db.insert(users).values({
    username,
    email,
    displayName,
    password: await hashPassword('password123'),
    presenceStatus: true,
    ...overrides
  }).returning();

  return user;
}

export async function createTestOrganization(overrides: Partial<Organization> = {}): Promise<Organization> {
  const timestamp = Date.now();
  const name = `test-org-${timestamp}`;

  const [organization] = await db.insert(organizations).values({
    name,
    description: `Test Organization ${timestamp}`,
    ...overrides
  }).returning();

  return organization;
}

export function generateRandomEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}