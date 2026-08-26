DROP TABLE IF EXISTS cars;
CREATE TABLE IF NOT EXISTS cars (
    id TEXT PRIMARY KEY,
    source TEXT DEFAULT 'DCH UCC',
    brand TEXT,
    model TEXT,
    year INTEGER,
    price_hkd INTEGER,
    original_price INTEGER DEFAULT 0,
    is_hybrid INTEGER,
    url TEXT,
    is_sold INTEGER DEFAULT 0,
    mileage INTEGER DEFAULT 0,
    engine_cc INTEGER DEFAULT 0,
    previous_owners INTEGER DEFAULT 0
);