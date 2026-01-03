// ============================================
// UTILS/JWT.TS
// ============================================

import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  username: string;
  role: 'admin' | 'buyer';
  societaId?: number;
}

export interface UserData {
  id: number;
  username: string;
  role: 'admin' | 'buyer';
  societaId?: number;
}
export const generateToken = (user: UserData): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET non configurato in .env');
  }
  
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    societaId: user.societaId
  };
  
  // @ts-ignore - TypeScript strict mode issue con process.env types
  const token = jwt.sign(payload, secret, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
  });
  
  return token;
};

export const getTokenExpiration = (): string => {
  return process.env.JWT_EXPIRES_IN || '24h';
};
