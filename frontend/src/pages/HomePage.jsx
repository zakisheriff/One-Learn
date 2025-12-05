import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import {
    StarIcon, ClockIcon, LessonIcon, ArrowRightIcon, BookIcon,
    CodeIcon, ChartBarIcon, PenToolIcon, RocketIcon,
    GlobeIcon, PlayIcon, CheckIcon
} from '../components/Icons';
import '../styles/HomePage.css';
import OnboardingModal from '../components/OnboardingModal';

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
                        <p className="hero-instructor">By {currentCourse.instructor || 'One Learn Instructor'} • {currentCourse.estimated_hours || '2h 30m'}</p>
                        <p className="hero-description">{currentCourse.description}</p>
                        <div className="hero-actions">
                            <Link to={`/course/${currentCourse.slug}`} className="hero-btn-primary">
                                <PlayIcon size={16} /> Start Learning
                            </Link>

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
                    <ClockIcon size={12} /> {course.estimated_hours || course.estimatedHours || course.duration || 'N/A'}
                </div>
            </div>
            <div className="linkedin-card-content">
                <h3 className="linkedin-card-title">{course.title}</h3>
                <p className="linkedin-card-instructor">{course.instructor || 'One Learn Instructor'}</p>
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

    // Filter specific featured courses
    const featuredSlugs = ['freecodecamp-learn-to-code', 'cs50-harvard', 'aws-training'];
    let featuredCourses = courses.filter(c => featuredSlugs.includes(c.slug));

    // Sort to match the order in featuredSlugs
    featuredCourses.sort((a, b) => featuredSlugs.indexOf(a.slug) - featuredSlugs.indexOf(b.slug));

    // Fallback if specific courses aren't found
    if (featuredCourses.length === 0 && courses.length > 0) {
        featuredCourses = courses.slice(0, 3);
    }

    return (
        <div className={`homepage ${!loading ? 'content-fade-in' : ''}`}>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <>
                    {user && (!user.interests || user.interests.length === 0) && (
                        <OnboardingModal onClose={() => { }} />
                    )}

                    {/* Mission Banner */}
                    <div className="mission-banner">
                        <div className="mission-content">
                            <div className="mission-header">
                                <h2>Turn YouTube Time into Credentials</h2>
                                <p>A completely free platform to master skills and get certified.</p>
                            </div>
                            <div className="mission-steps">
                                <div className="mission-step">
                                    <div className="mission-icon-wrapper">
                                        <PlayIcon size={24} />
                                    </div>
                                    <div className="mission-text">
                                        <h3>1. Watch</h3>
                                        <p>Curated free YouTube courses</p>
                                    </div>
                                </div>
                                <div className="mission-step">
                                    <div className="mission-icon-wrapper">
                                        <BookIcon size={24} />
                                    </div>
                                    <div className="mission-text">
                                        <h3>2. Learn</h3>
                                        <p>Structured curriculum & progress</p>
                                    </div>
                                </div>
                                <div className="mission-step">
                                    <div className="mission-icon-wrapper">
                                        <CheckIcon size={24} />
                                    </div>
                                    <div className="mission-text">
                                        <h3>3. Certify</h3>
                                        <p>Pass the exam & earn a certificate</p>
                                    </div>
                                </div>
                            </div>
                        </div >
                    </div >

                    {/* Hero Carousel */}
                    {
                        !loading && featuredCourses.length > 0 && (
                            <HeroCarousel featuredCourses={featuredCourses} />
                        )
                    }



                    <div className="homepage-content">


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

                        {/* Micro-Learning (Under 30 Mins) */}
                        {(() => {
                            const microCourses = courses.filter(c => {
                                const durationStr = c.estimated_hours || c.estimatedHours || c.duration || "0";
                                let hours = 0;
                                const str = String(durationStr).toLowerCase();

                                // Debug log
                                // console.log(`Course: ${c.title}, Duration: ${durationStr}, Parsed: ${str}`);

                                if (str.includes('min') || str.includes(' m') || (str.endsWith('m') && !str.includes('h'))) {
                                    hours = parseFloat(str) / 60;
                                } else if (str.includes('h')) {
                                    const parts = str.split('h');
                                    hours = parseFloat(parts[0]);
                                    if (parts[1]) {
                                        let minutes = 0;
                                        if (parts[1].includes('m')) {
                                            minutes = parseFloat(parts[1]);
                                        } else {
                                            minutes = parseFloat(parts[1]);
                                        }
                                        hours += minutes / 60;
                                    }
                                } else {
                                    hours = parseFloat(str);
                                }

                                return hours > 0 && hours <= 0.5;
                            });

                            if (loading || microCourses.length === 0) return null;

                            return (
                                <div className="course-section">
                                    <div className="section-header">
                                        <h2 className="section-title">Micro-Learning (Under 30 Mins)</h2>
                                        <Link to="/explore?duration=micro" className="section-see-all">
                                            {t('seeAll')} <ArrowRightIcon size={14} />
                                        </Link>
                                    </div>
                                    <div className="course-carousel">
                                        {microCourses.slice(0, 10).map((course) => renderCourseCard(course))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Recommended for You */}
                        <div className="course-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    {user && user.interests && user.interests.length > 0
                                        ? `Recommended for You`
                                        : 'Recommended for You'}
                                </h2>
                            </div>
                            <div className="course-carousel">
                                {(() => {
                                    let recommendedCourses = [];

                                    if (user && user.interests && user.interests.length > 0) {
                                        // Filter courses based on user interests
                                        recommendedCourses = courses.filter(course =>
                                            user.interests.some(interest =>
                                                (course.category && course.category.toLowerCase().includes(interest.toLowerCase())) ||
                                                (course.title && course.title.toLowerCase().includes(interest.toLowerCase())) ||
                                                (course.tags && course.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())))
                                            )
                                        );
                                    }

                                    // Fallback if no interests or no matches found
                                    if (recommendedCourses.length === 0) {
                                        recommendedCourses = courses.slice(0, 5);
                                    } else {
                                        recommendedCourses = recommendedCourses.slice(0, 5);
                                    }

                                    return recommendedCourses.map(course => renderCourseCard(course));
                                })()}
                            </div>
                        </div>


                        {/* New Releases */}
                        <div className="course-section">
                            <div className="section-header">
                                <h2 className="section-title">New Releases</h2>
                                <Link to="/explore?sort=newest" className="section-see-all">
                                    {t('seeAll')} <ArrowRightIcon size={14} />
                                </Link>
                            </div>
                            <div className="course-carousel">
                                {!loading && courses
                                    .slice()
                                    .reverse() // Assuming courses are fetched in ID order, reverse gives newest
                                    .slice(0, 5)
                                    .map((course) => renderCourseCard(course))
                                }
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

                        {/* Editors' Picks */}
                        <div className="course-section">
                            <div className="section-header">
                                <h2 className="section-title">Editors' Picks</h2>
                                <Link to="/explore?collection=editors-picks" className="section-see-all">
                                    {t('seeAll')} <ArrowRightIcon size={14} />
                                </Link>
                            </div>
                            <div className="course-carousel">
                                {!loading && courses
                                    .slice()
                                    .sort(() => 0.5 - Math.random()) // Random shuffle for "picks"
                                    .slice(0, 5)
                                    .map((course) => renderCourseCard(course))
                                }
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
                </>
            )}
        </div>
    );
};

export default HomePage;
