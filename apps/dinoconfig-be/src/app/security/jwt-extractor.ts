import { Request } from 'express';
import jwt from 'jsonwebtoken';

export const cookieExtractor = (req: Request): string | null => {
  if (req?.cookies) {
    return req.cookies['access_token'] || null;
  }
  return null;
};

export const brandHeaderExtractor = (req: Request): string | null => {
  let idToken = req.cookies?.['id_token'];

  if (!idToken && req.headers?.authorization?.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split(' ')[1];
  }

  const decoded = decodeToken(idToken);
  if (!decoded || typeof decoded !== 'object') return null;

  return decoded['X-INTERNAL-COMPANY'] || decoded['https://dinoconfig.com/company'] || null;
};

const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
};
