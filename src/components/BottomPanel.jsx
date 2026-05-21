import React, { useState, useEffect, useRef } from 'react';
import { Terminal, AlignLeft, XCircle, Clock } from 'lucide-react';

const BottomPanel = ({ output = [], isRunning, executionTime = 0, onJumpToLine, onClear, problems = [], onApplyFix }) => {
    const [activeTab, setActiveTab] = useState('output');
    const [coachingModeEnabled, setCoachingModeEnabled] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output]);

    const parseErrorLine = (text) => {
        // Simple regex to find line numbers in Pyodide/Python tracebacks
        // Example: "File \"<exec>\", line 5, in <module>"
        const match = text.match(/line (\d+)/);
        return match ? parseInt(match[1]) : null;
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'output' ? styles.activeTab : {}) }}
                        onClick={() => setActiveTab('output')}
                    >
                        <Terminal size={14} /> Output
                    </button>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'problems' ? styles.activeTab : {}) }}
                        onClick={() => setActiveTab('problems')}
                    >
                        <XCircle size={14} color={problems.length > 0 ? "var(--color-error)" : "var(--text-muted)"} /> Problems <span style={{ ...styles.badge, backgroundColor: problems.length > 0 ? 'var(--color-error)' : 'var(--bg-hover)', color: problems.length > 0 ? '#fff' : 'var(--text-secondary)' }}>{problems.length}</span>
                    </button>
                </div>

                <div style={styles.spacer}></div>

                <div style={styles.statusInfo}>
                    <button onClick={onClear} className="btn-icon" style={styles.clearBtn} title="Clear Console">
                        <XCircle size={14} /> Clear
                    </button>
                    <div style={styles.statusItem}>
                        {isRunning && <span style={styles.pulseDot}></span>}
                        <Clock size={14} /> <span style={styles.monoText}>
                            {executionTime > 0 ? (executionTime / 1000).toFixed(3) : '0.000'}s
                        </span> execution
                    </div>
                    <div style={styles.statusItem}>
                        <AlignLeft size={14} /> Python 3.10
                    </div>
                </div>
            </div>

            <div style={styles.content} ref={scrollRef}>
                {activeTab === 'output' && (
                    <div style={styles.terminal}>
                        {output.map((line, idx) => {
                            const errorLine = line.type === 'stderr' ? parseErrorLine(line.text) : null;
                            return (
                                <div key={idx} style={{
                                    ...styles.terminalLine,
                                    color: line.type === 'stderr' ? 'var(--color-error)' :
                                        line.type === 'warning' ? '#f59e0b' : 'var(--text-primary)',
                                    cursor: errorLine ? 'pointer' : 'default',
                                    textDecoration: errorLine ? 'underline' : 'none',
                                    backgroundColor: errorLine ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                                }}
                                    onClick={() => errorLine && onJumpToLine(errorLine)}
                                >
                                    {line.type === 'prompt' && <span style={styles.prompt}>$</span>}
                                    {line.type === 'sql_table' ? (
                                        <div style={styles.sqlResultsWrapper}>
                                            {line.results.map((res, rIdx) => (
                                                <div key={rIdx} style={styles.sqlResult}>
                                                    <table style={styles.sqlTable}>
                                                        <thead>
                                                            <tr>
                                                                {res.columns.map(col => <th key={col} style={styles.sqlTh}>{col}</th>)}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {res.values.map((row, rowIdx) => (
                                                                <tr key={rowIdx}>
                                                                    {row.map((cell, cIdx) => <td key={cIdx} style={styles.sqlTd}>{cell}</td>)}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        line.text
                                    )}
                                </div>
                            );
                        })}
                        {isRunning && (
                            <div style={styles.terminalLine}>
                                <span style={styles.prompt}>$</span> <span style={styles.cursor}></span>
                            </div>
                        )}
                        {!isRunning && output.length === 0 && (
                            <div style={styles.emptyTerminal}>
                                Click Run to execute your Python code...
                            </div>
                        )}
                    </div>
                )}


                {activeTab === 'problems' && (
                    <div style={styles.problemsContainer}>
                        {/* Glowing Glassmorphic Coach Switcher */}
                        <div style={styles.coachHeader}>
                            <div style={styles.coachInfo}>
                                <span style={styles.coachAvatar}>🤖</span>
                                <div style={styles.coachText}>
                                    <span style={styles.coachTitle}>PULXO AI Socratic Coach</span>
                                    <span style={styles.coachSubtitle}>Translating compiler errors into conceptual guides</span>
                                </div>
                            </div>
                            <div style={styles.toggleWrapper}>
                                <span style={{ ...styles.toggleLabel, color: coachingModeEnabled ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                                    🚀 Beginner Coaching
                                </span>
                                <button 
                                    onClick={() => setCoachingModeEnabled(!coachingModeEnabled)}
                                    style={{
                                        ...styles.toggleSwitch,
                                        backgroundColor: coachingModeEnabled ? 'var(--color-primary)' : 'var(--bg-hover)',
                                    }}
                                >
                                    <div style={{
                                        ...styles.toggleCircle,
                                        transform: coachingModeEnabled ? 'translateX(18px)' : 'translateX(2px)',
                                    }} />
                                </button>
                            </div>
                        </div>

                        {problems.length === 0 ? (
                            <div style={styles.emptyState}>
                                <XCircle size={32} color="var(--color-success)" style={{ opacity: 0.5, marginBottom: '8px' }} />
                                <p>No problems have been detected in the workspace.</p>
                            </div>
                        ) : (
                            <div style={styles.problemsList}>
                                {problems.map((prob, idx) => {
                                    const hasCoaching = prob.coaching;
                                    
                                    if (coachingModeEnabled && hasCoaching) {
                                        return (
                                            <div key={idx} style={styles.coachingCard}>
                                                <div style={styles.coachingHeader} onClick={() => onJumpToLine(prob.line)}>
                                                    <span style={{
                                                        ...styles.badgeCategory,
                                                        borderColor: prob.type === 'error' ? 'var(--color-error)' : '#f59e0b',
                                                        color: prob.type === 'error' ? 'var(--color-error)' : '#f59e0b',
                                                    }}>
                                                        {prob.type.toUpperCase()}: LINE {prob.line}
                                                    </span>
                                                    <span style={styles.problemLine}>Jump to line</span>
                                                </div>

                                                <div style={styles.coachingBody}>
                                                    {/* Warm Encouragement */}
                                                    <p style={styles.coachingEncouragement}>
                                                        ✨ {prob.coaching.encouragement || "Let's work through this step-by-step!"}
                                                    </p>

                                                    {/* Metaphor / Everyday Analogy */}
                                                    <div style={styles.coachingAnalogyBox}>
                                                        <span style={styles.emojiIndicator}>💡</span>
                                                        <div style={styles.analogyTextWrapper}>
                                                            <strong style={styles.analogyTitle}>The Everyday Analogy:</strong>
                                                            <p style={styles.analogyParagraph}>{prob.coaching.analogy}</p>
                                                        </div>
                                                    </div>

                                                    {/* Socratic Hint */}
                                                    <div style={styles.coachingHintBox}>
                                                        <span style={styles.emojiIndicator}>🔍</span>
                                                        <div style={styles.hintTextWrapper}>
                                                            <strong style={styles.hintTitle}>Socratic Thinking Step:</strong>
                                                            <p style={styles.hintParagraph}>{prob.coaching.hint}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Bar */}
                                                {prob.fix && (
                                                    <div style={styles.coachingFixRow}>
                                                        <div style={styles.fixPreview}>
                                                            <span style={styles.fixLabel}>Suggested Fix Preview</span>
                                                            <code style={styles.fixCode}>{prob.fix}</code>
                                                        </div>
                                                        <button
                                                            style={styles.applyFixBtnCoaching}
                                                            onClick={() => onApplyFix(prob)}
                                                        >
                                                            🛠️ Apply Fix
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // Fallback / Standard technical mode
                                    return (
                                        <div key={idx} style={styles.problemItem}>
                                            <div style={styles.problemHeader} onClick={() => onJumpToLine(prob.line)}>
                                                <XCircle size={14} color={prob.type === 'error' ? 'var(--color-error)' : '#f59e0b'} />
                                                <span style={styles.problemMessage}>{prob.message}</span>
                                                <span style={styles.problemLine}>Line {prob.line}</span>
                                            </div>
                                            {prob.fix && (
                                                <div style={styles.problemFixRow}>
                                                    <div style={styles.fixPreview}>
                                                        <span style={styles.fixLabel}>Suggested Fix:</span>
                                                        <code style={styles.fixCode}>{prob.fix}</code>
                                                    </div>
                                                    <button
                                                        style={styles.applyFixBtn}
                                                        onClick={() => onApplyFix(prob)}
                                                    >
                                                        Apply Fix
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
    },
    header: {
        height: '36px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)',
    },
    tabs: {
        display: 'flex',
        gap: '16px',
        height: '100%',
    },
    tab: {
        background: 'none',
        border: 'none',
        borderBottom: '2px solid transparent',
        color: 'var(--text-muted)',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        padding: '0 4px',
        transition: 'all 0.2s',
    },
    activeTab: {
        color: 'var(--text-primary)',
        borderBottomColor: 'var(--color-primary)',
    },
    badge: {
        backgroundColor: 'var(--bg-hover)',
        color: 'var(--text-secondary)',
        padding: '2px 6px',
        borderRadius: '10px',
        fontSize: '10px',
    },
    spacer: {
        flex: 1,
    },
    statusInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    statusItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
    },
    clearBtn: {
        background: 'none',
        color: 'var(--text-muted)',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'all 0.2s',
        marginRight: '8px',
        border: '1px solid var(--border-color)',
    },
    monoText: {
        fontFamily: 'var(--font-mono)',
    },
    content: {
        flex: 1,
        padding: '12px 16px',
        overflow: 'auto',
        backgroundColor: 'var(--bg-secondary)',
    },
    terminal: {
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    terminalLine: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-primary)',
    },
    prompt: {
        color: 'var(--color-success)',
        fontWeight: '600',
    },
    terminalOutput: {
        color: 'var(--text-secondary)',
        paddingLeft: '16px',
    },
    cursor: {
        display: 'inline-block',
        width: '8px',
        height: '16px',
        backgroundColor: 'var(--text-muted)',
        animation: 'blink 1s step-end infinite',
    },
    pulseDot: {
        width: '8px',
        height: '8px',
        backgroundColor: 'var(--color-success)',
        borderRadius: '50%',
        marginRight: '8px',
        animation: 'pulse 1.5s infinite',
    },
    emptyTerminal: {
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        fontSize: '13px',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
        fontSize: '14px',
    },
    problemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    problemItem: {
        padding: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    problemHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
    },
    problemMessage: {
        fontSize: '13px',
        color: 'var(--text-primary)',
        flex: 1,
    },
    problemLine: {
        fontSize: '11px',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-primary)',
        padding: '2px 6px',
        borderRadius: '4px',
    },
    problemFixRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '6px',
        border: '1px dashed rgba(59, 130, 246, 0.3)',
    },
    fixPreview: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
    },
    fixLabel: {
        fontSize: '10px',
        color: 'var(--color-primary)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    fixCode: {
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--text-primary)',
    },
    applyFixBtn: {
        padding: '4px 12px',
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    sqlResultsWrapper: {
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        overflowX: 'auto',
    },
    sqlResult: {
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
    },
    sqlTable: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px',
        color: 'var(--text-primary)',
    },
    sqlTh: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: '8px 12px',
        textAlign: 'left',
        borderBottom: '1px solid var(--border-color)',
        fontWeight: 'bold',
        color: 'var(--color-primary)',
    },
    sqlTd: {
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-color)',
        fontFamily: 'var(--font-mono)',
    },
    problemsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    coachHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: 'rgba(59, 130, 246, 0.06)',
        borderRadius: '10px',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        marginBottom: '6px',
        backdropFilter: 'blur(8px)',
    },
    coachInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    coachAvatar: {
        fontSize: '22px',
        animation: 'avatarFloat 2s ease-in-out infinite',
        display: 'inline-block',
    },
    coachText: {
        display: 'flex',
        flexDirection: 'column',
    },
    coachTitle: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--color-primary)',
        letterSpacing: '0.5px',
    },
    coachSubtitle: {
        fontSize: '11px',
        color: 'var(--text-muted)',
    },
    toggleWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    toggleLabel: {
        fontSize: '12px',
        fontWeight: '600',
    },
    toggleSwitch: {
        width: '38px',
        height: '20px',
        borderRadius: '10px',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '0',
        position: 'relative',
        transition: 'all 0.3s ease',
    },
    toggleCircle: {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    coachingCard: {
        padding: '16px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '12px',
        borderLeft: '4px solid var(--color-primary)',
        borderTop: '1px solid var(--border-color)',
        borderRight: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
    },
    coachingHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        borderBottom: '1px dashed var(--border-color)',
        paddingBottom: '8px',
    },
    badgeCategory: {
        fontSize: '10px',
        fontWeight: '800',
        padding: '3px 8px',
        borderRadius: '6px',
        border: '1px solid',
        letterSpacing: '1px',
    },
    coachingBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    coachingEncouragement: {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        margin: '0',
        fontStyle: 'italic',
    },
    coachingAnalogyBox: {
        display: 'flex',
        gap: '10px',
        backgroundColor: 'rgba(59, 130, 246, 0.03)',
        border: '1px solid rgba(59, 130, 246, 0.08)',
        borderRadius: '8px',
        padding: '10px 12px',
    },
    coachingHintBox: {
        display: 'flex',
        gap: '10px',
        backgroundColor: 'rgba(16, 185, 129, 0.03)',
        border: '1px solid rgba(16, 185, 129, 0.08)',
        borderRadius: '8px',
        padding: '10px 12px',
    },
    emojiIndicator: {
        fontSize: '18px',
        marginTop: '2px',
    },
    analogyTextWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    analogyTitle: {
        fontSize: '12px',
        color: 'var(--color-primary)',
    },
    analogyParagraph: {
        fontSize: '12px',
        color: 'var(--text-secondary)',
        margin: '0',
        lineHeight: '1.5',
    },
    hintTextWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    hintTitle: {
        fontSize: '12px',
        color: '#10b981',
    },
    hintParagraph: {
        fontSize: '12px',
        color: 'var(--text-secondary)',
        margin: '0',
        lineHeight: '1.5',
    },
    coachingFixRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '10px 12px',
        backgroundColor: 'rgba(59, 130, 246, 0.04)',
        borderRadius: '8px',
        border: '1px dashed rgba(59, 130, 246, 0.25)',
        marginTop: '4px',
    },
    applyFixBtnCoaching: {
        padding: '6px 14px',
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
        transition: 'all 0.2s',
    }
};

const animations = `
@keyframes blink { 50% { opacity: 0; } }
@keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}
@keyframes avatarFloat {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0px); }
}
`;

const BottomPanelWithStyles = (props) => (
    <>
        <style>{animations}</style>
        <BottomPanel {...props} />
    </>
);

export default BottomPanelWithStyles;
