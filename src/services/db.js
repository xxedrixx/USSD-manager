import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

class DatabaseService {
    constructor() {
        this.dbName = 'ussd_manager';
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
        this.db = null;
    }

    async init() {
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
            icon TEXT
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
            FOREIGN KEY(carrier_id) REFERENCES carriers(id),
            FOREIGN KEY(folder_id) REFERENCES folders(id)
        );

        -- Seed Carriers
        INSERT OR IGNORE INTO carriers (id, name, color, logo) VALUES (1, 'Airtel', '#ff0000', 'A');
        INSERT OR IGNORE INTO carriers (id, name, color, logo) VALUES (2, 'Orange', '#ff6600', 'O');
        INSERT OR IGNORE INTO carriers (id, name, color, logo) VALUES (3, 'Yas', '#fwd300', 'Y');

        -- Seed Folders
        INSERT OR IGNORE INTO folders (id, name, icon) VALUES (1, 'General', '📁');
        INSERT OR IGNORE INTO folders (id, name, icon) VALUES (2, 'Banking', '🏦');
        INSERT OR IGNORE INTO folders (id, name, icon) VALUES (3, 'Mobile Money', '💰');
        `;

        await this.db.execute(schema);

        // Simple migration help for dev
        try { await this.db.execute("ALTER TABLE ussd_codes ADD COLUMN carrier_id INTEGER DEFAULT 1;"); } catch (e) { }
        try { await this.db.execute("ALTER TABLE ussd_codes ADD COLUMN folder_id INTEGER;"); } catch (e) { }
        try { await this.db.execute("ALTER TABLE ussd_codes ADD COLUMN contact_name TEXT;"); } catch (e) { }
        try { await this.db.execute("ALTER TABLE ussd_codes ADD COLUMN contact_number TEXT;"); } catch (e) { }
    }

    async getCodes() {
        const result = await this.db.query("SELECT * FROM ussd_codes ORDER BY is_favorite DESC, title ASC");
        return result.values;
    }

    async addCode(title, code, carrierId, folderId, contactName, contactNumber) {
        const statement = "INSERT INTO ussd_codes (title, code, carrier_id, folder_id, contact_name, contact_number) VALUES (?, ?, ?, ?, ?, ?)";
        const result = await this.db.run(statement, [title, code, carrierId, folderId || null, contactName, contactNumber]);
        return result.changes;
    }

    async deleteCode(id) {
        return await this.db.run("DELETE FROM ussd_codes WHERE id = ?", [id]);
    }

    async updateCode(id, title, code, carrierId, folderId, contactName, contactNumber) {
        return await this.db.run("UPDATE ussd_codes SET title = ?, code = ?, carrier_id = ?, folder_id = ?, contact_name = ?, contact_number = ? WHERE id = ?", [title, code, carrierId, folderId || null, contactName, contactNumber, id]);
    }

    async toggleFavorite(id, isFavorite) {
        return await this.db.run("UPDATE ussd_codes SET is_favorite = ? WHERE id = ?", [isFavorite ? 1 : 0, id]);
    }

    async getCategories() {
        // Legacy: alias to getFolders for now if needed, or just remove
        const result = await this.db.query("SELECT * FROM folders");
        return result.values;
    }

    async getFolders() {
        const result = await this.db.query("SELECT * FROM folders");
        return result.values;
    }

    async getCarriers() {
        const result = await this.db.query("SELECT * FROM carriers");
        return result.values;
    }
}

export const dbService = new DatabaseService();
