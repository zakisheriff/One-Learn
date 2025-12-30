import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckIcon } from '../components/Icons';
import CourseCard from '../components/CourseCard';
import '../styles/CourseViewer.css';

const CourseViewer = () => {
    const { slug } = useParams();
    const [course, setCourse] = useState(null);
    const [enrollmentId, setEnrollmentId] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [relatedCourses, setRelatedCourses] = useState([]);
    const [quickLearningCourses, setQuickLearningCourses] = useState([]);

    useEffect(() => {
        fetchCourseContent();
    }, [slug]);

    const fetchCourseContent = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/courses/${slug}/content`);
            setCourse(response.data.course);
            setEnrollmentId(response.data.enrollmentId);
            setIsCompleted(response.data.isCompleted);

            // Set first lesson as current
            if (response.data.course.modules.length > 0) {
                const firstModule = response.data.course.modules[0];
                if (firstModule.lessons.length > 0) {
                    setCurrentLesson(firstModule.lessons[0]);
                }
            }

            // Fetch recommendations
            fetchRecommendations(response.data.course);

        } catch (err) {
            console.error('Failed to load course content:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async (currentCourse) => {
        try {
            const response = await axios.get('/api/courses');
            const allCourses = response.data.courses || response.data; // Handle both {courses: [...]} and [...] formats

            // Filter Related Courses (Same Category, excluding current)
            const related = allCourses.filter(c => {
                const isCategoryMatch = c.category === currentCourse.category;
                const isNotCurrent = c.id !== currentCourse.id;
                return isCategoryMatch && isNotCurrent;
            }).slice(0, 5);
            setRelatedCourses(related);

            // Filter Quick Learning (Under 30 mins, excluding current)
            const quick = allCourses.filter(c => {
                const duration = c.duration || '';
                // Simple heuristic for "under 30 mins" or "micro"
                const isShort = (duration.includes('m') && !duration.includes('h') && parseInt(duration) < 30);
                const isMicro = c.type === 'micro';
                return (isShort || isMicro) && c.id !== currentCourse.id;
            }).slice(0, 5);
            setQuickLearningCourses(quick);

        } catch (err) {
            console.error('Failed to load recommendations:', err);
        }
    };

    const markLessonComplete = async (lessonId) => {
        try {
            await axios.put(`/api/enrollments/${enrollmentId}/progress`, {
                lessonId,
                completed: true
            });
            // Update local state
            setCourse(prev => ({
                ...prev,
                modules: prev.modules.map(module => ({
                    ...module,
                    lessons: module.lessons.map(lesson =>
                        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
                    )
                }))
            }));
        } catch (err) {
            console.error('Failed to mark lesson complete:', err);
        }
    };



    const allLessonsCompleted = () => {
        if (!course) return false;
        return course.modules.every(module =>
            module.lessons.every(lesson => lesson.completed)
        );
    };

    if (loading) {
        return (
            <div className="course-viewer-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-viewer-page">
                <div className="error-state">
                    <p>Course not found or you don't have access</p>
                    <Link to="/dashboard">← Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="course-viewer-page">

            <div className="viewer-container">
                {/* Sidebar */}
                <aside className={`viewer-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        <h2>{course.title}</h2>
                        <button
                            className="toggle-sidebar"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? '←' : '→'}
                        </button>
                    </div>

                    <div className="modules-list">
                        {course.modules.map((module, moduleIndex) => (
                            <div key={module.id} className="module-section">
                                <div className="module-title">
                                    Module {moduleIndex + 1}: {module.title}
                                </div>
                                <div className="lessons-list">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <button
                                            key={lesson.id}
                                            className={`lesson-item ${currentLesson?.id === lesson.id ? 'active' : ''} ${lesson.completed ? 'completed' : ''}`}
                                            onClick={() => setCurrentLesson(lesson)}
                                        >
                                            <span className="lesson-number">{lessonIndex + 1}</span>
                                            <span className="lesson-title">{lesson.title}</span>
                                            {lesson.completed && (
                                                <span className="check-icon"><CheckIcon size={16} color="#2D9F5D" /></span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {isCompleted ? (
                        <>
                            <Link to={`/course/${slug}/certificate`} className="take-quiz-button">
                                View Certificate
                            </Link>
                            <button className="take-quiz-button disabled" disabled>
                                Final Quiz Completed
                            </button>
                        </>
                    ) : allLessonsCompleted() && (
                        <Link to={`/course/${slug}/quiz`} className="take-quiz-button">
                            Take Final Quiz
                        </Link>
                    )}
                </aside>

                {/* Main Content */}
                <main className="viewer-main">
                    {!sidebarOpen && (
                        <button
                            className="open-sidebar-button"
                            onClick={() => setSidebarOpen(true)}
                            title="Open Sidebar"
                        >
                            →
                        </button>
                    )}
                    {currentLesson ? (
                        <>
                            <div className="video-wrapper">
                                <div className="video-container">
                                    {(() => {
                                        const videoIdMatch = currentLesson.youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                        const videoId = videoIdMatch ? videoIdMatch[1] : null;
                                        const thumbnailUrl = videoId
                                            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                            : 'https://via.placeholder.com/800x450?text=Video+Unavailable';

                                        return (
                                            <a
                                                href={currentLesson.youtubeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="video-thumbnail-player"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'block',
                                                    cursor: 'pointer',
                                                    textDecoration: 'none',
                                                    backgroundImage: `url(${thumbnailUrl})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    backgroundColor: '#000'
                                                }}
                                            >
                                                <div className="play-button-overlay" style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    transition: 'background-color 0.3s ease'
                                                }}>
                                                    <div className="play-icon" style={{
                                                        width: '68px',
                                                        height: '68px',
                                                        backgroundColor: '#ff0000',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                                                        transition: 'transform 0.2s ease'
                                                    }}>
                                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="watch-on-youtube-text" style={{
                                                    position: 'absolute',
                                                    bottom: '24px',
                                                    left: 0,
                                                    width: '100%',
                                                    textAlign: 'center',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    fontSize: '16px',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Watch on YouTube ↗
                                                </div>
                                            </a>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="course-tabs">
                                <button
                                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    Overview
                                </button>
                            </div>

                            <div className="tab-content">
                                {activeTab === 'overview' && (
                                    <div className="lesson-info">
                                        <div className="lesson-header">
                                            <h1>{currentLesson.title}</h1>
                                            {!currentLesson.completed && (
                                                <button
                                                    onClick={() => markLessonComplete(currentLesson.id)}
                                                    className="mark-complete-button"
                                                >
                                                    Mark as Complete
                                                </button>
                                            )}
                                        </div>
                                        <div className="instructor-bio">
                                            <img src={`https://ui-avatars.com/api/?name=${course.instructor || 'Instructor'}&background=random`} alt="Instructor" />
                                            <div>
                                                <h3>{course.instructor || 'YouLearn Instructor'}</h3>
                                                <p>Senior Software Engineer & Educator</p>
                                            </div>
                                        </div>
                                        <div className="lesson-description">
                                            <h3>About this lesson</h3>
                                            <p>{currentLesson.description || "In this lesson, we will dive deep into the core concepts and practical applications. By the end, you'll have a solid understanding of the topic."}</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'qa' && (
                                    <div className="qa-section">
                                        <h3>Common Questions</h3>
                                        <div className="qa-thread">
                                            <div className="qa-message">
                                                <img src="https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff" alt="User" />
                                                <div>
                                                    <h4>John Doe <span>2 hours ago</span></h4>
                                                    <p>Is there a downloadable resource for this lesson?</p>
                                                </div>
                                            </div>
                                            <div className="qa-reply">
                                                <img src={`https://ui-avatars.com/api/?name=${course.instructor || 'Instructor'}&background=random`} alt="Instructor" />
                                                <div>
                                                    <h4>{course.instructor || 'Instructor'} <span>Instructor</span></h4>
                                                    <p>Yes! Check the resources tab (coming soon) for the PDF guide.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="qa-input">
                                            <input type="text" placeholder="Ask a question..." />
                                            <button>Post</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Recommendations Section */}
                            <div className="recommendations-section">
                                {relatedCourses.length > 0 && (
                                    <div className="rec-category">
                                        <h3>Related Courses</h3>
                                        <div className="rec-list">
                                            {relatedCourses.map(course => (
                                                <CourseCard key={course.id} course={course} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {quickLearningCourses.length > 0 && (
                                    <div className="rec-category">
                                        <h3>Quick Learning (Under 30 mins)</h3>
                                        <div className="rec-list">
                                            {quickLearningCourses.map(course => (
                                                <CourseCard key={course.id} course={course} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="no-lesson">
                            <p>Select a lesson to begin</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseViewer;