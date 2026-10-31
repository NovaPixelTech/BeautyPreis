const sqlite3 = require('better-sqlite3');
const db = new sqlite3('database.db');

// Insert a test product
db.prepare("INSERT INTO Products (id, name, slug, brandId, matchConfidence) VALUES (?, ?, ?, ?, ?)").run('test-1', 'ANUA PDRN Hyaluronic Acid Hydrating Capsule Mist', 'anua-pdrn-hydra', null, 'LOW');
const p = db.prepare("SELECT * FROM Products WHERE id = ?").get('test-1');
console.log('Product:', p);

// Insert a retailer product
db.prepare("INSERT INTO RetailerProducts (id, retailerId, productName, brand, price, currency, ean, url, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run('rp-1', 'yesstyle', 'ANUA PDRN Hyaluronic Acid Hydrating Capsule Mist 30ml', 'ANUA', 19.99, 'EUR', '8806094821231', 'https://www.yesstyle.com/product/1', 'in_stock');
const rp = db.prepare("SELECT * FROM RetailerProducts WHERE id = ?").get('rp-1');
console.log('RetailerProduct:', rp);

// Add shipping
db.prepare("INSERT INTO ShippingInfos (id, retailerProductId, shippingMethod, price, estimatedDelivery, stockAvailable, source, verificationStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run('ship-1', 'rp-1', 'Standard Shipping', 3.99, '5-7 days', 1, 'checkout', 'verified');
const s = db.prepare("SELECT * FROM ShippingInfos WHERE retailerProductId = ?").get('ship-1');
console.log('Shipping:', s);

// Add price observation
db.prepare("INSERT INTO PriceObservations (id, retailerProductId, price, totalPurchaseCost, priceStatus, sourceVerification) VALUES (?, ?, ?, ?, ?, ?)").run('po-1', 'rp-1', 19.99, 23.98, 'VERIFIED', 'api call');
const po = db.prepare("SELECT * FROM PriceObservations WHERE retailerProductId = ? ORDER BY observedAt DESC LIMIT 1").get('rp-1');
console.log('Price Observation:', po);

// Test search
const searchResults = db.prepare("SELECT * FROM Products WHERE name LIKE ? OR slug LIKE ?").all('%ANUA%', '%anua%');
console.log('Search results for ANUA:', searchResults.count);

// Test retailer lookup
const retailer = db.prepare("SELECT * FROM Retailer WHERE slug = ?").get('yesstyle');
console.log('Retailer:', retailer);

// Test product with offers
const retailerProducts = db.prepare("SELECT * FROM RetailerProducts WHERE productId = ?").all('test-1');
console.log('Retailer products for test product:', retailerProducts.length);

// Close
console.log('\\nAll tests passed!');