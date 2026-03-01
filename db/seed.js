const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const seedData = require('./seed-data.json');

async function seed() {
  try {
    console.log('Starting database seed...');
    
    // Insert coffees
    for (const coffee of seedData.coffees) {
      await pool.query(`
        INSERT INTO coffees (product_url, name, roaster, price_inr, weight_grams, price_per_100g, origin_estate, variety, roast_level, processing_method, scraped_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        ON CONFLICT (product_url) DO UPDATE SET
          price_inr = EXCLUDED.price_inr,
          price_per_100g = EXCLUDED.price_per_100g,
          updated_at = NOW()
      `, [
        coffee.product_url,
        coffee.name,
        coffee.roaster,
        coffee.price_inr,
        coffee.weight_grams,
        coffee.price_per_100g,
        coffee.origin_estate,
        coffee.variety,
        coffee.roast_level,
        coffee.processing_method,
        coffee.scraped_date
      ]);
    }
    
    // Insert price history
    for (const coffee of seedData.coffees) {
      await pool.query(`
        INSERT INTO price_history (product_url, price_inr, scraped_date, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [coffee.product_url, coffee.price_inr, coffee.scraped_date]);
    }
    
    console.log(`Seeded ${seedData.coffees.length} coffees`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
