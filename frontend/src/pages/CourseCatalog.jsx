import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import Navbar from '../components/Navbar';
import '../styles/CourseCatalog.css';

const CourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('/api/courses');
            setCourses(response.data.courses);
        } catch (err) {
            setError('Failed to load courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="course-catalog-page">
            <Navbar />

            <main className="catalog-main">
                <div className="container">
                    <header className="catalog-header">
                        <h1>Explore Free Courses</h1>
                        <p>Learn from the best YouTube content with AI-powered assessments and earn verified certificates</p>
                    </header>

                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading courses...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && courses.length === 0 && (
                        <div className="empty-state">
                            <p>No courses available yet. Check back soon!</p>
                        </div>
                    )}

                    {!loading && !error && courses.length > 0 && (
                        <div className="course-grid">
                            {courses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="catalog-footer">
                <div className="container">
                    <p>&copy; 2025 You Learn. 100% Free Learning Platform.</p>
                </div>
            </footer>
        </div>
    );
};

export default CourseCatalog;
