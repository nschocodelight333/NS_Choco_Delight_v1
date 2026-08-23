
# 🍫 Choco Delight — Homemade Chocolates E-Commerce

> **Made with Heart, Meant to Celebrate.**
> A production-ready full-stack e-commerce application for a homemade chocolate brand.

---

## 🏃 How to Run

### 1. Backend Server (Express & MongoDB)
```bash
cd backend
npm install    # (First time setup)
npm run dev    # Starts backend API on http://localhost:5000
```

### 2. Web Frontend (React + Vite)
```bash
cd frontend
npm install    # (First time setup)
npm run dev    # Starts web app on http://localhost:5173
```

### 3. Mobile Native App (Capacitor — Android & iOS)

#### 🤖 Android (Android Studio / Emulator)
```bash
cd frontend
npm run build
npx cap sync
npx cap open android
```
*(Inside Android Studio, select your emulator or connected device and press **Run ▶**)*

#### 🍏 iOS (Xcode / macOS)
```bash
cd frontend
npm run build
npx cap add ios   # (First time setup for iOS)
npx cap open ios
```
*(Inside Xcode, select your simulator and press **⌘R** to run)*

#### 🔄 Sync React UI Changes to Native Mobile Apps
```bash
cd frontend
npm run build
npx cap sync
```

---

## 📁 Project Structure

```
choco-delight/
├── backend/          # Node.js + Express + MongoDB API
└── frontend/         # React + Vite + TailwindCSS
```

---

## ⚙️ Setup

### 1. Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.example .env

# Start development server
npm run dev
```

**Backend runs on:** `http://localhost:5000`

### 2. Seed the Database

After filling in `MONGO_URI` in `.env`:

```bash
cd backend
npm run seed
# OR: node seed.js
```

This seeds all **16 products** (9 Normal/Heart + 7 Bites) into MongoDB.

### 3. Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.example .env

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas — get from atlas.mongodb.com
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/choco-delight?retryWrites=true&w=majority

# JWT — use a long, random secret
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Admin Secret — anyone who provides this code during signup gets admin role
ADMIN_SECRET=chocoAdmin2024

# Cloudinary — get from cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay — get from dashboard.razorpay.com
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

> ⚠️ **Never commit `.env` files to Git.** They are already in `.gitignore`.

---

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get profile | 🔒 |
| PUT | `/api/auth/me` | Update profile | 🔒 |
| GET | `/api/products` | List products | Public |
| GET | `/api/products/:id` | Single product | Public |
| POST | `/api/products` | Create product | 🔒 Admin |
| PUT | `/api/products/:id` | Update product | 🔒 Admin |
| DELETE | `/api/products/:id` | Delete product | 🔒 Admin |
| GET | `/api/products/:id/reviews` | Get reviews | Public |
| POST | `/api/products/:id/reviews` | Add review | 🔒 |
| GET | `/api/cart` | Get cart | 🔒 |
| POST | `/api/cart` | Add to cart | 🔒 |
| PUT | `/api/cart/:itemId` | Update cart item | 🔒 |
| DELETE | `/api/cart/:itemId` | Remove item | 🔒 |
| DELETE | `/api/cart` | Clear cart | 🔒 |
| POST | `/api/orders` | Create order | 🔒 |
| GET | `/api/orders` | Get orders | 🔒 |
| GET | `/api/orders/:id` | Single order | 🔒 |
| PUT | `/api/orders/:id/status` | Update status | 🔒 Admin |
| POST | `/api/payment/create-order` | Create Razorpay order | 🔒 |
| POST | `/api/payment/verify` | Verify payment | 🔒 |
| GET | `/api/admin/dashboard` | Dashboard stats | 🔒 Admin |
| GET | `/api/admin/customers` | Customer list | 🔒 Admin |

---

## 🔑 Accounts You Need to Create

| Service | What for | URL | Free tier |
|---------|----------|-----|-----------|
| **MongoDB Atlas** | Database | [atlas.mongodb.com](https://atlas.mongodb.com) | M0 Cluster (512MB) ✅ |
| **Cloudinary** | Image hosting | [cloudinary.com](https://cloudinary.com) | 25GB ✅ |
| **Razorpay** | Payments | [razorpay.com](https://razorpay.com) | Test mode instant ✅ |
| **Render** | Backend hosting | [render.com](https://render.com) | Free web service ✅ |
| **Vercel** | Frontend hosting | [vercel.com](https://vercel.com) | Free ✅ |

---

## 🚀 Deployment Guide

### Step 1 — MongoDB Atlas

1. Go to [atlas.mongodb.com](https://atlas.mongodb.com) → Create account
2. Create a **Free M0 cluster**
3. Create a database user (username + password)
4. Allow all IP addresses: `Network Access → Add IP → 0.0.0.0/0`
5. Click **Connect → Drivers** and copy the connection string
6. Replace `<password>` with your DB user password → that's your `MONGO_URI`

### Step 2 — Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up
2. On the Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Add these to your backend `.env`

### Step 3 — Razorpay

1. Go to [razorpay.com](https://razorpay.com) → Sign up
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy **Key ID** and **Key Secret**
4. Add to both backend `.env` (both keys) and frontend `.env` (Key ID only)
5. For **live payments**: Complete Razorpay KYC (quick for small business)

### Step 4 — Deploy Backend to Render

1. Go to [render.com](https://render.com) → Sign up
2. Click **New → Web Service**
3. Connect your GitHub repo (push `backend/` to GitHub first)
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node version**: 18+
5. Add all environment variables from `backend/.env`
6. Set `FRONTEND_URL` to your Vercel URL (add after step 5)
7. Deploy → note your Render URL (e.g., `https://choco-delight-api.onrender.com`)

### Step 5 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up
2. Click **New Project** → Import from GitHub
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay Key ID
5. Deploy → Vercel gives you a `.vercel.app` URL

### Step 6 — Final Steps

1. Update backend `FRONTEND_URL` on Render to your Vercel URL
2. Run seed script once: on Render, use **Shell** tab → `node seed.js`
3. Create your admin account: use Register on your site with the `ADMIN_SECRET` code
4. Upload product images from the Admin Panel

---

## 👑 Creating Admin Account

1. Go to `/register` on your site
2. Click "Have an admin code?" 
3. Enter the value of `ADMIN_SECRET` from your `.env`
4. Register — you'll get `role: "admin"` and be redirected to `/admin`

---

## 💳 Razorpay Test Mode

Use these test credentials in Razorpay test mode:
- **UPI**: `success@razorpay`
- **Card**: `4111 1111 1111 1111` / Expiry: any future date / CVV: any 3 digits
- **Net Banking**: Select any bank → success

When ready for live, swap test keys with live keys from Razorpay dashboard.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| State | React Context (Auth + Cart) |
| Routing | React Router v6 |
| HTTP | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Images | Multer + Cloudinary |
| Payments | Razorpay |
| Validation | express-validator |

---

## 📦 Product Catalog (Seeded)

### Normal / Heart Shape
| Product | Price |
|---------|-------|
| Pistachio Kunafa Chocolate | ₹260 |
| Nutella Kunafa Chocolate | ₹300 |
| Oreo Chocolate | ₹120 |
| Plain Chocolate | ₹100 |
| Plain White Chocolate | ₹120 |
| Dark Chocolate | ₹130 |
| Dry Fruits Chocolate | ₹190 |
| Almond Chocolate | ₹120 |
| Gems Chocolate | ₹100 |

### Bites
| Product | Price |
|---------|-------|
| Pistachio Kunafa (Bite) | ₹15 |
| Plain Chocolate (Bite) | ₹10 |
| Plain White Chocolate (Bite) | ₹10 |
| Dark Chocolate (Bite) | ₹10 |
| Dry Fruits (Bite) | ₹15 |
| Almond Chocolate (Bite) | ₹10 |
| Cashew Chocolate (Bite) | ₹10 |

---

## 📄 License

Private — All rights reserved. Choco Delight.
