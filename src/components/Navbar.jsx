import { Play, Save, Code2, LogOut, User as UserIcon, ChevronDown, Menu, Share2, Users, Flame, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import StreakDashboard from './StreakDashboard';
import { useState } from 'react';

const Navbar = ({ theme, onThemeChange, onMenuToggle, isMobile, onRun, isRunning, activeTab, onTabChange, onSaveNote, onOpenAuth, roomId, activeUsers, isSidebarOpen }) => {
    const { user, profile, logout } = useAuth();
    const gamification = useGamification() || {};
    const [showStreakPopover, setShowStreakPopover] = useState(false);
    const tabs = ['Dashboard', 'Editor', 'Practice', 'Library', 'Gamified Learning', 'Profile'];
    const level = gamification.level || 1;

    const handleThemeSelect = (e) => {
        const val = e.target.value;
        onThemeChange(val);
    };

    return (
        <nav className="navbar-responsive" style={styles.nav}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                <label className="burger" htmlFor="burger" style={{ marginRight: '4px' }}>
                    <input 
                        type="checkbox" 
                        id="burger" 
                        checked={isSidebarOpen} 
                        onChange={onMenuToggle} 
                    />
                    <span />
                    <span />
                    <span />
                </label>
                <div style={styles.logoContainer} onClick={() => onTabChange('Editor')}>
                    <div style={styles.logoIcon}>
                        <Code2 size={24} color="var(--bg-secondary)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={styles.logoText}>higgsfield</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 'bold', marginLeft: '2px', whiteSpace: 'nowrap' }}>FOR CBSE 12TH</span>
                    </div>
                </div>
            </div>

            <div className="language-selector-responsive" style={styles.languageSelector}>
                <div style={styles.selectWrapper}>
                    <select
                        className="select-responsive"
                        style={styles.select}
                        value={activeTab === 'Practice' ? 'Python' : (window.selectedLanguage || 'Python')}
                        onChange={(e) => window.onLanguageChange && window.onLanguageChange(e.target.value)}
                    >
                        <option value="Python">Python</option>
                        <option value="SQL">SQL (DBMS)</option>
                    </select>
                    <ChevronDown size={14} className="select-icon-responsive" style={styles.selectIcon} />
                </div>
            </div>

            {!isMobile && (
                <div style={styles.tabsContainer}>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className="nav-tab-button"
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab ? styles.activeTab : {})
                            }}
                            onClick={() => onTabChange(tab)}
                        >
                            {tab === 'Gamified Learning' ? 'Gamify' : tab}
                        </button>
                    ))}
                </div>
            )}

            <div className="actions-container-responsive" style={styles.actionsContainer}>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* XP and Level Info */}
                        {!isMobile && gamification.level && (
                            <div className="xp-container-responsive" style={styles.xpContainer}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                    <span>LVL {gamification.level}</span>
                                    <span style={{ color: 'var(--color-primary)' }}>{gamification.rank}</span>
                                </div>
                                <div style={styles.xpBarBackground}>
                                    <div style={{ ...styles.xpBarFill, width: `${gamification.progressPercent}%` }}></div>
                                </div>
                            </div>
                        )}
                        {user && (
                            <div style={{ position: 'relative' }}>
                                <button 
                                    className={`btn-icon streak-trigger-btn ${gamification.dailyGoalCompleted ? 'completed' : 'pending'}`}
                                    onClick={() => setShowStreakPopover(!showStreakPopover)}
                                    title={gamification.dailyGoalCompleted ? "Streak active! Goal completed today!" : "Your streak is waiting! Click to view"}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '4px', 
                                        color: gamification.dailyGoalCompleted ? '#f59e0b' : 'var(--text-muted)', 
                                        fontSize: '12px', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <Flame size={18} fill={gamification.dailyGoalCompleted ? "currentColor" : "none"} className={!gamification.dailyGoalCompleted ? "pulse-flame" : ""} />
                                    <span>{gamification.streak || 0}</span>
                                    {!gamification.dailyGoalCompleted && <span className="streak-alert-dot"></span>}
                                </button>
                                {showStreakPopover && (
                                    <StreakDashboard onClose={() => setShowStreakPopover(false)} />
                                )}
                            </div>
                        )}
                        <div className="user-profile-responsive" style={styles.userProfile}>
                            <div className="user-info-responsive" style={styles.userInfo}>
                                <span style={styles.userName}>{profile?.name || user.email}</span>
                                <span style={styles.userStatus}>Student</span>
                            </div>
                            <button className="btn-icon btn" onClick={logout} title="Sign Out">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="btn btn-primary" onClick={onOpenAuth}>
                        Sign In
                    </button>
                )}

                <div style={styles.divider}></div>

                {activeTab === 'Editor' && (
                    <button
                        className="btn btn-success"
                        style={{ padding: '6px 14px', opacity: isRunning ? 0.7 : 1 }}
                        onClick={onRun}
                        disabled={isRunning}
                    >
                        <Play size={16} fill="currentColor" /> {!isMobile && (isRunning ? <span className="nav-btn-text">Running...</span> : <span className="nav-btn-text">Run</span>)}
                    </button>
                )}
                {!isMobile && (
                    <button
                        className="btn btn-primary"
                        style={{ padding: '6px 14px' }}
                        onClick={onSaveNote}
                    >
                        <Save size={16} /> <span className="nav-btn-text">Save Note</span>
                    </button>
                )}
                {/* Active Users Avatar Stack */}
                {activeUsers && Object.keys(activeUsers).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                        {Object.values(activeUsers).slice(0, 3).map((u, i) => (
                            <div 
                                key={i} 
                                title={u.name}
                                style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    backgroundColor: u.color || 'var(--color-primary)',
                                    border: '2px solid var(--bg-secondary)',
                                    marginLeft: i > 0 ? '-8px' : '0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '10px', fontWeight: 'bold', zIndex: 10 - i
                                }}
                            >
                                {u.name ? u.name.substring(0, 2).toUpperCase() : 'U'}
                            </div>
                        ))}
                        {Object.keys(activeUsers).length > 3 && (
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                backgroundColor: 'var(--bg-tertiary)', border: '2px solid var(--bg-secondary)',
                                marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 'bold', zIndex: 7
                            }}>
                                +{Object.keys(activeUsers).length - 3}
                            </div>
                        )}
                    </div>
                )}

                {/* Share Button */}
                {!isMobile && (
                    <button
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', boxShadow: 'none' }}
                        onClick={() => {
                            const id = roomId || crypto.randomUUID();
                            const url = `${window.location.origin}/?room=${id}`;
                            navigator.clipboard.writeText(url);
                            alert(`Invite link copied to clipboard!\n${url}`);
                            if (!roomId) window.location.href = url;
                        }}
                    >
                        <Share2 size={16} /> <span className="nav-btn-text">Share</span>
                    </button>
                )}

                <div style={styles.divider}></div>
                <div style={styles.selectWrapper}>
                    <select
                        className="select-responsive"
                        style={{...styles.select, minWidth: isMobile ? '80px' : '100px'}}
                        value={theme}
                        onChange={handleThemeSelect}
                    >
                        <option value="light">☀️ Light</option>
                        <option value="dark">🌙 Dark</option>
                        <option value="ocean">🌊 Ocean</option>
                        <option value="neon">⚡ Neon</option>
                        <option value="glass">🔮 Glass</option>
                        <option value="cyber">🤖 Cyber</option>
                        <option value="sunset">🌇 Sunset</option>
                        <option value="forest">🌲 Forest</option>
                        <option value="matrix">📟 Matrix</option>
                        <option value="dracula">🦇 Dracula</option>
                    </select>
                    <ChevronDown size={14} className="select-icon-responsive" style={styles.selectIcon} />
                </div>
            </div>
            <style>{`
                .pulse-flame {
                    animation: pulse-flame-anim 1.5s infinite alternate;
                }
                @keyframes pulse-flame-anim {
                    0% { filter: drop-shadow(0 0 1px rgba(239, 68, 68, 0.4)); transform: scale(1); }
                    100% { filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.8)); transform: scale(1.1); }
                }
                .streak-alert-dot {
                    position: absolute;
                    top: 2px;
                    right: -2px;
                    width: 6px;
                    height: 6px;
                    background-color: #ef4444;
                    border-radius: 50%;
                    border: 1px solid var(--bg-secondary);
                }
                .streak-trigger-btn {
                    position: relative;
                    padding: 6px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .streak-trigger-btn:hover {
                    background: var(--bg-tertiary) !important;
                }

                /* High-Fidelity Responsive Styling */
                @media (max-width: 1440px) {
                    .nav-btn-text {
                        display: none !important;
                    }
                    .xp-container-responsive {
                        display: none !important;
                    }
                    .user-info-responsive {
                        display: none !important;
                    }
                    .user-profile-responsive {
                        padding: 4px 8px !important;
                        gap: 4px !important;
                    }
                    .language-selector-responsive {
                        margin-left: 12px !important;
                    }
                    .nav-tab-button {
                        padding: 6px 12px !important;
                        font-size: 13px !important;
                    }
                }
                @media (max-width: 1200px) {
                    .nav-tab-button {
                        padding: 4px 8px !important;
                        font-size: 12px !important;
                    }
                    .navbar-responsive {
                        padding: 0 12px !important;
                    }
                    .actions-container-responsive {
                        gap: 8px !important;
                    }
                    .select-responsive {
                        padding: 4px 24px 4px 10px !important;
                        font-size: 12px !important;
                        min-width: 80px !important;
                    }
                    .select-icon-responsive {
                        right: 8px !important;
                    }
                }
            `}</style>
        </nav>
    );
};

const styles = {
    nav: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        flexShrink: 0,
    },
    logoIcon: {
        width: '36px',
        height: '36px',
        backgroundColor: 'var(--color-primary)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
    },
    logoText: {
        fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', 'Inter', sans-serif",
        fontWeight: '700',
        fontSize: '20px',
        letterSpacing: '-0.5px',
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
    },
    tabsContainer: {
        display: 'flex',
        gap: '4px',
        height: '100%',
        alignItems: 'center',
    },
    tab: {
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        fontWeight: '500',
        fontSize: '14px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    activeTab: {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--color-primary)',
        fontWeight: '600',
    },
    actionsContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
    },
    divider: {
        width: '1px',
        height: '24px',
        backgroundColor: 'var(--border-color)',
        margin: '0 4px',
    },
    userProfile: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '4px 8px 4px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    userName: {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        maxWidth: '120px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flexShrink: 0,
    },
    userStatus: {
        fontSize: '10px',
        color: 'var(--color-primary)',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    languageSelector: {
        marginLeft: '24px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    selectWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    select: {
        appearance: 'none',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '6px 32px 6px 14px',
        color: 'var(--text-primary)',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        outline: 'none',
        minWidth: '120px',
        transition: 'all 0.2s ease',
    },
    selectIcon: {
        position: 'absolute',
        right: '10px',
        pointerEvents: 'none',
        color: 'var(--text-muted)',
    },
    xpContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '120px',
        padding: '0 8px',
    },
    xpBarBackground: {
        width: '100%',
        height: '6px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: 'var(--color-primary)',
        transition: 'width 0.3s ease',
        boxShadow: '0 0 8px var(--color-primary)',
    }
};

export default Navbar;
