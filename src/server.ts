// ============================================
// SERVER.ts - Entry Point dell'Applicazione
// ============================================

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth"; 
import societaRoutes from "./routes/societa"; 

interface User {
  id: number;
  username: string;
  password: string;
  role: "admin" | "buyer"; 
  societaId?: number; 
}

interface Societa {
  id: number;
  nome: string;
  fatturato: number;
  ebitda: number;
}

// Load environment variables
dotenv.config(); 
const app = express();
// Middleware
app.use(express.json()); 
// API Routes
app.use("/api/auth", authRoutes); 
app.use("/api/societa", societaRoutes); 

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API M&A Portal - Server attivo",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route non trovata",
    path: req.originalUrl,
  });
});

// Start server
const PORT: number = parseInt(process.env.PORT || "3000"); 
const NODE_ENV: string = process.env.NODE_ENV || 'development';


app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
  console.log(`📦 Ambiente: ${NODE_ENV}`);
});
