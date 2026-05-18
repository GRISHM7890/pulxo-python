/**
 * Python Engine using Pyodide (WASM)
 */

class PythonEngine {
    constructor() {
        this.pyodide = null;
        this.isLoading = false;
        this.onOutput = null; // Callback for stdout/stderr
    }

    async load() {
        if (this.pyodide || this.isLoading) return;

        this.isLoading = true;
        try {
            if (typeof window.loadPyodide === 'undefined') {
                throw new Error('Pyodide script not loaded. Check index.html');
            }

            this.pyodide = await window.loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
            });

            // Set up stdout redirection
            this.pyodide.setStdout({
                batched: (text) => {
                    if (this.onOutput) this.onOutput(text, 'stdout');
                }
            });

            // Set up stderr redirection
            this.pyodide.setStderr({
                batched: (text) => {
                    if (this.onOutput) this.onOutput(text, 'stderr');
                }
            });

            // Set up a safe default stdin to prevent I/O errors (Errno 29)
            this.pyodide.setStdin({
                stdin: () => {
                    return null; // EOF
                }
            });

            // MARKET-LEVEL INJECTION: Redirect input prompts to stderr
            await this.pyodide.runPythonAsync(`
import builtins
import sys

def competition_input(prompt=""):
    if prompt:
        sys.stderr.write(str(prompt))
        sys.stderr.flush()
    line = sys.stdin.readline()
    if not line: return ""
    return line.rstrip('\\n')

builtins.input = competition_input
            `);

            console.log('Pyodide loaded successfully (Competitive Grade)');
        } catch (error) {
            console.error('Failed to load Pyodide:', error);
            if (this.onOutput) this.onOutput(`Error loading Python engine: ${error.message}\n`, 'stderr');
        } finally {
            this.isLoading = false;
        }
    }

    async run(code, stdin = null) {
        if (!this.pyodide) {
            await this.load();
        }

        if (!this.pyodide) return { stdout: '', stderr: 'Engine not loaded', duration: 0 };

        let stdout = '';
        let stderr = '';
        const originalOutput = this.onOutput;

        // Temporary callback to capture output for this specific run
        const captureCallback = (text, type) => {
            if (type === 'stdout') stdout += text;
            else if (type === 'stderr') stderr += text;
            if (originalOutput) originalOutput(text, type);
        };

        this.onOutput = captureCallback;

        // Set up stdin for this specific run if provided
        if (stdin !== null) {
            const inputs = Array.isArray(stdin) ? stdin : stdin.split('\n');
            let inputIdx = 0;
            this.pyodide.setStdin({
                stdin: () => {
                    if (inputIdx < inputs.length) {
                        return inputs[inputIdx++] + '\n';
                    }
                    return null; // EOF
                }
            });
        } else {
            // Restore default safe stdin for runs without explicit input
            this.pyodide.setStdin({ stdin: () => null });
        }

        const startTime = performance.now();
        try {
            await this.pyodide.runPythonAsync(code);
        } catch (error) {
            stderr += error.message + '\n';
            if (originalOutput) {
                originalOutput(error.message + '\n', 'stderr');
            }
        }
        const endTime = performance.now();

        this.onOutput = originalOutput;

        return {
            stdout,
            stderr,
            duration: endTime - startTime
        };
    }

    setOutputCallback(callback) {
        this.onOutput = callback;
    }

    async writeFile(filename, content) {
        if (!this.pyodide) await this.load();
        this.pyodide.FS.writeFile(filename, content);
    }

    async deleteFile(filename) {
        if (!this.pyodide) await this.load();
        try {
            this.pyodide.FS.unlink(filename);
        } catch (e) {
            // Ignore if file doesn't exist
        }
    }
}

// Singleton instance
const pythonEngine = new PythonEngine();
export default pythonEngine;
