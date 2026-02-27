# ☕ Indian Specialty Coffee Price Tracker

A comprehensive price tracking platform for Indian specialty coffee roasters. Monitor prices, compare coffees, and discover the best whole bean coffees from 25 of India's finest specialty roasters — all in one place.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tracked Roasters](#tracked-roasters)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Deployment on Render](#deployment-on-render)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

The **Indian Specialty Coffee Price Tracker** monitors **168 whole bean coffees** across **25 Indian specialty roasters**. Prices are scraped and updated regularly, giving coffee enthusiasts and buyers a transparent view of the Indian specialty coffee market.

Whether you're hunting for a natural processed Coorg, a washed Araku Valley, or a rare micro-lot from the Nilgiris, this tracker helps you find it at the best price.

---

## ✨ Features

### 🔍 Browse, Filter & Search
- Full-text search across coffee names, origins, tasting notes, and roasters
- Filter by roast level (light, medium, dark)
- Filter by process (washed, natural, honey, anaerobic)
- Filter by origin region (Coorg, Chikmagalur, Araku, Nilgiris, Wayanad, etc.)
- Filter by price range
- Sort by price, name, roaster, or date added

### 💰 Price Comparison
- Side-by-side comparison of up to 4 coffees
- Price-per-gram calculations for fair comparison across different bag sizes
- Cheapest and most expensive listings highlighted
- Alerts for significant price drops

### 🏪 Roaster Profiles
- Dedicated profile page for each of the 25 roasters
- Roaster location, founding year, and sourcing philosophy
- Full catalogue of coffees offered by each roaster
- Direct links to roaster websites

### 📈 Price History Tracking
- Historical price charts for every tracked coffee
- 30, 90, and 365-day price history views
- All-time high and low price records
- Average price over time
- Price change percentage since tracking began

### 🔔 Additional Features
- Pagination for large result sets
- Responsive JSON API for building custom frontends
- Health check endpoint for uptime monitoring
- Last updated timestamps on all records

---

## 🫘 Tracked Roasters

| # | Roaster | Location |
|---|---------|----------|
| 1 | Alchemist | Bengaluru, Karnataka |
| 2 | Humble Express | Bengaluru, Karnataka |
| 3 | Subko | Mumbai, Maharashtra |
| 4 | Blue Tokai | Multi-city |
| 5 | Bili Hu | Bengaluru, Karnataka |
| 6 | Caffeine Baar | Pune, Maharashtra |
| 7 | Corridor Seven | Bengaluru, Karnataka |
| 8 | Estate Monkey | Bengaluru, Karnataka |
| 9 | Bloom | Mumbai, Maharashtra |
| 10 | Silk Road | Mumbai, Maharashtra |
| 11 | Tulum | Bengaluru, Karnataka |
| 12 | Rossette | Bengaluru, Karnataka |
| 13 | Korebi | Bengaluru, Karnataka |
| 14 | Naivo | Bengaluru, Karnataka |
| 15 | Koffee Genetics | Bengaluru, Karnataka |
| 16 | Kat and Kin | Mumbai, Maharashtra |
| 17 | Home Blend | Delhi, NCR |
| 18 | Cafe Handcrafted | Bengaluru, Karnataka |
| 19 | Siolim | Goa |
| 20 | Araku | Hyderabad, Telangana |
| 21 | Bombay Island | Mumbai, Maharashtra |
| 22 | Dope | Bengaluru, Karnataka |
| 23 | Grey Soul | Bengaluru, Karnataka |
| 24 | Marc's Coffee | Bengaluru, Karnataka |
| 25 | Toffee | Bengaluru, Karnataka |

> **Total tracked:** 168 whole bean coffees across all 25 roasters

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 18+ |
| Framework | Express 4.x |
| Database | PostgreSQL 15+ |
| ORM / Query Builder | pg (node-postgres) |
| Scraping | Axios + Cheerio |
| Scheduling | node-cron |
| Validation | express-validator |
| Logging | morgan |
| Environment | dotenv |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v8 or higher
- [PostgreSQL](https://www.postgresql.org/) v15 or higher
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/indian-coffee-price-tracker.git
cd indian-coffee-price-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

See the [Environment Variables](#environment-variables) section for details on each variable.

### 4. Set Up the Database

Create a PostgreSQL database and run the migrations:

```bash
# Create the database
createdb coffee_tracker

# Run migrations
npm run db:migrate

# (Optional) Seed the database with initial roaster data
npm run db:seed
```

### 5. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

### 6. Run the Initial Price Scrape

```bash
npm run scrape
```

This will populate the database with the latest prices from all 25 roasters. Subsequent scrapes are scheduled automatically via cron.

---

## 🔑 Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/coffee_tracker
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_tracker
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Scraping
SCRAPE_INTERVAL_HOURS=24
SCRAPE_TIMEOUT_MS=30000
USER_AGENT=CoffeePriceTracker/1.0

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Port the Express server listens on |
| `NODE_ENV` | No | `development` | Environment mode |
| `DATABASE_URL` | Yes | — | Full PostgreSQL connection string |
| `DB_HOST` | Yes* | `localhost` | Database host |
| `DB_PORT` | No | `5432` | Database port |
| `DB_NAME` | Yes* | — | Database name |
| `DB_USER` | Yes* | — | Database username |
| `DB_PASSWORD` | Yes* | — | Database password |
| `SCRAPE_INTERVAL_HOURS` | No | `24` | How often to re-scrape prices |
| `SCRAPE_TIMEOUT_MS` | No | `30000` | HTTP timeout for scraping requests |
| `USER_AGENT` | No | See above | User-agent string for HTTP requests |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window per IP |

> \* Required if `DATABASE_URL` is not provided.

---

## 🗄 Database Setup

### Schema Overview

The database consists of four primary tables:

```
roasters          → 25 roaster profiles
coffees           → 168 whole bean coffee listings
price_history     → Historical price snapshots per coffee
compare_sessions  → Saved comparison sessions (optional)
```

### Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Roll back the last migration
npm run db:migrate:rollback

# Check migration status
npm run db:migrate:status
```

### Seeding Initial Data

```bash
# Seed roasters and initial coffee data
npm run db:seed

# Reset database and re-seed (destructive)
npm run db:seed:fresh
```

### Manual Schema Creation

If you prefer to create the schema manually, here is the core SQL:

```sql
CREATE TABLE roasters (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  city          VARCHAR(100),
  state         VARCHAR(100),
  website_url   TEXT,
  description   TEXT,
  founded_year  INTEGER,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coffees (
  id            SERIAL PRIMARY KEY,
  roaster_id    INTEGER REFERENCES roasters(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL,
  origin        VARCHAR(255),
  region        VARCHAR(255),
  process       VARCHAR(100),
  roast_level   VARCHAR(50),
  tasting_notes TEXT,
  description   TEXT,
  product_url   TEXT,
  image_url     TEXT,
  weight_grams  INTEGER,
  current_price NUMERIC(10, 2),
  currency      CHAR(3) DEFAULT 'INR',
  in_stock      BOOLEAN DEFAULT TRUE,
  last_scraped  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE price_history (
  id          SERIAL PRIMARY KEY,
  coffee_id   INTEGER REFERENCES coffees(id) ON DELETE CASCADE,
  price       NUMERIC(10, 2) NOT NULL,
  currency    CHAR(3) DEFAULT 'INR',
  in_stock    BOOLEAN DEFAULT TRUE,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coffees_roaster_id ON coffees(roaster_id);
CREATE INDEX idx_coffees_process ON coffees(process);
CREATE INDEX idx_coffees_roast_level ON coffees(roast_level);
CREATE INDEX idx_price_history_coffee_id ON price_history(coffee_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at);
```

---

## 📡 API Documentation

All API endpoints are prefixed with `/api/v1`. The API returns JSON responses.

### Base URL

```
http://localhost:3000/api/v1
```

---

### Health Check

#### `GET /health`

Returns the health status of the API and database connection.

**Response**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

### Coffees

#### `GET /api/v1/coffees`

Returns a paginated list of all tracked coffees.

**Query Parameters**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Results per page (default: 20, max: 100) | `?limit=50` |
| `search` | string | Full-text search | `?search=natural+coorg` |
| `roaster` | string | Filter by roaster slug | `?roaster=blue-tokai` |
| `process` | string | Filter by process | `?process=natural` |
| `roast_level` | string | Filter by roast level | `?roast_level=light` |
| `region` | string | Filter by growing region | `?region=chikmagalur` |
| `min_price` | number | Minimum price in INR | `?min_price=500` |
| `max_price` | number | Maximum price in INR | `?max_price=2000` |
| `in_stock` | boolean | Show only in-stock items | `?in_stock=true` |
| `sort_by` | string | Sort field: `price`, `name`, `roaster`, `updated_at` | `?sort_by=price` |
| `sort_order` | string | `asc` or `desc` (default: `asc`) | `?sort_order=desc` |

**Response**
```json
{
  "data": [
    {
      "id": 42,
      "name": "Attikan Estate Natural",
      "slug": "attikan-estate-natural",
      "roaster": {
        "id": 4,
        "name": "Blue Tokai",
        "slug": "blue-tokai"
      },
      "origin": "India",
      "region": "Chikmagalur, Karnataka",
      "process": "Natural",
      "roast_level": "Medium",
      "tasting_notes": "Dark chocolate, dried fruit, caramel",
      "weight_grams": 250,
      "current_price": 750,
      "price_per_gram": 3.00,
      "currency": "INR",
      "in_stock": true,
      "product_url": "https://bluetokaicoffee.com/...",
      "image_url": "https://bluetokaicoffee.com/images/...",
      "last_scraped": "2024-01-15T06:00:00.000Z",
      "updated_at": "2024-01-15T06:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 168,
    "page": 1,
    "limit": 20,
    "total_pages": 9
  }
}
```

---

#### `GET /api/v1/coffees/:id`

Returns a single coffee by ID.

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Coffee ID |

**Response**
```json
{
  "data": {
    "id": 42,
    "name": "Attikan Estate Natural",
    "slug": "attikan-estate-natural",
    "roaster": {
      "id": 4,
      "name": "Blue Tokai",
      "slug": "blue-tokai",
      "website_url": "https://bluetokaicoffee.com"
    },
    "origin": "India",
    "region": "Chikmagalur, Karnataka",
    "process": "Natural",
    "roast_level": "Medium",
    "tasting_notes": "Dark chocolate, dried fruit, caramel",
    "description": "A classic natural processed coffee from the Attikan Estate...",
    "weight_grams": 250,
    "current_price": 750,
    "price_per_gram": 3.00,
    "currency": "INR",
    "in_stock": true,
    "product_url": "https://bluetokaicoffee.com/...",
    "image_url": "https://bluetokaicoffee.com/images/...",
    "price_stats": {
      "all_time_low": 650,
      "all_time_high": 850,
      "average_price": 730,
      "price_change_30d": -2.67
    },
    "last_scraped": "2024-01-15T06:00:00.000Z",
    "created_at": "2023-06-01T00:00:00.000Z",
    "updated_at": "2024-01-15T06:00:00.000Z"
  }
}
```

---

#### `GET /api/v1/coffees/:id/price-history`

Returns price history for a specific coffee.

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Coffee ID |

**Query Parameters**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `days` | integer | Number of days of history (default: 90) | `?days=30` |

**Response**
```json
{
  "data": {
    "coffee_id": 42,
    "coffee_name": "Attikan Estate Natural",
    "roaster": "Blue Tokai",
    "currency": "INR",
    "history": [
      {
        "price": 750,
        "in_stock": true,
        "recorded_at": "2024-01-15T06:00:00.000Z"
      },
      {
        "price": 770,
        "in_stock": true,
        "recorded_at": "2024-01-01T06:00:00.000Z"
      }
    ],
    "stats": {
      "all_time_low": 650,
      "all_time_high": 850,
      "average_price": 730,
      "price_change_percent": -2.67
    }
  }
}
```

---

### Roasters

#### `GET /api/v1/roasters`

Returns all 25 tracked roasters.

**Query Parameters**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `city` | string | Filter by city | `?city=bengaluru` |
| `state` | string | Filter by state | `?state=karnataka` |

**Response**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Alchemist",
      "slug": "alchemist",
      "city": "Bengaluru",
      "state": "Karnataka",
      "website_url": "https://alchemistroasters.com",
      "description": "Specialty roaster focused on single origins and transparency.",
      "founded_year": 2017,
      "coffee_count": 8,
      "created_at": "2023-06-01T00:00:00.000Z"
    }
  ],
  "total": 25
}
```

---

#### `GET /api/v1/roasters/:slug`

Returns a roaster profile with their full coffee catalogue.

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Roaster slug (e.g., `blue-tokai`) |

**Response**
```json
{
  "data": {
    "id": 4,
    "name": "Blue Tokai",
    "slug": "blue-tokai",
    "city": "Multiple Cities",
    "state": "India",
    "website_url": "https://bluetokaicoffee.com",
    "description": "India's largest specialty coffee roaster, sourcing from Indian farms.",
    "founded_year": 2013,
    "coffees": [
      {
        "id": 42,
        "name": "Attikan Estate Natural",
        "current_price": 750,
        "weight_grams": 250,
        "process": "Natural",
        "roast_level": "Medium",
        "in_stock": true
      }
    ],
    "price_range": {
      "min": 450,
      "max": 3200
    },
    "coffee_count": 14
  }
}
```

---

### Comparison

#### `GET /api/v1/compare`

Compares up to 4 coffees side by side.

**Query Parameters**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ids` | string | Comma-separated coffee IDs (2–4) | `?ids=42,17,91` |

**Response**
```json
{
  "data": [
    {
      "id": 42,
      "name": "Attikan Estate Natural",
      "roaster": "Blue Tokai",
      "process": "Natural",
      "roast_level": "Medium",
      "region": "Chikmagalur",
      "weight_grams": 250,
      "current_price": 750,
      "price_per_gram": 3.00,
      "currency": "INR",
      "in_stock": true,
      "tasting_notes": "Dark chocolate, dried fruit, caramel",
      "product_url": "https://bluetokaicoffee.com/..."
    },
    {
      "id": 17,
      "name": "Baarbara Estate Washed",
      "roaster": "Subko",
      "process": "Washed",
      "roast_level": "Light",
      "region": "Chikmagalur",
      "weight_grams": 200,
      "current_price": 980,
      "price_per_gram": 4.90,
      "currency": "INR",
      "in_stock": true,
      "tasting_notes": "Jasmine, bergamot, stone fruit",
      "product_url": "https://subko.coffee/..."
    }
  ],
  "summary": {
    "cheapest": { "id": 42, "name": "Attikan Estate Natural", "price": 750 },
    "cheapest_per_gram": { "id": 42, "name": "Attikan Estate Natural", "price_per_gram": 3.00 },
    "most_expensive": { "id": 17, "name": "Baarbara Estate Washed", "price": 980 }
  }
}
```

---

### Filters / Metadata

#### `GET /api/v1/filters`

Returns all available filter values from the current dataset — useful for building dynamic filter UIs.

**Response**
```json
{
  "data": {
    "processes": ["Anaerobic", "Honey", "Natural", "Washed"],
    "roast_levels": ["Dark", "Light", "Light-Medium", "Medium", "Medium-Dark"],
    "regions": ["Araku Valley", "Chikmagalur", "Coorg", "Nilgiris", "Wayanad"],
    "roasters": [
      { "id": 1, "name": "Alchemist", "slug": "alchemist" }
    ],
    "price_range": {
      "min": 350,
      "max": 4500
    }
  }
}
```

---

### Error Responses

All error responses follow a consistent format:

```json
{
  "error": {
    "status": 404,
    "message": "Coffee not found",
    "code": "COFFEE_NOT_FOUND"
  }
}
```

| HTTP Status | Description |
|-------------|-------------|
| `200` | Success |
| `400` | Bad request (invalid query parameters) |
| `404` | Resource not found |
| `422` | Validation error |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## 🚢 Deployment on Render

[Render](https://render.com) is the recommended deployment platform. Follow these steps to deploy the app and its PostgreSQL database.

### Step 1: Create a PostgreSQL Database on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Configure the database:
   - **Name:** `coffee-tracker-db`
   - **Region:** Choose the region closest to your users (e.g., Singapore for India)
   - **Plan:** Free (for testing) or Starter (for production)
4. Click **Create Database**
5. Once created, copy the **Internal Database URL** — you'll need it in Step 3

### Step 2: Create a Web Service on Render

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure the service:
   - **Name:** `indian-coffee-tracker`
   - **Region:** Same region as your database
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run db:migrate`
   - **Start Command:** `npm start`
   - **Plan:** Free or Starter

### Step 3: Set Environment Variables on Render

In your Web Service settings, navigate to **Environment** and add the following:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(paste the Internal Database URL from Step 1)* |
| `SCRAPE_INTERVAL_HOURS` | `24` |
| `SCRAPE_TIMEOUT_MS` | `30000` |

### Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy your app
3. Monitor the build logs in the Render dashboard
4. Once deployed, your app will be live at `https://indian-coffee-tracker.onrender.com`

### Step 5: Run Initial Scrape

After deployment, trigger the first scrape manually using the Render Shell:

```bash
npm run scrape
```

Or set up a **Cron Job** on Render:

1. Click **New** → **Cron Job**
2. Connect the same repository
3. Set the schedule: `0 2 * * *` (runs at 2 AM UTC daily)
4. Set the command: `npm run scrape`
5. Add the same `DATABASE_URL` environment variable

### Step 6: Verify Deployment

```bash
curl https://indian-coffee-tracker.onrender.com/health
```

You should receive:

```json
{
  "status": "ok",
  "database": "connected"
}
```

> **Note:** On Render's free plan, web services spin down after 15 minutes of inactivity. The first request after a spin-down may take 30–60 seconds. Consider upgrading to a paid plan for production use.

---

## 📁 Project Structure

```
indian-coffee-price-tracker/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── coffees.controller.js
│   │   ├── roasters.controller.js
│   │   └── compare.controller.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validate.js
│   ├── migrations/
│   │   ├── 001_create_roasters.sql
│   │   ├── 002_create_coffees.sql
│   │   └── 003_create_price_history.sql
│   ├── routes/
│   │   ├── index.js
│   │   ├── coffees.routes.js
│   │   ├── roasters.routes.js
│   │   └── compare.routes.js
│   ├── scrapers/
│   │   ├── index.js              # Scraper orchestrator
│   │   ├── base.scraper.js       # Base scraper class
│   │   └── roasters/             # One scraper per roaster
│   │       ├── alchemist.js
│   │       ├── blue-tokai.js
│   │       ├── subko.js
│   │       └── ...               # 22 more roaster scrapers
│   ├── seeds/
│   │   └── roasters.seed.js      # Initial roaster data
│   ├── services/
│   │   ├── coffees.service.js
│   │   ├── roasters.service.js
│   │   └── priceHistory.service.js
│   └── app.js                    # Express app setup
├── .env.example
├── .gitignore
├── package.json
├── render.yaml                   # Render deployment config
└── README.md
```

---

## 🧪 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start the development server with hot reload |
| `npm run scrape` | Run a one-off price scrape for all roasters |
| `npm run db:migrate` | Run pending database migrations |
| `npm run db:migrate:rollback` | Roll back the last migration |
| `npm run db:seed` | Seed initial roaster and coffee data |
| `npm run db:seed:fresh` | Drop all data and re-seed from scratch |
| `npm test` | Run the test suite |
| `npm run lint` | Lint the codebase with ESLint |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/add-new-roaster`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'feat: add scraper for New Roaster'`
6. Push to the branch: `git push origin feature/add-new-roaster`
7. Open a **Pull Request**

### Adding a New Roaster

1. Add the roaster entry to `src/seeds/roasters.seed.js`
2. Create a scraper in `src/scrapers/roasters/your-roaster.js`
3. Register the scraper in `src/scrapers/index.js`
4. Test the scraper: `node src/scrapers/roasters/your-roaster.js`
5. Submit a PR!

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- All 25 roasters for making exceptional Indian specialty coffee accessible
- The Indian specialty coffee community for driving quality and transparency
- [Blue Bottle Coffee](https://bluebottlecoffee.com) and [Intelligentsia](https://www.intelligentsia.com) for inspiring the specialty coffee movement globally

---

<p align="center">
  Made with ☕ and ❤️ for the Indian specialty coffee community
</p>
