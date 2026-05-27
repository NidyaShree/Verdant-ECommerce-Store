import pool from './db.js';
import fs from 'fs';
import path from 'path';

async function syncDatabaseToFiles() {
  try {
    const imageDir = path.resolve('public', 'images');
    const actualFiles = fs.readdirSync(imageDir).filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );

    const { rows } = await pool.query('SELECT id FROM plants ORDER BY id ASC');

    console.log(`Syncing ${rows.length} database entries to ${actualFiles.length} actual files...`);

    for (let i = 0; i < rows.length; i++) {
      // Rotate through actual existing files so none are ever blank
      const fileName = actualFiles[i % actualFiles.length];
      const dbImageUrl = `/images/${fileName}`;

      await pool.query(
        'UPDATE plants SET image_url = $1 WHERE id = $2',
        [dbImageUrl, rows[i].id]
      );
    }

    console.log('✅ Success! Database image paths now match your folder exactly.');
    process.exit();
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
}

syncDatabaseToFiles();