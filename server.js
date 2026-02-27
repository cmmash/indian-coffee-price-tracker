require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL database');
    release();
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// EJS template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Utility: safe integer parse
function parseIntSafe(val, defaultVal) {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

// Utility: safe float parse
function parseFloatSafe(val, defaultVal) {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defaultVal : parsed;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET / — Homepage
app.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.roaster,
        c.roast_level,
        c.processing_method,
        c.price,
        c.currency,
        c.weight_grams,
        c.url,
        c.image_url,
        c.description,
        c.created_at,
        c.updated_at
      FROM coffees c
      ORDER BY c.updated_at DESC
      LIMIT 100
    `);

    const statsResult = await pool.query(`
      SELECT
        COUNT(*) AS total_coffees,
        COUNT(DISTINCT roaster) AS total_roasters,
        ROUND(AVG(price)::numeric, 2) AS avg_price,
        MIN(price) AS min_price,
        MAX(price) AS max_price
      FROM coffees
    `);

    res.render('index', {
      coffees: result.rows,
      stats: statsResult.rows[0],
      title: 'Coffee Price Tracker',
    });
  } catch (err) {
    console.error('Error loading homepage:', err);
    res.status(500).render('error', {
      message: 'Failed to load homepage',
      error: process.env.NODE_ENV !== 'production' ? err : {},
    });
  }
});

// GET /api/coffees — JSON list with filters
app.get('/api/coffees', async (req, res) => {
  try {
    const {
      roaster,
      roast_level,
      processing_method,
      min_price,
      max_price,
      search,
      sort,
    } = req.query;

    const limit = Math.min(parseIntSafe(req.query.limit, 50), 200);
    const offset = parseIntSafe(req.query.offset, 0);

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (roaster) {
      conditions.push(`LOWER(roaster) = LOWER($${paramIndex++})`);
      values.push(roaster);
    }

    if (roast_level) {
      conditions.push(`LOWER(roast_level) = LOWER($${paramIndex++})`);
      values.push(roast_level);
    }

    if (processing_method) {
      conditions.push(`LOWER(processing_method) = LOWER($${paramIndex++})`);
      values.push(processing_method);
    }

    if (min_price !== undefined && min_price !== '') {
      conditions.push(`price >= $${paramIndex++}`);
      values.push(parseFloatSafe(min_price, 0));
    }

    if (max_price !== undefined && max_price !== '') {
      conditions.push(`price <= $${paramIndex++}`);
      values.push(parseFloatSafe(max_price, 999999));
    }

    if (search) {
      conditions.push(`name ILIKE $${paramIndex++}`);
      values.push(`%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortOptions = {
      price_asc: 'price ASC NULLS LAST',
      price_desc: 'price DESC NULLS LAST',
      name: 'name ASC',
      roaster: 'roaster ASC, name ASC',
    };
    const orderBy = sortOptions[sort] || 'updated_at DESC';

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM coffees ${whereClause}`,
      values
    );

    const dataResult = await pool.query(
      `SELECT
        id,
        name,
        roaster,
        roast_level,
        processing_method,
        price,
        currency,
        weight_grams,
        url,
        image_url,
        description,
        created_at,
        updated_at
      FROM coffees
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset]
    );

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].total, 10),
      limit,
      offset,
      data: dataResult.rows,
    });
  } catch (err) {
    console.error('Error fetching coffees:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coffees',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
});

// GET /api/coffees/:id — Single coffee
app.get('/api/coffees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const coffeeId = parseIntSafe(id, null);

    if (coffeeId === null || coffeeId <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid coffee ID' });
    }

    const result = await pool.query(
      `SELECT
        id,
        name,
        roaster,
        roast_level,
        processing_method,
        price,
        currency,
        weight_grams,
        url,
        image_url,
        description,
        origin,
        flavor_notes,
        created_at,
        updated_at
      FROM coffees
      WHERE id = $1`,
      [coffeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Coffee not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching coffee by ID:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coffee',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
});

// GET /api/roasters — Roaster list with coffee counts
app.get('/api/roasters', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        roaster,
        COUNT(*) AS coffee_count,
        ROUND(AVG(price)::numeric, 2) AS avg_price,
        MIN(price) AS min_price,
        MAX(price) AS max_price
      FROM coffees
      WHERE roaster IS NOT NULL AND roaster <> ''
      GROUP BY roaster
      ORDER BY coffee_count DESC, roaster ASC
    `);

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error('Error fetching roasters:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roasters',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
});

// GET /api/stats — Aggregate statistics
app.get('/api/stats', async (req, res) => {
  try {
    const overallStats = await pool.query(`
      SELECT
        COUNT(*) AS total_coffees,
        COUNT(DISTINCT roaster) AS total_roasters,
        ROUND(AVG(price)::numeric, 2) AS avg_price,
        ROUND(MIN(price)::numeric, 2) AS min_price,
        ROUND(MAX(price)::numeric, 2) AS max_price,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)::numeric, 2) AS median_price
      FROM coffees
      WHERE price IS NOT NULL
    `);

    const roastLevelStats = await pool.query(`
      SELECT
        roast_level,
        COUNT(*) AS count,
        ROUND(AVG(price)::numeric, 2) AS avg_price
      FROM coffees
      WHERE roast_level IS NOT NULL AND roast_level <> ''
      GROUP BY roast_level
      ORDER BY count DESC
    `);

    const processingStats = await pool.query(`
      SELECT
        processing_method,
        COUNT(*) AS count,
        ROUND(AVG(price)::numeric, 2) AS avg_price
      FROM coffees
      WHERE processing_method IS NOT NULL AND processing_method <> ''
      GROUP BY processing_method
      ORDER BY count DESC
    `);

    const recentlyUpdated = await pool.query(`
      SELECT COUNT(*) AS count
      FROM coffees
      WHERE updated_at >= NOW() - INTERVAL '24 hours'
    `);

    res.json({
      success: true,
      data: {
        overall: overallStats.rows[0],
        by_roast_level: roastLevelStats.rows,
        by_processing_method: processingStats.rows,
        recently_updated_24h: parseInt(recentlyUpdated.rows[0].count, 10),
      },
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
});

// GET /api/price-history/:url — Price history for a product URL
app.get('/api/price-history/:url', async (req, res) => {
  try {
    // URL param may be base64-encoded or percent-encoded
    let productUrl;
    try {
      productUrl = decodeURIComponent(req.params.url);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid URL parameter encoding' });
    }

    if (!productUrl || productUrl.trim() === '') {
      return res.status(400).json({ success: false, error: 'URL parameter is required' });
    }

    // First verify the coffee exists
    const coffeeCheck = await pool.query(
      `SELECT id, name, roaster FROM coffees WHERE url = $1 LIMIT 1`,
      [productUrl]
    );

    if (coffeeCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found for the given URL' });
    }

    const historyResult = await pool.query(
      `SELECT
        id,
        price,
        currency,
        recorded_at,
        source
      FROM price_history
      WHERE url = $1
      ORDER BY recorded_at ASC`,
      [productUrl]
    );

    const coffee = coffeeCheck.rows[0];
    const history = historyResult.rows;

    // Compute basic price change metrics
    let priceChange = null;
    let percentChange = null;
    if (history.length >= 2) {
      const first = parseFloat(history[0].price);
      const last = parseFloat(history[history.length - 1].price);
      priceChange = parseFloatSafe((last - first).toFixed(2), null);
      percentChange = first !== 0
        ? parseFloatSafe(((last - first) / first * 100).toFixed(2), null)
        : null;
    }

    res.json({
      success: true,
      coffee: {
        id: coffee.id,
        name: coffee.name,
        roaster: coffee.roaster,
        url: productUrl,
      },
      metrics: {
        data_points: history.length,
        price_change: priceChange,
        percent_change: percentChange,
      },
      data: history,
    });
  } catch (err) {
    console.error('Error fetching price history:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price history',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).render('error', {
      message: 'Page not found',
      error: { status: 404 },
    });
  } else {
    res.status(404).json({ success: false, error: 'Route not found' });
  }
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  if (req.accepts('html')) {
    res.status(status).render('error', {
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV !== 'production' ? err : { status },
    });
  } else {
    res.status(status).json({
      success: false,
      error: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });
  }
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and DB pool...');
  await pool.end();
  console.log('Database pool closed.');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing HTTP server and DB pool...');
  await pool.end();
  console.log('Database pool closed.');
  process.exit(0);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Homepage: http://localhost:${PORT}`);
  console.log(`API:      http://localhost:${PORT}/api/coffees`);
});

module.exports = app;
