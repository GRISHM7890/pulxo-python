import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification, ACHIEVEMENTS } from '../context/GamificationContext';
import { User, Calendar, Briefcase, Target, LogOut, Edit3, Save, X, Mail, ShieldCheck, Trophy, Flame, Zap, Activity, Award, Star, Clock, Code2, CheckCircle2 } from 'lucide-react';

const Profile = ({ onClose }) => {
    const { user, profile, logout, updateProfile } = useAuth();
    const gamification = useGamification() || {};
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: profile?.name || '',
        age: profile?.age || '',
        profession: profile?.profession || '',
        goal: profile?.goal || ''
    });

    if (!user) return null;

    const handleSave = async () => {
        try {
            await updateProfile({
                ...editForm,
                updatedAt: new Date().toISOString()
            });
            setIsEditing(false);
        } catch (err) {
            console.error("Profile update error:", err);
            alert(`Failed to update profile: ${err.message || 'Unknown error'}`);
        }
    };

    // Placeholder data for futuristic UI
    const accuracy = 94;
    const fastestDebug = "1.2s";
    const challengesCompleted = Object.keys(gamification?.completedMissions || {}).length * 3 + 12; // Just a mock multiplier
    const linesOfCode = challengesCompleted * 124;

    // Mock heatmap data (30 days)
    const heatmapDays = Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 4));

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <h2 style={styles.title}>Neural Profile</h2>
                    <p style={styles.subtitle}>System Identification & Statistics</p>
                </div>
                <div style={styles.headerRight}>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="profile-scroll-container" style={styles.content}>
                
                {/* Top Row: Hero & Personal Info */}
                <div style={styles.gridTop}>
                    {/* Hero Card */}
                    <div className="futuristic-card hero-card">
                        <div style={styles.heroLayout}>
                            <div className={`avatar-glow-ring ${gamification.level >= 10 ? 'elite' : ''}`}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" style={styles.avatarImg} />
                                ) : (
                                    <UserIcon size={64} color="#fff" />
                                )}
                            </div>
                            <div style={styles.heroDetails}>
                                <h3 style={styles.heroName}>{profile?.name || user.displayName || 'Anonymous Coder'}</h3>
                                <div style={styles.badgeRow}>
                                    <span style={styles.rankBadge}><Trophy size={12} style={{marginRight:'4px'}}/> {gamification.rank || 'Bronze Scripter'}</span>
                                    <span style={styles.verificationBadge}>
                                        <ShieldCheck size={14} /> System Verified
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.xpSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                                <span style={{ color: 'var(--color-primary)' }}>LEVEL {gamification.level || 1}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{gamification.xp || 0} / {gamification.nextLevelXP || 100} XP</span>
                            </div>
                            <div style={styles.xpBarBg}>
                                <div className="xp-bar-fill-animated" style={{ width: `${gamification.progressPercent || 0}%` }}></div>
                            </div>
                        </div>

                        <div style={styles.quickStatsRow}>
                            <div style={styles.quickStat}>
                                <Flame size={18} color="#f59e0b" />
                                <div>
                                    <div style={styles.quickStatValue}>{gamification.streak || 0}</div>
                                    <div style={styles.quickStatLabel}>Day Streak</div>
                                </div>
                            </div>
                            <div style={styles.quickStat}>
                                <Star size={18} color="var(--color-primary)" />
                                <div>
                                    <div style={styles.quickStatValue}>{gamification.xp || 0}</div>
                                    <div style={styles.quickStatLabel}>Total XP</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Identity Matrix (Edit Profile) */}
                    <div className="futuristic-card">
                        <div style={styles.cardHeader}>
                            <h4 style={styles.cardTitle}><User size={18} /> Identity Matrix</h4>
                            {!isEditing && (
                                <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                                    <Edit3 size={14} /> Edit
                                </button>
                            )}
                        </div>

                        <div style={styles.detailGrid}>
                            <div style={styles.detailItem}>
                                <Mail size={16} style={styles.detailIcon} />
                                <div style={styles.detailValue}>
                                    <span style={styles.detailLabel}>Email Signature</span>
                                    <span style={styles.detailData}>{user.email}</span>
                                </div>
                            </div>
                            <div style={styles.detailItem}>
                                <Briefcase size={16} style={styles.detailIcon} />
                                <div style={styles.detailValue}>
                                    <span style={styles.detailLabel}>Designation</span>
                                    {isEditing ? (
                                        <input className="cyber-input" value={editForm.profession} onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })} />
                                    ) : (
                                        <span style={styles.detailData}>{profile?.profession || 'Not set'}</span>
                                    )}
                                </div>
                            </div>
                            <div style={styles.detailItem}>
                                <Calendar size={16} style={styles.detailIcon} />
                                <div style={styles.detailValue}>
                                    <span style={styles.detailLabel}>System Age</span>
                                    {isEditing ? (
                                        <input type="number" className="cyber-input" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
                                    ) : (
                                        <span style={styles.detailData}>{profile?.age || 'Not set'} cycles</span>
                                    )}
                                </div>
                            </div>
                            <div style={styles.detailItem}>
                                <Target size={16} style={styles.detailIcon} />
                                <div style={styles.detailValue}>
                                    <span style={styles.detailLabel}>Primary Directive</span>
                                    {isEditing ? (
                                        <textarea className="cyber-input" style={{height:'60px'}} value={editForm.goal} onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })} />
                                    ) : (
                                        <span style={styles.detailData}>{profile?.goal || 'Not set'}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div style={styles.editActions}>
                                <button style={styles.saveBtn} onClick={handleSave}><Save size={16} /> Sync</button>
                                <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>Abort</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Row: Analytics & Mastery */}
                <div style={styles.gridMiddle}>
                    <div className="futuristic-card">
                        <div style={styles.cardHeader}>
                            <h4 style={styles.cardTitle}><Activity size={18} /> Combat Statistics</h4>
                        </div>
                        <div style={styles.statsGrid}>
                            <div className="stat-box">
                                <Target size={24} color="#10b981" />
                                <div className="stat-box-value">{accuracy}%</div>
                                <div className="stat-box-label">Syntax Accuracy</div>
                            </div>
                            <div className="stat-box">
                                <Zap size={24} color="#f59e0b" />
                                <div className="stat-box-value">{fastestDebug}</div>
                                <div className="stat-box-label">Fastest Debug</div>
                            </div>
                            <div className="stat-box">
                                <CheckCircle2 size={24} color="var(--color-primary)" />
                                <div className="stat-box-value">{challengesCompleted}</div>
                                <div className="stat-box-label">Missions Cleared</div>
                            </div>
                            <div className="stat-box">
                                <Code2 size={24} color="#8b5cf6" />
                                <div className="stat-box-value">{linesOfCode}</div>
                                <div className="stat-box-label">Lines Compiled</div>
                            </div>
                        </div>
                    </div>

                    <div className="futuristic-card">
                        <div style={styles.cardHeader}>
                            <h4 style={styles.cardTitle}><Code2 size={18} /> Language Mastery</h4>
                        </div>
                        <div style={styles.masteryList}>
                            <div style={styles.masteryItem}>
                                <div style={styles.masteryHeader}>
                                    <span style={{fontWeight:'bold'}}>Python 3</span>
                                    <span style={{color:'var(--color-primary)'}}>Level 8</span>
                                </div>
                                <div style={styles.xpBarBg}><div className="xp-bar-fill-animated" style={{ width: '85%' }}></div></div>
                            </div>
                            <div style={styles.masteryItem}>
                                <div style={styles.masteryHeader}>
                                    <span style={{fontWeight:'bold'}}>SQL (SQLite)</span>
                                    <span style={{color:'#f59e0b'}}>Level 4</span>
                                </div>
                                <div style={styles.xpBarBg}><div className="xp-bar-fill-animated" style={{ width: '42%', backgroundColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Achievements & Heatmap */}
                <div style={styles.gridBottom}>
                    <div className="futuristic-card">
                        <div style={styles.cardHeader}>
                            <h4 style={styles.cardTitle}><Award size={18} /> Achievement Matrix</h4>
                        </div>
                        <div style={styles.badgesGrid}>
                            {ACHIEVEMENTS && Object.values(ACHIEVEMENTS).map((ach) => {
                                const isUnlocked = gamification.unlockedAchievements && gamification.unlockedAchievements[ach.id];
                                return (
                                    <div 
                                        key={ach.id} 
                                        className={`skill-badge ${isUnlocked ? 'earned' : 'locked'} ${ach.rarity}`}
                                        title={`${ach.title}: ${ach.desc} (${ach.rarity.toUpperCase()} | +${ach.xp} XP)`}
                                    >
                                        <div className="ach-icon-wrapper">
                                            {ach.rarity === 'legendary' ? <Trophy size={20} /> :
                                             ach.rarity === 'epic' ? <Zap size={20} /> :
                                             ach.rarity === 'rare' ? <Award size={20} /> :
                                             <Star size={20} />}
                                        </div>
                                        <span className="ach-title-label">{ach.title}</span>
                                        {!isUnlocked && <span className="ach-locked-hint">🔒 locked</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="futuristic-card">
                        <div style={styles.cardHeader}>
                            <h4 style={styles.cardTitle}><Clock size={18} /> 30-Day Activity Heatmap</h4>
                        </div>
                        <div className="heatmap-grid">
                            {heatmapDays.map((val, i) => (
                                <div key={i} className={`heatmap-cell intensity-${val}`} title={`Activity level: ${val}`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button className="btn-cyber-danger" onClick={logout}>
                        <LogOut size={16} /> Terminate Connection
                    </button>
                </div>
            </div>

            <style>{`
                .profile-scroll-container {
                    overflow-y: auto;
                    height: calc(100% - 80px);
                }
                
                .profile-scroll-container::-webkit-scrollbar {
                    width: 6px;
                }
                .profile-scroll-container::-webkit-scrollbar-thumb {
                    background: var(--bg-tertiary);
                    border-radius: 4px;
                }

                .futuristic-card {
                    background: linear-gradient(145deg, var(--bg-secondary), rgba(0,0,0,0.2));
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(10px);
                    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .futuristic-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 2px;
                    background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .futuristic-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
                    border-color: rgba(59, 130, 246, 0.3);
                }

                .futuristic-card:hover::before {
                    opacity: 1;
                }

                .hero-card {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, var(--bg-secondary) 100%);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                }

                .avatar-glow-ring {
                    width: 80px; height: 80px;
                    border-radius: 24px;
                    padding: 4px;
                    background: linear-gradient(45deg, var(--color-primary), #3b82f6);
                }
                .avatar-glow-ring.elite {
                    background: linear-gradient(45deg, #f59e0b, #ec4899, #a855f7, #3b82f6);
                    animation: spin-glow 3s linear infinite;
                    box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
                }

                @keyframes spin-glow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }

                .xp-bar-fill-animated {
                    height: 100%;
                    background: linear-gradient(90deg, var(--color-primary), #60a5fa);
                    box-shadow: 0 0 12px var(--color-primary);
                    border-radius: 4px;
                    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .xp-bar-fill-animated::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; bottom: 0; right: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transform: translateX(-100%);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }

                .cyber-input {
                    width: 100%;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 8px 12px;
                    color: var(--text-primary);
                    font-size: 14px;
                    font-family: var(--font-mono);
                    outline: none;
                    transition: all 0.2s;
                }
                .cyber-input:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .stat-box {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    transition: all 0.2s;
                }
                .stat-box:hover {
                    background: var(--bg-hover);
                    transform: scale(1.02);
                }
                .stat-box-value {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 8px 0 4px 0;
                    color: var(--text-primary);
                }
                .stat-box-label {
                    font-size: 11px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .skill-badge {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 12px 8px;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-tertiary);
                    font-size: 11px;
                    font-weight: bold;
                    text-align: center;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                    cursor: help;
                }
                .skill-badge.earned {
                    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.02);
                }
                .skill-badge.earned:hover {
                    transform: translateY(-4px);
                }
                
                /* Rarity Gradients & Glows */
                .skill-badge.earned.common {
                    border-color: rgba(16, 185, 129, 0.4);
                    background: linear-gradient(145deg, rgba(16, 185, 129, 0.05), var(--bg-tertiary));
                    color: #10b981;
                }
                .skill-badge.earned.common:hover {
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
                }
                
                .skill-badge.earned.rare {
                    border-color: rgba(59, 130, 246, 0.4);
                    background: linear-gradient(145deg, rgba(59, 130, 246, 0.05), var(--bg-tertiary));
                    color: #3b82f6;
                }
                .skill-badge.earned.rare:hover {
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
                }
                
                .skill-badge.earned.epic {
                    border-color: rgba(139, 92, 246, 0.4);
                    background: linear-gradient(145deg, rgba(139, 92, 246, 0.05), var(--bg-tertiary));
                    color: #8b5cf6;
                    animation: epic-pulse 4s infinite alternate;
                }
                .skill-badge.earned.epic:hover {
                    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
                }
                
                .skill-badge.earned.legendary {
                    border-color: rgba(245, 158, 11, 0.5);
                    background: linear-gradient(145deg, rgba(245, 158, 11, 0.08), var(--bg-tertiary));
                    color: #f59e0b;
                    animation: legendary-pulse 2.5s infinite alternate;
                }
                .skill-badge.earned.legendary:hover {
                    box-shadow: 0 6px 25px rgba(245, 158, 11, 0.45);
                }
                
                .skill-badge.locked {
                    opacity: 0.25;
                    filter: grayscale(1);
                    border-style: dashed;
                }

                .ach-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.15);
                    margin-bottom: 2px;
                }
                
                .ach-title-label {
                    font-size: 11px;
                    color: var(--text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }

                .ach-locked-hint {
                    font-size: 8px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    letter-spacing: 0.5px;
                }

                @keyframes epic-pulse {
                    0% { box-shadow: 0 0 2px rgba(139, 92, 246, 0.1); }
                    100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.2); }
                }

                @keyframes legendary-pulse {
                    0% { box-shadow: 0 0 4px rgba(245, 158, 11, 0.2); }
                    100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
                }

                .heatmap-grid {
                    display: grid;
                    grid-template-columns: repeat(10, 1fr);
                    gap: 4px;
                }
                .heatmap-cell {
                    aspect-ratio: 1;
                    border-radius: 4px;
                    background-color: var(--bg-tertiary);
                    transition: all 0.2s;
                }
                .heatmap-cell:hover {
                    transform: scale(1.2);
                    z-index: 2;
                }
                .intensity-1 { background-color: rgba(16, 185, 129, 0.3); }
                .intensity-2 { background-color: rgba(16, 185, 129, 0.6); }
                .intensity-3 { background-color: rgba(16, 185, 129, 1); box-shadow: 0 0 8px rgba(16,185,129,0.5); }

                .btn-cyber-danger {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: bold;
                    display: flex;
                    alignItems: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-cyber-danger:hover {
                    background: #ef4444;
                    color: #fff;
                    box-shadow: 0 0 16px rgba(239, 68, 68, 0.4);
                }

                @media (max-width: 768px) {
                    .profile-grid-top, .profile-grid-middle, .profile-grid-bottom {
                        grid-template-columns: 1fr !important;
                    }
                    .hero-layout {
                        flex-direction: column;
                        text-align: center;
                    }
                    .badge-row {
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

const UserIcon = ({ size, color }) => (
    <div style={{
        width: '100%', height: '100%',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
        <User size={size * 0.6} color={color} />
    </div>
);

const styles = {
    container: {
        height: '100%',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '24px 32px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        margin: 0,
        background: 'linear-gradient(90deg, var(--color-primary), #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        color: 'var(--text-muted)',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        margin: '4px 0 0 0',
    },
    closeBtn: {
        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s'
    },
    content: {
        padding: '32px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    gridTop: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '24px',
        className: 'profile-grid-top'
    },
    gridMiddle: {
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '24px',
        className: 'profile-grid-middle'
    },
    gridBottom: {
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '24px',
        className: 'profile-grid-bottom'
    },
    heroLayout: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '32px'
    },
    avatarImg: {
        width: '100%', height: '100%',
        objectFit: 'cover',
        borderRadius: '20px'
    },
    heroName: {
        fontSize: '28px',
        fontWeight: '800',
        margin: '0 0 12px 0',
        letterSpacing: '-0.5px'
    },
    badgeRow: {
        display: 'flex',
        gap: '12px',
        className: 'badge-row'
    },
    rankBadge: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: 'var(--color-primary)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        padding: '6px 12px',
        borderRadius: '20px',
    },
    verificationBadge: {
        display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '12px', color: '#10b981', fontWeight: '600'
    },
    xpSection: {
        marginBottom: '24px'
    },
    xpBarBg: {
        height: '8px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
    },
    quickStatsRow: {
        display: 'flex', gap: '24px'
    },
    quickStat: {
        display: 'flex', alignItems: 'center', gap: '12px'
    },
    quickStatValue: {
        fontSize: '20px', fontWeight: '800'
    },
    quickStatLabel: {
        fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold'
    },
    cardHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'
    },
    cardTitle: {
        fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)'
    },
    editBtn: {
        background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)',
        padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
    },
    detailGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'
    },
    detailItem: {
        display: 'flex', gap: '12px', alignItems: 'flex-start'
    },
    detailIcon: {
        color: 'var(--color-primary)', marginTop: '2px'
    },
    detailValue: {
        display: 'flex', flexDirection: 'column', gap: '6px', width: '100%'
    },
    detailLabel: {
        fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold'
    },
    detailData: {
        fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500'
    },
    editActions: {
        display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)'
    },
    saveBtn: {
        backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', padding: '8px 24px',
        borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
    },
    cancelBtn: {
        background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)',
        padding: '8px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
    },
    masteryList: {
        display: 'flex', flexDirection: 'column', gap: '24px'
    },
    masteryItem: {
        display: 'flex', flexDirection: 'column', gap: '8px'
    },
    masteryHeader: {
        display: 'flex', justifyContent: 'space-between', fontSize: '14px'
    },
    badgesGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px'
    }
};

export default Profile;
