import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, signup, googleSignIn } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            onClose();
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await googleSignIn();
            onClose();
        } catch (err) {
            console.error("Google auth error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button onClick={onClose} style={styles.closeBtn}>
                    <X size={20} />
                </button>

                <div style={styles.content}>
                    <div style={styles.header}>
                        <h2 style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p style={styles.subtitle}>
                            {isLogin
                                ? 'Sign in to access your notes and logic assistant'
                                : 'Start your Python journey with higgsfield-1.vercel.app'}
                        </p>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <Mail size={18} style={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <Lock size={18} style={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
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
                            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div style={styles.divider}>
                        <div style={styles.line} />
                        <span style={styles.dividerText}>or continue with</span>
                        <div style={styles.line} />
                    </div>

                    <button onClick={handleGoogleSignIn} style={styles.googleBtn}>
                        <Chrome size={18} />
                        Google Account
                    </button>

                    <div style={styles.footer}>
                        <p style={styles.footerText}>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                style={styles.toggleBtn}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.3s ease-out'
    },
    modal: {
        width: '420px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-soft)'
    },
    closeBtn: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '4px',
        transition: '0.2s',
        zIndex: 1
    },
    content: {
        padding: '40px'
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px'
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '8px'
    },
    subtitle: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '12px',
        padding: '12px 16px',
        color: '#ef4444',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    inputGroup: {
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
            borderColor: 'var(--color-primary)',
            backgroundColor: 'var(--bg-hover)'
        }
    },
    submitBtn: {
        height: '48px',
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '8px',
        transition: '0.2s'
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        margin: '24px 0'
    },
    line: {
        flex: 1,
        height: '1px',
        backgroundColor: '#27272a'
    },
    dividerText: {
        fontSize: '12px',
        color: '#52525b',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    googleBtn: {
        width: '100%',
        height: '48px',
        backgroundColor: 'var(--text-primary)',
        color: 'var(--bg-primary)',
        border: 'none',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: '0.2s',
        marginBottom: '24px'
    },
    footer: {
        textAlign: 'center'
    },
    footerText: {
        fontSize: '14px',
        color: '#71717a'
    },
    toggleBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--color-primary)',
        fontWeight: '600',
        cursor: 'pointer',
        marginLeft: '4px',
        padding: 0
    }
};

export default AuthModal;
