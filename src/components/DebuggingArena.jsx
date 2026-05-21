import React, { useState, useEffect, useRef } from 'react';
import { 
    Swords, Trophy, Timer, Zap, BarChart3, Bot, ChevronRight, Play, 
    CheckCircle2, XCircle, RefreshCw, AlertTriangle, ShieldAlert, 
    ArrowLeft, HelpCircle, Sparkles, Award, Users, Calendar, Clock
} from 'lucide-react';
import Editor from './Editor';
import pythonEngine from '../lib/pythonEngine';
import { ARENA_PROBLEMS, MOCK_LEADERBOARD, MOCK_TOURNAMENTS, MOCK_CHAMPIONS } from '../data/arenaProblems';
import { useGamification } from '../context/GamificationContext';

const DebuggingArena = ({ onClose, theme }) => {
    const gamification = useGamification();
    const [activeSubTab, setActiveSubTab] = useState('rapidfire'); // 'rapidfire' | 'leaderboard' | 'tournaments'
    
    // Rapid Fire Game State
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [code, setCode] = useState('');
    const [originalCode, setOriginalCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [outputs, setOutputs] = useState([]);
    const [testResults, setTestResults] = useState(null);
    const [hintsRevealed, setHintsRevealed] = useState(0);
    const [scoreAwarded, setScoreAwarded] = useState(null);
    const [penaltyAlert, setPenaltyAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [registeredTournaments, setRegisteredTournaments] = useState({});

    const timerRef = useRef(null);
    const editorRef = useRef(null);

    // Dynamic Timer Logic
    useEffect(() => {
        if (timerActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setTimerActive(false);
                        handleTimeOut();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [timerActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Load active challenge
    const handleStartChallenge = (problem) => {
        setActiveChallenge(problem);
        setCode(problem.starter_code);
        setOriginalCode(problem.starter_code);
        setHintsRevealed(0);
        setOutputs([]);
        setTestResults(null);
        setScoreAwarded(null);
        setPenaltyAlert(false);
        setSuccessMessage('');
        
        // Timer configuration based on difficulty
        const limits = { Easy: 120, Medium: 180, Hard: 240 };
        setTimeLeft(limits[problem.difficulty] || 180);
        setTimerActive(true);
    };

    const handleResetCode = () => {
        if (window.confirm('Reset code to initial buggy state? Your current fixes will be cleared.')) {
            setCode(originalCode);
            setTestResults(null);
            setOutputs([]);
        }
    };

    const handleTimeOut = () => {
        setTimerActive(false);
        alert('⌛ Time is up! You ran out of clock cycles to debug. Try again to claim the podium!');
        setTestResults({
            status: 'Timeout',
            passed: 0,
            total: activeChallenge.test_cases.length,
            cases: activeChallenge.test_cases.map(tc => ({
                input: tc.input,
                expected: tc.expected,
                actual: 'Timeout Limit Exceeded',
                passed: false
            }))
        });
    };

    const handleRunCode = async () => {
        if (isRunning || !activeChallenge) return;
        setIsRunning(true);
        setOutputs([{ text: '🔄 Compiling workspace script in sandbox...', type: 'prompt' }]);

        try {
            // Pick first test case input for trial
            const testInput = activeChallenge.test_cases[0]?.input || '';
            const result = await pythonEngine.run(code, testInput);
            
            const logs = [];
            if (result.stdout) {
                logs.push({ text: result.stdout, type: 'stdout' });
            }
            if (result.stderr) {
                logs.push({ text: result.stderr, type: 'stderr' });
                // Check if syntax error for active warning
                if (result.stderr.toLowerCase().includes('syntaxerror') || result.stderr.toLowerCase().includes('indentationerror')) {
                    logs.push({ text: '⚠️ Gutter Warning: Compiler detected logical alignment or syntax flaws.', type: 'warning' });
                }
            }
            
            if (logs.length === 0) {
                logs.push({ text: '(Script compiled with zero stdout outputs)', type: 'muted' });
            }
            setOutputs(logs);
        } catch (err) {
            setOutputs([{ text: err.message, type: 'stderr' }]);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitSolution = async () => {
        if (isSubmitting || !activeChallenge) return;
        setIsSubmitting(true);
        setTestResults(null);
        setPenaltyAlert(false);

        const results = { passed: 0, total: activeChallenge.test_cases.length, cases: [], status: 'Evaluating' };
        let hasSyntaxOrCompileError = false;
        let compileErrorMessage = '';

        for (const tc of activeChallenge.test_cases) {
            try {
                const runResult = await pythonEngine.run(code, tc.input);
                
                if (runResult.stderr) {
                    hasSyntaxOrCompileError = true;
                    compileErrorMessage = runResult.stderr;
                }

                const normalize = (str) => {
                    if (!str) return '';
                    return str.split('\n')
                        .map(line => line.trimEnd())
                        .filter(line => line.length > 0)
                        .join('\n')
                        .trim();
                };

                const actualOutput = normalize(runResult.stdout);
                const expectedOutput = tc.expected;
                const isPassed = actualOutput === expectedOutput && !runResult.stderr;

                if (isPassed) results.passed++;

                results.cases.push({
                    input: tc.input || 'None',
                    expected: expectedOutput,
                    actual: runResult.stderr ? 'Compile Error' : actualOutput,
                    passed: isPassed,
                    error: runResult.stderr || null
                });

            } catch (err) {
                results.cases.push({
                    input: tc.input || 'None',
                    expected: tc.expected,
                    actual: 'Fatal Error',
                    passed: false,
                    error: err.message
                });
            }
        }

        results.status = results.passed === results.total ? 'Accepted' : 'Failed';
        setTestResults(results);
        setIsSubmitting(false);

        if (results.passed === results.total) {
            // Success! Stop timer and compute scores
            setTimerActive(false);
            
            const difficultyMultiplier = { Easy: 500, Medium: 1000, Hard: 2000 };
            const basePoints = difficultyMultiplier[activeChallenge.difficulty] || 1000;
            const timeBonus = timeLeft * 10;
            const hintPenalty = hintsRevealed * 150;
            const finalScore = Math.max(100, basePoints + timeBonus - hintPenalty);
            
            setScoreAwarded(finalScore);
            setSuccessMessage(`⚡ Debugging Arena Calibrated! Excellent Speed & Compiler Alignment.`);

            // Add XP to gamification context if available
            if (gamification?.addXP) {
                gamification.addXP(Math.round(finalScore / 10));
            }
            if (gamification?.incrementStat) {
                gamification.incrementStat('fixesApplied', activeChallenge.bugs.length);
            }
        } else {
            // Apply a time penalty of 10 seconds for compiling syntax failures
            if (hasSyntaxOrCompileError) {
                setPenaltyAlert(true);
                setTimeLeft(prev => Math.max(0, prev - 10));
                setTimeout(() => setPenaltyAlert(false), 3000);
            }
        }
    };

    const handleRevealHint = () => {
        if (hintsRevealed < activeChallenge.hints.length) {
            setHintsRevealed(prev => prev + 1);
        }
    };

    const toggleRegisterTournament = (tourId) => {
        setRegisteredTournaments(prev => ({
            ...prev,
            [tourId]: !prev[tourId]
        }));
    };

    return (
        <div style={styles.container} className="fadeIn">
            {/* Top Bar Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Swords size={20} color="var(--color-primary)" style={{ filter: 'drop-shadow(0 0 5px var(--color-primary))' }} />
                    <h1 style={styles.title}>Debugging Arena</h1>
                    <span style={styles.betaBadge}>PRO MODE</span>
                </div>
                <div style={styles.tabsWrapper}>
                    <button 
                        style={{ ...styles.tabBtn, ...(activeSubTab === 'rapidfire' ? styles.activeTabBtn : {}) }}
                        onClick={() => { setActiveSubTab('rapidfire'); setActiveChallenge(null); }}
                    >
                        <Zap size={14} /> ⚡ Rapid Fire
                    </button>
                    <button 
                        style={{ ...styles.tabBtn, ...(activeSubTab === 'leaderboard' ? styles.activeTabBtn : {}) }}
                        onClick={() => { setActiveSubTab('leaderboard'); setActiveChallenge(null); }}
                    >
                        <BarChart3 size={14} /> 📊 Rankings
                    </button>
                    <button 
                        style={{ ...styles.tabBtn, ...(activeSubTab === 'tournaments' ? styles.activeTabBtn : {}) }}
                        onClick={() => { setActiveSubTab('tournaments'); setActiveChallenge(null); }}
                    >
                        <Trophy size={14} /> 🏆 Tournaments
                    </button>
                </div>
                <button style={styles.closeBtn} onClick={onClose} title="Back to workspace">
                    <ArrowLeft size={16} /> Exit Arena
                </button>
            </div>

            {/* Main Section */}
            <div style={styles.mainContent}>
                
                {/* 1. RAPID FIRE MODE */}
                {activeSubTab === 'rapidfire' && !activeChallenge && (
                    <div style={styles.dashboardGrid} className="fadeIn">
                        <div style={styles.dashboardBanner}>
                            <div style={{ flex: 1 }}>
                                <h2 style={styles.bannerTitle}>⚡ Code Debugging Rapid Fire</h2>
                                <p style={styles.bannerText}>
                                    Compete against the processor cycles. Every challenge contains specific syntactical syntax breaks, out-of-bound indexes, or recursive overflow bugs. Fix them under the clock, execute compiler verification, and secure highest leaderboard score!
                                </p>
                                <div style={styles.specRules}>
                                    <div style={styles.ruleBadge}><Clock size={12} /> Fast Time Bonuses</div>
                                    <div style={styles.ruleBadge}><ShieldAlert size={12} /> -10s Syntax Penalty</div>
                                    <div style={styles.ruleBadge}><Bot size={12} /> Socratic Hints Available</div>
                                </div>
                            </div>
                            <div style={styles.bannerGraphics}>
                                <Swords size={96} color="var(--color-primary)" style={{ opacity: 0.15, transform: 'rotate(-15deg)' }} />
                            </div>
                        </div>

                        <h3 style={styles.sectionHeaderTitle}>Select Debugging Combat Level</h3>
                        <div style={styles.challengeGrid}>
                            {ARENA_PROBLEMS.map((prob) => (
                                <div key={prob.id} style={styles.challengeCard}>
                                    <div style={styles.cardHeader}>
                                        <span style={{ 
                                            ...styles.diffLabel, 
                                            color: prob.difficulty === 'Easy' ? 'var(--color-success)' : (prob.difficulty === 'Medium' ? '#eab308' : 'var(--color-error)'),
                                            backgroundColor: prob.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.08)' : (prob.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.08)' : 'rgba(239, 68, 68, 0.08)'),
                                            border: `1px solid ${prob.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)' : (prob.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)')}`
                                        }}>
                                            {prob.difficulty}
                                        </span>
                                        <span style={styles.cardXpBadge}>+{prob.difficulty === 'Easy' ? 500 : (prob.difficulty === 'Medium' ? 1000 : 2000)} XP</span>
                                    </div>
                                    <h4 style={styles.cardTitle}>{prob.title}</h4>
                                    <p style={styles.cardDesc}>{prob.description.substring(0, 100)}...</p>
                                    <div style={styles.cardFooter}>
                                        <div style={styles.bugCount}>
                                            <ShieldAlert size={13} color="var(--color-error)" />
                                            <span>{prob.bugs.length} Fatal Bugs to Fix</span>
                                        </div>
                                        <button style={styles.playBtn} onClick={() => handleStartChallenge(prob)}>
                                            Debug Now <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ACTIVE RAPID FIRE CHALLENGE VIEW */}
                {activeSubTab === 'rapidfire' && activeChallenge && (
                    <div style={styles.combatArena} className="fadeIn">
                        
                        {/* Sidebar description and bugs */}
                        <div style={styles.arenaSidebar}>
                            <button 
                                style={styles.backToSelectionBtn}
                                onClick={() => { setActiveChallenge(null); setTimerActive(false); }}
                            >
                                <ArrowLeft size={14} /> Back to dashboard
                            </button>

                            <div style={styles.sidebarPanel}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={styles.levelTag}>CHALLENGE MODE</span>
                                    <span style={{ 
                                        ...styles.diffLabel, 
                                        color: activeChallenge.difficulty === 'Easy' ? 'var(--color-success)' : (activeChallenge.difficulty === 'Medium' ? '#eab308' : 'var(--color-error)')
                                    }}>
                                        {activeChallenge.difficulty}
                                    </span>
                                </div>
                                <h3 style={styles.arenaProblemTitle}>{activeChallenge.title}</h3>
                                <p style={styles.arenaProblemDesc}>{activeChallenge.description}</p>
                            </div>

                            <div style={styles.sidebarPanel}>
                                <h4 style={styles.sidebarPanelTitle}><HelpCircle size={14} /> Input Example</h4>
                                <pre style={styles.exampleBox}>{activeChallenge.input_example}</pre>
                                <h4 style={styles.sidebarPanelTitle}><CheckCircle2 size={14} /> Expected Output</h4>
                                <pre style={styles.exampleBox}>{activeChallenge.output_example}</pre>
                            </div>

                            {/* Coach Hint Section */}
                            <div style={styles.sidebarPanel}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h4 style={styles.sidebarPanelTitle}><Bot size={14} color="var(--color-primary)" /> Socratic AI Coach Hints</h4>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>-150 pts/hint</span>
                                </div>
                                {hintsRevealed > 0 ? (
                                    <div style={styles.revealedHintsList}>
                                        {activeChallenge.hints.slice(0, hintsRevealed).map((hint, idx) => (
                                            <div key={idx} style={styles.hintBubble}>
                                                <span style={styles.hintIndex}>Hint {idx + 1}</span>
                                                <p style={styles.hintText}>{hint}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={styles.emptyHintsBox}>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Stuck? Reveal a socratic coach prompt to help you think.</p>
                                    </div>
                                )}
                                {hintsRevealed < activeChallenge.hints.length && (
                                    <button 
                                        style={styles.revealHintBtn} 
                                        onClick={handleRevealHint}
                                        disabled={timeLeft <= 0}
                                    >
                                        💡 Reveal Coach Hint {hintsRevealed + 1}/{activeChallenge.hints.length}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Editor and Terminal verification */}
                        <div style={styles.arenaWorkspace}>
                            {/* Timer and Controls */}
                            <div style={styles.workspaceControls}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ 
                                        ...styles.arenaTimer, 
                                        borderColor: timeLeft < 30 ? 'var(--color-error)' : 'var(--border-color)',
                                        color: timeLeft < 30 ? 'var(--color-error)' : 'var(--text-primary)',
                                        animation: timeLeft < 30 ? 'pulse 1s infinite' : 'none'
                                    }}>
                                        <Timer size={16} style={{ color: timeLeft < 30 ? 'var(--color-error)' : 'var(--color-primary)' }} />
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{formatTime(timeLeft)}</span>
                                    </div>
                                    {penaltyAlert && (
                                        <div style={styles.penaltyBanner}>
                                            <AlertTriangle size={14} /> -10s Syntax Penalty!
                                        </div>
                                    )}
                                </div>
                                <div style={styles.controlButtons}>
                                    <button style={styles.resetBtn} onClick={handleResetCode} disabled={isRunning || isSubmitting}>
                                        <RefreshCw size={14} /> Reset
                                    </button>
                                    <button style={styles.arenaRunBtn} onClick={handleRunCode} disabled={isRunning || isSubmitting || timeLeft <= 0}>
                                        <Play size={14} fill="currentColor" /> Run Code
                                    </button>
                                    <button style={styles.arenaSubmitBtn} onClick={handleSubmitSolution} disabled={isRunning || isSubmitting || timeLeft <= 0}>
                                        🚀 Compile & Submit
                                    </button>
                                </div>
                            </div>

                            {/* Code Editor Container */}
                            <div style={styles.arenaEditorWrapper}>
                                <Editor 
                                    ref={editorRef}
                                    code={code}
                                    setCode={(newCode) => {
                                        setCode(newCode);
                                        if (testResults) setTestResults(null);
                                    }}
                                    isDarkMode={true}
                                    language="Python"
                                />
                            </div>

                            {/* Results & Terminal */}
                            <div style={styles.arenaTerminalPanel}>
                                <div style={styles.terminalTabs}>
                                    <span style={styles.terminalTabHeader}>Sandbox Outputs</span>
                                </div>
                                <div style={styles.terminalBody}>
                                    {/* Test Suite Results if Submitted */}
                                    {testResults && (
                                        <div style={styles.testSuiteWrapper} className="fadeIn">
                                            <div style={{ 
                                                ...styles.testSuiteBanner, 
                                                backgroundColor: testResults.status === 'Accepted' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                                borderColor: testResults.status === 'Accepted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                                            }}>
                                                {testResults.status === 'Accepted' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
                                                        <CheckCircle2 size={18} />
                                                        <strong>ALL TESTS PASSED! Solutions Optimal.</strong>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)' }}>
                                                        <XCircle size={18} />
                                                        <strong>TEST COVERAGE FAILED ({testResults.passed}/{testResults.total} passed)</strong>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={styles.testCasesGrid}>
                                                {testResults.cases.map((tc, idx) => (
                                                    <div key={idx} style={{ 
                                                        ...styles.testCaseRow, 
                                                        borderColor: tc.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' 
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {tc.passed ? <CheckCircle2 size={14} color="var(--color-success)" /> : <XCircle size={14} color="var(--color-error)" />}
                                                            <span style={{ fontWeight: '500', fontSize: '13px' }}>Case {idx + 1}</span>
                                                        </div>
                                                        <div style={styles.tcBoxGrid}>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={styles.tcRowLabel}>Input:</span>
                                                                <span style={styles.tcRowVal}>{tc.input || 'None'}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={styles.tcRowLabel}>Expected:</span>
                                                                <span style={styles.tcRowVal}>{tc.expected}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={styles.tcRowLabel}>Actual:</span>
                                                                <span style={{ ...styles.tcRowVal, color: tc.passed ? 'var(--color-success)' : 'var(--color-error)' }}>{tc.actual || 'No output'}</span>
                                                            </div>
                                                        </div>
                                                        {tc.error && (
                                                            <pre style={styles.errorStack}>{tc.error}</pre>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Standard Output Logs */}
                                    {outputs.length > 0 && !testResults && (
                                        <div style={styles.consoleLogs}>
                                            {outputs.map((log, idx) => (
                                                <div key={idx} style={{ 
                                                    color: log.type === 'stderr' ? 'var(--color-error)' : (log.type === 'prompt' ? 'var(--color-primary)' : (log.type === 'warning' ? '#f59e0b' : 'var(--text-primary)')),
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '12px',
                                                    marginBottom: '6px',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {log.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {outputs.length === 0 && !testResults && (
                                        <div style={styles.emptyTerminal}>
                                            <Play size={24} style={{ opacity: 0.2, marginBottom: '8px' }} />
                                            <span>Press "Run Code" or "Compile & Submit" to verify compilation.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SUCCESS OVERLAY CELEBRATION */}
                        {scoreAwarded !== null && (
                            <div style={styles.overlay} className="fadeIn">
                                <div style={styles.successModal} className="scaleIn">
                                    <div style={styles.successBanner}>
                                        <Award size={48} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 10px #fbbf24)' }} />
                                    </div>
                                    <h2 style={styles.successTitle}>Arena Defeated!</h2>
                                    <p style={styles.successDesc}>{successMessage}</p>
                                    
                                    <div style={styles.statsCard}>
                                        <div style={styles.statBox}>
                                            <span style={styles.statBoxLabel}>Solve Time</span>
                                            <span style={styles.statBoxVal}>{formatTime((activeChallenge.difficulty === 'Easy' ? 120 : (activeChallenge.difficulty === 'Medium' ? 180 : 240)) - timeLeft)}</span>
                                        </div>
                                        <div style={styles.statBox}>
                                            <span style={styles.statBoxLabel}>Hints Used</span>
                                            <span style={styles.statBoxVal}>{hintsRevealed}</span>
                                        </div>
                                        <div style={styles.statBox}>
                                            <span style={styles.statBoxLabel}>XP Reward</span>
                                            <span style={{ ...styles.statBoxVal, color: 'var(--color-success)' }}>+{Math.round(scoreAwarded / 10)} XP</span>
                                        </div>
                                    </div>

                                    <div style={styles.scoreRow}>
                                        <span>Total Arena Points Awarded:</span>
                                        <span style={styles.scoreText}>{scoreAwarded} PTS</span>
                                    </div>

                                    <button 
                                        style={styles.modalExitBtn} 
                                        onClick={() => { setActiveChallenge(null); setScoreAwarded(null); }}
                                    >
                                        Continue Debugging Combat
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* 2. RANKINGS & LEADERBOARD TAB */}
                {activeSubTab === 'leaderboard' && (
                    <div style={styles.leaderboardContainer} className="fadeIn">
                        
                        <div style={styles.leaderboardStatsHeader}>
                            <div style={styles.mainRankBox}>
                                <Users size={20} color="var(--color-primary)" />
                                <div>
                                    <h4 style={styles.rankBoxTitle}>Rank Tier</h4>
                                    <p style={styles.rankBoxVal}>Gold Challenger III</p>
                                </div>
                            </div>
                            <div style={styles.mainRankBox}>
                                <Award size={20} color="#fbbf24" />
                                <div>
                                    <h4 style={styles.rankBoxTitle}>Total Arena Points</h4>
                                    <p style={styles.rankBoxVal}>9,850 PTS</p>
                                </div>
                            </div>
                            <div style={styles.mainRankBox}>
                                <Clock size={20} color="var(--color-success)" />
                                <div>
                                    <h4 style={styles.rankBoxTitle}>Avg. Solving Speed</h4>
                                    <p style={styles.rankBoxVal}>18.4 seconds</p>
                                </div>
                            </div>
                        </div>

                        <div style={styles.leaderboardBody}>
                            <div style={styles.leaderboardCard}>
                                <h3 style={styles.leaderboardHeading}>⚡ Global Master Rank Standing</h3>
                                
                                <div style={styles.leaderboardList}>
                                    <div style={styles.listHeaderRow}>
                                        <span style={styles.colRank}>Rank</span>
                                        <span style={styles.colName}>Player Profile</span>
                                        <span style={styles.colTitle}>Title</span>
                                        <span style={styles.colSolved}>Challenges</span>
                                        <span style={styles.colSpeed}>Avg Speed</span>
                                        <span style={styles.colWin}>Win Rate</span>
                                        <span style={styles.colPoints}>Points</span>
                                    </div>

                                    {MOCK_LEADERBOARD.map((p, idx) => (
                                        <div 
                                            key={p.rank} 
                                            style={{ 
                                                ...styles.listRow,
                                                ...(p.name === 'Coffee_Coder' ? styles.userHighlightRow : {})
                                            }}
                                        >
                                            <span style={styles.colRank}>
                                                {p.rank === 1 ? '🥇' : (p.rank === 2 ? '🥈' : (p.rank === 3 ? '🥉' : p.rank))}
                                            </span>
                                            <span style={{ ...styles.colName, fontWeight: p.rank <= 3 ? 'bold' : 'normal' }}>
                                                {p.name} {p.name === 'Coffee_Coder' && ' (You)'}
                                            </span>
                                            <span style={styles.colTitle}>{p.title}</span>
                                            <span style={styles.colSolved}>{p.solved} solved</span>
                                            <span style={styles.colSpeed}>{p.speed}</span>
                                            <span style={styles.colWin}>{p.winRate}</span>
                                            <span style={{ ...styles.colPoints, color: 'var(--color-primary)', fontWeight: 'bold' }}>{p.points.toLocaleString()} pts</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* 3. WEEKLY TOURNAMENTS TAB */}
                {activeSubTab === 'tournaments' && (
                    <div style={styles.tournamentsContainer} className="fadeIn">
                        
                        <div style={styles.tournamentDoublePane}>
                            {/* Upcoming & Active tournaments */}
                            <div style={styles.tournamentsLeft}>
                                <h3 style={styles.sectionHeaderTitle}>Debugging Tournaments</h3>
                                
                                <div style={styles.tournamentList}>
                                    {MOCK_TOURNAMENTS.map(t => (
                                        <div key={t.id} style={styles.tournamentCard}>
                                            <div style={styles.tourCardHeader}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {t.status === 'LIVE NOW' ? (
                                                        <span style={styles.livePulseTag}>
                                                            <span style={styles.pulseDot}></span> LIVE NOW
                                                        </span>
                                                    ) : (
                                                        <span style={styles.upcomingTag}>UPCOMING</span>
                                                    )}
                                                    <span style={styles.tourXpPool}><Sparkles size={12} color="#fbbf24" /> {t.xpPool} XP Prize Pool</span>
                                                </div>
                                                <span style={styles.tourDiffBadge}>{t.difficulty}</span>
                                            </div>
                                            <h4 style={styles.tourTitle}>{t.title}</h4>
                                            <p style={styles.tourDesc}>{t.description}</p>
                                            
                                            <div style={styles.tourFooter}>
                                                <div style={styles.tourMeta}>
                                                    <div style={styles.tourMetaItem}>
                                                        <Users size={13} />
                                                        <span>{t.participants} competing</span>
                                                    </div>
                                                    <div style={styles.tourMetaItem}>
                                                        {t.status === 'LIVE NOW' ? <Clock size={13} color="var(--color-error)" /> : <Calendar size={13} />}
                                                        <span>{t.status === 'LIVE NOW' ? `${t.timeLeft} remaining` : t.startDate}</span>
                                                    </div>
                                                </div>

                                                <button 
                                                    style={{ 
                                                        ...styles.registerBtn, 
                                                        ...(registeredTournaments[t.id] ? styles.registeredBtn : {}) 
                                                    }}
                                                    onClick={() => toggleRegisterTournament(t.id)}
                                                >
                                                    {registeredTournaments[t.id] ? '✓ Registered' : 'Register Now'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hall of Fame Podiums */}
                            <div style={styles.tournamentsRight}>
                                <div style={styles.podiumCard}>
                                    <h3 style={styles.podiumHeading}><Trophy size={16} color="#fbbf24" /> Weekly Champions Podium</h3>
                                    <p style={styles.podiumSubheading}>Hall of Fame standings from Weekly Tournament #22.</p>
                                    
                                    <div style={styles.podiumDisplay}>
                                        {/* 2nd place */}
                                        <div style={styles.podiumColumn}>
                                            <span style={styles.championAvatar}>{MOCK_CHAMPIONS[0].avatar}</span>
                                            <span style={styles.championName}>{MOCK_CHAMPIONS[0].name}</span>
                                            <span style={styles.championScore}>{MOCK_CHAMPIONS[0].score} pts</span>
                                            <div style={{ ...styles.podiumBlock, height: '80px', backgroundColor: '#a1a1aa33', border: '1px solid #a1a1aa55' }}>
                                                <span style={styles.podiumPlaceText}>2nd</span>
                                            </div>
                                        </div>

                                        {/* 1st place */}
                                        <div style={styles.podiumColumn}>
                                            <span style={{ ...styles.championAvatar, fontSize: '32px', filter: 'drop-shadow(0 0 8px #fbbf24)' }}>👑</span>
                                            <span style={{ ...styles.championName, fontWeight: 'bold' }}>{MOCK_CHAMPIONS[1].name}</span>
                                            <span style={{ ...styles.championScore, color: '#fbbf24' }}>{MOCK_CHAMPIONS[1].score} pts</span>
                                            <div style={{ ...styles.podiumBlock, height: '120px', backgroundColor: '#fbbf2422', border: '1px solid #fbbf2455' }}>
                                                <span style={{ ...styles.podiumPlaceText, color: '#fbbf24' }}>1st</span>
                                            </div>
                                        </div>

                                        {/* 3rd place */}
                                        <div style={styles.podiumColumn}>
                                            <span style={styles.championAvatar}>{MOCK_CHAMPIONS[2].avatar}</span>
                                            <span style={styles.championName}>{MOCK_CHAMPIONS[2].name}</span>
                                            <span style={styles.championScore}>{MOCK_CHAMPIONS[2].score} pts</span>
                                            <div style={{ ...styles.podiumBlock, height: '60px', backgroundColor: '#cd7f3233', border: '1px solid #cd7f3255' }}>
                                                <span style={styles.podiumPlaceText}>3rd</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={styles.pastPodiumsList}>
                                        <div style={styles.pastPodiumItem}>
                                            <span>Weekly Tournament #21 Champion</span>
                                            <strong style={{ color: 'var(--color-primary)' }}>BitShift_Wizard</strong>
                                        </div>
                                        <div style={styles.pastPodiumItem}>
                                            <span>Weekly Tournament #20 Champion</span>
                                            <strong style={{ color: 'var(--color-primary)' }}>Anshu_99</strong>
                                        </div>
                                        <div style={styles.pastPodiumItem}>
                                            <span>Weekly Tournament #19 Champion</span>
                                            <strong style={{ color: 'var(--color-primary)' }}>Matrix_Neo</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

// SVG Chevron icons as fallback
const ChevronDown = ({ size, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflow: 'hidden'
    },
    header: {
        height: '56px',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        backdropFilter: 'var(--backdrop-blur)',
        zIndex: 10
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    title: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em'
    },
    betaBadge: {
        fontSize: '9px',
        fontWeight: '800',
        color: 'var(--color-primary)',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        padding: '2px 6px',
        borderRadius: 'var(--radius-sm)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    tabsWrapper: {
        display: 'flex',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '3px',
        borderRadius: 'var(--radius-md)',
        gap: '2px'
    },
    tabBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: '6px 14px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
    },
    activeTabBtn: {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--color-primary)',
        boxShadow: 'var(--shadow-soft)'
    },
    closeBtn: {
        backgroundColor: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
    },
    mainContent: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative'
    },
    // Dashboard styling
    dashboardGrid: {
        height: '100%',
        overflowY: 'auto',
        padding: '24px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
    },
    dashboardBanner: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)',
        border: '1px solid var(--border-color)',
        marginBottom: '28px'
    },
    bannerTitle: {
        margin: '0 0 10px 0',
        fontSize: '22px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em'
    },
    bannerText: {
        margin: '0 0 16px 0',
        fontSize: '13px',
        lineHeight: '1.6',
        color: 'var(--text-secondary)',
        maxWidth: '720px'
    },
    specRules: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    ruleBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--text-secondary)'
    },
    bannerGraphics: {
        paddingLeft: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    sectionHeaderTitle: {
        margin: '0 0 16px 0',
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    challengeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        paddingBottom: '40px'
    },
    challengeCard: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-soft)'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
    },
    diffLabel: {
        fontSize: '10px',
        fontWeight: '800',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    cardXpBadge: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#fbbf24'
    },
    cardTitle: {
        margin: '0 0 8px 0',
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    cardDesc: {
        margin: '0 0 16px 0',
        fontSize: '12px',
        lineHeight: '1.5',
        color: 'var(--text-secondary)',
        flex: 1
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '12px'
    },
    bugCount: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--text-muted)'
    },
    playBtn: {
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)',
        transition: 'all 0.2s ease'
    },
    // Combat Arena View
    combatArena: {
        display: 'flex',
        height: '100%',
        overflow: 'hidden'
    },
    arenaSidebar: {
        width: '320px',
        borderRight: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '16px'
    },
    backToSelectionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        color: 'var(--text-secondary)',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '0 0 16px 0',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '16px',
        width: '100%'
    },
    sidebarPanel: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px'
    },
    levelTag: {
        fontSize: '9px',
        fontWeight: '800',
        color: 'var(--text-muted)',
        letterSpacing: '0.05em'
    },
    arenaProblemTitle: {
        margin: '4px 0 8px 0',
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    arenaProblemDesc: {
        margin: 0,
        fontSize: '12px',
        lineHeight: '1.6',
        color: 'var(--text-secondary)'
    },
    sidebarPanelTitle: {
        margin: '0 0 8px 0',
        fontSize: '11px',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    exampleBox: {
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        whiteSpace: 'pre-wrap',
        margin: '0 0 12px 0'
    },
    revealedHintsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '10px'
    },
    hintBubble: {
        backgroundColor: 'rgba(59, 130, 246, 0.04)',
        border: '1px dashed rgba(59, 130, 246, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px'
    },
    hintIndex: {
        fontSize: '9px',
        fontWeight: '800',
        color: 'var(--color-primary)',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: '4px'
    },
    hintText: {
        margin: 0,
        fontSize: '11px',
        lineHeight: '1.5',
        color: 'var(--text-secondary)'
    },
    emptyHintsBox: {
        textAlign: 'center',
        padding: '12px 0'
    },
    revealHintBtn: {
        backgroundColor: 'transparent',
        border: '1px dashed var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '8px',
        color: 'var(--color-primary)',
        fontSize: '11px',
        fontWeight: '600',
        cursor: 'pointer',
        width: '100%',
        transition: 'all 0.2s ease'
    },
    // Workspace layout
    arenaWorkspace: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)'
    },
    workspaceControls: {
        height: '48px',
        padding: '0 16px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    arenaTimer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid var(--border-color)',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: '13px'
    },
    penaltyBanner: {
        color: 'var(--color-error)',
        fontSize: '11px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    controlButtons: {
        display: 'flex',
        gap: '8px'
    },
    resetBtn: {
        backgroundColor: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    arenaRunBtn: {
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '6px 14px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    arenaSubmitBtn: {
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: '6px 16px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)'
    },
    arenaEditorWrapper: {
        flex: 0.6,
        borderBottom: '1px solid var(--border-color)',
        overflow: 'hidden'
    },
    arenaTerminalPanel: {
        flex: 0.4,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-tertiary)'
    },
    terminalTabs: {
        height: '36px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px'
    },
    terminalTabHeader: {
        fontSize: '11px',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    terminalBody: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        position: 'relative'
    },
    emptyTerminal: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '12px',
        textAlign: 'center'
    },
    consoleLogs: {
        height: '100%',
        overflowY: 'auto'
    },
    testSuiteWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    testSuiteBanner: {
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid transparent',
        fontSize: '13px'
    },
    testCasesGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    testCaseRow: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    tcBoxGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
    },
    tcRowLabel: {
        fontSize: '10px',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase'
    },
    tcRowVal: {
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '4px 8px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)'
    },
    errorStack: {
        margin: '6px 0 0 0',
        backgroundColor: 'rgba(239, 68, 68, 0.04)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        color: 'var(--color-error)',
        padding: '8px 12px',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        whiteSpace: 'pre-wrap'
    },
    // Overlay Celebration Modal
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    successModal: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        maxWidth: '440px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: 'var(--shadow-soft)'
    },
    successBanner: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(251, 191, 36, 0.08)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
    },
    successTitle: {
        margin: '0 0 6px 0',
        fontSize: '22px',
        fontWeight: '800',
        color: 'var(--text-primary)'
    },
    successDesc: {
        margin: '0 0 24px 0',
        fontSize: '13px',
        lineHeight: '1.5',
        color: 'var(--text-secondary)'
    },
    statsCard: {
        display: 'flex',
        width: '100%',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        justifyContent: 'space-around',
        marginBottom: '20px'
    },
    statBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    statBoxLabel: {
        fontSize: '10px',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        marginBottom: '2px'
    },
    statBoxVal: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    scoreRow: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px',
        marginBottom: '24px',
        fontSize: '13px',
        fontWeight: '500',
        color: 'var(--text-secondary)'
    },
    scoreText: {
        fontSize: '20px',
        fontWeight: '800',
        color: 'var(--color-primary)'
    },
    modalExitBtn: {
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: '10px 24px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        width: '100%',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
    },
    // Rankings / Leaderboards
    leaderboardContainer: {
        height: '100%',
        overflowY: 'auto',
        padding: '24px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
    },
    leaderboardStatsHeader: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
    },
    mainRankBox: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-soft)'
    },
    rankBoxTitle: {
        margin: 0,
        fontSize: '11px',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    rankBoxVal: {
        margin: '2px 0 0 0',
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    leaderboardBody: {
        marginBottom: '40px'
    },
    leaderboardCard: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)'
    },
    leaderboardHeading: {
        margin: '0 0 20px 0',
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    leaderboardList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    listHeaderRow: {
        display: 'flex',
        padding: '10px 14px',
        fontSize: '11px',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '8px'
    },
    listRow: {
        display: 'flex',
        padding: '12px 14px',
        fontSize: '13px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid transparent',
        alignItems: 'center',
        transition: 'all 0.15s ease'
    },
    userHighlightRow: {
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.25)'
    },
    colRank: { width: '60px', textAlign: 'center' },
    colName: { flex: 1.5, color: 'var(--text-primary)' },
    colTitle: { flex: 1.5, color: 'var(--text-secondary)' },
    colSolved: { flex: 1, color: 'var(--text-muted)' },
    colSpeed: { flex: 1, color: 'var(--text-muted)' },
    colWin: { flex: 1, color: 'var(--text-muted)' },
    colPoints: { flex: 1, textAlign: 'right' },

    // Weekly Tournaments
    tournamentsContainer: {
        height: '100%',
        overflowY: 'auto',
        padding: '24px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
    },
    tournamentDoublePane: {
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '28px',
        paddingBottom: '40px'
    },
    tournamentsLeft: {
        display: 'flex',
        flexDirection: 'column'
    },
    tournamentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    tournamentCard: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-soft)'
    },
    tourCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
    },
    livePulseTag: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '10px',
        fontWeight: '800',
        color: 'var(--color-success)',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)'
    },
    pulseDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-success)',
        animation: 'blink 1.5s infinite'
    },
    upcomingTag: {
        fontSize: '10px',
        fontWeight: '800',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)'
    },
    tourXpPool: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#fbbf24',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    tourDiffBadge: {
        fontSize: '10px',
        fontWeight: '700',
        color: 'var(--text-muted)'
    },
    tourTitle: {
        margin: '0 0 8px 0',
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    tourDesc: {
        margin: '0 0 16px 0',
        fontSize: '12px',
        lineHeight: '1.6',
        color: 'var(--text-secondary)'
    },
    tourFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '12px',
        marginTop: '12px'
    },
    tourMeta: {
        display: 'flex',
        gap: '16px'
    },
    tourMetaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        color: 'var(--text-muted)'
    },
    registerBtn: {
        backgroundColor: 'transparent',
        border: '1px solid var(--color-primary)',
        color: 'var(--color-primary)',
        borderRadius: 'var(--radius-md)',
        padding: '6px 16px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    registeredBtn: {
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderColor: 'transparent',
        color: 'var(--color-primary)',
        cursor: 'default'
    },
    tournamentsRight: {
        display: 'flex',
        flexDirection: 'column'
    },
    podiumCard: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)'
    },
    podiumHeading: {
        margin: '0 0 6px 0',
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    podiumSubheading: {
        margin: '0 0 24px 0',
        fontSize: '12px',
        color: 'var(--text-muted)'
    },
    podiumDisplay: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: '220px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '8px',
        marginBottom: '20px'
    },
    podiumColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '80px'
    },
    championAvatar: {
        fontSize: '24px',
        marginBottom: '4px'
    },
    championName: {
        fontSize: '10px',
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '74px',
        textAlign: 'center'
    },
    championScore: {
        fontSize: '9px',
        color: 'var(--text-muted)',
        marginBottom: '6px'
    },
    podiumBlock: {
        width: '100%',
        borderRadius: '4px 4px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    podiumPlaceText: {
        fontSize: '14px',
        fontWeight: '800',
        color: 'var(--text-muted)'
    },
    pastPodiumsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    pastPodiumItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        padding: '8px 12px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
    }
};

export default DebuggingArena;
