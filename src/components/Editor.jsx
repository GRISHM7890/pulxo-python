import React, { useCallback, useImperativeHandle, forwardRef, useRef, useState, useEffect } from 'react';
import { Expand, Shrink } from 'lucide-react';
import sqlEngine from '../lib/sqlEngine';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { autocompletion } from '@codemirror/autocomplete';
import { linter, lintGutter } from '@codemirror/lint';
import { keymap } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';
import { syntaxTree } from '@codemirror/language';

// Custom Python Autocompletion Logic
const pythonKeywords = [
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
    'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
    'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
    'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
    'print', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple'
];

const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
    'TABLE', 'INTO', 'VALUES', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN',
    'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT', 'RIGHT', 'INNER',
    'ON', 'AS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT'
];

function myCompletions(context, language = 'Python', schema = []) {
    let word = context.matchBefore(/\w*/);
    if (word.from === word.to && !context.explicit) return null;

    let keywords = (language || 'Python').toLowerCase() === 'sql' ? [...sqlKeywords] : [...pythonKeywords];

    // Add schema names if SQL
    if (language === 'SQL') {
        schema.forEach(table => {
            keywords.push(table.name);
            table.columns.forEach(col => {
                if (!keywords.includes(col)) keywords.push(col);
            });
        });
    }

    return {
        from: word.from,
        options: keywords.map(kw => ({ label: kw, type: "keyword" }))
    };
}

// Custom simple syntax error and logic linter
const getProblemsLinter = (problems, language) => linter((view) => {
    let diagnostics = [];
    
    // Parse structural CodeMirror syntax errors
    if (language === 'Python') {
        syntaxTree(view.state).cursor().iterate(node => {
            if (node.type.isError) {
                diagnostics.push({
                    from: node.from,
                    to: node.to,
                    severity: "error",
                    message: "Syntax Error: Malformed code block structure.",
                });
            }
        });
    }

    // Blend our custom real-time analyzed problems
    problems.forEach(prob => {
        try {
            const lineNum = Math.max(1, Math.min(prob.line, view.state.doc.lines));
            const line = view.state.doc.line(lineNum);
            
            // Check for existing diagnostic overlap on the exact line start
            const overlap = diagnostics.some(d => d.from === line.from);
            if (!overlap) {
                diagnostics.push({
                    from: line.from,
                    to: line.to,
                    severity: prob.type === 'error' ? 'error' : 'warning',
                    message: prob.message,
                });
            }
        } catch (e) {
            // Keep going if line query boundary bounds out
        }
    });

    return diagnostics;
});

const Editor = forwardRef(({ isDarkMode, code, setCode, onRun, language = 'Python', problems = [] }, ref) => {
    const editorViewRef = useRef(null);
    const [schema, setSchema] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (language === 'SQL') {
            const fetchSchema = async () => {
                const data = await sqlEngine.getSchema();
                setSchema(data);
            };
            fetchSchema();
            const interval = setInterval(fetchSchema, 3000);
            return () => clearInterval(interval);
        }
    }, [language]);

    useImperativeHandle(ref, () => ({
        get view() {
            return editorViewRef.current?.view;
        }
    }));

    const saveAction = useCallback(() => {
        alert("Source code saved successfully!");
        return true;
    }, []);

    const runAction = useCallback(() => {
        if (onRun) onRun();
        return true;
    }, [onRun]);

    const insertSymbol = useCallback((symbol) => {
        if (editorViewRef.current && editorViewRef.current.view) {
            const view = editorViewRef.current.view;
            const pos = view.state.selection.main.head;
            view.dispatch({
                changes: { from: pos, insert: symbol },
                selection: { anchor: pos + symbol.length }
            });
            view.focus();
        }
    }, []);

    const customKeybinds = keymap.of([
        { key: "Mod-s", run: saveAction, preventDefault: true },
        { key: "Mod-Enter", run: runAction, preventDefault: true },
    ]);

    // Create the dynamic problem linter instance
    const problemsLinter = getProblemsLinter(problems, language);

    return (
        <div style={styles.container} className={isFullscreen ? 'editor-fullscreen' : ''}>
            <div style={styles.header}>
                <div style={styles.tabs}>
                    <div style={styles.tabActive}>
                        {language === 'SQL' ? 'query.sql' : 'main.py'}
                        <span style={styles.closeBtn}>×</span>
                    </div>
                    {language !== 'SQL' && (
                        <div style={styles.tabInactive}>
                            utils.py
                        </div>
                    )}
                </div>
                <button 
                    className="btn-icon btn" 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    style={{ margin: '0 8px 4px auto', padding: '4px' }}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <Shrink size={18} /> : <Expand size={18} />}
                </button>
            </div>

            <div style={styles.editorWrapper}>
                <CodeMirror
                    ref={editorViewRef}
                    value={code}
                    height="100%"
                    theme={isDarkMode ? vscodeDark : 'light'}
                    extensions={[
                        language === 'SQL' ? sql() : python(),
                        autocompletion({ override: [(ctx) => myCompletions(ctx, language, schema)] }),
                        lintGutter(),
                        ...(language === 'SQL' ? [] : [problemsLinter]),
                        customKeybinds,
                        indentUnit.of("    ")
                    ]}
                    onChange={(value) => setCode(value)}
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        foldGutter: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        defaultKeymap: true,
                        searchKeymap: true,
                        historyKeymap: true,
                        foldKeymap: true,
                        completionKeymap: true,
                        lintKeymap: true,
                        tabSize: 4
                    }}
                    className="pulxo-editor"
                />
            </div>

            {isMobile && (
                <div className="mobile-toolbar">
                    {['(', ')', '[', ']', '{', '}', ':', '=', '+', '-', '*', '#', '<', '>'].map(sym => (
                        <button 
                            key={sym} 
                            className="toolbar-btn"
                            onPointerDown={(e) => {
                                e.preventDefault(); // Prevents editor from losing focus
                                insertSymbol(sym);
                            }}
                        >
                            {sym}
                        </button>
                    ))}
                </div>
            )}

            <style>{`
                .pulxo-editor {
                    height: 100%;
                    font-family: var(--font-mono);
                    font-size: 14px;
                }
                .cm-theme-light.cm-editor {
                    background-color: transparent !important;
                }
                .cm-editor {
                    height: 100% !important;
                    outline: none !important;
                }
                .cm-scroller {
                    font-family: var(--font-mono);
                }
                .cm-diagnostic-error {
                    border-left: 3px solid var(--color-error) !important;
                    background-color: rgba(239, 68, 68, 0.1) !important;
                }
                .cm-lintRange-error {
                    background-image: none !important;
                    border-bottom: 2px wavy var(--color-error) !important;
                }
                .cm-diagnostic-warning {
                    border-left: 3px solid #f59e0b !important;
                    background-color: rgba(245, 158, 11, 0.08) !important;
                }
                .cm-lintRange-warning {
                    background-image: none !important;
                    border-bottom: 2px wavy #f59e0b !important;
                }
                .cm-lint-marker-warning {
                    color: #f59e0b !important;
                }
                .cm-lineNumbers .cm-gutterElement {
                    padding: 0 8px 0 12px !important;
                    color: var(--text-muted) !important;
                    min-width: 35px !important;
                }
                .cm-activeLineGutter {
                    background-color: var(--bg-hover) !important;
                    color: var(--color-primary) !important;
                }
            `}</style>
        </div>
    );
});

const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
    },
    header: {
        height: '40px',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'flex-end',
        borderBottom: '1px solid var(--border-color)',
        paddingLeft: '16px',
        flexShrink: 0,
    },
    tabs: {
        display: 'flex',
        height: '32px',
        gap: '4px',
    },
    tabActive: {
        backgroundColor: 'var(--bg-secondary)',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        borderTop: '2px solid var(--color-primary)',
        borderRight: '1px solid var(--border-color)',
        borderLeft: '1px solid var(--border-color)',
        borderBottom: '1px solid transparent',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
        position: 'relative',
        top: '1px',
        zIndex: 2,
        cursor: 'default',
    },
    tabInactive: {
        backgroundColor: 'transparent',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        border: '1px solid transparent',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    closeBtn: {
        fontSize: '16px',
        lineHeight: 1,
        color: 'var(--text-muted)',
        cursor: 'pointer',
    },
    editorWrapper: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
    }
};

export default Editor;
