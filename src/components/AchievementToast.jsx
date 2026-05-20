import React, { useEffect, useState } from 'react';
import { Award, Zap, Trophy, ShieldAlert } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { playUnlockChime } from '../lib/audioSynth';

const AchievementToast = () => {
    const { activeToast, setActiveToast } = useGamification() || {};
    const [isVisible, setIsVisible] = useState(false);
    const [currentAch, setCurrentAch] = useState(null);

    useEffect(() => {
        if (activeToast) {
            // Play Synth Audio natively
            playUnlockChime(activeToast.rarity);
            
            setCurrentAch(activeToast);
            setIsVisible(true);

            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => {
                    setActiveToast(null);
                    setCurrentAch(null);
                }, 500); // Allow exit transition
            }, 4500);

            return () => clearTimeout(timer);
        }
    }, [activeToast]);

    if (!currentAch) return null;

    const getRarityDetails = () => {
        switch (currentAch.rarity) {
            case 'legendary':
                return { color: '#f59e0b', text: 'Legendary', shadow: 'rgba(245, 158, 11, 0.4)', icon: <Trophy size={20} color="#f59e0b" /> };
            case 'epic':
                return { color: '#8b5cf6', text: 'Epic', shadow: 'rgba(139, 92, 246, 0.4)', icon: <Zap size={20} color="#8b5cf6" /> };
            case 'rare':
                return { color: '#3b82f6', text: 'Rare', shadow: 'rgba(59, 130, 246, 0.4)', icon: <Award size={20} color="#3b82f6" /> };
            default:
                return { color: '#10b981', text: 'Common', shadow: 'rgba(16, 185, 129, 0.4)', icon: <Award size={20} color="#10b981" /> };
        }
    };

    const rarity = getRarityDetails();

    return (
        <div className={`achievement-toast-container ${isVisible ? 'visible' : ''}`} style={{ '--border-rarity': rarity.color, '--shadow-rarity': rarity.shadow }}>
            <div className="achievement-toast-glow"></div>
            <div className="achievement-toast-content">
                <div className="toast-icon-badge" style={{ borderColor: rarity.color, boxShadow: `0 0 10px ${rarity.shadow}` }}>
                    {rarity.icon}
                </div>
                <div className="toast-body">
                    <div className="toast-header-text">
                        <span className="toast-ach-rarity" style={{ color: rarity.color }}>{rarity.text} Achievement</span>
                        <span className="toast-ach-xp">+{currentAch.xp} XP</span>
                    </div>
                    <div className="toast-title-text">{currentAch.title}</div>
                    <div className="toast-desc-text">{currentAch.desc}</div>
                </div>
            </div>

            <style>{`
                .achievement-toast-container {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 340px;
                    background: linear-gradient(135deg, var(--bg-secondary), rgba(0,0,0,0.4));
                    border: 1px solid var(--border-rarity);
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 15px var(--shadow-rarity);
                    z-index: 10000;
                    overflow: hidden;
                    padding: 16px;
                    backdrop-filter: blur(12px);
                    transform: translateX(120%);
                    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .achievement-toast-container.visible {
                    transform: translateX(0);
                }

                .achievement-toast-glow {
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, var(--shadow-rarity) 0%, transparent 70%);
                    opacity: 0.15;
                    pointer-events: none;
                    animation: rotation 10s linear infinite;
                }

                .achievement-toast-content {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    position: relative;
                    z-index: 1;
                }

                .toast-icon-badge {
                    width: 48px;
                    height: 48px;
                    border: 2px solid;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.2);
                    flex-shrink: 0;
                    animation: shake-slow 3s infinite alternate;
                }

                .toast-body {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }

                .toast-header-text {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .toast-ach-rarity {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }

                .toast-ach-xp {
                    font-size: 11px;
                    font-weight: 800;
                    color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                    padding: 2px 6px;
                    border-radius: 8px;
                }

                .toast-title-text {
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 2px;
                }

                .toast-desc-text {
                    font-size: 11px;
                    color: var(--text-muted);
                    line-height: 1.3;
                }

                @keyframes rotation {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes shake-slow {
                    0% { transform: rotate(-3deg) scale(1); }
                    100% { transform: rotate(3deg) scale(1.05); }
                }
            `}</style>
        </div>
    );
};

export default AchievementToast;
