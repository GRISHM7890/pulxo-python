import React, { useState } from 'react';
import { useGamification } from '../context/GamificationContext';
import { Trophy, Star, Target, Flame, CheckCircle2, Lock, Play, Filter, Sparkles, Code2, Terminal, AlertCircle, Skull, ShieldAlert } from 'lucide-react';
import { MISSIONS, DIFFICULTY_LEVELS, MISSION_TYPES } from '../lib/missionData';
import { BOSS_DATA } from './BossBattle';

const GamifiedLearning = ({ onStartMission, onStartBoss }) => {
    const gamification = useGamification() || {};
    const [subTab, setSubTab] = useState('missions'); // 'map', 'missions'

    // Filtering states for the tactical board
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    if (!gamification) return <div style={styles.container}>Loading Core Game Engine...</div>;

    const userLevel = gamification.level || 1;
    const completedMissions = gamification.completedMissions || {};

    const isBossUnlocked = (bossId) => {
        if (bossId === 'syntax_hydra') return true;
        if (bossId === 'loop_titan') return userLevel >= 2;
        if (bossId === 'bug_overlord') return userLevel >= 3;
        if (bossId === 'memory_eater') return userLevel >= 3;
        if (bossId === 'exception_king') return userLevel >= 5;
        return false;
    };

    const getBossLevelRequired = (bossId) => {
        if (bossId === 'syntax_hydra') return 1;
        if (bossId === 'loop_titan') return 2;
        if (bossId === 'bug_overlord') return 3;
        if (bossId === 'memory_eater') return 3;
        if (bossId === 'exception_king') return 5;
        return 1;
    };

    // Helper to evaluate if a static mission is unlocked
    const isMissionUnlocked = (m) => {
        if (m.difficulty === 'beginner') return true;
        if (m.difficulty === 'intermediate') return userLevel >= 2;
        if (m.difficulty === 'advanced') return userLevel >= 3;
        if (m.difficulty === 'legendary') return userLevel >= 5;
        return true;
    };

    // Filter missions list based on user selections
    const filteredMissions = MISSIONS.filter(m => {
        const isUnlocked = isMissionUnlocked(m);
        const isCompleted = completedMissions[m.id];

        // 1. Difficulty Filter
        if (filterDifficulty !== 'all' && m.difficulty !== filterDifficulty) return false;

        // 2. Type Filter
        if (filterType !== 'all' && m.type !== filterType) return false;

        // 3. Status Filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'completed' && !isCompleted) return false;
            if (filterStatus === 'locked' && isUnlocked) return false;
            if (filterStatus === 'playable' && (!isUnlocked || isCompleted)) return false;
        }

        return true;
    });

    const skillTreeMissions = [
        { id: 1, title: 'Syntax Apprentice', xp: 50, unlocked: true, completed: completedMissions['mission_list_squarer'], missionKey: 'mission_list_squarer' },
        { id: 2, title: 'Binary Seeker', xp: 100, unlocked: userLevel >= 2, completed: completedMissions['mission_binary_search'], missionKey: 'mission_binary_search' },
        { id: 3, title: 'Caesar Cipher Engine', xp: 150, unlocked: userLevel >= 2, completed: completedMissions['mission_caesar_cipher'], missionKey: 'mission_caesar_cipher' },
        { id: 4, title: 'Fibonacci Master', xp: 250, unlocked: userLevel >= 3, completed: completedMissions['mission_memoized_fib'], missionKey: 'mission_memoized_fib' },
        { id: 5, title: 'Slay the Sorcerer', xp: 500, unlocked: userLevel >= 5, isBoss: true, completed: completedMissions['mission_anagram_sorcerer'], missionKey: 'mission_anagram_sorcerer' }
    ];

    const getDifficultyStyle = (difficulty) => {
        return DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.beginner;
    };

    const getTypeLabel = (type) => {
        return MISSION_TYPES[type]?.label || 'General Challenge';
    };

    return (
        <div style={styles.container}>
            {/* Immersive Cyberpunk Status Card */}
            <div style={styles.hero}>
                <div style={styles.heroLeft}>
                    <div style={styles.rankBadge}>
                        <Trophy size={40} color="var(--color-primary)" />
                    </div>
                    <div>
                        <h1 style={styles.heroTitle}>{gamification.rank || 'Bronze Scripter'}</h1>
                        <p style={styles.heroSubtitle}>Level {userLevel} System Operator</p>
                    </div>
                </div>
                <div style={styles.heroRight}>
                    <div style={styles.statCard}>
                        <Flame size={20} color="#f59e0b" style={{ filter: 'drop-shadow(0 0 5px #f59e0b)' }} />
                        <div>
                            <div style={styles.statValue}>{gamification.streak || 0}d</div>
                            <div style={styles.statLabel}>Active Streak</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <Star size={20} color="var(--color-primary)" style={{ filter: 'drop-shadow(0 0 5px var(--color-primary))' }} />
                        <div>
                            <div style={styles.statValue}>{gamification.xp || 0}</div>
                            <div style={styles.statLabel}>Matrix XP</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cyber Navigation Tabs */}
            <div style={styles.navigationRow}>
                <div style={styles.tabGroup}>
                    <button
                        style={subTab === 'missions' ? styles.navTabActive : styles.navTab}
                        onClick={() => setSubTab('missions')}
                    >
                        <Terminal size={14} /> Tactical Board
                    </button>
                    <button
                        style={subTab === 'map' ? styles.navTabActive : styles.navTab}
                        onClick={() => setSubTab('map')}
                    >
                        <Target size={14} /> System Map (Skill Tree)
                    </button>
                    <button
                        style={subTab === 'bosses' ? styles.navTabActive : styles.navTab}
                        onClick={() => setSubTab('bosses')}
                    >
                        <Flame size={14} /> 🌋 Boss Arena
                    </button>
                </div>
            </div>

            {/* MAP VIEW (SKILL TREE ROADMAP) */}
            {subTab === 'map' && (
                <div style={styles.mapContainer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={styles.sectionTitle}><Target size={18} /> Logical Roadmap</h2>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Progress relative to system access level</span>
                    </div>

                    <div style={styles.nodesContainer}>
                        {skillTreeMissions.map((node, index) => {
                            const matchingFullMission = MISSIONS.find(m => m.id === node.missionKey);
                            return (
                                <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className={`skill-tree-node ${node.completed ? 'node-done' : node.unlocked ? 'node-ready' : 'node-locked'} ${node.isBoss ? 'boss-node' : ''}`} style={{
                                        ...styles.node,
                                        opacity: node.unlocked ? 1 : 0.45,
                                        borderColor: node.completed ? 'var(--color-success)' : node.isBoss ? 'var(--color-error)' : 'var(--border-color)',
                                        boxShadow: node.completed ? '0 0 15px rgba(16, 185, 129, 0.15)' : node.isBoss && node.unlocked ? '0 0 20px rgba(239, 68, 68, 0.25)' : 'none'
                                    }}>
                                        <div style={styles.nodeHeader}>
                                            <span style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                                                {node.title}
                                            </span>
                                            {node.completed ? (
                                                <CheckCircle2 size={16} color="var(--color-success)" style={{ filter: 'drop-shadow(0 0 3px var(--color-success))' }} />
                                            ) : !node.unlocked ? (
                                                <Lock size={14} color="var(--text-muted)" />
                                            ) : node.isBoss ? (
                                                <Sparkles className="spin" size={14} color="var(--color-error)" />
                                            ) : null}
                                        </div>
                                        <div style={styles.nodeXP}>+{node.xp} XP</div>
                                        
                                        {node.unlocked ? (
                                            <button
                                                className={`btn ${node.isBoss ? 'btn-error' : 'btn-primary'}`}
                                                style={{ marginTop: '14px', width: '100%', padding: '6px 12px', fontSize: '12px' }}
                                                onClick={() => {
                                                    if (matchingFullMission && onStartMission) {
                                                        onStartMission(matchingFullMission);
                                                    }
                                                }}
                                            >
                                                <Play size={12} style={{ marginRight: '4px' }} />
                                                {node.completed ? 'Replay Run' : node.isBoss ? 'Engage Boss' : 'Launch Unit'}
                                            </button>
                                        ) : (
                                            <div style={styles.lockedNodeLabel}>
                                                Locked (Level {node.id === 2 || node.id === 3 ? 2 : node.id === 4 ? 3 : 5})
                                            </div>
                                        )}
                                    </div>
                                    {index < skillTreeMissions.length - 1 && (
                                        <div style={{
                                            width: '40px',
                                            height: '3px',
                                            backgroundColor: node.completed ? 'var(--color-success)' : 'var(--border-color)',
                                            borderRadius: '2px',
                                            margin: '0 4px',
                                            boxShadow: node.completed ? '0 0 8px var(--color-success)' : 'none'
                                        }}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* MISSION BOARD VIEW (FILTERED MISSIONS matrix) */}
            {subTab === 'missions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Control / Filter Bar */}
                    <div style={styles.filterBar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>
                            <Filter size={16} /> Filters
                        </div>
                        <div style={styles.filterGroup}>
                            {/* Difficulty Selector */}
                            <select
                                className="cyber-select"
                                value={filterDifficulty}
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="all">All Difficulties</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="legendary">Legendary</option>
                            </select>

                            {/* Type Selector */}
                            <select
                                className="cyber-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="all">All Mission Types</option>
                                <option value="fix_broken_code">Fix Broken Code</option>
                                <option value="predict_output">Predict Output</option>
                                <option value="find_hidden_bugs">Find Hidden Bugs</option>
                                <option value="build_mini_project">Build Mini Project</option>
                                <option value="logic_puzzle">Logic Puzzle</option>
                                <option value="ai_assisted">AI-Assisted</option>
                                <option value="optimize_slow_code">Optimize Slow Code</option>
                            </select>

                            {/* Completion Status */}
                            <select
                                className="cyber-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="all">All Statuses</option>
                                <option value="playable">Playable (Unlocked)</option>
                                <option value="completed">Completed</option>
                                <option value="locked">Locked</option>
                            </select>
                        </div>
                    </div>

                    {/* Missions Grid Display */}
                    {filteredMissions.length === 0 ? (
                        <div style={styles.noMissionsCard}>
                            <AlertCircle size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>No tactical units found matching selected matrix filters.</p>
                        </div>
                    ) : (
                        <div style={styles.missionsGrid}>
                            {filteredMissions.map((m) => {
                                const isUnlocked = isMissionUnlocked(m);
                                const isCompleted = completedMissions[m.id];
                                const diffMeta = getDifficultyStyle(m.difficulty);

                                return (
                                    <div
                                        key={m.id}
                                        style={{
                                            ...styles.missionCard,
                                            opacity: isUnlocked ? 1 : 0.5,
                                            borderStyle: isUnlocked ? 'solid' : 'dashed',
                                            borderColor: isCompleted ? 'rgba(16, 185, 129, 0.4)' : isUnlocked ? 'var(--border-color)' : 'var(--border-color)'
                                        }}
                                        className={`mission-card-interactive ${isCompleted ? 'completed' : ''}`}
                                    >
                                        {/* Rarity & Completion Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{
                                                fontSize: '9px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.6px',
                                                border: `1px solid ${diffMeta.color}`,
                                                color: diffMeta.color,
                                                padding: '1px 8px',
                                                borderRadius: '10px'
                                            }}>
                                                {m.difficulty}
                                            </span>
                                            {isCompleted ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontSize: '11px', fontWeight: 'bold' }}>
                                                    <CheckCircle2 size={12} /> Solved
                                                </span>
                                            ) : !isUnlocked ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px' }}>
                                                    <Lock size={12} /> Locked
                                                </span>
                                            ) : (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 'bold' }}>
                                                    ⚡ Ready
                                                </span>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <h3 style={styles.cardHeaderTitle}>{m.title}</h3>
                                        <p style={styles.cardDescText}>{m.briefing}</p>

                                        {/* Meta details */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                {getTypeLabel(m.type)}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>
                                                +{m.xp} XP
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        {isUnlocked ? (
                                            <button
                                                className={`btn ${m.difficulty === 'legendary' ? 'btn-error' : 'btn-primary'}`}
                                                style={{ marginTop: '14px', width: '100%', padding: '8px', fontSize: '13px', fontWeight: 'bold' }}
                                                onClick={() => onStartMission && onStartMission(m)}
                                            >
                                                <Play size={12} /> {isCompleted ? 'Replay Mission' : m.difficulty === 'legendary' ? 'Engage Overlord' : 'Deploy Command'}
                                            </button>
                                        ) : (
                                            <div style={styles.lockedHintBlock}>
                                                Locked: Access Level {m.difficulty === 'intermediate' ? '2' : m.difficulty === 'advanced' ? '3' : '5'} Required
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* BOSS ARENA VIEW */}
            {subTab === 'bosses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={styles.sectionTitle}><Skull size={18} /> Hostile Core Mainframes</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                Slay hostile core algorithms via logic validation to secure Matrix system permissions.
                            </p>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            WASM Engine: <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>ONLINE</span>
                        </span>
                    </div>

                    <div style={styles.bossesGrid}>
                        {Object.values(BOSS_DATA).map((boss) => {
                            const unlocked = isBossUnlocked(boss.id);
                            const completed = completedMissions[boss.id];
                            const reqLevel = getBossLevelRequired(boss.id);
                            
                            return (
                                <div
                                    key={boss.id}
                                    style={{
                                        ...styles.bossCard,
                                        borderColor: completed ? 'var(--color-success)' : unlocked ? boss.color : 'var(--border-color)',
                                        opacity: unlocked ? 1 : 0.6,
                                        boxShadow: unlocked 
                                            ? completed
                                                ? '0 0 25px rgba(16, 185, 129, 0.15)' 
                                                : `0 0 25px ${boss.color}15`
                                            : 'none'
                                    }}
                                    className={`boss-card-interactive ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`}
                                >
                                    {/* Locked Overlay */}
                                    {!unlocked && (
                                        <div style={styles.bossLockedOverlay}>
                                            <Lock size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.8px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                Restricted Access
                                            </span>
                                            <span style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 'bold', marginTop: '4px' }}>
                                                Requires Level {reqLevel}
                                            </span>
                                        </div>
                                    )}

                                    {/* Boss Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{
                                            fontSize: '9px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.6px',
                                            border: `1px solid ${completed ? 'var(--color-success)' : boss.color}`,
                                            color: completed ? 'var(--color-success)' : boss.color,
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            backgroundColor: 'rgba(0,0,0,0.3)'
                                        }}>
                                            {boss.difficulty}
                                        </span>
                                        {completed ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontSize: '11px', fontWeight: 'bold', textShadow: '0 0 8px rgba(16, 185, 129, 0.3)' }}>
                                                🛡️ Neutralized
                                            </span>
                                        ) : unlocked ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-error)', fontSize: '11px', fontWeight: 'bold', textShadow: `0 0 8px ${boss.color}30` }}>
                                                🔴 ACTIVE THREAT
                                            </span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px' }}>
                                                <Lock size={12} /> RESTRICTED
                                            </span>
                                        )}
                                    </div>

                                    {/* Glitching SVG Avatar */}
                                    <div style={{
                                        width: '100%',
                                        height: '140px',
                                        backgroundColor: '#050508',
                                        border: `1px solid ${completed ? 'rgba(16, 185, 129, 0.2)' : unlocked ? `${boss.color}25` : 'var(--border-color)'}`,
                                        borderRadius: '12px',
                                        padding: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '16px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: unlocked ? `inset 0 0 15px ${boss.color}05` : 'none'
                                    }}>
                                        <div style={{ width: '90px', height: '90px', filter: unlocked ? `drop-shadow(0 0 12px ${boss.color}30)` : 'none' }}>
                                            {boss.avatarSvg}
                                        </div>
                                    </div>

                                    {/* Boss Title & Description */}
                                    <h3 style={{ ...styles.cardHeaderTitle, color: completed ? 'var(--color-success)' : '#fff' }}>{boss.title}</h3>
                                    
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                        <div>Threat: <strong style={{ color: completed ? 'var(--color-success)' : boss.color }}>{boss.threatLevel}</strong></div>
                                        <div>Waves: <strong>{boss.waves.length} Stages</strong></div>
                                    </div>

                                    <p style={{ ...styles.cardDescText, fontSize: '11.5px', marginBottom: '16px' }}>
                                        {boss.waves[0]?.briefing || 'Mainframe defense systems online. Prepare coding logic.'}
                                    </p>

                                    {/* Divider and XP */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                            Core Combat
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>
                                            +{boss.xp} XP Bounty
                                        </span>
                                    </div>

                                    {/* Action button */}
                                    {unlocked ? (
                                        <button
                                            className={`btn ${completed ? 'btn-success' : 'btn-error'}`}
                                            style={{
                                                marginTop: '14px',
                                                width: '100%',
                                                padding: '10px',
                                                fontSize: '13px',
                                                fontWeight: 'bold',
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase',
                                                backgroundColor: completed ? 'rgba(16, 185, 129, 0.1)' : boss.color,
                                                borderColor: completed ? 'var(--color-success)' : boss.color,
                                                color: completed ? 'var(--color-success)' : '#fff',
                                                boxShadow: completed ? 'none' : `0 0 15px ${boss.color}35`
                                            }}
                                            onClick={() => onStartBoss && onStartBoss(boss)}
                                        >
                                            <Play size={12} style={{ marginRight: '4px' }} />
                                            {completed ? 'Re-enter Arena' : 'Engage Core'}
                                        </button>
                                    ) : (
                                        <div style={{
                                            ...styles.lockedHintBlock,
                                            color: 'var(--color-error)',
                                            borderColor: 'rgba(239, 68, 68, 0.15)',
                                            backgroundColor: 'rgba(239, 68, 68, 0.02)'
                                        }}>
                                            LOCKED: LEVEL {reqLevel} REQUIRED
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style>{`
                .cyber-select {
                    background-color: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 8px 12px;
                    color: var(--text-primary);
                    font-size: 13px;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .cyber-select:focus {
                    border-color: var(--color-primary);
                }
                .skill-tree-node {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .skill-tree-node:hover {
                    transform: translateY(-4px) scale(1.02);
                }
                .node-ready {
                    border-color: var(--color-primary) !important;
                }
                .node-ready:hover {
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.2) !important;
                }
                .mission-card-interactive {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .mission-card-interactive:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    border-color: rgba(59, 130, 246, 0.25);
                }
                .mission-card-interactive.completed {
                    background: linear-gradient(145deg, rgba(16, 185, 129, 0.02), var(--bg-secondary));
                }
                .mission-card-interactive.completed:hover {
                    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.08);
                    border-color: rgba(16, 185, 129, 0.3);
                }
                .boss-card-interactive {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .boss-card-interactive.unlocked:hover {
                    transform: translateY(-6px);
                }
                .boss-card-interactive.completed {
                    background: linear-gradient(145deg, rgba(16, 185, 129, 0.02), #09090e) !important;
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        padding: '32px',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
    },
    hero: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: 'var(--shadow-soft)'
    },
    heroLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
    },
    rankBadge: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid var(--color-primary)',
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)'
    },
    heroTitle: {
        fontSize: '24px',
        fontWeight: '800',
        margin: '0 0 4px 0',
        background: 'linear-gradient(90deg, var(--color-primary), #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    heroSubtitle: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 'bold',
        margin: 0
    },
    heroRight: {
        display: 'flex',
        gap: '16px'
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
    },
    statValue: {
        fontSize: '18px',
        fontWeight: '800'
    },
    statLabel: {
        fontSize: '10px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        fontWeight: '800',
        letterSpacing: '0.4px'
    },
    navigationRow: {
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)'
    },
    tabGroup: {
        display: 'flex',
        gap: '8px'
    },
    navTab: {
        padding: '12px 20px',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s'
    },
    navTabActive: {
        padding: '12px 20px',
        background: 'none',
        border: 'none',
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'default',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid var(--color-primary)',
        transition: 'all 0.2s'
    },
    mapContainer: {
        backgroundColor: 'var(--bg-secondary)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-soft)'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: 0
    },
    nodesContainer: {
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        padding: '16px 8px 24px 8px'
    },
    node: {
        minWidth: '200px',
        maxWidth: '200px',
        padding: '16px',
        borderRadius: '12px',
        border: '2px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    },
    nodeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
        fontSize: '14px'
    },
    nodeXP: {
        fontSize: '12px',
        color: '#f59e0b',
        fontWeight: 'bold'
    },
    lockedNodeLabel: {
        fontSize: '10px',
        color: 'var(--text-muted)',
        marginTop: '14px',
        textAlign: 'center',
        padding: '6px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        fontWeight: 'bold'
    },
    filterBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '16px'
    },
    filterGroup: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    filterSelect: {
        minWidth: '150px'
    },
    noMissionsCard: {
        padding: '48px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '1px dashed var(--border-color)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    missionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
    },
    missionCard: {
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-soft)'
    },
    cardHeaderTitle: {
        fontSize: '16px',
        fontWeight: '800',
        margin: '0 0 8px 0',
        color: 'var(--text-primary)',
        lineHeight: '1.3'
    },
    cardDescText: {
        fontSize: '12px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
        margin: 0,
        flexGrow: 1,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    lockedHintBlock: {
        fontSize: '11px',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '8px',
        borderRadius: '8px',
        textAlign: 'center',
        marginTop: '14px',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: '0.4px'
    },
    bossesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
    },
    bossCard: {
        backgroundColor: '#09090e',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-soft)',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    },
    bossLockedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(4px)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        border: '1px dashed var(--border-color)',
        pointerEvents: 'none'
    }
};

export default GamifiedLearning;
