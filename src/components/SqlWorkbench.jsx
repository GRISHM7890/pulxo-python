import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Eraser, AlignLeft, Table as TableIcon, AlertCircle, CheckCircle2, Maximize2, Minimize2, Save, Cloud, Database } from 'lucide-react';
import Editor from './Editor';
import sqlEngine from '../lib/sqlEngine';
import { format } from 'sql-formatter';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, set, get } from 'firebase/database';

const SqlWorkbench = ({ initialCode, onSave }) => {
    const { user } = useAuth();
    const [code, setCode] = useState(initialCode || '-- Type your SQL commands here\n');
    const [terminalInput, setTerminalInput] = useState('');
    const [history, setHistory] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [lastExecution, setLastExecution] = useState(null);
    const terminalEndRef = useRef(null);
    const inputRef = useRef(null);

    // 1. Load Initial State from Firebase
    useEffect(() => {
        if (!user) return;

        const loadDb = async () => {
            try {
                const dbRef = ref(db, `users/${user.uid}/sql_state_v2`);
                const snapshot = await get(dbRef);
                if (snapshot.exists()) {
                    await sqlEngine.importAll(snapshot.val());
                    setHistory([{ text: 'RDBMS state synced from cloud.', type: 'muted' }]);
                } else {
                    await sqlEngine.loadSampleDataset();
                    setHistory([{ text: 'RDBMS initialized with CBSE sample dataset.', type: 'muted' }]);
                    handleSaveToCloud();
                }
            } catch (err) {
                console.error("Failed to load SQL state:", err);
                setHistory([{ text: 'Error loading RDBMS: ' + err.message, type: 'stderr' }]);
            }
        };

        loadDb();
    }, [user]);

    // 2. Clear Database Logic
    const handleReset = async () => {
        if (window.confirm("Are you sure you want to reset the RDBMS? All databases will be deleted.")) {
            sqlEngine.reset();
            await handleSaveToCloud();
            setHistory([{ text: 'RDBMS has been reset.', type: 'muted' }]);
        }
    };

    // 3. Save to Cloud Logic
    const handleSaveToCloud = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const state = sqlEngine.exportAll();
            await set(ref(db, `users/${user.uid}/sql_state_v2`), state);
        } catch (err) {
            console.error("Cloud save failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // 4. Execution Engine
    const executeCommand = async (sql) => {
        if (!sql.trim()) return;

        setIsRunning(true);
        const startTime = performance.now();
        const activeDb = sqlEngine.activeDbName || 'none';
        const cmdLog = { text: `sqlite [${activeDb}]> ${sql}`, type: 'prompt' };

        try {
            const res = await sqlEngine.run(sql);
            const duration = (performance.now() - startTime).toFixed(2);

            if (res.success) {
                const outputs = [];
                if (res.results && res.results.length > 0) {
                    outputs.push({ results: res.results, type: 'sql_table' });
                } else {
                    const msg = res.message || `${res.rowsModified} rows affected. (${duration}ms)`;
                    outputs.push({ text: msg, type: 'stdout' });
                }

                setHistory(prev => [...prev, cmdLog, ...outputs]);
                setLastExecution({ success: true, duration });

                // Multi-DB sync: Any command that might change the set of DBs or their content
                handleSaveToCloud();
            } else {
                setHistory(prev => [...prev, cmdLog, { text: `Error: ${res.error}`, type: 'stderr' }]);
                setLastExecution({ success: false, error: res.error });
            }
        } catch (err) {
            setHistory(prev => [...prev, cmdLog, { text: `Runtime Error: ${err.message}`, type: 'stderr' }]);
        } finally {
            setIsRunning(false);
            scrollToBottom();
        }
    };

    const handleTerminalSubmit = (e) => {
        e.preventDefault();
        if (terminalInput.trim()) {
            executeCommand(terminalInput);
            setTerminalInput('');
        }
    };

    const scrollToBottom = () => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={styles.container}>
            {/* Header / Toolbar */}
            <div style={styles.toolbar}>
                <div style={styles.toolGroup}>
                    <div style={styles.brand}>
                        <Database size={16} color="var(--color-primary)" />
                        <span style={styles.brandText}>RDBMS TERMINAL (MySQL MODE)</span>
                    </div>
                </div>

                <div style={styles.spacer}></div>

                <div style={styles.statusGroup}>
                    {isSaving ? (
                        <span style={styles.cloudStatus}><Cloud size={14} className="spin" /> Syncing...</span>
                    ) : (
                        <span style={styles.cloudStatus}><Cloud size={14} /> Cloud Active</span>
                    )}
                    <div style={styles.divider}></div>
                    <button style={styles.toolBtn} onClick={handleReset}>
                        <Eraser size={14} color="#ef4444" />
                        <span>Reset DB</span>
                    </button>
                </div>
            </div>

            {/* Main Terminal Area */}
            <div style={styles.terminalContainer}>
                <div style={styles.outputArea}>
                    {history.map((entry, idx) => (
                        <div key={idx} style={styles.entry}>
                            {entry.type === 'prompt' && <span style={styles.prompt}>{entry.text}</span>}
                            {entry.type === 'stdout' && <span style={styles.stdout}>{entry.text}</span>}
                            {entry.type === 'stderr' && <span style={styles.stderr}>{entry.text}</span>}
                            {entry.type === 'muted' && <span style={styles.muted}>{entry.text}</span>}
                            {entry.type === 'sql_table' && (
                                <div style={styles.tableScroll}>
                                    {entry.results.map((res, rIdx) => (
                                        <table key={rIdx} style={styles.table}>
                                            <thead>
                                                <tr>
                                                    {res.columns.map(col => <th key={col} style={styles.th}>{col}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {res.values.map((row, rowIdx) => (
                                                    <tr key={rowIdx}>
                                                        {row.map((cell, cIdx) => <td key={cIdx} style={styles.td}>{cell}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={terminalEndRef} />
                </div>

                <form onSubmit={handleTerminalSubmit} style={styles.inputArea}>
                    <span style={styles.promptLabel}>sqlite [{sqlEngine.activeDbName || 'none'}]&gt;</span>
                    <input
                        ref={inputRef}
                        style={styles.terminalInput}
                        value={terminalInput}
                        onChange={e => setTerminalInput(e.target.value)}
                        placeholder="Enter SQL command (MySQL mode supported)..."
                        autoFocus
                        disabled={isRunning}
                    />
                </form>
            </div>

            <style>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#09090b',
        color: '#e4e4e7',
        fontFamily: 'var(--font-mono)',
        overflow: 'hidden'
    },
    toolbar: {
        height: '42px',
        backgroundColor: '#18181b',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        flexShrink: 0
    },
    brand: { display: 'flex', alignItems: 'center', gap: '10px' },
    brandText: { fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' },
    spacer: { flex: 1 },
    statusGroup: { display: 'flex', alignItems: 'center', gap: '16px' },
    cloudStatus: { fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' },
    toolBtn: {
        background: 'none', border: 'none', color: '#a1a1aa', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
    },
    divider: { width: '1px', height: '16px', backgroundColor: '#3f3f46' },
    terminalContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '20px'
    },
    outputArea: {
        flex: 1,
        overflowY: 'auto',
        marginBottom: '10px',
        lineHeight: '1.6'
    },
    entry: { marginBottom: '8px', display: 'flex', flexDirection: 'column' },
    prompt: { color: 'var(--color-primary)', fontWeight: '600' },
    stdout: { color: '#e4e4e7' },
    stderr: { color: '#ef4444' },
    muted: { color: '#71717a', fontSize: '12px', fontStyle: 'italic' },
    inputArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#18181b',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #27272a',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
    },
    promptLabel: { color: 'var(--color-primary)', fontWeight: 'bold' },
    terminalInput: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        color: 'white',
        fontSize: '14px',
        fontFamily: 'var(--font-mono)'
    },
    tableScroll: {
        overflowX: 'auto',
        margin: '12px 0 12px 20px',
        border: '1px solid #27272a',
        borderRadius: '8px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px',
        backgroundColor: '#09090b',
    },
    th: {
        backgroundColor: '#18181b',
        color: 'var(--color-primary)',
        padding: '8px 12px',
        textAlign: 'left',
        borderBottom: '2px solid #27272a',
        fontWeight: '700'
    },
    td: {
        padding: '6px 12px',
        borderBottom: '1px solid #18181b',
        color: '#d4d4d8'
    }
};

export default SqlWorkbench;
