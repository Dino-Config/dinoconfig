import { Request } from 'express';

export const cookieExtractor = (req: Request): string | null => {
  if (req?.cookies) {
    return req.cookies['access_token'] || null;
  }
  return null;
};
