import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { UnauthorizedError } from './errors';

export function validateAdminAuth(request: NextRequest): void {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    throw new UnauthorizedError('Missing Authorization header');
  }

  const [type, token] = authHeader.split(' ');
  
  if (type !== 'Bearer' || !token) {
    throw new UnauthorizedError('Invalid Authorization header format');
  }

  const adminApiKey = process.env.ADMIN_API_KEY;
  
  if (!adminApiKey) {
    console.warn('[Auth] ADMIN_API_KEY not configured');
    throw new UnauthorizedError('Admin authentication not configured');
  }

  // Use timing-safe comparison to prevent timing attacks
  // Pad to same length to prevent length-based timing leaks
  const tokenBuffer = Buffer.from(token.padEnd(256, '\0'));
  const keyBuffer = Buffer.from(adminApiKey.padEnd(256, '\0'));
  
  if (!timingSafeEqual(tokenBuffer, keyBuffer)) {
    throw new UnauthorizedError('Invalid API key');
  }
}
