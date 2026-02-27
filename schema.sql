-- Indian Coffee Price Tracker Schema
-- PostgreSQL

BEGIN;

-- ============================================================
-- Table: coffees
-- Stores the latest scraped data for each coffee product
-- ============================================================
CREATE TABLE IF NOT EXISTS coffees (
  product_url        TEXT          PRIMARY KEY,
  name               TEXT          NOT NULL,
  roaster            TEXT          NOT NULL,
  price_inr          NUMERIC(10,2),
  weight_grams       NUMERIC(8,2),
  price_per_100g     NUMERIC(10,2),
  origin_estate      TEXT,
  variety            TEXT,
  roast_level        TEXT,
  processing_method  TEXT,
  scraped_date       DATE,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  coffees                    IS 'Latest scraped snapshot of each coffee product listed by Indian roasters.';
COMMENT ON COLUMN coffees.product_url        IS 'Canonical URL of the product page; used as the primary key.';
COMMENT ON COLUMN coffees.name               IS 'Display name of the coffee product.';
COMMENT ON COLUMN coffees.roaster            IS 'Name of the roastery that sells this coffee.';
COMMENT ON COLUMN coffees.price_inr          IS 'Listed retail price in Indian Rupees.';
COMMENT ON COLUMN coffees.weight_grams       IS 'Package weight in grams.';
COMMENT ON COLUMN coffees.price_per_100g     IS 'Derived cost per 100 g in INR for easy comparison.';
COMMENT ON COLUMN coffees.origin_estate      IS 'Estate, farm, or region of origin (e.g. Attikan Estate, Coorg).';
COMMENT ON COLUMN coffees.variety            IS 'Coffee variety or cultivar (e.g. Chandragiri, SLN 9).';
COMMENT ON COLUMN coffees.roast_level        IS 'Roast profile label as provided by the roaster (e.g. Light, Medium, Dark).';
COMMENT ON COLUMN coffees.processing_method  IS 'Post-harvest processing method (e.g. Washed, Natural, Honey).';
COMMENT ON COLUMN coffees.scraped_date       IS 'Calendar date on which this record was last scraped.';
COMMENT ON COLUMN coffees.created_at         IS 'Timestamp when this row was first inserted.';
COMMENT ON COLUMN coffees.updated_at         IS 'Timestamp when this row was last modified.';

-- ============================================================
-- Table: price_history
-- Immutable log of every price observed for each product
-- ============================================================
CREATE TABLE IF NOT EXISTS price_history (
  id           SERIAL        PRIMARY KEY,
  product_url  TEXT          NOT NULL REFERENCES coffees (product_url) ON UPDATE CASCADE ON DELETE CASCADE,
  price_inr    NUMERIC(10,2),
  scraped_date DATE          NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- One price record per product per day
  CONSTRAINT uq_price_history_product_date UNIQUE (product_url, scraped_date)
);

COMMENT ON TABLE  price_history               IS 'Historical log of prices scraped for each coffee product, one row per product per day.';
COMMENT ON COLUMN price_history.id            IS 'Surrogate primary key.';
COMMENT ON COLUMN price_history.product_url   IS 'Foreign key back to coffees.product_url.';
COMMENT ON COLUMN price_history.price_inr     IS 'Price in INR observed on scraped_date.';
COMMENT ON COLUMN price_history.scraped_date  IS 'Calendar date on which the price was recorded.';
COMMENT ON COLUMN price_history.created_at    IS 'Timestamp when this history row was inserted.';

-- ============================================================
-- Table: scrape_runs
-- Audit log of each full scraping job execution
-- ============================================================
CREATE TABLE IF NOT EXISTS scrape_runs (
  id                SERIAL   PRIMARY KEY,
  run_date          DATE     NOT NULL,
  roasters_scraped  INT      NOT NULL DEFAULT 0,
  coffees_found     INT      NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  scrape_runs                  IS 'Audit log recording summary statistics for each scrape job run.';
COMMENT ON COLUMN scrape_runs.id               IS 'Surrogate primary key.';
COMMENT ON COLUMN scrape_runs.run_date         IS 'Calendar date on which the scrape job was executed.';
COMMENT ON COLUMN scrape_runs.roasters_scraped IS 'Number of roaster websites visited during this run.';
COMMENT ON COLUMN scrape_runs.coffees_found    IS 'Total number of coffee products discovered or refreshed during this run.';
COMMENT ON COLUMN scrape_runs.created_at       IS 'Timestamp when this run record was inserted.';

-- ============================================================
-- Indexes
-- ============================================================

-- coffees: filter / group by roaster
CREATE INDEX IF NOT EXISTS idx_coffees_roaster
  ON coffees (roaster);

-- coffees: filter by most-recent scrape date
CREATE INDEX IF NOT EXISTS idx_coffees_scraped_date
  ON coffees (scraped_date DESC);

-- price_history: look up all history for a single product
CREATE INDEX IF NOT EXISTS idx_price_history_product_url
  ON price_history (product_url);

-- price_history: range queries over time (e.g. last 30 days)
CREATE INDEX IF NOT EXISTS idx_price_history_scraped_date
  ON price_history (scraped_date DESC);

-- ============================================================
-- Trigger: keep coffees.updated_at current automatically
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_coffees_set_updated_at
BEFORE UPDATE ON coffees
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

COMMIT;
