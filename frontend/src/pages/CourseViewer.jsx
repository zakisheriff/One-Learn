import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { CheckIcon } from '../components/Icons';
import '../styles/CourseViewer.css';

const CourseViewer = () => {
    const { slug } = useParams();
    const [course, setCourse] = useState(null);
    const [enrollmentId, setEnrollmentId] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseContent();
    }, [slug]);

    const fetchCourseContent = async () => {
        try {
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
        } catch (err) {
            console.error('Failed to load course content:', err);
        } finally {
            setLoading(false);
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
                <Navbar />
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
                <Navbar />
                <div className="error-state">
                    <p>Course not found or you don't have access</p>
                    <Link to="/dashboard">← Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="course-viewer-page">
            <Navbar />

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
                                        // More robust regex to handle various YouTube URL formats including shorts, mobile, etc.
                                        const videoIdMatch = currentLesson.youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                        const videoId = videoIdMatch ? videoIdMatch[1] : null;

                                        // Use high quality thumbnail if available, fallback to standard
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
                                                    backgroundColor: '#000' // Fallback background
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

                            <div className="lesson-info">
                                <h1>{currentLesson.title}</h1>
                                {currentLesson.description && (
                                    <p>{currentLesson.description}</p>
                                )}

                                {!currentLesson.completed && (
                                    <button
                                        onClick={() => markLessonComplete(currentLesson.id)}
                                        className="mark-complete-button"
                                    >
                                        Mark as Complete
                                    </button>
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
