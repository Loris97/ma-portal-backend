# M&A Portal - Backend API

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)
![Express](https://img.shields.io/badge/express-%5E5.0.0-lightgrey)
![MySQL](https://img.shields.io/badge/mysql-8.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Backend REST API per piattaforma gestione acquisizioni aziendali (M&A Portal) con autenticazione JWT e controllo accessi basato sui ruoli.

> **🔗 Frontend Repository:** [ma-portal-frontend](https://github.com/Loris97/ma-portal-frontend)

## ✨ Features

- ✅ **Autenticazione JWT** con token management e refresh
- ✅ **Role-Based Access Control (RBAC)** - Admin, Buyer, Public
- ✅ **CRUD completo** società con validazioni business logic
- ✅ **Password hashing** con bcrypt (cost factor 10)
- ✅ **Prepared statements** per prevenzione SQL injection
- ✅ **Input validation** su tutte le route
- ✅ **Error handling** strutturato
- ✅ **TypeScript** con strict mode

## 🚀 Tech Stack

| Categoria | Tecnologie |
|-----------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 5 |
| **Language** | TypeScript 5 |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT (jsonwebtoken) |
| **Security** | Bcrypt password hashing |
| **Tools** | Git, npm, nodemon, ts-node |

## 📁 Struttura Progetto

```

ma-portal-backend/
├── src/
│   ├── config/
│   │   └── database.ts          \# MySQL connection pool
│   ├── middleware/
│   │   └── auth.ts               \# JWT auth \& RBAC middleware
│   ├── routes/
│   │   ├── auth.ts               \# Authentication routes
│   │   └── societa.ts            \# Società CRUD routes
│   ├── utils/
│   │   ├── jwt.ts                \# Token generation/validation
│   │   └── validators.ts         \# Input validation functions
│   └── server.ts                 \# Application entry point
├── database/
│   └── schema.sql                \# Database schema \& seed data
├── .env.example                  \# Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

```

## 🔧 Installazione

### Prerequisiti

- Node.js 18+
- MySQL 8.0
- npm o yarn

### Setup

```bash
# 1. Clona repository
git clone https://github.com/Loris97/ma-portal-backend.git
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

# 6. Avvia server development
npm run dev
```


## ⚙️ Configurazione

Crea file `.env` nella root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ma_portal

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=24h
```


## 📚 API Endpoints

### Authentication

| Method | Endpoint | Descrizione | Auth |
| :-- | :-- | :-- | :-- |
| POST | `/api/auth/login` | Login utente | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/me` | Info utente corrente | ✅ |
| POST | `/api/auth/refresh` | Rinnova token | ✅ |

### Società

| Method | Endpoint | Descrizione | Permessi |
| :-- | :-- | :-- | :-- |
| GET | `/api/societa` | Lista società | Public/Buyer/Admin |
| GET | `/api/societa/:id` | Dettaglio società | Public/Buyer/Admin |
| POST | `/api/societa` | Crea società | Admin only |
| PATCH | `/api/societa/:id` | Aggiorna società | Admin only |
| DELETE | `/api/societa/:id` | Elimina società | Admin only |

### Esempio Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Risposta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  },
  "expiresIn": "24h",
  "tokenType": "Bearer"
}
```


### Esempio Lista Società (con Auth)

```bash
curl http://localhost:3000/api/societa \
  -H "Authorization: Bearer YOUR_TOKEN"
```


## 🔐 RBAC (Role-Based Access Control)

| Ruolo | Lista Società | Dettaglio | Create | Update | Delete |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Public** | Dati limitati* | Dati limitati* | ❌ | ❌ | ❌ |
| **Buyer** | Solo propria società | Solo propria completa | ❌ | ❌ | ❌ |
| **Admin** | Tutte complete | Tutte complete | ✅ | ✅ | ✅ |

**\*Dati limitati Public:** `id`, `regione`, `codice_ateco`, `settore`, `descrizione`

## 📊 Database Schema

### Tabella `societa`

| Campo | Tipo | Descrizione |
| :-- | :-- | :-- |
| id | INT (PK) | ID univoco auto-increment |
| nome | VARCHAR(100) | Nome società (UNIQUE) |
| fatturato | DECIMAL(15,2) | Fatturato annuale (€) |
| ebitda | DECIMAL(15,2) | EBITDA annuale (€) |
| regione | VARCHAR(50) | Regione sede legale |
| codice_ateco | VARCHAR(10) | Codice ATECO (es: 62.01.00) |
| settore | VARCHAR(100) | Settore merceologico |
| descrizione | TEXT | Descrizione attività |
| created_at | TIMESTAMP | Data creazione |
| updated_at | TIMESTAMP | Ultimo aggiornamento |

### Tabella `users`

| Campo | Tipo | Descrizione |
| :-- | :-- | :-- |
| id | INT (PK) | ID univoco |
| username | VARCHAR(50) | Username (UNIQUE) |
| password | VARCHAR(255) | Password bcrypt hash |
| role | ENUM | 'admin' o 'buyer' |
| societa_id | INT (FK) | ID società (solo buyer) |
| created_at | TIMESTAMP | Data creazione |

## 🧪 Test

### Utenti Demo

```
Admin:
  username: admin
  password: admin123
  
Buyer 1 (TechCorp):
  username: buyer1
  password: buyer1
  
Buyer 2 (RetailPlus):
  username: buyer2
  password: buyer2
```


### Test Completo

```bash
# 1. Login come admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Salva token dalla risposta
TOKEN="eyJhbGc..."

# 3. Lista società (Admin vede tutte)
curl http://localhost:3000/api/societa \
  -H "Authorization: Bearer $TOKEN"

# 4. Crea società (solo Admin)
curl -X POST http://localhost:3000/api/societa \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "NewCorp SRL",
    "fatturato": 2000000,
    "ebitda": 300000,
    "regione": "Lazio",
    "codice_ateco": "62.02.00",
    "settore": "IT Services",
    "descrizione": "Consulenza IT"
  }'
```


## 🔐 Sicurezza

- ✅ Password hashing con bcrypt (cost factor 10)
- ✅ JWT con expiry time configurabile
- ✅ Prepared statements (SQL injection prevention)
- ✅ Input validation su tutte le route
- ✅ Environment variables per secrets
- ✅ RBAC su endpoint protetti
- ✅ Error handling senza leak info sensibili


## 🚀 Scripts NPM

```bash
npm run dev          # Development con nodemon + ts-node
npm run build        # Compila TypeScript → dist/
npm start            # Production (esegue da dist/)
```


## 📝 Roadmap

### Implementato ✅

- [x] Autenticazione JWT
- [x] RBAC (3 livelli)
- [x] CRUD società completo
- [x] Validazioni input
- [x] Database MySQL
- [x] TypeScript


### TODO 🚧

- [ ] Refresh token rotation
- [ ] Rate limiting (express-rate-limit)
- [ ] Logging strutturato (Winston)
- [ ] Test unitari (Jest)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Paginazione lista società
- [ ] CORS configuration avanzata
- [ ] Deploy su Render/Railway


## 🤝 Contribuire

Questo è un progetto portfolio. Feedback e suggerimenti sono benvenuti!

1. Fork il progetto
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 License

MIT License - vedi file [LICENSE](LICENSE)

## 👤 Author

**Loris97**

- GitHub: [@Loris97](https://github.com/Loris97)
- LinkedIn: [Loris Scola](https://it.linkedin.com/in/loris-scola-dev)

## 🔗 Related Projects

- [Frontend SPA](https://github.com/Loris97/ma-portal-frontend) - React + TypeScript + Vite + Tailwind CSS

---

**Note:** Questo è un progetto portfolio. Per uso in produzione, implementare ulteriori misure di sicurezza (rate limiting, HTTPS, CORS restrittivo, audit logging, monitoring).

## 🙏 Riconoscimenti

- Express.js team
- TypeScript community
- Node.js contributors
