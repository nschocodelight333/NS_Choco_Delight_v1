# 🚀 Complete Deployment Guide: Vercel (Frontend) & Render (Backend)

This guide provides step-by-step instructions to deploy **NS Choco Delight** live to production:
- **Frontend**: Hosted on [Vercel](https://vercel.com)
- **Backend**: Hosted on [Render](https://render.com)
- **Database**: [MongoDB Atlas Cloud](https://www.mongodb.com/cloud/atlas)

---

## 📋 Table of Contents
1. [Prerequisites & Account Setup](#1-prerequisites--account-setup)
2. [Step 1: Commit & Push Code to GitHub](#step-1-commit--push-code-to-github)
3. [Step 2: Deploy Backend to Render](#step-2-deploy-backend-to-render)
4. [Step 3: Deploy Frontend to Vercel](#step-3-deploy-frontend-to-vercel)
5. [Step 4: Connect & Link Services (Environment Variables)](#step-4-connect--link-services-environment-variables)
6. [Step 5: Seed Production Database & Verification](#step-5-seed-production-database--verification)
7. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## 1. Prerequisites & Account Setup
Ensure you have active accounts on:
1. **GitHub**: Repository pushed to `origin/main`.
2. **MongoDB Atlas**: Active cluster URI (`mongodb+srv://...`).
3. **Render**: Free tier account at [render.com](https://render.com).
4. **Vercel**: Free tier account at [vercel.com](https://vercel.com).
5. **Cloudinary** *(Optional but recommended for image uploads)*: Account with `CLOUD_NAME`, `API_KEY`, and `API_SECRET`.
6. **Razorpay** *(Optional for online payments)*: Test/Live key ID & secret.

---

## Step 1: Commit & Push Code to GitHub

Before deploying, ensure your local changes and fixed tests are pushed to your GitHub repository:

```bash
# 1. Check working directory status
git status

# 2. Stage all updated deployment files and test fixes
git add .

# 3. Commit changes
git commit -m "chore: prepare repository for Vercel frontend and Render backend deployment"

# 4. Push to remote repository
git push origin main
```

---

## Step 2: Deploy Backend to Render

### Option A: Using Render Blueprints (Recommended — 1-Click Setup)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository `NS_Choco_Delight_v1`.
4. Render will automatically detect `render.yaml`.
5. Fill in the required secret environment variables (`MONGO_URI`, `CLOUDINARY_*`, `RAZORPAY_*`).
6. Click **Apply**.

---

### Option B: Manual Web Service Setup on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository**.
4. Choose your GitHub repository `NS_Choco_Delight_v1`.
5. Configure the web service:
   - **Name**: `choco-delight-backend` (or your choice)
   - **Region**: Select nearest region (e.g. `Singapore`)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Expand **Advanced** → **Environment Variables** and add:

| Key | Value / Example | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production safeguards |
| `MONGO_URI` | `mongodb+srv://<user>:<pass>@cluster0.mongodb.net/choco-delight?retryWrites=true&w=majority` | Cloud MongoDB Atlas URI |
| `JWT_SECRET` | `your_super_secret_jwt_key_here_2026` | Random secure string |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `ADMIN_SECRET` | `chocoAdmin2024` | Admin signup secret |
| `FRONTEND_URL` | `https://your-app-name.vercel.app` | Vercel frontend domain (update after Vercel deploy) |
| `CLOUDINARY_CLOUD_NAME` | `your_cloudinary_cloud_name` | Cloudinary storage |
| `CLOUDINARY_API_KEY` | `your_cloudinary_api_key` | Cloudinary storage |
| `CLOUDINARY_API_SECRET` | `your_cloudinary_api_secret` | Cloudinary storage |
| `RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxx` | Payment gateway |
| `RAZORPAY_KEY_SECRET` | `your_razorpay_secret` | Payment gateway |

7. Click **Create Web Service**.
8. Note down your backend URL (e.g., `https://choco-delight-backend.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository `NS_Choco_Delight_v1`.
4. Configure Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Expand **Environment Variables** and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://choco-delight-backend.onrender.com/api` *(replace with your Render backend URL)* |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxx` *(your public Razorpay Key ID)* |

6. Click **Deploy**.
7. Once deployment succeeds, copy your live Vercel URL (e.g., `https://ns-choco-delight.vercel.app`).

---

## Step 4: Connect & Link Services (Environment Variables)

To ensure CORS and API authentication work seamlessly between Vercel and Render:

1. Copy your live Vercel URL (e.g. `https://ns-choco-delight.vercel.app`).
2. Go to **Render Dashboard** → Select `choco-delight-backend` → **Environment**.
3. Set `FRONTEND_URL` to your Vercel URL: `https://ns-choco-delight.vercel.app`.
4. Click **Save Changes**. Render will automatically redeploy the backend with updated CORS rules.

---

## Step 5: Seed Production Database & Verification

To populate default products (16 items) and initial admin/customer accounts in your MongoDB Atlas production database:

### Local Seeding Command:
From your local terminal, update `backend/.env` with your production `MONGO_URI` temporarily and run:

```bash
cd backend
npm run seed
npm run seed:admin
```

---

## 🔍 Verification Checklist

- [x] Backend Health Endpoint: `GET https://your-backend.onrender.com/api/health` returns `{ status: "ok" }`.
- [x] Frontend Live App: Browse `https://your-app-name.vercel.app`.
- [x] Login as Admin: Email `nschocodelight333@gmail.com` with password `AdminChoco2026!`.
- [x] Test Customer Order / Custom Chocolate Designer workflow.
