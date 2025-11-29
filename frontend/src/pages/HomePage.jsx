import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { StarIcon, ClockIcon, LessonIcon, ArrowRightIcon, BookIcon, CodeIcon, ChartBarIcon, PenToolIcon, RocketIcon } from '../components/Icons';
import '../styles/HomePage.css';

const HomePage = () => {
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

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
        const fetchData = async () => {
            try {
                const [coursesRes, enrollmentsRes] = await Promise.all([
                    axios.get('/api/courses'),
                    user ? axios.get('/api/enrollments') : Promise.resolve({ data: { enrollments: [] } })
                ]);

                // Handle courses data
                const coursesData = Array.isArray(coursesRes.data)
                    ? coursesRes.data
                    : (coursesRes.data.courses || []);
                setCourses(coursesData);

                // Handle enrollments data
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
                        {course.likes && <span>{course.likes} likes</span>}
                        {course.likes && course.views && <span style={{ margin: '0 4px', color: '#ccc' }}>•</span>}
                        {course.views && <span>{course.views} views</span>}
                    </div>
                    <div className="linkedin-card-stats">
                        <span>•</span>
                        <LessonIcon size={12} />
                        <span>Multiple lessons</span>
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

    return (
        <div className="homepage">
            <Navbar />

            {/* Hero Banner */}
            <div className="hero-banner">
                <div className="hero-content">
                    <h1>{t('heroTitle')}</h1>
                    <p>{t('heroSubtitle')}</p>
                    <Link to="/explore" className="hero-cta">
                        <span>{t('exploreCourses')}</span>
                        <ArrowRightIcon size={16} />
                    </Link>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-number">10k+</span>
                    <span className="stat-label">Learners</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Courses</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-number">100+</span>
                    <span className="stat-label">Mentors</span>
                </div>
            </div>

            {/* Roadmap CTA Section */}
            <div className="roadmap-cta-section">
                <div className="roadmap-cta-content">
                    <h2>Not sure where to start?</h2>
                    <p>Tell us your dream career, and our AI will build a personalized learning path just for you.</p>
                    <Link to="/roadmap" className="roadmap-btn">
                        <StarIcon size={18} />
                        <span>Generate My Roadmap</span>
                    </Link>
                </div>
            </div>

            {/* Featured Career Paths */}
            <div className="course-section">
                <div className="section-header">
                    <h2 className="section-title">Featured Career Paths</h2>
                </div>
                <div className="paths-grid">
                    <Link to="/roadmap" className="path-card">
                        <div className="path-icon"><CodeIcon size={32} color="#0071e3" /></div>
                        <h3>Software Engineer</h3>
                        <p>Master Python, Java, and System Design</p>
                    </Link>
                    <Link to="/roadmap" className="path-card">
                        <div className="path-icon"><ChartBarIcon size={32} color="#0071e3" /></div>
                        <h3>Data Scientist</h3>
                        <p>Learn Python, SQL, and Machine Learning</p>
                    </Link>
                    <Link to="/roadmap" className="path-card">
                        <div className="path-icon"><PenToolIcon size={32} color="#0071e3" /></div>
                        <h3>Product Designer</h3>
                        <p>UI/UX, Figma, and User Research</p>
                    </Link>
                    <Link to="/roadmap" className="path-card">
                        <div className="path-icon"><RocketIcon size={32} color="#0071e3" /></div>
                        <h3>Product Manager</h3>
                        <p>Strategy, Agile, and Leadership</p>
                    </Link>
                </div>
            </div>

            {/* Continue Learning Section (Always visible if user is logged in) */}
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

            {/* Category Pills */}
            <div className="category-section">
                <div className="category-pills">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filtered View (if category selected) */}
            {activeCategory !== 'All' ? (
                <div className="course-section">
                    <div className="section-header">
                        <h2 className="section-title">Top courses in {activeCategory}</h2>
                    </div>
                    <div className="course-carousel">
                        {courses
                            .filter(course =>
                                (activeCategory === 'All' || course.category === activeCategory) &&
                                !enrollments.some(e => e.course.id === course.id) // Filter out enrolled courses
                            )
                            .map((course) => renderCourseCard(course))}
                    </div>
                    {courses.filter(course =>
                        (activeCategory === 'All' || course.category === activeCategory) &&
                        !enrollments.some(e => e.course.id === course.id)
                    ).length === 0 && (
                            <div className="section-empty">
                                <div className="section-empty-icon"><BookIcon size={48} color="#0000004d" /></div>
                                <h3>No new courses found</h3>
                                <p>You've enrolled in all courses in this category!</p>
                            </div>
                        )}
                </div>
            ) : (
                <>
                    {/* Recommended for You */}
                    <div className="course-section">
                        <div className="section-header">
                            <h2 className="section-title">{t('recommended')}</h2>
                            <Link to="/explore" className="section-see-all">
                                {t('seeAll')} <ArrowRightIcon size={14} />
                            </Link>
                        </div>
                        {loading ? (
                            <div className="course-carousel">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="linkedin-course-card">
                                        <div className="linkedin-card-thumbnail shimmer"></div>
                                        <div className="linkedin-card-content">
                                            <div className="skeleton-line title shimmer"></div>
                                            <div className="skeleton-line shimmer"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="course-carousel">
                                {courses
                                    .filter(course => !enrollments.some(e => e.course.id === course.id)) // Filter out enrolled
                                    .slice(0, 5)
                                    .map((course) => renderCourseCard(course))}
                            </div>
                        )}
                    </div>

                    {/* Trending Courses */}
                    <div className="course-section">
                        <div className="section-header">
                            <h2 className="section-title">{t('trending')}</h2>
                            <Link to="/explore" className="section-see-all">
                                {t('seeAll')} <ArrowRightIcon size={14} />
                            </Link>
                        </div>
                        {loading ? (
                            <div className="course-carousel">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="linkedin-course-card">
                                        <div className="linkedin-card-thumbnail shimmer"></div>
                                        <div className="linkedin-card-content">
                                            <div className="skeleton-line title shimmer"></div>
                                            <div className="skeleton-line shimmer"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="course-carousel">
                                {courses
                                    .filter(course => !enrollments.some(e => e.course.id === course.id)) // Filter out enrolled
                                    .slice().reverse().slice(0, 5)
                                    .map((course) => renderCourseCard(course))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default HomePage;
