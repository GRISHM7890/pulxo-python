import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, Play, Sparkles, AlertCircle, Zap, Target, Award, Brain, Code, Cpu, Database, FileText, Network } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { PROBLEMS } from '../data/problems';
import { playUnlockChime } from '../lib/audioSynth';

const MAP_NODES = [
    {
        id: 'python_basics',
        title: 'Python Basics',
        topic: 'B1: Basics',
        challenges: ['v1', 'v2', 'v3'],
        prereqs: [],
        x: 120,
        y: 240,
        xp: 100,
        icon: Code,
        description: 'Master syntax calibrations, variable assignments, mathematical arithmetic, and input/output channels.'
    },
    {
        id: 'variables',
        title: 'Conditionals',
        topic: 'B2: Conditionals',
        challenges: ['c1', 'c2', 'c3', 'c4'],
        prereqs: ['python_basics'],
        x: 280,
        y: 240,
        xp: 150,
        icon: Network,
        description: 'Understand conditional statements, boolean comparison equations, and branching control algorithms.'
    },
    {
        id: 'loops',
        title: 'Loops & Flows',
        topic: 'B3: Loops',
        challenges: ['l1', 'l2', 'l3', 'l4'],
        prereqs: ['variables'],
        x: 440,
        y: 130,
        xp: 200,
        icon: Target,
        description: 'Harness loop routines including while cycles, nested iterations, calculations, and sequence builders.'
    },
    {
        id: 'functions',
        title: 'Functions',
        topic: 'B6: Functions',
        challenges: ['f1', 'f2'],
        prereqs: ['loops'],
        x: 600,
        y: 130,
        xp: 250,
        icon: Cpu,
        description: 'Declare custom execution logic blocks with dynamic parameters, default values, and scoping limits.'
    },
    {
        id: 'oop',
        title: 'OOP Calibration',
        topic: 'B8: OOP',
        challenges: ['oop1', 'oop2'],
        prereqs: ['functions'],
        x: 760,
        y: 80,
        xp: 400,
        icon: Brain,
        description: 'Deep dive into Object-Oriented concepts, constructor states, damage actions, and subclass inheritance overrides.'
    },
    {
        id: 'data_structures',
        title: 'Data Structures',
        topic: 'B4: Strings',
        challenges: ['s1', 's2', 's3', 'li1', 'li2'],
        prereqs: ['functions'],
        x: 760,
        y: 350,
        xp: 350,
        icon: Database,
        description: 'Organize linear structures of system state using strings slicing, linear searches, and element uniqueness filters.'
    },
    {
        id: 'apis',
        title: 'APIs & JSON',
        topic: 'B9: APIs & JSON',
        challenges: ['api1', 'api2'],
        prereqs: ['data_structures'],
        x: 920,
        y: 190,
        xp: 450,
        icon: Zap,
        description: 'Access simulated REST service transactions, manipulate nested dictionaries, and parse API JSON payloads.'
    },
    {
        id: 'automation',
        title: 'Automation',
        topic: 'B7: File Handling',
        challenges: ['fh1'],
        prereqs: ['data_structures'],
        x: 920,
        y: 400,
        xp: 400,
        icon: FileText,
        description: 'Construct file processing units to read system logs, isolate records, and automate text streams execution.'
    },
    {
        id: 'ai_ml',
        title: 'AI & Machine Learning',
        topic: 'B10: AI & ML Basics',
        challenges: ['ai1', 'ai2'],
        prereqs: ['oop', 'apis', 'automation'],
        x: 1100,
        y: 240,
        xp: 600,
        icon: Sparkles,
        description: 'Evaluate perceptron weights math, calculate mean squared error variances, and calibrate intelligence logic vectors.'
    }
];

const LearningMap = ({ onLaunchChallenge }) => {
    const { user } = useAuth();
    const [solvedIds, setSolvedIds] = useState([]);
    const [selectedNode, setSelectedNode] = useState(MAP_NODES[0]);

    // Load solved progress from Firebase
    useEffect(() => {
        if (!user) return;
        const solvedRef = ref(db, `users/${user.uid}/progress/solved`);
        const unsubscribe = onValue(solvedRef, (snapshot) => {
            const data = snapshot.val() || [];
            setSolvedIds(data);
        });
        return () => unsubscribe();
    }, [user]);

    // Evaluate node states dynamically
    const getNodeState = (node) => {
        const completedCount = node.challenges.filter(id => solvedIds.includes(id)).length;
        const isCompleted = completedCount === node.challenges.length;

        // Check if all prerequisites are completed
        const isUnlocked = node.prereqs.every(prereqId => {
            const prereqNode = MAP_NODES.find(n => n.id === prereqId);
            if (!prereqNode) return false;
            return prereqNode.challenges.every(id => solvedIds.includes(id));
        });

        return {
            completedCount,
            totalCount: node.challenges.length,
            isCompleted,
            isUnlocked: node.prereqs.length === 0 ? true : isUnlocked,
            percent: Math.round((completedCount / node.challenges.length) * 100)
        };
    };

    // Trigger synthesizers audio
    const triggerAudio = (rarity = 'common') => {
        try {
            playUnlockChime(rarity);
        } catch (e) {
            console.warn(e);
        }
    };

    // Render path connection vector lines
    const renderConnections = () => {
        const connections = [];

        MAP_NODES.forEach(node => {
            const nodeState = getNodeState(node);
            
            node.prereqs.forEach(prereqId => {
                const parent = MAP_NODES.find(n => n.id === prereqId);
                if (!parent) return;

                const parentState = getNodeState(parent);
                
                let strokeColor = 'rgba(63, 63, 70, 0.25)';
                let glowFilter = 'none';
                let strokeDash = '6,6';
                let flowColor = null;

                if (parentState.isCompleted && nodeState.isCompleted) {
                    strokeColor = 'rgba(16, 185, 129, 0.2)';
                    flowColor = 'var(--color-success)';
                    glowFilter = 'drop-shadow(0 0 6px var(--color-success))';
                    strokeDash = 'none';
                } else if (parentState.isCompleted && nodeState.isUnlocked) {
                    strokeColor = 'rgba(59, 130, 246, 0.2)';
                    flowColor = 'var(--color-primary)';
                    glowFilter = 'drop-shadow(0 0 6px var(--color-primary))';
                    strokeDash = 'none';
                }

                // Smooth cubic bezier curves for RPG-like paths
                const dx = node.x - parent.x;
                const controlX1 = parent.x + dx * 0.55;
                const controlX2 = parent.x + dx * 0.45;
                const pathData = `M ${parent.x} ${parent.y} C ${controlX1} ${parent.y}, ${controlX2} ${node.y}, ${node.x} ${node.y}`;

                connections.push(
                    <g key={`${parent.id}-${node.id}`}>
                        {/* Base Conduit Tube */}
                        <path
                            d={pathData}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={5}
                            strokeDasharray={strokeDash}
                            style={{ transition: 'all 0.5s ease' }}
                        />
                        {/* Glowing energy flow stream on top */}
                        {flowColor && (
                            <path
                                d={pathData}
                                fill="none"
                                stroke={flowColor}
                                strokeWidth={2}
                                className="path-flowing"
                                style={{ filter: glowFilter, transition: 'all 0.5s ease', opacity: 0.85 }}
                            />
                        )}
                    </g>
                );
            });
        });

        return connections;
    };

    return (
        <div style={styles.container}>
            {/* Header info */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>
                        <Award size={20} color="var(--color-primary)" style={{ filter: 'drop-shadow(0 0 5px var(--color-primary))' }} />
                        CYBERNETIC COCKPIT NAVIGATION
                    </h2>
                    <p style={styles.subtitle}>
                        Deploy logic compiling modules to solve algorithms and chart advanced artificial intelligence paths.
                    </p>
                </div>
                <div style={styles.progressSummary}>
                    <div style={styles.summaryItem}>
                        <span style={styles.summaryVal}>
                            {MAP_NODES.filter(n => getNodeState(n).isCompleted).length} / {MAP_NODES.length}
                        </span>
                        <span style={styles.summaryLabel}>Nodes Integrated</span>
                    </div>
                </div>
            </div>

            <div style={styles.mainCanvas}>
                {/* Horizontal Scrolling RPG Path Matrix */}
                <div style={styles.viewportWrapper}>
                    {/* Shadow overlay block */}
                    <div style={styles.depthOverlayLeft} />
                    <div style={styles.depthOverlayRight} />
                    
                    <div style={styles.canvasContainer}>
                        <svg style={styles.svgOverlay} width="1240" height="480">
                            <defs>
                                <pattern id="blueprint-dots" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <circle cx="2" cy="2" r="1.2" fill="rgba(59, 130, 246, 0.12)" />
                                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(59, 130, 246, 0.03)" strokeWidth="1" />
                                </pattern>
                            </defs>
                            {/* Blueprint grid background */}
                            <rect width="100%" height="100%" fill="url(#blueprint-dots)" />
                            {renderConnections()}
                        </svg>

                        {/* Nodes layer */}
                        {MAP_NODES.map(node => {
                            const state = getNodeState(node);
                            const NodeIcon = node.icon;
                            const isSelected = selectedNode?.id === node.id;

                            return (
                                <div
                                    key={node.id}
                                    style={{
                                        ...styles.nodeContainer,
                                        left: `${node.x - 32}px`,
                                        top: `${node.y - 32}px`,
                                        opacity: state.isUnlocked ? 1 : 0.45,
                                    }}
                                    onClick={() => {
                                        setSelectedNode(node);
                                        triggerAudio(state.isCompleted ? 'epic' : 'common');
                                    }}
                                >
                                    {/* Double rotating ring border */}
                                    {state.isUnlocked && (
                                        <div style={{
                                            ...styles.outerRotatingRing,
                                            borderColor: state.isCompleted ? 'var(--color-success)' : 'var(--color-primary)',
                                            animation: state.isCompleted ? 'spinClockwise 9s linear infinite' : 'spinCounterClockwise 12s linear infinite',
                                            opacity: isSelected ? 1 : 0.65
                                        }} />
                                    )}

                                    {/* Glassmorphic Core Pod */}
                                    <div
                                        style={{
                                            ...styles.corePod,
                                            borderColor: state.isCompleted 
                                                ? 'var(--color-success)' 
                                                : state.isUnlocked 
                                                    ? 'var(--color-primary)' 
                                                    : 'rgba(63, 63, 70, 0.6)',
                                            backgroundColor: state.isCompleted 
                                                ? 'rgba(16, 185, 129, 0.08)' 
                                                : state.isUnlocked 
                                                    ? 'rgba(59, 130, 246, 0.08)' 
                                                    : 'rgba(9, 9, 11, 0.75)',
                                            boxShadow: isSelected
                                                ? state.isCompleted
                                                    ? '0 0 25px rgba(16, 185, 129, 0.5)'
                                                    : '0 0 25px rgba(59, 130, 246, 0.5)'
                                                : 'none',
                                            transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                                        }}
                                        className={`journey-node-item ${state.isUnlocked && !state.isCompleted ? 'node-breathing' : ''}`}
                                    >
                                        {state.isUnlocked ? (
                                            <NodeIcon size={20} color={state.isCompleted ? 'var(--color-success)' : 'var(--color-primary)'} style={{ filter: 'drop-shadow(0 0 3px currentColor)' }} />
                                        ) : (
                                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Lock size={16} color="var(--text-muted)" />
                                                <div className="laser-security-scanner" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Target Bracket corner indicator when selected */}
                                    {isSelected && (
                                        <div className="telemetry-brackets">
                                            <div className="bracket tl" style={{ borderColor: state.isCompleted ? 'var(--color-success)' : 'var(--color-primary)' }} />
                                            <div className="bracket tr" style={{ borderColor: state.isCompleted ? 'var(--color-success)' : 'var(--color-primary)' }} />
                                            <div className="bracket bl" style={{ borderColor: state.isCompleted ? 'var(--color-success)' : 'var(--color-primary)' }} />
                                            <div className="bracket br" style={{ borderColor: state.isCompleted ? 'var(--color-success)' : 'var(--color-primary)' }} />
                                        </div>
                                    )}

                                    {/* Label text */}
                                    <span style={{
                                        ...styles.nodeLabel,
                                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                                        fontWeight: isSelected ? '800' : '600',
                                        textShadow: isSelected 
                                            ? state.isCompleted 
                                                ? '0 0 8px rgba(16, 185, 129, 0.6)' 
                                                : '0 0 8px rgba(59, 130, 246, 0.6)'
                                            : 'none'
                                    }}>
                                        {node.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Glassmorphic Side Cockpit Detail Drawer */}
                {selectedNode && (() => {
                    const state = getNodeState(selectedNode);
                    const NodeIcon = selectedNode.icon;
                    return (
                        <div style={styles.detailDrawer} className="slideInRight">
                            <div style={styles.drawerHeader}>
                                <div style={{
                                    ...styles.drawerIconBox,
                                    borderColor: state.isCompleted ? 'var(--color-success)' : state.isUnlocked ? 'var(--color-primary)' : 'rgba(239, 68, 68, 0.3)',
                                    backgroundColor: state.isCompleted ? 'rgba(16, 185, 129, 0.05)' : state.isUnlocked ? 'rgba(59, 130, 246, 0.05)' : 'rgba(239, 68, 68, 0.02)'
                                }}>
                                    <NodeIcon size={22} color={state.isCompleted ? 'var(--color-success)' : state.isUnlocked ? 'var(--color-primary)' : 'var(--text-muted)'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={styles.drawerTag}>NODE DIAGNOSTIC</div>
                                    <h3 style={styles.drawerTitle}>{selectedNode.title}</h3>
                                </div>
                            </div>

                            {/* Sci-Fi Diagnostic Telemetry Radar */}
                            <div style={styles.telemetryRadar}>
                                <svg width="50" height="50" viewBox="0 0 100 100" style={{ transform: 'rotate(0deg)', animation: 'spinClockwise 15s linear infinite' }}>
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1.5" />
                                    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" />
                                    <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" />
                                    <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="0.8" />
                                    <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="0.8" />
                                    {/* Sweeper sweep line */}
                                    <line x1="50" y1="50" x2="80" y2="20" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                                    <circle cx="80" cy="20" r="3" fill="var(--color-primary)" style={{ filter: 'drop-shadow(0 0 4px var(--color-primary))' }} />
                                </svg>
                                <div style={styles.telemetryText}>
                                    <div>LOC_KEY: {selectedNode.id.toUpperCase()}</div>
                                    <div>STATUS: {state.isCompleted ? 'CALIBRATED' : state.isUnlocked ? 'DECRYPTED' : 'ENCRYPTED'}</div>
                                    <div style={{ color: state.isUnlocked ? 'var(--color-success)' : 'var(--color-error)' }}>SIGNAL: {state.isUnlocked ? 'SECURE' : 'ISOLATED'}</div>
                                </div>
                            </div>

                            <p style={styles.drawerDesc}>{selectedNode.description}</p>

                            <div style={styles.statGrid}>
                                <div style={styles.statCell}>
                                    <div style={styles.statValLabel}>COMPLEXITY</div>
                                    <div style={{
                                        ...styles.statValText,
                                        color: state.isCompleted ? 'var(--color-success)' : state.isUnlocked ? 'var(--color-primary)' : 'var(--text-muted)'
                                    }}>
                                        {selectedNode.xp > 300 ? 'LEGENDARY' : selectedNode.xp > 200 ? 'ADVANCED' : 'STANDARDIZED'}
                                    </div>
                                </div>
                                <div style={styles.statCell}>
                                    <div style={styles.statValLabel}>MATRIX REWARD</div>
                                    <div style={{ ...styles.statValText, color: '#fbbf24', textShadow: '0 0 4px rgba(251, 191, 36, 0.2)' }}>+{selectedNode.xp} XP</div>
                                </div>
                            </div>

                            <div style={styles.progressContainer}>
                                <div style={styles.progressLabelRow}>
                                    <span>Logic Integration Stream</span>
                                    <span>{state.percent}%</span>
                                </div>
                                <div style={styles.progressBarBg}>
                                    <div style={{
                                        ...styles.progressBarFill,
                                        width: `${state.percent}%`,
                                        backgroundColor: state.isCompleted ? 'var(--color-success)' : 'var(--color-primary)',
                                        boxShadow: state.isCompleted ? '0 0 10px var(--color-success)' : '0 0 10px var(--color-primary)'
                                    }} />
                                </div>
                            </div>

                            {/* Challenge Sub-missions */}
                            <div style={styles.challengesList}>
                                <div style={styles.listHeader}>CHALLENGE MODULE REPERTOIRE</div>
                                {selectedNode.challenges.map((chalId, idx) => {
                                    const problemTopic = selectedNode.topic;
                                    const matchingTopicProblems = PROBLEMS[problemTopic] || [];
                                    const problem = matchingTopicProblems.find(p => p.id === chalId);

                                    if (!problem) return null;
                                    const isChalSolved = solvedIds.includes(chalId);

                                    return (
                                        <div
                                            key={chalId}
                                            style={{
                                                ...styles.challengeItem,
                                                borderColor: isChalSolved ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-color)',
                                                opacity: state.isUnlocked ? 1 : 0.6,
                                                background: isChalSolved ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-tertiary)',
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={styles.chalIndex}>#{idx + 1}</span>
                                                    <span style={styles.chalTitle} title={problem.title}>{problem.title}</span>
                                                </div>
                                                <span style={styles.chalDifficulty}>{problem.difficulty} complexity index</span>
                                            </div>

                                            {isChalSolved ? (
                                                <span style={styles.solvedIndicator}>
                                                    <CheckCircle2 size={12} /> SECURED
                                                </span>
                                            ) : state.isUnlocked ? (
                                                <button
                                                    className="deploy-launcher-btn"
                                                    style={styles.engageBtn}
                                                    onClick={() => {
                                                        triggerAudio('rare');
                                                        if (onLaunchChallenge) {
                                                            const pIdx = matchingTopicProblems.findIndex(p => p.id === chalId);
                                                            onLaunchChallenge(problemTopic, pIdx !== -1 ? pIdx : 0);
                                                        }
                                                    }}
                                                >
                                                    <Play size={8} fill="white" /> DEPLOY
                                                </button>
                                            ) : (
                                                <Lock size={12} color="var(--text-muted)" style={{ marginRight: '6px' }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {!state.isUnlocked && (
                                <div style={styles.lockBriefing}>
                                    <AlertCircle size={14} color="var(--color-error)" />
                                    <span>
                                        Access requires completing prerequisites: {selectedNode.prereqs.map(p => MAP_NODES.find(mn => mn.id === p)?.title).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>

            <style>{`
                .journey-node-item {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    cursor: pointer;
                }
                .journey-node-item:hover {
                    transform: translateY(-2px) scale(1.04);
                }
                @keyframes pulseBlueRing {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
                    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
                .node-breathing {
                    animation: pulseBlueRing 2s infinite;
                }
                @keyframes spinClockwise {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spinCounterClockwise {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes flowPath {
                    to {
                        stroke-dashoffset: -32;
                    }
                }
                .path-flowing {
                    stroke-dasharray: 6, 12;
                    animation: flowPath 1.3s linear infinite;
                }
                @keyframes laserSweep {
                    0% { top: -2px; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 22px; opacity: 0; }
                }
                .laser-security-scanner {
                    position: absolute;
                    left: -8px;
                    right: -8px;
                    height: 2px;
                    background: var(--color-error);
                    box-shadow: 0 0 6px var(--color-error);
                    animation: laserSweep 2s linear infinite;
                    pointer-events: none;
                }
                /* Target corner brackets style for chosen node */
                .telemetry-brackets {
                    position: absolute;
                    left: -8px;
                    top: -8px;
                    right: -8px;
                    bottom: -8px;
                    pointer-events: none;
                    animation: bracketPulse 1.2s ease-in-out infinite alternate;
                }
                @keyframes bracketPulse {
                    from { transform: scale(0.96); opacity: 0.7; }
                    to { transform: scale(1.04); opacity: 1; }
                }
                .bracket {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    border-style: solid;
                    border-width: 0;
                }
                .bracket.tl { top: 0; left: 0; border-top-width: 2px; border-left-width: 2px; }
                .bracket.tr { top: 0; right: 0; border-top-width: 2px; border-right-width: 2px; }
                .bracket.bl { bottom: 0; left: 0; border-bottom-width: 2px; border-left-width: 2px; }
                .bracket.br { bottom: 0; right: 0; border-bottom-width: 2px; border-right-width: 2px; }
                
                /* Deploy button micro-interactions */
                .deploy-launcher-btn {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .deploy-launcher-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 10px var(--color-primary);
                    border-color: rgba(255, 255, 255, 0.8) !important;
                }
                .deploy-launcher-btn:active {
                    transform: scale(0.96);
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'transparent',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-soft)'
    },
    title: {
        fontSize: '18px',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#fff',
        letterSpacing: '0.5px'
    },
    subtitle: {
        fontSize: '12px',
        color: 'var(--text-secondary)',
        marginTop: '6px',
        lineHeight: '1.5'
    },
    progressSummary: {
        display: 'flex',
        alignItems: 'center'
    },
    summaryItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        padding: '8px 16px',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px'
    },
    summaryVal: {
        fontSize: '18px',
        fontWeight: '800',
        color: 'var(--color-primary)'
    },
    summaryLabel: {
        fontSize: '9px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginTop: '2px'
    },
    mainCanvas: {
        flex: 1,
        display: 'flex',
        gap: '20px',
        overflow: 'hidden',
        minHeight: 0
    },
    viewportWrapper: {
        flex: 1,
        backgroundColor: '#040406',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflowX: 'auto',
        overflowY: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 0 35px rgba(0,0,0,0.85)'
    },
    depthOverlayLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '30px',
        background: 'linear-gradient(to right, rgba(4,4,6,0.9), transparent)',
        pointerEvents: 'none',
        zIndex: 4
    },
    depthOverlayRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '30px',
        background: 'linear-gradient(to left, rgba(4,4,6,0.9), transparent)',
        pointerEvents: 'none',
        zIndex: 4
    },
    canvasContainer: {
        width: '1240px',
        height: '480px',
        position: 'relative',
    },
    svgOverlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '1240px',
        height: '480px',
        zIndex: 1,
        pointerEvents: 'none'
    },
    nodeContainer: {
        position: 'absolute',
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    },
    outerRotatingRing: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '1px dashed',
        pointerEvents: 'none',
        boxSizing: 'border-box'
    },
    corePod: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: '2px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 6,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.25s ease'
    },
    nodeLabel: {
        position: 'absolute',
        top: '72px',
        fontSize: '11px',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        width: '120px',
        left: 'calc(50% - 60px)'
    },
    detailDrawer: {
        width: '320px',
        backgroundColor: 'rgba(9, 9, 12, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        height: '100%',
        maxHeight: '100%'
    },
    drawerHeader: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
    },
    drawerIconBox: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        border: '1px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    drawerTag: {
        fontSize: '8px',
        fontWeight: 'bold',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px'
    },
    drawerTitle: {
        fontSize: '16px',
        fontWeight: '800',
        color: '#fff',
        margin: '2px 0 0 0',
        letterSpacing: '0.3px'
    },
    telemetryRadar: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'rgba(9, 9, 11, 0.55)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        padding: '8px 12px',
        marginTop: '2px'
    },
    telemetryText: {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        lineHeight: '1.2'
    },
    drawerDesc: {
        fontSize: '12px',
        lineHeight: '1.55',
        color: 'var(--text-secondary)',
        margin: 0
    },
    statGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
    },
    statCell: {
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '8px 12px'
    },
    statValLabel: {
        fontSize: '8px',
        fontWeight: 'bold',
        color: 'var(--text-muted)',
        textTransform: 'uppercase'
    },
    statValText: {
        fontSize: '11px',
        fontWeight: '800',
        marginTop: '4px'
    },
    progressContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    progressLabelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: 'var(--text-muted)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.4px'
    },
    progressBarBg: {
        height: '6px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '3px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
    },
    progressBarFill: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.4s ease'
    },
    challengesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
        minHeight: 0
    },
    listHeader: {
        fontSize: '8px',
        fontWeight: 'bold',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '2px'
    },
    challengeItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        gap: '10px',
        transition: 'all 0.2s'
    },
    chalIndex: {
        fontSize: '10px',
        fontWeight: '800',
        color: 'var(--color-primary)'
    },
    chalTitle: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#eee',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '130px'
    },
    chalDifficulty: {
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        fontSize: '8px',
        letterSpacing: '0.3px'
    },
    solvedIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '9px',
        fontWeight: '800',
        color: 'var(--color-success)',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        padding: '3px 6px',
        borderRadius: '6px',
        letterSpacing: '0.4px'
    },
    engageBtn: {
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: '800',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.2)'
    },
    lockBriefing: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: 'rgba(239, 68, 68, 0.03)',
        border: '1px solid rgba(239, 68, 68, 0.12)',
        borderRadius: '10px',
        fontSize: '10px',
        color: 'var(--color-error)',
        lineHeight: '1.45'
    }
};

export default LearningMap;
