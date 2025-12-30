'use client';

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { LanguageContext } from '../contexts/LanguageContext';
import { SearchIcon, ClockIcon, BookIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, ChevronDownIcon, ChevronUpIcon, FilterIcon, CheckIcon, PlayIcon, XIcon } from '../components/Icons';
import '../styles/CourseCatalog.css';

const FilterSection = ({ title, options, selected, onToggle, expanded, onExpandToggle }) => {
    return (
        <div className="filter-section">
            <button className="filter-header" onClick={onExpandToggle}>
                <span>{title}</span>
                {expanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
            </button>
            {expanded && (
                <div className="filter-options">
                    {options.map((option) => (
                        <label key={option} className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() => onToggle(option)}
                            />
                            <span className="checkmark"></span>
                            <span className="label-text">{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const SortDropdown = ({ options, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === selected)?.label || selected;

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <button className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{selectedLabel}</span>
                <ChevronDownIcon size={16} />
            </button>
            <div className={`dropdown-menu ${isOpen ? 'active' : ''}`}>
                {options.map((option) => (
                    <button
                        key={option.value}
                        className={`dropdown-item ${selected === option.value ? 'selected' : ''}`}
                        onClick={() => {
                            onSelect(option.value);
                            setIsOpen(false);
                        }}
                    >
                        {option.label}
                        {selected === option.value && <CheckIcon size={16} />}
                    </button>
                ))}
            </div>
        </div>
    );
};

const CourseCatalog = () => {
    const { t } = useContext(LanguageContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('relevant');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const coursesPerPage = 12;

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search');

    // Filter State
    const [selectedFilters, setSelectedFilters] = useState({
        Level: [],
        Type: [],
        Subjects: [],
        Duration: []
    });

    const [expandedSections, setExpandedSections] = useState({
        Level: true,
        Type: true,
        Subjects: true,
        Duration: true
    });

    const filterOptions = {
        Level: ['Beginner', 'Intermediate', 'Advanced'],
        Type: ['Course', 'Tutorial', 'Lecture', 'Series', 'Guide', 'Documentary'],
        Subjects: ['Business', 'Data Science', 'Design', 'English', 'Health', 'Math', 'Music', 'Science', 'Technology', 'Filmmaking'],
        Duration: ['< 30 mins', '30 mins - 1 hour', '1 - 3 hours', '3+ hours']
    };

    const sortOptions = [
        { value: 'relevant', label: 'Most Relevant' },
        { value: 'newest', label: 'Newest' },
        { value: 'views', label: 'Most Viewed' },
        { value: 'likes', label: 'Most Liked' },
        { value: 'az', label: 'Title (A-Z)' },
        { value: 'za', label: 'Title (Z-A)' },
    ];

    useEffect(() => {
        if (searchQuery) {
            setSearchTerm(searchQuery);
        }

        const durationParam = searchParams.get('duration');
        if (durationParam === 'micro') {
            setSelectedFilters(prev => ({
                ...prev,
                Duration: ['< 30 mins']
            }));
        }
    }, [searchQuery, searchParams]);

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

    const toggleFilter = (category, option) => {
        setSelectedFilters(prev => {
            const current = prev[category] || [];
            const updated = current.includes(option)
                ? current.filter(item => item !== option)
                : [...current, option];
            return { ...prev, [category]: updated };
        });
        setCurrentPage(1);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const parseMetric = (value) => {
        if (!value) return 0;
        const str = String(value).toUpperCase();
        if (str.includes('M')) return parseFloat(str) * 1000000;
        if (str.includes('K')) return parseFloat(str) * 1000;
        return parseFloat(str);
    };

    const parseDuration = (durationStr) => {
        if (!durationStr) return 0;
        const str = String(durationStr).toLowerCase();
        let minutes = 0;

        if (str.includes('h')) {
            const parts = str.split('h');
            minutes += parseFloat(parts[0]) * 60;
            if (parts[1] && parts[1].includes('m')) {
                minutes += parseFloat(parts[1]);
            }
        } else if (str.includes('m')) {
            minutes += parseFloat(str);
        } else {
            // Assume hours if just a number, or try to parse
            minutes += parseFloat(str) * 60;
        }
        return minutes;
    };

    // Filter Logic
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Level Match
        const matchesLevel = selectedFilters.Level?.length === 0 || !selectedFilters.Level || selectedFilters.Level.includes(course.level);

        // Type Match
        const matchesType = selectedFilters.Type?.length === 0 || !selectedFilters.Type || selectedFilters.Type.includes(course.type);

        // Subject Match
        // Check if course.subject matches or if course.category contains the subject
        const matchesSubject = selectedFilters.Subjects?.length === 0 || !selectedFilters.Subjects || selectedFilters.Subjects.some(sub =>
            course.subject === sub || course.category?.includes(sub)
        );

        // Duration Match
        const durationStr = course.estimatedHours || course.duration;
        const minutes = parseDuration(durationStr);
        const matchesDuration = selectedFilters.Duration?.length === 0 || !selectedFilters.Duration || selectedFilters.Duration.some(range => {
            if (range === '< 30 mins') return minutes < 30;
            if (range === '30 mins - 1 hour') return minutes >= 30 && minutes <= 60;
            if (range === '1 - 3 hours') return minutes > 60 && minutes <= 180;
            if (range === '3+ hours') return minutes > 180;
            return false;
        });

        return matchesSearch && matchesLevel && matchesType && matchesSubject && matchesDuration;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                // Fallback to title if no date, just to have deterministic sort
                return 0;
            case 'views':
                return parseMetric(b.views) - parseMetric(a.views);
            case 'likes':
                return parseMetric(b.likes) - parseMetric(a.likes);
            case 'az':
                return a.title.localeCompare(b.title);
            case 'za':
                return b.title.localeCompare(a.title);
            default:
                return 0; // Relevant (default order)
        }
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

    const getPaginationRange = (currentPage, totalPages) => {
        const delta = 1; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];
        let l;

        range.push(1);
        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i < totalPages && i > 1) {
                range.push(i);
            }
        }
        if (totalPages > 1) {
            range.push(totalPages);
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const showResultsCount = searchTerm || Object.values(selectedFilters).some(f => f.length > 0);

    return (
        <div className={`course-catalog ${!loading ? 'content-fade-in' : ''}`}>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading courses...</p>
                </div>
            ) : (
                <>

                    {/* Hero Section - Mission Style */}
                    <div className="catalog-hero-mission">
                        <div className="mission-content">
                            <div className="catalog-hero-content">
                                <h2>Learn from Authentic YouTube Courses</h2>
                                <p>Master new skills with curated YouTube courses. Take exams, pass, and earn verified certificates.</p>
                            </div>
                        </div>
                    </div>

                    <div className="container catalog-layout">
                        {/* Search Bar - Positioned in layout or sticky */}

                        {/* Sidebar Filters */}
                        <aside className={`catalog-sidebar ${showMobileFilters ? 'mobile-visible' : ''}`}>
                            <div className="sidebar-header">
                                <h3>Filter By</h3>
                                <div className="sidebar-actions">
                                    <button
                                        className="clear-filters"
                                        onClick={() => setSelectedFilters({
                                            Level: [], Type: [], Subjects: [], Duration: []
                                        })}
                                    >
                                        Clear all
                                    </button>
                                    <button className="close-sidebar-mobile" onClick={() => setShowMobileFilters(false)}>
                                        &times;
                                    </button>
                                </div>
                            </div>

                            <div className="sidebar-content-scroll">
                                {Object.keys(filterOptions).map(key => (
                                    <FilterSection
                                        key={key}
                                        title={key}
                                        options={filterOptions[key]}
                                        selected={selectedFilters[key]}
                                        onToggle={(option) => toggleFilter(key, option)}
                                        expanded={expandedSections[key]}
                                        onExpandToggle={() => toggleSection(key)}
                                    />
                                ))}
                            </div>
                            <div className="mobile-filter-footer">
                                <button className="apply-filters-btn" onClick={() => setShowMobileFilters(false)}>
                                    Show {filteredCourses.length} Results
                                </button>
                            </div>
                        </aside>

                        {showMobileFilters && <div className="sidebar-overlay" onClick={() => setShowMobileFilters(false)}></div>}

                        {/* Main Content */}
                        <main className="catalog-main">
                            <div className="catalog-results-header">
                                <div className="results-count-wrapper">
                                    <button className="mobile-filter-trigger" onClick={() => setShowMobileFilters(true)}>
                                        <FilterIcon size={18} />
                                        <span>Filters</span>
                                    </button>
                                    {showResultsCount ? (
                                        <h2>{filteredCourses.length} Results</h2>
                                    ) : (
                                        <h2>All Courses</h2>
                                    )}
                                </div>
                                <div className="sort-dropdown-wrapper">
                                    <span className="sort-label">Sort by: </span>
                                    <SortDropdown
                                        options={sortOptions}
                                        selected={sortBy}
                                        onSelect={setSortBy}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="catalog-loading">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="course-card-skeleton">
                                            <div className="skeleton-thumbnail"></div>
                                            <div className="skeleton-content">
                                                <div className="skeleton-line title"></div>
                                                <div className="skeleton-line"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : currentCourses.length > 0 ? (
                                <>
                                    <div className="catalog-grid fade-in">
                                        {currentCourses.map((course) => (
                                            <Link
                                                key={course.id}
                                                href={`/course/${course.slug}`}
                                                className="catalog-card"
                                            >
                                                <div className="catalog-thumbnail">
                                                    {course.thumbnailUrl && !course.thumbnailUrl.includes('_') ? (
                                                        <img
                                                            src={course.thumbnailUrl}
                                                            alt={course.title}
                                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                        />
                                                    ) : null}
                                                    <div style={{ display: !course.thumbnailUrl || course.thumbnailUrl.includes('_') ? 'flex' : 'none', width: '100%', height: '200px', background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '14px' }}>
                                                        No Preview Available
                                                    </div>
                                                    <div className="play-icon-overlay">
                                                        <PlayIcon size={32} />
                                                    </div>
                                                    <div className="catalog-thumbnail-overlay">
                                                        <span className="catalog-duration">
                                                            <ClockIcon size={12} /> {course.estimated_hours || course.estimatedHours || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="catalog-info">
                                                    <h3 className="catalog-title">{course.title}</h3>
                                                    <p className="catalog-instructor" style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                                        {course.instructor || 'YouLearn Instructor'}
                                                    </p>
                                                    <p className="catalog-description">
                                                        {course.description || 'Learn essential programming skills.'}
                                                    </p>
                                                    <div className="catalog-meta">
                                                        <div className="linkedin-card-rating">
                                                            <span className="linkedin-card-rating-star"><StarIcon size={12} filled={true} color="#b4690e" /></span>
                                                            {course.likes && <span>{course.likes}</span>}
                                                            {course.views && <span>({course.views})</span>}
                                                        </div>
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
                                                <ChevronLeftIcon size={20} />
                                            </button>

                                            {getPaginationRange(currentPage, totalPages).map((page, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => typeof page === 'number' ? paginate(page) : null}
                                                    className={`pagination-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                                                    disabled={page === '...'}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="pagination-btn"
                                            >
                                                <ChevronRightIcon size={20} />
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
                        </main>
                    </div>
                </>
            )}
        </div>
    );
};

export default CourseCatalog;
