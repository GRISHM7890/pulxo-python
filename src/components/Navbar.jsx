import { Play, Save, Moon, Sun, Code2, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ isDarkMode, toggleTheme, onRun, isRunning, activeTab, onTabChange, onSaveNote, onOpenAuth }) => {
    const { user, profile, logout } = useAuth();
    const tabs = ['Dashboard', 'Editor', 'Practice', 'Library', 'Profile'];

    return (
        <nav style={styles.nav}>
            <div style={styles.logoContainer} onClick={() => onTabChange('Editor')}>
                <div style={styles.logoIcon}>
                    <Code2 size={24} color="var(--bg-secondary)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={styles.logoText}>PULXO IDE</span>
                    <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 'bold', marginLeft: '2px' }}>FOR CBSE 12TH</span>
                </div>
            </div>

            <div style={styles.languageSelector}>
                <div style={styles.selectWrapper}>
                    <select
                        style={styles.select}
                        value={activeTab === 'Practice' ? 'Python' : (window.selectedLanguage || 'Python')}
                        onChange={(e) => window.onLanguageChange && window.onLanguageChange(e.target.value)}
                    >
                        <option value="Python">Python</option>
                        <option value="SQL">SQL (DBMS)</option>
                    </select>
                    <ChevronDown size={14} style={styles.selectIcon} />
                </div>
            </div>

            <div style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab ? styles.activeTab : {})
                        }}
                        onClick={() => onTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div style={styles.actionsContainer}>
                {user ? (
                    <div style={styles.userProfile}>
                        <div style={styles.userInfo}>
                            <span style={styles.userName}>{profile?.name || user.email}</span>
                            <span style={styles.userStatus}>Student</span>
                        </div>
                        <button className="btn-icon btn" onClick={logout} title="Sign Out">
                            <LogOut size={18} />
                        </button>
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
                        <Play size={16} fill="currentColor" /> {isRunning ? 'Running...' : 'Run'}
                    </button>
                )}
                <button
                    className="btn btn-primary"
                    style={{ padding: '6px 14px' }}
                    onClick={onSaveNote}
                >
                    <Save size={16} /> Save Note
                </button>
                <div style={styles.divider}></div>
                <button className="btn-icon btn" onClick={toggleTheme} title="Toggle Theme">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
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
        fontWeight: '700',
        fontSize: '18px',
        letterSpacing: '-0.5px',
        color: 'var(--text-primary)',
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
    }
};

export default Navbar;
