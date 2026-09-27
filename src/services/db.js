import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { presets } from '../lib/presets';

const PRESETS_VERSION = '1';

// New codes go to the end of the list.
const INSERT_CODE = `INSERT INTO ussd_codes (title, code, category, carrier, display_order)
    VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(display_order), -1) + 1 FROM ussd_codes))`;

class DatabaseService {
    constructor() {
        this.dbName = 'ussd_manager_v2';
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
        this.db = null;
        this.isWeb = false;

        // Mock data for web
        this.mockData = {
            codes: []
        };
    }

    async init() {
        if (!Capacitor.isNativePlatform()) {
            this.isWeb = true;
            console.warn("Web platform detected: Using in-memory mock database.");
            this.seedMockData();
            return true;
        }

        try {
            this.db = await this.sqlite.createConnection(this.dbName, false, "no-encryption", 1, false);
            await this.db.open();
            await this.createTables();
            return true;
        } catch (err) {
            console.error('Error initializing database', err);
            return false;
        }
    }

    seedMockData() {
        const examples = [
            { title: 'Yellow 100 Yas', code: '#322*67#', category: 'SMS', carrier: 'yas', is_favorite: 1 },
            { title: 'MLay 500 Airtel', code: '*100*500#', category: 'SMS', carrier: 'airtel' },
            { title: 'Solde Orange', code: '#321#', category: 'ALL', carrier: 'orange' }
        ];
        this.mockData.codes = [...examples, ...presets].map((c, i) => ({
            is_favorite: 0,
            ...c,
            id: i + 1,
            display_order: i
        }));
    }

    async createTables() {
        const schema = `
        CREATE TABLE IF NOT EXISTS ussd_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            code TEXT NOT NULL,
            category TEXT DEFAULT 'ALL',
            carrier TEXT DEFAULT '',
            is_favorite INTEGER DEFAULT 0,
            usage_count INTEGER DEFAULT 0,
            display_order INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS app_meta (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT
        );
        `;
        await this.db.execute(schema);

        // Databases created by earlier versions have no carrier column.
        const columns = await this.db.query("PRAGMA table_info(ussd_codes)");
        if (!columns.values.some(c => c.name === 'carrier')) {
            await this.db.execute("ALTER TABLE ussd_codes ADD COLUMN carrier TEXT DEFAULT ''");
        }

        // Add the mobile money presets once. If the user deletes them, they stay deleted.
        const seeded = await this.db.query("SELECT value FROM app_meta WHERE key = 'presets_version'");
        if (seeded.values.length === 0) {
            await this.db.executeSet([
                ...presets.map(p => ({ statement: INSERT_CODE, values: [p.title, p.code, p.category, p.carrier] })),
                { statement: "INSERT INTO app_meta (key, value) VALUES ('presets_version', ?)", values: [PRESETS_VERSION] }
            ]);
        }
    }

    async getCodes() {
        if (this.isWeb) return [...this.mockData.codes].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        const result = await this.db.query("SELECT * FROM ussd_codes ORDER BY display_order ASC, is_favorite DESC, title ASC");
        return result.values;
    }

    async addCode(title, code, category, carrier) {
        if (this.isWeb) {
            const orders = this.mockData.codes.map(c => c.display_order || 0);
            this.mockData.codes.push({
                id: Date.now(),
                title, code, category: category || 'ALL', carrier: carrier || '',
                is_favorite: 0,
                display_order: orders.length ? Math.max(...orders) + 1 : 0
            });
            return;
        }
        await this.db.run(INSERT_CODE, [title, code, category || 'ALL', carrier || '']);
    }

    // Adds several codes at the end of the list in one transaction.
    async addCodes(codes) {
        if (this.isWeb) {
            for (const c of codes) await this.addCode(c.title, c.code, c.category, c.carrier);
            return;
        }
        await this.db.executeSet(codes.map(c => ({
            statement: INSERT_CODE,
            values: [c.title, c.code, c.category || 'ALL', c.carrier || '']
        })));
    }

    async updateCode(id, title, code, category, carrier) {
        if (this.isWeb) {
            const index = this.mockData.codes.findIndex(c => c.id === id);
            if (index !== -1) {
                this.mockData.codes[index] = { ...this.mockData.codes[index], title, code, category, carrier: carrier || '' };
            }
            return;
        }
        await this.db.run("UPDATE ussd_codes SET title = ?, code = ?, category = ?, carrier = ? WHERE id = ?", [title, code, category, carrier || '', id]);
    }

    async deleteCode(id) {
        if (this.isWeb) {
            this.mockData.codes = this.mockData.codes.filter(c => c.id !== id);
            return;
        }
        return await this.db.run("DELETE FROM ussd_codes WHERE id = ?", [id]);
    }

    async toggleFavorite(id, isFavorite) {
        if (this.isWeb) {
            const code = this.mockData.codes.find(c => c.id === id);
            if (code) code.is_favorite = isFavorite ? 1 : 0;
            return;
        }
        return await this.db.run("UPDATE ussd_codes SET is_favorite = ? WHERE id = ?", [isFavorite ? 1 : 0, id]);
    }

    // Saves the full list order in one transaction: ids[0] comes first.
    async saveOrder(ids) {
        if (this.isWeb) {
            ids.forEach((id, index) => {
                const code = this.mockData.codes.find(c => c.id === id);
                if (code) code.display_order = index;
            });
            return;
        }
        return await this.db.executeSet(ids.map((id, index) => ({
            statement: "UPDATE ussd_codes SET display_order = ? WHERE id = ?",
            values: [index, id]
        })));
    }
}

export const dbService = new DatabaseService();
