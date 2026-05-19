import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { ai, aiModel } from '../lib/firebase';
import { getTemplateGenerativeModel, getGenerativeModel } from 'firebase/ai';

const AIAssistant = ({ currentCode, problemContext, language, isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'assistant',
            content: `Hey there! I'm your Py Compiler X ${language || 'Python'} Logic Assistant. Stuck on your ${language || 'Python'} code? Ask me anything about the logic, and I'll help you break it down!`,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentQuery = inputValue;
        setInputValue('');
        setIsLoading(true);

        try {
            // Priority 1: Use the Firebase Prompt Template "logic_tutor"
            let result;
            try {
                const template = getTemplateGenerativeModel(ai, "logic_tutor");
                result = await template.generateContent({
                    values: {
                        problem_title: problemContext.title,
                        problem_desc: problemContext.description,
                        student_code: currentCode,
                        user_query: currentQuery
                    }
                });
            } catch (templateError) {
                console.warn("Template logic failed, trying direct fallback...", templateError);

                // Array of models to try in order of preference (Bleeding edge first)
                const modelsToTry = ["gemini-3-flash-preview", "gemini-2.0-flash", "gemini-2.0-pro-exp-02-05"];
                let lastError;

                for (const modelName of modelsToTry) {
                    try {
                        const isSql = (language || 'Python').toLowerCase() === 'sql';
                        const model = getGenerativeModel(ai, { model: modelName });
                        const prompt = `
                            You are a high-precision ${isSql ? 'SQL (SQLite)' : 'Python'} Logic Assistant.
                            Problem: ${problemContext.title}
                            Context: ${problemContext.description}
                            ${isSql ? 'SQL Query' : 'Code'}: ${currentCode}
                            Question: ${currentQuery}
                            Objective: Explain the ${isSql ? 'query' : 'logic'} fix without giving the full ${isSql ? 'query' : 'code'}. Be encouraging.
                        `;
                        result = await model.generateContent(prompt);
                        if (result) break;
                    } catch (e) {
                        lastError = e;
                        console.error(`Model ${modelName} failed:`, e);
                        continue;
                    }
                }

                if (!result) throw lastError;
            }

            const response = result.response;
            const text = response.text();

            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("AI Error:", error);
            let userFriendlyMessage = `Oops! I hit a logic error: ${error.message || 'Unknown error'}.`;

            if (error.message?.includes('429') || error.message?.includes('quota')) {
                userFriendlyMessage = "We've hit the free tier limit for a moment. Please wait about 30 seconds and try again. ⏳";
            }

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: userFriendlyMessage,
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerBrand}>
                    <div style={styles.botIconWrapper}>
                        <Bot size={18} color="#fff" />
                    </div>
                    <div>
                        <h3 style={styles.headerTitle}>Logic Assistant</h3>
                        <div style={styles.statusBadge}>
                            <div style={styles.statusDot} /> Online
                        </div>
                    </div>
                </div>
                <button onClick={onClose} style={styles.closeBtn}>
                    <X size={20} />
                </button>
            </div>

            <div style={styles.chatArea}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            ...styles.messageRow,
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        {msg.role === 'assistant' && (
                            <div style={styles.avatarMini}>
                                <Sparkles size={12} color="var(--color-primary)" />
                            </div>
                        )}
                        <div style={{
                            ...styles.messageBox,
                            backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : '#27272a',
                            color: msg.role === 'user' ? '#fff' : '#e4e4e7',
                            borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                            borderBottomLeftRadius: msg.role === 'user' ? '12px' : '2px',
                        }}>
                            <div style={styles.messageContent}>{msg.content}</div>
                            {msg.isError && (
                                <div style={styles.errorBanner}>
                                    <AlertCircle size={12} /> Enable AI Logic in Firebase Console
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={styles.messageRow}>
                        <div style={styles.avatarMini}>
                            <Loader2 size={12} className="animate-spin" color="var(--color-primary)" />
                        </div>
                        <div style={styles.loadingBox}>
                            Analyzing your code...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
                <div style={styles.inputWrapper}>
                    <input
                        style={styles.input}
                        placeholder="Ask about your code logic..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        style={{
                            ...styles.sendBtn,
                            opacity: (!inputValue.trim() || isLoading) ? 0.5 : 1,
                            cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleSend}
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div style={styles.footerNote}>
                    Step-by-step logic powered by Py Compiler X AI
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '360px',
        height: '500px',
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--border-color)',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out'
    },
    header: {
        padding: '16px',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerBrand: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    botIconWrapper: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTitle: {
        margin: 0,
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    statusBadge: {
        fontSize: '10px',
        color: '#71717a',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    statusDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#22c55e'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#71717a',
        cursor: 'pointer',
        padding: '4px'
    },
    chatArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    messageRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px'
    },
    avatarMini: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '4px'
    },
    messageBox: {
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '13px',
        lineHeight: '1.5',
    },
    messageContent: {
        whiteSpace: 'pre-wrap'
    },
    loadingBox: {
        fontSize: '12px',
        color: '#71717a',
        fontStyle: 'italic'
    },
    errorBanner: {
        marginTop: '8px',
        fontSize: '11px',
        color: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(239, 68, 68, 0.2)'
    },
    inputArea: {
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)'
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        padding: '4px 8px 4px 16px',
        border: '1px solid var(--border-color)'
    },
    input: {
        flex: 1,
        background: 'none',
        border: 'none',
        color: 'var(--text-primary)',
        fontSize: '13px',
        outline: 'none',
        padding: '8px 0'
    },
    sendBtn: {
        background: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        padding: '6px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: '0.2s'
    },
    footerNote: {
        fontSize: '9px',
        color: '#52525b',
        textAlign: 'center',
        marginTop: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    }
};

export default AIAssistant;
