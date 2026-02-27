const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

async function createTables(client) {
  console.log('Creating tables if they do not exist...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS coffees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      roaster VARCHAR(255) NOT NULL,
      origin VARCHAR(255),
      process VARCHAR(100),
      roast_level VARCHAR(50),
      description TEXT,
      product_url TEXT UNIQUE NOT NULL,
      image_url TEXT,
      current_price NUMERIC(10, 2),
      currency VARCHAR(10) DEFAULT 'USD',
      weight_grams INTEGER,
      is_available BOOLEAN DEFAULT true,
      average_rating NUMERIC(3, 2),
      review_count INTEGER DEFAULT 0,
      flavor_notes TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS price_history (
      id SERIAL PRIMARY KEY,
      coffee_id INTEGER NOT NULL REFERENCES coffees(id) ON DELETE CASCADE,
      price NUMERIC(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_coffees_roaster ON coffees(roaster);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_coffees_current_price ON coffees(current_price);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_price_history_coffee_id ON price_history(coffee_id);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);
  `);

  console.log('Tables and indexes are ready.');
}

async function upsertCoffee(client, coffee) {
  const {
    name,
    roaster,
    origin = null,
    process = null,
    roast_level = null,
    description = null,
    product_url,
    image_url = null,
    current_price = null,
    currency = 'USD',
    weight_grams = null,
    is_available = true,
    average_rating = null,
    review_count = 0,
    flavor_notes = [],
  } = coffee;

  if (!name || !roaster || !product_url) {
    throw new Error(
      `Coffee record is missing required fields (name, roaster, product_url): ${JSON.stringify(coffee)}`
    );
  }

  const result = await client.query(
    `
    INSERT INTO coffees (
      name,
      roaster,
      origin,
      process,
      roast_level,
      description,
      product_url,
      image_url,
      current_price,
      currency,
      weight_grams,
      is_available,
      average_rating,
      review_count,
      flavor_notes,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
    ON CONFLICT (product_url) DO UPDATE SET
      name            = EXCLUDED.name,
      roaster         = EXCLUDED.roaster,
      origin          = EXCLUDED.origin,
      process         = EXCLUDED.process,
      roast_level     = EXCLUDED.roast_level,
      description     = EXCLUDED.description,
      image_url       = EXCLUDED.image_url,
      current_price   = EXCLUDED.current_price,
      currency        = EXCLUDED.currency,
      weight_grams    = EXCLUDED.weight_grams,
      is_available    = EXCLUDED.is_available,
      average_rating  = EXCLUDED.average_rating,
      review_count    = EXCLUDED.review_count,
      flavor_notes    = EXCLUDED.flavor_notes,
      updated_at      = NOW()
    RETURNING id, name, (xmax = 0) AS inserted
    `,
    [
      name,
      roaster,
      origin,
      process,
      roast_level,
      description,
      product_url,
      image_url,
      current_price,
      currency,
      weight_grams,
      is_available,
      average_rating,
      review_count,
      flavor_notes,
    ]
  );

  return result.rows[0];
}

async function insertPriceHistory(client, coffeeId, priceEntries) {
  if (!Array.isArray(priceEntries) || priceEntries.length === 0) {
    return 0;
  }

  let inserted = 0;

  for (const entry of priceEntries) {
    const price = entry.price !== undefined ? entry.price : entry;
    const currency = entry.currency || 'USD';
    const recorded_at = entry.recorded_at || entry.date || new Date().toISOString();

    if (price === null || price === undefined || isNaN(Number(price))) {
      console.warn(`  Skipping invalid price entry for coffee_id=${coffeeId}:`, entry);
      continue;
    }

    await client.query(
      `
      INSERT INTO price_history (coffee_id, price, currency, recorded_at)
      VALUES ($1, $2, $3, $4)
      `,
      [coffeeId, Number(price), currency, recorded_at]
    );

    inserted++;
  }

  return inserted;
}

async function seed() {
  const seedFilePath = path.join(__dirname, 'seed-data.json');

  console.log(`Reading seed data from: ${seedFilePath}`);

  if (!fs.existsSync(seedFilePath)) {
    console.error(`ERROR: seed-data.json not found at ${seedFilePath}`);
    process.exit(1);
  }

  let seedData;
  try {
    const raw = fs.readFileSync(seedFilePath, 'utf8');
    seedData = JSON.parse(raw);
  } catch (err) {
    console.error('ERROR: Failed to parse seed-data.json:', err.message);
    process.exit(1);
  }

  const coffees = Array.isArray(seedData) ? seedData : seedData.coffees;

  if (!Array.isArray(coffees) || coffees.length === 0) {
    console.error(
      'ERROR: seed-data.json must contain an array of coffees (root array or { coffees: [...] }).'
    );
    process.exit(1);
  }

  console.log(`Found ${coffees.length} coffee record(s) to seed.\n`);

  const client = await pool.connect();

  try {
    await createTables(client);

    console.log('\nBeginning seed transaction...');
    await client.query('BEGIN');

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalPriceHistoryInserted = 0;
    let totalErrors = 0;

    for (let i = 0; i < coffees.length; i++) {
      const coffee = coffees[i];
      const index = i + 1;

      try {
        const row = await upsertCoffee(client, coffee);
        const coffeeId = row.id;
        const wasInserted = row.inserted;

        if (wasInserted) {
          totalInserted++;
          console.log(`[${index}/${coffees.length}] INSERTED  coffee id=${coffeeId} "${row.name}"`);
        } else {
          totalUpdated++;
          console.log(`[${index}/${coffees.length}] UPDATED   coffee id=${coffeeId} "${row.name}"`);
        }

        const priceEntries = coffee.price_history || [];

        if (priceEntries.length > 0) {
          const phCount = await insertPriceHistory(client, coffeeId, priceEntries);
          totalPriceHistoryInserted += phCount;
          console.log(
            `             └─ Inserted ${phCount} price_history record(s) for coffee id=${coffeeId}`
          );
        }
      } catch (err) {
        totalErrors++;
        console.error(
          `[${index}/${coffees.length}] ERROR processing coffee "${
            coffee.name || 'UNKNOWN'
          }": ${err.message}`
        );
        // Roll back the whole transaction and abort on any error
        await client.query('ROLLBACK');
        throw err;
      }
    }

    await client.query('COMMIT');

    console.log('\n========================================');
    console.log('Seed completed successfully.');
    console.log(`  Coffees inserted : ${totalInserted}`);
    console.log(`  Coffees updated  : ${totalUpdated}`);
    console.log(`  Price history    : ${totalPriceHistoryInserted} record(s) inserted`);
    console.log('========================================\n');
  } catch (err) {
    // Attempt rollback if not already done
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      // ignore rollback errors
    }
    console.error('\nSeed FAILED. Transaction rolled back.');
    console.error('Reason:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  try {
    await seed();
  } catch (err) {
    console.error('Unhandled error during seed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    console.log('Database pool closed.');
  }
})();
