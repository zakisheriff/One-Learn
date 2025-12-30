'use client';

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import { LanguageContext } from './contexts/LanguageContext';
import {
  StarIcon, ClockIcon, LessonIcon, ArrowRightIcon, BookIcon,
  CodeIcon, ChartBarIcon, PenToolIcon, RocketIcon,
  GlobeIcon, PlayIcon, CheckIcon
} from './components/Icons';
import './styles/HomePage.css';
import OnboardingModal from './components/OnboardingModal';
import LoadingSpinner from './components/LoadingSpinner';

const HeroCarousel = ({ featuredCourses }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredCourses.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredCourses.length]);

  if (!featuredCourses.length) return null;

  const currentCourse = featuredCourses[currentIndex];

  return (
    <div className="hero-carousel">
      <div className="hero-slide" key={currentCourse.id}>
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">Featured Course</span>
            <h1>{currentCourse.title}</h1>
            <p className="hero-instructor">By {currentCourse.instructor || 'One Learn Instructor'} • {currentCourse.estimated_hours || '2h 30m'}</p>
            <p className="hero-description">{currentCourse.description}</p>
            <div className="hero-actions">
              <Link href={`/course/${currentCourse.slug}`} className="hero-btn-primary">
                <PlayIcon size={16} /> Start Learning
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            {currentCourse.thumbnailUrl && !currentCourse.thumbnailUrl.includes('g_g_g') && !currentCourse.thumbnailUrl.includes('placeholder') ? (
              <img
                src={currentCourse.thumbnailUrl}
                alt={currentCourse.title}
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                  width: '100%',
                  height: '100%'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;color:#666;font-size:1.5rem">No Thumbnail</div>';
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                <span style={{ fontSize: '1.5rem' }}>No Thumbnail</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="hero-indicators">
        {featuredCourses.map((_, idx) => (
          <button
            key={idx}
            className={`hero-indicator ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useContext(LanguageContext);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'Technology & CS', icon: <CodeIcon size={24} /> },
    { name: 'Business & Finance', icon: <ChartBarIcon size={24} /> },
    { name: 'Design & Creative', icon: <PenToolIcon size={24} /> },
    { name: 'Data Science & AI', icon: <RocketIcon size={24} /> },
    { name: 'English & Communication', icon: <GlobeIcon size={24} /> },
    { name: 'Health & Self-Improvement', icon: <StarIcon size={24} /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          axios.get('/api/courses'),
          user ? axios.get('/api/enrollments') : Promise.resolve({ data: { enrollments: [] } })
        ]);

        const coursesData = Array.isArray(coursesRes.data)
          ? coursesRes.data
          : (coursesRes.data.courses || []);
        setCourses(coursesData);

        if (user && enrollmentsRes.data.enrollments) {
          setEnrollments(enrollmentsRes.data.enrollments);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const renderCourseCard = (course, progress = null) => (
    <Link
      key={course.id}
      href={`/course/${course.slug}`}
      className="linkedin-course-card"
    >
      <div className="linkedin-card-thumbnail">
        {course.thumbnailUrl && !course.thumbnailUrl.includes('g_g_g') && !course.thumbnailUrl.includes('placeholder') ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;color:#666">No Preview</div>';
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            No Preview
          </div>
        )}
        <div className="linkedin-card-duration">
          <ClockIcon size={12} /> {course.estimated_hours || course.estimatedHours || course.duration || 'N/A'}
        </div>
      </div>
      <div className="linkedin-card-content">
        <h3 className="linkedin-card-title">{course.title}</h3>
        <p className="linkedin-card-instructor">{course.instructor || 'One Learn Instructor'}</p>
        <div className="linkedin-card-meta">
          <div className="linkedin-card-rating">
            <span className="linkedin-card-rating-star"><StarIcon size={12} filled={true} color="#b4690e" /></span>
            {course.likes && <span>{course.likes}</span>}
            {course.views && <span>({course.views})</span>}
          </div>
        </div>
      </div>
      {progress !== null && (
        <div className="linkedin-card-progress">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{progress}% complete</p>
        </div>
      )}
    </Link>
  );

  const featuredSlugs = ['freecodecamp-learn-to-code', 'cs50-harvard', 'aws-training'];
  let featuredCourses = courses.filter(c => featuredSlugs.includes(c.slug));
  featuredCourses.sort((a, b) => featuredSlugs.indexOf(a.slug) - featuredSlugs.indexOf(b.slug));

  if (featuredCourses.length === 0 && courses.length > 0) {
    featuredCourses = courses.slice(0, 3);
  }

  // Filter courses based on user interests
  const recommendedCourses = React.useMemo(() => {
    if (!user || !user.interests || user.interests.length === 0) {
      return courses.slice(0, 5);
    }

    const interestLower = user.interests.map(i => i.toLowerCase());

    const matched = courses.filter(course => {
      const title = (course.title || '').toLowerCase();
      const subject = (course.subject || '').toLowerCase();
      const category = (course.category || '').toLowerCase();
      const description = (course.description || '').toLowerCase();

      return interestLower.some(interest =>
        title.includes(interest) ||
        subject.includes(interest) ||
        category.includes(interest) ||
        description.includes(interest)
      );
    });

    return matched.length > 0 ? matched.slice(0, 5) : courses.slice(0, 5);
  }, [courses, user]);

  return (
    <div className={`homepage ${!loading ? 'content-fade-in' : ''}`}>
      {loading ? (
        <div style={{ padding: '100px 0' }}>
          <LoadingSpinner text="Finding best free courses..." />
        </div>
      ) : (
        <>
          {user && (!user.interests || user.interests.length === 0) && (
            <OnboardingModal onClose={() => { }} />
          )}

          <div className="mission-banner">
            <div className="mission-content">
              <div className="mission-header">
                <h2>Turn YouTube Time into Credentials</h2>
                <p>A completely free platform to master skills and get certified.</p>
              </div>
              <div className="mission-steps">
                <div className="mission-step">
                  <div className="mission-icon-wrapper">
                    <PlayIcon size={24} />
                  </div>
                  <div className="mission-text">
                    <h3>1. Watch</h3>
                    <p>Curated free YouTube courses</p>
                  </div>
                </div>
                <div className="mission-step">
                  <div className="mission-icon-wrapper">
                    <BookIcon size={24} />
                  </div>
                  <div className="mission-text">
                    <h3>2. Learn</h3>
                    <p>Structured curriculum & progress</p>
                  </div>
                </div>
                <div className="mission-step">
                  <div className="mission-icon-wrapper">
                    <CheckIcon size={24} />
                  </div>
                  <div className="mission-text">
                    <h3>3. Certify</h3>
                    <p>Pass the exam & earn a certificate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!loading && featuredCourses.length > 0 && (
            <HeroCarousel featuredCourses={featuredCourses} />
          )}

          <div className="homepage-content">
            {user && enrollments.length > 0 && (
              <div className="course-section continue-learning">
                <div className="section-header">
                  <h2 className="section-title">{t('continueLearning')}</h2>
                  <Link href="/dashboard" className="section-see-all">
                    {t('seeAll')} <ArrowRightIcon size={14} />
                  </Link>
                </div>
                <div className="course-carousel">
                  {enrollments.slice(0, 5).map((enrollment) => renderCourseCard(enrollment.course, enrollment.progress))}
                </div>
              </div>
            )}

            <div className="course-section">
              <div className="section-header">
                <h2 className="section-title">Explore Topics</h2>
              </div>
              <div className="topics-grid">
                {categories.map((cat, idx) => (
                  <Link href={`/explore?category=${encodeURIComponent(cat.name)}`} key={idx} className="topic-card">
                    <div className="topic-icon">{cat.icon}</div>
                    <span className="topic-name">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="course-section">
              <div className="section-header">
                <h2 className="section-title">Recommended for You</h2>
              </div>
              <div className="course-carousel">
                {recommendedCourses.length > 0 ? (
                  recommendedCourses.map(course => renderCourseCard(course))
                ) : (
                  <p style={{ color: '#888', fontStyle: 'italic', padding: '0 4px' }}>No courses available yet.</p>
                )}
              </div>
            </div>

            <div className="course-section">
              <div className="section-header">
                <h2 className="section-title">{t('trending')}</h2>
                <Link href="/explore" className="section-see-all">
                  {t('seeAll')} <ArrowRightIcon size={14} />
                </Link>
              </div>
              <div className="course-carousel">
                {courses.length > 0 ? (
                  courses.slice().reverse().slice(0, 5).map((course) => renderCourseCard(course))
                ) : (
                  <p style={{ color: '#888', fontStyle: 'italic', padding: '0 4px' }}>No trending courses yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
