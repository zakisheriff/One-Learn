import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/CourseDetail.css';

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourseDetails();
    }, [slug]);

    const fetchCourseDetails = async () => {
        try {
            const response = await axios.get(`/api/courses/${slug}`);
            setCourse(response.data.course);
        } catch (err) {
            setError('Failed to load course details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            await axios.post('/api/enrollments', { courseId: course.id });
            navigate(`/course/${slug}/learn`);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
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
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading course...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="course-detail-page">
                <Navbar />
                <div className="error-state">
                    <p>{error || 'Course not found'}</p>
                    <Link to="/" className="back-link">← Back to courses</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="course-detail-page">
            <Navbar />

            <main className="detail-main">
                <div className="container">
                    <div className="course-hero">
                        {course.thumbnailUrl && (
                            <div className="hero-image">
                                <img src={course.thumbnailUrl} alt={course.title} />
                            </div>
                        )}

                        <div className="hero-content">
                            <h1>{course.title}</h1>
                            <p className="course-description">{course.description}</p>

                            <button
                                onClick={handleEnroll}
                                className="enroll-button"
                                disabled={enrolling}
                            >
                                {enrolling ? 'Enrolling...' : 'Enroll for Free'}
                            </button>

                            <p className="login-hint">
                                You'll need to sign in to access course content
                            </p>
                        </div>
                    </div>

                    <div className="course-syllabus">
                        <h2>Course Syllabus</h2>

                        {course.syllabus && (
                            <div className="syllabus-text">
                                <p>{course.syllabus}</p>
                            </div>
                        )}

                        {course.modules && course.modules.length > 0 && (
                            <div className="modules-list">
                                {course.modules.map((module, index) => (
                                    <div key={module.id} className="module-card">
                                        <div className="module-header">
                                            <span className="module-number">Module {index + 1}</span>
                                            <h3>{module.title}</h3>
                                        </div>
                                        {module.description && (
                                            <p className="module-description">{module.description}</p>
                                        )}
                                        <div className="module-meta">
                                            <span>{module.lessonCount} {module.lessonCount === 1 ? 'lesson' : 'lessons'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseDetail;
