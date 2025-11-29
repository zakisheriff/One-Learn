import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { LanguageContext } from '../context/LanguageContext';
import { SearchIcon, ClockIcon, BookIcon } from '../components/Icons';
import '../styles/CourseCatalog.css';

const CourseCatalog = () => {
    const { t } = useContext(LanguageContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 12;

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');

    const categories = [
        'All',
        'Technology & CS',
        'English & Communication',
        'Design & Creative',
        'Math & Science',
        'Business & Finance',
        'Video & Animation',
        'Health & Self-Improvement',
        'School Subjects',
        'Data Science & AI',
        'Music & Arts'
    ];

    useEffect(() => {
        if (searchQuery) {
            setSearchTerm(searchQuery);
        }
        if (categoryQuery) {
            // Capitalize first letter to match state if needed, or just match case-insensitive
            // The links use lowercase (e.g. 'technology'), state uses Title Case ('Technology')
            const matchedCategory = categories.find(c => c.toLowerCase() === categoryQuery.toLowerCase());
            if (matchedCategory) {
                setSelectedCategory(matchedCategory);
            }
        }
    }, [searchQuery, categoryQuery]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/courses');
            const coursesData = Array.isArray(response.data)
                ? response.data
                : (response.data.courses || []);
            setCourses(coursesData);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Simple category matching based on title keywords or explicit category if available
        // Since we don't have a category column in DB yet, we'll infer from title/description or just show all for now
        // Ideally, we should add a category column. For now, let's use the seed data's structure if possible, 
        // or just filter by keywords if we can't.
        // Wait, the seed script didn't add a category column. 
        // Let's do a keyword match for now based on the category names.

        let matchesCategory = true;
        if (selectedCategory !== 'All') {
            const categoryKeywords = {
                'Health & Self-Improvement': ['Health', 'Psychology', 'Self-Improvement', 'Fitness', 'Mental', 'Therapy', 'Motivation', 'Productivity', 'Habits', 'Tedx'],
                'School Subjects': ['School', 'History', 'Geography', 'Civics', 'Literature', 'Biology', 'Physics', 'Chemistry', 'Math', 'CrashCourse'],
                'Data Science & AI': ['Data', 'AI', 'Machine Learning', 'Artificial Intelligence', 'Cloud', 'AWS', 'Azure', 'Google Cloud', 'Statistics', 'Deep Learning'],
                'Music & Arts': ['Music', 'Guitar', 'Piano', 'Drawing', 'Painting', 'Art', 'Singing', 'Theory', 'Production', 'Instrument']
            };

            const keywords = categoryKeywords[selectedCategory] || [];
            matchesCategory = keywords.some(keyword =>
                course.title.includes(keyword) || course.description.includes(keyword)
            );
        }

        return matchesSearch && matchesCategory;
    });

    // Pagination Logic
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="course-catalog-page">
            <Navbar />

            {/* Hero Section */}
            <div className="catalog-hero">
                <div className="container catalog-hero-content">
                    <h1>{t('catalogTitle')}</h1>
                    <p>{t('catalogSubtitle')}</p>
                </div>
            </div>

            <div className="container">
                {/* Category Tabs */}
                <div className="category-tabs">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedCategory(category);
                                setCurrentPage(1); // Reset to page 1 on filter change
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Course Grid */}
                <div className="catalog-content">
                    {loading ? (
                        <div className="catalog-loading">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="course-card-skeleton">
                                    <div className="skeleton-thumbnail"></div>
                                    <div className="skeleton-content">
                                        <div className="skeleton-line title"></div>
                                        <div className="skeleton-line"></div>
                                        <div className="skeleton-line short"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : currentCourses.length > 0 ? (
                        <>
                            <div className="course-grid fade-in">
                                {currentCourses.map((course) => (
                                    <Link
                                        key={course.id}
                                        to={`/course/${course.slug}`}
                                        className="course-card"
                                    >
                                        <div className="course-thumbnail">
                                            <img
                                                src={course.thumbnailUrl || 'https://via.placeholder.com/400x200?text=Course'}
                                                alt={course.title}
                                            />
                                            <div className="course-thumbnail-overlay">
                                                <span className="course-duration">
                                                    <ClockIcon size={12} /> {course.estimated_hours || course.estimatedHours || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="course-info">
                                            <h3 className="course-title">{course.title}</h3>
                                            <p className="course-description">
                                                {course.description || 'Learn essential programming skills with this comprehensive course.'}
                                            </p>
                                            <div className="course-footer">
                                                <span className="course-lessons">
                                                    <BookIcon size={14} /> {t('multipleLessons')}
                                                </span>
                                                <button className="course-cta">
                                                    {t('enrollFree')}
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="pagination-btn"
                                    >
                                        &laquo; Prev
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => paginate(i + 1)}
                                            className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="pagination-btn"
                                    >
                                        Next &raquo;
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="catalog-empty">
                            <div className="catalog-empty-icon"><BookIcon size={48} color="#0000004d" /></div>
                            <h3>{t('noCourses')}</h3>
                            <p>{t('adjustSearch')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCatalog;
