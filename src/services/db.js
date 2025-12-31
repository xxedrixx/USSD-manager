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
            carriers: [],
            folders: [],
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
        this.mockData.carriers = [
            { id: 1, name: 'Airtel', color: '#ff0000', logo: 'A' },
            { id: 2, name: 'Orange', color: '#ff6600', logo: 'O' }
        ];
        this.mockData.folders = [
            { id: 1, name: 'General', icon: '📁', carrier_id: 1 },
            { id: 2, name: 'Banking', icon: '🏦', carrier_id: 1 }
        ];
        this.mockData.codes = [];
    }

    async createTables() {
        const schema = `
        CREATE TABLE IF NOT EXISTS carriers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT,
            logo TEXT
        );

        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT,
            carrier_id INTEGER,
            FOREIGN KEY(carrier_id) REFERENCES carriers(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS ussd_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            code TEXT NOT NULL,
            carrier_id INTEGER,
            folder_id INTEGER,
            contact_name TEXT,
            contact_number TEXT,
            is_favorite INTEGER DEFAULT 0,
            usage_count INTEGER DEFAULT 0,
            FOREIGN KEY(carrier_id) REFERENCES carriers(id) ON DELETE CASCADE,
            FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE SET NULL
        );

        -- Seed data omitted for brevity in native SQL as it's similar
        `;
        await this.db.execute(schema);
        // Ensure default data exists
        const count = await this.db.query("SELECT count(*) as c FROM carriers");
        if (count.values[0].c === 0) {
            await this.db.run("INSERT INTO carriers (name, color, logo) VALUES ('Airtel', '#ff0000', 'A')");
            await this.db.run("INSERT INTO carriers (name, color, logo) VALUES ('Orange', '#ff6600', 'O')");
        }
    }

    async getCarriers() {
        if (this.isWeb) return [...this.mockData.carriers];
        const result = await this.db.query("SELECT * FROM carriers");
        return result.values;
    }

    async addCarrier(name) {
        if (this.isWeb) {
            const newId = this.mockData.carriers.length + 1 + Math.random();
            this.mockData.carriers.push({ id: newId, name, color: '#cccccc', logo: name[0] });
            return;
        }
        await this.db.run("INSERT INTO carriers (name) VALUES (?)", [name]);
    }

    async deleteCarrier(id) {
        if (this.isWeb) {
            this.mockData.carriers = this.mockData.carriers.filter(c => c.id !== id);
            return;
        }
        await this.db.run("DELETE FROM carriers WHERE id = ?", [id]);
    }

    async getFolders(carrierId) {
        if (this.isWeb) {
            // If carrierId is provided, filter by it. Assuming v2 logic implies folders belong to carriers.
            // But my App.svelte logic passed folders as flat list previously?
            // Let's support both.
            if (carrierId) return this.mockData.folders.filter(f => f.carrier_id == carrierId);
            return [...this.mockData.folders];
        }
        let query = "SELECT * FROM folders";
        if (carrierId) query += ` WHERE carrier_id = ${carrierId}`;
        const result = await this.db.query(query);
        return result.values;
    }

    async getCodes() {
        if (this.isWeb) return [...this.mockData.codes];
        const result = await this.db.query("SELECT * FROM ussd_codes ORDER BY is_favorite DESC, title ASC");
        return result.values;
    }

    async addCode(title, code, carrierId, folderId, contactName, contactNumber) {
        if (this.isWeb) {
            this.mockData.codes.push({
                id: Date.now(),
                title, code, carrier_id: carrierId, folder_id: folderId, contact_name: contactName, contact_number: contactNumber,
                is_favorite: 0
            });
            return;
        }
        const statement = "INSERT INTO ussd_codes (title, code, carrier_id, folder_id, contact_name, contact_number) VALUES (?, ?, ?, ?, ?, ?)";
        await this.db.run(statement, [title, code, carrierId, folderId || null, contactName, contactNumber]);
    }

    async updateCode(id, title, code, carrierId, folderId, contactName, contactNumber) {
        if (this.isWeb) {
            const index = this.mockData.codes.findIndex(c => c.id === id);
            if (index !== -1) {
                this.mockData.codes[index] = { ...this.mockData.codes[index], title, code, carrier_id: carrierId, folder_id: folderId };
            }
            return;
        }
        await this.db.run("UPDATE ussd_codes SET title = ?, code = ?, carrier_id = ?, folder_id = ?, contact_name = ?, contact_number = ? WHERE id = ?", [title, code, carrierId, folderId || null, contactName, contactNumber, id]);
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
}

export const dbService = new DatabaseService();
