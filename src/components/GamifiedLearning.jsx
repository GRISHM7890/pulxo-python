import React from 'react';
import { useGamification } from '../context/GamificationContext';
import { Trophy, Star, Target, Flame, CheckCircle, Lock, Play } from 'lucide-react';

const GamifiedLearning = ({ onStartBossBattle }) => {
    const gamification = useGamification();

    const missions = [
        { id: 1, title: 'Syntax Apprentice', xp: 50, unlocked: true, completed: gamification?.completedMissions?.[1] },
        { id: 2, title: 'Loops of Logic', xp: 100, unlocked: gamification?.level >= 2, completed: gamification?.completedMissions?.[2] },
        { id: 3, title: 'Defeat the Data Dragon', xp: 300, unlocked: gamification?.level >= 3, isBoss: true, completed: gamification?.completedMissions?.[3] },
        { id: 4, title: 'Algorithm Master', xp: 500, unlocked: gamification?.level >= 5, completed: gamification?.completedMissions?.[4] },
    ];

    if (!gamification) return <div style={styles.container}>Loading Game Data...</div>;

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <div style={styles.hero}>
                <div style={styles.heroLeft}>
                    <div style={styles.rankBadge}>
                        <Trophy size={48} color="var(--color-primary)" />
                    </div>
                    <div>
                        <h1 style={styles.heroTitle}>{gamification.rank}</h1>
                        <p style={styles.heroSubtitle}>Level {gamification.level} Programmer</p>
                    </div>
                </div>
                <div style={styles.heroRight}>
                    <div style={styles.statCard}>
                        <Flame size={24} color="#f59e0b" />
                        <div>
                            <div style={styles.statValue}>{gamification.streak}</div>
                            <div style={styles.statLabel}>Day Streak</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <Star size={24} color="var(--color-primary)" />
                        <div>
                            <div style={styles.statValue}>{gamification.xp}</div>
                            <div style={styles.statLabel}>Total XP</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Learning Map */}
            <div style={styles.mapContainer}>
                <h2 style={styles.sectionTitle}><Target size={20} /> Learning Map (Skill Tree)</h2>
                <div style={styles.nodesContainer}>
                    {missions.map((mission, index) => (
                        <div key={mission.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                                ...styles.node,
                                opacity: mission.unlocked ? 1 : 0.5,
                                borderColor: mission.completed ? 'var(--color-success)' : mission.isBoss ? 'var(--color-error)' : 'var(--border-color)',
                                backgroundColor: mission.completed ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)'
                            }}>
                                <div style={styles.nodeHeader}>
                                    <span style={{ fontWeight: 'bold' }}>{mission.title}</span>
                                    {mission.completed ? <CheckCircle size={16} color="var(--color-success)" /> : !mission.unlocked ? <Lock size={16} /> : null}
                                </div>
                                <div style={styles.nodeXP}>+{mission.xp} XP</div>
                                {mission.unlocked && !mission.completed && (
                                    <button 
                                        className={`btn ${mission.isBoss ? 'btn-error' : 'btn-primary'}`} 
                                        style={{ marginTop: '12px', width: '100%' }}
                                        onClick={() => {
                                            if (mission.isBoss && onStartBossBattle) onStartBossBattle(mission);
                                            else alert('Starting mission: ' + mission.title);
                                        }}
                                    >
                                        <Play size={14} style={{ marginRight: '4px' }} /> {mission.isBoss ? 'Start Boss Battle' : 'Start Mission'}
                                    </button>
                                )}
                            </div>
                            {index < missions.length - 1 && (
                                <div style={{
                                    width: '40px',
                                    height: '4px',
                                    backgroundColor: mission.completed ? 'var(--color-success)' : 'var(--border-color)',
                                    borderRadius: '2px',
                                    margin: '0 8px'
                                }}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
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
        padding: '32px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '24px'
    },
    heroLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
    },
    rankBadge: {
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid var(--color-primary)',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
    },
    heroTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 0 4px 0',
        background: 'linear-gradient(45deg, var(--color-primary), #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    heroSubtitle: {
        fontSize: '16px',
        color: 'var(--text-secondary)',
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
        padding: '16px 24px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
    },
    statValue: {
        fontSize: '20px',
        fontWeight: 'bold'
    },
    statLabel: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    mapContainer: {
        backgroundColor: 'var(--bg-secondary)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px'
    },
    nodesContainer: {
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        paddingBottom: '16px'
    },
    node: {
        minWidth: '220px',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid var(--border-color)',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    },
    nodeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontSize: '16px'
    },
    nodeXP: {
        fontSize: '14px',
        color: 'var(--color-primary)',
        fontWeight: 'bold'
    }
};

export default GamifiedLearning;
