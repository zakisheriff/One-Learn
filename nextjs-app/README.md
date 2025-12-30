# One Learn - Next.js App

This is the Next.js 14 version of One Learn with App Router architecture.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your backend URL and Google Client ID

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Structure

```
app/
├── layout.js                # Root layout with providers
├── page.js                  # Homepage ✅
├── login/page.js            # Login page ✅
├── explore/page.js          # Course catalog ✅
├── components/              # Shared components ✅
├── contexts/                # Auth & Language contexts ✅
├── styles/                  # All 27 CSS files ✅
└── ... (other routes)
```

## ✅ Completed

- [x] Next.js 14 setup
- [x] All components migrated
- [x] Global styles & design system
- [x] Auth & Language contexts
- [x] Navbar & Footer
- [x] Homepage with all sections
- [x] Login page
- [x] Explore page
- [x] Route directories created

## 📝 To Complete

Convert remaining pages from `app/pages/` to their respective routes:
- `Dashboard.js` → `dashboard/page.js`
- `CourseDetail.js` → `course/[slug]/page.js`
- `CourseViewer.js` → `course/[slug]/learn/page.js`
- `QuizPage.js` → `course/[slug]/quiz/page.js`
- `CertificatePage.js` → `course/[slug]/certificate/page.js`
- And more...

Each needs:
1. Add `'use client';` at top
2. Update imports (use `../../` paths)
3. Replace `useNavigate()` with `useRouter()` from `next/navigation`
4. Replace `<Link to="">` with `<Link href="">`
5. Use `useParams()` for dynamic routes

## 🔧 Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 🛠️ Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint
```

## 📖 Migration Notes

- All components use `'use client'` directive
- React Router replaced with Next.js Link and routing
- Axios configured in AuthContext
- CSS preserved exactly as-is
- Glass effects and dark theme intact

## 🌐 Deployment

Deploy to Vercel:
```bash
vercel
```

Or build for production:
```bash
npm run build
npm start
```