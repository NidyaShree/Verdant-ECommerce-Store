import pool from './db.js';
import fs from 'fs';
import path from 'path';

const plantNames = [
  'Aloe Vera', 'Snake Plant', 'Peace Lily', 'Monstera Deliciosa', 'Pothos', 
  'Spider Plant', 'Boston Fern', 'Fiddle Leaf Fig', 'ZZ Plant', 'Rubber Plant'
];

const badges = ['Best Seller', 'Top Rated', 'Trending', null];
const categories = ['Indoor Plant', 'Low Maintenance', 'Air Purifying'];

async function seedDatabase() {
  try {
    // Read the actual files inside your public/images folder
    const imageDir = path.resolve('public', 'images');
    const imageFiles = fs.readdirSync(imageDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png')
    );

    if (imageFiles.length === 0) {
      console.error("No images found in public/images! Make sure they are there.");
      process.exit(1);
    }

    // Clear existing items if any
    await pool.query('TRUNCATE TABLE plants RESTART IDENTITY');

    console.log('Seeding 100 plants into database...');

    for (let i = 1; i <= 100; i++) {
      const baseName = plantNames[i % plantNames.length];
      const name = `${baseName} (Batch #${i})`;
      const category = categories[i % categories.length];
      const badge = badges[i % badges.length];
      
      // Grab an actual image name from your folder
      const randomImageName = imageFiles[i % imageFiles.length];
      const imageUrl = `/images/${randomImageName}`; 

      const discount = Math.random() > 0.4 ? [10, 15, 20, 25, 30][i % 5] : 0;
      const originalPrice = Math.floor(Math.random() * (999 - 299 + 1)) + 299;
      const currentPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount / 100)) : originalPrice;
      
      const rating = parseFloat((4.0 + Math.random() * 1.0).toFixed(1));
      const reviewCount = Math.floor(Math.random() * 600) + 10;

      await pool.query(
        `INSERT INTO plants (name, category, image_url, badge, discount, original_price, current_price, rating, review_count) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [name, category, imageUrl, badge, discount, originalPrice, currentPrice, rating, reviewCount]
      );
    }

    console.log('Successfully seeded 100 plant products!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();