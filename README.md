# Indian Specialty Coffee Price Tracker

A Node.js Express application that tracks prices of whole bean specialty coffees from 25+ Indian roasters.

## Features

- **25+ Roasters**: Alchemist, Blue Tokai, Subko, Humble Express, Bili Hu, Caffeine Baar, Corridor Seven, Estate Monkey, Bloom, Tulum, Rossette, Korebi, Naivo, Koffee Genetics, Kat and Kin, Home Blend, Cafe Handcrafted, Siolim, Araku, Bombay Island, Dope, Grey Soul, Marc's Coffee, Toffee, and more.
- **Price History**: Track price changes over time
- **Filtering**: Filter by roaster, roast level, processing method, price range
- **Sorting**: Sort by price, name, roaster, price per 100g
- **REST API**: JSON endpoints for programmatic access

## Tech Stack

- Node.js + Express
- PostgreSQL
- EJS templating
- Deploy ready for Render/AWS

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Create database and run schema: `psql -d coffee_tracker -f schema.sql`
5. Seed data: `npm run seed`
6. Start server: `npm start`

## Deployment

### Render
1. Connect GitHub repo to Render
2. Create PostgreSQL database on Render
3. Set `DATABASE_URL` environment variable
4. Deploy!

### AWS
Use the included Dockerfile for containerized deployment.

## API Endpoints

- `GET /` - Web interface with filters
- `GET /api/coffees` - List all coffees
- `GET /api/coffees/:url` - Get coffee details with price history
- `GET /api/stats` - Statistics and aggregations

## Data Schema

Each coffee includes:
- Name, price (INR), weight (grams)
- Origin/estate, variety, roast level, processing method
- Product URL, roaster name
- Price per 100g (calculated)
- Scraped date

## License

MIT
