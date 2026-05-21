import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Brain, Sparkles, AlertTriangle, Play, RefreshCw, BarChart2, Eye, Compass, HelpCircle, ArrowRight, Terminal, User, BookOpen } from 'lucide-react';
import { db, ai } from '../lib/firebase';
import { getGenerativeModel, getTemplateGenerativeModel } from 'firebase/ai';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { PROBLEMS } from '../data/problems';

const CORE_CATEGORIES = [
    { id: 'basics', title: 'Basics & Syntax', challenges: ['v1', 'v2', 'v3'], topicKey: 'B1: Basics' },
    { id: 'conditionals', title: 'Conditionals', challenges: ['c1', 'c2', 'c3', 'c4'], topicKey: 'B2: Conditionals' },
    { id: 'loops', title: 'Loops & Flows', challenges: ['l1', 'l2', 'l3', 'l4'], topicKey: 'B3: Loops' },
    { id: 'functions', title: 'Functions & Scope', challenges: ['f1', 'f2'], topicKey: 'B6: Functions' },
    { id: 'oop', title: 'OOP Calibration', challenges: ['oop1', 'oop2'], topicKey: 'B8: OOP' },
    { id: 'data_structures', title: 'Data Structures', challenges: ['s1', 's2', 's3', 'li1', 'li2'], topicKey: 'B4: Strings' },
    { id: 'apis', title: 'APIs & JSON', challenges: ['api1', 'api2'], topicKey: 'B9: APIs & JSON' },
    { id: 'automation', title: 'Automation & Files', challenges: ['fh1'], topicKey: 'B7: File Handling' },
    { id: 'ai_ml', title: 'AI & ML Basics', challenges: ['ai1', 'ai2'], topicKey: 'B10: AI & ML Basics' }
];

const AITutor = ({ initialErrorCode = '', activeProblems = [], onClose, codeContext = '', language = 'Python' }) => {
    const { user } = useAuth();
    const [solvedIds, setSolvedIds] = useState([]);
    const [activeSection, setActiveSection] = useState('chat'); // 'chat' | 'visualizer'
    const [selectedConcept, setSelectedConcept] = useState('variables'); // 'variables' | 'loops' | 'oop' | 'api'
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'assistant',
            content: "Greetings, cadet! I am PULXO-TUTOR, your cybernetic coding mentor. I operate in Socratic Calibration Mode. I will give you logical hints, explain compiler warnings, and visualize concepts, but I will never write the direct solutions for you. Let's calibrate your intelligence logic vector together!",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [avatarState, setAvatarState] = useState('idle'); // 'idle' | 'thinking' | 'alert' | 'happy'
    const [voiceWaveLevel, setVoiceWaveLevel] = useState(new Array(10).fill(2));
    const messagesEndRef = useRef(null);

    // Concept state for interactive visualizers
    // 1. Variable Registers State
    const [varInputName, setVarInputName] = useState('message');
    const [varInputValue, setVarInputValue] = useState('Hello World');
    const [varRegisters, setVarRegisters] = useState([
        { addr: '0x3A01', name: 'x', val: '42', type: 'int' },
        { addr: '0x3A05', name: 'score', val: '99', type: 'int' },
        { addr: '0x3A0C', name: 'is_active', val: 'True', type: 'bool' }
    ]);

    // 2. Loop Control State
    const [loopIndex, setLoopIndex] = useState(-1);
    const [loopHistory, setLoopHistory] = useState([]);
    const loopMax = 5;

    // 3. API Payload State
    const [apiMethod, setApiMethod] = useState('GET');
    const [apiStatus, setApiStatus] = useState('Idle');
    const [apiResponse, setApiResponse] = useState(null);

    // Dynamic telemetry calculations
    useEffect(() => {
        if (!user) return;
        const solvedRef = ref(db, `users/${user.uid}/progress/solved`);
        const unsubscribe = onValue(solvedRef, (snapshot) => {
            const data = snapshot.val() || [];
            setSolvedIds(data);
        });
        return () => unsubscribe();
    }, [user]);

    // Handle initial error triggers passed by Logic Buddy
    useEffect(() => {
        if (initialErrorCode) {
            setAvatarState('alert');
            const alertMsg = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ [Compiler Anomalies Detected]\nI noticed your last run encountered compile or logical anomalies. \n\n**Flaws identified:**\n${activeProblems.map(p => `• Line ${p.line}: ${p.message}`).join('\n')}\n\nAsk me for a conceptual hint, and I will guide you to resolve this without giving away the raw fix code!`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, alertMsg]);
        }
    }, [initialErrorCode, activeProblems]);

    // Blinking voice wave animation during loading
    useEffect(() => {
        let interval;
        if (isLoading || avatarState === 'thinking') {
            interval = setInterval(() => {
                setVoiceWaveLevel(new Array(10).fill(0).map(() => Math.floor(Math.random() * 12) + 2));
            }, 100);
        } else {
            setVoiceWaveLevel(new Array(10).fill(2));
        }
        return () => clearInterval(interval);
    }, [isLoading, avatarState]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Telemetry data calculation
    const getTelemetryMetrics = () => {
        return CORE_CATEGORIES.map(cat => {
            const total = cat.challenges.length;
            const completed = cat.challenges.filter(id => solvedIds.includes(id)).length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return {
                ...cat,
                total,
                completed,
                pct
            };
        });
    };

    const telemetryMetrics = getTelemetryMetrics();
    const lowestTopic = [...telemetryMetrics].sort((a, b) => a.pct - b.pct)[0];

    // AI Query Execution
    const handleSend = async (customQuery = '') => {
        const queryText = (customQuery || inputValue).trim();
        if (!queryText || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: queryText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        if (!customQuery) setInputValue('');
        setIsLoading(true);
        setAvatarState('thinking');

        try {
            let result;
            // Array of models to try in order of preference (Bleeding edge first)
            const modelsToTry = ["gemini-3-flash-preview", "gemini-2.0-flash", "gemini-2.0-pro-exp-02-05"];
            let lastError;

            // Generate System Context Prompt for Socratic Coding Mentor
            const isSql = language.toLowerCase() === 'sql';
            const socraticPrompt = `
You are PULXO-TUTOR, an advanced, highly intelligent cybernetic socratic coding tutor.
Your personality is supportive, clever, encouraging, futuristic, and friendly. Use occasional cyber/robotic vocabulary ("calibration", "matrices", "nodes", "logical vector").
LANGUAGE TARGET: ${language}

CRITICAL RULES:
1. NEVER output a full working code solution or copy-paste code blocks that completely solve the student's problem.
2. If the user asks you for direct code, explain the CONCEPT and provide a structural hint or analogy instead.
3. If they show you an error, translate it into standard simple English. Explain the "why" simply, then prompt them with a leading question.
4. Support explanations using structured markdown, conceptual analogies, and compact ASCII diagrams/tables when helpful.
5. Keep paragraphs short and easy to digest. Use bullet points for steps.

ACTIVE WORKSPACE CONTEXT:
Code currently in editor:
\`\`\`${language.toLowerCase()}
${codeContext}
\`\`\`

USER ERROR LOGS (If applicable):
${activeProblems.map(p => `Line ${p.line}: ${p.message}`).join('\n')}

USER QUESTION:
${queryText}
`;

            for (const modelName of modelsToTry) {
                try {
                    const model = getGenerativeModel(ai, { model: modelName });
                    result = await model.generateContent(socraticPrompt);
                    if (result) break;
                } catch (e) {
                    lastError = e;
                    console.error(`Model ${modelName} failed:`, e);
                    continue;
                }
            }

            if (!result) throw lastError;

            const response = result.response;
            const text = response.text();

            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setAvatarState('happy');
            setTimeout(() => setAvatarState('idle'), 2000);
        } catch (error) {
            console.error("Tutor AI Exception:", error);
            let errMsgText = `Apologies, I encountered a communication buffer overflow: ${error.message || 'Calibration failure'}.`;
            if (error.message?.includes('429') || error.message?.includes('quota')) {
                errMsgText = "System quota rate-limit exceeded. Please wait 15 seconds for secondary node cooling before querying again. ⏳";
            }
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: errMsgText,
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, assistantMessage]);
            setAvatarState('idle');
        } finally {
            setIsLoading(false);
        }
    };

    // Quick Action Triggers
    const handleQuickAction = (actionType) => {
        if (actionType === 'explain_error') {
            if (activeProblems.length === 0) {
                handleSend("Explain to me how syntax rules work in Python simply.");
            } else {
                handleSend(`Explain my active errors simply without giving the code answer:\n${activeProblems.map(p => p.message).join('\n')}`);
            }
        } else if (actionType === 'weakness_hint') {
            handleSend(`Give me a conceptual socratic hint on my weakest area: ${lowestTopic?.title || 'Basics'}. What is it and how should I think about it?`);
        } else if (actionType === 'explain_visual') {
            setActiveSection('visualizer');
        }
    };

    // Concept Visualizer Functions
    // 1. Memory variable register push
    const handleAddVariable = () => {
        if (!varInputName.trim()) return;
        const newAddr = '0x' + (Math.floor(Math.random() * 60000) + 4000).toString(16).toUpperCase();
        let dataType = 'str';
        if (!isNaN(varInputValue)) dataType = 'int';
        if (varInputValue.toLowerCase() === 'true' || varInputValue.toLowerCase() === 'false') dataType = 'bool';

        setVarRegisters(prev => [
            { addr: newAddr, name: varInputName, val: varInputValue, type: dataType },
            ...prev.slice(0, 5)
        ]);
        setVarInputName('');
        setVarInputValue('');
    };

    // 2. Loop Stepper simulation
    const handleStepLoop = () => {
        if (loopIndex >= loopMax - 1) {
            setLoopIndex(-1);
            setLoopHistory([]);
            return;
        }
        const nextIdx = loopIndex + 1;
        const squareVal = nextIdx * nextIdx;
        const nextHist = [...loopHistory, { i: nextIdx, output: squareVal }];
        setLoopIndex(nextIdx);
        setLoopHistory(nextHist);
    };

    // 3. API payload trigger
    const handleTriggerAPI = async () => {
        setApiStatus('Sending Packet...');
        setApiResponse(null);
        setTimeout(() => {
            setApiStatus('Server Responded (200 OK)');
            if (apiMethod === 'GET') {
                setApiResponse({
                    status: 'success',
                    data: {
                        user_id: 1042,
                        calibration: 'optimal',
                        matrix_hash: '9A7BF22C',
                        nodes_online: 7
                    }
                });
            } else {
                setApiResponse({
                    status: 'created',
                    node_status: 'operational',
                    timestamp: new Date().toISOString()
                });
            }
        }, 1000);
    };

    return (
        <div style={styles.dashboardContainer} className="fadeIn">
            {/* Header section */}
            <div style={styles.header}>
                <div style={styles.headerInfo}>
                    <div style={styles.headerTitleRow}>
                        <Brain size={22} color="var(--color-primary)" style={{ animation: 'pulse 2s infinite' }} />
                        <h2 style={styles.headerTitle}>PULXO-TUTOR Cockpit</h2>
                        <span style={styles.subtextBadge}>Socratic Calibration Mode v3.1</span>
                    </div>
                    <p style={styles.headerDesc}>Your cybernetic guide to logic, diagnostics, and algorithm visualization.</p>
                </div>
                {onClose && (
                    <button style={styles.closePanelBtn} onClick={onClose}>× Close Mentor</button>
                )}
            </div>

            {/* Main content grid split */}
            <div style={styles.mainGrid}>
                {/* Left Side: Telemetry Diagnostics, Avatar, and Concepts */}
                <div style={styles.leftCol}>
                    {/* Holographic Avatar Panel */}
                    <div style={styles.cardGlass}>
                        <div style={styles.cyberGridBackground}></div>
                        <div style={styles.cardHeader}>
                            <Compass size={16} color="var(--color-primary)" />
                            <span style={styles.cardTitle}>Cybernetic Holographic Avatar</span>
                        </div>
                        <div style={styles.avatarContainer}>
                            <div style={{
                                ...styles.avatarBase,
                                borderColor: avatarState === 'alert' ? 'var(--color-error)' : avatarState === 'thinking' ? 'var(--color-primary)' : 'var(--color-success)'
                            }}>
                                {/* Cyber Scanlines */}
                                <div style={styles.avatarScanlines}></div>
                                
                                {/* Orbit Arc Rings */}
                                <div style={{
                                    ...styles.avatarOrbitRing,
                                    animation: 'spin 10s linear infinite',
                                    borderColor: avatarState === 'alert' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                                }}></div>

                                {/* Blinking Neon Eyes */}
                                <div style={styles.avatarEyesRow}>
                                    <div style={{
                                        ...styles.avatarEye,
                                        backgroundColor: avatarState === 'alert' ? 'var(--color-error)' : 'var(--color-success)',
                                        height: avatarState === 'thinking' ? '3px' : '10px'
                                    }}></div>
                                    <div style={{
                                        ...styles.avatarEye,
                                        backgroundColor: avatarState === 'alert' ? 'var(--color-error)' : 'var(--color-success)',
                                        height: avatarState === 'thinking' ? '3px' : '10px'
                                    }}></div>
                                </div>

                                {/* Cybernetic mouth grid */}
                                <div style={styles.avatarMouthGrid}>
                                    <div style={{
                                        ...styles.avatarMouthGridLine,
                                        backgroundColor: avatarState === 'alert' ? 'var(--color-error)' : 'var(--color-success)'
                                    }}></div>
                                </div>
                            </div>

                            {/* Voice Audio Wave Visualizer */}
                            <div style={styles.audioWaveContainer}>
                                {voiceWaveLevel.map((level, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            ...styles.audioWaveBar,
                                            height: `${level * 2}px`,
                                            backgroundColor: avatarState === 'alert' ? 'var(--color-error)' : avatarState === 'thinking' ? 'var(--color-primary)' : 'var(--color-success)',
                                        }}
                                    ></div>
                                ))}
                            </div>
                            
                            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                STATUS: <span style={{ color: avatarState === 'alert' ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 'bold' }}>
                                    {avatarState === 'alert' ? 'CALIBRATING ERROR TRAPS' : avatarState === 'thinking' ? 'COMPUTING CONCEPT SYMBOLS' : 'MENTOR ONLINE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Weakness Telemetry Panel */}
                    <div style={styles.cardGlass}>
                        <div style={styles.cardHeader}>
                            <BarChart2 size={16} color="var(--color-primary)" />
                            <span style={styles.cardTitle}>Intelligence Telemetry Graph</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {telemetryMetrics.map(metric => (
                                <div key={metric.id}>
                                    <div style={styles.telemetryInfoRow}>
                                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{metric.title}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {metric.completed}/{metric.total} Solved ({metric.pct}%)
                                        </span>
                                    </div>
                                    <div style={styles.telemetryProgressBackground}>
                                        <div style={{
                                            ...styles.telemetryProgressFill,
                                            width: `${metric.pct}%`,
                                            backgroundColor: metric.pct < 40 ? 'var(--color-error)' : metric.pct < 80 ? '#f59e0b' : 'var(--color-success)'
                                        }}></div>
                                    </div>
                                </div>
                            ))}

                            {/* Weakness recommendations */}
                            {lowestTopic && (
                                <div style={styles.telemetryRecommendation}>
                                    <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Target Practice Focus Required</div>
                                        <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            Category **{lowestTopic.title}** displays the lowest calibrator strength ({lowestTopic.pct}%).
                                        </p>
                                        <button 
                                            style={styles.suggestionActionBtn} 
                                            onClick={() => handleQuickAction('weakness_hint')}
                                        >
                                            Diagnose Weakness Concepts <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Tab panel toggling Socratic Chat & Concept Visualizer */}
                <div style={styles.rightCol}>
                    {/* Navigation Tab bar */}
                    <div style={styles.tabBar}>
                        <button
                            style={activeSection === 'chat' ? styles.tabButtonActive : styles.tabButton}
                            onClick={() => setActiveSection('chat')}
                        >
                            <Bot size={16} /> Logic Guide Chat
                        </button>
                        <button
                            style={activeSection === 'visualizer' ? styles.tabButtonActive : styles.tabButton}
                            onClick={() => setActiveSection('visualizer')}
                        >
                            <Eye size={16} /> Socratic Concept Visualizer
                        </button>
                    </div>

                    {/* Content Section 1: Socratic Chat */}
                    {activeSection === 'chat' && (
                        <div style={styles.chatWrapper}>
                            {/* Message streams */}
                            <div style={styles.chatArea}>
                                {messages.map(msg => (
                                    <div key={msg.id} style={{
                                        ...styles.messageRow,
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                    }}>
                                        {msg.role === 'assistant' && (
                                            <div style={styles.avatarMini}>
                                                <Brain size={12} color="var(--color-primary)" />
                                            </div>
                                        )}
                                        <div style={{
                                            ...styles.messageBox,
                                            backgroundColor: msg.role === 'user' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary)',
                                            border: msg.role === 'user' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-color)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            <div style={styles.messageContent}>{msg.content}</div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div style={styles.messageRow}>
                                        <div style={styles.avatarMini}>
                                            <RefreshCw size={12} className="animate-spin" color="var(--color-primary)" />
                                        </div>
                                        <div style={styles.loadingBox}>
                                            Calibrating logical models...
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Prompt suggestions buttons */}
                            <div style={styles.suggestionsRow}>
                                <button style={styles.suggestionBtn} onClick={() => handleQuickAction('explain_error')}>
                                    <Terminal size={12} /> Explain active warnings
                                </button>
                                <button style={styles.suggestionBtn} onClick={() => handleQuickAction('weakness_hint')}>
                                    <HelpCircle size={12} /> Analyze Weakness Topic
                                </button>
                                <button style={styles.suggestionBtn} onClick={() => handleQuickAction('explain_visual')}>
                                    <Eye size={12} /> Visualize loops & scopes
                                </button>
                            </div>

                            {/* Chat input form */}
                            <div style={styles.inputArea}>
                                <div style={styles.inputWrapper}>
                                    <input
                                        style={styles.chatInput}
                                        placeholder="Ask me to explain concepts, suggest debug steps, or request topic hints..."
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
                                        onClick={() => handleSend()}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Section 2: Concept Visualizers */}
                    {activeSection === 'visualizer' && (
                        <div style={styles.visualizerContainer}>
                            {/* Subnav selection */}
                            <div style={styles.visualizerSubnav}>
                                <button 
                                    style={selectedConcept === 'variables' ? styles.subnavBtnActive : styles.subnavBtn}
                                    onClick={() => setSelectedConcept('variables')}
                                >
                                    Variables & Registers
                                </button>
                                <button 
                                    style={selectedConcept === 'loops' ? styles.subnavBtnActive : styles.subnavBtn}
                                    onClick={() => setSelectedConcept('loops')}
                                >
                                    Loops & Conditions
                                </button>
                                <button 
                                    style={selectedConcept === 'oop' ? styles.subnavBtnActive : styles.subnavBtn}
                                    onClick={() => setSelectedConcept('oop')}
                                >
                                    OOP Class Trees
                                </button>
                                <button 
                                    style={selectedConcept === 'api' ? styles.subnavBtnActive : styles.subnavBtn}
                                    onClick={() => setSelectedConcept('api')}
                                >
                                    APIs & Networks
                                </button>
                            </div>

                            {/* Visual Canvas Display */}
                            <div style={styles.visualCanvas}>
                                
                                {/* 1. Variables visualizer */}
                                {selectedConcept === 'variables' && (
                                    <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            💡 Variables are temporary pointers in computer RAM. Each variable maps a symbolic label to a physical address storing data values.
                                        </div>
                                        
                                        {/* Input variable simulator */}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input 
                                                style={styles.visualInput} 
                                                placeholder="Name (e.g. counter)" 
                                                value={varInputName}
                                                onChange={e => setVarInputName(e.target.value)}
                                            />
                                            <input 
                                                style={styles.visualInput} 
                                                placeholder="Value (e.g. 1)" 
                                                value={varInputValue}
                                                onChange={e => setVarInputValue(e.target.value)}
                                            />
                                            <button style={styles.visualActionBtn} onClick={handleAddVariable}>
                                                Store in RAM
                                            </button>
                                        </div>

                                        {/* Registers grid */}
                                        <div style={styles.ramGrid}>
                                            <div style={styles.ramHeader}>
                                                <span>Memory Address</span>
                                                <span>Variable Symbol</span>
                                                <span>Data Register Value</span>
                                                <span>Data Type</span>
                                            </div>
                                            {varRegisters.map((reg, index) => (
                                                <div key={index} style={styles.ramRow}>
                                                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{reg.addr}</span>
                                                    <span style={{ fontWeight: '500' }}>{reg.name}</span>
                                                    <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>"{reg.val}"</span>
                                                    <span style={styles.typeBadge}>{reg.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 2. Loops visualizer */}
                                {selectedConcept === 'loops' && (
                                    <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            💡 Loops repeat operations until a logic conditional returns `False`. Watch the index variable and growing output register evaluate in real-time.
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button style={styles.visualActionBtn} onClick={handleStepLoop}>
                                                {loopIndex >= loopMax - 1 ? 'Reset Loop Simulator' : 'Step Loop (i++)'}
                                            </button>
                                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                Simulating: `for i in range(5):`
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                                            {/* Iterator box */}
                                            <div style={{ ...styles.visualBoxSquare, flex: 1 }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Loop Index Counter</div>
                                                <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'var(--color-primary)', margin: '10px 0' }}>
                                                    {loopIndex === -1 ? 'Null' : `i = ${loopIndex}`}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    Condition: {loopIndex !== -1 && loopIndex < loopMax ? (
                                                        <span style={{ color: 'var(--color-success)' }}>{`i < 5 (True)`}</span>
                                                    ) : loopIndex >= loopMax - 1 ? (
                                                        <span style={{ color: 'var(--color-error)' }}>{`i < 5 (False -> Terminated)`}</span>
                                                    ) : 'Awaiting initialization'}
                                                </div>
                                            </div>

                                            {/* History stream */}
                                            <div style={{ ...styles.visualBoxSquare, flex: 2, justifyContent: 'flex-start', alignItems: 'stretch' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Accumulator Output Stream</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
                                                    {loopHistory.length === 0 ? (
                                                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic', padding: '10px' }}>
                                                            No steps run yet. Click "Step Loop" to watch cycles execute.
                                                        </div>
                                                    ) : (
                                                        loopHistory.map((h, index) => (
                                                            <div key={index} style={styles.historyRow}>
                                                                <span style={{ fontFamily: 'var(--font-mono)' }}>Cycle #{h.i + 1}</span>
                                                                <span style={{ color: 'var(--text-secondary)' }}>Code: `print({h.i} * {h.i})`</span>
                                                                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>Output: {h.output}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3. OOP tree visualizer */}
                                {selectedConcept === 'oop' && (
                                    <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            💡 Object-Oriented Programming models systems as objects. Classes act as blueprints. Subclasses *inherit* behaviors from parents but can override methods.
                                        </div>

                                        <div style={styles.oopTreeWrapper}>
                                            {/* Base Class Node */}
                                            <div style={styles.oopNodeBase}>
                                                <div style={styles.oopClassTag}>Base Class</div>
                                                <div style={styles.oopClassName}>Vehicle</div>
                                                <div style={styles.oopClassBody}>
                                                    <div>• attr: speed (int)</div>
                                                    <div>• method: move()</div>
                                                </div>
                                            </div>

                                            {/* Connection Line */}
                                            <div style={styles.oopConnectingLine}></div>

                                            {/* Child Classes row */}
                                            <div style={styles.oopChildRow}>
                                                <div style={styles.oopNodeChild}>
                                                    <div style={styles.oopChildTag}>Inherits from Vehicle</div>
                                                    <div style={styles.oopClassName}>Car</div>
                                                    <div style={styles.oopClassBody}>
                                                        <div>• attr: wheels = 4</div>
                                                        <div style={{ color: 'var(--color-primary)' }}>• move() [Inherited]</div>
                                                    </div>
                                                </div>

                                                <div style={styles.oopNodeChild}>
                                                    <div style={styles.oopChildTag}>Inherits from Vehicle</div>
                                                    <div style={styles.oopClassName}>Submarine</div>
                                                    <div style={styles.oopClassBody}>
                                                        <div>• attr: max_depth (m)</div>
                                                        <div style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>• move() [Overridden]</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 4. API visualizer */}
                                {selectedConcept === 'api' && (
                                    <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            💡 APIs allow different program nodes to interact across networks. A client sends a request (GET, POST), and the server processes it to send back data (JSON).
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <select 
                                                style={styles.visualSelect}
                                                value={apiMethod}
                                                onChange={e => setApiMethod(e.target.value)}
                                            >
                                                <option value="GET">GET Request (Read)</option>
                                                <option value="POST">POST Request (Write)</option>
                                            </select>
                                            <button style={styles.visualActionBtn} onClick={handleTriggerAPI}>
                                                Transmit Request Packet
                                            </button>
                                        </div>

                                        {/* Simulated client network route */}
                                        <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'stretch' }}>
                                            {/* Client Box */}
                                            <div style={styles.apiStationBox}>
                                                <div style={{ fontWeight: '500' }}>Client Program</div>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>localhost:3000</span>
                                                <div style={styles.apiMethodLabel}>{apiMethod}</div>
                                            </div>

                                            {/* Connecting Network Cable */}
                                            <div style={{ ...styles.apiStationBox, flex: 2, border: 'none', background: 'transparent' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status: {apiStatus}</div>
                                                <div style={styles.apiNetworkPipe}>
                                                    <div style={{
                                                        ...styles.apiNetworkFlowDot,
                                                        animation: apiStatus === 'Sending Packet...' ? 'flowDot 1s linear infinite' : 'none'
                                                    }}></div>
                                                </div>
                                            </div>

                                            {/* Server Box */}
                                            <div style={styles.apiStationBox}>
                                                <div style={{ fontWeight: '500' }}>REST API Server</div>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>api.pycompilerx.io</span>
                                                <div style={{
                                                    fontSize: '11px',
                                                    padding: '3px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    color: 'var(--color-success)',
                                                    marginTop: '6px'
                                                }}>200 OK</div>
                                            </div>
                                        </div>

                                        {/* Payload response window */}
                                        {apiResponse && (
                                            <div style={styles.apiResponseContainer}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                                                    Server JSON Response Stream
                                                </div>
                                                <pre style={styles.apiResponsePre}>
                                                    {JSON.stringify(apiResponse, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Embedded styles for visualizers animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.9; }
                }
                @keyframes flowDot {
                    0% { left: 0%; opacity: 1; }
                    100% { left: 95%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

const styles = {
    dashboardContainer: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflowY: 'auto',
        fontFamily: 'var(--font-sans)',
        padding: '24px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px',
        marginBottom: '20px'
    },
    headerInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    headerTitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    headerTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        margin: 0
    },
    subtextBadge: {
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '12px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: 'var(--color-primary)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    headerDesc: {
        margin: 0,
        fontSize: '13px',
        color: 'var(--text-secondary)'
    },
    closePanelBtn: {
        backgroundColor: 'var(--bg-hover)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: '0.2s'
    },
    mainGrid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '20px',
        alignItems: 'start'
    },
    leftCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    rightCol: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    cardGlass: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden'
    },
    cyberGridBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '15px 15px',
        pointerEvents: 'none'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '14px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '8px'
    },
    cardTitle: {
        fontSize: '13px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--text-secondary)'
    },
    avatarContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0'
    },
    avatarBase: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        border: '2px solid var(--color-success)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
        marginBottom: '15px'
    },
    avatarScanlines: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 4px, 6px 100%',
        borderRadius: '50%',
        pointerEvents: 'none'
    },
    avatarOrbitRing: {
        position: 'absolute',
        top: '-8px',
        left: '-8px',
        right: '-8px',
        bottom: '-8px',
        border: '1px dashed rgba(16, 185, 129, 0.2)',
        borderRadius: '50%'
    },
    avatarEyesRow: {
        display: 'flex',
        gap: '20px'
    },
    avatarEye: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-success)',
        boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
        transition: '0.1s'
    },
    avatarMouthGrid: {
        position: 'absolute',
        bottom: '22px',
        width: '40px',
        height: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarMouthGridLine: {
        width: '24px',
        height: '2px',
        backgroundColor: 'var(--color-success)',
        boxShadow: '0 0 6px rgba(16, 185, 129, 0.8)'
    },
    audioWaveContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        height: '30px',
        width: '120px'
    },
    audioWaveBar: {
        width: '3px',
        borderRadius: '2px',
        transition: 'height 0.1s'
    },
    telemetryInfoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4px'
    },
    telemetryProgressBackground: {
        height: '6px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '8px'
    },
    telemetryProgressFill: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.4s ease'
    },
    telemetryRecommendation: {
        display: 'flex',
        gap: '10px',
        padding: '12px',
        borderRadius: '10px',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        marginTop: '8px'
    },
    suggestionActionBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#f59e0b',
        fontWeight: 'bold',
        fontSize: '11px',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '6px'
    },
    tabBar: {
        display: 'flex',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)'
    },
    tabButton: {
        flex: 1,
        border: 'none',
        background: 'none',
        padding: '12px',
        color: 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: '0.2s'
    },
    tabButtonActive: {
        flex: 1,
        border: 'none',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '2px solid var(--color-primary)',
        padding: '12px',
        color: 'var(--color-primary)',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    chatWrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '400px'
    },
    chatArea: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxHeight: '380px'
    },
    messageRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px'
    },
    avatarMini: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2px'
    },
    messageBox: {
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: '13px',
        lineHeight: '1.5'
    },
    messageContent: {
        whiteSpace: 'pre-wrap'
    },
    loadingBox: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontStyle: 'italic'
    },
    suggestionsRow: {
        display: 'flex',
        gap: '8px',
        padding: '8px 16px',
        flexWrap: 'wrap',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)'
    },
    suggestionBtn: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: '0.2s'
    },
    inputArea: {
        padding: '16px',
        backgroundColor: 'var(--bg-tertiary)',
        borderTop: '1px solid var(--border-color)'
    },
    inputWrapper: {
        display: 'flex',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '4px 6px 4px 14px',
        alignItems: 'center',
        gap: '8px'
    },
    chatInput: {
        flex: 1,
        border: 'none',
        background: 'none',
        color: 'var(--text-primary)',
        fontSize: '13px',
        outline: 'none',
        padding: '8px 0'
    },
    sendBtn: {
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: '0.2s'
    },
    visualizerContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    visualizerSubnav: {
        display: 'flex',
        padding: '8px',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
        gap: '4px',
        overflowX: 'auto'
    },
    subnavBtn: {
        border: 'none',
        background: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: '0.2s'
    },
    subnavBtnActive: {
        border: 'none',
        backgroundColor: 'var(--bg-secondary)',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: 'var(--color-primary)',
        fontWeight: 'bold',
        whiteSpace: 'nowrap'
    },
    visualCanvas: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto'
    },
    visualInput: {
        flex: 1,
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        fontSize: '12px',
        borderRadius: '8px',
        padding: '8px 12px',
        outline: 'none'
    },
    visualActionBtn: {
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '8px 16px',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
    },
    ramGrid: {
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-tertiary)',
        marginTop: '10px'
    },
    ramHeader: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        padding: '10px 14px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        fontWeight: 'bold',
        fontSize: '11px',
        color: 'var(--text-secondary)'
    },
    ramRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '12px',
        alignItems: 'center'
    },
    typeBadge: {
        justifySelf: 'start',
        fontSize: '9px',
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: 'var(--color-primary)',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    visualBoxSquare: {
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '140px'
    },
    historyRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 10px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        fontSize: '11px'
    },
    oopTreeWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        gap: '10px'
    },
    oopNodeBase: {
        width: '180px',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '10px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-soft)'
    },
    oopClassTag: {
        fontSize: '9px',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        color: 'var(--text-muted)',
        marginBottom: '4px'
    },
    oopClassName: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'var(--color-primary)',
        marginBottom: '6px'
    },
    oopClassBody: {
        fontSize: '11px',
        color: 'var(--text-secondary)',
        textAlign: 'left'
    },
    oopConnectingLine: {
        width: '2px',
        height: '30px',
        backgroundColor: 'var(--border-color)'
    },
    oopChildRow: {
        display: 'flex',
        gap: '20px'
    },
    oopNodeChild: {
        width: '170px',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '10px',
        boxShadow: 'var(--shadow-soft)'
    },
    oopChildTag: {
        fontSize: '8px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '4px'
    },
    visualSelect: {
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        fontSize: '12px',
        borderRadius: '8px',
        padding: '8px 12px',
        outline: 'none',
        flex: 1
    },
    apiStationBox: {
        flex: 1,
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: '12px',
        minHeight: '110px'
    },
    apiMethodLabel: {
        marginTop: '8px',
        fontSize: '10px',
        padding: '2px 6px',
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        borderRadius: '4px',
        fontWeight: 'bold'
    },
    apiNetworkPipe: {
        width: '100%',
        height: '4px',
        backgroundColor: 'var(--border-color)',
        borderRadius: '2px',
        position: 'relative',
        marginTop: '8px'
    },
    apiNetworkFlowDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary)',
        boxShadow: '0 0 8px var(--color-primary)',
        position: 'absolute',
        top: '-2px'
    },
    apiResponseContainer: {
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        backgroundColor: '#121217',
        padding: '10px'
    },
    apiResponsePre: {
        margin: 0,
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: '#00ffcc',
        whiteSpace: 'pre-wrap'
    }
};

export default AITutor;
