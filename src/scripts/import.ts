import { exec } from 'child_process';
import { createReadStream } from 'fs';
import { join } from 'path';
import 'dotenv/config';

const CONTAINER_NAME = 'tts_dataset_db';
const DB_USER = process.env.POSTGRES_USER || 'admin';
const DB_NAME = process.env.POSTGRES_DB || 'tts_datasets';

// Get filename from command line arguments
const INPUT_FILE = process.argv[2];

if (!INPUT_FILE) {
    console.error('❌ Please provide a backup file to import.');
    console.error('Usage: npm run import -- <filename>');
    process.exit(1);
}

async function importDb() {
    console.log(`📥 Importing database '${DB_NAME}' into container '${CONTAINER_NAME}' from ${INPUT_FILE}...`);

    // Use docker exec -i to read from stdin
    const command = `docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} ${DB_NAME}`;

    const child = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Import failed:', error);
            console.error(stderr);
            return;
        }
        console.log('✅ Database imported successfully.');
    });

    // Pipe the file to the child process's stdin
    const fileStream = createReadStream(INPUT_FILE);
    fileStream.pipe(child.stdin!);

    fileStream.on('error', (err) => {
        console.error('❌ Failed to read backup file:', err);
    });
}

importDb();
