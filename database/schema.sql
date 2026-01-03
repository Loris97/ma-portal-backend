-- ============================================
-- M&A PORTAL - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS ma_portal 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ma_portal;

-- ============================================
-- TABELLA SOCIETÀ
-- ============================================
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS societa;

CREATE TABLE societa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Dati identificativi
  nome VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nome società',
  
  -- Dati finanziari (sensibili)
  fatturato DECIMAL(15, 2) NOT NULL COMMENT 'Fatturato annuale in euro',
  ebitda DECIMAL(15, 2) NOT NULL COMMENT 'EBITDA annuale in euro',
  
  -- Dati pubblici
  regione VARCHAR(50) NOT NULL COMMENT 'Regione sede legale',
  codice_ateco VARCHAR(10) NOT NULL COMMENT 'Codice ATECO attività',
  settore VARCHAR(100) NOT NULL COMMENT 'Settore merceologico',
  descrizione TEXT COMMENT 'Descrizione attività aziendale',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indici per performance
  INDEX idx_regione (regione),
  INDEX idx_settore (settore),
  INDEX idx_codice_ateco (codice_ateco)
) ENGINE=InnoDB;

-- ============================================
-- TABELLA UTENTI
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'Bcrypt hash',
  role ENUM('admin', 'buyer') NOT NULL,
  societa_id INT DEFAULT NULL COMMENT 'ID società per buyer (NULL per admin)',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (societa_id) REFERENCES societa(id) ON DELETE SET NULL,
  INDEX idx_username (username)
) ENGINE=InnoDB;

-- ============================================
-- DATI DI ESEMPIO
-- ============================================

-- Inserisci società
INSERT INTO societa (nome, fatturato, ebitda, regione, codice_ateco, settore, descrizione) VALUES
('TechCorp SRL', 5000000.00, 800000.00, 'Lombardia', '62.01.00', 'Software', 'Sviluppo software gestionale per PMI e grandi aziende. Leader nel settore ERP con oltre 200 clienti attivi.'),
('RetailPlus SpA', 3000000.00, 500000.00, 'Veneto', '47.19.00', 'Retail', 'Catena retail abbigliamento con 15 punti vendita nel nord-est Italia. Focus su sostenibilità e moda etica.'),
('GreenEnergy SRL', 8000000.00, 1200000.00, 'Emilia-Romagna', '35.11.00', 'Energia', 'Produzione energia da fonti rinnovabili: fotovoltaico (12 impianti) e eolico (3 parchi). Portfolio 50MW.'),
('FoodItaly SpA', 12000000.00, 2000000.00, 'Toscana', '10.89.00', 'Alimentare', 'Produzione e distribuzione prodotti alimentari biologici. Certificazioni: Bio, HACCP, IFS. Export 40%.');

-- ============================================
-- UTENTI CON HASH BCRYPT VERI
-- ============================================
-- Gli hash sono stati generati con bcrypt.hash(password, 10)
-- IMPORTANTE: Non modificare questi hash, sono corretti per le password specificate

-- Admin (username: admin, password: admin123)
INSERT INTO users (username, password, role, societa_id) VALUES
('admin', '$2b$10$XcGAgS.OXqq5AgJOrgMDruQMHrHPdMDbOJAaBRgFftlkDJyYG/2Pq', 'admin', NULL);

-- Buyer 1 - TechCorp (username: buyer1, password: buyer1)
INSERT INTO users (username, password, role, societa_id) VALUES
('buyer1', '$2b$10$qj7bfTcQ0W8MViL93P0ilOfwfAk0WcxNEr0crle2bMgmENakWfRJO', 'buyer', 1);

-- Buyer 2 - RetailPlus (username: buyer2, password: buyer2)
INSERT INTO users (username, password, role, societa_id) VALUES
('buyer2', '$2b$10$lniHzXXi3ygxZVCQWugnj.jr4e.ZMEnP13cls3/LCHaNYSwS3xGTC', 'buyer', 2);

-- ============================================
-- VERIFICA SETUP
-- ============================================
SELECT 'Database setup completato!' AS status;
SELECT COUNT(*) AS numero_societa FROM societa;
SELECT COUNT(*) AS numero_utenti FROM users;
SELECT username, role FROM users;
