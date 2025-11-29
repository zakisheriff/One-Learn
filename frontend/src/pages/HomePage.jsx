import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import {
    StarIcon, ClockIcon, LessonIcon, ArrowRightIcon, BookIcon,
    CodeIcon, ChartBarIcon, PenToolIcon, RocketIcon,
    GlobeIcon, PlayIcon, CheckIcon
} from '../components/Icons';
import '../styles/HomePage.css';

const HeroCarousel = ({ featuredCourses }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredCourses.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featuredCourses.length]);

    if (!featuredCourses.length) return null;

    const currentCourse = featuredCourses[currentIndex];

    return (
        <div className="hero-carousel">
            <div className="hero-slide" key={currentCourse.id}>
                <div className="hero-content">
                    <div className="hero-text">
                        <span className="hero-badge">Featured Course</span>
                        <h1>{currentCourse.title}</h1>
                        <p className="hero-instructor">By FreeCodeCamp • {currentCourse.estimated_hours || '2h 30m'}</p>
                        <p className="hero-description">{currentCourse.description}</p>
                        <div className="hero-actions">
                            <Link to={`/course/${currentCourse.slug}`} className="hero-btn-primary">
                                <PlayIcon size={16} /> Start Learning
                            </Link>
                            <button className="hero-btn-secondary">
                                <StarIcon size={16} /> Save
                            </button>
                        </div>
                    </div>
                    <div className="hero-image-wrapper">
                        <img src={currentCourse.thumbnailUrl} alt={currentCourse.title} className="hero-image" />
                    </div>
                </div>
            </div>
            <div className="hero-indicators">
                <div className="hero-indicators">
                    {featuredCourses.map((_, idx) => (
                        <button
                            key={idx}
                            className={`hero-indicator ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const HomePage = () => {
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = [
        { name: 'Technology & CS', icon: <CodeIcon size={24} /> },
        { name: 'Business & Finance', icon: <ChartBarIcon size={24} /> },
        { name: 'Design & Creative', icon: <PenToolIcon size={24} /> },
        { name: 'Data Science & AI', icon: <RocketIcon size={24} /> },
        { name: 'English & Communication', icon: <GlobeIcon size={24} /> },
        { name: 'Health & Self-Improvement', icon: <StarIcon size={24} /> },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, enrollmentsRes] = await Promise.all([
                    axios.get('/api/courses'),
                    user ? axios.get('/api/enrollments') : Promise.resolve({ data: { enrollments: [] } })
                ]);

                const coursesData = Array.isArray(coursesRes.data)
                    ? coursesRes.data
                    : (coursesRes.data.courses || []);
                setCourses(coursesData);

                if (user && enrollmentsRes.data.enrollments) {
                    setEnrollments(enrollmentsRes.data.enrollments);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const renderCourseCard = (course, progress = null) => (
        <Link
            key={course.id}
            to={`/course/${course.slug}`}
            className="linkedin-course-card"
        >
            <div className="linkedin-card-thumbnail">
                <img
                    src={course.thumbnailUrl || 'https://via.placeholder.com/280x158?text=Course'}
                    alt={course.title}
                />
                <div className="linkedin-card-duration">
                    <ClockIcon size={12} /> {course.estimated_hours || course.estimatedHours || 'N/A'}
                </div>
            </div>
            <div className="linkedin-card-content">
                <h3 className="linkedin-card-title">{course.title}</h3>
                <p className="linkedin-card-instructor">FreeCodeCamp</p>
                <div className="linkedin-card-meta">
                    <div className="linkedin-card-rating">
                        <span className="linkedin-card-rating-star"><StarIcon size={12} filled={true} color="#b4690e" /></span>
                        {course.likes && <span>{course.likes}</span>}
                        {course.views && <span>({course.views})</span>}
                    </div>
                </div>
            </div>
            {progress !== null && (
                <div className="linkedin-card-progress">
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="progress-text">{progress}% complete</p>
                </div>
            )}
        </Link>
    );

    // Mock featured courses if loading or empty, otherwise pick top 3
    const featuredCourses = courses.length > 0 ? courses.slice(0, 3) : [];

    return (
        <div className="homepage">
            <Navbar />

            {/* Hero Carousel */}
            {!loading && featuredCourses.length > 0 && (
                <HeroCarousel featuredCourses={featuredCourses} />
            )}

            <div className="homepage-content">
                {/* Category Pills */}
                <div className="category-section">
                    <div className="category-pills">
                        {categories.map((category, idx) => (
                            <button
                                key={idx}
                                className={`category-pill ${activeCategory === category.name ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category.name)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Continue Learning Section */}
                {user && enrollments.length > 0 && (
                    <div className="course-section continue-learning">
                        <div className="section-header">
                            <h2 className="section-title">{t('continueLearning')}</h2>
                            <Link to="/dashboard" className="section-see-all">
                                {t('seeAll')} <ArrowRightIcon size={14} />
                            </Link>
                        </div>
                        <div className="course-carousel">
                            {enrollments.slice(0, 5).map((enrollment) => renderCourseCard(enrollment.course, enrollment.progress))}
                        </div>
                    </div>
                )}

                {/* Browse Topics */}
                <div className="course-section">
                    <div className="section-header">
                        <h2 className="section-title">Explore Topics</h2>
                    </div>
                    <div className="topics-grid">
                        {categories.map((cat, idx) => (
                            <Link to={`/explore?category=${encodeURIComponent(cat.name)}`} key={idx} className="topic-card">
                                <div className="topic-icon">{cat.icon}</div>
                                <span className="topic-name">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recommended for You */}
                <div className="course-section">
                    <div className="section-header">
                        <h2 className="section-title">{t('recommended')}</h2>
                        <Link to="/explore" className="section-see-all">
                            {t('seeAll')} <ArrowRightIcon size={14} />
                        </Link>
                    </div>
                    <div className="course-carousel">
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="linkedin-course-card skeleton">
                                    <div className="linkedin-card-thumbnail shimmer"></div>
                                    <div className="linkedin-card-content">
                                        <div className="skeleton-line title shimmer"></div>
                                        <div className="skeleton-line shimmer"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            courses
                                .filter(course => !enrollments.some(e => e.course.id === course.id))
                                .slice(0, 5)
                                .map((course) => renderCourseCard(course))
                        )}
                    </div>
                </div>

                {/* Learning Paths */}
                <div className="course-section">
                    <div className="section-header">
                        <h2 className="section-title">Learning Paths</h2>
                    </div>
                    <div className="paths-grid">
                        <Link to="/roadmap" className="path-card">
                            <div className="path-icon"><CodeIcon size={28} color="#0071e3" /></div>
                            <div className="path-info">
                                <h3>Software Engineer</h3>
                                <p>Master Python, Java, and System Design</p>
                                <span className="path-meta">12 Courses • 40h</span>
                            </div>
                        </Link>
                        <Link to="/roadmap" className="path-card">
                            <div className="path-icon"><ChartBarIcon size={28} color="#0071e3" /></div>
                            <div className="path-info">
                                <h3>Data Scientist</h3>
                                <p>Learn Python, SQL, and Machine Learning</p>
                                <span className="path-meta">15 Courses • 55h</span>
                            </div>
                        </Link>
                        <Link to="/roadmap" className="path-card">
                            <div className="path-icon"><PenToolIcon size={28} color="#0071e3" /></div>
                            <div className="path-info">
                                <h3>Product Designer</h3>
                                <p>UI/UX, Figma, and User Research</p>
                                <span className="path-meta">8 Courses • 25h</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* New & Trending */}
                <div className="course-section">
                    <div className="section-header">
                        <h2 className="section-title">{t('trending')}</h2>
                        <Link to="/explore" className="section-see-all">
                            {t('seeAll')} <ArrowRightIcon size={14} />
                        </Link>
                    </div>
                    <div className="course-carousel">
                        {!loading && courses
                            .filter(course => !enrollments.some(e => e.course.id === course.id))
                            .slice().reverse().slice(0, 5)
                            .map((course) => renderCourseCard(course))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
