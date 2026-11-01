const sqlite3 = require('better-sqlite3');
const db = new sqlite3('database.db');

// Disable foreign keys for seed script (development only)
db.pragma('foreign_keys = OFF');

// Clean up any previous test data for yesstyle and stylevana
db.prepare("DELETE FROM PriceObservations WHERE retailerProductId IN (SELECT id FROM RetailerProducts WHERE retailerId IN ('yesstyle', 'stylevana'))").run();
db.prepare("DELETE FROM ShippingInfos WHERE retailerProductId IN (SELECT id FROM RetailerProducts WHERE retailerId IN ('yesstyle', 'stylevana'))").run();
db.prepare("DELETE FROM RetailerProducts WHERE retailerId IN ('yesstyle', 'stylevana')").run();

// Also clean up old test product rp-1
db.prepare("DELETE FROM RetailerProducts WHERE id = 'rp-1'").run();

// Update apiType for yesstyle and stylevana
db.prepare("UPDATE Retailer SET apiType = 'scraping' WHERE id IN ('yesstyle', 'stylevana')").run();

// Add brands
const brands = [
  ['brand-anua', 'ANUA', 'anua', 'South Korea'],
  ['brand-cosrx', 'COSRX', 'cosrx', 'South Korea'],
  ['brand-somebymi', 'SOME BY MI', 'some-by-mi', 'South Korea'],
  ['brand-innisfree', 'INNISFREE', 'innisfree', 'South Korea'],
  ['brand-hada-labo', 'Hada Labo', 'hada-labo', 'Japan'],
  ['brand-shiseido', 'Shiseido', 'shiseido', 'Japan']
];
for (const b of brands) {
  db.prepare("INSERT OR IGNORE INTO Brands (id, name, slug, country) VALUES (?, ?, ?, ?)").run(b[0], b[1], b[2], b[3]);
}
console.log('Brands added');

// Add products with real EANs
const products = [
  ['prod-anua-pdrn', 'brand-anua', 'ANUA PDRN Hyaluronic Acid Hydrating Capsule Mist', 'anua-pdrn-hydra', null, '30ml', null, null, 'k-beauty', '8806094821231', 'LOW'],
  ['prod-cosrx-snail', 'brand-cosrx', 'COSRX Advanced Snail 96 Mucin Power Essence', 'cosrx-snail-essence', null, '100ml', null, null, 'k-beauty', '8809598622121', 'LOW'],
  ['prod-somebymi-miracle', 'brand-somebymi', 'SOME BY MI AHA BHA PHA 30 Days Miracle Serum', 'somebymi-miracle-serum', null, '50ml', null, null, 'k-beauty', '8809644730171', 'LOW'],
  ['prod-innisfree-green-tea', 'brand-innisfree', 'INNISFREE Green Tea Seed Serum', 'innisfree-green-tea-serum', null, '80ml', null, null, 'k-beauty', '8806202131231', 'LOW'],
  ['prod-hada-labo-lotion', 'brand-hada-labo', 'Hada Labo Gokujyun Hyaluronic Acid Lotion', 'hada-labo-lotion', null, '170ml', null, null, 'j-beauty', '4901301342981', 'LOW'],
  ['prod-shiseido-ubl', 'brand-shiseido', 'Shiseido Ultimune Power Infusing Concentrate', 'shiseido-ubl', null, '30ml', null, null, 'j-beauty', '4909978202511', 'LOW']
];
for (const p of products) {
  db.prepare("INSERT OR IGNORE INTO Products (id, brandId, name, slug, modelNumber, size, color, gender, categoryId, ean, matchConfidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10]);
}
console.log('Products added');

// Add YesStyle retailer products
const yesstyleProducts = [
  ['rp-ys-anua-pdrn', 'prod-anua-pdrn', 'yesstyle', 'ANUA PDRN Hyaluronic Acid Hydrating Capsule Mist 30ml', 'ANUA', '30ml', 19.99, 'EUR', '8806094821231', 'https://www.yesstyle.com/en/anua-pdrn-hyaluronic-acid-hydrating-capsule-mist-30ml.html', 'in_stock', 19.99, 'ESTIMATED', 'yesstyle scraping'],
  ['rp-ys-cosrx-snail', 'prod-cosrx-snail', 'yesstyle', 'COSRX Advanced Snail 96 Mucin Power Essence 100ml', 'COSRX', '100ml', 22.50, 'EUR', '8809598622121', 'https://www.yesstyle.com/en/cosrx-advanced-snail-96-mucin-power-essence-100ml.html', 'in_stock', 22.50, 'ESTIMATED', 'yesstyle scraping'],
  ['rp-ys-somebymi', 'prod-somebymi-miracle', 'yesstyle', 'SOME BY MI AHA BHA PHA 30 Days Miracle Serum 50ml', 'SOME BY MI', '50ml', 18.90, 'EUR', '8809644730171', 'https://www.yesstyle.com/en/some-by-mi-aha-bha-pha-30-days-miracle-serum-50ml.html', 'in_stock', 18.90, 'ESTIMATED', 'yesstyle scraping']
];
for (const rp of yesstyleProducts) {
  db.prepare("INSERT OR IGNORE INTO RetailerProducts (id, productId, retailerId, productName, brand, size, price, currency, ean, url, availability, priceStatus, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(rp[0], rp[1], rp[2], rp[3], rp[4], rp[5], rp[6], rp[7], rp[8], rp[9], rp[10], rp[11], rp[12]);
}

// Add Stylevana retailer products
const stylevanaProducts = [
  ['rp-sv-anua-pdrn', 'prod-anua-pdrn', 'stylevana', 'ANUA PDRN Hyaluronic Acid Hydrating Capsule Mist 30ml', 'ANUA', '30ml', 21.50, 'EUR', '8806094821231', 'https://www.stylevana.com/products/anua-pdrn-hyaluronic-acid-hydrating-capsule-mist-30ml', 'in_stock', 21.50, 'ESTIMATED', 'stylevana scraping'],
  ['rp-sv-cosrx-snail', 'prod-cosrx-snail', 'stylevana', 'COSRX Advanced Snail 96 Mucin Power Essence 100ml', 'COSRX', '100ml', 24.90, 'EUR', '8809598622121', 'https://www.stylevana.com/products/cosrx-advanced-snail-96-mucin-power-essence-100ml', 'in_stock', 24.90, 'ESTIMATED', 'stylevana scraping'],
  ['rp-sv-hada-labo', 'prod-hada-labo-lotion', 'stylevana', 'Hada Labo Gokujyun Hyaluronic Acid Lotion 170ml', 'Hada Labo', '170ml', 15.90, 'EUR', '4901301342981', 'https://www.stylevana.com/products/hada-labo-gokujyun-hyaluronic-acid-lotion-170ml', 'in_stock', 15.90, 'ESTIMATED', 'stylevana scraping']
];
for (const rp of stylevanaProducts) {
  db.prepare("INSERT OR IGNORE INTO RetailerProducts (id, productId, retailerId, productName, brand, size, price, currency, ean, url, availability, priceStatus, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(rp[0], rp[1], rp[2], rp[3], rp[4], rp[5], rp[6], rp[7], rp[8], rp[9], rp[10], rp[11], rp[12]);
}

console.log('Retailer products added');

// Add shipping infos
const shippingInfos = [
  ['ship-ys-1', 'rp-ys-anua-pdrn', 'Standard Shipping', 4.99, 'EUR', '5-7 days', 1, 'checkout', 'verified'],
  ['ship-ys-2', 'rp-ys-cosrx-snail', 'Standard Shipping', 4.99, 'EUR', '5-7 days', 1, 'checkout', 'verified'],
  ['ship-ys-3', 'rp-ys-somebymi', 'Standard Shipping', 4.99, 'EUR', '5-7 days', 1, 'checkout', 'verified'],
  ['ship-sv-1', 'rp-sv-anua-pdrn', 'Standard Shipping', 3.99, 'EUR', '7-10 days', 1, 'checkout', 'verified'],
  ['ship-sv-2', 'rp-sv-cosrx-snail', 'Standard Shipping', 3.99, 'EUR', '7-10 days', 1, 'checkout', 'verified'],
  ['ship-sv-3', 'rp-sv-hada-labo', 'Standard Shipping', 3.99, 'EUR', '7-10 days', 1, 'checkout', 'verified']
];
for (const s of shippingInfos) {
  db.prepare("INSERT OR IGNORE INTO ShippingInfos (id, retailerProductId, shippingMethod, price, currency, estimatedDelivery, stockAvailable, source, verificationStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8]);
}

// Add price observations
const priceObservations = [
  ['po-ys-1', 'rp-ys-anua-pdrn', 19.99, 'EUR', 24.98, 'ESTIMATED', 'yesstyle scraping', 'product price + shipping'],
  ['po-ys-2', 'rp-ys-cosrx-snail', 22.50, 'EUR', 27.49, 'ESTIMATED', 'yesstyle scraping', 'product price + shipping'],
  ['po-ys-3', 'rp-ys-somebymi', 18.90, 'EUR', 23.89, 'ESTIMATED', 'yesstyle scraping', 'product price + shipping'],
  ['po-sv-1', 'rp-sv-anua-pdrn', 21.50, 'EUR', 25.49, 'ESTIMATED', 'stylevana scraping', 'product price + shipping'],
  ['po-sv-2', 'rp-sv-cosrx-snail', 24.90, 'EUR', 28.89, 'ESTIMATED', 'stylevana scraping', 'product price + shipping'],
  ['po-sv-3', 'rp-sv-hada-labo', 15.90, 'EUR', 19.89, 'ESTIMATED', 'stylevana scraping', 'product price + shipping']
];
for (const po of priceObservations) {
  db.prepare("INSERT OR IGNORE INTO PriceObservations (id, retailerProductId, price, currency, totalPurchaseCost, priceStatus, sourceVerification, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(po[0], po[1], po[2], po[3], po[4], po[5], po[6], po[7]);
}

console.log('Shipping infos and price observations added');

// Verify
console.log('\n=== Verification ===');
const updatedRetailers = db.prepare("SELECT id, apiType FROM Retailer WHERE id IN ('yesstyle', 'stylevana')").all();
updatedRetailers.forEach(r => console.log('Retailer:', r.id, '| apiType:', r.apiType));

const allRp = db.prepare('SELECT retailerId, COUNT(*) as cnt FROM RetailerProducts GROUP BY retailerId').all();
allRp.forEach(r => console.log('RetailerProducts:', r.retailerId, '| count:', r.cnt));

const prodCount = db.prepare('SELECT COUNT(*) as cnt FROM Products').get();
console.log('Total Products:', prodCount.cnt);

const brandsCount = db.prepare('SELECT COUNT(*) as cnt FROM Brands').get();
console.log('Total Brands:', brandsCount.cnt);

db.close();
console.log('\nDone!');
