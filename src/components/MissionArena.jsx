import React, { useState, useEffect } from 'react';
import { Skull, Heart, ShieldAlert, X, Zap, Trophy, Play, CheckCircle2, RefreshCw, Terminal, Activity, Sparkles, BookOpen } from 'lucide-react';
import Editor from './Editor';
import { useGamification } from '../context/GamificationContext';
import { playUnlockChime } from '../lib/audioSynth';
import pythonEngine from '../lib/pythonEngine';
import { DIFFICULTY_LEVELS, MISSION_TYPES } from '../lib/missionData';

const MissionArena = ({ mission, onExit }) => {
    const gamification = useGamification() || {};
    const [code, setCode] = useState(mission.initialCode || '');
    const [activeTab, setActiveTab] = useState('briefing'); // 'briefing', 'ai', 'diagnostics'
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState(null); // { success: boolean, stdout: string, stderr: string, duration: number, perfTimeout: boolean }
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [predictionChecked, setPredictionChecked] = useState(false);
    const [predictionSuccess, setPredictionSuccess] = useState(false);
    const [shakeContainer, setShakeContainer] = useState(false);

    // Boss Battle states (if legendary/boss type)
    const isLegendary = mission.difficulty === 'legendary';
    const [bossHealth, setBossHealth] = useState(100);
    const [playerHealth, setPlayerHealth] = useState(100);

    useEffect(() => {
        if (isLegendary) {
            // Boss Battle passive damage loop (deal 4 damage every 6 seconds as stress mechanism)
            const interval = setInterval(() => {
                setPlayerHealth(prev => {
                    const nextVal = Math.max(0, prev - 4);
                    if (nextVal === 0) {
                        clearInterval(interval);
                    }
                    return nextVal;
                });
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [isLegendary]);

    useEffect(() => {
        if (playerHealth === 0) {
            playUnlockChime('rare'); // play a minor chime
            alert("🚨 Defeat! You ran out of energy shielding. Try optimizing your approach and try again!");
            onExit();
        }
    }, [playerHealth]);

    const handleRunAndValidate = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setTestResults(null);
        setActiveTab('diagnostics');

        // Capture start state
        const originalCode = code;
        const testScript = originalCode + '\n' + (mission.validationAppend || '');

        try {
            // Execute python code in WASM engine
            const result = await pythonEngine.run(testScript);
            const duration = result.duration;
            const stdout = result.stdout || '';
            const stderr = result.stderr || '';

            // Clean up outputs for robust string checks
            const cleanStdout = stdout.replace(/\r\n/g, '\n').trim();
            const cleanExpected = mission.expectedStdout.replace(/\r\n/g, '\n').trim();

            let success = cleanStdout === cleanExpected && !stderr;
            let perfTimeout = false;

            // Benchmarking optimization constraint
            if (success && mission.validationType === 'performance') {
                const maxAllowed = mission.maxDurationMs || 500;
                if (duration > maxAllowed) {
                    success = false;
                    perfTimeout = true;
                }
            }

            setTestResults({
                success,
                stdout,
                stderr,
                duration,
                perfTimeout
            });

            if (success) {
                // Victory sound arpeggio
                playUnlockChime(mission.difficulty === 'legendary' ? 'legendary' : mission.difficulty === 'advanced' ? 'epic' : 'rare');
                
                // Deal boss damage
                if (isLegendary) {
                    setBossHealth(0);
                    setTimeout(() => {
                        gamification.addXP(mission.xp);
                        gamification.completeMission(mission.id, mission.xp);
                        alert(`💥 VICTORY! You defeated the Anagram Sorcerer and secured +${mission.xp} XP!`);
                        onExit();
                    }, 800);
                } else {
                    gamification.addXP(mission.xp);
                    gamification.completeMission(mission.id, mission.xp);
                    alert(`🎉 Mission Accomplished! Excellent logic, +${mission.xp} XP awarded!`);
                    onExit();
                }
            } else {
                // Deal damage to user or trigger shakes on error
                setShakeContainer(true);
                setTimeout(() => setShakeContainer(false), 500);
                
                if (isLegendary) {
                    setPlayerHealth(prev => Math.max(10, prev - 25));
                }
            }

        } catch (err) {
            console.error(err);
            setTestResults({
                success: false,
                stdout: '',
                stderr: err.message || 'Execution failed',
                duration: 0,
                perfTimeout: false
            });
        } finally {
            setIsRunning(false);
        }
    };

    const handleValidatePrediction = () => {
        if (!selectedPrediction || predictionChecked) return;

        const isCorrect = selectedPrediction === mission.correctPrediction;
        setPredictionChecked(true);
        setPredictionSuccess(isCorrect);

        if (isCorrect) {
            playUnlockChime(mission.difficulty === 'advanced' ? 'epic' : 'rare');
            gamification.addXP(mission.xp);
            gamification.completeMission(mission.id, mission.xp);
            alert(`🎉 Correct prediction! +${mission.xp} XP awarded!`);
            setTimeout(onExit, 2500);
        } else {
            setShakeContainer(true);
            setTimeout(() => setShakeContainer(false), 500);
        }
    };

    const difficulty = DIFFICULTY_LEVELS[mission.difficulty] || DIFFICULTY_LEVELS.beginner;
    const typeMeta = MISSION_TYPES[mission.type] || MISSION_TYPES.fix_broken_code;

    const renderBriefingTab = () => (
        <div style={styles.tabContent}>
            <div style={styles.briefingSection}>
                <h3 style={styles.blockTitle}><BookOpen size={16} /> Mission Directive</h3>
                <p style={styles.briefingText}>{mission.briefing}</p>
            </div>

            {mission.solutionHint && (
                <div style={styles.hintSection}>
                    <h4 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        💡 Decryption Hint
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{mission.solutionHint}</p>
                </div>
            )}
        </div>
    );

    const renderAIAssistantTab = () => (
        <div style={styles.tabContent}>
            <div style={styles.aiPane}>
                <div style={styles.aiAvatar}>
                    <Sparkles size={18} color="#2dd4bf" />
                    <span>AI Engineering Companion v2.8</span>
                </div>
                <div style={styles.aiMessage}>
                    {mission.aiSidebarInstructions ? (
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                            {mission.aiSidebarInstructions}
                        </div>
                    ) : (
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Operator, I'm auditing your logic structures. Write clean modular code. If you get stuck, examine the briefing hints or run compilation checks to capture stack traces.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderDiagnosticsTab = () => (
        <div style={styles.tabContent}>
            {!testResults ? (
                <div style={styles.diagnosticsEmpty}>
                    <Terminal size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontSize: '12px' }}>Waiting for script execution diagnostics...</p>
                </div>
            ) : (
                <div style={styles.diagnosticsGlow}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Diagnostics Output</span>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: testResults.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: testResults.success ? 'var(--color-success)' : 'var(--color-error)'
                        }}>
                            {testResults.success ? '✅ PASS' : '❌ FAIL'}
                        </span>
                    </div>

                    {testResults.perfTimeout && (
                        <div style={styles.alertError}>
                            <ShieldAlert size={16} />
                            <span>**Performance Timeout**: Optimization limit exceeded! Your code took {testResults.duration.toFixed(1)}ms. The constraint is &lt; {mission.maxDurationMs}ms.</span>
                        </div>
                    )}

                    {testResults.stderr && (
                        <div style={styles.consoleError}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>{testResults.stderr}</pre>
                        </div>
                    )}

                    {!testResults.stderr && (
                        <div style={styles.consoleOutput}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                                Target Output Comparison:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                                <div>
                                    <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '4px' }}>EXPECTED:</div>
                                    <pre style={{ margin: 0, background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', overflowX: 'auto' }}>{mission.expectedStdout}</pre>
                                </div>
                                <div>
                                    <div style={{ color: testResults.success ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 'bold', marginBottom: '4px' }}>ACTUAL:</div>
                                    <pre style={{ margin: 0, background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', overflowX: 'auto' }}>{testResults.stdout || '(Empty Output)'}</pre>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <div>Latency: <strong style={{ color: 'var(--text-primary)' }}>{testResults.duration.toFixed(1)} ms</strong></div>
                        {mission.maxDurationMs && (
                            <div>Threshold: <strong style={{ color: 'var(--text-primary)' }}>{mission.maxDurationMs} ms</strong></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div style={styles.container} className={shakeContainer ? 'shake' : ''}>
            {/* Cyber Arena Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <h2 style={styles.title}>{mission.title}</h2>
                    <div style={styles.badgeRow}>
                        <span className="difficulty-badge" style={{ borderColor: difficulty.color, color: difficulty.color, textShadow: `0 0 6px ${difficulty.color}` }}>
                            {difficulty.label}
                        </span>
                        <span className="type-badge" style={{ backgroundColor: `${typeMeta.color}20`, color: typeMeta.color }}>
                            {typeMeta.label}
                        </span>
                    </div>
                </div>

                <div style={styles.headerRight}>
                    <div style={styles.xpCard}>
                        <Trophy size={14} color="#f59e0b" />
                        <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>+{mission.xp} XP</span>
                    </div>
                    <button style={styles.closeBtn} onClick={onExit}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Boss Battle Dashboard (Legendary only) */}
            {isLegendary && (
                <div style={styles.bossArena}>
                    <div style={styles.entityCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Skull size={16} /> Syntax Overlord
                            </span>
                            <span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>{bossHealth}/100 HP</span>
                        </div>
                        <div style={styles.healthBarBg}>
                            <div style={{ ...styles.healthBarFill, width: `${bossHealth}%`, backgroundColor: 'var(--color-error)' }}></div>
                        </div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-muted)' }}>VS</div>
                    <div style={styles.entityCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={16} /> Memory Shielding
                            </span>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{playerHealth}/100 HP</span>
                        </div>
                        <div style={styles.healthBarBg}>
                            <div style={{ ...styles.healthBarFill, width: `${playerHealth}%`, backgroundColor: 'var(--color-primary)' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mission Content Splitter */}
            <div style={styles.sandboxContent}>
                {mission.type === 'predict_output' ? (
                    /* PREDICT OUTPUT GAMEPLAY */
                    <div style={styles.predictionBox}>
                        <div style={styles.predictorPrompt}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--color-primary)' }}>Analyze the execution logic:</h3>
                            <pre style={styles.predictorCode}>
                                <code>{mission.codeSnippet}</code>
                            </pre>
                        </div>

                        <div style={styles.choicesGrid}>
                            {mission.choices.map((choice) => {
                                const isSelected = selectedPrediction === choice;
                                const isChecked = predictionChecked;
                                const isCorrectChoice = choice === mission.correctPrediction;

                                let choiceStyle = { ...styles.choiceCard };
                                if (isSelected) {
                                    choiceStyle = {
                                        ...choiceStyle,
                                        borderColor: isChecked ? (isCorrectChoice ? 'var(--color-success)' : 'var(--color-error)') : 'var(--color-primary)',
                                        backgroundColor: isChecked ? (isCorrectChoice ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 'rgba(59, 130, 246, 0.1)',
                                        color: isChecked ? (isCorrectChoice ? 'var(--color-success)' : 'var(--color-error)') : 'var(--color-primary)',
                                        boxShadow: isChecked ? `0 0 15px ${isCorrectChoice ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` : '0 0 15px rgba(59, 130, 246, 0.3)'
                                    };
                                } else if (isChecked && isCorrectChoice) {
                                    // Highlight correct choice if user guessed wrong
                                    choiceStyle = {
                                        ...choiceStyle,
                                        borderColor: 'var(--color-success)',
                                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                        color: 'var(--color-success)'
                                    };
                                }

                                return (
                                    <button
                                        key={choice}
                                        style={choiceStyle}
                                        onClick={() => !predictionChecked && setSelectedPrediction(choice)}
                                        disabled={predictionChecked}
                                    >
                                        <span style={{ fontSize: '16px', fontFamily: 'var(--font-mono)' }}>{choice}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div style={styles.predictionFooter}>
                            {!predictionChecked ? (
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}
                                    disabled={!selectedPrediction}
                                    onClick={handleValidatePrediction}
                                >
                                    SYNAPSE VERIFY (SUBMIT PREDICTION)
                                </button>
                            ) : (
                                <div style={{
                                    ...styles.explanationCard,
                                    borderColor: predictionSuccess ? 'var(--color-success)' : 'var(--color-error)',
                                    background: predictionSuccess ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                                }}>
                                    <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: predictionSuccess ? 'var(--color-success)' : 'var(--color-error)' }}>
                                        {predictionSuccess ? '🎉 Correct Matrix Sieve!' : '❌ Synapse Connection Failed'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{mission.explanation}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* CODING GAMEPLAY (Fix code, optimize, mini project, find bugs, etc.) */
                    <div style={styles.codingGrid}>
                        {/* Left briefing panel */}
                        <div style={styles.leftPane}>
                            <div style={styles.tabHeaders}>
                                <button
                                    style={activeTab === 'briefing' ? styles.tabHeaderActive : styles.tabHeader}
                                    onClick={() => setActiveTab('briefing')}
                                >
                                    Briefing
                                </button>
                                <button
                                    style={activeTab === 'ai' ? styles.tabHeaderActive : styles.tabHeader}
                                    onClick={() => setActiveTab('ai')}
                                >
                                    AI Companion
                                </button>
                                <button
                                    style={activeTab === 'diagnostics' ? styles.tabHeaderActive : styles.tabHeader}
                                    onClick={() => setActiveTab('diagnostics')}
                                >
                                    Diagnostics
                                </button>
                            </div>

                            <div style={styles.tabContainer}>
                                {activeTab === 'briefing' && renderBriefingTab()}
                                {activeTab === 'ai' && renderAIAssistantTab()}
                                {activeTab === 'diagnostics' && renderDiagnosticsTab()}
                            </div>
                        </div>

                        {/* Right editor panel */}
                        <div style={styles.editorPane}>
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                                <Editor
                                    isDarkMode={true}
                                    code={code}
                                    setCode={setCode}
                                    onRun={handleRunAndValidate}
                                    language="Python"
                                />
                            </div>

                            <div style={styles.editorFooter}>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 'bold', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
                                    disabled={isRunning}
                                    onClick={handleRunAndValidate}
                                >
                                    {isRunning ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <RefreshCw className="spin" size={16} /> Compiling & Auditing Tests...
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <Play size={16} /> COMPILE & RUN MATRIX TESTS
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .difficulty-badge {
                    border: 1px solid;
                    border-radius: 20px;
                    padding: 2px 10px;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }
                .type-badge {
                    border-radius: 20px;
                    padding: 2px 10px;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1.5s linear infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                    20%, 40%, 60%, 80% { transform: translateX(6px); }
                }
                .shake {
                    animation: shake 0.5s ease;
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#070709', // Hacking terminal base
        color: '#e2e8f0',
        fontFamily: 'var(--font-sans)',
    },
    header: {
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1f2937',
        backgroundColor: '#0d0d12'
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    title: {
        fontSize: '18px',
        fontWeight: '800',
        margin: 0,
        background: 'linear-gradient(90deg, var(--color-primary), #2dd4bf)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    badgeRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    xpCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '8px',
        fontSize: '13px'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s, background-color 0.2s',
        ':hover': {
            backgroundColor: '#1f2937',
            color: '#fff'
        }
    },
    bossArena: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: '#0d0d12',
        borderBottom: '1px solid #1f2937',
        gap: '24px'
    },
    entityCard: {
        flex: 1,
        backgroundColor: '#121218',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #1f2937'
    },
    healthBarBg: {
        height: '8px',
        backgroundColor: '#1f2937',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    healthBarFill: {
        height: '100%',
        transition: 'width 0.3s ease'
    },
    sandboxContent: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
    },
    predictionBox: {
        flex: 1,
        padding: '32px',
        maxWidth: '750px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto'
    },
    predictorPrompt: {
        display: 'flex',
        flexDirection: 'column'
    },
    predictorCode: {
        margin: 0,
        padding: '16px',
        backgroundColor: '#0d0d12',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        overflowX: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: '1.5',
        color: '#a7f3d0'
    },
    choicesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px'
    },
    choiceCard: {
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #1f2937',
        backgroundColor: '#0d0d12',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        textAlign: 'center',
        outline: 'none'
    },
    predictionFooter: {
        marginTop: '16px'
    },
    explanationCard: {
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid',
        lineHeight: '1.5'
    },
    codingGrid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.2fr 1.5fr',
        minHeight: 0
    },
    leftPane: {
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1f2937',
        minHeight: 0
    },
    tabHeaders: {
        display: 'flex',
        borderBottom: '1px solid #1f2937',
        backgroundColor: '#0d0d12'
    },
    tabHeader: {
        flex: 1,
        padding: '12px',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s'
    },
    tabHeaderActive: {
        flex: 1,
        padding: '12px',
        background: 'none',
        border: 'none',
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'default',
        borderBottom: '2px solid var(--color-primary)',
        backgroundColor: '#070709'
    },
    tabContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '24px'
    },
    tabContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    briefingSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    blockTitle: {
        margin: 0,
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    briefingText: {
        margin: 0,
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
    },
    hintSection: {
        padding: '16px',
        backgroundColor: '#0d0d12',
        border: '1px solid #1f2937',
        borderRadius: '12px'
    },
    aiPane: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    aiAvatar: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#2dd4bf'
    },
    aiMessage: {
        padding: '16px',
        backgroundColor: '#0d0d12',
        border: '1px solid rgba(45, 212, 191, 0.2)',
        borderRadius: '12px',
        boxShadow: '0 0 10px rgba(45, 212, 191, 0.05)'
    },
    diagnosticsEmpty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: 'var(--text-muted)'
    },
    diagnosticsGlow: {
        backgroundColor: '#0d0d12',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '16px'
    },
    alertError: {
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        padding: '10px 12px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '8px',
        color: 'var(--color-error)',
        fontSize: '12px',
        marginBottom: '16px',
        lineHeight: '1.4'
    },
    consoleError: {
        padding: '12px',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '8px',
        color: '#fca5a5',
        fontSize: '12px',
        maxHeight: '180px',
        overflowY: 'auto'
    },
    consoleOutput: {
        display: 'flex',
        flexDirection: 'column'
    },
    editorPane: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1e1e24',
        minHeight: 0
    },
    editorFooter: {
        padding: '16px',
        backgroundColor: '#0d0d12',
        borderTop: '1px solid #1f2937'
    }
};

export default MissionArena;
