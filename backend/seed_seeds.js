import pool from './db.js';
import fs from 'fs';
import path from 'path';

const seedNames = [
  'Heirloom Tomato', 'Sweet Basil', 'Sunflower', 'Jalapeño Pepper', 'Cilantro', 
  'Lavender', 'Carrot', 'Spinach', 'Marigold', 'Pumpkin',
  'Zucchini', 'Radish', 'Chamomile', 'Mint', 'Watermelon'
];

const badges = ['Best Seller', 'High Yield', 'Organic', 'New Arrival', null];
const categories = ['Vegetable', 'Herb', 'Flower', 'Fruit'];

async function populateSeeds() {
  try {
    // Look strictly inside the new seeds subfolder
    const imageDir = path.resolve('public', 'images', 'seeds');
    
    // Check if the folder exists
    if (!fs.existsSync(imageDir)) {
      console.error("The folder public/images/seeds does not exist! Please create it and add images.");
      process.exit(1);
    }

    const imageFiles = fs.readdirSync(imageDir).filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.error("No images found in public/images/seeds! Please add them.");
      process.exit(1);
    }

    await pool.query('TRUNCATE TABLE seeds RESTART IDENTITY');
    console.log('--- Initializing Verdant Seeds Database ---');

    for (let i = 1; i <= 50; i++) { // Let's start with 50 seed products
      const baseName = seedNames[Math.floor(Math.random() * seedNames.length)];
      const name = `${baseName} Seeds (Pack #${i})`;
      const category = categories[i % categories.length];
      const badge = badges[Math.floor(Math.random() * badges.length)];
      
      const imgFile = imageFiles[i % imageFiles.length];
      // Note the updated URL path to include /seeds/
      const imageUrl = `/images/seeds/${imgFile}`; 

      // Seeds are usually cheaper: ₹49 to ₹199
      const originalPrice = Math.floor(Math.random() * (199 - 49 + 1)) + 49;
      const discount = Math.random() > 0.6 ? [10, 15, 20][Math.floor(Math.random() * 3)] : 0;
      const currentPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount / 100)) : originalPrice;
      
      const rating = parseFloat((4.0 + Math.random() * 1.0).toFixed(1));
      const reviewCount = Math.floor(Math.random() * 300) + 5;

      await pool.query(
        `INSERT INTO seeds (name, category, image_url, badge, discount, original_price, current_price, rating, review_count) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [name, category, imageUrl, badge, discount, originalPrice, currentPrice, rating, reviewCount]
      );
    }

    console.log(`✅ Success! Seeded 50 items into the Verdant Seeds table using ${imageFiles.length} images.`);
    process.exit();
  } catch (err) {
    console.error('Error seeding Verdant Seeds:', err);
    process.exit(1);
  }
}

populateSeeds();