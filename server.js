const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.get('/', async (req, res) => {
  try {
    const { roaster, roast, process, minPrice, maxPrice, sort } = req.query;
    
    let query = 'SELECT * FROM coffees WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (roaster) {
      query += ` AND roaster = $${paramIndex}`;
      params.push(roaster);
      paramIndex++;
    }
    
    if (roast) {
      query += ` AND roast_level ILIKE $${paramIndex}`;
      params.push(`%${roast}%`);
      paramIndex++;
    }
    
    if (process) {
      query += ` AND processing_method ILIKE $${paramIndex}`;
      params.push(`%${process}%`);
      paramIndex++;
    }
    
    if (minPrice) {
      query += ` AND price_inr >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }
    
    if (maxPrice) {
      query += ` AND price_inr <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }
    
    // Sorting
    const sortOptions = {
      'price_asc': 'price_inr ASC',
      'price_desc': 'price_inr DESC',
      'name': 'name ASC',
      'roaster': 'roaster ASC',
      'price_per_100g': 'price_per_100g ASC'
    };
    query += ` ORDER BY ${sortOptions[sort] || 'roaster ASC, name ASC'}`;
    
    const result = await pool.query(query, params);
    
    // Get filter options
    const roastersResult = await pool.query('SELECT DISTINCT roaster FROM coffees ORDER BY roaster');
    const roastsResult = await pool.query('SELECT DISTINCT roast_level FROM coffees ORDER BY roast_level');
    const processesResult = await pool.query('SELECT DISTINCT processing_method FROM coffees ORDER BY processing_method');
    
    res.render('index', {
      coffees: result.rows,
      roasters: roastersResult.rows.map(r => r.roaster),
      roasts: roastsResult.rows.map(r => r.roast_level),
      processes: processesResult.rows.map(r => r.processing_method),
      filters: { roaster, roast, process, minPrice, maxPrice, sort }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// API Routes
app.get('/api/coffees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coffees ORDER BY roaster, name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/coffees/:url', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coffees WHERE product_url = $1', [req.params.url]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coffee not found' });
    }
    
    // Get price history
    const historyResult = await pool.query(
      'SELECT * FROM price_history WHERE product_url = $1 ORDER BY scraped_date DESC',
      [req.params.url]
    );
    
    res.json({
      coffee: result.rows[0],
      priceHistory: historyResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_coffees,
        COUNT(DISTINCT roaster) as total_roasters,
        AVG(price_inr) as avg_price,
        MIN(price_inr) as min_price,
        MAX(price_inr) as max_price
      FROM coffees
    `);
    
    const roasterStats = await pool.query(`
      SELECT roaster, COUNT(*) as count, AVG(price_inr) as avg_price
      FROM coffees
      GROUP BY roaster
      ORDER BY count DESC
    `);
    
    res.json({
      overall: stats.rows[0],
      byRoaster: roasterStats.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
