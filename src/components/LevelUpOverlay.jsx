import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

const LevelUpOverlay = () => {
    const gamification = useGamification() || {};
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (gamification.showLevelUp) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => {
                    gamification.dismissLevelUp();
                }, 500); // Wait for fade out animation
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [gamification.showLevelUp]);

    if (!gamification.showLevelUp) return null;

    return (
        <div className={`level-up-overlay ${isVisible ? 'visible' : ''}`}>
            <div className="level-up-content">
                <div className="level-up-icon-wrapper">
                    <Trophy size={64} color="#f59e0b" className="level-up-icon" />
                    <Star size={32} color="#fcd34d" className="star-1" />
                    <Star size={24} color="#fcd34d" className="star-2" />
                    <Zap size={28} color="#60a5fa" className="star-3" />
                </div>
                
                <h1 className="level-up-title">LEVEL UP!</h1>
                <p className="level-up-subtitle">You have reached Level <span className="level-highlight">{gamification.levelUpData || gamification.level}</span></p>
                <p className="level-up-rank">{gamification.rank}</p>

                {gamification.levelUpData === 3 && <div className="unlock-alert">🌊 Unlocked: Ocean Theme</div>}
                {gamification.levelUpData === 5 && <div className="unlock-alert">🧊 Unlocked: Glass Theme</div>}
                {gamification.levelUpData === 10 && <div className="unlock-alert">⚡ Unlocked: Neon Theme & Elite Borders</div>}
            </div>

            <style>{`
                .level-up-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(8px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.5s ease;
                }
                .level-up-overlay.visible {
                    opacity: 1;
                    pointer-events: all;
                }

                .level-up-content {
                    background: linear-gradient(145deg, var(--bg-secondary), rgba(59, 130, 246, 0.1));
                    border: 2px solid rgba(59, 130, 246, 0.4);
                    border-radius: 24px;
                    padding: 48px;
                    text-align: center;
                    transform: scale(0.8) translateY(50px);
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 0 50px rgba(59, 130, 246, 0.3);
                }
                .level-up-overlay.visible .level-up-content {
                    transform: scale(1) translateY(0);
                }

                .level-up-icon-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 24px auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(245, 158, 11, 0.1);
                    border-radius: 50%;
                    animation: pulse-ring 2s infinite;
                }

                .level-up-icon {
                    animation: bounce 2s infinite;
                }

                .star-1 { position: absolute; top: -10px; right: -10px; animation: float 3s infinite 0.2s; }
                .star-2 { position: absolute; bottom: 10px; left: -20px; animation: float 3s infinite 0.5s; }
                .star-3 { position: absolute; top: 20px; left: -10px; animation: float 3s infinite 0.8s; }

                .level-up-title {
                    font-size: 48px;
                    font-weight: 900;
                    margin: 0 0 8px 0;
                    background: linear-gradient(90deg, #f59e0b, #fbbf24);
                    WebkitBackgroundClip: text;
                    WebkitTextFillColor: transparent;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .level-up-subtitle {
                    font-size: 20px;
                    color: var(--text-secondary);
                    margin: 0 0 16px 0;
                }

                .level-highlight {
                    color: #f59e0b;
                    font-weight: bold;
                    font-size: 24px;
                }

                .level-up-rank {
                    font-size: 16px;
                    font-weight: bold;
                    color: var(--color-primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    background: rgba(59, 130, 246, 0.1);
                    padding: 8px 16px;
                    border-radius: 20px;
                    display: inline-block;
                    margin-bottom: 24px;
                }

                .unlock-alert {
                    margin-top: 16px;
                    padding: 12px 24px;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    color: #10b981;
                    border-radius: 12px;
                    font-weight: bold;
                    animation: slideUp 0.5s ease;
                }

                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(245, 158, 11, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
                }

                @keyframes float {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0); }
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default LevelUpOverlay;
