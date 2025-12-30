'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StarIcon, ClockIcon, ChartBarIcon, GlobeIcon, CheckIcon } from '../../components/Icons';
import CourseCard from '../../components/CourseCard';
import '../../styles/CourseDetail.css';

export default function CourseDetail() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { user } = useAuth();

    // Safety check for slug - in Next.js 15 params might need awaiting or checking
    const slug = params?.slug;

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [recommendedCourses, setRecommendedCourses] = useState([]);

    useEffect(() => {
        if (slug) {
            fetchCourseDetails();
            checkEnrollmentStatus();
            fetchRecommendedCourses();
        }
    }, [slug]);

    const checkEnrollmentStatus = async () => {
        if (!user) return;
        try {
            const response = await axios.get('/api/enrollments');
            if (response.data.enrollments) {
                const enrolled = response.data.enrollments.some(e => e.course.slug === slug);
                setIsEnrolled(enrolled);
            }
        } catch (err) {
            console.error('Failed to check enrollment:', err);
        }
    };

    const fetchCourseDetails = async () => {
        try {
            const response = await axios.get(`/api/courses/${slug}`);
            setCourse(response.data.course);
        } catch (err) {
            setError(t('failedToLoadCourse') || 'Failed to load course details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendedCourses = async () => {
        try {
            const response = await axios.get('/api/courses');
            // Shuffle and pick 3 random courses, excluding current one
            const otherCourses = response.data.filter(c => c.slug !== slug);
            const shuffled = otherCourses.sort(() => 0.5 - Math.random());
            setRecommendedCourses(shuffled.slice(0, 3));
        } catch (err) {
            console.error('Failed to fetch recommended courses:', err);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (isEnrolled) {
            router.push(`/course/${slug}/learn`);
            return;
        }

        setEnrolling(true);
        try {
            await axios.post('/api/enrollments', { courseId: course.id });
            // Refresh enrollment status
            setIsEnrolled(true);
            router.push(`/course/${slug}/learn`);
        } catch (err) {
            console.error('Enrollment failed:', err);
            if (err.response?.status === 401) {
                router.push('/login');
            } else {
                alert(err.response?.data?.error || 'Failed to enroll');
            }
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="course-detail-page">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#86868b' }}>
                    <div className="spinner" style={{ marginRight: '12px' }}></div>
                    <p>{t('loading') || 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="course-detail-page">
                <div style={{ textAlign: 'center', padding: '120px 20px', color: 'white' }}>
                    <p style={{ fontSize: '24px', marginBottom: '24px' }}>{error || t('courseNotFound') || 'Course not found'}</p>
                    <Link href="/explore" className="enroll-button-large" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        ← {t('backToCourses') || 'Back to courses'}
                    </Link>
                </div>
            </div>
        );
    }

    // Helper to detect if thumbnail is a YouTube placeholder
    const isPlaceholderThumbnail = !course.thumbnailUrl ||
        course.thumbnailUrl.includes('placeholder') ||
        course.thumbnailUrl.includes('g_g_g_g') ||
        course.thumbnailUrl.includes('p_p_p_p');

    return (
        <div className="course-detail-page">
            <main className="detail-main">
                <div className="course-detail-container">
                    {/* Header Section */}
                    <div className="course-header">
                        <h1 className="course-title">{course.title}</h1>
                        <div className="instructor-info">
                            <div className="instructor-avatar">
                                {course.instructor ? course.instructor.charAt(0).toUpperCase() : 'Y'}
                            </div>
                            <div className="instructor-details">
                                <span className="instructor-name">{course.instructor || 'One Learn Instructor'}</span>
                                <span className="instructor-label">Instructor</span>
                            </div>
                        </div>

                        <div className="course-meta-row">
                            <div className="meta-item">
                                <StarIcon size={16} filled={true} color="#b4690e" />
                                <span style={{ color: '#eab308' }}>{course.likes || '0'} Likes</span>
                            </div>
                            <div className="meta-item">
                                <ClockIcon size={16} />
                                <span>{course.estimatedHours || 'N/A'}</span>
                            </div>
                            <div className="meta-item">
                                <ChartBarIcon size={16} />
                                <span>{course.level || 'All Levels'}</span>
                            </div>
                            <div className="meta-item">
                                <GlobeIcon size={16} />
                                <span>English</span>
                            </div>
                        </div>

                        <button
                            onClick={handleEnroll}
                            className="enroll-button-large"
                            disabled={enrolling}
                        >
                            {enrolling ? (t('processing') || 'Processing...') :
                                isEnrolled ? (t('continueLearning') || 'Continue Learning') :
                                    (t('enrollNow') || 'Start Course')}
                        </button>
                    </div>

                    <div className="course-content-layout">
                        {/* Main Column */}
                        <div className="course-main-column">
                            {course.thumbnailUrl && !isPlaceholderThumbnail ? (
                                <div className="course-preview-image">
                                    <img
                                        src={course.thumbnailUrl}
                                        alt={course.title}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.style.background = '#1a1a1a';
                                            e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666">Preview Not Available</div>';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="course-preview-image" style={{ background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: '#666' }}>No Preview Available</span>
                                </div>
                            )}

                            <section className="course-section">
                                <h2>Course Overview</h2>
                                <p className="course-description">{course.description}</p>
                            </section>

                            <section className="course-section">
                                <h2>What you'll learn</h2>
                                <ul className="learning-objectives">
                                    <li><CheckIcon size={16} color="#2D9F5D" /> Master the core concepts of {course.category || 'this subject'}</li>
                                    <li><CheckIcon size={16} color="#2D9F5D" /> Build real-world projects and applications</li>
                                    <li><CheckIcon size={16} color="#2D9F5D" /> Understand best practices and industry standards</li>
                                    <li><CheckIcon size={16} color="#2D9F5D" /> Prepare for technical interviews</li>
                                </ul>
                            </section>

                            <section className="course-section">
                                <h2>Who this course is for</h2>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                                    This course is designed for beginners who want to learn {course.title} from scratch. No prior experience is required.
                                </p>
                            </section>
                        </div>

                        {/* Sidebar Column */}
                        <div className="course-sidebar-column">
                            <div className="sidebar-card">
                                <h3>Course Content</h3>
                                <div className="sidebar-syllabus">
                                    {course.modules && course.modules.length > 0 ? (
                                        course.modules.map((module, index) => (
                                            <div key={module.id} className="sidebar-module">
                                                <div className="sidebar-module-header">
                                                    <span className="module-title-text">{module.title}</span>
                                                </div>
                                                <div className="sidebar-lessons-count">
                                                    {module.lessonCount} lessons
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-content-text">No modules available yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Courses Section */}
                    {recommendedCourses.length > 0 && (
                        <div className="recommended-section" style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '24px' }}>Recommended for You</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {recommendedCourses.map(course => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
