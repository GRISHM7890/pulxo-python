import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Briefcase, Target, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const ProfileSetup = () => {
    const { user, profile, updateProfile } = useAuth();
    const [name, setName] = useState(user?.displayName || '');
    const [age, setAge] = useState('');
    const [profession, setProfession] = useState('');
    const [goal, setGoal] = useState('');
    const [loading, setLoading] = useState(false);

    // If profile already exists, we shouldn't show this
    if (profile && profile.isComplete) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile({
                name,
                age,
                profession,
                goal,
                isComplete: true,
                createdAt: new Date().toISOString()
            });
        } catch (err) {
            console.error("Profile update error:", err);
            alert("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.content}>
                    <div style={styles.header}>
                        <div style={styles.iconCircle}>
                            <Sparkles size={24} color="var(--color-primary)" />
                        </div>
                        <h2 style={styles.title}>Welcome to Pulxo!</h2>
                        <p style={styles.subtitle}>Let's personalize your learning experience</p>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Your Full Name</label>
                            <div style={styles.inputWrapper}>
                                <User size={18} style={styles.inputIcon} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Age</label>
                                <div style={styles.inputWrapper}>
                                    <Calendar size={18} style={styles.inputIcon} />
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="20"
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Profession</label>
                                <div style={styles.inputWrapper}>
                                    <Briefcase size={18} style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        value={profession}
                                        onChange={(e) => setProfession(e.target.value)}
                                        placeholder="Student, Dev..."
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>What brought you here?</label>
                            <div style={styles.inputWrapper}>
                                <Target size={18} style={styles.inputIcon} />
                                <textarea
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    placeholder="e.g., Master competitive programming..."
                                    style={{ ...styles.input, height: '80px', paddingTop: '12px' }}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.submitBtn,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
    },
    modal: {
        width: '460px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        padding: '40px',
        boxShadow: 'var(--shadow-soft)'
    },
    iconCircle: {
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px'
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px'
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#fff',
        marginBottom: '8px'
    },
    subtitle: {
        fontSize: '15px',
        color: '#71717a'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-secondary)'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#52525b'
    },
    input: {
        width: '100%',
        height: '48px',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '0 16px 0 48px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        outline: 'none',
        transition: '0.2s',
        ':focus': {
            borderColor: 'var(--color-primary)'
        }
    },
    submitBtn: {
        height: '52px',
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '12px',
        transition: '0.2s',
        cursor: 'pointer'
    }
};

export default ProfileSetup;
