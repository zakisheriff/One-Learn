'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon, CheckIcon, XIcon } from '../Icons';
import '../../styles/QuizEngine.css';

const QuizEngine = ({ content, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(content.time_limit_seconds || 600);
    const [isFinished, setIsFinished] = useState(false);
    const [answers, setAnswers] = useState({}); // Map of questionIndex -> selectedOptionIndex

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isFinished) {
            finishQuiz();
        }
    }, [timeLeft, isFinished]);

    const handleOptionSelect = (optionIndex) => {
        if (isFinished) return;
        setSelectedOption(optionIndex);
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < content.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(answers[currentQuestionIndex + 1] || null);
        } else {
            finishQuiz();
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setSelectedOption(answers[currentQuestionIndex - 1]);
        }
    };

    const finishQuiz = () => {
        setIsFinished(true);
        // Calculate score (Client-side estimation, real validation should happen on server or with hidden answers)
        // Since we don't have correct answers on client (security), we simulate or send to server.
        // For this MVP, we'll assume we send answers to server. 
        // BUT, for the sake of the demo, let's assume we passed if we answered all.

        // In a real app, we'd POST /api/atom/modules/:id/submit

        const answeredCount = Object.keys(answers).length;
        const total = content.questions.length;
        const calculatedScore = Math.round((answeredCount / total) * 100);
        setScore(calculatedScore);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isFinished) {
        return (
            <div className="quiz-results">
                <h2>Quiz Completed!</h2>
                <div className="score-circle">
                    <span>{score}%</span>
                </div>
                <p>You answered {Object.keys(answers).length} out of {content.questions.length} questions.</p>
                <button className="atom-btn-primary" onClick={onComplete}>
                    Continue
                </button>
            </div>
        );
    }

    const question = content.questions[currentQuestionIndex];

    return (
        <div className="quiz-engine">
            <div className="quiz-header">
                <div className="question-tracker">
                    Question {currentQuestionIndex + 1} / {content.questions.length}
                </div>
                <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
                    <ClockIcon size={18} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="question-card">
                <h3>{question.question}</h3>
                <div className="options-list">
                    {question.options.map((option, index) => (
                        <div
                            key={index}
                            className={`option-item ${selectedOption === index ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect(index)}
                        >
                            <div className="option-marker">
                                {String.fromCharCode(65 + index)}
                            </div>
                            <div className="option-text">{option}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="quiz-controls">
                <button
                    className="quiz-nav-btn"
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </button>
                <button
                    className="quiz-nav-btn primary"
                    onClick={handleNext}
                    disabled={selectedOption === null}
                >
                    {currentQuestionIndex === content.questions.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default QuizEngine;
