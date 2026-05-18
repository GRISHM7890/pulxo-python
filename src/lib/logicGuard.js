import { ai } from './firebase';
import { getGenerativeModel } from 'firebase/ai';

/**
 * Audit code for logical flaws, production readiness, and optimizations.
 * Returns an array of problem objects: { line, message, type, fix }
 */
export const auditCode = async (code, language = 'Python') => {
    if (!code || code.length < 5) return [];

    try {
        const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

        const prompt = `
            Act as an elite Production-Grade Code Auditor. 
            Analyze the following ${language} code for:
            1. Logical Pitfalls: Bugs, off-by-one errors, incorrect formulas (e.g., fact = fact * 1).
            2. Production Readiness: Error handling, edge cases.
            3. Optimization: Redundant code, inefficient loops.

            CODE:
            ${code}

            Return ONLY a JSON array of problems. Each problem must have:
            - line: (number, 1-indexed)
            - message: (string, concise explanation)
            - type: ('error' or 'warning')
            - fix: (string, the corrected code for just that line/block, or null if no simple fix)

            Example JSON output:
            [{"line": 3, "message": "Factorial logic is incorrect; multiplying by 1 has no effect.", "type": "error", "fix": "fact = fact * k"}]
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from potential markdown blocks
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return [];
    } catch (err) {
        console.error("Logic Audit failed:", err);
        return [];
    }
};
