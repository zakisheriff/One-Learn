# Quick Fix Guide for 500 Errors

## Issue
The `/api/courses` endpoint is returning 500 errors, which means the database connection or query is failing.

## Most Common Causes

### 1. Database Schema Not Imported
**Solution:** Import the schema to Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your "One Learn" project
3. Go to **SQL Editor** (left sidebar)
4. Click **New query**
5. Copy the entire contents of `backend/database/schema.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd+Enter)
8. Verify tables were created: Go to **Table Editor** and check for `courses`, `users`, etc.

### 2. Wrong Database URL Format
Your connection string needs to be URL-encoded because it contains special characters (`$`).

**Current:** `postgresql://postgres:Zakizaki$57@db.ugvricsmfynrppimekoj.supabase.co:5432/postgres`

**Should be:** `postgresql://postgres:Zakizaki%2457@db.ugvricsmfynrppimekoj.supabase.co:5432/postgres`

Notice: `$` becomes `%24`

**To fix:**
```bash
# Remove old variable
vercel env rm DATABASE_URL

# Add new one with encoded password
vercel env add DATABASE_URL
# When prompted, paste: postgresql://postgres:Zakizaki%2457@db.ugvricsmfynrppimekoj.supabase.co:5432/postgres
```

### 3. Redeploy After Fixing
```bash
vercel --prod
```

## Quick Test

After redeploying, test the API:
```bash
curl https://your-deployment-url.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "database": {
    "connected": true
  }
}
```

## If Still Not Working

Check Vercel function logs:
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Deployments**
4. Click on the latest deployment
5. Click on **Functions** tab
6. Click on any failed function to see error logs
