# You Learn - Free Certified Learning Platform

A 100% free, certificate-granting Learning Management System that uses YouTube educational content with AI-powered quiz generation via Google's Gemini API.

![You Learn Platform](/Users/afraasheriff/.gemini/antigravity/brain/ad74dd8f-d5bb-44f9-82b6-340a3cd31190/architecture_diagram_1764321439440.png)

## Features

- ✅ **100% Free** - No paywalls, all courses and certificates are completely free
- 🎓 **Verified Certificates** - Earn certificates with unique verification IDs
- 🤖 **AI-Powered Quizzes** - Automated quiz generation using Gemini API
- 🔐 **Secure Authentication** - Bcrypt password hashing + Google OAuth 2.0
- 📱 **Apple-Inspired Design** - Minimalist, liquid glass aesthetic
- 🎥 **YouTube Integration** - Learn from curated YouTube content
- 🔗 **LinkedIn Sharing** - Share certificates directly to LinkedIn

## Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **PostgreSQL** - Relational database
- **Bcrypt** - Password hashing (10 salt rounds)
- **JWT** - Session management via HttpOnly cookies
- **Google OAuth 2.0** - Third-party authentication
- **Gemini API** - AI quiz generation
- **PDFKit** - Certificate PDF generation

### Frontend
- **React.js** - UI framework (functional components)
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Pure CSS** - No utility frameworks (Apple-inspired design)
- **Vite** - Build tool and dev server

## Project Structure

```
YouLearn/
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── database/
│   │   ├── connection.js         # PostgreSQL connection pool
│   │   └── schema.sql            # Database schema
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── courseController.js   # Course management
│   │   ├── enrollmentController.js
│   │   ├── quizController.js
│   │   └── certificateController.js
│   ├── services/
│   │   ├── geminiService.js      # AI quiz generation
│   │   └── certificateService.js # PDF generation
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   └── routes/
│       ├── authRoutes.js
│       ├── courseRoutes.js
│       ├── enrollmentRoutes.js
│       ├── quizRoutes.js
│       ├── certificateRoutes.js
│       └── adminRoutes.js
│
└── frontend/
    ├── src/
    │   ├── App.jsx               # Main app with routing
    │   ├── main.jsx              # React entry point
    │   ├── pages/
    │   │   ├── LoginPage.jsx     # Dual auth (regular + OAuth)
    │   │   ├── CourseCatalog.jsx # Public course listing
    │   │   ├── CourseDetail.jsx  # Course info + enrollment
    │   │   ├── Dashboard.jsx     # User dashboard
    │   │   ├── CourseViewer.jsx  # Video player + sidebar
    │   │   ├── QuizPage.jsx      # Quiz interface
    │   │   ├── CertificatePage.jsx
    │   │   └── VerifyPage.jsx    # Public verification
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── CourseCard.jsx
    │   └── styles/
    │       ├── variables.css     # Design system tokens
    │       ├── global.css
    │       └── [component].css
    └── index.html
```

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Google Cloud Account** (for OAuth and Gemini API)

### 1. Clone and Install

```bash
cd /Users/afraasheriff/Desktop/Projects_List/YouLearn

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb youlearn

# Run schema migration
psql youlearn < backend/database/schema.sql
```

### 3. Environment Configuration

#### Backend (.env)

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Update the following values:

```env
# Database
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/youlearn

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Google OAuth 2.0
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini API
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key

# Application
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

### 4. Google Cloud Setup

#### OAuth 2.0 Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen
6. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - Your production domain (when deploying)
7. Copy **Client ID** and **Client Secret** to `.env`

#### Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Copy to `.env` as `GEMINI_API_KEY`

### 5. Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## Usage Guide

### For Students

1. **Browse Courses** - Visit homepage to see all available courses
2. **Sign Up** - Create account with email/password or Google OAuth
3. **Enroll** - Click "Enroll for Free" on any course
4. **Learn** - Watch YouTube lessons and mark them complete
5. **Take Quiz** - Complete all lessons, then take the final quiz (80% to pass)
6. **Get Certificate** - Download PDF or share to LinkedIn

### For Admins

Admins can create courses and generate quizzes using the admin endpoints.

#### Create a Course

```bash
POST /api/admin/courses
Authorization: Required (admin email)

{
  "slug": "intro-to-python",
  "title": "Introduction to Python",
  "description": "Learn Python programming from scratch",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "modules": [
    {
      "title": "Python Basics",
      "description": "Variables, data types, operators",
      "lessons": [
        {
          "title": "Variables and Data Types",
          "youtubeUrl": "https://www.youtube.com/watch?v=...",
          "duration": 600
        }
      ]
    }
  ]
}
```

#### Generate Quiz with Gemini

```bash
POST /api/admin/generate-quiz
Authorization: Required (admin email)

{
  "courseId": "uuid-of-course",
  "videoUrls": [
    "https://www.youtube.com/watch?v=...",
    "https://www.youtube.com/watch?v=..."
  ]
}
```

The Gemini API will analyze the video content and generate:
- 5 Multiple Choice questions
- 3 True/False questions
- 2 Fill-in-the-Blank questions

#### Publish Course

```bash
PATCH /api/admin/courses/:id/publish
Authorization: Required (admin email)

{
  "published": true
}
```

## API Documentation

### Public Endpoints

- `GET /api/courses` - List all published courses
- `GET /api/courses/:slug` - Get course details (syllabus only)
- `GET /verify?id=hash` - Verify certificate

### Authentication Endpoints

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Protected Endpoints (Require Authentication)

- `GET /api/courses/:slug/content` - Get full course content with videos
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments` - Get user enrollments
- `PUT /api/enrollments/:id/progress` - Update lesson progress
- `GET /api/courses/:slug/quiz` - Get quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/certificates` - Get all user certificates
- `GET /api/certificates/:courseId` - Get specific certificate
- `GET /api/certificates/:courseId/download` - Download PDF

## Security Features

- ✅ **Bcrypt Password Hashing** - 10 salt rounds
- ✅ **HttpOnly Cookies** - Prevents XSS attacks on JWT tokens
- ✅ **CSRF Protection** - SameSite cookie policy
- ✅ **CORS Configuration** - Whitelist frontend origin
- ✅ **Rate Limiting** - Prevents brute force attacks
- ✅ **Helmet.js** - Security headers
- ✅ **Input Validation** - Server-side validation on all endpoints

## Design System

The UI follows Apple's design principles with a custom CSS implementation:

- **Liquid Glass Effect**: `backdrop-filter: blur(20px)` on overlays
- **Minimal Elevation**: Soft shadows without harsh borders
- **System Fonts**: `-apple-system, BlinkMacSystemFont`
- **Color Palette**: Whites, grays, charcoal, with accent color #0071e3
- **Responsive**: Mobile-first approach with breakpoints

## Certificate Verification

All certificates include a unique SHA-256 hash for verification. Anyone can verify a certificate at:

```
https://youlearn.com/verify?id=[verification-hash]
```

The verification page displays:
- Recipient name
- Course title
- Completion date
- Issuing organization
- Issuance date

## Deployment

### Backend Deployment (Example: Railway/Render)

1. Set environment variables in hosting platform
2. Ensure `DATABASE_URL` points to production PostgreSQL
3. Set `NODE_ENV=production`
4. Update `FRONTEND_URL` to production domain
5. Deploy from `backend` directory

### Frontend Deployment (Example: Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Deploy `dist` folder
3. Configure environment variable: `VITE_API_URL=https://your-api-domain.com`
4. Set up redirects for SPA routing

## License

MIT License - 100% Free and Open Source

## Support

For issues or questions, please open an issue on GitHub or contact support.

---

**Built with ❤️ for free education**
