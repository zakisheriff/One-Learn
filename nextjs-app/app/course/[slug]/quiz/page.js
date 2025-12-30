'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckIcon as CheckCircle, XIcon as XCircle, StarIcon as Award } from '../../../components/Icons';
import '../../../styles/LearningPage.css'; // Reusing some basic styles

const SAMPLE_QUESTIONS = [
    {
        id: 1,
        question: "What is the primary purpose of the technology learned in this course?",
        options: ["To build responsive user interfaces", "To manage database queries efficiently", "To style web pages", "To compile code to machine language"],
        correct: 0
    },
    {
        id: 2,
        question: "Which of the following is considered a best practice?",
        options: ["Writing all code in one file", "Using meaningful variable names", "Ignoring error handling", "Hardcoding sensitive data"],
        correct: 1
    },
    {
        id: 3,
        question: "What comes next after completing this module?",
        options: ["Advanced topics and optimization", "Retiring", "Nothing, you know everything", "Switching careers immediately"],
        correct: 0
    },
    {
        id: 4,
        question: "Which hook is used for side effects in React?",
        options: ["useState", "useEffect", "useMemo", "useContext"],
        correct: 1
    },
    {
        id: 5,
        question: "What does HTML stand for?",
        options: ["HyperText Markup Language", "HighText Machine Language", "HyperText Machine Language", "HighText Markup Language"],
        correct: 0
    },
    {
        id: 6,
        question: "What is the purpose of CSS?",
        options: ["To structure web pages", "To program logic", "To style web pages", "To manage databases"],
        correct: 2
    },
    {
        id: 7,
        question: "Which of these is a JavaScript framework?",
        options: ["Python", "Django", "React", "Laravel"],
        correct: 2
    },
    {
        id: 8,
        question: "What is Git used for?",
        options: ["Running code", "Version control", "Text editing", "Database management"],
        correct: 1
    },
    {
        id: 9,
        question: "What does API stand for?",
        options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Program Instruction", "Application Protocol Interface"],
        correct: 0
    },
    {
        id: 10,
        question: "Which symbol is used for IDs in CSS?",
        options: [".", "#", "*", "@"],
        correct: 1
    }
];

export default function QuizPage() {
    const router = useRouter();
    const params = useParams();
    const [currentPage, setCurrentPage] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const QUESTIONS_PER_PAGE = 5;
    const totalPages = Math.ceil(SAMPLE_QUESTIONS.length / QUESTIONS_PER_PAGE);

    const handleAnswer = (questionId, optionIdx) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(curr => curr + 1);
            window.scrollTo(0, 0);
        } else {
            calculateResults();
        }
    };

    const calculateResults = () => {
        let newScore = 0;
        SAMPLE_QUESTIONS.forEach((q) => {
            if (answers[q.id] === q.correct) newScore++;
        });
        setScore(newScore);
        setShowResults(true);
    };

    if (showResults) {
        return (
            <div className="learning-container" style={{ justifyContent: 'center', alignItems: 'center', background: '#000', overflow: 'hidden' }}>
                <div style={{ background: '#111', padding: '60px', borderRadius: '32px', border: '1px solid #333', textAlign: 'center', maxWidth: '600px', width: '90%' }}>
                    <Award size={80} color="#eab308" style={{ margin: '0 auto 24px' }} />
                    <h1 style={{ fontSize: '36px', marginBottom: '16px', fontWeight: 700 }}>Quiz Complete!</h1>
                    <p style={{ fontSize: '20px', marginBottom: '32px', color: '#888' }}>
                        You scored <span style={{ color: 'white', fontWeight: 600 }}>{score}</span> out of {SAMPLE_QUESTIONS.length}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link href={`/course/${params.slug}/learn`} className="action-btn secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                            Back to Lessons
                        </Link>
                        <Link href="/" className="action-btn primary">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const startIndex = currentPage * QUESTIONS_PER_PAGE;
    const currentQuestions = SAMPLE_QUESTIONS.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);

    // Check if all questions on this page are answered
    const isPageComplete = currentQuestions.every(q => answers[q.id] !== undefined);

    return (
        <div className="learning-container" style={{
            background: '#000',
            display: 'block', // Disable flex lock
            height: 'auto', // Allow full height
            minHeight: '100vh',
            overflowY: 'auto', // Enable scrolling
            paddingTop: '80px', // Clear navbar
            paddingBottom: '100px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '900px',
                margin: '0 auto', // Center horizontally
                padding: '0 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '32px'
            }}>

                {/* Header */}
                <div style={{ padding: '0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Final Assessment</h1>
                        <span style={{ color: '#888' }}>Page {currentPage + 1} of {totalPages}</span>
                    </div>
                    <span style={{ color: '#0a84ff', fontWeight: 600, background: 'rgba(10, 132, 255, 0.1)', padding: '6px 12px', borderRadius: '100px', fontSize: '13px' }}>
                        {SAMPLE_QUESTIONS.length} Questions
                    </span>
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {currentQuestions.map((q, index) => (
                        <div key={q.id} style={{
                            background: '#111',
                            borderRadius: '32px',
                            border: '1px solid #333',
                            overflow: 'hidden',
                            padding: '40px'
                        }}>
                            <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                                <span style={{
                                    minWidth: '32px', height: '32px',
                                    background: '#333', color: '#fff',
                                    borderRadius: '50%', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', fontWeight: 600
                                }}>
                                    {startIndex + index + 1}
                                </span>
                                <h2 style={{ fontSize: '20px', lineHeight: '1.5', fontWeight: 600 }}>{q.question}</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginLeft: '48px' }}>
                                {q.options.map((opt, optIdx) => (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleAnswer(q.id, optIdx)}
                                        style={{
                                            padding: '16px 24px',
                                            background: answers[q.id] === optIdx ? 'rgba(10, 132, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                                            border: answers[q.id] === optIdx ? '1px solid #0a84ff' : '1px solid transparent',
                                            borderRadius: '16px',
                                            textAlign: 'left',
                                            color: answers[q.id] === optIdx ? '#0a84ff' : '#ccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '15px'
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', paddingBottom: '60px' }}>
                    <button
                        className="action-btn primary"
                        onClick={handleNextPage}
                        disabled={!isPageComplete}
                        style={{
                            opacity: isPageComplete ? 1 : 0.5,
                            padding: '16px 40px',
                            fontSize: '16px'
                        }}
                    >
                        {currentPage === totalPages - 1 ? 'Finish Quiz' : 'Next Page'}
                    </button>
                </div>
            </div>
        </div>
    );
}
