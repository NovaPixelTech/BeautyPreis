const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const yesStyleAdapter = require('./retailers/yesStyleAdapter');
const stylevanaAdapter = require('./retailers/stylevanaAdapter');
const flaconiAdapter = require('./retailers/flaconiAdapter');

const app = express();
const PORT = process.env.PORT || 3011;

// Database setup
const db = new sqlite3(path.join(__dirname, 'database.db'));
db.pragma('foreign_keys = ON');
app.use(cors());
app.use(express.json());

// Initialize database
function initDatabase() {
  db.prepare("CREATE TABLE IF NOT EXISTS Users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, passwordHash TEXT NOT NULL, name TEXT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS Retailer (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, baseUrl TEXT NOT NULL, apiType TEXT, status TEXT NOT NULL DEFAULT 'ACTIVE', currency TEXT NOT NULL DEFAULT 'EUR', country TEXT, timezone TEXT, rateLimit INTEGER, lastChecked DATETIME, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS Brands (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, slug TEXT, country TEXT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS ProductCategories (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT, parentId TEXT, language TEXT NOT NULL DEFAULT 'de', createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parentId) REFERENCES ProductCategories(id) ON DELETE SET NULL)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS Products (id TEXT PRIMARY KEY, brandId TEXT, name TEXT NOT NULL, slug TEXT NOT NULL, modelNumber TEXT, size TEXT, color TEXT, gender TEXT, categoryId TEXT, ean TEXT, matchConfidence TEXT NOT NULL DEFAULT 'LOW', createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (brandId) REFERENCES Brands(id) ON DELETE SET NULL, FOREIGN KEY (categoryId) REFERENCES ProductCategories(id) ON DELETE SET NULL)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS RetailerProducts (id TEXT PRIMARY KEY, productId TEXT, retailerId TEXT NOT NULL, productName TEXT NOT NULL, brand TEXT, size TEXT, price DECIMAL NOT NULL, currency TEXT NOT NULL DEFAULT 'EUR', ean TEXT, url TEXT NOT NULL, availability TEXT, lastChecked DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, matchConfidence TEXT NOT NULL DEFAULT 'LOW', priceStatus TEXT NOT NULL DEFAULT 'ESTIMATED', notes TEXT, FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE SET NULL, FOREIGN KEY (retailerId) REFERENCES Retailer(id) ON DELETE CASCADE)").run();
  db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS retailer_ean_unique ON RetailerProducts(retailerId, ean)").run();
  db.prepare("CREATE INDEX IF NOT EXISTS retailer_product_name_idx ON RetailerProducts(retailerId, productName)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS PriceObservations (id TEXT PRIMARY KEY, retailerProductId TEXT NOT NULL, price DECIMAL NOT NULL, currency TEXT NOT NULL DEFAULT 'EUR', totalPurchaseCost DECIMAL, shippingCost DECIMAL, priceStatus TEXT NOT NULL DEFAULT 'ESTIMATED', sourceVerification TEXT, observedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, notes TEXT, FOREIGN KEY (retailerProductId) REFERENCES RetailerProducts(id) ON DELETE CASCADE)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS ShippingInfos (id TEXT PRIMARY KEY, retailerProductId TEXT NOT NULL, shippingMethod TEXT, price DECIMAL NOT NULL, currency TEXT NOT NULL DEFAULT 'EUR', estimatedDelivery TEXT, stockAvailable BOOLEAN NOT NULL DEFAULT 1, source TEXT, verificationStatus TEXT, lastVerified DATETIME, notes TEXT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (retailerProductId) REFERENCES RetailerProducts(id) ON DELETE CASCADE)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS ProductMatches (id TEXT PRIMARY KEY, productId TEXT NOT NULL, sourceRetailerProductId TEXT NOT NULL, matchConfidence TEXT NOT NULL, matchFactors TEXT, matchedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, notes TEXT, FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE, FOREIGN KEY (sourceRetailerProductId) REFERENces RetailerProducts(id) ON DELETE CASCADE)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS PriceAlerts (id TEXT PRIMARY KEY, userId TEXT NOT NULL, productId TEXT NOT NULL, retailerProductId TEXT, retailerId TEXT, targetPrice DECIMAL NOT NULL, targetPriceTotal DECIMAL, currency TEXT NOT NULL DEFAULT 'EUR', isActive BOOLEAN NOT NULL DEFAULT 1, triggered BOOLEAN NOT NULL DEFAULT 0, triggeredAt DATETIME, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE, FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE, FOREIGN KEY (retailerProductId) REFERENCES RetailerProducts(id) ON DELETE SET NULL, FOREIGN KEY (retailerId) REFERENCES Retailer(id) ON DELETE SET NULL)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS SearchHistory (id TEXT PRIMARY KEY, userId TEXT, query TEXT NOT NULL, resultCount INTEGER, executedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL)").run();
  db.prepare("CREATE TABLE IF NOT EXISTS IntegrationLogs (id TEXT PRIMARY KEY, retailerId TEXT NOT NULL, operation TEXT NOT NULL, status TEXT NOT NULL, errorMessage TEXT, recordsProcessed INTEGER, recordsSuccessful INTEGER, executionTimeMs INTEGER, executedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (retailerId) REFERENCES Retailer(id) ON DELETE CASCADE)").run();

  // Insert initial retailers
  const retailers = [
    ['yesstyle', 'YesStyle', 'yesstyle', 'https://www.yesstyle.com', 'scraping', 'ACTIVE', 'Germany'],
    ['stylevana', 'Stylevana', 'stylevana', 'https://www.stylevana.com', 'scraping', 'ACTIVE', 'Germany'],
    ['douglas', 'Douglas Germany', 'douglas-de', 'https://www.douglas.de', 'official_api', 'ACTIVE', 'Germany'],
    ['flaconi', 'Flaconi', 'flaconi', 'https://www.flaconi.de', 'official_api', 'ACTIVE', 'Germany'],
    ['notino', 'Notino Germany', 'notino-de', 'https://www.notino.de', 'official_api', 'ACTIVE', 'Germany'],
    ['sephora', 'Sephora Germany', 'sephora-de', 'https://www.sephora.de', 'official_api', 'ACTIVE', 'Germany'],
    ['lookfantastic', 'Lookfantastic Germany', 'lookfantastic-de', 'https://www.lookfantastic.de', 'official_api', 'ACTIVE', 'Germany'],
    ['shop_apotheke', 'Shop Apotheke', 'shop-apotheke', 'https://www.shop-apotheke.de', 'official_api', 'ACTIVE', 'Germany'],
    ['dm', 'dm.de', 'dm-de', 'https://www.dm.de', 'third_party', 'ACTIVE', 'Germany'],
    ['rossmann', 'Rossmann.de', 'rossmann-de', 'https://www.rossmann.de', 'third_party', 'ACTIVE', 'Germany']
  ];
  for (const r of retailers) {
    db.prepare("INSERT OR IGNORE INTO Retailer (id, name, slug, baseUrl, apiType, status, country) VALUES (?, ?, ?, ?, ?, ?, ?)").run(...r);
  }

  // Insert initial categories
  const categories = [
    ['face-cleansers', 'Face Cleansers', 'face-cleansers', 'de'],
    ['toners', 'Toners', 'toners', 'de'],
    ['serums', 'Serums', 'serums', 'de'],
    ['moisturizers', 'Moisturizers', 'moisturizers', 'de'],
    ['sunscreens', 'Sunscreens', 'sunscreens', 'de'],
    ['face-masks', 'Face Masks', 'face-masks', 'de'],
    ['eye-care', 'Eye Care', 'eye-care', 'de'],
    ['makeup', 'Makeup', 'makeup', 'de'],
    ['hair-care', 'Hair Care', 'hair-care', 'de'],
    ['body-care', 'Body Care', 'body-care', 'de'],
    ['k-beauty', 'Korean Skincare', 'k-beauty', 'de'],
    ['j-beauty', 'Japanese Skincare', 'j-beauty', 'de']
  ];
  for (const c of categories) {
    db.prepare("INSERT OR IGNORE INTO ProductCategories (id, name, slug, language) VALUES (?, ?, ?, ?)").run(...c);
  }
  console.log('Database initialized');
}

initDatabase();

// Helper: run matching engine
function matchProductToRetailerProducts(searchProductId) {
  const searchProduct = db.prepare("SELECT p.*, pc.slug as category_slug FROM Products p LEFT JOIN ProductCategories pc ON p.categoryId = pc.id WHERE p.id = ?").get(searchProductId);
  if (!searchProduct) return { error: 'Product not found' };
  
  const retailerProducts = db.prepare("SELECT * FROM RetailerProducts WHERE productId = ?").all(searchProductId);
  
  // Simple matching without external script
  const results = [];
  
  for (const rp of retailerProducts) {
    let score = 0;
    let factors = [];
    const searchName = searchProduct.name || '';
    const searchBrand = searchProduct.brandId ? db.prepare("SELECT name FROM Brands WHERE id = ?").get(searchProduct.brandId).name : searchProduct.name.split(' ')[0];
    const rpBrand = rp.brand || '';
    const rpName = rp.productName || '';
    const rpSize = rp.size || '';
    const rpEan = rp.ean || '';
    const searchEan = searchProduct.ean || '';
    
    // Brand match
    const brandMatch = searchBrand.toLowerCase() === rpBrand.toLowerCase();
    if (brandMatch) { score += 30; factors.push('Brand exact match'); }
    else if (searchBrand.toLowerCase().includes(rpBrand.toLowerCase()) || rpBrand.toLowerCase().includes(searchBrand.toLowerCase())) { score += 15; factors.push('Brand partial match'); }
    
    // EAN match
    const eanMatch = rpEan && searchEan && rpEan === searchEan;
    if (eanMatch) { score += 35; factors.push('EAN exact match'); }
    else if (rpEan && rpEan.length >= 8) { score += 5; factors.push('EAN present'); }
    
    // Size match
    const sizePatterns = ['30ml', '50ml', '100ml', '15ml', '10ml'];
    const sizeMatch = sizePatterns.some(p => searchName.toLowerCase().includes(p) && rpName.toLowerCase().includes(p));
    if (sizeMatch) { score += 20; factors.push('Size match'); }
    
    // Name keyword overlap
    const searchWords = searchName.toLowerCase().split(' ').filter(w => w.length > 2);
    const rpWords = rpName.toLowerCase().split(' ').filter(w => w.length > 2);
    const commonWords = searchWords.filter(w => rpWords.includes(w));
    const wordMatch = commonWords.length >= 2;
    if (wordMatch) { score += 15; factors.push('Keyword overlap'); }
    
    let confidence;
    if (score >= 80) confidence = 'EXACT';
    else if (score >= 60) confidence = 'HIGH';
    else if (score >= 40) confidence = 'POSSIBLE';
    else if (score > 0) confidence = 'LOW';
    else confidence = 'DIFFERENT';
    
    results.push({
      retailerProduct: rp,
      confidence: confidence,
      matchScore: score,
      matchFactors: factors
    });
  }
  
  return {
    product: searchProduct,
    matches: results.sort((a, b) => {
      if (a.confidence !== b.confidence) return a.confidence < b.confidence ? 1 : -1;
      return b.matchScore - a.matchScore;
    })
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const existingUser = db.prepare("SELECT * FROM Users WHERE email = ?").get(email);
    if (existingUser) return res.status(409).json({ error: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    db.prepare("INSERT INTO Users (id, email, passwordHash, name) VALUES (?, ?, ?, ?)").run(userId, email, hashedPassword, name);
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET || 'beautypreis-secret', { expiresIn: '24h' });
    res.json({ token, user: { id: userId, email, name } });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM Users WHERE email = ?").get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'beautypreis-secret', { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
});

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, process.env.JWT_SECRET || 'beautypreis-secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });
    req.user = user;
    next();
  });
}

// Retailer routes
app.get('/api/retailers', (req, res) => {
  const retailers = db.prepare("SELECT id, name, slug, baseUrl, apiType, status, currency, country FROM Retailer").all();
  res.json(retailers);
});

app.get('/api/retailers/:slug', (req, res) => {
  const retailer = db.prepare("SELECT * FROM Retailer WHERE slug = ?").get(req.params.slug);
  if (!retailer) return res.status(404).json({ error: 'Retailer not found' });
  res.json(retailer);
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const { brand, category, q } = req.query;
    let sql = `SELECT p.*, b.name AS brandName, pc.slug AS category_slug, pc.name AS categoryName
               FROM Products p
               LEFT JOIN Brands b ON p.brandId = b.id
               LEFT JOIN ProductCategories pc ON p.categoryId = pc.id
               WHERE 1=1`;
    const params = [];
    if (brand) { sql += " AND p.brandId = ?"; params.push(brand); }
    if (category) { sql += " AND (p.categoryId = ? OR pc.slug = ?)"; params.push(category, category); }
    if (q) { sql += " AND (p.name LIKE ? OR p.slug LIKE ? OR p.ean LIKE ?)"; params.push('%' + q + '%', '%' + q + '%', '%' + q + '%'); }
    sql += " ORDER BY p.name ASC";
    const products = db.prepare(sql).all(...params);

    // If the local catalogue has no hits, fall back to live retailer discovery
    // via the scraping adapters so users can compare any product they can think of.
    if (q && products.length === 0) {
      const adapterResults = await searchProductsViaRetailerAdapters(q);
      if (adapterResults.length > 0) {
        return res.json({ products: adapterResults, count: adapterResults.length });
      }
    }

    res.json({ products, count: products.length });
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare(`SELECT p.*, b.name AS brandName, pc.slug AS category_slug, pc.name AS categoryName
                              FROM Products p
                              LEFT JOIN Brands b ON p.brandId = b.id
                              LEFT JOIN ProductCategories pc ON p.categoryId = pc.id
                              WHERE p.id = ?`).get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Search by product name, brand, EAN or model number
app.post('/api/search', async (req, res) => {
  try {
    const { query: searchQuery } = req.body;
    const term = typeof searchQuery === 'string' ? searchQuery.trim() : '';
    if (!term) return res.status(400).json({ error: 'Search query required' });
    const like = '%' + term + '%';
    const productQuery = db.prepare(`SELECT p.*, b.name AS brandName, pc.slug AS category_slug, pc.name AS categoryName
                                     FROM Products p
                                     LEFT JOIN Brands b ON p.brandId = b.id
                                     LEFT JOIN ProductCategories pc ON p.categoryId = pc.id
                                     WHERE p.name LIKE ? OR p.slug LIKE ? OR b.name LIKE ?
                                        OR p.ean LIKE ? OR p.modelNumber LIKE ?
                                     ORDER BY p.name ASC`).all(like, like, like, like, like);

    // If the local catalogue has no hits, fall back to live retailer discovery
    // via the scraping adapters so any product can be found and compared.
    if (productQuery.length === 0) {
      const adapterResults = await searchProductsViaRetailerAdapters(term);
      if (adapterResults.length > 0) {
        return res.json({ query: term, results: adapterResults, count: adapterResults.length, source: 'retailer-adapter' });
      }
    }

    res.json({ query: term, results: productQuery, count: productQuery.length });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Live retailer discovery via scraping adapters - used when the local
// catalogue has no match, so any searchable product can be found & compared.
async function searchProductsViaRetailerAdapters(term) {
  const candidates = [
    { retailerId: 'yesstyle', adapter: yesStyleAdapter({ retailerId: 'yesstyle', retailerName: 'YesStyle', baseUrl: 'https://www.yesstyle.com', apiType: 'scraping' }) },
    { retailerId: 'flaconi', adapter: flaconiAdapter({ retailerId: 'flaconi', retailerName: 'Flaconi', baseUrl: 'https://www.flaconi.de', apiType: 'scraping' }) },
    { retailerId: 'stylevana', adapter: stylevanaAdapter({ retailerId: 'stylevana', retailerName: 'Stylevana', baseUrl: 'https://www.stylevana.com', apiType: 'scraping' }) },
  ];

  for (const candidate of candidates) {
    try {
      const found = await candidate.adapter.searchProducts(term);
      if (Array.isArray(found) && found.length > 0) {
        const fp = found[0];
        const slug = String(fp.name || term).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product';
        const productId = 'prod-adapt-' + slug;
        const brandSlug = String(fp.brand || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unknown';
        db.prepare(`INSERT OR IGNORE INTO Products (id, brandId, name, slug, modelNumber, size, color, gender, categoryId, ean, matchConfidence) VALUES (?, (SELECT id FROM Brands WHERE slug = ?), ?, ?, ?, ?, ?, ?, NULL, ?, 'LOW')`)
          .run(productId, brandSlug, fp.name || term, slug, fp.size || null, fp.ean || null);
        const retailerProductId = 'rp-adapt-' + slug;
        db.prepare(`INSERT OR IGNORE INTO RetailerProducts (id, productId, retailerId, productName, brand, size, price, currency, ean, url, availability, priceStatus, notes) VALUES (?, ?, ?, ?, ?, ?, ?, 'EUR', ?, ?, ?, 'ESTIMATED', 'adapter discovery')`)
          .run(retailerProductId, productId, candidate.retailerId, fp.productName || fp.name || term, fp.brand || '', fp.size || '', fp.price || 0, fp.ean || '', fp.url || '');
        const shippingRow = db.prepare("SELECT * FROM ShippingInfos WHERE retailerProductId = ?").all(retailerProductId);
        const shippingPrice = (shippingRow && shippingRow[0] && shippingRow[0].price) ? shippingRow[0].price : 0;
        db.prepare("INSERT OR IGNORE INTO PriceObservations (id, retailerProductId, price, currency, totalPurchaseCost, shippingCost, priceStatus, sourceVerification, notes) VALUES (?, ?, ?, 'EUR', ?, ?, 'ESTIMATED', 'adapter discovery', 'live adapter discovery')")
          .run('po-adapt-' + slug, retailerProductId, fp.price || 0, (fp.price || 0) + shippingPrice, shippingPrice, 'live adapter discovery');
        const product = db.prepare(`SELECT p.*, b.name AS brandName, pc.slug AS category_slug, pc.name AS categoryName
                                   FROM Products p LEFT JOIN Brands b ON p.brandId = b.id LEFT JOIN ProductCategories pc ON p.categoryId = pc.id WHERE p.id = ?`).get(productId);
        return [product];
      }
    } catch (err) {
      console.warn('Retailer adapter search failed for ' + candidate.retailerId + ':', err.message);
    }
  }
  return [];
}

// Product matching - find retailer offers with confidence scoring
app.get('/api/products/:productId/offers', (req, res) => {
  try {
    const productId = req.params.productId;
    const matchResult = matchProductToRetailerProducts(productId);
    
    if (matchResult.error) return res.status(404).json({ error: matchResult.error });
    
    const product = matchResult.product;
    const matches = matchResult.matches;
    
    // Build offers with shipping and price info
    const offers = [];
    for (const match of matches) {
      const rp = match.retailerProduct;
      const shipping = db.prepare("SELECT * FROM ShippingInfos WHERE retailerProductId = ?").all(rp.id);
      const priceObservations = db.prepare("SELECT * FROM PriceObservations WHERE retailerProductId = ? ORDER BY observedAt DESC LIMIT 1").all(rp.id);
      
      offers.push({
        retailerProduct: rp,
        confidence: match.confidence,
        matchScore: match.matchScore,
        matchFactors: match.matchFactors,
        productName: rp.productName,
        brand: rp.brand,
        size: rp.size,
        price: rp.price,
        currency: rp.currency,
        shipping: shipping[0] || null,
        totalPurchaseCost: rp.price + (shipping[0] ? shipping[0].price : 0),
        lastPriceObservation: priceObservations[0] || null,
        verificationStatus: priceObservations[0] ? priceObservations[0].priceStatus : rp.priceStatus,
        priceStatus: priceObservations[0] ? priceObservations[0].priceStatus : rp.priceStatus,
        url: rp.url,
        availability: rp.availability
      });
    }
    
    res.json({
      product,
      offers,
      count: offers.length,
      matchSummary: {
        bestConfidence: matches[0] ? matches[0].confidence : 'N/A',
        bestScore: matches[0] ? matches[0].matchScore : 0
      }
    });
  } catch (err) {
    console.error('Offers error:', err);
    res.status(500).json({ error: 'Failed to retrieve offers' });
  }
});

// Price alerts
app.post('/api/alerts', authenticateToken, (req, res) => {
  try {
    const { productId, retailerProductId, retailerId, targetPrice, targetPriceTotal } = req.body;
    const userId = req.user.userId;
    if (!productId || !targetPrice) return res.status(400).json({ error: 'Product ID and target price required' });
    db.prepare("INSERT INTO PriceAlerts (userId, productId, retailerProductId, retailerId, targetPrice, targetPriceTotal, currency) VALUES (?, ?, ?, ?, ?, ?, 'EUR')").run(userId, productId, retailerProductId, retailerId, targetPrice, targetPriceTotal);
    res.json({ success: true, message: 'Price alert created' });
  } catch (err) { res.status(500).json({ error: 'Failed to create price alert' }); }
});

app.get('/api/alerts', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const alerts = db.prepare("SELECT * FROM PriceAlerts WHERE userId = ? AND isActive = 1").all(userId);
  res.json(alerts);
});

// Search history
app.post('/api/search-history', authenticateToken, (req, res) => {
  try {
    const { query: searchQuery } = req.body;
    const userId = req.user.userId;
    db.prepare("INSERT INTO SearchHistory (userId, query) VALUES (?, ?)").run(userId, searchQuery);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to save search' }); }
});

// Start server
app.listen(PORT, () => {
  console.log('BeautyPreis API running on port ' + PORT);
});