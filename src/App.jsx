import { useState, useEffect, useRef } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import BottomPanel from './components/BottomPanel';
import CloudLibrary from './components/CloudLibrary';
import Practice from './components/Practice';
import pythonEngine from './lib/pythonEngine';
import sqlEngine from './lib/sqlEngine';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import ProfileSetup from './components/ProfileSetup';
import Profile from './components/Profile';
import StudentDashboard from './components/StudentDashboard';
import GamifiedLearning from './components/GamifiedLearning';
import MissionArena from './components/MissionArena';
import BossBattle from './components/BossBattle';
import LevelUpOverlay from './components/LevelUpOverlay';
import AchievementToast from './components/AchievementToast';
import SqlWorkbench from './components/SqlWorkbench';
import SaveModal from './components/SaveModal';
import { auditCode } from './lib/logicGuard';
import { ref, push, set } from 'firebase/database';
import { useCollaboration } from './hooks/useCollaboration';
import { useGamification } from './context/GamificationContext';

function App() {
  const { user, profile } = useAuth();
  const [theme, setTheme] = useState('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const { activeUsers, remoteCode, broadcastCode } = useCollaboration(roomId);
  const gamification = useGamification();
  const [activeTab, setActiveTab] = useState('Editor');
  const [activeMission, setActiveMission] = useState(null);
  const [activeBoss, setActiveBoss] = useState(null);
  const [practicePreset, setPracticePreset] = useState(null);
  const [code, setCode] = useState(`# Welcome to Py Compiler X
# Write your Python code here

def calculate_fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    while len(sequence) < n:
        next_num = sequence[-1] + sequence[-2]
        sequence.append(next_num)
        
    return sequence

# Generate the first 10 Fibonacci numbers
result = calculate_fibonacci(10)
print(f"Fibonacci Sequence: {result}")
`);
  const [terminalOutput, setTerminalOutput] = useState([
    { text: '$ python main.py', type: 'prompt' },
    { text: 'Fibonacci Sequence: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]', type: 'stdout' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [problems, setProblems] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) setRoomId(room);
  }, []);

  useEffect(() => {
    if (remoteCode !== null) {
      setCode(remoteCode);
    }
  }, [remoteCode]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.className = '';
    if (theme !== 'light') {
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Connect Engines to terminal state
  useEffect(() => {
    pythonEngine.setOutputCallback((text, type) => {
      setTerminalOutput(prev => [...prev, { text, type }]);
    });

    sqlEngine.setOutputCallback((text, type) => {
      if (type === 'sql_result') {
        setTerminalOutput(prev => [...prev, { results: text, type: 'sql_table' }]);
      } else {
        setTerminalOutput(prev => [...prev, { text, type }]);
      }
    });

    // Share with Navbar via global (temporary fix before prop drilling deep)
    window.selectedLanguage = selectedLanguage;
    window.onLanguageChange = (lang) => {
      setSelectedLanguage(lang);
      if (lang === 'SQL') {
        setCode('-- Write your SQL queries here\nCREATE TABLE student (id INT, name TEXT);\nINSERT INTO student VALUES (1, "Anshu"), (2, "Grishm");\nSELECT * FROM student;');
      } else {
        setCode('# Write your Python code here\nprint("Hello Python!")');
      }
    };

    // Pre-load Engines
    pythonEngine.load();
    sqlEngine.load();
  }, [selectedLanguage]);

  // Theme handled by selector in Navbar

  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    const cmd = selectedLanguage === 'SQL' ? 'sqlite query.sql' : 'python main.py';
    setTerminalOutput(prev => [...prev, { text: `$ ${cmd}`, type: 'prompt' }]);

    try {
      let isSuccess = false;
      const totalLines = code.split('\n').length;
      
      // Increment total lines compiled stat
      if (gamification?.incrementStat) {
          gamification.incrementStat('totalLinesWritten', totalLines);
      }

      if (selectedLanguage === 'SQL') {
        const result = await sqlEngine.run(code);
        setExecutionTime(result.duration || 0);
        if (gamification?.addXP) gamification.addXP(5);
        isSuccess = true;
      } else {
        const result = await pythonEngine.run(code);
        setExecutionTime(result.duration);

        // Trigger Logic Audit after execution
        const detectedProblems = await auditCode(code, selectedLanguage);
        setProblems(detectedProblems);

        if (detectedProblems.length === 0) {
            if (gamification?.addXP) gamification.addXP(5);
            isSuccess = true;
        }
      }

      // Achievements Checks!
      if (gamification?.unlockAchievement && gamification?.incrementStat) {
          const currentTotalRuns = await gamification.incrementStat('totalRuns', 1);

          // 1. First Run achievement
          if (currentTotalRuns === 1) {
              gamification.unlockAchievement('first_run');
          }

          // 2. Hello World Master
          const normalizedCode = code.toLowerCase();
          if (normalizedCode.includes('hello') && normalizedCode.includes('world')) {
              gamification.unlockAchievement('hello_world');
          }

          // 3. Night Coder
          const hour = new Date().getHours();
          if (hour >= 0 && hour <= 5) {
              gamification.unlockAchievement('night_coder');
          }

          // 4. Python Explorer (3+ custom def statements)
          const defCount = (code.match(/def\s+\w+/g) || []).length;
          if (selectedLanguage === 'Python' && defCount >= 3) {
              gamification.unlockAchievement('python_explorer');
          }

          // 5. 1000 Lines Written
          const currentLinesTotal = gamification.totalLinesWritten || 0;
          if (currentLinesTotal + totalLines >= 1000) {
              gamification.unlockAchievement('lines_1000');
          }

          // 6. Syntax Survivor & Infinite Loop Destroyer
          if (isSuccess) {
              const successCount = await gamification.incrementStat('successfulRuns', 1);
              if (successCount >= 5) {
                  gamification.unlockAchievement('syntax_survivor');
              }
              // Loop terminator detection (has while/for, but no errors)
              if (code.includes('while') || code.includes('for')) {
                  gamification.unlockAchievement('infinite_loop_destroyer');
              }
          }

          // 7. Logic Master (nested loop with zero flaws detected)
          const hasNestedLoops = /for\s+\w+\s+in\s+.*:\s*[\r\n]+.*(for|while|if)\s+/.test(code);
          if (hasNestedLoops && isSuccess && problems.length === 0) {
              gamification.unlockAchievement('logic_master');
          }
      }

      if (isSuccess && gamification?.completeDailyGoal) {
          const res = await gamification.completeDailyGoal();
          if (res) {
              let msg = `🎉 Coding Goal Achieved today! +${res.xpEarned} XP! 🔥`;
              if (res.comeback) {
                  msg += `\n💥 Momentum restored! +50 XP Comeback Bonus applied! Welcome back! 🚀`;
              }
              if (res.streakBoostActive) {
                  msg += `\n⚡ Active +20% Streak XP Boost is fueling your leveling!`;
              }
              alert(msg);
          }
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleApplyFix = async (problem) => {
    if (!problem.fix) return;

    // Split code into lines
    const lines = code.split('\n');
    const lineIndex = problem.line - 1;

    if (lineIndex >= 0 && lineIndex < lines.length) {
      // Replace the specific line with the fix
      // We preserve the indentation of the original line
      const originalLine = lines[lineIndex];
      const indentation = originalLine.match(/^\s*/)[0];
      lines[lineIndex] = indentation + problem.fix;

      const newCode = lines.join('\n');
      setCode(newCode);
      if (roomId) broadcastCode(newCode);

      // Clear the fix from problems
      setProblems(prev => prev.filter(p => p !== problem));
      
      // Increment Fixes Applied Stat
      if (gamification?.incrementStat && gamification?.unlockAchievement) {
          const fixes = await gamification.incrementStat('fixesApplied', 1);
          
          // Bug Hunter Achievement
          if (fixes === 1) {
              gamification.unlockAchievement('bug_hunter');
          }
          
          // Error Slayer Achievement (3 fixes applied)
          if (fixes >= 3) {
              gamification.unlockAchievement('error_slayer');
          }
      }

      alert(`Fixed line ${problem.line}: ${problem.message}`);
    }
  };

  const handleJumpToLine = (line) => {
    if (editorRef.current && editorRef.current.view) {
      const view = editorRef.current.view;
      const linePos = view.state.doc.line(Math.max(1, Math.min(line, view.state.doc.lines)));
      view.dispatch({
        selection: { anchor: linePos.from, head: linePos.to },
        scrollIntoView: true
      });
      view.focus();
    }
  };

  const handleClearTerminal = () => {
    setTerminalOutput([]);
    setExecutionTime(0);
  };

  const handleSaveNote = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleSmartSave = async (saveData) => {
    try {
      const programsRef = ref(db, `users/${user.uid}/saved_programs`);
      const newProgramRef = push(programsRef);
      await set(newProgramRef, {
        ...saveData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      alert('Program saved to your Cloud Library!');
      setActiveTab('Library');
    } catch (err) {
      console.error("Save error:", err);
      alert('Failed to save program: ' + err.message);
    }
  };

  const handlePracticeNote = (noteCode) => {
    setCode(noteCode);
    if (roomId) broadcastCode(noteCode);
    setActiveTab('Editor');
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (roomId) broadcastCode(newCode);
  };

  const renderSidebar = () => (
    <Sidebar
      onNotesToggle={() => { setActiveTab('Library'); setIsSidebarOpen(false); }}
      onPracticeToggle={() => { setActiveTab('Practice'); setIsSidebarOpen(false); }}
      onSavedProgramsToggle={() => { setActiveTab('Library'); setIsSidebarOpen(false); }}
      onDashboardToggle={() => { setActiveTab('Dashboard'); setIsSidebarOpen(false); }}
      onGamifyToggle={() => { setActiveTab('Gamified Learning'); setIsSidebarOpen(false); }}
      onFileSelect={() => { setActiveTab('Editor'); setIsSidebarOpen(false); }}
      activeTab={activeTab}
      language={selectedLanguage}
    />
  );

  return (
    <div className="app-layout">
      <div className="navbar-wrapper">
        <Navbar
          theme={theme}
          onThemeChange={setTheme}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobile={isMobile}
          onRun={handleRun}
          isRunning={isRunning}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSaveNote={handleSaveNote}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          roomId={roomId}
          activeUsers={activeUsers}
        />
      </div>

      <div className="main-content">
        <PanelGroup orientation="horizontal">
          {!isMobile && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={40}>
                <div className="sidebar-container" style={{ width: '100%', borderRight: 'none', position: 'relative', transform: 'none', boxShadow: 'none' }}>
                  {renderSidebar()}
                </div>
              </Panel>
              <PanelResizeHandle className="resize-handle" />
            </>
          )}

          {isMobile && (
            <>
              <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
              <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
                {renderSidebar()}
              </div>
            </>
          )}

          <Panel>
            {activeTab === 'Library' ? (
              <CloudLibrary
                onEdit={(newCode) => {
                  setCode(newCode);
                  setActiveTab('Editor');
                }}
                onClose={() => setActiveTab('Editor')}
              />
            ) : activeTab === 'Practice' ? (
              <Practice
                onClose={() => {
                  setPracticePreset(null);
                  setActiveTab('Gamified Learning');
                }}
                initialTopic={practicePreset?.topic}
                initialProblemIndex={practicePreset?.problemIndex}
              />
            ) : activeTab === 'Profile' ? (
              <Profile
                onClose={() => setActiveTab('Editor')}
              />
            ) : activeTab === 'Dashboard' ? (
              <StudentDashboard
                onClose={() => setActiveTab('Editor')}
              />
            ) : activeTab === 'Gamified Learning' ? (
              activeBoss ? (
                <BossBattle 
                  boss={activeBoss} 
                  onExit={() => setActiveBoss(null)} 
                />
              ) : activeMission ? (
                <MissionArena 
                  mission={activeMission} 
                  onExit={() => setActiveMission(null)} 
                />
              ) : (
                <GamifiedLearning 
                  onStartMission={(mission) => setActiveMission(mission)}
                  onStartBoss={(boss) => setActiveBoss(boss)} 
                  onLaunchChallenge={(topic, problemIndex) => {
                    setPracticePreset({ topic, problemIndex });
                    setActiveTab('Practice');
                  }}
                />
              )
            ) : (
              <div className="workspace-main" style={{ height: '100%' }}>
                {selectedLanguage === 'SQL' ? (
                  <SqlWorkbench
                    initialCode={code}
                    onSave={(newCode) => setCode(newCode)}
                  />
                ) : (
                  <>
                    <div className="editor-section">
                      <Editor
                        ref={editorRef}
                        isDarkMode={['dark', 'neon', 'glass'].includes(theme)}
                        code={code}
                        setCode={handleCodeChange}
                        onRun={handleRun}
                        language={selectedLanguage}
                      />
                    </div>

                    <div className="output-section">
                      <BottomPanel
                        output={terminalOutput}
                        onClear={handleClearTerminal}
                        isRunning={isRunning}
                        executionTime={executionTime}
                        onJumpToLine={handleJumpToLine}
                        problems={problems}
                        onApplyFix={handleApplyFix}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </Panel>
        </PanelGroup>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {user && profile && !profile.isComplete && <ProfileSetup />}

      <LevelUpOverlay />
      <AchievementToast />
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSmartSave}
        initialCode={code}
        language={selectedLanguage}
      />
    </div>
  );
}

export default App;
