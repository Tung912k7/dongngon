# DEPLOYMENT.md — Safe Deployment Guide

> Follow this checklist before deploying to production. Each step must pass before proceeding to the next.

---

## 🔴 Pre-Deployment Checklist (REQUIRED)

### Phase 1: Local Verification ✅

- [ ] Pull latest code: `git pull origin main`
- [ ] Install dependencies: `npm install`
- [ ] All tests pass: `npm run test:unit` (0 failures)
- [ ] No lint errors: `npm run lint` (0 errors, warnings allowed)
- [ ] Code formatted: `npm run format:check` (0 issues)
- [ ] Build succeeds: `npm run build` (no errors)
- [ ] No console errors/warnings in dev: `npm run dev` (5 min spot check)

**If any step fails:** Fix it locally and re-test before proceeding.

---

### Phase 2: Environment Check ✅

Verify all required env vars are set in production:

```bash
# Production variables (must be set in Vercel)
NEXT_PUBLIC_SUPABASE_URL          # ✅ Required
NEXT_PUBLIC_SUPABASE_ANON_KEY     # ✅ Required
SUPABASE_SERVICE_ROLE_KEY         # ✅ Required (server-only)
NEXT_PUBLIC_POSTHOG_KEY           # ✅ Required
NEXT_PUBLIC_POSTHOG_HOST          # ✅ Required
```

**Verification:**
- [ ] Log into Vercel dashboard → Project Settings → Environment Variables
- [ ] Confirm all 5 vars are present
- [ ] No typos in variable names
- [ ] No quotes around values (Vercel strips them)

**If missing:** Add to Vercel, then redeploy.

---

### Phase 3: Database Health Check ✅

Before deploying code that modifies the database:

- [ ] Supabase dashboard is accessible
- [ ] No ongoing migrations or issues
- [ ] Backup exists (Vercel auto-backups, but verify)
- [ ] Row-level security (RLS) policies are correct
- [ ] No blocked/suspicious queries in PostgREST logs

**Check command** (in Supabase dashboard):
```sql
-- Verify main tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should include: users, works, votes, notifications, etc.
```

**If issues found:** Pause deployment, notify team, investigate.

---

### Phase 4: Code Review Check ✅

- [ ] PR approved by at least 1 reviewer
- [ ] No sensitive data in code (API keys, passwords)
- [ ] No hardcoded URLs (use env vars)
- [ ] All new dependencies reviewed
- [ ] No breaking changes to existing APIs

---

## 🟡 Staging Deployment (Optional but Recommended)

If deploying major changes, test on staging first:

1. Push to `staging` branch
2. Vercel auto-deploys to staging URL
3. Run 5-minute smoke test:
   - [ ] Homepage loads
   - [ ] Can log in
   - [ ] Can create work
   - [ ] Can vote/save
   - [ ] Core flows work end-to-end
4. Check Sentry/PostHog for errors
5. If all good, proceed to production

---

## 🟢 Production Deployment

### On Vercel (Automatic)

**Trigger deployment:**
```bash
# Merge PR to main branch
git checkout main
git pull
git merge feature/branch-name
git push origin main

# Vercel automatically detects and deploys
# Monitor: https://vercel.com/dashboard/project/dongngon
```

**Wait for:**
- [ ] Build succeeds (green checkmark)
- [ ] Preview deployed successfully
- [ ] Production deployment starts (usually 2-5 min)
- [ ] No build errors in Vercel logs

### Monitor Deployment

During deployment (first 10 minutes):

```bash
# Terminal 1: Watch Vercel logs
# (Go to Vercel dashboard → Project → Deployments → Latest)

# Terminal 2: Check production site
# Open https://dongngon.vercel.app (or your domain)
# Verify homepage loads
# Check network tab for 200 status codes
```

---

## 🟢 Post-Deployment Verification (CRITICAL)

### Immediate Check (Next 5 minutes)

- [ ] Website loads without errors
- [ ] No 500 errors in browser console
- [ ] Database connections work (check /api/health if exists)
- [ ] Auth flow works (login, logout)
- [ ] Core features work:
  - [ ] Can view works list
  - [ ] Can search/filter
  - [ ] Can create new work (if owner account)
  - [ ] Can vote/save work
  - [ ] Can view profile

### Health Metrics Check (5-30 minutes)

Check these dashboards:

1. **PostHog Analytics:**
   - [ ] Login to https://posthog.com
   - [ ] Check "Events" dashboard
   - [ ] Verify events are firing (not all empty)
   - [ ] Look for error spikes (should be ~0)

2. **Vercel Analytics:**
   - [ ] Go to project → Analytics
   - [ ] Check response times (should be <1s for most endpoints)
   - [ ] Look for 5xx errors (should be 0)
   - [ ] Check edge function status (green)

3. **Browser DevTools:**
   - [ ] Open production site
   - [ ] Press F12 → Console tab
   - [ ] Should have 0 errors (warnings OK)
   - [ ] Check Network tab (no failed requests)
   - [ ] Check Performance (LCP < 2.5s)

### Database Health Check (15-30 minutes)

```sql
-- Run in Supabase SQL Editor

-- Check recent errors
SELECT * FROM your_error_logs 
WHERE created_at > now() - interval '30 minutes'
ORDER BY created_at DESC
LIMIT 10;

-- Check if any tables have issues
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 🚨 Rollback Procedure

If production deployment has critical errors:

### Option 1: Revert Last Commit (Fastest)
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys the reverted version (2-3 min)
```

### Option 2: Deploy Previous Working Build
1. Go to Vercel dashboard
2. Find the last working deployment
3. Click "..." → Redeploy
4. Wait for build to complete

### Option 3: Manual Database Rollback (If needed)
1. Log into Supabase
2. Go to Database → Backups
3. Restore to pre-deployment backup
4. Notify team of downtime

**Notify immediately:**
- [ ] Post in team chat
- [ ] Update status page
- [ ] Document what went wrong
- [ ] Create issue for investigation

---

## 📊 Monitoring After Deployment

### First 24 Hours

- [ ] Monitor error rates (Sentry if configured)
- [ ] Monitor analytics (PostHog)
- [ ] Monitor uptime
- [ ] Check for unusual traffic patterns
- [ ] Spot-check user reports in feedback

### Daily (First Week)

- [ ] Run `npm run test:unit` to ensure tests still pass
- [ ] Check database query performance
- [ ] Review PostHog for new user journeys
- [ ] Monitor for 4xx/5xx error spikes

### Weekly

- [ ] Review analytics dashboard
- [ ] Monitor Core Web Vitals
- [ ] Check for deprecation warnings
- [ ] Plan next deployment

---

## 🔧 Troubleshooting Common Issues

### Issue: 500 Error After Deployment

**Diagnosis:**
1. Check Vercel logs for build errors
2. Check browser console for client-side errors
3. Check Supabase dashboard for connection issues

**Fix:**
```bash
# Option A: Rollback
git revert HEAD && git push origin main

# Option B: Check env vars
# Verify NEXT_PUBLIC_SUPABASE_URL is set in Vercel
# Redeploy after fixing

# Option C: Check database
# Verify Supabase is accessible and not overloaded
```

### Issue: Slow Performance After Deployment

**Diagnosis:**
1. Check bundle size (build logs show this)
2. Check database query times
3. Check image optimization

**Fix:**
```bash
# Run bundle analyzer
npm run build -- --analyze

# Look for large dependencies
# If found, consider removing or finding smaller alternative
```

### Issue: Database Connection Timeout

**Diagnosis:**
1. Check Supabase status page
2. Verify connection pooling settings
3. Check if query is stuck

**Fix:**
```sql
-- Kill stuck queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' AND query_start < now() - interval '10 minutes';
```

---

## 📋 Deployment Sign-Off Template

Use this when deploying to production:

```
DEPLOYMENT: [Feature Name]
Deployed: [Date/Time]
Deployer: [Your Name]
Reviewed By: [Reviewer Name]

✅ All tests pass
✅ No console errors
✅ Environment vars verified
✅ Database healthy
✅ Staging tested (if applicable)

Post-Deployment Verified:
✅ Site loads without errors
✅ Core features work
✅ No error spikes in PostHog
✅ Response times normal

Notes: [Any unusual behavior, known issues, etc.]
```

---

## 🎯 Success Criteria

Deployment is successful when:

```
✅ No build errors in Vercel
✅ All pre-deploy checks passed
✅ Site loads and responds to requests
✅ No new errors in PostHog (same error rate as before)
✅ All core features work as expected
✅ Response times < 2s (p50)
✅ Database queries complete in < 500ms
✅ No unusual traffic/error patterns
```

---

## 📞 Emergency Contacts

If deployment fails critically:

1. **First:** Check if it's a known issue (ask team)
2. **Second:** Rollback immediately (don't spend > 15 min troubleshooting live)
3. **Third:** Investigate root cause in non-production environment
4. **Fourth:** Fix locally, test thoroughly, redeploy

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **PostHog Analytics:** https://posthog.com
- **GitHub Repo:** [Your repo URL]
- **Staging Site:** https://staging-dongngon.vercel.app
- **Production Site:** https://dongngon.vercel.app

---

**Last Updated:** 2026-05-21  
**Next Review:** 2026-06-21
