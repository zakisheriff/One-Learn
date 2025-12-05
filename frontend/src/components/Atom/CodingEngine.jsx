import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PlayIcon, CheckIcon, XIcon } from '../Icons';
import '../../styles/CodingEngine.css';

const CodingEngine = ({ content, onComplete }) => {
    const [code, setCode] = useState(content.starter_code || '');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [pyodide, setPyodide] = useState(null);
    const [testResults, setTestResults] = useState(null);
    const [isPyodideLoading, setIsPyodideLoading] = useState(false);

    // Load Pyodide
    useEffect(() => {
        if (content.language === 'python' && !pyodide) {
            const loadPyodide = async () => {
                setIsPyodideLoading(true);
                try {
                    // Check if already loaded globally
                    if (window.pyodide) {
                        setPyodide(window.pyodide);
                        setIsPyodideLoading(false);
                        return;
                    }

                    // Load script
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
                    script.async = true;
                    script.onload = async () => {
                        try {
                            const py = await window.loadPyodide({
                                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"
                            });
                            window.pyodide = py;
                            setPyodide(py);
                        } catch (err) {
                            console.error('Failed to initialize Pyodide:', err);
                            setOutput('Error: Failed to initialize Python environment.');
                        } finally {
                            setIsPyodideLoading(false);
                        }
                    };
                    script.onerror = () => {
                        console.error('Failed to load Pyodide script');
                        setOutput('Error: Failed to load Python script.');
                        setIsPyodideLoading(false);
                    };
                    document.body.appendChild(script);
                } catch (err) {
                    console.error('Failed to load Pyodide script:', err);
                    setIsPyodideLoading(false);
                }
            };
            loadPyodide();
        }
    }, [content.language]);

    const runCode = async () => {
        if (!pyodide && content.language === 'python') {
            setOutput('Python environment is still loading...');
            return;
        }

        setIsRunning(true);
        setOutput('');
        setTestResults(null);

        try {
            // Capture stdout
            pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
            `);

            // Run user code
            await pyodide.runPythonAsync(code);

            // Get stdout
            const stdout = pyodide.runPython("sys.stdout.getvalue()");
            setOutput(stdout);

            // Run Test Cases
            if (content.test_cases && content.test_cases.length > 0) {
                runTestCases(stdout);
            }

        } catch (err) {
            setOutput(`Error:\n${err.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const runTestCases = async (userOutput) => {
        const results = [];
        let allPassed = true;

        for (const test of content.test_cases) {
            try {
                // Prepare test execution
                // We need to reset stdout, run user code (defining functions), then run the test input

                // This is a simplified test runner. 
                // Ideally, we'd wrap the user code in a function or use a more robust testing framework inside Pyodide.
                // For now, we'll assume the user code defines a function or prints output matching expected.

                // Strategy: If test has 'input', we might need to mock input(). 
                // If it expects a return value, we need to call the function.
                // If it expects stdout, we compare stdout.

                // SIMPLE STDOUT MATCHING FOR NOW (MVP)
                // If expected_output is present, check if it exists in stdout

                // TODO: Implement robust function calling based on problem definition

                const passed = userOutput.trim().includes(test.expected_output.trim());
                results.push({
                    input: test.input,
                    expected: test.expected_output,
                    actual: passed ? test.expected_output : 'Different output',
                    passed
                });

                if (!passed) allPassed = false;

            } catch (err) {
                results.push({
                    input: test.input,
                    expected: test.expected_output,
                    actual: 'Error',
                    passed: false
                });
                allPassed = false;
            }
        }

        setTestResults(results);

        if (allPassed) {
            setTimeout(() => {
                alert('All tests passed! Module Complete.');
                onComplete();
            }, 500);
        }
    };

    return (
        <div className="coding-engine" >
            <div className="coding-workspace">
                <div className="editor-pane">
                    <div className="pane-header">
                        <span>Code Editor ({content.language})</span>
                        {isPyodideLoading && <span className="loading-badge">Loading Python...</span>}
                    </div>
                    <Editor
                        height="60vh"
                        defaultLanguage={content.language}
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>
                <div className="output-pane">
                    <div className="pane-header">
                        <span>Output</span>
                        <button
                            className="run-btn"
                            onClick={runCode}
                            disabled={isRunning || (content.language === 'python' && !pyodide)}
                        >
                            {isRunning ? 'Running...' : <><PlayIcon size={16} /> Run Code</>}
                        </button>
                    </div>
                    <pre className="terminal-output">
                        {output || 'Run your code to see output here...'}
                    </pre>

                    {testResults && (
                        <div className="test-results">
                            <h4>Test Results</h4>
                            {testResults.map((result, index) => (
                                <div key={index} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                                    <div className="test-status">
                                        {result.passed ? <CheckIcon size={16} /> : <XIcon size={16} />}
                                        <span>Test {index + 1}</span>
                                    </div>
                                    {!result.passed && (
                                        <div className="test-details">
                                            <small>Expected: {result.expected}</small>
                                            <small>Actual: {result.actual}</small>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodingEngine;
