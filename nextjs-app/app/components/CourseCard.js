'use client';

import React from 'react';
import Link from 'next/link';
import '../styles/CourseCard.css';

const CourseCard = ({ course }) => {
    const {
        slug,
        title,
        description,
        thumbnail_url,
        moduleCount,
        lessonCount,
        duration
    } = course;

    return (
        <Link href={`/course/${slug}`} className="course-card-link">
            <article className="course-card">
                <div className="course-thumbnail">
                    {thumbnail_url ? (
                        <img src={thumbnail_url} alt={title} />
                    ) : (
                        <div className="thumbnail-placeholder">
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="course-content">
                    <h3 className="course-title">{title}</h3>
                    <p className="course-description">{description}</p>

                    <div className="course-meta">
                        {moduleCount && (
                            <span className="meta-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
                            </span>
                        )}
                        {lessonCount && (
                            <span className="meta-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
                            </span>
                        )}
                        {duration && (
                            <span className="meta-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {duration}
                            </span>
                        )}
                    </div>

                    <div className="course-action">
                        <span className="view-course-btn">
                            View Course
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default CourseCard;
