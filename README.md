# <div align="center">One Learn</div>

<div align="center">
<strong>100% Free, AI-Powered Learning Platform with Verified Certificates</strong>
</div>

<br />

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

<a href="https://you-learn-production.up.railway.app">
<img src="https://img.shields.io/badge/View%20Live%20Demo-Click%20Here-0071e3?style=for-the-badge&logo=safari&logoColor=white" height="50" />
</a>

<br />
<br />

**[🌐 Visit Live Site: https://you-learn-production.up.railway.app](https://you-learn-production.up.railway.app)**

</div>

<br />

> **"Learning should be free for everyone."**
>
> You Learn isn't just another LMS; it's a movement toward accessible education.  
> Powered by AI and designed with Apple's aesthetic philosophy, it transforms YouTube content into structured, certified learning experiences.

---

## 🌟 Vision

You Learn's mission is to be:

- **A completely free learning platform** — no paywalls, no subscriptions, ever
- **An AI-powered education system** using Google's Gemini for intelligent assessments
- **A beautiful, modern web application** with Apple-inspired design language

---

## ✨ Why You Learn?

Traditional online courses are expensive and gatekeep education behind paywalls.  
You Learn democratizes learning by making **every course, every quiz, and every certificate 100% free**.

---

## 🎨 Apple-Inspired "Liquid Glass" Design

- **Minimalist Aesthetics**  
  Pure CSS implementation following Apple's design principles — no frameworks, just elegance.

- **Liquid Glass Effects**  
  Translucent overlays with `backdrop-filter: blur()` create depth and focus.

- **Soft Elevation**  
  Subtle shadows and smooth transitions provide a premium feel.

- **System Fonts**  
  Native `-apple-system` typography for maximum legibility and native feel.

---

## 🤖 AI-Powered Intelligence

- **Gemini API Integration**  
  Automatically generates quizzes from YouTube video content.

- **Smart Assessment**  
  10-question quizzes with multiple choice, true/false, and fill-in-the-blank formats.

- **Intelligent Scoring**  
  Case-insensitive evaluation with detailed feedback.

- **80% Passing Threshold**  
  Ensures learners truly understand the material before certification.

---

## 🔐 Enterprise-Grade Security

- **Bcrypt Password Hashing**  
  10 salt rounds for maximum security.

- **HttpOnly JWT Cookies**  
  Prevents XSS attacks on authentication tokens.

- **Google OAuth 2.0**  
  Secure third-party authentication option.

- **CSRF Protection**  
  SameSite cookie policy and rate limiting.

---

## 🎓 Complete Learning Experience

- **YouTube Integration**  
  Learn from the best educational content on the web.

- **Smart Navigation**  
  Collapsible sidebar with independent scrolling and progress indicators.

- **Progress Tracking**  
  Visual progress bars and lesson completion tracking.

- **Verified Certificates**  
  Professional PDF certificates with SHA-256 verification hashes.

- **LinkedIn Sharing**  
  Share achievements directly to your professional network.

- **Public Verification**  
  Anyone can verify certificate authenticity via unique URLs.

---

## 📁 Project Structure

```
YouLearn/
├── backend/                      # Node.js + Express API
│   ├── server.js                 # Express server entry point
│   ├── database/
│   │   ├── connection.js         # PostgreSQL connection pool
│   │   └── schema.sql            # Complete database schema
│   ├── controllers/              # Business logic
│   │   ├── authController.js     # Authentication (Bcrypt + JWT + OAuth)
│   │   ├── courseController.js   # Course management
│   │   ├── quizController.js     # Quiz handling & scoring
│   │   ├── certificateController.js # Certificate generation & verification
│   │   └── enrollmentController.js # Progress tracking & enrollment logic
│   ├── services/
│   │   ├── geminiService.js      # AI quiz generation
│   │   └── certificateService.js # PDF generation
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   └── routes/                   # API endpoints
│
└── frontend/                     # React + Vite SPA
    ├── src/
    │   ├── App.jsx               # Main app with routing
    │   ├── pages/                # All application pages
    │   │   ├── HomePage.jsx      # Landing page
    │   │   ├── LoginPage.jsx     # Dual auth (Email + Google)
    │   │   ├── CourseCatalog.jsx # Public course browsing
    │   │   ├── CourseDetail.jsx  # Course syllabus & enrollment
    │   │   ├── Dashboard.jsx     # User dashboard
    │   │   ├── CourseViewer.jsx  # Video player + sidebar
    │   │   ├── QuizPage.jsx      # Assessment interface
    │   │   ├── CertificatePage.jsx # Certificate view & download
    │   │   ├── VerifyPage.jsx    # Public certificate verification
    │   │   ├── SettingsPage.jsx  # User profile settings
    │   │   └── HelpCenter.jsx    # Support & FAQs
    │   ├── components/           # Reusable components
    │   └── styles/               # Pure CSS (Apple-inspired)
    │       ├── variables.css     # Design system tokens
    │       └── [component].css
    └── index.html
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v14+)
- **Google Cloud Account** (for OAuth & Gemini API)

### 1. Clone the Repository

```bash
git clone https://github.com/zakisheriff/One-Learn.git
cd One-Learn
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Database Setup

```bash
# Create database
createdb youlearn

# Run migrations
psql youlearn < backend/database/schema.sql
```

### 4. Environment Configuration

Create `backend/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/youlearn
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

### 5. Run the Application

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 🎯 Key Features

### For Students

✅ **Browse Courses** — Explore free courses without signing up  
✅ **Dual Authentication** — Email/password or Google OAuth  
✅ **Video Learning** — Embedded YouTube lessons with progress tracking  
✅ **Distraction-Free Learning** — Optimized video player with no suggestions  
✅ **AI Quizzes** — Intelligent assessments generated from video content  
✅ **Verified Certificates** — Download PDFs or share to LinkedIn  
✅ **Self-Healing System** — Robust progress tracking and status recovery  

### For Admins

✅ **Course Creation** — Structured modules and lessons  
✅ **AI Quiz Generation** — Automatic quiz creation via Gemini API  
✅ **Publishing Control** — Manage course visibility  

---

## 🔧 Tech Stack

### Backend
- **Node.js** + **Express.js** — REST API server
- **PostgreSQL** — Relational database with ACID compliance
- **Bcrypt** — Password hashing (10 salt rounds)
- **JWT** — Session management via HttpOnly cookies
- **Google OAuth 2.0** — Third-party authentication
- **Gemini API** — AI-powered quiz generation
- **PDFKit** — Certificate PDF generation

### Frontend
- **React.js** — Modern UI framework
- **React Router** — Client-side routing
- **Axios** — HTTP client
- **Pure CSS** — No frameworks, Apple-inspired design
- **Vite** — Lightning-fast build tool

---

## 📊 Database Schema

8 core tables with proper relationships:

- **users** — Authentication with Bcrypt hashing
- **courses** — Course metadata and structure
- **modules** — Course sections
- **lessons** — Individual YouTube lessons
- **quizzes** — AI-generated assessments (JSONB)
- **enrollments** — User progress tracking
- **quiz_attempts** — Submission history
- **certificates** — Verifiable certificates with SHA-256 hashes

---

## 🔒 Security Features

✅ **Bcrypt Password Hashing** — Industry-standard encryption  
✅ **HttpOnly Cookies** — XSS attack prevention  
✅ **CSRF Protection** — SameSite cookie policy  
✅ **Rate Limiting** — Brute force prevention  
✅ **Helmet.js** — Security headers  
✅ **Input Validation** — Server-side validation on all endpoints  

---

## 📜 API Documentation

### Public Endpoints
- `GET /api/courses` — List all courses
- `GET /api/courses/:slug` — Course details
- `GET /verify?id=hash` — Verify certificate

### Authentication
- `POST /api/auth/register` — Sign up
- `POST /api/auth/login` — Sign in
- `POST /api/auth/google` — Google OAuth
- `POST /api/auth/logout` — Sign out

### Protected Endpoints
- `GET /api/courses/:slug/content` — Full course content
- `POST /api/enrollments` — Enroll in course
- `POST /api/quizzes/:id/submit` — Submit quiz
- `GET /api/certificates/:courseId/download` — Download PDF

---

## 🌐 Deployment

### Backend (Railway/Render)
1. Set environment variables
2. Connect PostgreSQL database
3. Deploy from `backend` directory

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Configure SPA redirects

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License — 100% Free and Open Source

---

## ☕️ Support the Project

If You Learn helped you access free education or inspired your next project:

- Consider buying me a coffee
- It keeps development alive and motivates future updates

<div align="center">
<a href="https://buymeacoffee.com/zakisheriffw">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="60" width="217">
</a>
</div>

---

<p align="center">
Made by <strong>Zaki Sheriff</strong>
</p>

<p align="center">
<em>Because education should be free for everyone.</em>
</p>
