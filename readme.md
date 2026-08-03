# 🖨️ QR Se Print

**Smart Printing, Made Simple.**
`Scan → Upload → Pay → Auto Print`

QR Se Print is a Smart Printing Platform built for Cyber Cafes, Print/Xerox Shops, CSC Centers, and Digital Service businesses. It removes manual file handling, manual payment collection, and manual print triggering — customers scan a shop's QR code, upload a document, pay online, and the file is automatically routed to the correct printer (Black & White or Colour).

Born from a real problem at a Cyber Cafe in Jharkhand (not designed in a boardroom), every feature exists because it was needed on the shop floor.

---

## 📋 Table of Contents

1. [About](#about)
2. [Core Problem & Features](#core-problem--features)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Monorepo Structure](#monorepo-structure)
6. [All Pages / Screens](#all-pages--screens)
7. [Installation & Setup](#installation--setup)
8. [Environment Variables](#environment-variables)
9. [Core API Endpoints](#core-api-endpoints)
10. [Real-time Events (Socket.io)](#real-time-events-socketio)
11. [Desktop Print Agent](#desktop-print-agent)
12. [Deployment](#deployment)
13. [Roadmap](#roadmap)
14. [Support](#support)

---

## About

QR Se Print exists so a shop owner never has to think about **hardware or complicated setup** to offer a self-service printing experience. The platform's goal is not to "sell software" — it's to make every print shop's business more professional, faster, and efficient.

**Who it's for:**
- Cyber Cafes
- Print & Xerox Shops
- CSC Centers
- Digital Service Centres
- Schools & Colleges
- Coaching Institutes
- Libraries & Offices
- Small & Medium printing businesses

---

## Core Problem & Features

### Problems it solves
- Customers sending files over WhatsApp / carrying pendrives
- Manual cash/payment collection at the counter
- No automated print triggering → queues during peak hours
- No separate routing for B&W vs Colour print jobs
- No order or income tracking for the shop owner
- Dependency on expensive WiFi-enabled printers

### Customer-side features
- QR-based ordering — each shop gets a unique QR code
- Upload documents (PDF, DOCX, images, etc.)
- Choose print options — B&W / Colour, copies, page range, paper size
- Online payment (UPI / Cards / Netbanking)
- **Auto-print** — no manual staff intervention needed
- Works with **any printer** — no WiFi-printer requirement

### Shop owner features
- Owner Dashboard — orders, income, live stats
- Separate printer selection for B&W and Colour jobs
- Order & income management
- Easy one-time software (Print Agent) installation
- Secure document processing (auto-deleted after printing)
- Regular product updates & improvements

### Support model
Direct WhatsApp support from the QR Se Print team — no third-party ticketing middlemen.

---

## Tech Stack

### Recommended: **MERN** (MongoDB, Express.js, React, Node.js)

**Why MERN over MEAN for this product:**
- Customer flow is scanned on a phone, often on shop WiFi/mobile data → React's lighter bundle and faster hydration matter more than Angular's opinionated structure.
- The product iterates fast ("build → test on real shop → keep what works") — React's unopinionated, library-driven approach fits an MVP-to-scale journey better than Angular's heavier conventions.
- Payment gateways (Razorpay/UPI) and QR libraries have the most mature React ecosystem in India.
- Larger hiring pool and community support for React/Node in India vs Angular.
- Angular's strength (strict structure, powerful forms module) is more valuable for large internal enterprise tools — not required at this stage.

### Frontend (all 3 web apps share this stack)
| Purpose | Package |
|---|---|
| Build tool | `vite` |
| UI Library | `react`, `react-dom` |
| Routing | `react-router-dom` |
| Styling | `tailwindcss`, `postcss`, `autoprefixer` |
| Data fetching / cache | `@tanstack/react-query`, `axios` |
| Global state | `zustand` (or `@reduxjs/toolkit` if state grows complex) |
| Forms & validation | `react-hook-form`, `zod` |
| File upload UI | `react-dropzone` |
| QR code generation | `qrcode.react` |
| Payments (checkout) | Razorpay Checkout script + `react-razorpay` |
| Real-time updates | `socket.io-client` |
| Charts (dashboard) | `recharts` |
| Icons | `lucide-react` |
| Notifications/toasts | `react-hot-toast` |
| PWA support (customer app) | `vite-plugin-pwa` |

### Backend
| Purpose | Package |
|---|---|
| Server framework | `express` |
| Database ODM | `mongoose` (MongoDB) |
| Auth | `jsonwebtoken`, `bcryptjs` |
| File upload handling | `multer` |
| Cloud file storage | `cloudinary` (or `aws-sdk` for S3) |
| Payments | `razorpay` |
| Real-time server | `socket.io` |
| PDF utilities (page count, pricing) | `pdf-lib`, `pdf-parse` |
| Scheduled cleanup (auto-delete files) | `node-cron` |
| Validation | `express-validator` or `joi` |
| Security | `helmet`, `cors`, `express-rate-limit` |
| Logging | `morgan`, `winston` |
| Env config | `dotenv` |

### Database
- **MongoDB Atlas** (managed) or self-hosted MongoDB — flexible schema fits evolving order attributes (paper size, binding, copies, etc.) and read-heavy dashboard queries.

### Desktop Print Agent (runs on the shop's PC — this is what makes "Auto Print" possible)
| Purpose | Package |
|---|---|
| Desktop app shell | `electron` |
| Real-time job listener | `socket.io-client` |
| Direct printer output | `pdf-to-printer` |
| Detect installed printers | `systeminformation` (or Windows `wmic` wrapper) |
| Local config storage | `electron-store` |
| Auto-updates | `electron-updater` |

### DevOps / Infra
- `Docker` + `docker-compose` for local multi-service dev
- `PM2` for Node process management in production
- `Nginx` as reverse proxy / static file server
- `GitHub Actions` for CI/CD
- `MongoDB Atlas` for managed database hosting
- `Cloudinary` / `AWS S3` for uploaded document storage

---

## System Architecture

```
                         ┌───────────────────────┐
                         │   Customer scans QR    │
                         └───────────┬───────────┘
                                     ▼
 ┌────────────────┐   REST/HTTPS  ┌────────────────────┐   Socket.io  ┌──────────────────────┐
 │  Customer Web   │◄─────────────►│   Backend API      │◄────────────►│  Shop Dashboard (Web) │
 │  App (React)    │               │ (Node + Express)   │              │      (React)          │
 └────────────────┘               │  + MongoDB          │              └──────────────────────┘
                                   │  + Cloud Storage     │
                                   │  + Razorpay          │              ┌──────────────────────┐
                                   └──────────┬───────────┘◄────────────►│   Admin Panel (React) │
                                              │ Socket.io                └──────────────────────┘
                                              ▼
                                   ┌──────────────────────┐
                                   │  Desktop Print Agent  │
                                   │  (Electron, on shop's │
                                   │   PC — sends job to   │
                                   │   B&W / Colour printer)│
                                   └──────────────────────┘
```

**Flow:** Customer uploads file & pays → Backend stores file (Cloudinary/S3) + creates order in MongoDB → Backend emits a `job:new` Socket.io event to that shop's Print Agent → Agent downloads file & sends it straight to the mapped printer → Agent emits `job:printed` back → Dashboard & customer status update in real time → File auto-deleted after a configurable retention window (secure document processing).

---

## Monorepo Structure

Using **npm workspaces** (or Turborepo) since multiple React apps share types, API clients, and UI components.

```
qr-se-print/
├── apps/
│   ├── backend/                 # Node + Express + MongoDB API
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── models/          # Shop, Order, Printer, User, Transaction
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── sockets/
│   │   │   ├── utils/
│   │   │   └── server.js
│   │   └── package.json
│   │
│   ├── customer-web/            # Customer QR → Upload → Pay flow (React, PWA)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── App.jsx
│   │   └── package.json
│   │
│   ├── shop-dashboard/          # Shop owner dashboard (React)
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── admin-panel/             # Super admin (React)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── print-agent/             # Electron desktop app
│       ├── src/
│       └── package.json
│
├── packages/
│   └── shared/                  # Shared constants, API client, types
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## All Pages / Screens

### 🧑‍💻 Customer Web App (`apps/customer-web`) — mobile-first
| Route | Page |
|---|---|
| `/shop/:shopId` | Landing page (opens on QR scan) |
| `/shop/:shopId/upload` | Upload document(s) |
| `/shop/:shopId/options` | Print options — B&W/Colour, copies, page range, paper size |
| `/shop/:shopId/payment` | Payment (Razorpay checkout) |
| `/shop/:shopId/order/:orderId` | Live order status / confirmation & receipt |
| `/about` | About QR Se Print |
| `/terms` | Terms & Conditions |
| `/privacy-policy` | Privacy Policy |
| `/refund-policy` | Refund Policy |
| `/disclaimer` | Disclaimer |
| `/support` | Support (WhatsApp deep link) |

### 🏪 Shop Owner Dashboard (`apps/shop-dashboard`)
| Route | Page |
|---|---|
| `/login`, `/signup`, `/forgot-password` | Auth |
| `/dashboard` | Home — today's orders, revenue snapshot |
| `/dashboard/orders` | Order list, filters, reprint, download |
| `/dashboard/earnings` | Income, transaction history |
| `/dashboard/printers` | Add/select B&W & Colour printers, test print |
| `/dashboard/qr-code` | Generate/download shop's QR code |
| `/dashboard/print-agent` | Download & installation guide for Print Agent |
| `/dashboard/settings` | Shop profile & settings |
| `/dashboard/support` | WhatsApp support |

### 🛠️ Admin Panel (`apps/admin-panel`)
| Route | Page |
|---|---|
| `/admin/login` | Admin auth |
| `/admin/shops` | Onboard/approve/manage shops |
| `/admin/analytics` | Platform-wide orders, revenue, active shops |
| `/admin/support` | Support ticket overview |
| `/admin/content` | Edit Terms / Privacy / Refund policy content |

### 🖥️ Desktop Print Agent (`apps/print-agent`)
| Screen | Purpose |
|---|---|
| Login/Setup Wizard | Connect agent to shop account |
| Printer Mapping | Assign detected printers as B&W / Colour |
| Background Tray | Listens for jobs, shows print status notifications |

---

## Installation & Setup

### Prerequisites
- Node.js LTS (v20+)
- MongoDB (local or Atlas connection string)
- Git
- Razorpay account (test keys for development)
- Cloudinary or AWS S3 account (for file storage)

### 1. Clone & install
```bash
git clone https://github.com/your-org/qr-se-print.git
cd qr-se-print
npm install        # installs all workspaces
```

### 2. Backend setup
```bash
cd apps/backend
cp .env.example .env      # fill in values, see below
npm run dev                # starts on http://localhost:5000
```

### 3. Customer Web App
```bash
cd apps/customer-web
cp .env.example .env
npm run dev                # http://localhost:5173
```

### 4. Shop Dashboard
```bash
cd apps/shop-dashboard
cp .env.example .env
npm run dev                # http://localhost:5174
```

### 5. Admin Panel
```bash
cd apps/admin-panel
cp .env.example .env
npm run dev                # http://localhost:5175
```

### 6. Desktop Print Agent
```bash
cd apps/print-agent
npm install
npm run dev                # launches Electron app
npm run build               # produces installer (.exe/.dmg)
```

### Optional: run everything via Docker
```bash
docker-compose up --build
```

---

## Environment Variables

### `apps/backend/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/qrseprint
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=xxxx
RAZORPAY_KEY_SECRET=xxxx

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173,http://localhost:5174

FILE_AUTO_DELETE_HOURS=24
WHATSAPP_SUPPORT_NUMBER=+91XXXXXXXXXX
```

### `apps/customer-web/.env` / `shop-dashboard/.env` / `admin-panel/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=xxxx
```

---

## Core API Endpoints

```
Auth
POST   /api/auth/register              Shop owner signup
POST   /api/auth/login                 Shop owner / admin login

Shops (public, used by QR landing page)
GET    /api/shops/:shopId              Get shop public info

Orders
POST   /api/orders                     Create order (file upload + print options)
POST   /api/orders/:id/payment         Initiate Razorpay payment
POST   /api/orders/:id/payment/verify  Verify payment signature
GET    /api/orders/:id/status          Poll/get order status

Dashboard (auth required)
GET    /api/dashboard/orders           Shop's orders list
GET    /api/dashboard/earnings         Income & transactions
POST   /api/printers                   Register/update a printer
GET    /api/printers                   List shop's printers

Admin (auth required, admin role)
GET    /api/admin/shops                All shops
GET    /api/admin/analytics            Platform-wide stats
```

## Real-time Events (Socket.io)

| Event | Direction | Purpose |
|---|---|---|
| `job:new` | Server → Print Agent | New print job assigned to a shop |
| `job:accepted` | Print Agent → Server | Agent picked up the job |
| `job:printed` | Print Agent → Server | Job completed successfully |
| `job:failed` | Print Agent → Server | Printer error / offline |
| `order:status` | Server → Customer Web | Live status update for order tracking page |

---

## Desktop Print Agent

The Print Agent is a lightweight Electron app installed **once** on the shop's PC. It:
1. Logs in with the shop owner's credentials.
2. Detects installed printers and lets the owner map one as **B&W** and one as **Colour**.
3. Listens on a persistent Socket.io connection for `job:new` events.
4. Downloads the file from cloud storage and sends it to the correct printer via `pdf-to-printer`.
5. Reports job status back to the backend in real time.
6. Runs silently in the system tray; auto-updates via `electron-updater`.

This is what enables "no WiFi-printer required, any printer supported" — the agent talks to the printer locally over USB/network exactly like a normal print job from the PC.

---

## Deployment

- **Backend:** Deploy on a VPS (DigitalOcean/AWS EC2) with PM2 + Nginx reverse proxy, or a PaaS like Render/Railway.
- **Frontend apps:** Deploy `customer-web`, `shop-dashboard`, `admin-panel` as static builds on Vercel/Netlify (or serve via Nginx alongside backend).
- **Database:** MongoDB Atlas (managed, with automated backups).
- **File storage:** Cloudinary/S3 with lifecycle rules matching `FILE_AUTO_DELETE_HOURS`.
- **Print Agent distribution:** Host signed installers (`.exe`/`.dmg`) for download from the Shop Dashboard's "Print Agent" page, with `electron-updater` pointing to a release feed (e.g., GitHub Releases).

---

## Roadmap

In line with the product's vision — *India's most trusted Smart Printing Platform* — upcoming focus areas:
- Broader printer/driver compatibility
- Stronger document security (encryption in transit & at rest)
- Faster print-agent job dispatch
- More granular shop analytics
- Multi-language support for the customer web app

---

## Support

Support is direct — **no third-party ticketing middlemen**. Shop owners and customers get help via WhatsApp, keeping resolution fast and personal.

---

**QR Se Print** — Making printing smarter, faster & simpler.