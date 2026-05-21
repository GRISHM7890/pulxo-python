import { useState, useEffect } from 'react';
import { Tag, FileCode2, FilePlus, Terminal, GraduationCap, Archive, MoreHorizontal, BarChart2, Database, Trophy, Brain, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, limitToLast, query } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import DatabaseSchema from './DatabaseSchema';

const Sidebar = ({ onNotesToggle, onPracticeToggle, activeTab, onSavedProgramsToggle, onFileSelect, onDashboardToggle, onGamifyToggle, onAITutorToggle, language = 'Python' }) => {
    const { user } = useAuth();
    const [recentPrograms, setRecentPrograms] = useState([]);

    useEffect(() => {
        if (!user) return;
        const programsRef = ref(db, `users/${user.uid}/saved_programs`);
        const recentQuery = query(programsRef, limitToLast(5));

        return onValue(recentQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const programsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).reverse();
                setRecentPrograms(programsArray);
            } else {
                setRecentPrograms([]);
            }
        });
    }, [user]);

    return (
        <div style={styles.sidebar}>
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <span className="heading-sm">Explorer</span>
                    <button className="btn-icon btn" style={{ padding: '4px' }}>
                        <FilePlus size={16} />
                    </button>
                </div>

                <div style={styles.fileList}>
                    <div
                        style={Object.assign({}, styles.fileItem, activeTab === 'Editor' ? styles.activeFileItem : {})}
                        onClick={() => onFileSelect && onFileSelect(language === 'SQL' ? 'query.sql' : 'main.py')}
                    >
                        {language === 'SQL' ? (
                            <Database size={16} color="var(--color-primary)" />
                        ) : (
                            <FileCode2 size={16} color="#3b82f6" />
                        )}
                        <span>{language === 'SQL' ? 'query.sql' : 'main.py'}</span>
                    </div>
                    {language !== 'SQL' && (
                        <div
                            style={Object.assign({}, styles.fileItem, activeTab === 'Practice' ? styles.activeFileItem : {})}
                            onClick={onPracticeToggle}
                        >
                            <GraduationCap size={16} color="var(--text-secondary)" />
                            <span>Practice</span>
                        </div>
                    )}
                    {language === 'SQL' ? (
                        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <DatabaseSchema />
                        </div>
                    ) : (
                        <>
                            <div
                                style={Object.assign({}, styles.fileItem, activeTab === 'Dashboard' ? styles.activeFileItem : {})}
                                onClick={() => onDashboardToggle && onDashboardToggle()}
                            >
                                <BarChart2 size={16} color="var(--text-secondary)" />
                                <span>Progress</span>
                            </div>
                            <div
                                style={Object.assign({}, styles.fileItem, activeTab === 'Gamified Learning' ? styles.activeFileItem : {})}
                                onClick={() => onGamifyToggle && onGamifyToggle()}
                            >
                                <Trophy size={16} color="var(--color-primary)" />
                                <span>Gamified Learning</span>
                            </div>
                            <div
                                style={Object.assign({}, styles.fileItem, activeTab === 'AITutor' ? styles.activeFileItem : {})}
                                onClick={() => onAITutorToggle && onAITutorToggle()}
                            >
                                <Brain size={16} color="var(--color-primary)" />
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    AI Mentor
                                    <Sparkles size={11} color="var(--color-primary)" />
                                </span>
                            </div>
                            <div
                                style={Object.assign({}, styles.fileItem, activeTab === 'Library' ? styles.activeFileItem : {})}
                                onClick={() => onSavedProgramsToggle()}
                            >
                                <Archive size={16} color="var(--text-secondary)" />
                                <span>Cloud Library</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <span className="heading-sm">Recent Activity</span>
                </div>
                <div style={styles.savedList}>
                    {recentPrograms.length === 0 ? (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                            No programs saved yet.
                        </div>
                    ) : (
                        recentPrograms.map(p => (
                            <div key={p.id} style={styles.savedItem} onClick={() => onSavedProgramsToggle()}>
                                <Terminal size={12} color="var(--text-muted)" />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {p.title}
                                </span>
                            </div>
                        ))
                    )}
                    {recentPrograms.length > 0 && (
                        <button style={styles.showAllBtn} onClick={onSavedProgramsToggle}>
                            <MoreHorizontal size={14} /> View All Dashboard
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    sidebar: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0 16px',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
    },
    divider: {
        height: '1px',
        backgroundColor: 'var(--border-color)',
        margin: '16px 0',
    },
    fileList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    fileItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        transition: 'all 0.1s ease',
    },
    activeFileItem: {
        backgroundColor: 'var(--bg-hover)',
        color: 'var(--color-primary)',
        fontWeight: '500',
    },
    savedList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    savedItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        fontSize: '13px',
        color: 'var(--text-primary)',
        transition: 'all 0.2s ease',
    },
    showAllBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '6px',
        marginTop: '4px',
        backgroundColor: 'transparent',
        border: '1px dashed var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-muted)',
        fontSize: '11px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }
};

export default Sidebar;
