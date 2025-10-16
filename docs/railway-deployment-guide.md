# Railway Multi-Environment Deployment Guide

This guide walks through setting up staging and production environments on Railway for the JIVE Dashboard project.

## Overview

JIVE uses a three-tier deployment strategy:

- **Local Development** - Feature branches on developer machines
- **Staging Environment** - `staging` branch deployed to Railway
- **Production Environment** - `main` branch deployed to Railway

## Recommended Deployment Strategy

**GitHub Actions Test-Gated with Railway Auto-Deploy** - The safest and most reliable approach:

- **JIVE-Staging**: Auto-deploy **ENABLED** ✅
  - Railway auto-deploys on push to staging
  - GitHub Actions runs tests on every push
  - Test visibility in GitHub Actions tab
  - Fast iteration cycle

- **JIVE-Production**: Auto-deploy **DISABLED** ❌
  - Manual deployment control
  - Deploy only when YOU decide
  - Control production release timing
  - Manual "Deploy Now" button in Railway dashboard

**Why This Works:**

1. Push to staging → GitHub Actions runs tests in parallel
2. Railway auto-deploys to staging
3. Test results visible in GitHub Actions
4. When satisfied → Merge staging to main
5. Go to Railway Production → Click "Deploy Now" when ready
6. Production updates on YOUR schedule

**Benefits:**

- ✅ Test visibility in GitHub Actions
- ✅ Fast staging deployments via Railway
- ✅ Consistent CI/CD pipeline
- ✅ Better deployment audit trail

## Prerequisites

- Railway account ([railway.app](https://railway.app/))
- GitHub repository connected to Railway
- Admin access to Railway project

## Step 1: Create Railway Project

1. Log in to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your JIVE repository
5. Railway will create your first service

## Step 2: Configure Production Service

1. **Rename the service** to `JIVE-Production`
2. Go to **Settings** tab
3. Under **Deploy** section:
   - Set **Source Branch** to `main`
   - **DISABLE Auto-Deploy** ❌ (Recommended for production control)
4. Under **Domains** section:
   - Click "Generate Domain" or add custom domain
   - Note the URL (e.g., `jive-production.up.railway.app`)

**Note:** With auto-deploy disabled, you'll manually click "Deploy Now" in Railway dashboard after merging to `main`. This gives you full control over production deployments.

### Production Environment Variables

Add these in the **Variables** tab:

```bash
# Application
NODE_ENV=production

# Next.js Public
NEXT_PUBLIC_WS_URL=wss://jive-production.up.railway.app
NEXT_PUBLIC_MCP_URL=https://jive-production.up.railway.app

# Database (if using Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (if using Railway Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# Authentication (use Railway Secrets)
JWT_SECRET=[generate-secure-secret]
GITHUB_WEBHOOK_SECRET=[your-webhook-secret]
GITHUB_OAUTH_CLIENT_ID=[production-oauth-client-id]
GITHUB_OAUTH_CLIENT_SECRET=[production-oauth-client-secret]
```

## Step 3: Create Staging Service

1. In the same Railway project, click "New Service"
2. Select "Deploy from GitHub repo"
3. Choose the same JIVE repository
4. **Rename the service** to `JIVE-Staging`

### Configure Staging Service

1. Go to **Settings** tab
2. Under **Deploy** section:
   - Set **Source Branch** to `staging`
   - **ENABLE Auto-Deploy** ✅ (Railway will auto-deploy on push)
3. Under **Domains** section:
   - Click "Generate Domain"
   - Note the URL (e.g., `jive-staging.up.railway.app`)

### Staging Environment Variables

Add these in the **Variables** tab (use separate staging credentials):

```bash
# Application
NODE_ENV=staging

# Next.js Public
NEXT_PUBLIC_WS_URL=wss://jive-staging.up.railway.app
NEXT_PUBLIC_MCP_URL=https://jive-staging.up.railway.app

# Database (create separate staging database)
DATABASE_URL=${{Postgres-Staging.DATABASE_URL}}

# Redis (create separate staging Redis)
REDIS_URL=${{Redis-Staging.REDIS_URL}}

# Authentication (use separate staging credentials)
JWT_SECRET=[different-staging-secret]
GITHUB_WEBHOOK_SECRET=[staging-webhook-secret]
GITHUB_OAUTH_CLIENT_ID=[staging-oauth-client-id]
GITHUB_OAUTH_CLIENT_SECRET=[staging-oauth-client-secret]
```

## Step 4: Add Database Services (Optional)

If using Railway-managed databases:

### For Production:

1. Click "New Service" → "Database" → "PostgreSQL"
2. Rename to `Postgres-Production`
3. Link to `JIVE-Production` service
4. Use reference variable: `${{Postgres-Production.DATABASE_URL}}`

### For Staging:

1. Click "New Service" → "Database" → "PostgreSQL"
2. Rename to `Postgres-Staging`
3. Link to `JIVE-Staging` service
4. Use reference variable: `${{Postgres-Staging.DATABASE_URL}}`

Repeat for Redis if needed.

## Step 5: Verify GitHub Actions Test Workflow

The `.github/workflows/deploy-staging.yml` workflow runs tests on every push to staging:

1. **Run on push to staging branch**
2. **Execute all tests:**
   - Type checking (`pnpm type-check`)
   - Linting (`pnpm lint`)
   - Unit tests (`pnpm test`)
   - Build verification (`pnpm build`)

**Workflow file location:** `.github/workflows/deploy-staging.yml`

**Key features:**

- ✅ Test visibility: Full test results in GitHub Actions tab
- ✅ Automatic: Triggered on push to staging branch
- ✅ Parallel with Railway: Tests run while Railway deploys
- ✅ Auditable: Complete test history in GitHub

## Step 6: Configure Health Checks

For both services:

1. Go to **Settings** → **Health Check**
2. Enable health checks
3. Set **Health Check Path** to `/api/health`
4. Set **Health Check Timeout** to 10 seconds
5. Set **Health Check Interval** to 30 seconds

## Step 7: Configure Deployment Settings

For both services, under **Settings** → **Deploy**:

1. **Build Command**: `pnpm build` (auto-detected)
2. **Start Command**: `pnpm start` (auto-detected)
3. **Watch Paths**: Leave default or customize
4. **Auto-Deploy**: **ENABLED** for staging ✅, **DISABLED** for production ❌
5. **Restart Policy**: ON_FAILURE with 3 max retries

## Deployment Workflow

### Deploying to Staging (Test-Gated via GitHub Actions)

1. Create and push feature branch:

   ```bash
   # Create feature branch from staging
   git checkout -b feature/my-feature staging
   # Make changes
   git add .
   git commit -m "Add new feature"
   git push origin feature/my-feature
   ```

2. Create PR to `staging` branch on GitHub
3. Review changes and merge PR
4. **Automatic deployment:**
   - Railway auto-deploys to staging
   - GitHub Actions runs all tests in parallel
   - View test results in GitHub Actions tab
5. Monitor deployment:
   - **GitHub Actions**: View test results
   - **Railway Dashboard**: View deployment status and application logs
6. Test at staging URL: `https://jive-staging.up.railway.app`
7. Verify health check: `https://jive-staging.up.railway.app/api/health`

**Workflow visibility:** View deployment status in your repository's Actions tab

### Promoting to Production

1. Create PR from `staging` to `main`
2. Review all staging changes
3. Get approval and merge
4. **Manually deploy to production:**
   - Go to Railway Dashboard → JIVE-Production service
   - Click **Deployments** tab
   - Click **"Deploy Now"** button
   - Wait for deployment to complete
5. Verify at production URL: `https://jive-production.up.railway.app`
6. Monitor health check and logs

**Why Manual Production Deploy?**

- Deploy on YOUR schedule (off-hours, after team readiness, etc.)
- Final sanity check before going live
- Prevents accidental production deployments
- Control over rollout timing

## Monitoring Deployments

### Railway Dashboard

- **Deployments**: View deployment history and logs
- **Metrics**: CPU, memory, and network usage
- **Logs**: Real-time application logs
- **Health**: Monitor health check status

### GitHub Actions

**CI Workflow** (`.github/workflows/ci.yml`) runs on all branches:

- Linting and formatting
- Type checking
- Unit tests
- Build verification

**Staging Tests Workflow** (`.github/workflows/deploy-staging.yml`) runs on staging branch:

- All CI checks above (type-check, lint, test, build)
- Runs in parallel with Railway auto-deploy
- Full test history in GitHub Actions

### Health Check Monitoring

Monitor both environments:

```bash
# Staging health
curl https://jive-staging.up.railway.app/api/health

# Production health
curl https://jive-production.up.railway.app/api/health
```

Expected response:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-10-15T14:30:00.000Z"
}
```

## Rollback Strategy

If production deployment fails:

1. **Immediate**: Use Railway "Redeploy" previous successful deployment
2. **Code-level**: Revert commit on `main` branch and push
3. **Hotfix**: Create hotfix branch from last known good commit

## Best Practices

1. **Always test in staging first** - Never push directly to production
2. **Use environment-specific secrets** - Don't share credentials between environments
3. **Monitor health checks** - Set up alerts for failing health checks
4. **Keep staging in sync** - Regularly merge main → staging to keep environments aligned
5. **Database migrations** - Test migrations in staging before production
6. **Environment parity** - Keep staging as close to production as possible

## Troubleshooting

### GitHub Actions Deployment Fails

1. **Check GitHub Actions logs:**
   - Go to repository → Actions tab
   - Click on failed workflow run
   - Review test output and deployment logs

2. **Common issues:**
   - **Tests failing**: Fix failing tests to pass CI checks
   - **Build errors**: Verify build works locally

3. **Verify locally:**
   ```bash
   pnpm type-check
   pnpm lint
   pnpm test
   pnpm build
   ```

### Railway Deployment Fails

1. Check Railway logs in dashboard
2. Verify build command runs locally: `pnpm build`
3. Check environment variables are set correctly
4. Ensure branch is correctly configured in Railway settings
5. Verify Railway token has correct permissions

### Health Check Fails

1. Verify endpoint responds: `curl https://your-url.railway.app/api/health`
2. Check application logs for errors
3. Verify service is running and not crashed
4. Check health check settings in Railway dashboard

### Environment Variable Issues

1. Ensure all required variables are set
2. Check for typos in variable names
3. Verify reference variables (`${{Service.VAR}}`) are correct
4. Restart service after adding/changing variables

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [JIVE Project README](../README.md)

## Support

For Railway-specific issues:

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Docs: [docs.railway.app](https://docs.railway.app/)

For JIVE project issues:

- Create an issue in the GitHub repository
- Contact the development team
