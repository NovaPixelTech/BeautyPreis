-- BeautyPreis Database Schema for SQLite (PostgreSQL compatible)
-- This schema supports the multi-store price comparison platform

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================
-- Core Tables
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  name TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Retailers table
CREATE TABLE IF NOT EXISTS Retailer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  baseUrl TEXT NOT NULL,
  apiType TEXT,  -- "official_api", "affiliate_feed", "third_party", "scraping"
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  currency TEXT NOT NULL DEFAULT 'EUR',
  country TEXT,
  timezone TEXT,
  rateLimit INTEGER,
  lastChecked DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Brands table
CREATE TABLE IF NOT EXISTS Brand (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT,
  country TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Product Categories table
CREATE TABLE IF NOT EXISTS ProductCategory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  parentId TEXT,
  language TEXT NOT NULL DEFAULT 'de',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES ProductCategory(id) ON DELETE SET NULL
);

-- Products (canonical product catalog) table
CREATE TABLE IF NOT EXISTS Product (
  id TEXT PRIMARY KEY,
  brandId TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  modelNumber TEXT,
  size TEXT,
  color TEXT,
  gender TEXT,
  categoryId TEXT,
  ean TEXT,  -- EAN/GTIN barcode
  description TEXT,
  images TEXT,  -- JSON array of URLs
  matchConfidence TEXT NOT NULL DEFAULT 'LOW',  -- EXACT, HIGH, POSSIBLE, LOW, DIFFERENT
  lastMatched DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brandId) REFERENCES Brand(id) ON DELETE SET NULL,
  FOREIGN KEY (categoryId) REFERENCES ProductCategory(id) ON DELETE SET NULL
);

-- Retailer Products table (a product listing from a specific retailer)
CREATE TABLE IF NOT EXISTS RetailerProduct (
  id TEXT PRIMARY KEY,
  productId TEXT,
  retailerId TEXT NOT NULL,
  productName TEXT NOT NULL,
  brand TEXT,
  size TEXT,
  price DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  ean TEXT,
  url TEXT NOT NULL,
  imageUrl TEXT,
  availability TEXT,  -- "in_stock", "out_of_stock", "limited"
  lastChecked DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  matchConfidence TEXT NOT NULL DEFAULT 'LOW',  -- EXACT, HIGH, POSSIBLE, LOW, DIFFERENT
  priceStatus TEXT NOT NULL DEFAULT 'ESTIMATED',  -- VERIFIED, ESTIMATED, UNKNOWN, OUTDATED
  notes TEXT,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE SET NULL,
  FOREIGN KEY (retailerId) REFERENCES Retailer(id) ON DELETE CASCADE
);

-- Unique constraint on retailer + EAN
CREATE UNIQUE INDEX IF NOT EXISTS "retailer_ean_unique" ON RetailerProduct(retailerId, ean);
CREATE INDEX IF NOT EXISTS "retailer_product_name_idx" ON RetailerProduct(retailerId, productName);

-- Price Observations table (historical price records - never overwrite)
CREATE TABLE IF NOT EXISTS PriceObservation (
  id TEXT PRIMARY KEY,
  retailerProductId TEXT NOT NULL,
  price DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  totalPurchaseCost DECIMAL,  -- Product price + shipping at time of observation
  shippingCost DECIMAL,  -- Shipping cost at time of observation
  priceStatus TEXT NOT NULL DEFAULT 'ESTIMATED',  -- VERIFIED, ESTIMATED, UNKNOWN, OUTDATED
  sourceVerification TEXT,  -- How the price was obtained
  observedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (retailerProductId) REFERENCES RetailerProduct(id) ON DELETE CASCADE
);

-- Shipping Information table
CREATE TABLE IF NOT EXISTS ShippingInfo (
  id TEXT PRIMARY KEY,
  retailerProductId TEXT NOT NULL,
  shippingMethod TEXT,
  price DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  estimatedDelivery TEXT,  -- Days as string, e.g., "3-5"
  stockAvailable BOOLEAN NOT NULL DEFAULT 1,
  source TEXT,  -- "checkout", "api", "estimated"
  verificationStatus TEXT,  -- "verified", "estimated", "unknown"
  lastVerified DATETIME,
  notes TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (retailerProductId) REFERENCES RetailerProduct(id) ON DELETE CASCADE
);

-- Product Matching Records table
CREATE TABLE IF NOT EXISTS ProductMatch (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  sourceRetailerProductId TEXT NOT NULL,
  matchConfidence TEXT NOT NULL,  -- EXACT, HIGH, POSSIBLE, LOW, DIFFERENT
  matchFactors TEXT,  -- JSON string describing match factors
  matchedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  FOREIGN KEY (sourceRetailerProductId) REFERENCES RetailerProduct(id) ON DELETE CASCADE
);

-- Price Alerts table
CREATE TABLE IF NOT EXISTS PriceAlert (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  productId TEXT NOT NULL,
  retailerProductId TEXT,
  retailerId TEXT,
  targetPrice DECIMAL NOT NULL,
  targetPriceTotal DECIMAL,  -- Total purchase cost target
  currency TEXT NOT NULL DEFAULT 'EUR',
  isActive BOOLEAN NOT NULL DEFAULT 1,
  triggered BOOLEAN NOT NULL DEFAULT 0,
  triggeredAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  FOREIGN KEY (retailerProductId) REFERENCES RetailerProduct(id) ON DELETE SET NULL,
  FOREIGN KEY (retailerId) REFERENCES Retailer(id) ON DELETE SET NULL
);

-- Search History table
CREATE TABLE IF NOT EXISTS SearchHistory (
  id TEXT PRIMARY KEY,
  userId TEXT,
  query TEXT NOT NULL,
  resultCount INTEGER,
  executedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Integration Logs table
CREATE TABLE IF NOT EXISTS IntegrationLog (
  id TEXT PRIMARY KEY,
  retailerId TEXT NOT NULL,
  operation TEXT NOT NULL,  -- "search", "retrieve_product", "retrieve_price", etc.
  status TEXT NOT NULL,  -- "success", "error", "rate_limited"
  errorMessage TEXT,
  recordsProcessed INTEGER,
  recordsSuccessful INTEGER,
  executionTimeMs INTEGER,
  executedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (retailerId) REFERENCES Retailer(id) ON DELETE CASCADE
);

-- ==========================================================--
-- Initial Data
-- ==========================================================--

-- Insert initial retailers (these will be integrated over time)
INSERT INTO Retailer (id, name, slug, baseUrl, apiType, status, country) VALUES
  ('yesstyle', 'YesStyle', 'yesstyle', 'https://www.yesstyle.com', 'third_party', 'ACTIVE', 'Germany'),
  ('stylevana', 'Stylevana', 'stylevana', 'https://www.stylevana.com', 'third_party', 'ACTIVE', 'Germany'),
  ('douglas', 'Douglas Germany', 'douglas-de', 'https://www.douglas.de', 'official_api', 'ACTIVE', 'Germany'),
  ('flaconi', 'Flaconi', 'flaconi', 'https://www.flaconi.de', 'official_api', 'ACTIVE', 'Germany'),
  ('notino', 'Notino Germany', 'notino-de', 'https://www.notino.de', 'official_api', 'ACTIVE', 'Germany'),
  ('sephora', 'Sephora Germany', 'sephora-de', 'https://www.sephora.de', 'official_api', 'ACTIVE', 'Germany'),
  ('lookfantastic', 'Lookfantastic Germany', 'lookfantastic-de', 'https://www.lookfantastic.de', 'official_api', 'ACTIVE', 'Germany'),
  ('shop_apotheke', 'Shop Apotheke', 'shop-apotheke', 'https://www.shop-apotheke.de', 'official_api', 'ACTIVE', 'Germany'),
  ('dm', 'dm.de', 'dm-de', 'https://www.dm.de', 'third_party', 'ACTIVE', 'Germany'),
  ('rossmann', 'Rossmann.de', 'rossmann-de', 'https://www.rossmann.de', 'third_party', 'ACTIVE', 'Germany')
ON CONFLICT (slug) DO NOTHING;

-- Initial categories
INSERT INTO ProductCategory (id, name, slug, language) VALUES
  ('face-cleansers', 'Face Cleansers', 'face-cleansers', 'de'),
  ('toners', 'Toners', 'toners', 'de'),
  ('serums', 'Serums', 'serums', 'de'),
  ('moisturizers', 'Moisturizers', 'moisturizers', 'de'),
  ('sunscreens', 'Sunscreens', 'sunscreens', 'de'),
  ('face-masks', 'Face Masks', 'face-masks', 'de'),
  ('eye-care', 'Eye Care', 'eye-care', 'de'),
  ('makeup', 'Makeup', 'makeup', 'de'),
  ('hair-care', 'Hair Care', 'hair-care', 'de'),
  ('body-care', 'Body Care', 'body-care', 'de'),
  ('k-beauty', 'Korean Skincare', 'k-beauty', 'de'),
  ('j-beauty', 'Japanese Skincare', 'j-beauty', 'de')

ON CONFLICT (slug) DO NOTHING;