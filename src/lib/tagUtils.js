/**
 * Utility for detecting code patterns and suggesting tags/categories
 */

const PYTHON_PATTERNS = [
    { tag: 'Loops', regex: /\b(for|while)\b/g },
    { tag: 'Functions', regex: /\b(def|lambda)\b/g },
    { tag: 'Conditionals', regex: /\b(if|elif|else)\b/g },
    { tag: 'Data Structures', regex: /\b(list|dict|tuple|set|append|pop|update)\b/g },
    { tag: 'AI', regex: /\b(tensor|keras|torch|model|predict|train|fit)\b/g },
    { tag: 'Algorithms', regex: /\b(sort|binary|search|tree|graph|node)\b/g },
    { tag: 'CBSE', regex: /\b(input|print|math|random|csv|pickle)\b/gi }
];

const SQL_PATTERNS = [
    { tag: 'Basics', regex: /\b(SELECT|FROM|WHERE)\b/gi },
    { tag: 'DDL', regex: /\b(CREATE|ALTER|DROP|TABLE)\b/gi },
    { tag: 'DML', regex: /\b(INSERT|UPDATE|DELETE|INTO)\b/gi },
    { tag: 'Joins', regex: /\b(JOIN|INNER|LEFT|RIGHT|ON)\b/gi },
    { tag: 'Aggregates', regex: /\b(GROUP BY|HAVING|COUNT|SUM|AVG|MIN|MAX)\b/gi },
    { tag: 'CBSE', regex: /\b(STUDENT|COURSE|EMPLOYEE|DEPARTMENT)\b/gi }
];

export const detectTags = (code, language = 'Python') => {
    if (!code) return [];

    const patterns = language === 'SQL' ? SQL_PATTERNS : PYTHON_PATTERNS;
    const detected = new Set();

    // Add language tag
    detected.add(language);

    patterns.forEach(p => {
        if (p.regex.test(code)) {
            detected.add(p.tag);
        }
    });

    return Array.from(detected);
};

export const getSuggestedTitle = (code, language = 'Python') => {
    if (!code) return `My ${language} Program`;

    // Try to find a function name for Python
    if (language === 'Python') {
        const funcMatch = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        if (funcMatch) return `Function: ${funcMatch[1]}`;
    }

    // Try to find a table name for SQL
    if (language === 'SQL') {
        const tableMatch = code.match(/CREATE\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
        if (tableMatch) return `Table: ${tableMatch[1]}`;
    }

    return `My ${language} Program`;
};
