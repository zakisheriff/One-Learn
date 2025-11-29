import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../App';
import { StarIcon, ClockIcon, ChartBarIcon, GlobeIcon, CheckIcon } from '../components/Icons';
import '../styles/CourseDetail.css';

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t } = useContext(LanguageContext);
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);

    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState('');

    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
        checkEnrollmentStatus();
    }, [slug]);

    const checkEnrollmentStatus = async () => {
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

    const handleEnroll = async () => {
        if (isEnrolled) {
            navigate(`/course/${slug}/learn`);
            return;
        }

        setEnrolling(true);
        try {
            await axios.post('/api/enrollments', { courseId: course.id });
            navigate(`/course/${slug}/learn`);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                alert(err.response?.data?.error || t('failedToEnroll') || 'Failed to enroll');
            }
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="course-detail-page">
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>{t('loading') || 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="course-detail-page">
                <Navbar />
                <div className="error-state">
                    <p>{error || t('courseNotFound') || 'Course not found'}</p>
                    <Link to="/" className="back-link">← {t('backToCourses') || 'Back to courses'}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="course-detail-page">
            <Navbar />

            <main className="detail-main">
                <div className="container">
                    {/* Header Section */}
                    <div className="course-header">
                        <h1 className="course-title">{course.title}</h1>
                        <div className="instructor-info">
                            <div className="instructor-avatar">
                                {course.instructor ? course.instructor.charAt(0).toUpperCase() : 'F'}
                            </div>
                            <div className="instructor-details">
                                <span className="instructor-name">FreeCodeCamp</span>
                                <span className="instructor-label">Instructor</span>
                            </div>
                        </div>

                        <div className="course-meta-row">
                            <div className="meta-item">
                                <StarIcon size={16} filled={true} color="#b4690e" />
                                <span>{course.likes || '4.8'} ({(course.likes * 12) || '1.2k'} ratings)</span>
                            </div>
                            <div className="meta-item">
                                <ClockIcon size={16} />
                                <span>{course.estimatedHours || '2h 30m'}</span>
                            </div>
                            <div className="meta-item">
                                <ChartBarIcon size={16} />
                                <span>Beginner</span>
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
                            {course.thumbnailUrl && (
                                <div className="course-preview-image">
                                    <img src={course.thumbnailUrl} alt={course.title} />
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
                                <p>This course is designed for beginners who want to learn {course.title} from scratch. No prior experience is required.</p>
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
                                        <p className="no-content-text">No modules available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseDetail;
