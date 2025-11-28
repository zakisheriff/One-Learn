import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
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

    if (loading) {
        return (
            <div className="quiz-page">
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="quiz-page">
                <Navbar />
                <div className="error-state">
                    <p>Quiz not available</p>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="quiz-page">
                <Navbar />
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

    return (
        <div className="quiz-page">
            <Navbar />

            <main className="quiz-main">
                <div className="container">
                    <header className="quiz-header">
                        <h1>Final Quiz</h1>
                        <p>You need {quiz.passingScore}% to pass and earn your certificate</p>
                    </header>

                    <form onSubmit={handleSubmit} className="quiz-form">
                        {quiz.questions.map((question, index) => (
                            <div key={index} className="question-card">
                                <div className="question-header">
                                    <span className="question-number">Question {index + 1}</span>
                                    <span className="question-type">{question.type.replace('_', ' ')}</span>
                                </div>

                                <p className="question-text">{question.question}</p>

                                {question.type === 'multiple_choice' && (
                                    <div className="options-list">
                                        {question.options.map((option, optionIndex) => (
                                            <label key={optionIndex} className="option-label">
                                                <input
                                                    type="radio"
                                                    name={`question-${index}`}
                                                    value={optionIndex}
                                                    checked={answers[index] === optionIndex}
                                                    onChange={() => handleAnswerChange(index, optionIndex)}
                                                    required
                                                />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {question.type === 'true_false' && (
                                    <div className="options-list">
                                        <label className="option-label">
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value="true"
                                                checked={answers[index] === true}
                                                onChange={() => handleAnswerChange(index, true)}
                                                required
                                            />
                                            <span>True</span>
                                        </label>
                                        <label className="option-label">
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value="false"
                                                checked={answers[index] === false}
                                                onChange={() => handleAnswerChange(index, false)}
                                                required
                                            />
                                            <span>False</span>
                                        </label>
                                    </div>
                                )}

                                {question.type === 'fill_blank' && (
                                    <input
                                        type="text"
                                        className="fill-blank-input"
                                        value={answers[index] || ''}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        placeholder="Your answer"
                                        required
                                    />
                                )}
                            </div>
                        ))}

                        <button type="submit" className="submit-quiz-button" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default QuizPage;
