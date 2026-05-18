import React, { useState, useEffect } from 'react';
import { X, Save, Tag, FileText, Layout, CheckCircle2, AlertCircle } from 'lucide-react';
import { detectTags } from '../lib/tagUtils';

const PRESET_TAGS = ['Basics', 'Logic', 'Data', 'Loops', 'Functions', 'Algorithms', 'AI', 'CBSE'];

const SaveModal = ({ isOpen, onClose, onSave, initialCode, language }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const detected = detectTags(initialCode, language);
            setSelectedTags(detected);

            // Try to find a good initial title
            const suggestedTitle = language === 'Python'
                ? (initialCode.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/)?.[1] || '')
                : (initialCode.match(/CREATE\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)?.[1] || '');

            setTitle(suggestedTitle ? `Logic: ${suggestedTitle}` : `My ${language} ${language === 'SQL' ? 'Query' : 'Script'}`);
            setDescription(`Created on ${new Date().toLocaleDateString()}`);
        }
    }, [isOpen, initialCode, language]);

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSave = async () => {
        if (!title.trim()) return;
        setIsSaving(true);
        try {
            await onSave({
                title,
                description,
                tags: selectedTags,
                code: initialCode,
                language
            });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay} className="fadeIn">
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <div style={styles.headerTitle}>
                        <div style={styles.iconBox}>
                            <Save size={20} color="var(--color-primary)" />
                        </div>
                        <div>
                            <h2 style={styles.titleText}>Smart Save</h2>
                            <p style={styles.subtitleText}>Organize your code with auto-tags</p>
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={styles.body}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Title</label>
                        <div style={styles.inputWrapper}>
                            <Layout size={16} style={styles.inputIcon} />
                            <input
                                style={styles.input}
                                autoFocus
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter a descriptive title..."
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <div style={styles.inputWrapper}>
                            <FileText size={16} style={styles.inputIcon} />
                            <textarea
                                style={{ ...styles.input, minHeight: '80px', paddingTop: '10px' }}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="What does this code do?"
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Select Tags (Auto-detected highlighted)</label>
                        <div style={styles.tagGrid}>
                            {PRESET_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    style={{
                                        ...styles.tagBtn,
                                        ...(selectedTags.includes(tag) ? styles.tagBtnActive : {})
                                    }}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {selectedTags.includes(tag) && <CheckCircle2 size={12} />}
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={styles.codePreview}>
                        <div style={styles.codeLabel}>CODE PREVIEW ({language})</div>
                        <pre style={styles.codeText}>{initialCode.substring(0, 150)}...</pre>
                    </div>
                </div>

                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        style={{ ...styles.saveBtn, opacity: isSaving ? 0.7 : 1 }}
                        onClick={handleSave}
                        disabled={isSaving || !title.trim()}
                    >
                        {isSaving ? 'Saving...' : 'Save to Cloud'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    modal: {
        backgroundColor: 'var(--bg-secondary)',
        width: '100%',
        maxWidth: '500px',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
    },
    header: {
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255,255,255,0.02)'
    },
    headerTitle: { display: 'flex', alignItems: 'center', gap: '16px' },
    iconBox: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-color)'
    },
    titleText: { margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' },
    subtitleText: { margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' },
    closeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' },
    body: { padding: '24px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '16px', color: 'var(--text-muted)' },
    input: {
        width: '100%',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '12px 16px 12px 44px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s ease'
    },
    tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' },
    tagBtn: {
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-muted)',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
    },
    tagBtnActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'var(--color-primary)',
        color: 'var(--color-primary)',
        fontWeight: '600'
    },
    codePreview: {
        marginTop: '24px',
        backgroundColor: '#09090b',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid var(--border-color)'
    },
    codeLabel: { fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' },
    codeText: {
        margin: 0,
        fontSize: '11px',
        color: '#a1a1aa',
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'pre-wrap',
        maxHeight: '100px',
        overflow: 'hidden'
    },
    footer: {
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255,255,255,0.02)'
    },
    cancelBtn: {
        padding: '10px 20px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'transparent',
        color: 'var(--text-muted)',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    saveBtn: {
        padding: '10px 24px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px var(--color-primary-glow)'
    }
};

export default SaveModal;
