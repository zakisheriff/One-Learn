'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { CheckIcon, PlayIcon, LockIcon, ChevronRightIcon, CheckIcon as CheckCircle, PlayIcon as PlayCircle } from '../../../components/Icons';
import LoadingSpinner from '../../../components/LoadingSpinner';
import '../../../styles/LearningPage.css';

export default function LearningPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const slug = params?.slug;

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);

    useEffect(() => {
        if (slug) {
            fetchData();
        } else if (!loading && !user) {
            // Optional: Handle redirect
        }
    }, [slug, user]);

    const fetchData = async () => {
        try {
            const [courseRes, enrollRes] = await Promise.all([
                axios.get(`/api/courses/${slug}`),
                user ? axios.get('/api/enrollments') : Promise.resolve({ data: { enrollments: [] } })
            ]);

            const courseData = courseRes.data.course;
            setCourse(courseData);

            // Handle enrollment
            let userEnrollment = null;
            if (user) {
                userEnrollment = enrollRes.data.enrollments.find(e => e.course.slug === slug);
                if (userEnrollment) {
                    setCompletedLessons(userEnrollment.completedLessons || []);
                }
            }

            // Set initial active lesson
            if (courseData.modules && courseData.modules.length > 0) {
                const allLessons = courseData.modules.flatMap(m => m.lessons || []);

                if (userEnrollment) {
                    // Find first uncompleted lesson
                    const firstUncompleted = allLessons.find(l => !userEnrollment.completedLessons.includes(l.id));
                    setActiveLesson(firstUncompleted || allLessons[0]);
                } else {
                    // Default to first lesson
                    setActiveLesson(allLessons[0]);
                }
            }

        } catch (error) {
            console.error('Failed to load learning data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonSelect = (lesson) => {
        setActiveLesson(lesson);
    };

    const handleComplete = async () => {
        if (!user || !activeLesson || !course) return;

        console.log('Completing lesson:', { courseId: course.id, lessonId: activeLesson.id });

        try {
            const response = await axios.post('/api/enrollments/progress', {
                courseId: course.id,
                lessonId: activeLesson.id
            });
            console.log('Complete response:', response.data);

            setCompletedLessons(prev => {
                if (!prev.includes(activeLesson.id)) {
                    return [...prev, activeLesson.id];
                }
                return prev;
            });

            // Auto advance
            const allLessons = course.modules.flatMap(m => m.lessons || []);
            const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
            if (currentIndex < allLessons.length - 1) {
                setActiveLesson(allLessons[currentIndex + 1]);
            }

        } catch (error) {
            console.error('Failed to update progress', error);
            // Show error to user to help debugging
            alert(`Failed to mark complete: ${error.response?.data?.error || error.message}`);
        }
    };

    if (loading) return <LoadingSpinner fullScreen text="Loading Class..." />;
    if (!course) return <div className="p-10 text-center text-white">Course not found</div>;

    const allLessons = course.modules?.flatMap(m => m.lessons || []) || [];

    return (
        <div className="learning-container">
            <div className="learning-main">
                <div className="video-container">
                    {activeLesson ? (
                        <iframe
                            src={activeLesson.youtubeUrl?.replace('watch?v=', 'embed/').split('&')[0]}
                            className="video-player"
                            allowFullScreen
                            title={activeLesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a lesson to start
                        </div>
                    )}
                </div>
                <div className="lesson-details-bar">
                    <div style={{ flex: 1 }}>
                        <h1 className="lesson-title-large">{activeLesson?.title || course.title}</h1>
                        <p className="lesson-description">{activeLesson?.description}</p>
                    </div>

                    <div className="lesson-actions">
                        <button
                            className="action-btn primary"
                            onClick={handleComplete}
                            disabled={completedLessons.some(id => String(id) === String(activeLesson?.id))}
                        >
                            {completedLessons.some(id => String(id) === String(activeLesson?.id)) ? 'Completed' : 'Mark Complete'}
                            {completedLessons.some(id => String(id) === String(activeLesson?.id)) && <CheckCircle size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="learning-sidebar">
                <div className="sidebar-header">
                    <h3>Course Content</h3>
                    <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        {Math.round((completedLessons.length / (allLessons.length || 1)) * 100)}% Complete
                    </p>
                </div>
                <div className="sidebar-content">
                    {course.modules?.map((module, mIdx) => (
                        <div key={module.id} className="module-section">
                            <div className="module-header">
                                Module {mIdx + 1}: {module.title}
                            </div>
                            {module.lessons?.map((lesson, lIdx) => {
                                const isCompleted = completedLessons.includes(lesson.id);
                                const isActive = activeLesson?.id === lesson.id;
                                return (
                                    <div
                                        key={lesson.id}
                                        className={`lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                        onClick={() => handleLessonSelect(lesson)}
                                    >
                                        <div className="status-icon">
                                            {isCompleted ? <CheckIcon size={16} color="#2D9F5D" /> :
                                                isActive ? <PlayIcon size={16} color="#0a84ff" /> :
                                                    <div style={{ width: 16, height: 16, border: '1px solid #333', borderRadius: '50%' }}></div>}
                                        </div>
                                        <div className="lesson-info">
                                            <div className="lesson-title">{lesson.title}</div>
                                            <div className="lesson-duration">{Math.round((lesson.duration || 600) / 60)} min</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                {allLessons.length > 0 && allLessons.every(l => completedLessons.some(id => String(id) === String(l.id))) ? (
                    <div className="quiz-btn-wrapper">
                        <Link href={`/course/${slug}/quiz`} className="quiz-btn-sidebar">
                            Take Final Quiz
                        </Link>
                    </div>
                ) : (
                    <div className="locked-message">
                        <p style={{ fontSize: 13, color: '#888' }}>Complete all lessons to unlock quiz</p>
                    </div>
                )}
            </div>
        </div>

    );
}
