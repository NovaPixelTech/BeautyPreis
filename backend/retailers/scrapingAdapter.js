const BaseRetailerAdapter = require('../baseAdapter');
const cheerio = require('cheerio');

/**
 * Base Scraping Adapter
 * Provides HTTP fetch + Cheerio HTML parsing helpers for retailers
 * that don't have official public APIs.
 * 
 * IMPORTANT: Only scrape publicly accessible pages. Respect robots.txt.
 * Do NOT bypass CAPTCHAs, login walls, or anti-bot protection.
 * All scraped data is marked as ESTIMATED/UNKNOWN verification status.
 * 
 * @extends BaseRetailerAdapter
 */
class ScrapingAdapter extends BaseRetailerAdapter {
  constructor(options) {
    super(options);
    this.apiType = options.apiType || 'scraping';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.requestTimeout = 15000;
  }

  /**
   * Fetch HTML from a URL and parse with Cheerio
   * @param {string} url - URL to fetch
   * @returns {Promise<cheerio.Root>} Cheerio root object
   * @private
   */
  async _fetchHtml(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': this.baseUrl
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }

    const html = await response.text();
    return cheerio.load(html);
  }

  /**
   * Fetch JSON from a URL
   * @param {string} url - URL to fetch
   * @returns {Promise<Object>} Parsed JSON
   * @private
   */
  async _fetchJson(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }

    return response.json();
  }

  /**
   * Search products by query - scrapes retailer search results
   * @param {string} query - Product search query
   * @param {Object} [filters] - Optional filters
   * @returns {Promise<Array>} Array of product summaries
   */
  async searchProducts(query, filters = {}) {
    try {
      const searchUrl = this._buildSearchUrl(query, filters);
      const $ = await this._fetchHtml(searchUrl);
      
      const products = this._parseSearchResults($);
      
      this._logIntegration('searchProducts', 'success', null);
      return products.map(p => this.normalizeProduct(p));
    } catch (error) {
      console.error(`${this.retailerName} searchProducts error:`, error.message);
      this._logIntegration('searchProducts', 'error', error.message);
      return [];
    }
  }

  /**
   * Retrieve product details by URL or ID
   * @param {string} productId - Product URL or identifier
   * @returns {Promise<Object|null>} Normalized product details
   */
  async getProductDetails(productId) {
    try {
      const url = productId.startsWith('http') ? productId : this.baseUrl + productId;
      const $ = await this._fetchHtml(url);
      
      const product = this._parseProductPage($);
      if (!product) return null;

      this._logIntegration('getProductDetails', 'success', null);
      return this.normalizeProduct(product);
    } catch (error) {
      console.error(`${this.retailerName} getProductDetails error:`, error.message);
      this._logIntegration('getProductDetails', 'error', error.message);
      return null;
    }
  }

  /**
   * Retrieve price information for a product
   * @param {string} productId - Product URL or identifier
   * @returns {Promise<Object>} Normalized price information
   */
  async getPrice(productId) {
    try {
      const product = await this.getProductDetails(productId);
      
      if (product && product.price !== undefined) {
        return this.normalizePrice({
          price: product.price,
          currency: product.currency || 'EUR',
          priceStatus: 'ESTIMATED',
          sourceVerification: `${this.retailerId}-scraping`
        });
      }

      return {
        price: 0,
        currency: 'EUR',
        priceStatus: 'UNKNOWN',
        sourceVerification: `${this.retailerId}-scraping-error`
      };
    } catch (error) {
      console.error(`${this.retailerName} getPrice error:`, error.message);
      this._logIntegration('getPrice', 'error', error.message);
      return {
        price: 0,
        currency: 'EUR',
        priceStatus: 'UNKNOWN',
        sourceVerification: `${this.retailerId}-scraping-error`
      };
    }
  }

  /**
   * Retrieve shipping information for a product
   * @param {string} productId - Product URL or identifier
   * @returns {Promise<Object>} Normalized shipping information
   */
  async getShipping(productId) {
    try {
      // Scraped shipping info is typically estimated
      return this.normalizeShipping({
        shippingMethod: 'Standard',
        price: 0,
        currency: 'EUR',
        estimatedDelivery: '3-7 days',
        stockAvailable: true,
        source: `${this.retailerId}-scraping`,
        verificationStatus: 'estimated'
      });
    } catch (error) {
      console.error(`${this.retailerName} getShipping error:`, error.message);
      return {
        shippingMethod: 'Standard',
        price: 0,
        currency: 'EUR',
        estimatedDelivery: 'unknown',
        stockAvailable: true,
        source: `${this.retailerId}-scraping-error`,
        verificationStatus: 'unknown'
      };
    }
  }

  /**
   * Check retailer health/status
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const $ = await this._fetchHtml(this.baseUrl);
      return $('body').length > 0;
    } catch (error) {
      console.error(`${this.retailerName} healthCheck error:`, error.message);
      return false;
    }
  }

  /**
   * Build search URL - to be overridden by subclasses
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {string} Search URL
   * @private
   */
  _buildSearchUrl(query, filters) {
    throw new Error('Method not implemented: _buildSearchUrl');
  }

  /**
   * Parse search results HTML - to be overridden by subclasses
   * @param {cheerio.Root} $ - Cheerio root
   * @returns {Array} Raw product data
   * @private
   */
  _parseSearchResults($) {
    throw new Error('Method not implemented: _parseSearchResults');
  }

  /**
   * Parse product page HTML - to be overridden by subclasses
   * @param {cheerio.Root} $ - Cheerio root
   * @returns {Object|null} Raw product data
   * @private
   */
  _parseProductPage($) {
    throw new Error('Method not implemented: _parseProductPage');
  }

  /**
   * Normalize scraped product data - all scraped data is ESTIMATED
   * @param {Object} rawProduct - Raw scraped product data
   * @returns {Object} Normalized product data
   */
  normalizeProduct(rawProduct) {
    return {
      id: rawProduct.id || require('crypto').randomUUID(),
      name: rawProduct.name || '',
      brand: rawProduct.brand || '',
      size: rawProduct.size || '',
      ean: rawProduct.ean || '',
      price: typeof rawProduct.price === 'number' ? rawProduct.price : 0,
      currency: rawProduct.currency || 'EUR',
      url: rawProduct.url || '',
      imageUrl: rawProduct.imageUrl || '',
      availability: rawProduct.availability || 'unknown',
      matchConfidence: 'LOW', // Will be updated by product matcher
      priceStatus: 'ESTIMATED',
      sourceVerification: `${this.retailerId}-scraping`
    };
  }

  /**
   * Normalize scraped price data
   * @param {Object} rawPrice - Raw price data
   * @returns {Object} Normalized price data
   */
  normalizePrice(rawPrice) {
    return {
      price: typeof rawPrice.price === 'number' ? rawPrice.price : 0,
      currency: rawPrice.currency || 'EUR',
      priceStatus: rawPrice.priceStatus || 'ESTIMATED',
      sourceVerification: rawPrice.sourceVerification || `${this.retailerId}-scraping`
    };
  }

  /**
   * Normalize scraped shipping data
   * @param {Object} rawShipping - Raw shipping data
   * @returns {Object} Normalized shipping data
   */
  normalizeShipping(rawShipping) {
    return {
      shippingMethod: rawShipping.shippingMethod || 'Standard',
      price: typeof rawShipping.price === 'number' ? rawShipping.price : 0,
      currency: rawShipping.currency || 'EUR',
      estimatedDelivery: rawShipping.estimatedDelivery || 'unknown',
      stockAvailable: rawShipping.stockAvailable !== undefined ? rawShipping.stockAvailable : true,
      source: rawShipping.source || `${this.retailerId}-scraping`,
      verificationStatus: rawShipping.verificationStatus || 'estimated'
    };
  }

  /**
   * Log integration operation
   * @param {string} operation - Operation name
   * @param {string} status - Operation status
   * @param {string} errorMessage - Error message (if any)
   * @private
   */
  _logIntegration(operation, status, errorMessage) {
    const logEntry = {
      retailerId: this.retailerId,
      operation: operation,
      status: status,
      errorMessage: errorMessage,
      executedAt: new Date().toISOString()
    };
    console.log(`[${this.retailerName} Scraping]`, JSON.stringify(logEntry));
  }
}

module.exports = ScrapingAdapter;
