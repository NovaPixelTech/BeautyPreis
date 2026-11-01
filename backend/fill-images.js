const db = require('better-sqlite3')('database.db');

// Update missing images
const updates = [
  ['rp-ys-somebymi', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'],
  ['rp-sv-hada-labo', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80']
];
updates.forEach(([id, url]) => {
  db.prepare('UPDATE RetailerProducts SET imageUrl = ? WHERE id = ?').run(url, id);
  console.log('Updated', id);
});

// Insert missing RetailerProducts
const inserts = [
  ['rp-ys-test1', 'test-1', 'yesstyle', 'ANUA PDRN Hyaluronic Acid Hydrating Capsule Mist 30ml', 'ANUA', '30ml', 18.99, '', 'https://www.yesstyle.com/en/anua-pdrn-hyaluronic-acid-hydrating-capsule-mist-30ml.html', 'in_stock', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80'],
  ['rp-ys-innisfree', 'prod-innisfree-green-tea', 'yesstyle', 'INNISFREE Green Tea Seed Serum', 'INNISFREE', '', 22.5, '', 'https://www.yesstyle.com/en/innisfree-green-tea-seed-serum.html', 'in_stock', 'https://images.unsplash.com/photo-1601049541289-9a82eb3e4e7d?w=600&q=80'],
  ['rp-ys-shiseido', 'prod-shiseido-ubl', 'yesstyle', 'Shiseido Ultimune Power Infusing Concentrate', 'Shiseido', '30ml', 59.0, '', 'https://www.yesstyle.com/en/shiseido-ultimune-power-infusing-concentrate.html', 'in_stock', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80']
];

const stmt = db.prepare('INSERT OR IGNORE INTO RetailerProducts (id, productId, retailerId, productName, brand, size, price, currency, ean, url, availability, priceStatus, notes, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

inserts.forEach(args => {
  stmt.run(args[0], args[1], args[2], args[3], args[4], args[5], args[6], 'EUR', args[7], args[8], args[9], 'ESTIMATED', 'adapter discovery', args[10]);
  console.log('Inserted', args[0]);
});

db.close();
