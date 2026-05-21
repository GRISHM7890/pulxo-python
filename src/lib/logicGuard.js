import { ai } from './firebase';
import { getGenerativeModel } from 'firebase/ai';

// A beautiful local coaching dictionary mapping error IDs to rich, relatable everyday analogies.
export const localCoachingDict = {
    "zero_division": {
        analogy: "Imagine trying to share 10 glowing energy cells among exactly 0 robots. How many cells does each robot get? The universe breaks because you can't divide something among nobody!",
        hint: "Check the variable you are dividing by. Can you add an 'if' statement to verify it's not zero before dividing?",
        encouragement: "Math barriers can be strict! Protecting your code against division by zero is a classic hallmark of a robust developer."
    },
    "missing_colon": {
        analogy: "In Python, a colon is like a gatekeeper. It tells Python: 'Hey! The instructions for what to do in this block are right through here.' Without it, Python gets stuck at the threshold.",
        hint: "Look closely at the very end of this line. Is there a gateway symbol (:) missing to open your code block?",
        encouragement: "Almost there! Colons are one of the most common syntax items beginners miss, and even veteran coders forget them daily."
    },
    "infinite_loop": {
        analogy: "Imagine running on a high-speed cyberpunk treadmill that has no stop button and no way to step off. You'll run forever and freeze the console! We need a safety key.",
        hint: "How will Python know when it has completed its work inside this loop? Can you add a 'break' statement or make sure the condition becomes False?",
        encouragement: "Loops are incredibly powerful, but infinite ones can lock up the processor. Let's add an elegant exit route!"
    },
    "silent_except": {
        analogy: "Imagine a smoke detector in your house that triggers, but instead of ringing a loud alarm, it silently deletes the warning log. That's what catching an error with 'pass' does—it hides the fire!",
        hint: "Instead of a silent 'pass', consider printing the error (e.g., print(f'An error occurred: {e}')) so you can see what is happening.",
        encouragement: "Exception handling is excellent! Let's just make sure we don't sweep the bugs under the digital rug."
    },
    "nested_loops": {
        analogy: "Imagine you're searching a library. For every single book you pull off the shelf, you read every other book in the library from start to finish! That's O(N²) nested loop complexity. It slows down dramatically.",
        hint: "Is there a way to extract the lookup data into a set or dictionary first, so you can do a constant-time search instead of a nested loop?",
        encouragement: "You're writing complex nested logic now! That's awesome. Now let's work on optimization to make it lightning-fast."
    },
    "unmatched_bracket": {
        analogy: "Brackets are like mechanical hands holding a cargo package. If you open a bracket, you need the other hand to close it. Right now, one mechanical hand is grasping thin air!",
        hint: "Check this line for mismatched pairs of brackets. Every '(' needs a ')', '[' needs a ']', and '{' needs a '}'.",
        encouragement: "Mismatched brackets are like jigsaw pieces that don't quite fit. Keep your eyes sharp—you'll find the mate!"
    }
};

/**
 * Perform instantaneous local static analysis on Python/SQL code.
 * Yields 0ms latency diagnostics for typical beginner coding pitfalls.
 */
export const auditCodeLocally = (code, language = 'Python') => {
    if (!code) return [];
    
    const problems = [];
    const lines = code.split('\n');

    if (language.toLowerCase() === 'python') {
        // 1. Bracket mismatch parsing (global)
        const stack = [];
        const bracketPairs = { '(': ')', '[': ']', '{': '}' };
        const openingBrackets = new Set(['(', '[', '{']);
        const closingBrackets = new Set([')', ']', '}']);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].split('#')[0]; // ignore comments
            for (let charIdx = 0; charIdx < line.length; charIdx++) {
                const char = line[charIdx];
                if (openingBrackets.has(char)) {
                    stack.push({ char, line: i + 1 });
                } else if (closingBrackets.has(char)) {
                    if (stack.length === 0) {
                        problems.push({
                            line: i + 1,
                            message: `Syntax Error: Unmatched closing bracket '${char}'. There is no opening bracket matching it.`,
                            type: 'error',
                            id: 'unmatched_bracket',
                            fix: null
                        });
                    } else {
                        const last = stack.pop();
                        if (bracketPairs[last.char] !== char) {
                            problems.push({
                                line: i + 1,
                                message: `Syntax Error: Mismatched brackets! Expected '${bracketPairs[last.char]}' to close the opening '${last.char}' from Line ${last.line}, but found '${char}' instead.`,
                                type: 'error',
                                id: 'unmatched_bracket',
                                fix: null
                            });
                        }
                    }
                }
            }
        }
        // Remaining unclosed brackets
        stack.forEach(unclosed => {
            problems.push({
                line: unclosed.line,
                message: `Syntax Error: Unclosed bracket '${unclosed.char}'. Don't forget to close it with '${bracketPairs[unclosed.char]}'!`,
                type: 'error',
                id: 'unmatched_bracket',
                fix: null
            });
        });

        // Line by line analysis
        let inLoop = false;
        let loopIndent = -1;

        lines.forEach((originalLine, idx) => {
            const lineNum = idx + 1;
            const cleanedLine = originalLine.split('#')[0].trim();
            const originalIndent = originalLine.match(/^\s*/)[0].length;

            if (cleanedLine === '') return;

            // 2. Missing colons for blocks
            const colonKeywords = ['if', 'elif', 'else', 'def', 'for', 'while', 'class', 'try', 'except'];
            const startsWithKeyword = colonKeywords.find(kw => 
                cleanedLine.startsWith(kw + ' ') || 
                cleanedLine === kw || 
                cleanedLine.startsWith(kw + '(') || 
                cleanedLine.startsWith(kw + ':')
            );
            
            if (startsWithKeyword) {
                if (!cleanedLine.endsWith(':')) {
                    problems.push({
                        line: lineNum,
                        message: `Missing colon (:) at the end of the '${startsWithKeyword}' statement. In Python, blocks must start with a colon!`,
                        type: 'error',
                        id: 'missing_colon',
                        fix: originalLine + ':'
                    });
                }
            }

            // 3. Division by Zero
            if (/\/\s*0(?!\d)/.test(cleanedLine) || /%\s*0(?!\d)/.test(cleanedLine)) {
                problems.push({
                    line: lineNum,
                    message: `ZeroDivisionError: You are dividing or using modulo with zero, which will crash your program instantly.`,
                    type: 'error',
                    id: 'zero_division',
                    fix: null
                });
            }

            // 4. Silent exceptions
            if (cleanedLine.startsWith('except') && cleanedLine.endsWith(':')) {
                let onlyPass = true;
                let foundContent = false;
                for (let j = idx + 1; j < lines.length; j++) {
                    const nextLine = lines[j];
                    const nextIndent = nextLine.match(/^\s*/)[0].length;
                    if (nextLine.trim() === '') continue;
                    if (nextIndent <= originalIndent) break; // Exited except block
                    foundContent = true;
                    const nextCleaned = nextLine.split('#')[0].trim();
                    if (nextCleaned !== 'pass' && nextCleaned !== '') {
                        onlyPass = false;
                    }
                }
                if (foundContent && onlyPass) {
                    problems.push({
                        line: lineNum,
                        message: `Silent Exception Warning: You are swallowing an exception with 'pass'. This can make debugging extremely difficult!`,
                        type: 'warning',
                        id: 'silent_except',
                        fix: null
                    });
                }
            }

            // 5. Infinite loop hazard (while True without break)
            if (cleanedLine.startsWith('while ') || cleanedLine.startsWith('while(')) {
                const isAlwaysTrue = cleanedLine.includes('True') || cleanedLine.includes('1') || cleanedLine.includes('while :');
                if (isAlwaysTrue) {
                    let hasBreak = false;
                    for (let j = idx + 1; j < lines.length; j++) {
                        const nextLine = lines[j];
                        const nextIndent = nextLine.match(/^\s*/)[0].length;
                        if (nextLine.trim() === '') continue;
                        if (nextIndent <= originalIndent) break; // Exited loop
                        if (/\bbreak\b/.test(nextLine.split('#')[0])) {
                            hasBreak = true;
                            break;
                        }
                    }
                    if (!hasBreak) {
                        problems.push({
                            line: lineNum,
                            message: `Infinite Loop Hazard: This loop runs forever because the condition is always True and there is no 'break' statement.`,
                            type: 'error',
                            id: 'infinite_loop',
                            fix: null
                        });
                    }
                }
            }

            // 6. Inefficient Nested loops
            if (cleanedLine.startsWith('for ') || cleanedLine.startsWith('while ')) {
                if (inLoop && originalIndent > loopIndent) {
                    problems.push({
                        line: lineNum,
                        message: `Nested Loop Detected (O(N²) Warning): You have placed a loop inside another loop. Be careful, this can be highly inefficient!`,
                        type: 'warning',
                        id: 'nested_loops',
                        fix: null
                    });
                }
                inLoop = true;
                loopIndent = originalIndent;
            } else if (originalIndent <= loopIndent) {
                // Reset loop tracking if we returned to or below loop indentation
                inLoop = originalIndent === loopIndent;
            }
        });
    }

    // Attach local coaching block fallback
    return problems.map(prob => ({
        ...prob,
        coaching: localCoachingDict[prob.id] || {
            analogy: "Computers are exact machines that read instruction lines step-by-step. A small hitch here is stopping Python from understanding your goal.",
            hint: "Take a close look at this line. Check if there are typos or formatting elements that don't match Python rules.",
            encouragement: "Every bug solved is a stepping stone to mastery! Let's examine this together."
        }
    }));
};

/**
 * Deep semantic audit using Gemini API.
 * Identifies logic issues, unoptimized structures, and structural bugs.
 */
export const auditCode = async (code, language = 'Python') => {
    if (!code || code.length < 5) return [];

    try {
        const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

        const prompt = `
            Act as an elite Production-Grade Code Auditor and Friendly Socratic Coach.
            Analyze the following ${language} code for:
            1. Logical Pitfalls: Bugs, off-by-one errors, formulas that do nothing (e.g. x = x * 1), and incorrect conditionals.
            2. Production Readiness: Faulty edge cases, unprotected divisions.
            3. Optimization: Redundant operations, sequential linear lookups inside loops that could be dictionaries/sets, heavy loop operations.

            CODE:
            ${code}

            You MUST return ONLY a valid JSON array of problems. Do not include markdown code block formatting like \`\`\`json. Return a raw JSON array.
            Each problem object MUST have:
            - line: (number, 1-indexed)
            - message: (string, a concise production-level linter explanation)
            - type: ('error' or 'warning')
            - fix: (string, the corrected code for just that line, or null if no simple fix)
            - coaching: (an object with these exact three fields for beginner friendly support):
                - analogy: (string, a warm, highly relatable everyday metaphor or real-world story translating this problem for a beginner)
                - hint: (string, a socratic prompt/question that guides them to the solution instead of telling it)
                - encouragement: (string, a supportive, motivational, friendly phrase)

            Example Output:
            [
              {
                "line": 3,
                "message": "Factorial logic is incorrect; multiplying by 1 has no effect.",
                "type": "error",
                "fix": "fact = fact * k",
                "coaching": {
                  "analogy": "Imagine trying to bake a taller cake, but instead of adding new layers, you keep polishing the first layer. The cake never gets taller!",
                  "hint": "What variable holds the current value in our loop counter? Should we multiply by that variable instead of multiplying by a static 1?",
                  "encouragement": "Analyzing nested calculations is challenging! You've got the loop structural setup perfect, now let's just make the calculations dynamic."
                }
              }
            ]
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        // Extract JSON from potential markdown blocks
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        const parsedProblems = JSON.parse(text);

        // Ensure all problems have a valid coaching object
        return parsedProblems.map(prob => {
            if (!prob.coaching || !prob.coaching.analogy) {
                return {
                    ...prob,
                    coaching: {
                        analogy: "Imagine sending a robot instructions to build a box, but omitting one wall. It will try to put items inside, but they'll keep falling out!",
                        hint: "Take a close look at this line. Ask yourself: is the value being updated, or is it remaining static?",
                        encouragement: "Coding is all about experimenting! You're doing great, let's just tune this line."
                    }
                };
            }
            return prob;
        });

    } catch (err) {
        console.error("Logic Audit failed:", err);
        return [];
    }
};
