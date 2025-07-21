import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'orangebook_combined.sqlite');
const wasmPath = path.resolve(__dirname, 'sql-wasm.wasm');

export async function handler(event) {
    try {
        const ndc = event.queryStringParameters.ndc || '';
        const normalized = ndc.replace(/[^0-9]/g, '').padStart(11, '0');
        const dashed = `${normalized.slice(0, 5)}-${normalized.slice(5, 9)}-${normalized.slice(9)}`;

        console.log('🧊 Normalized NDC:', normalized);
        console.log('🌀 Dashed NDC for query:', dashed);
        console.log('📂 Loading SQLite DB from:', dbPath);

        const SQL = await initSqlJs({
            locateFile: () => wasmPath
        });

        const dbFile = fs.readFileSync(dbPath);
        const db = new SQL.Database(dbFile);

        console.log('🔍 Executing SQL query...');
        const query = `SELECT * FROM products WHERE matched_PRODUCTNDC = ? LIMIT 5`;
        const stmt = db.prepare(query);
        stmt.bind([dashed]);

        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ ndc, normalized, dashed, results })
        };
    } catch (err) {
        console.error('🔥 DB query error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
}
