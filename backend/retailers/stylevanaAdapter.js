const ScrapingAdapter = require('./scrapingAdapter');

/**
 * Stylevana Adapter (SCRAPING type)
 * 
 * Integrates with Stylevana.com by scraping publicly accessible product pages.
 * No official API required - works immediately.
 * 
 * Notes:
 * - Stylevana does not have a free public API
 * - All scraped data is marked as ESTIMATED verification status
 * - Respect Stylevana's robots.txt and rate limits
 * - Do NOT bypass CAPTCHAs or anti-bot protection
 * 
 * @extends ScrapingAdapter
 */
class StylevanaAdapter extends ScrapingAdapter {
  constructor(options) {
    super(options);
    this.apiType = 'scraping';
    this.rateLimit = 30; // requests per minute - conservative for scraping
  }

  /**
   * Build Stylevana search URL
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {string} Search URL
   * @private
   */
  _buildSearchUrl(query, filters = {}) {
    const encodedQuery = encodeURIComponent(query.trim());
    return `https://www.stylevana.com/search?search=${encodedQuery}`;
  }

  /**
   * Parse Stylevana search results
   * @param {cheerio.Root} $ - Cheerio root
   * @returns {Array} Raw product data
   * @private
   */
  _parseSearchResults($) {
    const products = [];
    
    // Stylevana product cards
    $('.product-card, .product-item, .grid-view-item, .product-block').each((i, el) => {
      const $el = $(el);
      const name = $el.find('.product-title, .product-name, h3, h2, .card-heading').first().text().trim() ||
                   $el.find('a').attr('title') ||
                   $el.text().trim().substring(0, 100);
       
      const url = $el.find('a').attr('href') || '';
      const fullUrl = url.startsWith('http') ? url : 'https://www.stylevana.com' + url;
       
      const priceText = $el.find('.price, .product-price, .sale-price, [class*="price"]').first().text().trim();
      const price = this._parsePrice(priceText);
       
      const imageUrl = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
       
      const brand = $el.find('.brand, .vendor, [class*="brand"]').first().text().trim() || '';
       
      if (name) {
        products.push({
          id: fullUrl,
          name: name,
          brand: brand,
          price: price,
          currency: 'EUR',
          url: fullUrl,
          imageUrl: imageUrl,
          ean: '',
          size: '',
          availability: 'in_stock'
        });
      }
    });
     
    // Fallback: try JSON-LD structured data
    if (products.length === 0) {
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const data = JSON.parse($(el).html());
          if (data.itemListElement) {
            data.itemListElement.forEach(item => {
              if (item.item) {
                products.push({
                  id: item.item.url || '',
                  name: item.item.name || '',
                  brand: item.item.brand || '',
                  price: item.item.offers ? parseFloat(item.item.offers.price) || 0 : 0,
                  currency: item.item.offers ? item.item.offers.priceCurrency || 'EUR' : 'EUR',
                  url: item.item.url || '',
                  imageUrl: item.item.image || '',
                  ean: item.item.gtin || '',
                  size: '',
                  availability: item.item.offers ? item.item.offers.availability || 'unknown' : 'unknown'
                });
              }
            });
          }
        } catch (e) {
          // Skip invalid JSON-LD
        }
      });
    }
     
    return products.slice(0, 20);
  }

  /**
   * Parse Stylevana product page
   * @param {cheerio.Root} $ - Cheerio root
   * @returns {Object|null} Raw product data
   * @private
   */
  _parseProductPage($) {
    // Try JSON-LD structured data first
    const jsonLd = $('script[type="application/ld+json"]').first().html();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.name || data.brand) {
          return {
            id: data.url || '',
            name: data.name || '',
            brand: data.brand && data.brand.name ? data.brand.name : (data.brand || ''),
            price: data.offers ? parseFloat(data.offers.price) || 0 : 0,
            currency: data.offers ? data.offers.priceCurrency || 'EUR' : 'EUR',
            url: data.url || '',
            imageUrl: data.image || '',
            ean: data.gtin || data.isbn || '',
            size: data.size || '',
            availability: data.offers ? data.offers.availability || 'unknown' : 'unknown'
          };
        }
      } catch (e) {
        // Fall through to HTML parsing
      }
    }
     
    // HTML fallback
    const name = $('h1.product-title, h1.product-name, h1').first().text().trim() ||
                 $('.product-title').first().text().trim() ||
                 document.title || '';
     
    const priceText = $('.price, .product-price, .sale-price, [class*="price"]').first().text().trim();
    const price = this._parsePrice(priceText);
     
    const brand = $('.brand, .vendor, [class*="brand"]').first().text().trim() || '';
    const imageUrl = $('img.product-image, img.main-image, img[itemprop="image"]').attr('src') || 
                     $('img').first().attr('src') || '';
     
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
     
    if (!name) return null;
     
    return {
      id: canonicalUrl || '',
      name: name,
      brand: brand,
      price: price,
      currency: 'EUR',
      url: canonicalUrl,
      imageUrl: imageUrl,
      ean: '',
      size: '',
      availability: 'unknown'
    };
  }

  /**
   * Parse price from text like "€19.99" or "$19.99" or "19,99 €"
   * @param {string} text - Price text
   * @returns {number} Parsed price
   * @private
   */
  _parsePrice(text) {
    if (!text) return 0;
    const match = text.match(/[\d]+[.,]\d{2}/);
    if (match) {
      return parseFloat(match[0].replace(',', '.'));
    }
    return 0;
  }
}

module.exports = function createStylevanaAdapter(options) {
  return new StylevanaAdapter(options);
};
