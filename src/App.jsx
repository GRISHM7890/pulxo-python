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
import SqlWorkbench from './components/SqlWorkbench';
import SaveModal from './components/SaveModal';
import { auditCode } from './lib/logicGuard';
import { db } from './lib/firebase';
import { ref, push, set } from 'firebase/database';

function App() {
  const { user, profile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Editor');
  const [code, setCode] = useState(`# Welcome to Pulxo Python
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    const cmd = selectedLanguage === 'SQL' ? 'sqlite query.sql' : 'python main.py';
    setTerminalOutput(prev => [...prev, { text: `$ ${cmd}`, type: 'prompt' }]);

    try {
      if (selectedLanguage === 'SQL') {
        const result = await sqlEngine.run(code);
        setExecutionTime(result.duration || 0);
      } else {
        const result = await pythonEngine.run(code);
        setExecutionTime(result.duration);

        // Trigger Logic Audit after execution
        const detectedProblems = await auditCode(code, selectedLanguage);
        setProblems(detectedProblems);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleApplyFix = (problem) => {
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

      // Clear the fix from problems
      setProblems(prev => prev.filter(p => p !== problem));
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
    setActiveTab('Editor');
  };

  return (
    <div className="app-layout">
      <div className="navbar-wrapper">
        <Navbar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onRun={handleRun}
          isRunning={isRunning}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSaveNote={handleSaveNote}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      </div>

      <div className="main-content">
        <PanelGroup orientation="horizontal">
          <Panel defaultSize={20} minSize={15} maxSize={40}>
            <div className="sidebar-container" style={{ width: '100%', borderRight: 'none' }}>
              <Sidebar
                onNotesToggle={() => setActiveTab('Library')}
                onPracticeToggle={() => setActiveTab('Practice')}
                onSavedProgramsToggle={() => setActiveTab('Library')}
                onDashboardToggle={() => setActiveTab('Dashboard')}
                onFileSelect={() => setActiveTab('Editor')}
                activeTab={activeTab}
                language={selectedLanguage}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="resize-handle" />

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
                onClose={() => setActiveTab('Editor')}
              />
            ) : activeTab === 'Profile' ? (
              <Profile
                onClose={() => setActiveTab('Editor')}
              />
            ) : activeTab === 'Dashboard' ? (
              <StudentDashboard
                onClose={() => setActiveTab('Editor')}
              />
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
                        isDarkMode={isDarkMode}
                        code={code}
                        setCode={setCode}
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
