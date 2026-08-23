# 🍫 NS Choco Delight — Handcrafted Chocolates E-Commerce Platform

> **Made with Heart, Meant to Celebrate.**  
> *Official Full-Stack Web & Mobile E-Commerce Ecosystem for NS Choco Delight — Tadepalligudem, Andhra Pradesh, India.*

---

[![CI/CD Safety Pipeline](https://github.com/skshafiulla/NS_Chaco_Delight/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/skshafiulla/NS_Chaco_Delight/actions/workflows/ci-cd.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/express-4.18.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB Mongoose](https://img.shields.io/badge/mongoose-8.1.1-green.svg)](https://mongoosejs.com/)
[![Capacitor Native](https://img.shields.io/badge/capacitor-8.5.0-blueviolet.svg)](https://capacitorjs.com/)

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Project Structure](#5-project-structure)
6. [Core Workflows](#6-core-workflows)
7. [Environment Variables](#7-environment-variables)
8. [Getting Started / Local Setup](#8-getting-started--local-setup)
9. [Testing](#9-testing)
10. [Deployment](#10-deployment)
11. [Mobile & App Access (PWA & Android APK)](#11-mobile--app-access-pwa--android-apk)
12. [Security Notes](#12-security-notes)
13. [Contributing](#13-contributing)
14. [License & Ownership](#14-license--ownership)

---

## 1. Project Overview

**NS Choco Delight** is a production-ready, full-stack e-commerce application engineered for a premium homemade chocolate business headquartered in Tadepalligudem, Andhra Pradesh. The platform bridges the gap between traditional artisanal chocolate crafting and modern digital e-commerce, offering customers in India a rich web and native mobile experience to order handcrafted, customizable chocolates.

The platform resolves local commerce bottlenecks by automating custom shape and flavor quote requests, integrating instant WhatsApp customer support, offering zero-delivery-fee local takeaway fulfillment, and providing real-time sales and inventory telemetry for store administrators.

### 🌟 Key Highlights
- **✨ Interactive Custom Chocolate Designer**: Allows customers to design custom chocolates by picking shapes, text printing, flavors, and uploading reference photos.
- **💬 WhatsApp & Direct Ordering Integration**: Instant single-click WhatsApp order generation and direct customer contact shortcuts.
- **📊 Real-time Executive Admin Dashboard**: Live sales telemetry, order fulfillment tracking, revenue stats, and customer directory analytics.
- **🎉 Dynamic Special Occasions System**: Automated holiday teaser banners, launch countdowns, and published campaign product showcase pages.
- **📱 PWA & Cross-Platform Mobile**: Installable Progressive Web App (PWA) plus native Android APK support via Capacitor with **100% Feature Parity**.

---

## 2. Features

### 🛍️ Customer-Facing Features
- **Product Catalog & Filtering**: Browse handcrafted chocolates categorized into Normal/Heart Shapes (Pistachio Kunafa, Nutella Kunafa, Dark Chocolate, etc.) and Bite-sized pieces.
- **Interactive Custom Chocolate Builder**: Request bespoke orders with custom inscriptions, reference photo uploads, and flavor options.
- **Cart & Dynamic Pricing**: Real-time cart calculations, automatic free delivery eligibility thresholding (orders ≥ ₹500), and item quantity controls.
- **Saved Address & Auto-Fill Profile**: Auto-populates stored delivery address details with multi-address selection capabilities during checkout.
- **Flexible Payment & Fulfillment**:
  - **Cash on Delivery (COD)**
  - **Online Payment** (Razorpay Instant UPI, Debit/Credit Card, Net Banking)
  - **Takeaway Pick-up** (Automatically waives delivery fees to ₹0)
- **Order Tracking & History**: Live order status timeline (`Pending` → `Confirmed` → `Preparing` → `Prepared` → `Out for Delivery` → `Delivered`).
- **Verified Purchase Reviews**: Star ratings and text reviews linked to confirmed customer orders.
- **Special Occasion Collections**: Dedicated campaign landing pages for festivals like New Year, Valentine's Day, and Diwali (`/special-occasions`).

### 👑 Admin Management Features
- **Executive Operations Dashboard**: High-level telemetry showing total revenue, pending orders, custom request volume, and customer growth.
- **Catalog & Stock Management**: Add, update, or remove products, upload high-resolution images, set stock levels, and toggle featured badges.
- **Order Fulfillment Pipeline**: Manage order statuses from order placement to final delivery or cancellation.
- **Custom Request Quoting Engine**: Review customer custom requests, inspect uploaded reference photos, assign custom price quotes, and manage customer responses.
- **Campaign Manager**: Create holiday campaigns, schedule start/end dates, set custom banners, attach products, and toggle instant publication gates.
- **Review Moderation**: Inspect customer reviews and ratings directly from the admin dashboard.
- **Customer CRM Directory**: View customer profiles, order count, total spending, and initiate direct call/WhatsApp actions.

### 📱 Mobile & PWA Features
- **Installable PWA**: Add to Home Screen prompts with offline resilience and Network-First caching.
- **Native Android App**: Powered by Capacitor 8.5 with native status bar styling and hardware back button handling.

---

## 3. Tech Stack

### 🎨 Frontend
| Layer | Technology / Package | Version |
| :--- | :--- | :--- |
| **Framework & Bundler** | React + Vite (`@vitejs/plugin-react`) | React `v18.2.0` / Vite `v5.1.0` |
| **Styling** | TailwindCSS + PostCSS + Autoprefixer | Tailwind `v3.4.1` |
| **State Management** | React Context (`AuthContext`, `CartContext`) + Zustand | Zustand `v4.5.0` |
| **Routing** | React Router DOM | `v6.22.0` |
| **HTTP Client** | Axios | `v1.6.7` |
| **Charts & Telemetry** | Recharts | `v2.12.7` |
| **Animations** | Framer Motion | `v11.0.5` |
| **UI Components** | Headless UI + React Hot Toast + ES-Toolkit | `@headlessui/react v1.7.18` / `react-hot-toast v2.4.1` |
| **Mobile Runtime** | Capacitor (Core, CLI, Android, iOS, Status Bar, App) | `@capacitor/core v8.5.0` |

### ⚙️ Backend
| Layer | Technology / Package | Version |
| :--- | :--- | :--- |
| **Runtime & Server** | Node.js (Engine `>=18.0.0`) + Express.js | Express `v4.18.2` |
| **Database & ODM** | MongoDB Atlas + Mongoose | Mongoose `v8.1.1` |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + Bcrypt (`bcryptjs`) | JWT `v9.0.2` / Bcrypt `v2.4.3` |
| **Media Management** | Multer + Cloudinary Storage | `multer v1.4.5-lts.1` / `cloudinary v1.41.3` |
| **Payment Gateway** | Razorpay Node SDK | `v2.9.2` |
| **Validation** | Express-Validator | `v7.0.1` |
| **Monitoring & Logs** | Sentry Node SDK + Morgan | `@sentry/node v10.70.0` / `morgan v1.10.0` |
| **Testing** | Jest + Supertest + MongoMemoryServer + Cross-Env | Jest `v30.4.2` / Supertest `v7.2.2` |

### 🌐 Infrastructure & Hosting
- **Database Host**: MongoDB Atlas Cloud NoSQL
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render Web Services
- **CI/CD Pipeline**: GitHub Actions (`.github/workflows/ci-cd.yml`)

---

## 4. System Architecture

```mermaid
graph TD
    Client[Browser / Mobile PWA / Android APK] -->|HTTPS Requests| Frontend[React + Vite Frontend — Vercel]
    Frontend -->|REST API Calls / JSON| Backend[Node.js + Express API — Render]
    Backend -->|Mongoose ODM| DB[(MongoDB Atlas Cloud NoSQL)]
    Backend -->|Payment Verification| Razorpay[Razorpay Payment API]
    Backend -->|Media Uploads| Cloudinary[Cloudinary CDN Storage]
```

### Request & Data Flow
1. **Client Interaction**: Users interact with the React Single Page Application (SPA) or Android APK.
2. **State & API Gateway**: Component actions invoke Axios API handlers (`/src/api/*`), attaching JWT authentication headers from `localStorage`.
3. **Backend Processing**: Express middlewares (`/middleware/auth.js`, `/middleware/admin.js`) validate JWT tokens and forward sanitized requests to route controllers.
4. **Data Persistence**: Controllers interact with MongoDB Atlas via Mongoose models. Media files pass through Multer to Cloudinary CDN, while payment transactions are verified against Razorpay's API.

---

## 5. Project Structure

```
NS_Chaco_Delight/
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions CI/CD automated test & build pipeline
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection manager (Cloud, Local & In-Memory fallback)
│   ├── controllers/              # Express API route controllers (Auth, Products, Orders, etc.)
│   ├── middleware/               # Auth guards, admin checks, error handler, Multer uploads
│   ├── models/                   # Mongoose database schemas (User, Product, Order, Campaign, etc.)
│   ├── public/uploads/           # Local fallback storage for media uploads
│   ├── routes/                   # Express endpoint routing definitions
│   ├── tests/                    # Jest automated integration test suites (Auth, Campaign, Product, Review)
│   ├── seed.js                   # Catalog product seeder script (16 default products)
│   ├── seed-admin.js             # Initial admin & default accounts seeder script
│   └── server.js                 # Express application entrypoint
├── frontend/
│   ├── public/                   # Static assets, SVG icons, PWA manifest.json, sw.js
│   ├── src/
│   │   ├── api/                  # Axios HTTP client endpoints mapped by resource
│   │   ├── components/           # Reusable UI components (Navbar, Footer, ProductCard, ErrorBoundary, InstallAppBanner)
│   │   ├── context/              # React Context Providers (AuthContext, CartContext)
│   │   ├── hooks/                # Custom hooks (useAppBackButton for Capacitor Android)
│   │   ├── pages/                # Customer and Admin view pages
│   │   ├── utils/                # Helper utilities (WhatsApp URL builder, image URL formatters)
│   │   ├── App.jsx               # React Router DOM route hierarchy & Layout wrappers
│   │   ├── index.css             # TailwindCSS base styles and custom utility layers
│   │   └── main.jsx              # React DOM mounting entrypoint
│   ├── capacitor.config.json     # Capacitor mobile app configuration
│   ├── tailwind.config.js        # Custom Tailwind color palette & font definitions
│   └── vite.config.js            # Vite bundler, proxy rules, and dev server header settings
├── API_CONTRACT.md               # API endpoint documentation
├── CHECKLIST.md                  # Development verification checklist
├── CONTRIBUTING.md               # Developer contribution guidelines
└── README.md                     # Project master documentation
```

---

## 6. Core Workflows

### 🛒 1. Customer Standard Order Flow
1. **Browse Catalog**: Customer browses products on `/products` or filters by shape category.
2. **Add to Cart**: Customer selects item quantity and shape options.
3. **Checkout**: Customer navigates to `/checkout`, chooses saved delivery address or enters a new one, and picks a fulfillment option (**COD**, **Online Payment**, or **Takeaway**).
4. **Order Confirmation**: Order is saved with `Pending`/`Confirmed` status, and the customer is redirected to `/order-confirmation/:id`.
5. **Fulfillment & Delivery**: Admin updates order status on `/admin/orders`. Once marked `Delivered`, the customer can submit product reviews.

### ✨ 2. Custom Chocolate Request Flow
1. **Design Request**: Customer fills the custom chocolate form on `/customize` (selecting custom shape, inscription text, flavor notes, and optional reference image).
2. **Admin Review & Quote**: Request appears on Admin `/admin/custom-requests`. Admin inspects specifications and submits a custom price quote in ₹ INR.
3. **Customer Action**: Customer views the quote under `/my-custom-orders` and accepts or rejects the quote.
4. **Checkout**: Accepting the quote opens the checkout workflow for payment and address selection.

### 🎉 3. Admin Occasion Campaign Flow
1. **Create Campaign**: Admin navigates to `/admin/campaigns`, inputs occasion details (e.g., "Valentine's Special"), date range, banner image, and selects tagged products.
2. **Publish Gate**: Admin sets status to `Published`.
3. **Public Visibility**: Published campaigns automatically display on `/special-occasions` and the Home page occasions showcase section, regardless of date ranges.

### ⭐ 4. Verified Product Review Flow
1. **Eligibility Check**: After an order is marked `Delivered`, the customer becomes eligible to submit a review on the product details page (`/products/:id`).
2. **Submission**: Customer rates (1–5 stars) and writes feedback.
3. **Aggregation & Moderation**: Average product rating updates automatically and the review appears in Admin `/admin/reviews`.

---

## 7. Environment Variables

### Backend Environment Variables (`backend/.env`)

| Variable Name | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number for Express server | `5000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `MONGO_URI` | MongoDB Atlas database connection string | `mongodb+srv://user:pass@cluster.mongodb.net/choco-delight` |
| `JWT_SECRET` | Secret key used for signing JWT authentication tokens | `your_jwt_secret_key` |
| `JWT_EXPIRES_IN` | JWT token expiration duration | `7d` |
| `ADMIN_SECRET` | Secret security code for admin registration | `chocoAdmin2024` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |
| `RAZORPAY_KEY_ID` | Razorpay payment gateway Key ID | `rzp_test_xxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay payment gateway Key Secret | `your_razorpay_secret` |
| `FRONTEND_URL` | Frontend origin URL for CORS policy configuration | `http://localhost:5173` |

### Frontend Environment Variables (`frontend/.env`)

| Variable Name | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend Express REST API | `http://localhost:5000/api` |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay Key ID for client checkout SDK | `rzp_test_xxxxxxxx` |

---

## 8. Getting Started / Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher installed
- **npm**: `v9.0.0` or higher installed
- **MongoDB**: Active MongoDB Atlas cluster URI (or local MongoDB running on `127.0.0.1:27017`). *Note: If MongoDB is unavailable, the backend automatically initializes an in-memory MongoDB instance for local testing.*

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/skshafiulla/NS_Chaco_Delight.git
cd NS_Chaco_Delight
```

#### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your environment variables
```

Seed the default product catalog (16 products) and default accounts:
```bash
npm run seed
npm run seed:admin
```

Start backend development server:
```bash
npm run dev
# Server running on http://localhost:5000
```

#### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your environment variables
```

Start frontend development server:
```bash
npm run dev
# Frontend running on http://localhost:5173
```

---

## 9. Testing

The backend includes Jest integration test suites covering authentication, product catalog operations, review submission, and occasion campaigns.

### Run Test Suite
```bash
cd backend
npm test
```

### Test Coverage Files
- `tests/auth.test.js` — Authentication, registration, JWT profile retrieval.
- `tests/product.test.js` — Catalog listing, single product fetching.
- `tests/campaign.test.js` — Campaign publication, upcoming teasers, active status checks.
- `tests/review.test.js` — Verified review submission, ratings aggregation.

---

## 10. Deployment

### 🌐 Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Configure Environment Variables: `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID`.
4. Deploy using build command `npm run build` and output directory `dist`.

### ⚡ Backend (Render)
1. Create a Web Service on [Render](https://render.com).
2. Set Root Directory to `backend`.
3. Build Command: `npm install` | Start Command: `npm start`.
4. Add all environment variables from `backend/.env`.

### 🛡️ Automated CI/CD
GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically executes on every push to `main`:
- Installs backend dependencies and executes Jest tests.
- Installs frontend dependencies and verifies Vite production build.

---

## 11. Mobile & App Access (PWA & Android APK)

> **✨ 100% Feature Parity Guarantee**: Every single feature available on the web version—including Admin Dashboard telemetry, product management, Razorpay payment modal, custom chocolate designer with photo upload, and campaign publication—is **100% functional on mobile browsers, installed PWA, and the native Android APK.**

### 📲 1. Progressive Web App (PWA Installation)
- **Zero App Store Download**: Visitors on Android Chrome or iOS Safari can tap **"📱 Install App"** directly from the top banner or select **"Add to Home Screen"** in their browser menu.
- **Standalone Execution**: Runs in a standalone window with no browser URL address bar, matching a native mobile application experience.

### 🤖 2. Native Android App Build (Capacitor)
To build and sync the native Android APK locally:

```bash
cd frontend
# 1. Build production React web bundle
npm run build

# 2. Sync build assets and plugins to Android container
npx cap sync android

# 3. Launch Android Studio to build APK or run on emulator
npx cap open android
```
*(Inside Android Studio, select **Build → Build APK(s)** or click **Run ▶** to deploy to a connected Android physical device or virtual emulator).*

---

## 12. Security Notes

- **JWT Authentication**: User sessions use signed JSON Web Tokens stored securely in client storage and sent via `Authorization: Bearer <token>` headers.
- **Password Protection**: User passwords are encrypted using `bcryptjs` before database persistence.
- **Protected Admin Routes**: Middleware guards (`/middleware/admin.js`) enforce strict role checking (`role === 'admin'`).
- **Input Sanitization**: API endpoints utilize `express-validator` and Mongoose schema sanitization.
- **CORS Protection**: Access is scoped via CORS settings (`cors()` middleware) matching authorized frontend origins.

---

## 13. Contributing

Please refer to the following documents before submitting pull requests:
- [CONTRIBUTING.md](file:///d:/NS_Chaco_Delight/CONTRIBUTING.md) — Code style, commit conventions, and branch strategy.
- [CHECKLIST.md](file:///d:/NS_Chaco_Delight/CHECKLIST.md) — Pre-deployment verification checklist.

---

## 14. License & Ownership

**NS Choco Delight** — All rights reserved.  
Business Owner: *NS Choco Delight (Tadepalligudem, Andhra Pradesh, India)*.
