// ============================================
// MIDDLEWARE/AUTH.TS - Gestione Autenticazione
// ============================================
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  username: string;
  role: 'admin' | 'buyer';
  societaId?: number;
  iat: number;  
  exp: number; 
}

export interface AuthRequest extends Request {  
  user?: JwtPayload;
}

// ============================================
// MIDDLEWARE 1: authenticateToken (OBBLIGATORIO)
// ============================================
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Token mancante' });
    return;  
  }
  
  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    
    if (err) {
      return res.status(403).json({ error: 'Token non valido' });
    }
    
    req.user = decoded as JwtPayload;
    next();
  });
};

// ============================================
// MIDDLEWARE 2: optionalAuth (OPZIONALE)
// ============================================
export const optionalAuth = (  
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return next();
  }
  
  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (!err) {
      req.user = decoded as JwtPayload;
    }
    next();
  });
};

// ============================================
// MIDDLEWARE 3: authorizeRole (RBAC)
// ============================================
export const authorizeRole = (...allowedRoles: string[]) => {  
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Autenticazione richiesta' });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Accesso negato',
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
      return;
    }
    next();
  };
};

// ============================================
// HELPER: censuraDati (Utility)
// ============================================
interface Societa {  
  id: number;
  regione: string;
  codice_ateco: string;
  settore: string;
  descrizione: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export const censuraDati = (societa: Societa[]): Societa[] => {  
  return societa.map(s => ({
    id: s.id,
    regione: s.regione,
    codice_ateco: s.codice_ateco,
    settore: s.settore,
    descrizione: s.descrizione || 'Nessuna descrizione disponibile',
    
    // Metadati
    _censored: true,
    _message: 'Login per vedere dati completi (nome, fatturato, EBITDA)'
  }));
};


