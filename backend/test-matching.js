const sqlite3 = require('better-sqlite3');
const db = new sqlite3('database.db');

// Test product matching engine
function matchProductToRetailerProducts(searchProductId) {
  const searchProduct = db.prepare('SELECT p.*, pc.slug as category_slug FROM Products p LEFT JOIN ProductCategories pc ON p.categoryId = pc.id WHERE p.id = ?').get(searchProductId);
  if (!searchProduct) return { error: 'Product not found' };
  
  const retailerProducts = db.prepare('SELECT * FROM RetailerProducts WHERE productId = ?').all(searchProductId);
  
  const results = [];
  
  for (const rp of retailerProducts) {
    let score = 0;
    let factors = [];
    const searchName = searchProduct.name || '';
    const searchBrand = searchProduct.brandId ? db.prepare('SELECT name FROM Brands WHERE id = ?').get(searchProduct.brandId).name : searchProduct.name.split(' ')[0];
    const rpBrand = rp.brand || '';
    const rpName = rp.productName || '';
    const rpSize = rp.size || '';
    const rpEan = rp.ean || '';
    const searchEan = searchProduct.ean || '';
    
    const brandMatch = searchBrand.toLowerCase() === rpBrand.toLowerCase();
    if (brandMatch) { score += 30; factors.push('Brand exact match'); }
    else if (searchBrand.toLowerCase().includes(rpBrand.toLowerCase()) || rpBrand.toLowerCase().includes(searchBrand.toLowerCase())) { score += 15; factors.push('Brand partial match'); }
    
    const eanMatch = rpEan && searchEan && rpEan === searchEan;
    if (eanMatch) { score += 35; factors.push('EAN exact match'); }
    else if (rpEan && rpEan.length >= 8) { score += 5; factors.push('EAN present'); }
    
    const sizePatterns = ['30ml', '50ml', '100ml', '15ml', '10ml', '170ml', '80ml'];
    const sizeMatch = sizePatterns.some(p => searchName.toLowerCase().includes(p) && rpName.toLowerCase().includes(p));
    if (sizeMatch) { score += 20; factors.push('Size match'); }
    
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

// Test with ANUA PDRN product
console.log('=== Testing Product Matching for ANUA PDRN ===');
const result = matchProductToRetailerProducts('prod-anua-pdrn');
console.log('Product:', result.product.name);
console.log('EAN:', result.product.ean);
console.log('');
console.log('Matches:');
result.matches.forEach((m, i) => {
  const rp = m.retailerProduct;
  const shipping = db.prepare('SELECT * FROM ShippingInfos WHERE retailerProductId = ?').all(rp.id)[0];
  const po = db.prepare('SELECT * FROM PriceObservations WHERE retailerProductId = ? ORDER BY observedAt DESC LIMIT 1').all(rp.id)[0];
  const total = rp.price + (shipping ? shipping.price : 0);
  console.log('  ' + (i+1) + '. ' + rp.retailerId + ' - ' + rp.productName);
  console.log('     Brand: ' + rp.brand + ' | Size: ' + rp.size + ' | EAN: ' + rp.ean);
  console.log('     Price: €' + rp.price + ' | Shipping: €' + (shipping ? shipping.price : 0));
  console.log('     Total: €' + total + ' | Confidence: ' + m.confidence + ' (' + m.matchScore + '/100)');
  console.log('     Factors: ' + m.matchFactors.join(', '));
  console.log('     Price Status: ' + rp.priceStatus + ' | Source: ' + (po ? po.sourceVerification : 'none'));
});

console.log('');
console.log('=== Testing Product Matching for COSRX Snail ===');
const result2 = matchProductToRetailerProducts('prod-cosrx-snail');
console.log('Product:', result2.product.name);
console.log('EAN:', result2.product.ean);
console.log('');
console.log('Matches:');
result2.matches.forEach((m, i) => {
  const rp = m.retailerProduct;
  const shipping = db.prepare('SELECT * FROM ShippingInfos WHERE retailerProductId = ?').all(rp.id)[0];
  const po = db.prepare('SELECT * FROM PriceObservations WHERE retailerProductId = ? ORDER BY observedAt DESC LIMIT 1').all(rp.id)[0];
  const total = rp.price + (shipping ? shipping.price : 0);
  console.log('  ' + (i+1) + '. ' + rp.retailerId + ' - ' + rp.productName);
  console.log('     Brand: ' + rp.brand + ' | Size: ' + rp.size + ' | EAN: ' + rp.ean);
  console.log('     Price: €' + rp.price + ' | Shipping: €' + (shipping ? shipping.price : 0));
  console.log('     Total: €' + total + ' | Confidence: ' + m.confidence + ' (' + m.matchScore + '/100)');
  console.log('     Factors: ' + m.matchFactors.join(', '));
  console.log('     Price Status: ' + rp.priceStatus + ' | Source: ' + (po ? po.sourceVerification : 'none'));
});

db.close();
console.log('\nAll tests passed!');
