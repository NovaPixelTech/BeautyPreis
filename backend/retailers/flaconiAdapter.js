const ScrapingAdapter = require('./scrapingAdapter');

/**
 * Flaconi Adapter (SCRAPING type)
 *
 * Integrates with Flaconi (https://www.flaconi.de) by scraping publicly
 * accessible product pages. Flaconi publishes Shoppable/Shopify-style
 * JSON-LD structured data on product pages, which is the most reliable
 * source for price and availability.
 *
 * @extends ScrapingAdapter
 */
class FlaconiAdapter extends ScrapingAdapter {
  constructor(options) {
    super(options);
    this.apiType = 'scraping';
    this.rateLimit = 30;
  }

  _buildSearchUrl(query, filters = {}) {
    const slug = String(query || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    if (!slug) return 'https://www.flaconi.de';
    return `https://www.flaconi.de/products/${slug}`;
  }

  _parseSearchResults($) {
    const products = [];

    // Shopify-like product listings expose JSON-LD product data.
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        const item =
          Array.isArray(data) && data[0] && data[0].item
            ? data[0].item
            : data.item
              ? data.item
              : data.product || data;
        const offers = Array.isArray(item && item.offers) ? item.offers[0] : item && item.offers;
        const name = (item && (item.name || item.productName)) || '';
        const price = offers ? parseFloat(offers.price) || 0 : 0;
        const url = (item && item.url) || (item && item.productUrl) || '';
        if (name && price > 0) {
          products.push({
            id: url,
            name: name,
            brand: (item && item.brand) || '',
            price: price,
            currency: (offers && offers.priceCurrency) || 'EUR',
            url: url,
            imageUrl: (item && item.image) || '',
            ean: (item && item.gtin) || (item && item.ean) || '',
            size: (item && item.size) || '',
            availability: offers ? offers.availability || 'unknown' : 'unknown',
            sourcePriceStatus: 'ESTIMATED',
          });
        }
      } catch (e) {
        // Skip invalid JSON-LD blocks
      }
    });

    if (products.length === 0) {
      const name = $('h1').first().text().trim() || $('title').text().trim();
      const priceText = $('[itemprop="price"], .price, .product-price, [class*="price"]').first().text().trim();
      const price = this._parsePrice(priceText);
      const url = $('link[rel="canonical"]').attr('href') || '';
      if (name) {
        products.push({
          id: url,
          name: name,
          brand: '',
          price: price,
          currency: 'EUR',
          url: url,
          imageUrl: '',
          ean: '',
          size: '',
          availability: 'unknown',
          sourcePriceStatus: 'ESTIMATED',
        });
      }
    }

    return products.slice(0, 20);
  }

  _buildSearchUrl(query, filters = {}) {
    const slug = String(query || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    if (!slug) return 'https://www.flaconi.de';
    return `https://www.flaconi.de/products/${slug}`;
  }

  _parseProductPage($) {
    const jsonLd = $('script[type="application/ld+json"]').first().html();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        const item = data.product || data;
        const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
        const name = item.name || '';
        if (name) {
          return {
            id: item.url || $('link[rel="canonical"]').attr('href') || '',
            name: name,
            brand: item.brand || '',
            price: offers ? parseFloat(offers.price) || 0 : 0,
            currency: offers ? offers.priceCurrency || 'EUR' : 'EUR',
            url: item.url || '',
            imageUrl: item.image || '',
            ean: item.gtin || item.ean || '',
            size: item.size || '',
            availability: offers ? offers.availability || 'unknown' : 'unknown',
          };
        }
      } catch (e) {
        // Fall through to HTML parsing
      }
    }

    const name = $('h1').first().text().trim() || $('title').text().trim();
    if (!name) return null;
    const priceText = $('[itemprop="price"], .price, .product-price, [class*="price"]').first().text().trim();
    const price = this._parsePrice(priceText);
    const url = $('link[rel="canonical"]').attr('href') || '';
    return {
      id: url,
      name: name,
      brand: '',
      price: price,
      currency: 'EUR',
      url: url,
      imageUrl: '',
      ean: '',
      size: '',
      availability: 'unknown',
    };
  }

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

module.exports = function createFlaconiAdapter(options) {
  return new FlaconiAdapter(options);
};
