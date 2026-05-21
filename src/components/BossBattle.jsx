import React, { useState, useEffect, useRef } from 'react';
import { Skull, Heart, ShieldAlert, X, Play, RefreshCw, Terminal, Sparkles, AlertTriangle, Zap, Activity } from 'lucide-react';
import Editor from './Editor';
import { useGamification } from '../context/GamificationContext';
import { playBossSound } from '../lib/audioSynth';
import pythonEngine from '../lib/pythonEngine';

// Repertoire of the 5 Coding Bosses
export const BOSS_DATA = {
    syntax_hydra: {
        id: 'syntax_hydra',
        title: 'Syntax Hydra',
        difficulty: 'beginner',
        xp: 250,
        threatLevel: 'Minor',
        color: '#10b981', // Emerald green
        avatarSvg: (
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="hydraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>
                {/* Hydra heads */}
                <path d="M25 45 C25 20, 15 25, 20 15 C25 5, 35 15, 30 40 Z" fill="url(#hydraGrad)" />
                <path d="M50 40 C50 10, 40 15, 45 5 C50 -5, 60 5, 55 35 Z" fill="url(#hydraGrad)" />
                <path d="M75 45 C75 20, 65 25, 70 15 C75 5, 85 15, 80 40 Z" fill="url(#hydraGrad)" />
                {/* Body base */}
                <path d="M15 70 C15 50, 85 50, 85 70 C85 95, 15 95, 15 70 Z" fill="#047857" />
                {/* Glowing eyes */}
                <circle cx="22" cy="18" r="2" fill="#ef4444" className="glitch-glow" />
                <circle cx="26" cy="17" r="2" fill="#ef4444" className="glitch-glow" />
                <circle cx="47" cy="8" r="2" fill="#ef4444" className="glitch-glow" />
                <circle cx="51" cy="7" r="2" fill="#ef4444" className="glitch-glow" />
                <circle cx="72" cy="18" r="2" fill="#ef4444" className="glitch-glow" />
                <circle cx="76" cy="17" r="2" fill="#ef4444" className="glitch-glow" />
            </svg>
        ),
        waves: [
            {
                title: 'Wave 1: Chop off the Left Head!',
                briefing: 'The Hydra breathes corruption! Correct the compilation and boundary errors in the `slice_mainframe` function. It should return elements 2 through 4 (inclusive) of a list (i.e. elements at index 1, 2, and 3).',
                initialCode: `def slice_mainframe(data)
    # Hint: Add function colons and verify index range bounds
    return data[2:4]
`,
                hint: 'In Python, slices are [start:end] where end is non-inclusive. To return index 1, 2, 3, use slice [1:4]. Do not forget the function colon!',
                validationType: 'tests',
                validationAppend: `
# Verification
print(slice_mainframe(["A", "B", "C", "D", "E", "F"]))
`,
                expectedStdout: "['B', 'C', 'D']"
            },
            {
                title: 'Wave 2: Chop off the Right Head!',
                briefing: 'Fix the dictionary syntax errors in the server configuration logs. The keys should be mapped cleanly to status integer codes.',
                initialCode: `def server_status():
    # Correct key separations and comma delimiters
    status = {
        "router-alpha"; 200,
        "firewall-beta": 500,
        "proxy-gamma" 404
    }
    return status
`,
                hint: 'Ensure keys and values are separated by colons (:), and elements are delimited with commas (,).',
                validationType: 'tests',
                validationAppend: `
# Verification
print(sorted(server_status().items()))
`,
                expectedStdout: "[('firewall-beta', 500), ('proxy-gamma', 404), ('router-alpha', 200)]"
            },
            {
                title: 'Wave 3: Sever the Central Core Head!',
                briefing: 'Correct the string interpolation bug. The function should return a breach warning alert utilizing both provided inputs.',
                initialCode: `def breach_alert(ip, code):
    # Fix the misspelled variable reference in string formatting
    return f"ALERT: IP {ip} breached with code {cod}"
`,
                hint: 'Look closely at the variable name inside the placeholder template. It is referencing `cod` instead of the function parameter `code`.',
                validationType: 'tests',
                validationAppend: `
# Verification
print(breach_alert("10.0.0.1", "X-99"))
`,
                expectedStdout: "ALERT: IP 10.0.0.1 breached with code X-99"
            }
        ]
    },
    loop_titan: {
        id: 'loop_titan',
        title: 'Loop Titan',
        difficulty: 'intermediate',
        xp: 350,
        threatLevel: 'Moderate',
        color: '#fbbf24', // Yellow
        avatarSvg: (
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="titanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                </defs>
                {/* Armored Golem Body */}
                <rect x="25" y="35" width="50" height="45" rx="8" fill="url(#titanGrad)" />
                <rect x="35" y="15" width="30" height="20" rx="4" fill="#b45309" />
                {/* Massive shoulders */}
                <circle cx="20" cy="40" r="12" fill="#d97706" />
                <circle cx="80" cy="40" r="12" fill="#d97706" />
                {/* Glowing neon eyes */}
                <rect x="42" y="22" width="6" height="2" fill="#f59e0b" className="glitch-glow" />
                <rect x="52" y="22" width="6" height="2" fill="#f59e0b" className="glitch-glow" />
                {/* Ground shock lines */}
                <line x1="10" y1="90" x2="90" y2="90" stroke="#f59e0b" strokeWidth="4" />
                <line x1="20" y1="85" x2="80" y2="85" stroke="#fbbf24" strokeWidth="2" />
            </svg>
        ),
        waves: [
            {
                title: 'Stage 1: Evade the Latency Stomp!',
                briefing: 'The Titan prepares to stomp the memory thread! A brute-force nested loop duplication finder takes exponential O(N^2) iterations, bypassing your system shield. Optimize it to execute in O(N) linear time using a set. Validation runs massive data limits that will timeout unless optimized under 100ms!',
                initialCode: `def find_duplicate(nums):
    # Optimize this nested O(N^2) search using a set accumulator
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return nums[i]
    return -1
`,
                hint: 'Create a set `visited = set()`. Traverse the list: if a number is already in `visited`, return it immediately. Otherwise, add it to `visited`. This resolves in linear time!',
                validationType: 'performance',
                maxDurationMs: 100,
                validationAppend: `
# Verification
large_input = list(range(10000)) + [9999]
print(find_duplicate(large_input))
`,
                expectedStdout: "9999"
            }
        ]
    },
    bug_overlord: {
        id: 'bug_overlord',
        title: 'Bug Overlord',
        difficulty: 'advanced',
        xp: 500,
        threatLevel: 'Severe',
        color: '#ef4444', // Red
        avatarSvg: (
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="overlordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#b91c1c" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                </defs>
                {/* Cybernetic Insectoid */}
                <circle cx="50" cy="35" r="18" fill="url(#overlordGrad)" />
                <path d="M35 50 L15 35" stroke="#ef4444" strokeWidth="3" />
                <path d="M65 50 L85 35" stroke="#ef4444" strokeWidth="3" />
                <path d="M32 55 L10 60" stroke="#ef4444" strokeWidth="3" />
                <path d="M68 55 L90 60" stroke="#ef4444" strokeWidth="3" />
                {/* Triangular glowing core */}
                <polygon points="50,25 42,38 58,38" fill="#fca5a5" className="glitch-glow" />
                <path d="M50 53 L50 85 L35 75 Z" fill="#991b1b" />
                <path d="M50 53 L50 85 L65 75 Z" fill="#b91c1c" />
            </svg>
        ),
        waves: [
            {
                title: 'Wave 1: Patch the Floating Division Index!',
                briefing: 'The Overlord attacks with index errors. A script intended to calculate list medians fails due to improper numeric index divisions. Correct `/` division to floor division `//` to maintain valid integer offsets.',
                initialCode: `def calculate_median(arr):
    n = len(arr)
    if n % 2 != 0:
        # Anomaly here: Division results in float index
        return arr[n / 2]
    else:
        return (arr[n // 2] + arr[n // 2 - 1]) / 2.0
`,
                hint: 'In Python, using `/` produces a float value. List indexing requires integer values. Refactor `/` to floor division `//`.',
                validationType: 'tests',
                validationAppend: `
# Verification
print(calculate_median([1, 2, 3, 4, 5]))
print(calculate_median([1, 2, 3, 4, 5, 6]))
`,
                expectedStdout: "3\n3.5"
            },
            {
                title: 'Wave 2: Resolve Dictionary Mutation Lockup!',
                briefing: 'An audit log sifter triggers runtime crash flags. Modifying dictionary elements while iterating over `.items()` directly is strictly disallowed. Refactor the dictionary keys traversal safely.',
                initialCode: `def filter_mainframe_logs(logs):
    # Anomaly: Mutating dictionary during iterator loop raises RuntimeError
    for key, val in logs.items():
        if val < 50:
            del logs[key]
    return logs
`,
                hint: 'Convert keys to a static list via `list(logs.keys())` to iterate safely, or utilize dictionary comprehension to sift results.',
                validationType: 'tests',
                validationAppend: `
# Verification
logs = {"cpu": 90, "temp": 45, "io": 12, "memory": 85}
print(sorted(filter_mainframe_logs(logs).items()))
`,
                expectedStdout: "[('cpu', 90), ('memory', 85)]"
            }
        ]
    },
    memory_eater: {
        id: 'memory_eater',
        title: 'Memory Eater',
        difficulty: 'advanced',
        xp: 500,
        threatLevel: 'Severe',
        color: '#c084fc', // Violet
        avatarSvg: (
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="eaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7e22ce" />
                        <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                </defs>
                {/* Abyssal vortex */}
                <circle cx="50" cy="50" r="30" fill="url(#eaterGrad)" />
                <circle cx="50" cy="50" r="18" fill="#000" />
                {/* Outer particles */}
                <circle cx="20" cy="20" r="3" fill="#c084fc" />
                <circle cx="80" cy="20" r="3" fill="#c084fc" />
                <circle cx="15" cy="65" r="4" fill="#c084fc" />
                <circle cx="85" cy="65" r="4" fill="#c084fc" />
                <circle cx="50" cy="10" r="5" fill="#a855f7" className="glitch-glow" />
            </svg>
        ),
        waves: [
            {
                title: 'Stage 1: De-Recursion Stack Refactoring!',
                briefing: 'The Memory Eater sucks stack memory! Standard recursive calls holding context build deep memory tables, leading to stack leaks. Rewrite the recursive factorial module into an iterative loop maintaining constant O(1) space footprint.',
                initialCode: `def stack_factorial(n):
    # Anomaly: Recursive execution locks memory stack at large inputs
    if n <= 1:
        return 1
    return n * stack_factorial(n - 1)
`,
                hint: 'Remove recursion entirely. Maintain a simple `result = 1` accumulator and iterate from 2 up to `n` multiplying values.',
                validationType: 'tests',
                validationAppend: `
# Verification
print(stack_factorial(1000) > 0)
`,
                expectedStdout: "True"
            }
        ]
    },
    exception_king: {
        id: 'exception_king',
        title: 'Exception King',
        difficulty: 'legendary',
        xp: 750,
        threatLevel: 'Critical',
        color: '#f59e0b', // Gold
        avatarSvg: (
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="kingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                </defs>
                {/* Crowned hologram */}
                <polygon points="50,10 65,30 35,30" fill="url(#kingGrad)" />
                <rect x="30" y="32" width="40" height="40" rx="4" fill="#b45309" />
                <polygon points="30,32 50,15 70,32" fill="#f59e0b" />
                {/* Glowing Crown gems */}
                <circle cx="33" cy="32" r="2" fill="#ef4444" />
                <circle cx="50" cy="15" r="3" fill="#3b82f6" className="glitch-glow" />
                <circle cx="67" cy="32" r="2" fill="#ef4444" />
                {/* Floating energy arcs */}
                <path d="M15 45 Q30 55 15 65" stroke="#f59e0b" strokeWidth="2" fill="none" />
                <path d="M85 45 Q70 55 85 65" stroke="#f59e0b" strokeWidth="2" fill="none" />
            </svg>
        ),
        waves: [
            {
                title: 'Stage 1: Intercept ValueError & IndexError Deflections!',
                briefing: 'The King casts ValueError and IndexError spells! Build a try-except deflection grid. Read a value from list `data` at index `idx` and convert to int. Deflect by returning `"Index Shield Absorbed!"` on index errors, and `"Value Shield Absorbed!"` on conversion failures.',
                initialCode: `def index_converter(data, idx):
    # Construct a try-except structure intercepting ValueError and IndexError
    pass
`,
                hint: 'Wrap index retrieval `val = data[idx]` and conversion `return int(val)` in a `try` block. Add `except IndexError:` and `except ValueError:` handlers.',
                validationType: 'tests',
                validationAppend: `
# Verification
print(index_converter(["10", "20", "abc"], 1))
print(index_converter(["10", "20", "abc"], 2))
print(index_converter(["10", "20", "abc"], 5))
`,
                expectedStdout: "20\nValue Shield Absorbed!\nIndex Shield Absorbed!"
            },
            {
                title: 'Stage 2: Intercept KeyError & TypeError Deflections!',
                briefing: 'The King unleashes KeyError and TypeError anomalies! Wrap the dict key lookup and string length evaluation in try-except constructs. Catch KeyError returning `"Key Shield Deflected!"` and TypeError returning `"Type Shield Deflected!"`.',
                initialCode: `def config_auditor(config, key):
    # Construct a try-except structure intercepting KeyError and TypeError
    pass
`,
                hint: 'Lookup key `val = config[key]` and measure length `return len(val)`. Add appropriate catch parameters for KeyError and TypeError.',
                validationType: 'tests',
                validationAppend: `
# Verification
print(config_auditor({"host": "localhost", "port": 8080}, "host"))
print(config_auditor({"host": "localhost", "port": 8080}, "port"))
print(config_auditor({"host": "localhost", "port": 8080}, "ssl"))
`,
                expectedStdout: "9\nType Shield Deflected!\nKey Shield Deflected!"
            }
        ]
    }
};

const BossBattle = ({ boss, onExit }) => {
    const gamification = useGamification() || {};
    const bossMeta = BOSS_DATA[boss.id] || BOSS_DATA.syntax_hydra;

    const [currentWaveIdx, setCurrentWaveIdx] = useState(0);
    const wave = bossMeta.waves[currentWaveIdx] || bossMeta.waves[0];

    const [code, setCode] = useState(wave.initialCode);
    const [activeTab, setActiveTab] = useState('briefing');
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState(null);

    // Dynamic health state
    const [bossHealth, setBossHealth] = useState(100);
    const [playerHealth, setPlayerHealth] = useState(100);

    // Active Timer System
    const [timeLeft, setTimeLeft] = useState(25);
    const [shakeContainer, setShakeContainer] = useState(false);
    const [combatLogs, setCombatLogs] = useState([
        `[SYSTEM] Mainframe cockpit online. Target: ${bossMeta.title}.`,
        `[WARNING] Shield indicators set to active tracking. Deflect attacks!`
    ]);

    const timerRef = useRef(null);

    // Initialize/Reset code per wave
    useEffect(() => {
        if (bossMeta.waves[currentWaveIdx]) {
            setCode(bossMeta.waves[currentWaveIdx].initialCode);
            setTestResults(null);
            setActiveTab('briefing');
            setTimeLeft(25);
            addLog(`[STAGE] Entered stage: ${bossMeta.waves[currentWaveIdx].title}`);
        }
    }, [currentWaveIdx]);

    // Active time-ticker loop
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Timeout! Boss logic strike triggers!
                    handleBossStrike();
                    return 25;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [currentWaveIdx]);

    const addLog = (msg) => {
        setCombatLogs(prev => [...prev.slice(-15), msg]);
    };

    const handleBossStrike = () => {
        playBossSound('damage');
        setShakeContainer(true);
        setTimeout(() => setShakeContainer(false), 500);

        setPlayerHealth(prev => {
            const nextVal = Math.max(0, prev - 20);
            if (nextVal <= 0) {
                handleDefeat();
            }
            return nextVal;
        });

        addLog(`[BOSS ATTACK] ${bossMeta.title} fires a Logic Strike! Shield down by -20 HP.`);
    };

    const handleDefeat = () => {
        clearInterval(timerRef.current);
        playBossSound('defeat');
        alert(`🚨 Mainframe Breached! The ${bossMeta.title} has overloaded your memory shields. Refactor your scripts and try again!`);
        onExit();
    };

    const handleRunAndCompile = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setTestResults(null);
        setActiveTab('diagnostics');

        const testScript = code + '\n' + (wave.validationAppend || '');

        try {
            const result = await pythonEngine.run(testScript);
            const duration = result.duration;
            const stdout = result.stdout || '';
            const stderr = result.stderr || '';

            const cleanStdout = stdout.replace(/\r\n/g, '\n').trim();
            const cleanExpected = wave.expectedStdout.replace(/\r\n/g, '\n').trim();

            let success = cleanStdout === cleanExpected && !stderr;
            let perfTimeout = false;

            if (success && wave.validationType === 'performance') {
                const maxAllowed = wave.maxDurationMs || 100;
                if (duration > maxAllowed) {
                    success = false;
                    perfTimeout = true;
                }
            }

            setTestResults({
                success,
                stdout,
                stderr,
                duration,
                perfTimeout
            });

            if (success) {
                playBossSound('hit');
                addLog(`[PLAYER ATTACK] Command compiled successfully! Deflected ${((currentWaveIdx + 1) / bossMeta.waves.length * 100).toFixed(0)}% grid barriers.`);
                
                // Damage boss
                const damage = Math.round(100 / bossMeta.waves.length);
                setBossHealth(prev => {
                    const nextVal = Math.max(0, prev - damage);
                    if (nextVal <= 0) {
                        handleVictory();
                    } else {
                        // Go to next wave
                        setTimeout(() => {
                            setCurrentWaveIdx(prevWave => prevWave + 1);
                        }, 1200);
                    }
                    return nextVal;
                });
            } else {
                // Incorrect logic penalty
                playBossSound('damage');
                setShakeContainer(true);
                setTimeout(() => setShakeContainer(false), 500);

                setPlayerHealth(prev => {
                    const nextVal = Math.max(0, prev - 15);
                    if (nextVal <= 0) {
                        handleDefeat();
                    }
                    return nextVal;
                });

                if (perfTimeout) {
                    addLog(`[CRITICAL] Stomp detected! Run duration (${duration.toFixed(0)}ms) exceeded bounds (<${wave.maxDurationMs}ms).`);
                } else {
                    addLog(`[FAIL] Verification mismatch. Intercepted compile error or output mismatch.`);
                }
            }

        } catch (err) {
            console.error(err);
            setTestResults({
                success: false,
                stdout: '',
                stderr: err.message || 'Execution failed',
                duration: 0,
                perfTimeout: false
            });
        } finally {
            setIsRunning(false);
        }
    };

    const handleVictory = () => {
        clearInterval(timerRef.current);
        playBossSound('victory');
        setTimeout(async () => {
            if (gamification.completeMission && gamification.addXP) {
                await gamification.addXP(bossMeta.xp);
                await gamification.completeMission(bossMeta.id, bossMeta.xp);
            }
            alert(`💥 GRAND VICTORY! You have successfully neutralized the ${bossMeta.title} and secured +${bossMeta.xp} XP!`);
            onExit();
        }, 800);
    };

    return (
        <div style={styles.container} className={shakeContainer ? 'shake' : ''}>
            {/* Cinematic Head */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: bossMeta.color, display: 'flex', alignItems: 'center', gap: '8px', textShadow: `0 0 10px ${bossMeta.color}40` }}>
                        <Skull size={20} /> COCKPIT: NEUTRALIZING {bossMeta.title.toUpperCase()}
                    </h2>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.8px' }}>
                        Threat Rating: <strong style={{ color: 'var(--color-error)' }}>{bossMeta.threatLevel}</strong>
                    </span>
                </div>
                <div style={styles.headerRight}>
                    <div style={styles.timerRing}>
                        <Activity size={14} className="spin" style={{ color: bossMeta.color }} />
                        <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>STRIKE CYCLES: {timeLeft}s</span>
                    </div>
                    <button style={styles.closeBtn} onClick={onExit}><X size={20} /></button>
                </div>
            </div>

            {/* Health indicators panel */}
            <div style={styles.battleArena}>
                <div style={styles.entityCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                        <span style={{ fontWeight: 'bold', color: bossMeta.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Skull size={14} /> {bossMeta.title} Core
                        </span>
                        <span style={{ color: bossMeta.color, fontWeight: 'bold' }}>{bossHealth}/100 HP</span>
                    </div>
                    <div style={styles.healthBarBg}>
                        <div style={{ ...styles.healthBarFill, width: `${bossHealth}%`, backgroundColor: bossMeta.color, boxShadow: `0 0 10px ${bossMeta.color}` }}></div>
                    </div>
                </div>

                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-muted)', textShadow: '0 0 10px rgba(255,255,255,0.05)' }}>VS</div>

                <div style={styles.entityCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Zap size={14} /> Shield Integrity
                        </span>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{playerHealth}/100 HP</span>
                    </div>
                    <div style={styles.healthBarBg}>
                        <div style={{ ...styles.healthBarFill, width: `${playerHealth}%`, backgroundColor: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary)' }}></div>
                    </div>
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div style={styles.sandboxContent}>
                <div style={styles.codingGrid}>
                    
                    {/* Left Pane (Directive & Holograms) */}
                    <div style={styles.leftPane}>
                        
                        {/* Interactive Boss Glitch Poster Card */}
                        <div style={styles.avatarCard}>
                            <div style={{ width: '80px', height: '80px', border: `1px solid ${bossMeta.color}30`, borderRadius: '12px', padding: '8px', backgroundColor: 'rgba(0,0,0,0.4)', boxShadow: `0 0 15px ${bossMeta.color}15` }}>
                                {bossMeta.avatarSvg}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', color: bossMeta.color, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hostile mainframe entity</div>
                                <h4 style={{ margin: '2px 0 6px 0', fontSize: '16px', fontWeight: 'bold' }}>{bossMeta.title}</h4>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Stage {currentWaveIdx + 1} of {bossMeta.waves.length}: <strong style={{ color: '#fff' }}>{wave.title}</strong></div>
                            </div>
                        </div>

                        {/* Tab navigation headers */}
                        <div style={styles.tabHeaders}>
                            <button style={activeTab === 'briefing' ? styles.tabHeaderActive : styles.tabHeader} onClick={() => setActiveTab('briefing')}>Briefing Directive</button>
                            <button style={activeTab === 'diagnostics' ? styles.tabHeaderActive : styles.tabHeader} onClick={() => setActiveTab('diagnostics')}>Combat Diagnostics</button>
                            <button style={activeTab === 'ticker' ? styles.tabHeaderActive : styles.tabHeader} onClick={() => setActiveTab('ticker')}>Hacking Logs ({combatLogs.length})</button>
                        </div>

                        {/* Tab layouts */}
                        <div style={styles.tabContainer}>
                            {activeTab === 'briefing' && (
                                <div style={styles.tabContent}>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{wave.briefing}</p>
                                    
                                    {wave.hint && (
                                        <div style={styles.hintSection}>
                                            <h5 style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                💡 System Decryption suggestion
                                            </h5>
                                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{wave.hint}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'diagnostics' && (
                                <div style={styles.tabContent}>
                                    {!testResults ? (
                                        <div style={styles.diagnosticsEmpty}>
                                            <Terminal size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                                            <span style={{ fontSize: '12px' }}>Awaiting script execution...</span>
                                        </div>
                                    ) : (
                                        <div style={styles.diagnosticsGlow}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Diagnostics Audits</span>
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: testResults.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: testResults.success ? 'var(--color-success)' : 'var(--color-error)'
                                                }}>
                                                    {testResults.success ? '✅ PASSED' : '❌ SCHEMATIC ERRORS'}
                                                </span>
                                            </div>

                                            {testResults.perfTimeout && (
                                                <div style={styles.alertError}>
                                                    <ShieldAlert size={14} />
                                                    <span>STOMP CRITICAL: Operational bounds exceeded! Take {testResults.duration.toFixed(0)}ms (Constraint &lt; {wave.maxDurationMs}ms).</span>
                                                </div>
                                            )}

                                            {testResults.stderr && (
                                                <div style={styles.consoleError}>
                                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{testResults.stderr}</pre>
                                                </div>
                                            )}

                                            {!testResults.stderr && (
                                                <div style={styles.consoleOutput}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                                                        <div>
                                                            <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '4px' }}>EXPECTED:</div>
                                                            <pre style={{ margin: 0, background: 'rgba(0,0,0,0.4)', padding: '6px', borderRadius: '4px', overflowX: 'auto' }}>{wave.expectedStdout}</pre>
                                                        </div>
                                                        <div>
                                                            <div style={{ color: testResults.success ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 'bold', marginBottom: '4px' }}>ACTUAL:</div>
                                                            <pre style={{ margin: 0, background: 'rgba(0,0,0,0.4)', padding: '6px', borderRadius: '4px', overflowX: 'auto' }}>{testResults.stdout || '(Empty Output)'}</pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'ticker' && (
                                <div style={styles.tabContent}>
                                    <div style={styles.tickerConsole}>
                                        {combatLogs.map((log, index) => {
                                            let color = 'var(--text-secondary)';
                                            if (log.includes('[BOSS ATTACK]')) color = 'var(--color-error)';
                                            else if (log.includes('[PLAYER ATTACK]')) color = 'var(--color-success)';
                                            else if (log.includes('[CRITICAL]')) color = 'var(--color-error)';
                                            else if (log.includes('[SYSTEM]')) color = '#2dd4bf';
                                            else if (log.includes('[STAGE]')) color = '#c084fc';
                                            return (
                                                <div key={index} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color, marginBottom: '6px', lineHeight: '1.4' }}>
                                                    {log}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Pane (Workspace Editor) */}
                    <div style={styles.editorPane}>
                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                            <Editor
                                isDarkMode={true}
                                code={code}
                                setCode={setCode}
                                onRun={handleRunAndCompile}
                                language="Python"
                            />
                        </div>
                        <div style={styles.editorFooter}>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase', backgroundColor: bossMeta.color, borderColor: bossMeta.color, boxShadow: `0 0 15px ${bossMeta.color}30` }}
                                disabled={isRunning}
                                onClick={handleRunAndCompile}
                            >
                                {isRunning ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <RefreshCw className="spin" size={16} /> Auditing Mainframe compiler...
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Play size={16} /> COMPILE SPELL (RUN TEST SUITES)
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 3s linear infinite;
                }
                @keyframes glitch-glow {
                    0%, 100% { filter: drop-shadow(0 0 2px #ef4444); }
                    50% { filter: drop-shadow(0 0 8px #ef4444); }
                }
                .glitch-glow {
                    animation: glitch-glow 1.5s infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                    20%, 40%, 60%, 80% { transform: translateX(6px); }
                }
                .shake {
                    animation: shake 0.5s ease;
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#050508', // Abyssal cockpit base
        color: '#e2e8f0',
        fontFamily: 'var(--font-sans)',
    },
    header: {
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #111827',
        backgroundColor: '#0a0a0f'
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    timerRing: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        borderRadius: '8px',
        fontSize: '12px'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        ':hover': {
            backgroundColor: '#1f2937',
            color: '#fff'
        }
    },
    battleArena: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        backgroundColor: '#0a0a0f',
        borderBottom: '1px solid #111827',
        gap: '24px'
    },
    entityCard: {
        flex: 1,
        backgroundColor: '#0e0e14',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #111827'
    },
    healthBarBg: {
        height: '6px',
        backgroundColor: '#1f2937',
        borderRadius: '3px',
        overflow: 'hidden'
    },
    healthBarFill: {
        height: '100%',
        transition: 'width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
    },
    sandboxContent: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
    },
    codingGrid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.2fr 1.5fr',
        minHeight: 0
    },
    leftPane: {
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #111827',
        minHeight: 0
    },
    avatarCard: {
        display: 'flex',
        padding: '16px 24px',
        backgroundColor: '#08080c',
        borderBottom: '1px solid #111827',
        alignItems: 'center',
        gap: '16px'
    },
    tabHeaders: {
        display: 'flex',
        borderBottom: '1px solid #111827',
        backgroundColor: '#07070a'
    },
    tabHeader: {
        flex: 1,
        padding: '10px',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s'
    },
    tabHeaderActive: {
        flex: 1,
        padding: '10px',
        background: 'none',
        border: 'none',
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'default',
        borderBottom: '2px solid var(--color-primary)',
        backgroundColor: '#050508'
    },
    tabContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px'
    },
    tabContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    hintSection: {
        padding: '12px',
        backgroundColor: '#08080c',
        border: '1px solid #111827',
        borderRadius: '8px'
    },
    diagnosticsEmpty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '140px',
        color: 'var(--text-muted)'
    },
    diagnosticsGlow: {
        backgroundColor: '#08080c',
        border: '1px solid #111827',
        borderRadius: '8px',
        padding: '12px'
    },
    alertError: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '8px 10px',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        borderRadius: '6px',
        color: 'var(--color-error)',
        fontSize: '11px',
        marginBottom: '12px'
    },
    consoleError: {
        padding: '10px',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        borderRadius: '6px',
        color: '#fca5a5',
        maxHeight: '120px',
        overflowY: 'auto'
    },
    consoleOutput: {
        display: 'flex',
        flexDirection: 'column'
    },
    tickerConsole: {
        backgroundColor: '#030305',
        border: '1px solid #111827',
        borderRadius: '8px',
        padding: '12px',
        minHeight: '180px',
        maxHeight: '260px',
        overflowY: 'auto'
    },
    editorPane: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0d0d12',
        minHeight: 0
    },
    editorFooter: {
        padding: '12px 16px',
        backgroundColor: '#07070a',
        borderTop: '1px solid #111827'
    }
};

export default BossBattle;
