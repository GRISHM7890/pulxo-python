import React, { useState, useEffect } from 'react';
import Editor from './Editor';
import { Skull, Heart, ShieldAlert, X } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

const BossBattle = ({ mission, onExit }) => {
    const gamification = useGamification();
    const [bossHealth, setBossHealth] = useState(100);
    const [playerHealth, setPlayerHealth] = useState(100);
    const [code, setCode] = useState('# Defeat the Dragon!\n# Fix the syntax error to deal damage.\n\ndef attack():\n  print("Strike!")\n');

    useEffect(() => {
        // Player loses 5 health every 5 seconds (simulated pressure)
        const timer = setInterval(() => {
            setPlayerHealth(prev => Math.max(0, prev - 5));
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const handleRun = () => {
        // In a real battle, this would validate against test cases.
        // For MVP, running the code successfully deals damage.
        if (code.includes('print')) {
            setBossHealth(prev => Math.max(0, prev - 34));
        } else {
            setPlayerHealth(prev => Math.max(0, prev - 20));
            alert("Attack failed! The boss strikes back.");
        }
    };

    useEffect(() => {
        if (bossHealth === 0) {
            gamification.addXP(mission.xp || 300);
            gamification.completeMission(mission.id, mission.xp || 300);
            alert("Victory! You defeated the boss and earned " + (mission.xp || 300) + " XP!");
            onExit();
        } else if (playerHealth === 0) {
            alert("Defeat! You ran out of health.");
            onExit();
        }
    }, [bossHealth, playerHealth]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)' }}>
                    <Skull size={24} /> {mission?.title || 'Boss Battle'}
                </h2>
                <button className="btn-icon btn" onClick={onExit}><X size={24} /></button>
            </div>

            <div style={styles.battleArena}>
                {/* Boss Status */}
                <div style={styles.entityCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-error)' }}>Data Dragon</span>
                        <span>{bossHealth}/100 HP</span>
                    </div>
                    <div style={styles.healthBarBg}>
                        <div style={{ ...styles.healthBarFill, width: `${bossHealth}%`, backgroundColor: 'var(--color-error)' }}></div>
                    </div>
                </div>

                {/* VS */}
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-muted)' }}>VS</div>

                {/* Player Status */}
                <div style={styles.entityCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>You</span>
                        <span>{playerHealth}/100 HP</span>
                    </div>
                    <div style={styles.healthBarBg}>
                        <div style={{ ...styles.healthBarFill, width: `${playerHealth}%`, backgroundColor: 'var(--color-success)' }}></div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative', borderTop: '2px solid var(--border-color)' }}>
                <Editor
                    isDarkMode={true}
                    code={code}
                    setCode={setCode}
                    onRun={handleRun}
                    language="Python"
                />
            </div>
            
            <div style={styles.actionFooter}>
                <button className="btn btn-error" onClick={handleRun} style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 'bold' }}>
                    CAST CODE SPELL (RUN)
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0c', // Very dark arena background
    },
    header: {
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: '#111116'
    },
    battleArena: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px',
        gap: '24px'
    },
    entityCard: {
        flex: 1,
        backgroundColor: 'var(--bg-secondary)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
    },
    healthBarBg: {
        height: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '6px',
        overflow: 'hidden'
    },
    healthBarFill: {
        height: '100%',
        transition: 'width 0.3s ease'
    },
    actionFooter: {
        padding: '16px',
        backgroundColor: '#111116',
        borderTop: '1px solid var(--border-color)'
    }
};

export default BossBattle;
