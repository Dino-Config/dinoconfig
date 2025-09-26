import { Request } from 'express';
import jwt from 'jsonwebtoken';

export const cookieExtractor = (req: Request): string | null => {
  if (req?.cookies) {
    return req.cookies['access_token'] || null;
  }
  return null;
};

export const brandHeaderExtractor = (req: Request): string | null => {
  const idToken = req.cookies?.['id_token'];
  if (!idToken) return null;

  const decoded = decodeToken(idToken);
  if (!decoded || typeof decoded !== 'object') return null;

  return decoded['X-INTERNAL-COMPANY'] || null;
};

const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
};
