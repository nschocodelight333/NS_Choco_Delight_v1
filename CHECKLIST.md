# NS Choco Delight — Pre-Deployment Checklist

Before deploying any new release to production (Vercel frontend / Render backend), verify every check below:

---

### 1. Automated Tests & Build Verification
- [ ] Run backend Jest tests: `cd backend && npm test` -> Must pass 100% (6/6 tests).
- [ ] Run frontend Vite build: `cd frontend && npm run build` -> Must bundle cleanly with 0 errors.

---

### 2. Git & Repository Status
- [ ] Run `git status` -> Confirm working directory is clean or only contains intended release changes.
- [ ] Confirm secret `.env` files are ignored by `.gitignore`.
- [ ] Push to `origin/main`: `git push origin main`.
- [ ] Note commit hash for deployment tracking (`git rev-parse --short HEAD`).

---

### 3. Environment Variables Sync
- [ ] **Render Dashboard**: Confirm `JWT_SECRET`, `MONGO_URI`, `CLOUDINARY_*`, `FRONTEND_URL` match `backend/.env.example`.
- [ ] **Vercel Dashboard**: Confirm `VITE_API_URL` points to live Render URL (`https://your-backend.onrender.com/api`).

---

### 4. Deployment Verification
- [ ] **Render**: Confirm deploy logs show `NS Choco Delight API running on port ...` with matching commit hash.
- [ ] **Vercel**: Confirm deployment status shows **Ready** with matching commit hash.
- [ ] Test live site: Login → Browse Shop → View Special Occasions → Admin Panel access.
