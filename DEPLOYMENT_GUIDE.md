# 🚀 Complete Deployment Guide: 100% Vercel Full-Stack Deployment

This repository is configured so **NS Choco Delight** (Vite React Frontend + Express Serverless Node.js API) can be deployed **100% on Vercel** as a single unified project!

---

> *Last verified & updated by Komesh Bathula for production Vercel & Render deployment.*

---

## ⚡ Option 1: 100% Vercel Unified Single-Project Deployment (Recommended)

With this setup, Vercel hosts both your frontend UI and your backend Express serverless functions under a single URL!

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "feat: configure 100% Vercel single-project deployment"
git push origin main
```

### Step 2: Import Project in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository `nschocodelight333/NS_Choco_Delight_v1`.
4. Leave **Framework Preset** as `Other` (or `Vite`) and **Root Directory** as `./` (Root).

### Step 3: Add Environment Variables on Vercel
In Vercel Project Settings → **Environment Variables**, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | `mongodb+srv://<user>:<pass>@cluster0.mongodb.net/choco-delight?retryWrites=true&w=majority` | Cloud MongoDB Atlas URI |
| `JWT_SECRET` | `your_super_secret_jwt_key_2026` | Secret key for JWT auth |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
| `ADMIN_SECRET` | `chocoAdmin2024` | Secret code for admin registration |
| `RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxx` | *(Optional)* Razorpay Public Key |
| `RAZORPAY_KEY_SECRET` | `your_razorpay_secret` | *(Optional)* Razorpay Secret Key |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | *(Optional)* Cloudinary Image Storage |
| `CLOUDINARY_API_KEY` | `your_api_key` | *(Optional)* Cloudinary Key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | *(Optional)* Cloudinary Secret |

### Step 4: Deploy!
Click **Deploy**. Vercel will:
- Build the Vite React Frontend to `frontend/dist`
- Map `/api/*` requests to the Express API serverless function in `api/index.js`
- Give you a single production URL (e.g., `https://ns-choco-delight.vercel.app`)!

---

## 🌐 Option 2: Render (Backend) + Vercel (Frontend) Split Deployment

If you prefer keeping backend web services on Render and frontend UI on Vercel:

### 1. Render Backend Setup
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- Set `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` on Render environment settings.

### 2. Vercel Frontend Setup
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Set `VITE_API_URL` to your Render backend API endpoint (`https://your-backend.onrender.com/api`).

---

## 🍫 Database Seeding & Verification

To populate default products and initial admin accounts in your MongoDB Atlas production database, run from your local terminal:

```bash
cd backend
# Make sure MONGO_URI in backend/.env points to your MongoDB Atlas cluster
npm run seed
npm run seed:admin
```
