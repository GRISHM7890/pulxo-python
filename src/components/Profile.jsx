import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Briefcase, Target, LogOut, Edit3, Save, X, Github, Mail, ShieldCheck } from 'lucide-react';

const Profile = ({ onClose }) => {
    const { user, profile, logout, updateProfile } = useAuth();
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

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <h2 style={styles.title}>My Profile</h2>
                    <p style={styles.subtitle}>Manage your student identity & data</p>
                </div>
                <div style={styles.headerRight}>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div style={styles.content}>
                {/* Profile Card */}
                <div style={styles.card}>
                    <div style={styles.profileHero}>
                        <div style={styles.avatarLarge}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" style={styles.avatarImg} />
                            ) : (
                                <UserIcon size={40} color="#fff" />
                            )}
                        </div>
                        <div style={styles.heroInfo}>
                            <h3 style={styles.heroName}>{profile?.name || user.displayName || 'Py Compiler X Student'}</h3>
                            <div style={styles.badgeRow}>
                                <span style={styles.roleBadge}>Logic Warrior</span>
                                <span style={styles.verificationBadge}>
                                    <ShieldCheck size={12} /> Verified account
                                </span>
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                style={styles.editBtn}
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit3 size={16} /> Edit Profile
                            </button>
                        )}
                    </div>

                    <div style={styles.profileDetails}>
                        <div style={styles.detailGrid}>
                            <div style={styles.detailItem}>
                                <Mail size={16} style={styles.detailIcon} />
                                <div style={styles.detailValue}>
                                    <span style={styles.detailLabel}>Email Address</span>
                                    <span style={styles.detailData}>{user.email}</span>
                                </div>
                            </div>
                            <div style={styles.detailItem}>
                                <Briefcase size={16} style={styles.detailIcon} />
                                <div style={styles.detailValue}>
                                    <span style={styles.detailLabel}>Profession</span>
                                    {isEditing ? (
                                        <input
                                            style={styles.editInput}
                                            value={editForm.profession}
                                            onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                                        />
                                    ) : (
                                        <span style={styles.detailData}>{profile?.profession || 'Not set'}</span>
                                    )}
                                </div>
                            </div>
                            <div style={styles.detailItem}>
                                <Calendar size={16} style={styles.detailIcon} />
                                <div style={styles.detailValue}>
                                    <span style={styles.detailLabel}>Student Age</span>
                                    {isEditing ? (
                                        <input
                                            style={styles.editInput}
                                            type="number"
                                            value={editForm.age}
                                            onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                                        />
                                    ) : (
                                        <span style={styles.detailData}>{profile?.age || 'Not set'} years</span>
                                    )}
                                </div>
                            </div>
                            <div style={styles.detailItem}>
                                <Target size={16} style={styles.detailIcon} />
                                <div style={styles.detailValue}>
                                    <span style={styles.detailLabel}>Learning Goal</span>
                                    {isEditing ? (
                                        <textarea
                                            style={{ ...styles.editInput, height: '60px', paddingTop: '8px' }}
                                            value={editForm.goal}
                                            onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                                        />
                                    ) : (
                                        <span style={styles.detailData}>{profile?.goal || 'Not set'}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div style={styles.editActions}>
                                <button style={styles.saveBtn} onClick={handleSave}>
                                    <Save size={16} /> Save Changes
                                </button>
                                <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dangerous Zone */}
                <div style={styles.cardDanger}>
                    <h4 style={styles.dangerTitle}>Security & Account</h4>
                    <p style={styles.dangerText}>Manage your session and account security</p>
                    <button style={styles.logoutBtn} onClick={logout}>
                        <LogOut size={16} /> Sign Out of All Devices
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserIcon = ({ size, color }) => (
    <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        margin: 0,
    },
    subtitle: {
        color: 'var(--text-muted)',
        fontSize: '14px',
        margin: '4px 0 0 0',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
    },
    content: {
        flex: 1,
        padding: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    card: {
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
    },
    profileHero: {
        padding: '32px',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        position: 'relative',
    },
    avatarLarge: {
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '4px solid var(--bg-primary)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    heroInfo: {
        flex: 1,
    },
    heroName: {
        fontSize: '22px',
        fontWeight: '700',
        margin: '0 0 8px 0',
    },
    badgeRow: {
        display: 'flex',
        gap: '8px',
    },
    roleBadge: {
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '20px',
    },
    verificationBadge: {
        fontSize: '12px',
        color: '#10b981',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    editBtn: {
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        padding: '8px 16px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: '0.2s',
    },
    profileDetails: {
        padding: '32px',
    },
    detailGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
    },
    detailItem: {
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
    },
    detailIcon: {
        color: '#52525b',
        marginTop: '2px',
    },
    detailValue: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
    },
    detailLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    detailData: {
        fontSize: '15px',
        color: 'var(--text-primary)',
        fontWeight: '500',
    },
    editInput: {
        width: '100%',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '8px 12px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
    },
    editActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-color)',
    },
    saveBtn: {
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '10px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
    },
    cancelBtn: {
        backgroundColor: 'transparent',
        color: 'var(--text-muted)',
        border: '1px solid var(--border-color)',
        padding: '10px 20px',
        borderRadius: '10px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    cardDanger: {
        padding: '24px 32px',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.1)',
        borderRadius: '24px',
    },
    dangerTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#ef4444',
        margin: '0 0 4px 0',
    },
    dangerText: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        margin: '0 0 16px 0',
    },
    logoutBtn: {
        backgroundColor: '#ef4444',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '10px',
        fontWeight: '600',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
    }
};

export default Profile;
