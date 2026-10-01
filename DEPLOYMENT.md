# Deployment Checklist — BIO BALANCE

## Pre-Deployment (Local)

### Code Quality
- [ ] Run `npm run lint` — ensure no TypeScript errors
- [ ] Run `npm run build` — verify production build succeeds
- [ ] Run `npm run preview` — test production build locally
- [ ] Review recent commits — no debugging code, console.log, or hardcoded secrets
- [ ] Check `.env.example` — all required vars documented

### Environment & Secrets
- [ ] Confirm `.gitignore` includes `.env.local`, `node_modules/`, `dist/`
- [ ] Firebase config (`firebase-applet-config.json`) is **NOT** committed if it contains real keys
- [ ] `.env` files are never pushed; only `.env.example` with placeholders
- [ ] All sensitive values (API keys, auth tokens) are in Vercel secrets, not code

### Dependencies
- [ ] `npm audit` — no critical vulnerabilities
- [ ] `package.json` locked — run `npm ci` locally to test lock integrity
- [ ] Dev vs prod dependencies correct — no dev deps shipped to production

### Git History
- [ ] Commit messages are clear and descriptive
- [ ] No merge conflicts in `main` branch
- [ ] Remote `main` is up-to-date: `git pull origin main`

---

## GitHub Setup

### Repository Configuration
- [ ] Repo visibility set correctly (public/private as intended)
- [ ] Branch protection on `main`:
  - Require pull request reviews before merge
  - Require status checks to pass (if CI/CD enabled)
  - Require branches to be up to date before merge
- [ ] Default branch is `main`

### Secrets & Variables
- [ ] Add all Firebase secrets as **Repository Secrets**:
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`
  - Any other sensitive `.env` variables
- [ ] **Do NOT** store secrets in `.env.example` or code

### Documentation
- [ ] `README.md` is current and accurate
- [ ] Deployment section added (link to Vercel)
- [ ] Environment setup documented
- [ ] Contributing guidelines clear (if open source)

---

## Vercel Deployment

### Project Setup
- [ ] Connect GitHub repo to Vercel (authorize Vercel app on GitHub)
- [ ] Import project — Vercel auto-detects Vite config
- [ ] Framework preset: **Vite**
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm ci`

### Environment Variables (Vercel Dashboard)
- [ ] Add each secret from `.env.example` as **Environment Variable**:
  - Add to **Production**, **Preview**, and **Development** as needed
  - Example: `VITE_FIREBASE_API_KEY=xxx`
- [ ] Prefix client-side vars with `VITE_` (Vite convention)
- [ ] Backend/server-only vars do **NOT** need `VITE_` prefix
- [ ] Save and redeploy after adding env vars

### Deployment Configuration
- [ ] Root directory: `/` (or correct path if monorepo)
- [ ] Node.js version: 18+ (matches `package.json`)
- [ ] Enable **Automatic deployments** on `main` branch push
- [ ] Disable auto-deploy for other branches (or keep as preview)
- [ ] Production domain configured (custom domain or Vercel default)

### Build & Test
- [ ] Trigger manual deploy to Production
- [ ] Check build logs — no errors or warnings
- [ ] Verify production URL loads without errors
- [ ] Test core user flows (navigation, auth, data operations)
- [ ] Check browser console — no 404s, CORS errors, or unhandled exceptions
- [ ] Inspect Network tab — all assets loaded (CSS, JS, images)

### Performance & Security
- [ ] Lighthouse audit on production URL (target: 90+ scores)
- [ ] Check SSL/TLS certificate (Vercel auto-generates)
- [ ] Review security headers in Vercel deployment settings
- [ ] Test on mobile and desktop browsers

---

## Post-Deployment

### Monitoring
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up error tracking (Sentry, LogRocket, etc. — optional)
- [ ] Monitor build logs for failures
- [ ] Check Vercel deployment dashboard for slowness or errors

### Testing
- [ ] Smoke test all major routes and features
- [ ] Test on slow network (DevTools throttling)
- [ ] Verify redirects and fallbacks work (404 → `index.html`)
- [ ] Confirm cookies and localStorage work across sessions

### Documentation & Rollback
- [ ] Document the deployed URL and commit SHA
- [ ] Create a tag for this release: `git tag v1.0.0 && git push origin v1.0.0`
- [ ] Keep rollback plan ready (Vercel redeploy from previous commit)
- [ ] Notify team of live status

---

## Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Ensure all env vars are set in Vercel dashboard
- Run `npm run build` locally to replicate

### 404 on Subpages (Hash Routing)
- Confirm `vercel.json` has rewrite rule: `{"source": "/(.*)", "destination": "/index.html"}`
- Vercel should serve `index.html` for all routes; the client router handles the rest

### Env Vars Not Loaded
- Prefix client vars with `VITE_` in Vite config
- Access as `import.meta.env.VITE_*` in code
- Rebuild after adding/changing vars in Vercel

### Slow Performance
- Check Vercel deployment region (should match user base)
- Run Lighthouse; optimize images, fonts, and bundle size
- Enable caching headers for static assets

---

## Checklist Summary

**Before Push:**
- ✓ No errors: `npm run lint && npm run build`
- ✓ No secrets in code
- ✓ `.gitignore` is correct

**GitHub:**
- ✓ Branch protection enabled
- ✓ Secrets configured
- ✓ README up-to-date

**Vercel:**
- ✓ Repo connected
- ✓ Build settings correct (`vite build` → `dist`)
- ✓ Env vars configured
- ✓ Automatic deployments enabled
- ✓ Production domain set
- ✓ Manual test passed

**After Deploy:**
- ✓ Smoke tests pass
- ✓ No console errors
- ✓ Tag/release created
- ✓ Team notified

---

## Quick Reference Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Firebase Setup](https://firebase.google.com/docs/web/setup)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated:** 2026-10-01  
**Maintained By:** Development Team
