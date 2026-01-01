# <div align="center">One Learn</div>

<div align="center">
<strong>100% Free, Learning Platform with Verified Certificates</strong>
</div>

<br />

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

<a href="https://onelearn.theoneatom.com">
<img src="https://img.shields.io/badge/View%20Live%20Demo-Click%20Here-0071e3?style=for-the-badge&logo=safari&logoColor=white" height="50" />
</a>

<br />
<br />

**[Visit Live Site: https://onelearn.theoneatom.com](https://onelearn.theoneatom.com)**

</div>

<br />

> **"Learning should be free for everyone."**
>
> You Learn isn't just another LMS; it's a movement toward accessible education.  
> Powered by AI and designed with The One Atom Color palette (Black, White, and Glassmorphism), it transforms YouTube content into structured, certified learning experiences.

---

## 🌟 Vision

You Learn's mission is to be:

- **A completely free learning platform** — no paywalls, no subscriptions, ever
- **An AI-powered education system** using Google's Gemini for intelligent assessments
- **A beautiful, modern web application** with The One Atom Color palette design language

---

## ✨ Why You Learn?

Traditional online courses are expensive and gatekeep education behind paywalls.  
You Learn democratizes learning by making **every course, every quiz, and every certificate 100% free**.

---

## 🎨 The One Atom Color Palette "Liquid Glass" Design

- **Minimalist Aesthetics**  
  Pure CSS implementation following The One Atom Color palette (Black, White, and Glassmorphism) design principles — no frameworks, just elegance.

- **Liquid Glass Effects**  
  Translucent overlays with `backdrop-filter: blur()` create depth and focus.

- **Soft Elevation**  
  Subtle shadows and smooth transitions provide a premium feel.

- **System Fonts**  
  Modern system typography for maximum legibility and premium feel.

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
    │   └── styles/               # Pure CSS (The One Atom Color palette)
    │       ├── variables.css     # Design system tokens
    │       └── [component].css
    └── index.html
```

---


##  Key Features

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
- **Pure CSS** — No frameworks, The One Atom Color palette design
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


## 📄 License

**Strictly Proprietary License**

All rights reserved. This project and its source code are for study and educational purposes only. You are permitted to visit the site and view the code to learn, but you may **NOT** use, copy, modify, distribute, or deploy this code, in whole or in part, for any purpose.

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
