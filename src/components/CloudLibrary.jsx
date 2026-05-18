import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Tag, Trash2, Edit3, Play,
    ChevronDown, X, Grid, List, Clock, Type,
    Bookmark, MoreVertical, ExternalLink, Code2,
    AlertCircle, CheckCircle2, FileText, Filter, Archive
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, remove, set, push } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import pythonEngine from '../lib/pythonEngine';
import sqlEngine from '../lib/sqlEngine';

const PRESET_TAGS = ['Basics', 'Logic', 'Data', 'Loops', 'Functions', 'Algorithms', 'AI', 'CBSE'];

const CloudLibrary = ({ onEdit, onClose }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedTag, setSelectedTag] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Program' | 'Note'
    const [languageFilter, setLanguageFilter] = useState('All'); // 'All' | 'Python' | 'SQL'
    const [viewMode, setViewMode] = useState('grid');
    const [previewContent, setPreviewContent] = useState(null);
    const [isPreviewRunning, setIsPreviewRunning] = useState(false);
    const [previewOutput, setPreviewOutput] = useState([]);

    useEffect(() => {
        if (!user) return;

        const programsRef = ref(db, `users/${user.uid}/saved_programs`);
        const notesRef = ref(db, `users/${user.uid}/notes`);

        let programsData = [];
        let notesData = [];

        const updateItems = () => {
            const combined = [...programsData, ...notesData];
            setItems(combined);
        };

        const unsubPrograms = onValue(programsRef, (snapshot) => {
            const data = snapshot.val();
            programsData = data ? Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                libraryType: 'Program'
            })) : [];
            updateItems();
        });

        const unsubNotes = onValue(notesRef, (snapshot) => {
            const data = snapshot.val();
            notesData = data ? Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                libraryType: 'Note'
            })) : [];
            updateItems();
        });

        return () => {
            unsubPrograms();
            unsubNotes();
        };
    }, [user]);

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const filteredItems = items
        .filter(p => {
            const matchesSearch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = selectedTag === 'All' || p.tags?.includes(selectedTag);
            const matchesType = typeFilter === 'All' || p.libraryType === typeFilter;
            const matchesLanguage = languageFilter === 'All' ||
                (p.language === languageFilter) ||
                (p.tags?.includes(languageFilter));
            return matchesSearch && matchesTag && matchesType && matchesLanguage;
        })
        .sort((a, b) => {
            let valA, valB;
            if (sortBy === 'updatedAt') {
                valA = new Date(a.updatedAt || a.createdAt || 0);
                valB = new Date(b.updatedAt || b.createdAt || 0);
            } else if (sortBy === 'title') {
                valA = (a.title || '').toLowerCase();
                valB = (b.title || '').toLowerCase();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete this ${item.libraryType}?`)) {
            try {
                const path = item.libraryType === 'Program' ? 'saved_programs' : 'notes';
                await remove(ref(db, `users/${user.uid}/${path}/${item.id}`));
            } catch (err) {
                alert("Failed to delete item.");
            }
        }
    };

    const handlePreview = (item) => {
        setPreviewContent(item);
        if (item.libraryType === 'Program') {
            setPreviewOutput([{ text: 'Initializing preview engine...', type: 'muted' }]);
            const extension = item.language === 'SQL' ? 'sql' : 'py';
            const cmd = item.language === 'SQL' ? 'sqlite' : 'python';
            setPreviewOutput(prev => [...prev, { text: `$ ${cmd} ${item.title.replace(/\s+/g, '_').toLowerCase()}.${extension}`, type: 'prompt' }]);
        }
    };

    const runPreview = async () => {
        if (!previewContent || isPreviewRunning || previewContent.libraryType !== 'Program') return;
        setIsPreviewRunning(true);
        try {
            const result = previewContent.language === 'SQL'
                ? await sqlEngine.run(previewContent.code)
                : await pythonEngine.run(previewContent.code);

            const outputs = [];
            if (previewContent.language === 'SQL' && result.results) {
                outputs.push({ results: result.results, type: 'sql_table' });
            } else {
                if (result.stdout) outputs.push({ text: result.stdout, type: 'stdout' });
                if (result.stderr) outputs.push({ text: result.stderr, type: 'stderr' });
            }
            if (outputs.length === 0) outputs.push({ text: '(No execution output)', type: 'muted' });
            setPreviewOutput(prev => [...prev, ...outputs]);
        } catch (err) {
            setPreviewOutput(prev => [...prev, { text: err.message, type: 'stderr' }]);
        } finally {
            setIsPreviewRunning(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Recent';
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div style={styles.container} className="fadeIn">
            <style>{`
                .item-card {
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
                }
                .item-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px -10px rgba(0,0,0,0.5);
                    border-color: var(--color-primary) !important;
                }
            `}</style>

            {/* Header Area */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.titleIcon}>
                        <Bookmark size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                        <h1 style={styles.title}>Cloud Library</h1>
                        <p style={styles.subtitle}>{items.length} artifacts in your cloud storage</p>
                    </div>
                </div>

                <div style={styles.headerRight}>
                    <div style={styles.languageToggle}>
                        <button
                            style={{ ...styles.langBtn, ...(languageFilter === 'All' ? styles.langBtnActive : {}) }}
                            onClick={() => setLanguageFilter('All')}
                        >All</button>
                        <button
                            style={{ ...styles.langBtn, ...(languageFilter === 'Python' ? styles.langBtnActive : {}) }}
                            onClick={() => setLanguageFilter('Python')}
                        >Python</button>
                        <button
                            style={{ ...styles.langBtn, ...(languageFilter === 'SQL' ? styles.langBtnActive : {}) }}
                            onClick={() => setLanguageFilter('SQL')}
                        >SQL</button>
                    </div>
                    <div style={styles.searchBox}>
                        <Search size={16} />
                        <input
                            placeholder="Find a program or note..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div style={styles.controls}>
                <div style={styles.filtersGroup}>
                    <div style={styles.typeToggle}>
                        <button
                            style={{ ...styles.typeBtn, ...(typeFilter === 'All' ? styles.typeBtnActive : {}) }}
                            onClick={() => setTypeFilter('All')}
                        >All</button>
                        <button
                            style={{ ...styles.typeBtn, ...(typeFilter === 'Program' ? styles.typeBtnActive : {}) }}
                            onClick={() => setTypeFilter('Program')}
                        >Programs</button>
                        <button
                            style={{ ...styles.typeBtn, ...(typeFilter === 'Note' ? styles.typeBtnActive : {}) }}
                            onClick={() => setTypeFilter('Note')}
                        >Notes</button>
                    </div>

                    <div style={styles.dividerV}></div>

                    <div style={styles.tagsBar}>
                        <button
                            style={{ ...styles.tagBtn, ...(selectedTag === 'All' ? styles.tagBtnActive : {}) }}
                            onClick={() => setSelectedTag('All')}
                        >All Tags</button>
                        {PRESET_TAGS.map(t => (
                            <button
                                key={t}
                                style={{ ...styles.tagBtn, ...(selectedTag === t ? styles.tagBtnActive : {}) }}
                                onClick={() => setSelectedTag(t)}
                            >{t}</button>
                        ))}
                    </div>
                </div>

                <div style={styles.sortOptions}>
                    <div style={styles.sortItem} onClick={() => handleSortChange('updatedAt')}>
                        <Clock size={14} />
                        <span style={{ color: sortBy === 'updatedAt' ? 'var(--color-primary)' : 'inherit' }}>Date</span>
                        {sortBy === 'updatedAt' && (sortOrder === 'desc' ? <ChevronDown size={12} /> : <ChevronDown size={12} style={{ transform: 'rotate(180deg)' }} />)}
                    </div>
                    <div style={styles.sortItem} onClick={() => handleSortChange('title')}>
                        <Type size={14} />
                        <span style={{ color: sortBy === 'title' ? 'var(--color-primary)' : 'inherit' }}>Name</span>
                        {sortBy === 'title' && (sortOrder === 'desc' ? <ChevronDown size={12} /> : <ChevronDown size={12} style={{ transform: 'rotate(180deg)' }} />)}
                    </div>
                    <div style={styles.viewToggle}>
                        <button
                            style={{ ...styles.viewBtn, opacity: viewMode === 'grid' ? 1 : 0.4 }}
                            onClick={() => setViewMode('grid')}
                        ><Grid size={16} /></button>
                        <button
                            style={{ ...styles.viewBtn, opacity: viewMode === 'list' ? 1 : 0.4 }}
                            onClick={() => setViewMode('list')}
                        ><List size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={styles.contentScroll}>
                {filteredItems.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Archive size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <h3>No matches found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div style={viewMode === 'grid' ? styles.grid : styles.list}>
                        {filteredItems.map(item => (
                            <div key={item.id} className="item-card" style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.cardIcon}>
                                        {item.libraryType === 'Program' ? (
                                            <Code2 size={22} color="var(--color-primary)" />
                                        ) : (
                                            <FileText size={22} color="#fbbf24" />
                                        )}
                                    </div>
                                    <div style={styles.cardMeta}>
                                        <h3 style={styles.cardTitle}>{item.title}</h3>
                                        <div style={styles.cardSubHeader}>
                                            <span style={{ ...styles.typeBadge, color: item.libraryType === 'Program' ? 'var(--color-primary)' : '#fbbf24' }}>
                                                {item.libraryType}
                                            </span>
                                            <span style={styles.cardDate}>• {formatDate(item.updatedAt || item.createdAt)}</span>
                                        </div>
                                    </div>
                                    <button style={styles.cardMore} onClick={() => handlePreview(item)}>
                                        {item.libraryType === 'Program' ? <Play size={14} fill="currentColor" /> : <Search size={14} />}
                                    </button>
                                </div>

                                <div style={styles.cardBody}>
                                    <p style={styles.cardDesc}>{item.description || "No description provided."}</p>
                                    <div style={styles.cardTags}>
                                        {item.tags?.slice(0, 3).map(t => (
                                            <span key={t} style={styles.cardTag}>{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <div style={styles.cardFooter}>
                                    <button style={styles.cardActionBtn} onClick={() => onEdit(item.code)}>
                                        <Edit3 size={14} /> {item.libraryType === 'Program' ? 'Open Code' : 'Load Note'}
                                    </button>
                                    <button
                                        style={{ ...styles.cardActionBtn, color: '#ef4444', backgroundColor: 'transparent', border: 'none' }}
                                        onClick={() => handleDelete(item)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal Overlay */}
            {previewContent && (
                <div style={styles.overlay} onClick={() => setPreviewContent(null)}>
                    <div style={styles.previewModal} onClick={e => e.stopPropagation()}>
                        <div style={styles.previewHeader}>
                            <div style={styles.pHeaderLeft}>
                                {previewContent.libraryType === 'Program' ? (
                                    <Play size={18} fill="var(--color-primary)" color="var(--color-primary)" />
                                ) : (
                                    <FileText size={18} color="#fbbf24" />
                                )}
                                <h3>{previewContent.libraryType === 'Program' ? 'Quick Preview' : 'Note Content'}: {previewContent.title}</h3>
                            </div>
                            <button style={styles.closeBtn} onClick={() => setPreviewContent(null)}><X size={20} /></button>
                        </div>

                        <div style={styles.previewBody}>
                            <div style={styles.codeColumn}>
                                <div style={styles.colLabel}>{previewContent.libraryType === 'Program' ? 'SOURCE CODE' : 'NOTE TEXT'}</div>
                                <pre style={styles.previewCode}>{previewContent.code}</pre>
                            </div>

                            {previewContent.libraryType === 'Program' && (
                                <div style={styles.outputColumn}>
                                    <div style={styles.colLabel}>EXECUTION OUTPUT</div>
                                    <div style={styles.previewTerminal}>
                                        {previewOutput.map((o, i) => (
                                            <div key={i} style={{
                                                color: o.type === 'stderr' ? '#ef4444' : (o.type === 'prompt' ? '#3b82f6' : '#e4e4e7'),
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '12px',
                                                marginBottom: '4px'
                                            }}>
                                                {o.type === 'sql_table' ? (
                                                    <div style={styles.previewSqlTableScroll}>
                                                        {o.results.map((res, rIdx) => (
                                                            <table key={rIdx} style={styles.previewSqlTable}>
                                                                <thead>
                                                                    <tr>
                                                                        {res.columns.map(col => <th key={col} style={styles.previewSqlTh}>{col}</th>)}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {res.values.map((row, rowIdx) => (
                                                                        <tr key={rowIdx}>
                                                                            {row.map((cell, cIdx) => <td key={cIdx} style={styles.previewSqlTd}>{cell}</td>)}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    o.text
                                                )}
                                            </div>
                                        ))}
                                        {isPreviewRunning && <div className="blink" style={{ color: 'var(--color-primary)' }}>█</div>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={styles.previewFooter}>
                            {previewContent.libraryType === 'Program' && (
                                <button
                                    style={{ ...styles.runBtn, opacity: isPreviewRunning ? 0.6 : 1 }}
                                    onClick={runPreview}
                                    disabled={isPreviewRunning}
                                >
                                    {isPreviewRunning ? 'Executing...' : 'Run Program'}
                                </button>
                            )}
                            <button style={styles.editFullBtn} onClick={() => {
                                onEdit(previewContent.code);
                                setPreviewContent(null);
                            }}>
                                <ExternalLink size={14} /> {previewContent.libraryType === 'Program' ? 'Open in Editor' : 'Load into Workspace'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
    titleIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-color)'
    },
    title: { margin: 0, fontSize: '20px', fontWeight: '700' },
    subtitle: { margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' },
    headerRight: { display: 'flex', gap: '16px', alignItems: 'center' },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '8px 16px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        width: '280px',
        color: 'var(--text-muted)'
    },
    searchInput: {
        background: 'none',
        border: 'none',
        outline: 'none',
        color: 'var(--text-primary)',
        fontSize: '13px',
        width: '100%'
    },
    languageToggle: {
        display: 'flex',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '3px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginRight: '8px'
    },
    langBtn: {
        padding: '4px 12px',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
        borderRadius: '6px',
        transition: 'all 0.2s',
        textTransform: 'uppercase'
    },
    langBtnActive: {
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--color-primary)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    closeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' },
    controls: {
        padding: '12px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)',
    },
    filtersGroup: { display: 'flex', alignItems: 'center', gap: '16px', overflowX: 'auto' },
    typeToggle: {
        display: 'flex',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '3px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
    },
    typeBtn: {
        padding: '4px 12px',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        borderRadius: '6px',
        transition: 'all 0.2s'
    },
    typeBtnActive: {
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--color-primary)',
    },
    dividerV: { width: '1px', height: '20px', backgroundColor: 'var(--border-color)' },
    tagsBar: { display: 'flex', gap: '6px' },
    tagBtn: {
        padding: '4px 10px',
        borderRadius: '6px',
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        color: 'var(--text-muted)',
        fontSize: '12px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s'
    },
    tagBtnActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: 'var(--color-primary)',
        borderColor: 'rgba(59, 130, 246, 0.2)'
    },
    sortOptions: { display: 'flex', alignItems: 'center', gap: '20px' },
    sortItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        userSelect: 'none'
    },
    viewToggle: {
        display: 'flex',
        gap: '4px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '3px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
    },
    viewBtn: {
        padding: '4px 8px',
        background: 'none',
        border: 'none',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex'
    },
    contentScroll: { flex: 1, overflowY: 'auto', padding: '32px' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
    },
    card: {
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
    },
    cardHeader: {
        padding: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)'
    },
    cardIcon: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardMeta: { flex: 1, minWidth: 0 },
    cardTitle: {
        margin: 0,
        fontSize: '15px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: 'var(--text-primary)'
    },
    cardSubHeader: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' },
    typeBadge: { fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' },
    cardDate: { fontSize: '11px', color: 'var(--text-muted)' },
    cardMore: {
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        padding: '6px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex'
    },
    cardBody: { padding: '16px', flex: 1 },
    cardDesc: {
        margin: '0 0 12px 0',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    cardTags: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    cardTag: {
        fontSize: '10px',
        padding: '2px 8px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '6px',
        color: 'var(--text-muted)',
        border: '1px solid var(--border-color)'
    },
    cardFooter: {
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.01)',
        borderTop: '1px solid var(--border-color)'
    },
    cardActionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
    },
    previewModal: {
        width: '100%',
        maxWidth: '1000px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,1)'
    },
    pHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    previewBody: { flex: 1, display: 'flex', minHeight: '450px', borderTop: '1px solid var(--border-color)' },
    codeColumn: { flex: 1.2, padding: '24px', borderRight: '1px solid var(--border-color)', overflowY: 'auto' },
    outputColumn: { flex: 1, padding: '24px', backgroundColor: '#09090b', display: 'flex', flexDirection: 'column' },
    colLabel: { fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' },
    previewCode: {
        margin: 0,
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        color: '#d4d4d4',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap'
    },
    previewTerminal: { flex: 1, overflowY: 'auto' },
    previewFooter: {
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255,255,255,0.02)'
    },
    runBtn: {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px var(--color-primary-glow)'
    },
    editFullBtn: {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
        color: 'var(--text-muted)'
    },
    previewSqlTableScroll: {
        overflowX: 'auto',
        margin: '8px 0',
        border: '1px solid #333',
        borderRadius: '4px'
    },
    previewSqlTable: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '11px',
        backgroundColor: '#111'
    },
    previewSqlTh: {
        backgroundColor: '#222',
        color: 'var(--color-primary)',
        padding: '6px 10px',
        textAlign: 'left',
        borderBottom: '1px solid #333'
    },
    previewSqlTd: {
        padding: '4px 10px',
        borderBottom: '1px solid #222',
        color: '#ccc'
    }
};

export default CloudLibrary;
