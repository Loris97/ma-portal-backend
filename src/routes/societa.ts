// ============================================
// ROUTES/SOCIETA.JS - CRUD Gestione Società
// ============================================
import express, { Request, Response } from "express";
import db from "../config/database";
import { ResultSetHeader } from 'mysql2';

import {
  authenticateToken,  // Verifica token JWT obbligatorio
  optionalAuth,       // Verifica token JWT opzionale (permette accesso anche senza)
  authorizeRole,      // Controlla ruolo utente (RBAC: admin/buyer)
  censuraDati,        // Nasconde dati sensibili per utenti non autenticati
  AuthRequest
} from "../middleware/auth";

import {
  validateBodyExists,
  validateSocietaCreate,
  validateSocietaUpdate,
  validateId
} from "../utils/validators";

interface Societa {
  id: number;
  nome: string;
  fatturato: number;
  ebitda: number;
  regione: string;
  codice_ateco: string;
  settore: string;
  descrizione: string | null;
  created_at?: Date;
  updated_at?: Date;
}
const router = express.Router(); 

// ============================================
// GET /api/societa/:id - Dettaglio Singola Società
// ============================================
// AUTENTICAZIONE: Obbligatoria (authenticateToken)
// AUTORIZZAZIONE: Admin vede tutto | Buyer vede solo la sua
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      res.status(400).json({ error: idValidation.error });
      return;
    }
    const numId: number = parseInt(id);
    const [rows] = await db.query(
      'SELECT * FROM societa WHERE id = ?',
      [numId]
    ) as [Societa[], any];

    if (rows.length === 0) {
      res.status(404).json({ error: 'Società non trovata' });
      return;
    }

    const azienda: Societa = rows[0];

    // CASO 1: Admin → Dati completi
    if (req.user?.role === 'admin') {
      res.json({
        message: 'Vista Admin',
        data: azienda
      });
      return;
    }

    // CASO 2: Buyer → Solo sua società con dati completi
    if (req.user?.role === 'buyer') {
      if (azienda.id === req.user.societaId) {
        res.json({
          message: 'Vista Buyer - Tua società',
          data: azienda
        });
        return;
      }

      // Buyer cerca società altrui → Dati censurati
      res.json({
        message: 'Dati pubblici censurati',
        data: censuraDati([azienda])[0]
      });
      return;
    }

    // CASO 3: Utente NON autenticato → Dati censurati
    res.json({
      message: 'Dati pubblici censurati (login per dettagli completi)',
      data: censuraDati([azienda])[0]
    });

  } catch (error) {
    console.error('Errore database:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

// ============================================
// GET /api/societa - Lista Tutte le Società
// ============================================
// AUTENTICAZIONE: Opzionale (funziona anche senza token)
// COMPORTAMENTO:
// - Senza token → Dati censurati (fatturato/EBITDA nascosti)
// - Admin → Tutte le società con dati completi
// - Buyer → Solo la sua società
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query('SELECT * FROM societa') as [Societa[], any];
    // CASO A: Utente NON autenticato (req.user è undefined)
    if (!req.user) {
      res.json({
        message: 'Dati pubblici (login per dettagli completi)',
        data: censuraDati(rows)  // censuraDati() nasconde fatturato/EBITDA
      });
      return;
    }

    // CASO B: Admin autenticato
    if (req.user.role === 'admin') {
      res.json({
        message: 'Vista Admin - Tutti i dati',
        data: rows  // Tutti i dati completi
      });
      return;
    }

    // CASO C: Buyer autenticato
    if (req.user.role === 'buyer') {
      // filter() crea nuovo array con solo la società del buyer
      const miaSocieta = rows.filter(s => s.id === req.user?.societaId);
      res.json({
        message: 'Vista Buyer - Solo la tua società',
        data: miaSocieta
      });
      return;
    }

    // CASO D: Ruolo sconosciuto (non dovrebbe mai succedere)
    res.status(403).json({ error: 'Ruolo non riconosciuto' });

  } catch (error) {
    console.error('Errore database:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

// ============================================
// POST /api/societa - Crea Nuova Società
// ============================================
// AUTENTICAZIONE: Obbligatoria
// AUTORIZZAZIONE: Solo admin
router.post('/', authenticateToken, authorizeRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const bodyCheck = validateBodyExists(req.body);
    if (!bodyCheck.isValid) {
      res.status(400).json({ error: bodyCheck.error });
      return;
    }
    const validation = validateSocietaCreate(req.body);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }
    try {
      const { nome, fatturato, ebitda, regione, codice_ateco, settore, descrizione } = req.body;

      const [result] = await db.query(
        `INSERT INTO societa 
       (nome, fatturato, ebitda, regione, codice_ateco, settore, descrizione) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome, fatturato, ebitda, regione, codice_ateco, settore, descrizione || null]
      ) as [ResultSetHeader, any];

      res.status(201).json({
        success: true,
        message: 'Società creata con successo',
        data: {
          id: result.insertId,
          nome,
          fatturato,
          ebitda,
          regione,
          codice_ateco,
          settore,
          descrizione
        }
      });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: 'Nome già esistente' });
        return;
      }
      console.error('Errore database:', error);
      res.status(500).json({ error: 'Errore server' });
    }
  });
// ============================================
// PATCH /api/societa/:id - Modifica Parziale
// ============================================
// AUTENTICAZIONE: Obbligatoria
// AUTORIZZAZIONE: Solo admin
router.patch('/:id', authenticateToken, authorizeRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const bodyCheck = validateBodyExists(req.body);
    if (!bodyCheck.isValid) {
      res.status(400).json({ error: bodyCheck.error });
      return;
    }
    const validation = validateSocietaUpdate(req.body);
    if (!validation.isValid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const { id } = req.params;
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      res.status(400).json({ error: idValidation.error });
      return;
    }
    const numId = parseInt(id);
    const updates = req.body;
    try {
      // Query dinamica
      const setClauses: string[] = [];
      const values: (string | number)[] = [];

      if (updates.nome !== undefined) {
        setClauses.push('nome = ?');
        values.push(updates.nome.trim());
      }

      if (updates.fatturato !== undefined) {
        setClauses.push('fatturato = ?');
        values.push(updates.fatturato);
      }

      if (updates.ebitda !== undefined) {
        setClauses.push('ebitda = ?');
        values.push(updates.ebitda);
      } if (updates.regione !== undefined) {
        setClauses.push('regione = ?');
        values.push(updates.regione.trim());
      }

      if (updates.codice_ateco !== undefined) {
        setClauses.push('codice_ateco = ?');
        values.push(updates.codice_ateco.trim());
      }

      if (updates.settore !== undefined) {
        setClauses.push('settore = ?');
        values.push(updates.settore.trim());
      }

      if (updates.descrizione !== undefined) {
        setClauses.push('descrizione = ?');
        values.push(updates.descrizione ? updates.descrizione.trim() : null);
      }

      const sqlQuery = `UPDATE societa SET ${setClauses.join(', ')} WHERE id = ?`;
      values.push(numId);

      const [result] = await db.query(sqlQuery, values) as [ResultSetHeader, any];

      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Società non trovata' });
        return;
      }

      const [rows] = await db.query(
        'SELECT * FROM societa WHERE id = ?',
        [numId]
      ) as [Societa[], any];

      res.json({
        success: true,
        message: 'Società aggiornata con successo',
        data: rows[0]
      });
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: 'Nome società già esistente' });
        return;
      }
      console.error('Errore database:', error);
      res.status(500).json({ error: 'Errore server' });
    }
  });
// ============================================
// DELETE /api/societa/:id - Cancella Società
// ============================================
// AUTENTICAZIONE: Obbligatoria
// AUTORIZZAZIONE: Solo admin
router.delete('/:id', authenticateToken, authorizeRole('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {

    const { id } = req.params;
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      res.status(400).json({ error: idValidation.error });
      return;
    }
    const numId = parseInt(id);
    try {
      const [result] = await db.query(
        'DELETE FROM societa WHERE id = ?',
        [numId]
      ) as [ResultSetHeader, any];

      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Società non trovata' });
        return;
      }

      res.json({
        success: true,
        message: 'Società cancellata con successo',
        deletedId: numId
      });

    } catch (error) {
      console.error('Errore database:', error);
      res.status(500).json({ error: 'Errore server' });
    }
  });

export default router;

// ============================================
// RIEPILOGO ROUTE API COMPLETE:
// ============================================
// GET    /api/societa          - Lista società (RBAC: pubblico/admin/buyer)
// GET    /api/societa/:id      - Dettaglio singola (RBAC: admin/buyer proprietario)
// POST   /api/societa          - Crea nuova (solo admin)
// PATCH  /api/societa/:id      - Modifica parziale (solo admin)
// DELETE /api/societa/:id      - Cancella (solo admin)
