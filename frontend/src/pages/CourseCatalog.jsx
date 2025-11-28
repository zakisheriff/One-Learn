import React, { useState, useEffect } from 'react';
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
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    useEffect(() => {
        if (searchQuery) {
            setSearchTerm(searchQuery);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/courses');
            // Handle both response.data and response.data.courses formats
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

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter
            ? (course.category?.toLowerCase() === categoryFilter.toLowerCase() ||
                course.tags?.some(tag => tag.toLowerCase() === categoryFilter.toLowerCase()))
            : true;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="course-catalog-page">
            <Navbar />

            {/* Hero Section */}
            <div className="catalog-hero">
                <div className="container catalog-hero-content">
                    <h1>{t('catalogTitle')}</h1>
                    <p>{t('catalogSubtitle')}</p>

                    {/* Search Bar */}
                    <div className="catalog-search">
                        <div className="search-glass">
                            <span className="search-icon"><SearchIcon size={20} /></span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
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
                ) : filteredCourses.length > 0 ? (
                    <div className="course-grid fade-in">
                        {filteredCourses.map((course) => (
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
                                            <ClockIcon size={12} /> {course.estimatedHours || '10'} {t('hours')}
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
                                            <BookIcon size={14} /> {t('lessons')}
                                        </span>
                                        <button className="course-cta">
                                            {t('enrollFree')}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="catalog-empty">
                        <div className="catalog-empty-icon"><BookIcon size={48} color="#0000004d" /></div>
                        <h3>{t('noCourses')}</h3>
                        <p>{t('adjustSearch')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseCatalog;
