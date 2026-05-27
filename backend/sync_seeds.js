import pool from './db.js';
import fs from 'fs';
import path from 'path';

async function syncSeedImages() {
  try {
    const seedDir = path.resolve('public', 'images', 'seeds');
    
    // Grab every actual image file in your folder
    const actualFiles = fs.readdirSync(seedDir).filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );

    if (actualFiles.length === 0) {
      console.error("No images found in your seeds folder!");
      process.exit(1);
    }

    // Get all 100 seeds from the database
    const { rows } = await pool.query('SELECT id FROM seeds ORDER BY id ASC');

    console.log(`Syncing ${rows.length} seeds to your ${actualFiles.length} actual images...`);

    for (let i = 0; i < rows.length; i++) {
      // Loop through your actual files so there are never any blanks
      const fileName = actualFiles[i % actualFiles.length];
      const dbImageUrl = `/images/seeds/${fileName}`;

      await pool.query(
        'UPDATE seeds SET image_url = $1 WHERE id = $2',
        [dbImageUrl, rows[i].id]
      );
    }

    console.log('✅ Success! Your database now perfectly matches your seed folder.');
    process.exit();
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
}

syncSeedImages();