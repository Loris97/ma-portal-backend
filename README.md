# M&A Portal - Backend API

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

Backend REST API per piattaforma gestione acquisizioni aziendali (M&A Portal).

## 🚀 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL 8.0
- **Authentication:** JWT (Access + Refresh Token)
- **Security:** Bcrypt password hashing

## ✨ Features

- ✅ Autenticazione JWT con refresh token
- ✅ Role-Based Access Control (RBAC)
  - **Admin:** Gestione completa società
  - **Buyer:** Visualizzazione società assegnate
  - **Public:** Dati limitati (regione, settore, ATECO)
- ✅ CRUD completo società con validazioni
- ✅ API RESTful con standard HTTP
- ✅ Error handling strutturato
- ✅ Input validation e sanitization

## 📁 Struttura Progetto
```
ma-portal-backend/
│
├── src/
│ ├── config/
│ │ └── database.ts # Configurazione MySQL
│ │
│ ├── middleware/
│ │ └── auth.ts # JWT authentication & RBAC
│ │
│ ├── routes/
│ │ ├── auth.ts # Login/refresh routes
│ │ └── societa.ts # CRUD società
│ │
│ ├── utils/
│ │ ├── jwt.ts # Token generation/validation
│ │ └── validators.ts # Input validation functions
│ │
│ └── server.ts # Entry point
│
├── database/
│ └── schema.sql # Database schema & seed data
│
├── .env.example # Template variabili ambiente
├── .gitignore # File da ignorare
├── package.json # Dipendenze
├── tsconfig.json # Configurazione TypeScript
└── README.md # Questo file
```

## 🔧 Setup Locale

### Prerequisiti

- Node.js 18+
- MySQL 8.0
- npm o yarn

### Installazione

# 1. Clona repository
git clone https://github.com/TUO_USERNAME/ma-portal-backend.git
cd ma-portal-backend

# 2. Installa dipendenze
npm install

# 3. Configura database
mysql -u root -p < database/schema.sql

# 4. Configura environment
cp .env.example .env
# Modifica .env con le tue credenziali

# 5. Compila TypeScript
npm run build

# 6. Avvia server
npm run dev
⚙️ File .env
Crea un file .env nella root del progetto:


# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ma_portal

# JWT Secrets
JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
📚 API Endpoints
Authentication
POST   /api/auth/login       # Login utente
POST   /api/auth/refresh     # Refresh access token
Esempio Login:

bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
Risposta:

json
{
  "success": true,
  "message": "Login effettuato con successo",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "societaId": null
  }
}
Società (CRUD)
GET    /api/societa          # Lista società (RBAC)
GET    /api/societa/:id      # Dettaglio società (RBAC)
POST   /api/societa          # Crea società (Admin only)
PATCH  /api/societa/:id      # Aggiorna società (Admin only)
DELETE /api/societa/:id      # Elimina società (Admin only)
Esempio GET con autenticazione:


curl http://localhost:3000/api/societa \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
🔐 RBAC (Role-Based Access Control)
Ruolo	Lista Società	Dettaglio	Create	Update	Delete
Public	✅ Dati limitati	✅ Dati limitati	❌	❌	❌
Buyer	✅ Solo propria	✅ Solo propria completa	❌	❌	❌
Admin	✅ Tutte complete	✅ Tutte complete	✅	✅	✅
Dati Visibili per Ruolo
Public (non autenticato):

id, regione, codice_ateco, settore, descrizione

Buyer:

Propria società: tutti i campi

Altre società: come Public

Admin:

Tutte le società: tutti i campi

📊 Database Schema
```
**Tabella societa**
Campo	Tipo	Descrizione
id	INT (PK)	ID univoco
nome	VARCHAR(100)	Nome società (UNIQUE)
fatturato	DECIMAL(15,2)	Fatturato annuale
ebitda	DECIMAL(15,2)	EBITDA annuale
regione	VARCHAR(50)	Regione sede legale
codice_ateco	VARCHAR(10)	Codice ATECO attività
settore	VARCHAR(100)	Settore merceologico
descrizione	TEXT	Descrizione attività
created_at	TIMESTAMP	Data creazione
updated_at	TIMESTAMP	Data ultimo aggiornamento
**Tabella users**
Campo	Tipo	Descrizione
id	INT (PK)	ID univoco
username	VARCHAR(50)	Username (UNIQUE)
password	VARCHAR(255)	Password hash (bcrypt)
role	ENUM	Ruolo: admin/buyer
societa_id	INT (FK)	ID società (solo buyer)
created_at	TIMESTAMP	Data creazione
```
🔐 Sicurezza
✅ Password hashing con bcrypt (cost factor 10)

✅ JWT con expiry time configurabili

✅ Refresh token rotation

✅ Prepared statements (SQL injection prevention)

✅ Input validation su tutte le route

✅ Environment variables per secrets

✅ CORS configurato per production

🧪 Test
Utenti di Test
Admin:
  username: admin
  password: admin123

Buyer 1 (società TechCorp):
  username: buyer1
  password: buyer1

Buyer 2 (società RetailPlus):
  username: buyer2
  password: buyer2

🚀 Scripts NPM
bash
npm run dev          # Avvia in modalità development (nodemon)
npm run build        # Compila TypeScript
npm start            # Avvia versione production
npm run lint         # Esegue linting (se configurato)
🚀 Deploy
Coming soon: Deploy su Render.com

📝 TODO
 Implementare refresh token rotation

 Aggiungere rate limiting

 Aggiungere logging strutturato

 Aggiungere test unitari (Jest)

 Aggiungere API documentation (Swagger)

 Implementare paginazione su lista società

📄 License
MIT License - see LICENSE file

👤 Author
**Loris97**

GitHub: [@Loris97](https://github.com/Loris97)

LinkedIn: [Loris Scola](https://it.linkedin.com/in/loris-scola-dev)

**Note:** Questo è un progetto portfolio. Per uso in produzione, implementare ulteriori misure di sicurezza (rate limiting, HTTPS, CORS restrittivo, refresh token storage, audit logging).
