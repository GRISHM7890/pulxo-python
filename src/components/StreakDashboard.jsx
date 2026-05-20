import React from 'react';
import { Flame, Shield, Award, CheckCircle, HelpCircle } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

const StreakDashboard = ({ onClose }) => {
    const gamification = useGamification() || {};
    const { 
        streak = 0, 
        streakFreezes = 1, 
        dailyGoalCompleted = false, 
        streakBoostActive = false,
        comebackBonusEligible = false,
        claimWeeklyReward,
        claimMonthlyReward
    } = gamification;

    // Decide flame details based on streak milestone
    const getFlameTheme = () => {
        if (streak >= 30) return { color: '#a855f7', text: 'Cosmic Flame', shadow: 'rgba(168, 85, 247, 0.4)' };
        if (streak >= 7) return { color: '#f59e0b', text: 'Legendary Flame', shadow: 'rgba(245, 158, 11, 0.4)' };
        if (streak >= 3) return { color: '#3b82f6', text: 'Stellar Blue Flame', shadow: 'rgba(59, 130, 246, 0.4)' };
        return { color: '#ef4444', text: 'Kindling Flame', shadow: 'rgba(239, 68, 68, 0.4)' };
    };

    const flameTheme = getFlameTheme();

    return (
        <div className="streak-popover">
            <div className="streak-popover-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={20} color={flameTheme.color} fill={flameTheme.color} />
                    <span className="streak-title">Daily Streak</span>
                </div>
                <button className="streak-close-btn" onClick={onClose}>&times;</button>
            </div>

            <div className="streak-popover-content">
                {/* Flame Visualizer */}
                <div className="streak-large-flame-container" style={{ '--flame-shadow': flameTheme.shadow }}>
                    <div className="flame-glow-circle" style={{ backgroundColor: flameTheme.color }}></div>
                    <Flame size={54} color={flameTheme.color} fill={flameTheme.color} className="flame-main-icon" />
                    <div className="streak-number">{streak}</div>
                    <div className="streak-label">{flameTheme.text}</div>
                </div>

                {/* Daily Goal Status */}
                <div className={`streak-goal-card ${dailyGoalCompleted ? 'completed' : 'pending'}`}>
                    <div className="goal-icon-wrapper">
                        {dailyGoalCompleted ? (
                            <CheckCircle size={22} color="#10b981" />
                        ) : (
                            <HelpCircle size={22} color="var(--text-muted)" />
                        )}
                    </div>
                    <div className="goal-text">
                        <div className="goal-heading">
                            {dailyGoalCompleted ? 'Goal Cleared!' : 'Goal Unfinished'}
                        </div>
                        <div className="goal-sub">
                            {dailyGoalCompleted 
                                ? 'Daily coding spark achieved! +15 XP' 
                                : 'Compile & run valid code today to keep your streak!'
                            }
                        </div>
                    </div>
                </div>

                {/* Streak Boost */}
                {streakBoostActive && (
                    <div className="streak-boost-banner">
                        <Award size={16} />
                        <span>1.2x Active XP Multiplier!</span>
                    </div>
                )}

                {/* Comeback Helper if eligible */}
                {comebackBonusEligible && (
                    <div className="comeback-banner">
                        💥 Rebuild Momentum: +50 XP Comeback Bonus waiting!
                    </div>
                )}

                {/* Protection Panel */}
                <div className="streak-protection">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={16} color="#60a5fa" />
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Streak Freeze</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{streakFreezes}/2 Available</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Automatically protects your streak when you have a busy day! Refreshes weekly.
                    </div>
                </div>

                {/* Milestone Timeline */}
                <div className="milestone-timeline">
                    <div className="timeline-title">Milestone Rewards</div>
                    <div className="timeline-steps">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                            const isPassed = streak >= day;
                            const isCurrent = streak + 1 === day;
                            return (
                                <div key={day} className={`timeline-day ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}>
                                    <div className="timeline-node">
                                        {day === 7 ? '🎁' : day}
                                    </div>
                                    <div className="timeline-label">Day {day}</div>
                                </div>
                            );
                        })}
                    </div>
                    {streak >= 7 && (
                        <button className="claim-milestone-btn btn btn-primary" onClick={claimWeeklyReward}>
                            Claim 7-Day Reward
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                .streak-popover {
                    position: absolute;
                    top: 50px;
                    right: 24px;
                    width: 320px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    overflow: hidden;
                    animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .streak-popover-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--bg-tertiary);
                }

                .streak-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .streak-close-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 20px;
                    cursor: pointer;
                    line-height: 1;
                }

                .streak-popover-content {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .streak-large-flame-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 0;
                }

                .flame-glow-circle {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    filter: blur(24px);
                    opacity: 0.15;
                    z-index: 0;
                    animation: pulse-glow 2s infinite alternate;
                }

                .flame-main-icon {
                    z-index: 1;
                    filter: drop-shadow(0 0 10px var(--flame-shadow));
                    animation: hover-wobble 3s infinite ease-in-out;
                }

                .streak-number {
                    font-size: 32px;
                    font-weight: 900;
                    color: var(--text-primary);
                    margin-top: 8px;
                    z-index: 1;
                    font-family: var(--font-mono);
                }

                .streak-label {
                    font-size: 11px;
                    font-weight: bold;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    z-index: 1;
                }

                .streak-goal-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    transition: all 0.25s;
                }

                .streak-goal-card.completed {
                    background: rgba(16, 185, 129, 0.05);
                    border-color: rgba(16, 185, 129, 0.2);
                }

                .streak-goal-card.pending {
                    background: var(--bg-tertiary);
                }

                .goal-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .goal-text {
                    display: flex;
                    flex-direction: column;
                }

                .goal-heading {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .goal-sub {
                    font-size: 10px;
                    color: var(--text-secondary);
                    line-height: 1.3;
                    margin-top: 2px;
                }

                .streak-boost-banner {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px;
                    background: linear-gradient(135deg, #f59e0b, #ef4444);
                    color: #fff;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    box-shadow: 0 4px 10px rgba(245, 158, 11, 0.2);
                }

                .comeback-banner {
                    padding: 8px;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px dashed #3b82f6;
                    color: #3b82f6;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: bold;
                    text-align: center;
                }

                .streak-protection {
                    padding: 12px;
                    background: var(--bg-tertiary);
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                }

                .milestone-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .timeline-title {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .timeline-steps {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    padding: 8px 0;
                }

                .timeline-steps::before {
                    content: '';
                    position: absolute;
                    top: 20px;
                    left: 10px;
                    right: 10px;
                    height: 2px;
                    background: var(--border-color);
                    z-index: 0;
                }

                .timeline-day {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    z-index: 1;
                }

                .timeline-node {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }

                .timeline-day.passed .timeline-node {
                    background: var(--color-primary);
                    border-color: var(--color-primary);
                    color: #fff;
                }

                .timeline-day.current .timeline-node {
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                    box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
                }

                .timeline-label {
                    font-size: 9px;
                    color: var(--text-muted);
                }

                .claim-milestone-btn {
                    padding: 8px;
                    font-size: 11px;
                    margin-top: 4px;
                }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                @keyframes pulse-glow {
                    0% { transform: scale(0.9); opacity: 0.1; }
                    100% { transform: scale(1.1); opacity: 0.2; }
                }

                @keyframes hover-wobble {
                    0% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-3px) rotate(2deg); }
                    100% { transform: translateY(0) rotate(0deg); }
                }
            `}</style>
        </div>
    );
};

export default StreakDashboard;
