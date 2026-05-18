class SqlEngine {
    constructor() {
        this.SQL = null;
        this.databases = {}; // { [dbName]: DatabaseInstance }
        this.activeDbName = null;
        this.isLoaded = false;
        this.onOutput = null;
    }

    async load() {
        if (this.isLoaded) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.js';
            script.onload = async () => {
                try {
                    const config = {
                        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
                    };
                    const initSqlJs = window.initSqlJs;
                    this.SQL = await initSqlJs(config);
                    // Initialize with a default 'master' DB if none exist
                    this.databases['master'] = new this.SQL.Database();
                    this.activeDbName = 'master';
                    this.isLoaded = true;
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setOutputCallback(callback) {
        this.onOutput = callback;
    }

    get activeDb() {
        return this.databases[this.activeDbName];
    }

    async run(query) {
        if (!this.isLoaded) await this.load();

        const cleanQuery = query.trim().replace(/;$/, '');
        const upperQuery = cleanQuery.toUpperCase();

        // --- Custom RDBMS Command Interception ---

        // 1. CREATE DATABASE [IF NOT EXISTS] db_name
        if (upperQuery.startsWith('CREATE DATABASE')) {
            const match = cleanQuery.match(/CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
            if (match) {
                const dbName = match[1].toLowerCase();
                if (this.databases[dbName]) {
                    if (upperQuery.includes('IF NOT EXISTS')) return { success: true, results: [], rowsModified: 0 };
                    return { success: false, error: `Can't create database '${dbName}'; database exists` };
                }
                this.databases[dbName] = new this.SQL.Database();
                return { success: true, results: [], rowsModified: 0, message: `Database '${dbName}' created.` };
            }
        }

        // 2. USE db_name
        if (upperQuery.startsWith('USE ')) {
            const dbName = cleanQuery.split(/\s+/)[1].replace(/;$/, '').toLowerCase();
            if (this.databases[dbName]) {
                this.activeDbName = dbName;
                return { success: true, results: [], rowsModified: 0, message: `Database changed to '${dbName}'.` };
            }
            return { success: false, error: `Unknown database '${dbName}'` };
        }

        // 3. SHOW DATABASES
        if (upperQuery === 'SHOW DATABASES') {
            const values = Object.keys(this.databases).map(d => [d]);
            return { success: true, results: [{ columns: ['Database'], values }], rowsModified: 0 };
        }

        // 4. SHOW TABLES
        if (upperQuery === 'SHOW TABLES') {
            if (!this.activeDb) return { success: false, error: 'No database selected' };
            const res = this.activeDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
            const values = res.length > 0 ? res[0].values : [];
            return { success: true, results: [{ columns: [`Tables_in_${this.activeDbName}`], values }], rowsModified: 0 };
        }

        // 5. DESCRIBE/DESC table_name
        if (upperQuery.startsWith('DESC ') || upperQuery.startsWith('DESCRIBE ')) {
            const tableName = cleanQuery.split(/\s+/)[1].replace(/;$/, '');
            if (!this.activeDb) return { success: false, error: 'No database selected' };
            try {
                const res = this.activeDb.exec(`PRAGMA table_info(${tableName})`);
                if (res.length === 0) return { success: false, error: `Table '${tableName}' doesn't exist` };
                // Map SQLite columns to MySQL-ish: Field, Type, Null, Key, Default, Extra
                const values = res[0].values.map(v => [v[1], v[2], v[3] === 0 ? 'YES' : 'NO', v[5] === 1 ? 'PRI' : '', v[4], '']);
                return { success: true, results: [{ columns: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'], values }], rowsModified: 0 };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }

        // --- Standard Query Execution ---
        if (!this.activeDb) return { success: false, error: 'No database selected' };

        const results = [];
        let totalRowsModified = 0;
        const startTime = performance.now();

        try {
            const queries = query.split(';').filter(q => q.trim());
            for (const q of queries) {
                const res = this.activeDb.exec(q);
                if (res.length > 0) results.push(...res);
                totalRowsModified += this.activeDb.getRowsModified();
            }

            const duration = performance.now() - startTime;
            return { success: true, results, rowsModified: totalRowsModified, duration };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getSchema() {
        if (!this.activeDb) return [];
        try {
            const res = this.activeDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
            if (res.length === 0) return [];
            const tables = [];
            for (const row of res[0].values) {
                const tableName = row[0];
                const columnsRes = this.activeDb.exec(`PRAGMA table_info(${tableName})`);
                const columns = columnsRes.length > 0 ? columnsRes[0].values.map(col => ({
                    name: col[1], type: col[2], notnull: col[3] === 1, pk: col[5] === 1
                })) : [];
                tables.push({ name: tableName, columns, foreignKeys: [] });
            }
            return tables;
        } catch (err) {
            return [];
        }
    }

    exportAll() {
        const state = { active: this.activeDbName, dbs: {} };
        for (const [name, db] of Object.entries(this.databases)) {
            const binary = db.export();
            state.dbs[name] = btoa(String.fromCharCode(...binary));
        }
        return state;
    }

    async importAll(state) {
        if (!this.isLoaded) await this.load();
        if (!state || !state.dbs) return;
        this.databases = {};
        for (const [name, base64] of Object.entries(state.dbs)) {
            const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            this.databases[name] = new this.SQL.Database(binary);
        }
        this.activeDbName = state.active || Object.keys(this.databases)[0] || 'master';
    }

    async loadSampleDataset() {
        const sampleSql = `
            CREATE TABLE IF NOT EXISTS Student (roll_no INT PRIMARY KEY, name VARCHAR(50), class VARCHAR(10), marks INT);
            CREATE TABLE IF NOT EXISTS Course (course_id INT PRIMARY KEY, course_name VARCHAR(50), teacher_name VARCHAR(50));
            INSERT OR IGNORE INTO Student VALUES (1, 'Arjun Singh', '12-A', 85), (2, 'Priya Sharma', '12-B', 92);
            INSERT OR IGNORE INTO Course VALUES (101, 'Computer Science', 'Mr. Amit'), (102, 'Mathematics', 'Ms. Sneha');
        `;
        if (!this.databases['master']) this.databases['master'] = new this.SQL.Database();
        this.activeDbName = 'master';
        return this.run(sampleSql);
    }

    reset() {
        this.databases = { 'master': new this.SQL.Database() };
        this.activeDbName = 'master';
    }
}

const sqlEngine = new SqlEngine();
export default sqlEngine;
