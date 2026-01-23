import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

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
        this.mockData.codes = [
            { id: 1, title: 'Yellow 100 Yas', code: '#322*67#', category: 'SMS', is_favorite: 1 },
            { id: 2, title: 'MLay 500 Airtel', code: '*100*500#', category: 'SMS', is_favorite: 0 },
            { id: 3, title: 'Solde Orange', code: '#321#', category: 'ALL', is_favorite: 0 }
        ];
    }

    async createTables() {
        const schema = `
        CREATE TABLE IF NOT EXISTS ussd_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            code TEXT NOT NULL,
            category TEXT DEFAULT 'ALL',
            is_favorite INTEGER DEFAULT 0,
            usage_count INTEGER DEFAULT 0,
            display_order INTEGER DEFAULT 0
        );
        `;
        await this.db.execute(schema);

        // Ensure default data exists
        const count = await this.db.query("SELECT count(*) as c FROM ussd_codes");
        if (count.values[0].c === 0) {
            await this.db.run("INSERT INTO ussd_codes (title, code, category) VALUES ('Check Balance', '*123#', 'ALL')");
        }
    }

    async getCodes() {
        if (this.isWeb) return [...this.mockData.codes].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        const result = await this.db.query("SELECT * FROM ussd_codes ORDER BY display_order ASC, is_favorite DESC, title ASC");
        return result.values;
    }

    async addCode(title, code, category) {
        if (this.isWeb) {
            this.mockData.codes.push({
                id: Date.now(),
                title, code, category: category || 'ALL',
                is_favorite: 0
            });
            return;
        }
        const statement = "INSERT INTO ussd_codes (title, code, category) VALUES (?, ?, ?)";
        await this.db.run(statement, [title, code, category || 'ALL']);
    }

    async updateCode(id, title, code, category) {
        if (this.isWeb) {
            const index = this.mockData.codes.findIndex(c => c.id === id);
            if (index !== -1) {
                this.mockData.codes[index] = { ...this.mockData.codes[index], title, code, category };
            }
            return;
        }
        await this.db.run("UPDATE ussd_codes SET title = ?, code = ?, category = ? WHERE id = ?", [title, code, category, id]);
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

    async updateOrder(id, order) {
        if (this.isWeb) {
            const code = this.mockData.codes.find(c => c.id === id);
            if (code) code.display_order = order;
            return;
        }
        return await this.db.run("UPDATE ussd_codes SET display_order = ? WHERE id = ?", [order, id]);
    }
}

export const dbService = new DatabaseService();
