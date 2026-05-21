import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Play, CheckCircle2, XCircle, Trophy, BookOpen, Layout, Terminal, HelpCircle, Check, AlertTriangle, ChevronRight, Timer, History, Zap, BarChart3, RotateCcw, GraduationCap, Sparkles, Bot, Database } from 'lucide-react';
import Editor from './Editor';
import AIAssistant from './AIAssistant';
import DatabaseSchema from './DatabaseSchema';
import pythonEngine from '../lib/pythonEngine';
import sqlEngine from '../lib/sqlEngine';
import { PRACTICE_TOPICS, PROBLEMS } from '../data/problems';
import { db } from '../lib/firebase';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
const Practice = ({ onClose, initialTopic, initialProblemIndex }) => {
    const { user } = useAuth();
    const [selectedTopic, setSelectedTopic] = useState(initialTopic || PRACTICE_TOPICS[0]);
    const [selectedProblemIndex, setSelectedProblemIndex] = useState(initialProblemIndex !== undefined ? initialProblemIndex : 0);

    useEffect(() => {
        if (initialTopic) {
            setSelectedTopic(initialTopic);
        }
        if (initialProblemIndex !== undefined) {
            setSelectedProblemIndex(initialProblemIndex);
        }
    }, [initialTopic, initialProblemIndex]);
    const [code, setCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [outputs, setOutputs] = useState([]);
    const [expandedCases, setExpandedCases] = useState({});
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [activeResultTab, setActiveResultTab] = useState('Results'); // 'Results' | 'Console' | 'History' | 'Tutor'
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isSolved, setIsSolved] = useState(false);

    const editorRef = useRef(null);
    const timerRef = useRef(null);
    const currentProblem = PROBLEMS[selectedTopic][selectedProblemIndex];
    const isSql = currentProblem.id.startsWith('sql');
    const language = isSql ? 'SQL' : 'Python';

    // Load progress and set initial code from Firebase
    useEffect(() => {
        if (!user) return;

        // Fetch solved IDs
        const solvedRef = ref(db, `users/${user.uid}/progress/solved`);
        const unsubscribeSolved = onValue(solvedRef, (snapshot) => {
            const solvedIds = snapshot.val() || [];
            setIsSolved(solvedIds.includes(currentProblem.id));
        });

        // Fetch submissions for this problem
        const subsRef = ref(db, `users/${user.uid}/progress/submissions/${currentProblem.id}`);
        const unsubscribeSubs = onValue(subsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setSubmissions(Object.values(data).reverse());
            } else {
                setSubmissions([]);
            }
        });

        setCode(currentProblem.starter_code || '');
        setTestResults(null);
        setOutputs([]);
        setExpandedCases({});
        resetTimer();
        setActiveResultTab('Results');

        return () => {
            unsubscribeSolved();
            unsubscribeSubs();
        };
    }, [selectedTopic, selectedProblemIndex, user]);

    // Timer Logic
    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [timerActive]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const resetTimer = () => {
        setTimeElapsed(0);
        setTimerActive(false);
    };

    const startTimer = () => {
        if (!timerActive) setTimerActive(true);
    };

    const handleRun = async () => {
        startTimer();
        if (isRunning) return;
        setIsRunning(true);
        setActiveResultTab('Console');
        setOutputs([{ text: 'Running code...', type: 'prompt' }]);

        try {
            if (isSql) {
                sqlEngine.reset();
                if (currentProblem.setup_sql) {
                    await sqlEngine.run(currentProblem.setup_sql);
                }
                const result = await sqlEngine.run(code);
                if (result.success) {
                    if (result.results && result.results.length > 0) {
                        setOutputs([{ results: result.results, type: 'sql_table' }]);
                    } else {
                        setOutputs([{ text: 'Query executed successfully.', type: 'stdout' }]);
                    }
                } else {
                    setOutputs([{ text: result.error, type: 'stderr' }]);
                }
            } else {
                // Virtual File Support for Block 7
                if (currentProblem.id === 'fh1') {
                    await pythonEngine.writeFile('data.txt', currentProblem.input_example);
                }

                // Priority: Input Example > First Test Case > Null
                const inputToUse = currentProblem.input_example || (currentProblem.test_cases.find(tc => tc.input)?.input || null);
                const result = await pythonEngine.run(code, inputToUse);
                setOutputs(result.stdout ? [{ text: result.stdout, type: 'stdout' }] : [{ text: '(No output generated)', type: 'muted' }]);
            }
        } catch (err) {
            setOutputs([{ text: err.message, type: 'stderr' }]);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        startTimer();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setTestResults(null);
        setActiveResultTab('Results');

        const results = { passed: 0, total: currentProblem.test_cases.length, cases: [], avgDuration: 0, status: 'Pending' };

        let totalDuration = 0;
        for (const tc of currentProblem.test_cases) {
            try {
                let actualOutput = "";
                let error = null;
                let duration = 0;

                if (isSql) {
                    sqlEngine.reset();
                    if (currentProblem.setup_sql) {
                        await sqlEngine.run(currentProblem.setup_sql);
                    }
                    const runResult = await sqlEngine.run(code);
                    duration = runResult.duration || 0;

                    if (runResult.success) {
                        // For SQL testing, we might need a specific way to verify results
                        // For now, if expected is "Query executed successfully.", we check success
                        // If it's a specific value, we check the first value of the first result
                        if (tc.expected === "Query executed successfully.") {
                            actualOutput = "Query executed successfully.";
                        } else if (runResult.results && runResult.results.length > 0) {
                            // Join all values in the first row with a space to match the expected format
                            // If multi-row is needed in future, use: runResult.results[0].values.map(row => row.join(' ')).join('\n')
                            actualOutput = runResult.results[0].values[0].map(val => String(val)).join(' ');
                        }
                    } else {
                        error = runResult.error;
                        actualOutput = "Error";
                    }
                } else {
                    // Virtual File Support for Block 7
                    if (currentProblem.id === 'fh1') {
                        await pythonEngine.writeFile('data.txt', tc.input);
                    }

                    const runResult = await pythonEngine.run(code, tc.input);
                    duration = runResult.duration;

                    const normalize = (str) => {
                        if (!str) return "";
                        return str.split('\n')
                            .map(line => line.trimEnd())
                            .filter(line => line.length > 0)
                            .join('\n')
                            .trim();
                    };

                    actualOutput = normalize(runResult.stdout);
                    error = runResult.stderr;
                }

                totalDuration += duration;
                const expectedOutput = tc.expected; // Already normalized if needed in problems.js
                const isPassed = actualOutput === expectedOutput;

                const isHardcoded = !isSql && (code.includes(`print("${expectedOutput}")`) ||
                    code.includes(`print('${expectedOutput}')`)) &&
                    (code.trim().split('\n').length <= 5 && tc.input);

                if (isPassed && !isHardcoded) results.passed++;

                results.cases.push({
                    input: tc.input || 'None',
                    expected: expectedOutput,
                    actual: actualOutput,
                    passed: isPassed && !isHardcoded,
                    isHardcoded: isHardcoded,
                    error: error,
                    duration: duration
                });

            } catch (err) {
                results.cases.push({
                    input: tc.input || 'None',
                    expected: tc.expected,
                    actual: 'Error',
                    passed: false,
                    error: err.message
                });
            }
        }

        results.avgDuration = results.total > 0 ? totalDuration / results.total : 0;
        results.status = results.passed === results.total ? 'Accepted' : 'Failed';
        setTestResults(results);
        setIsSubmitting(false);

        // Save to Firebase History
        const subsRef = ref(db, `users/${user.uid}/progress/submissions/${currentProblem.id}`);
        const newSubRef = push(subsRef);
        const newSub = {
            status: results.status,
            score: `${results.passed}/${results.total}`,
            time: formatTime(timeElapsed),
            runtime: `${Math.round(results.avgDuration)}ms`,
            timestamp: serverTimestamp(),
            date: new Date().toLocaleTimeString()
        };
        set(newSubRef, newSub);

        // Record Activity for Heatmap
        const today = new Date().toISOString().split('T')[0];
        const activityRef = ref(db, `users/${user.uid}/activity/${today}`);
        set(activityRef, true);

        if (results.passed === results.total) {
            setTimerActive(false);
            setIsSolved(true);

            // Update Solved IDs in Firebase
            const solvedRef = ref(db, `users/${user.uid}/progress/solved`);
            onValue(solvedRef, (snapshot) => {
                const solvedIds = snapshot.val() || [];
                if (!solvedIds.includes(currentProblem.id)) {
                    set(solvedRef, [...solvedIds, currentProblem.id]);
                }
            }, { onlyOnce: true });
        }
    };

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'Easy': return '#22c55e';
            case 'Medium': return '#eab308';
            case 'Hard': return '#ef4444';
            default: return 'var(--text-muted)';
        }
    };

    const getRank = (duration) => {
        if (duration < 50) return { percent: 99, label: 'Faster than 99% of Pythonists' };
        if (duration < 200) return { percent: 92, label: 'Faster than 92% of users' };
        if (duration < 500) return { percent: 75, label: 'Faster than 75% of submissions' };
        return { percent: 45, label: 'Good performance' };
    };

    return (
        <div style={styles.container} className="fadeIn">
            {/* Top Toolbar */}
            <div style={styles.toolbar}>
                <div style={styles.toolbarLeft}>
                    <BookOpen size={18} color="var(--color-primary)" />
                    <h2 style={styles.title}>Competitive Practice</h2>

                    <div style={styles.selectWrapper}>
                        <select
                            style={styles.select}
                            value={selectedTopic}
                            onChange={(e) => {
                                setSelectedTopic(e.target.value);
                                setSelectedProblemIndex(0);
                            }}
                        >
                            {PRACTICE_TOPICS.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} style={styles.selectIcon} />
                    </div>
                </div>

                <div style={styles.toolbarCenter}>
                    <div style={styles.timerDisplay}>
                        <Timer size={16} />
                        <span>{formatTime(timeElapsed)}</span>
                        <RotateCcw size={14} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={resetTimer} title="Reset Timer" />
                    </div>
                </div>

                <div style={styles.toolbarRight}>
                    <div style={styles.progressBadge}>
                        <Trophy size={14} color="#fbbf24" />
                        <span>Rank: Gold</span>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div style={styles.mainContent}>
                {/* Left Panel */}
                <div style={styles.problemPanel}>
                    <div style={styles.problemHeader}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={styles.problemId}>#{currentProblem.id} · Module {PRACTICE_TOPICS.indexOf(selectedTopic) + 1}</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {isSolved && <span style={styles.solvedBadge}><Check size={10} /> Solved</span>}
                                <span style={{ ...styles.diffTag, color: getDifficultyColor(currentProblem.difficulty), backgroundColor: `${getDifficultyColor(currentProblem.difficulty)}1a` }}>
                                    {currentProblem.difficulty}
                                </span>
                            </div>
                        </div>
                        <h1 style={styles.problemTitle}>{currentProblem.title}</h1>
                    </div>

                    <div style={styles.problemScroll}>
                        <section style={styles.section}>
                            <h3 style={styles.sectionTitle}><HelpCircle size={14} /> Description</h3>
                            <p style={styles.descriptionText}>{currentProblem.description}</p>
                        </section>

                        <div style={styles.exampleRow}>
                            <section style={{ flex: 1 }}>
                                <h3 style={styles.sectionTitle}>Input Example</h3>
                                <div style={styles.exampleBox}>{currentProblem.input_example}</div>
                            </section>
                            <section style={{ flex: 1 }}>
                                <h3 style={styles.sectionTitle}>Expected Output</h3>
                                <div style={styles.exampleBox}>{currentProblem.output_example}</div>
                            </section>
                        </div>

                        <section style={styles.section}>
                            <h3 style={styles.sectionTitle}>System Constraints</h3>
                            <ul style={styles.constraintsList}>
                                {(currentProblem.constraints || "").split('.').map((c, i) => c.trim() && <li key={i}>{c.trim()}</li>)}
                                <li>WASM Virtual Env</li>
                                <li>Limit: 2000ms</li>
                            </ul>
                        </section>

                        <div style={styles.problemNavigation}>
                            <button
                                style={{ ...styles.navBtn, opacity: selectedProblemIndex === 0 ? 0.3 : 1 }}
                                disabled={selectedProblemIndex === 0}
                                onClick={() => setSelectedProblemIndex(prev => prev - 1)}
                            >
                                Previous
                            </button>
                            <span>{selectedProblemIndex + 1} / {PROBLEMS[selectedTopic].length}</span>
                            <button
                                style={{ ...styles.navBtn, opacity: selectedProblemIndex === PROBLEMS[selectedTopic].length - 1 ? 0.3 : 1 }}
                                disabled={selectedProblemIndex === PROBLEMS[selectedTopic].length - 1}
                                onClick={() => setSelectedProblemIndex(prev => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div style={styles.editorPanel}>
                    <div style={styles.editorWrapper}>
                        <Editor
                            ref={editorRef}
                            code={code}
                            setCode={(newCode) => {
                                setCode(newCode);
                                if (testResults) setTestResults(null);
                            }}
                            isDarkMode={true}
                            onFocus={startTimer}
                            language={language}
                        />
                    </div>

                    <div style={styles.actionsBar}>
                        <div style={styles.actionsLeft}>
                            <button style={styles.runBtn} onClick={handleRun} disabled={isRunning || isSubmitting}>
                                <Play size={16} fill="white" /> Run Code
                            </button>
                            <button
                                style={{ ...styles.runBtn, borderColor: 'rgba(59, 130, 246, 0.4)', color: 'var(--color-primary)' }}
                                onClick={() => setIsAIAssistantOpen(true)}
                            >
                                <Bot size={14} /> AI Logic Help
                            </button>
                        </div>
                        <button style={styles.submitBtn} onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                            {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
                        </button>
                        {testResults?.status === 'Accepted' && (
                            <div style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                                <Zap size={16} fill="#22c55e" /> Solution Optimal
                            </div>
                        )}
                    </div>

                    <div style={styles.resultsPanel}>
                        <div style={styles.tabHeader}>
                            <div
                                style={{ ...styles.tabItem, borderBottom: activeResultTab === 'Results' ? '2px solid var(--color-primary)' : 'none', color: activeResultTab === 'Results' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                                onClick={() => setActiveResultTab('Results')}
                            >
                                <Layout size={14} /> Results
                            </div>
                            <div
                                style={{ ...styles.tabItem, borderBottom: activeResultTab === 'Console' ? '2px solid var(--color-primary)' : 'none', color: activeResultTab === 'Console' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                                onClick={() => setActiveResultTab('Console')}
                            >
                                <Terminal size={14} /> Console
                            </div>
                            <div
                                style={{ ...styles.tabItem, borderBottom: activeResultTab === 'History' ? '2px solid var(--color-primary)' : 'none', color: activeResultTab === 'History' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                                onClick={() => setActiveResultTab('History')}
                            >
                                <History size={14} /> Submissions
                            </div>
                            {currentProblem.tutorial && (
                                <div
                                    style={{ ...styles.tabItem, borderBottom: activeResultTab === 'Tutor' ? '2px solid var(--color-primary)' : 'none', color: activeResultTab === 'Tutor' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                                    onClick={() => setActiveResultTab('Tutor')}
                                >
                                    <GraduationCap size={16} /> Tutor
                                </div>
                            )}
                            {isSql && (
                                <div
                                    style={{ ...styles.tabItem, borderBottom: activeResultTab === 'Schema' ? '2px solid var(--color-primary)' : 'none', color: activeResultTab === 'Schema' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                                    onClick={() => setActiveResultTab('Schema')}
                                >
                                    <Database size={14} /> Schema
                                </div>
                            )}
                        </div>

                        <div style={styles.resultsContent}>
                            {activeResultTab === 'Results' && (
                                <div style={styles.testCaseList}>
                                    {!testResults ? (
                                        <div style={styles.emptyState}>
                                            <BarChart3 size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                            <p>No submission results available.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {testResults.status === 'Accepted' && (
                                                <div style={styles.performanceBanner}>
                                                    <Trophy size={20} color="#fbbf24" />
                                                    <div>
                                                        <strong>Success!</strong> {getRank(testResults.avgDuration).label}
                                                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Avg. Runtime: {Math.round(testResults.avgDuration)}ms</div>
                                                    </div>
                                                </div>
                                            )}
                                            {testResults.cases.map((tc, i) => (
                                                <div key={i} style={{ ...styles.testCaseItem, borderColor: tc.passed ? '#22c55e33' : '#ef444433' }}>
                                                    <div style={styles.tcHeader} onClick={() => setExpandedCases(prev => ({ ...prev, [i]: !prev[i] }))}>
                                                        {tc.passed ? <CheckCircle2 size={16} color="#22c55e" /> : <XCircle size={16} color="#ef4444" />}
                                                        <span>Case {i + 1}</span>
                                                        <span style={{ fontSize: '11px', marginLeft: '8px', opacity: 0.5 }}>{Math.round(tc.duration)}ms</span>
                                                        <ChevronDown size={14} style={{ marginLeft: 'auto', transform: expandedCases[i] ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                                    </div>
                                                    {(expandedCases[i] || !tc.passed) && (
                                                        <div style={styles.tcDetailGrid}>
                                                            <div style={styles.tcLabel}>Input</div><div style={styles.tcVal}>{tc.input}</div>
                                                            <div style={styles.tcLabel}>Expected</div><div style={styles.tcVal}>{tc.expected}</div>
                                                            <div style={styles.tcLabel}>Actual</div><div style={{ ...styles.tcVal, color: tc.passed ? '#22c55e' : '#ef4444' }}>{tc.actual || '(No output)'}</div>
                                                            {tc.error && <div style={{ gridColumn: 'span 2', color: '#ef4444', fontSize: '11px', fontFamily: 'monospace', marginTop: '8px' }}>{tc.error}</div>}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeResultTab === 'Console' && (
                                <div style={styles.consoleView}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', height: '100%' }}>
                                        <div style={{ flex: 1 }}>
                                            {outputs.length > 0 ? (
                                                outputs.map((o, i) => (
                                                    <div key={i} style={{ color: o.type === 'stderr' ? '#ef4444' : (o.type === 'muted' ? '#666' : '#e1e1e1'), marginBottom: '4px', fontFamily: 'monospace' }}>
                                                        {o.type === 'sql_table' ? (
                                                            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                {o.results.map((res, rIdx) => (
                                                                    <div key={rIdx} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', overflow: 'hidden' }}>
                                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                                            <thead style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
                                                                                <tr>{res.columns.map(c => <th key={c} style={{ padding: '6px', textAlign: 'left', borderBottom: '1px solid #27272a', color: 'var(--color-primary)' }}>{c}</th>)}</tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {res.values.map((row, r) => (
                                                                                    <tr key={r}>{row.map((cell, c) => <td key={c} style={{ padding: '6px', borderBottom: '1px solid #27272a' }}>{cell}</td>)}</tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : o.text}
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ color: '#666' }}>Run your code to see manual execution results.</p>
                                            )}
                                        </div>
                                        {currentProblem.output_example && outputs.some(o => o.type === 'stdout') && (
                                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #27272a', fontSize: '12px' }}>
                                                <span style={{ color: '#71717a', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', display: 'block', marginBottom: '6px' }}>Expected Output (Sample)</span>
                                                <div style={{ backgroundColor: '#09090b', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#fbbf24', border: '1px solid #fbbf2433' }}>
                                                    {currentProblem.output_example}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeResultTab === 'History' && (
                                <div style={styles.historyList}>
                                    {submissions.length === 0 ? (
                                        <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>No previous attempts found.</p>
                                    ) : (
                                        <table style={styles.historyTable}>
                                            <thead>
                                                <tr><th>Time</th><th>Status</th><th>Score</th><th>Runtime</th></tr>
                                            </thead>
                                            <tbody>
                                                {submissions.map(s => (
                                                    <tr key={s.id}>
                                                        <td>{s.date}</td>
                                                        <td style={{ color: s.status === 'Accepted' ? '#22c55e' : '#ef4444' }}>{s.status}</td>
                                                        <td>{s.score}</td>
                                                        <td>{s.runtime}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {activeResultTab === 'Tutor' && (
                                <div style={styles.tutorContainer}>
                                    {currentProblem.tutorial ? (
                                        <div style={styles.tutorialList}>
                                            <div style={styles.tutorHeader}>
                                                <GraduationCap size={20} color="var(--color-primary)" />
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>Step-by-Step Logic Guide</h3>
                                                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#71717a' }}>Master the high-precision Python approach for this problem.</p>
                                                </div>
                                            </div>
                                            {currentProblem.tutorial.map((step, idx) => (
                                                <div key={idx} style={styles.tutorialStep}>
                                                    <div style={styles.stepBadge}>Step {step.step}</div>
                                                    <h4 style={styles.stepTitle}>{step.title}</h4>
                                                    <p style={styles.stepDetail}>{step.detail}</p>
                                                    {step.code && (
                                                        <div style={styles.stepCodeWrapper}>
                                                            <div style={styles.codeLang}>PYTHON (High Precision)</div>
                                                            <pre style={styles.stepCode}>{step.code}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={styles.emptyState}>
                                            <GraduationCap size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                            <p>No tutorial available for this problem yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeResultTab === 'Schema' && (
                                <div style={{ height: '100%', overflow: 'hidden' }}>
                                    <DatabaseSchema />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AIAssistant
                isOpen={isAIAssistantOpen}
                onClose={() => setIsAIAssistantOpen(false)}
                currentCode={code}
                language={language}
                problemContext={{
                    title: currentProblem.title,
                    description: currentProblem.description,
                    input_example: currentProblem.input_example,
                    expected_output: currentProblem.output_example
                }}
            />
        </div >
    );
};

const X = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const styles = {
    container: { height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#09090b', color: '#e4e4e7', overflow: 'hidden' },
    toolbar: { height: '52px', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', backgroundColor: '#18181b' },
    toolbarLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
    title: { margin: 0, fontSize: '15px', fontWeight: '600', color: '#fff' },
    toolbarCenter: { display: 'flex', alignItems: 'center' },
    timerDisplay: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#27272a', padding: '6px 14px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--color-primary)' },
    selectWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    select: { appearance: 'none', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '6px', padding: '5px 28px 5px 12px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' },
    selectIcon: { position: 'absolute', right: '8px', pointerEvents: 'none', color: '#a1a1aa' },
    toolbarRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    progressBadge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fbbf241a', padding: '5px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: '700', color: '#fbbf24', border: '1px solid #fbbf2433' },
    closeBtn: { background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '4px', display: 'flex' },
    mainContent: { flex: 1, display: 'flex', overflow: 'hidden' },
    problemPanel: { width: '400px', borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column', backgroundColor: '#18181b' },
    problemHeader: { padding: '20px', borderBottom: '1px solid #27272a' },
    problemId: { fontSize: '11px', fontWeight: '600', color: '#a1a1aa', textTransform: 'uppercase' },
    diffTag: { fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' },
    problemTitle: { margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#fff' },
    problemScroll: { flex: 1, overflowY: 'auto', padding: '20px' },
    section: { marginBottom: '24px' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#a1a1aa', margin: '0 0 10px 0', textTransform: 'uppercase' },
    descriptionText: { fontSize: '14px', lineHeight: '1.6', color: '#d4d4d8', margin: 0 },
    exampleRow: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
    exampleBox: { backgroundColor: '#09090b', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', border: '1px solid #27272a', color: '#a1a1aa', whiteSpace: 'pre-wrap' },
    constraintsList: { margin: 0, paddingLeft: '18px', color: '#71717a', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' },
    problemNavigation: { marginTop: 'auto', padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', fontSize: '12px', color: '#71717a' },
    navBtn: { padding: '6px 14px', borderRadius: '6px', border: '1px solid #3f3f46', backgroundColor: '#27272a', color: '#eee', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    editorPanel: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#09090b' },
    editorWrapper: { flex: 0.6, borderBottom: '1px solid #27272a' },
    actionsBar: { padding: '10px 20px', backgroundColor: '#18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '52px', borderBottom: '1px solid #27272a' },
    actionsLeft: { display: 'flex', gap: '10px' },
    runBtn: { backgroundColor: '#27272a', color: '#e4e4e7', border: '1px solid #3f3f46', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    submitBtn: { backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', padding: '6px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px var(--color-primary-glow)' },
    resultsPanel: { flex: 0.4, display: 'flex', flexDirection: 'column', backgroundColor: '#09090b', overflow: 'hidden', minHeight: 0, height: '40%' },
    tabHeader: { display: 'flex', padding: '0 20px', backgroundColor: '#18181b', borderBottom: '1px solid #27272a' },
    tabItem: { padding: '12px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' },
    resultsContent: { flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, position: 'relative', WebkitOverflowScrolling: 'touch' },
    emptyState: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#52525b', textAlign: 'center', fontSize: '13px' },
    testCaseList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    testCaseItem: { backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '10px 14px', transition: 'all 0.2s' },
    performanceBanner: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', backgroundColor: '#fbbf241a', borderRadius: '8px', border: '1px solid #fbbf2433', color: '#fbbf24', fontSize: '13px', marginBottom: '16px' },
    tcHeader: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
    tcDetailGrid: { display: 'grid', gridTemplateColumns: '80px 1fr', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #27272a', fontSize: '12px' },
    tcLabel: { color: '#71717a' },
    tcVal: {
        fontFamily: 'monospace',
        backgroundColor: '#09090b',
        padding: '6px 10px',
        borderRadius: '4px',
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.4',
        border: '1px solid #27272a'
    },
    consoleView: { width: '100%', height: '100%', padding: '12px', backgroundColor: '#09090b', borderRadius: '8px', overflowY: 'auto', fontSize: '13px', minHeight: '200px' },
    historyList: { fontSize: '13px' },
    historyTable: { width: '100%', borderCollapse: 'collapse', color: '#a1a1aa' },
    solvedBadge: { display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#22c55e1a', color: '#22c55e', padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #22c55e33' },
    tutorContainer: { display: 'block', paddingBottom: '80px' },
    tutorHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', padding: '20px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.15)' },
    tutorialList: { display: 'flex', flexDirection: 'column', gap: '24px' },
    tutorialStep: { position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #27272a' },
    stepBadge: { fontSize: '10px', fontWeight: '800', backgroundColor: '#27272a', color: '#a1a1aa', padding: '2px 8px', borderRadius: '10px', width: 'fit-content', marginBottom: '6px', textTransform: 'uppercase' },
    stepTitle: { margin: '0 0 6px 0', fontSize: '14px', fontWeight: '700', color: '#fff' },
    stepDetail: { fontSize: '13px', lineHeight: '1.5', color: '#a1a1aa', margin: '0 0 10px 0' },
    stepCodeWrapper: { backgroundColor: '#09090b', borderRadius: '6px', border: '1px solid #27272a', overflow: 'hidden' },
    codeLang: { fontSize: '9px', fontWeight: '800', backgroundColor: '#18181b', color: '#71717a', padding: '4px 10px', borderBottom: '1px solid #27272a' },
    stepCode: { margin: 0, padding: '10px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-primary)' }
};

export default Practice;
