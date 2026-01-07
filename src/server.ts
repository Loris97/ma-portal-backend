// ============================================
// SERVER.ts - Entry Point dell'Applicazione
// ============================================

import express, { Request, Response } from "express";
import cors from "cors"; 
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth";
import societaRoutes from "./routes/societa";

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// ============================================
// API ROUTES
// ============================================

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

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler (ULTIMO!)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route non trovata",
    path: req.originalUrl,
  });
});


const PORT: number = parseInt(process.env.PORT || "3000");
const NODE_ENV: string = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
  console.log(`📦 Ambiente: ${NODE_ENV}`);
  console.log(`✅ CORS abilitato per: http://localhost:5173`);
});
