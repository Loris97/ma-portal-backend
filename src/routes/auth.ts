// ============================================
// ROUTES/AUTH.TS
// ============================================

import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../config/database";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { generateToken, getTokenExpiration } from "../utils/jwt";

interface LoginRequest {
  username: string;
  password: string;
}

interface UserRow {
  id: number;
  username: string;
  password: string;
  role: "admin" | "buyer";
  societaId?: number;
}

const router = express.Router();

// ============================================
// POST /api/auth/login
// ============================================
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ 
        error: 'Username e password richiesti'
      });
      return;
    }
    const { username, password } = req.body as LoginRequest;
    
    if (!username || !password) {
      res.status(400).json({ 
        error: 'Username e password richiesti' 
      });
      return;
    }
    
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    ) as [UserRow[], any];

    if (rows.length === 0) {
      res.status(401).json({ error: 'Credenziali non valide' });
      return;
    }
    const user: UserRow = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Credenziali non valide' });
      return;
    }
    // @ts-ignore
    const token: string = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      expiresIn: getTokenExpiration(),
      tokenType: "Bearer",
    });
    
  } catch (error) {
    console.error("Errore login:", error);
    res.status(500).json({ error: "Errore server" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: "Logout effettuato. Cancella token lato client.",
  });
});

// GET /api/auth/me
router.get("/me", authenticateToken, (req: AuthRequest, res: Response): void => {
  res.json({
    user: {
      id: req.user?.id,
      username: req.user?.username,
      role: req.user?.role,
      societaId: req.user?.societaId,
    },
  });
});

// POST /api/auth/refresh
router.post(
  "/refresh",
  authenticateToken,
  (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Autenticazione richiesta' });
      return;
    }
    
    // @ts-ignore
    const newToken: string = generateToken(req.user);
    
    res.json({
      token: newToken,
      expiresIn: getTokenExpiration(),
    });
  }
);

export default router;
