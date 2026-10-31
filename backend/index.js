const express = require('express');
const path = require('path');
const sqlite3 = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3011;

// Database setup
const db = new sqlite3(path.join(__dirname, 'database.db'));
db.pragma('foreign_keys = ON');
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
    ['yesstyle', 'YesStyle', 'yesstyle', 'https://www.yesstyle.com', 'third_party', 'ACTIVE', 'Germany'],
    ['stylevana', 'Stylevana', 'stylevana', 'https://www.stylevana.com', 'third_party', 'ACTIVE', 'Germany'],
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
app.get('/api/products', (req, res) => {
  const { brand, category, q } = req.query;
  let query = db.prepare("SELECT p.*, pc.slug as category_slug FROM Products p LEFT JOIN ProductCategories pc ON p.categoryId = pc.id WHERE 1=1");
  const params = [];
  if (brand) { query = query.append(" AND p.brandId = ?"); params.push(brand); }
  if (category) { query = query.append(" AND p.categoryId = ?"); params.push(category); }
  if (q) { query = query.append(" AND (p.name LIKE ? OR p.slug LIKE ?)"); params.push('%' + q + '%', '%' + q + '%'); }
  const products = query.all(params);
  res.json({ products, count: products.length });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare("SELECT * FROM Products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Search
app.post('/api/search', (req, res) => {
  try {
    const { query: searchQuery, brand, category } = req.body;
    if (!searchQuery) return res.status(400).json({ error: 'Search query required' });
    const productQuery = db.prepare("SELECT p.*, pc.slug as category_slug FROM Products p LEFT JOIN ProductCategories pc ON p.categoryId = pc.id WHERE p.name LIKE ? OR p.slug LIKE ? OR p.brandId = ? OR p.modelNumber LIKE ?").all('%' + searchQuery + '%', '%' + searchQuery + '%', brand, '%' + searchQuery + '%');
    res.json({ query: searchQuery, results: productQuery, count: productQuery.length });
  } catch (err) { res.status(500).json({ error: 'Search failed' }); }
});

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
        verificationStatus: rp.priceStatus,
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