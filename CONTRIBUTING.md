# Contributing & Pre-Commit Guidelines

To maintain production stability and prevent regressions in NS Choco Delight, all code contributions (human or AI-agent) must adhere strictly to the following checklist before committing:

---

## 📋 Pre-Commit Mandatory Checklist

- [ ] **No Stray Console Logs**: Remove temporary `console.log` statements from production frontend components and backend controllers.
- [ ] **Error Handling**: Every new API request on frontend must be wrapped in `try-catch` with a clear loading state and toast/fallback error UI.
- [ ] **Schema & Form Field Parity**: Every new field added to a Mongoose model must match frontend form input field names exactly as defined in `API_CONTRACT.md`.
- [ ] **Protected Route Safety**: Every new admin/user endpoint in `backend/routes/` must explicitly apply `protect` and `adminOnly` middleware.
- [ ] **Automated Tests**: New features or bug fixes must include corresponding tests in `backend/tests/`.
- [ ] **Vite Production Build**: Run `npm run build` in `frontend/` to verify zero bundling or JSX syntax errors.
- [ ] **Session Protection**: Never trigger `localStorage.clear()` or `window.location.href = '/login'` inside global response interceptors for public API endpoints.
