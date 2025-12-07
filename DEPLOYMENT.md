# Vercel + Supabase Deployment Guide

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: One Learn
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for setup to complete

### 1.2 Import Database Schema
1. In your Supabase project, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `backend/database/schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute
6. Verify tables were created: Go to **Table Editor** and check for tables

### 1.3 Get Connection String
1. Go to **Project Settings** → **Database**
2. Scroll to "Connection string"
3. Select "URI" tab
4. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@...`)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Save this for later - you'll need it for Vercel

## Step 2: Prepare Your Code for Deployment

### 2.1 Install Dependencies
```bash
cd /Users/afraasheriff/Desktop/Projects_List/One-Learn
npm install
cd frontend
npm install
cd ..
```

### 2.2 Update Frontend API Configuration
The frontend is already configured to work with Vercel's API routes.

### 2.3 Test Build Locally
```bash
cd frontend
npm run build
```

## Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### 3.2 Login to Vercel
```bash
vercel login
```

### 3.3 Deploy
```bash
cd /Users/afraasheriff/Desktop/Projects_List/One-Learn
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → one-learn (or your preferred name)
- **Directory?** → `./` (current directory)
- **Override settings?** → No

### 3.4 Add Environment Variables
```bash
vercel env add DATABASE_URL
```
Paste your Supabase connection string when prompted.

Repeat for each variable:
```bash
vercel env add JWT_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GEMINI_API_KEY
vercel env add FRONTEND_URL
vercel env add NODE_ENV
```

Or add them via the Vercel dashboard:
1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add each variable from `.env.example`

### 3.5 Deploy to Production
```bash
vercel --prod
```

## Step 4: Configure Custom Domain

### 4.1 Add Domain in Vercel
1. Go to your project on Vercel
2. Click **Settings** → **Domains**
3. Enter `onelearn.theoneatom.com`
4. Click "Add"

### 4.2 Update DNS Records
Vercel will show you the DNS records to add. You'll need to add:

**For subdomain (onelearn.theoneatom.com):**
- Type: `CNAME`
- Name: `onelearn`
- Value: `cname.vercel-dns.com`

Go to your domain registrar (where you bought theoneatom.com) and add this record.

### 4.3 Wait for DNS Propagation
- DNS changes can take 1-48 hours to propagate
- Vercel will automatically provision SSL certificate once DNS is verified
- You can check status in Vercel dashboard

### 4.4 Update Environment Variable
Once your domain is active, update the `FRONTEND_URL`:
```bash
vercel env add FRONTEND_URL production
```
Enter: `https://onelearn.theoneatom.com`

Then redeploy:
```bash
vercel --prod
```

## Step 5: Migrate Data from Railway (Optional)

If you have existing data on Railway:

### 5.1 Export from Railway
```bash
# Connect to Railway database
railway login
railway link
railway run psql $DATABASE_URL

# Export data
\copy users TO 'users.csv' CSV HEADER;
\copy courses TO 'courses.csv' CSV HEADER;
# ... export other tables
```

### 5.2 Import to Supabase
1. Go to Supabase **Table Editor**
2. Select each table
3. Click "Insert" → "Import data from CSV"
4. Upload your CSV files

## Step 6: Verify Deployment

### 6.1 Test Endpoints
```bash
# Health check
curl https://onelearn.theoneatom.com/api/health

# Get courses
curl https://onelearn.theoneatom.com/api/courses
```

### 6.2 Test in Browser
1. Visit `https://onelearn.theoneatom.com`
2. Register a new account
3. Browse courses
4. Enroll in a course
5. Take a quiz
6. Generate certificate

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Check Supabase project is active
- Ensure connection pooling is enabled in Supabase

### API Errors
- Check Vercel function logs: `vercel logs`
- Verify all environment variables are set
- Check CORS settings in `vercel.json`

### Custom Domain Not Working
- Verify DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Check domain status in Vercel dashboard

## Post-Deployment

### Update README
Update the live demo URL in `README.md`:
```markdown
**[🌐 Visit Live Site: https://onelearn.theoneatom.com](https://onelearn.theoneatom.com)**
```

### Monitor Performance
- Check Vercel Analytics dashboard
- Monitor Supabase database usage
- Set up error tracking (optional: Sentry)

### Backup Database
- Supabase provides automatic backups
- For manual backups, use `pg_dump` regularly

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Check function logs: `vercel logs --follow`
