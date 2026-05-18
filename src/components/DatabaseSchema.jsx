import React, { useState, useEffect } from 'react';
import { Database, Table, Columns, Info, ChevronRight, ChevronDown, RotateCcw, Box, Key, Link as LinkIcon } from 'lucide-react';
import sqlEngine from '../lib/sqlEngine';

const DatabaseSchema = () => {
    const [schema, setSchema] = useState([]);
    const [expandedTables, setExpandedTables] = useState({});

    const updateSchema = async () => {
        const data = await sqlEngine.getSchema();
        setSchema(data);
    };

    useEffect(() => {
        const interval = setInterval(updateSchema, 2000);
        updateSchema();
        return () => clearInterval(interval);
    }, []);

    const toggleTable = (tableName) => {
        setExpandedTables(prev => ({
            ...prev,
            [tableName]: !prev[tableName]
        }));
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset the database? All tables will be deleted.")) {
            sqlEngine.reset();
            updateSchema();
        }
    };

    const handleLoadSamples = async () => {
        await sqlEngine.loadSampleDataset();
        updateSchema();
        alert("CBSE Sample Dataset (Employee, Department) loaded!");
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Database size={16} color="var(--color-primary)" />
                <span style={styles.title}>Database Schema</span>
            </div>

            <button style={styles.toolBtn} onClick={handleReset} title="Reset Database">
                <RotateCcw size={12} /> Reset DB
            </button>
            <button style={styles.toolBtn} onClick={handleLoadSamples} title="Load CBSE Lab Data">
                <Box size={12} /> Load CBSE Lab
            </button>

            <div style={styles.scrollArea}>
                {schema.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Info size={24} style={{ opacity: 0.2, marginBottom: '8px' }} />
                        <p>No tables detected.</p>
                        <p style={{ fontSize: '11px' }}>Execute CREATE TABLE or Load Samples.</p>
                    </div>
                ) : (
                    schema.map(table => (
                        <div key={table.name} style={styles.tableCard}>
                            <div
                                style={styles.tableHeader}
                                onClick={() => toggleTable(table.name)}
                            >
                                {expandedTables[table.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                <Table size={14} color="var(--color-primary)" />
                                <span style={styles.tableName}>{table.name}</span>
                                <span style={styles.colCount}>{table.columns.length} cols</span>
                            </div>

                            {expandedTables[table.name] && (
                                <div style={styles.tableBody}>
                                    <div style={styles.columnList}>
                                        {table.columns.map(col => (
                                            <div key={col.name} style={styles.columnItem}>
                                                <div style={styles.colNameRow}>
                                                    <Columns size={12} color="var(--text-muted)" />
                                                    <span style={{ fontWeight: col.pk ? 'bold' : 'normal' }}>{col.name}</span>
                                                    {col.pk && <Key size={10} color="#fbbf24" style={{ marginLeft: '4px' }} />}
                                                </div>
                                                <span style={styles.colType}>{col.type}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {table.foreignKeys.length > 0 && (
                                        <div style={styles.fkSection}>
                                            <div style={styles.fkHeader}>
                                                <LinkIcon size={12} /> Relationships
                                            </div>
                                            {table.foreignKeys.map((fk, idx) => (
                                                <div key={idx} style={styles.fkItem}>
                                                    {fk.from} → {fk.table}({fk.to})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
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
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)',
    },
    title: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    scrollArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
        textAlign: 'center',
        fontSize: '13px',
    },
    tableCard: {
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        padding: '12px',
        marginBottom: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    toolbar: {
        display: 'flex',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
    },
    toolBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '6px',
        fontSize: '11px',
        fontWeight: '600',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    tableName: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
        flex: 1
    },
    colCount: {
        fontSize: '10px',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '2px 6px',
        borderRadius: '10px'
    },
    tableBody: {
        padding: '12px',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderTop: '1px solid var(--border-color)',
    },
    colNameRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1
    },
    colType: {
        fontSize: '10px',
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-mono)',
        opacity: 0.8
    },
    fkSection: {
        marginTop: '12px',
        paddingTop: '8px',
        borderTop: '1px dashed var(--border-color)',
    },
    fkHeader: {
        fontSize: '11px',
        fontWeight: '700',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '6px',
        textTransform: 'uppercase'
    },
    fkItem: {
        fontSize: '11px',
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-mono)',
        paddingLeft: '18px'
    },
    columnList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    columnItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--text-secondary)',
    },
};

export default DatabaseSchema;
