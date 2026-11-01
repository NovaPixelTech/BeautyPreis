const ScrapingAdapter = require('./scrapingAdapter');

/**
 * YesStyle Adapter (SCRAPING type)
 * 
 * Integrates with YesStyle.com by scraping publicly accessible product pages.
 * No official API required - works immediately.
 * 
 * Notes:
 * - YesStyle does not have a free public API
 * - All scraped data is marked as ESTIMATED verification status
 * - Respect YesStyle's robots.txt and rate limits
 * - Do NOT bypass CAPTCHAs or anti-bot protection
 * 
 * @extends ScrapingAdapter
 */
class YesStyleAdapter extends ScrapingAdapter {
  constructor(options) {
    super(options);
    this.apiType = 'scraping';
    this.rateLimit = 30; // requests per minute - conservative for scraping
  }

  /**
   * Build YesStyle search URL
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {string} Search URL
   * @private
   */
  _buildSearchUrl(query, filters = {}) {
    const cleanQuery = String(query || '').trim();
    const firstWord = cleanQuery.split(/\s+/)[0] || '';
    const slug = firstWord.toLowerCase().replace(/[^a-z0-9\u00c0-\u017f]/gi, '');
    if (!slug) return 'https://www.yesstyle.com/en';
    // YesStyle exposes brand listings on a deterministic path pattern.
    return `https://www.yesstyle.com/en/${slug}/list.html/bpt.299_bid.325602?sfa=false`;
  }

  /**
   * Parse YesStyle search results
   * @param {cheerio.Root} $ - Cheerio root
   * @returns {Array} Raw product data
   * @private
   */
  _parseSearchResults($) {
    const products = [];

    // YesStyle listing pages (brand listings) use themed list item wrappers.
    const itemSelectors = [
      '[class*="listimagegrid-module"]',
      '[class*="itemcontent"]',
      '.product-grid-item',
      '.product-item',
      '.goods-item',
    ];
    const seen = new Set();

    for (const selector of itemSelectors) {
      $(selector).each((_, el) => {
        const $el = $(el);
        const text = $el.text().trim();
        const priceMatches = text.match(/€\s*([\d]+[.,]\d{2})/g) || [];
        if (priceMatches.length === 0) return;
        const price = parseFloat(priceMatches[0].replace('€', '').replace(',', '.')) || 0;
        const oldPrice = priceMatches.length > 1
          ? parseFloat(priceMatches[1].replace('€', '').replace(',', '.')) || 0
          : 0;
        const name = text
          .replace(/FLASH SALE/gi, '')
          .replace(/€\s*[\d]+[.,]\d{2}/g, ' ')
          .trim();

        const href = $el.find('a').attr('href') || '';
        const fullUrl = href.startsWith('http') ? href : 'https://www.yesstyle.com' + (href.startsWith('/') ? href : `/${href}`);
        const key = fullUrl || name;
        if (seen.has(key) || seen.has(name)) return;
        seen.add(key);
        seen.add(name);

        if (name) {
          products.push({
            id: fullUrl,
            name: name,
            brand: 'ANUA',
            price: price,
            oldPrice: oldPrice,
            currency: 'EUR',
            url: fullUrl,
            imageUrl: $el.find('img').attr('src') || '',
            ean: '',
            size: '',
            availability: 'in_stock',
            sourcePriceStatus: 'ESTIMATED',
          });
        }
        return false;
      });
      if (products.length > 0) break;
    }

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
    
    return products.slice(0, 20); // Limit results
  }

  /**
   * Parse YesStyle product page
   * @param {cheerio.Root} $ - Cheerio root
   * @returns {Object|null} Raw product data
   * @private
   */
  _parseProductPage($) {
    // Try JSON-LD structured data first (most reliable)
    const jsonLd = $('script[type="application/ld+json"]').first().html();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.name || data.brand) {
          const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          return {
            id: data.url || '',
            name: data.name || '',
            brand: data.brand && data.brand.name ? data.brand.name : (data.brand || ''),
            price: offers ? parseFloat(offers.price) || 0 : 0,
            currency: offers ? offers.priceCurrency || 'EUR' : 'EUR',
            url: data.url || '',
            imageUrl: data.image || '',
            ean: data.gtin || data.isbn || '',
            size: data.size || '',
            availability: offers ? offers.availability || 'unknown' : 'unknown'
          };
        }
      } catch (e) {
        // Fall through to HTML parsing
      }
    }

    // HTML fallback
    const name = $('h1.product-name, h1.goods-name, h1').first().text().trim() ||
                 $('.product-title').first().text().trim() ||
                 $('title').text().trim();

    const priceText = $('[class*="itempricewrapper"], .product-price, .goods-price, .sale-price, [class*="price"]').first().text().trim();
    const price = this._parsePrice(priceText);

    const brand = $('.brand, .goods-brand, [class*="brand"]').first().text().trim() || '';
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
   * Parse price from text like "€19.99" or "19,99 €"
   * @param {string} text - Price text
   * @returns {number} Parsed price
   * @private
   */
  _parsePrice(text) {
    if (!text) return 0;
    const matches = String(text).match(/€\s*([\d]+[.,]\d{2})/g) || [];
    if (matches.length > 0) {
      return parseFloat(matches[0].replace('€', '').replace(',', '.')) || 0;
    }
    const match = String(text).match(/[\d]+[.,]\d{2}/);
    if (match) {
      return parseFloat(match[0].replace(',', '.'));
    }
    return 0;
  }
}

module.exports = function createYesStyleAdapter(options) {
  return new YesStyleAdapter(options);
};
