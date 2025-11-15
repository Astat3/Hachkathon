import bcrypt from "bcryptjs";
import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "./auth-config";

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Get the current server session
 * Wrapper around NextAuth's getServerSession with our auth options
 * @returns Session object or null if not authenticated
 */
export async function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}

/**
 * Check if user is authenticated on the server
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return !!session?.user;
}

/**
 * Get the current user from the session
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user || null;
}
