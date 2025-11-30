import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckIcon } from '../components/Icons';
import '../styles/QuizPage.css';

const QuizPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const questionsPerPage = 5;

    // Privacy & Anti-Cheating Logic
    const [isWindowFocused, setIsWindowFocused] = useState(true);

    useEffect(() => {
        const handleFocus = () => setIsWindowFocused(true);
        const handleBlur = () => setIsWindowFocused(false);

        const handleKeyDown = (e) => {
            // Block common screenshot/dev tools shortcuts
            if (
                (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) || // Mac Screenshot
                (e.ctrlKey && e.key === 'p') || // Print
                (e.key === 'F12') || // Dev Tools
                (e.metaKey && e.altKey && e.key === 'i') // Mac Dev Tools
            ) {
                e.preventDefault();
                alert('Screenshots and developer tools are disabled during the quiz.');
            }
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        fetchQuiz();
    }, [slug]);

    const fetchQuiz = async () => {
        try {
            const response = await axios.get(`/api/courses/${slug}/quiz`);
            setQuiz(response.data.quiz);
        } catch (err) {
            console.error('Failed to load quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await axios.post(`/api/quizzes/${quiz.id}/submit`, { answers });
            setResult(response.data.result);

            // If passed, redirect to certificate page after a delay
            if (response.data.result.passed) {
                setTimeout(() => {
                    navigate(`/course/${slug}/certificate`);
                }, 3000);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.details || err.response?.data?.error || err.message;
            alert('Failed to submit quiz: ' + errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        setCurrentPage(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handlePrevious = (e) => {
        e.preventDefault();
        setCurrentPage(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    if (!quiz && !loading) {
        return (
            <div className="quiz-page">
                <div className="error-state">
                    <p>Quiz not available</p>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="quiz-page">
                <main className="quiz-main">
                    <div className="container">
                        <div className={`result-card ${result.passed ? 'passed' : 'failed'}`}>
                            <div className="result-icon">
                                {result.passed ? (
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" fill="#2D9F5D" />
                                        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" fill="#E67E22" />
                                        <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <h1>{result.passed ? 'Congratulations!' : 'Keep Learning'}</h1>
                            <div className="score-display">
                                <span className="score">{result.score}%</span>
                                <span className="score-label">Your Score</span>
                            </div>
                            <p className="result-message">
                                {result.passed
                                    ? `You passed! You got ${result.correctAnswers} out of ${result.totalQuestions} questions correct.`
                                    : `You need ${quiz.passingScore}% to pass. You got ${result.correctAnswers} out of ${result.totalQuestions} questions correct. Try again!`
                                }
                            </p>
                            {result.passed && (
                                <p className="redirect-message">
                                    Redirecting to your certificate...
                                </p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Pagination Logic
    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestions = quiz ? quiz.questions.slice(indexOfFirstQuestion, indexOfLastQuestion) : [];
    const totalPages = quiz ? Math.ceil(quiz.questions.length / questionsPerPage) : 0;

    return (
        <div className="quiz-page">
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading quiz...</p>
                </div>
            ) : (
                <>

                    {/* Privacy Overlay when window is blurred */}
                    {!isWindowFocused && (
                        <div className="privacy-overlay">
                            <div className="privacy-message">
                                <h2>Quiz Paused</h2>
                                <p>Please return to this window to continue your quiz.</p>
                                <p className="privacy-warning">Leaving the window is not allowed.</p>
                            </div>
                        </div>
                    )}

                    <main className={`quiz-main ${!isWindowFocused ? 'blurred' : ''}`}>
                        <div className="container">
                            <header className="quiz-header">
                                <h1>Final Quiz</h1>
                                <p>You need {quiz.passingScore}% to pass and earn your certificate</p>
                                <div className="quiz-progress">
                                    Page {currentPage} of {totalPages}
                                </div>
                            </header>

                            <form onSubmit={handleSubmit} className="quiz-form">
                                {currentQuestions.map((question, index) => {
                                    const globalIndex = indexOfFirstQuestion + index;
                                    return (
                                        <div key={globalIndex} className="question-card">
                                            <div className="question-header">
                                                <span className="question-number">Question {globalIndex + 1}</span>
                                                <span className="question-type">{question.type.replace('_', ' ')}</span>
                                            </div>

                                            <p className="question-text">{question.question}</p>

                                            {question.type === 'multiple_choice' && (
                                                <div className="options-list">
                                                    {question.options.map((option, optionIndex) => (
                                                        <label key={optionIndex} className="option-label">
                                                            <input
                                                                type="radio"
                                                                name={`question-${globalIndex}`}
                                                                value={optionIndex}
                                                                checked={answers[globalIndex] === optionIndex}
                                                                onChange={() => handleAnswerChange(globalIndex, optionIndex)}
                                                                required
                                                            />
                                                            <span>{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="quiz-controls" style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                                    {currentPage > 1 && (
                                        <button type="button" onClick={handlePrevious} className="nav-button secondary">
                                            Previous
                                        </button>
                                    )}

                                    {currentPage < totalPages ? (
                                        <button key="next-btn" type="button" onClick={handleNext} className="nav-button primary" style={{ marginLeft: 'auto' }}>
                                            Next
                                        </button>
                                    ) : (
                                        <button key="submit-btn" type="submit" className="submit-quiz-button" disabled={submitting} style={{ marginLeft: 'auto' }}>
                                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </main>
                </>
            )}
        </div>
    );
};

export default QuizPage;

