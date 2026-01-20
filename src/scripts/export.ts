import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import 'dotenv/config';

const CONTAINER_NAME = 'tts_dataset_db';
const DB_USER = process.env.POSTGRES_USER || 'admin';
const DB_NAME = process.env.POSTGRES_DB || 'tts_datasets';

// Generate filename with timestamp: backup-YYYY-MM-DD_HH-mm-ss.sql
const now = new Date();
const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
const OUTPUT_FILE = `backup-${timestamp}.sql`;

async function exportDb() {
    console.log(`📦 Exporting database '${DB_NAME}' from container '${CONTAINER_NAME}'...`);

    const command = `docker exec -t ${CONTAINER_NAME} pg_dump -U ${DB_USER} --clean --if-exists ${DB_NAME}`;

    exec(command, { maxBuffer: 1024 * 1024 * 50 }, async (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Export failed:', error);
            console.error(stderr);
            return;
        }

        try {
            await writeFile(OUTPUT_FILE, stdout);
            console.log(`✅ Database exported successfully to ${OUTPUT_FILE}`);
        } catch (err) {
            console.error('❌ Failed to write backup file:', err);
        }
    });
}

exportDb();
