/**
 * Retailer Adapter Architecture for BeautyPreis
 * 
 * This module defines the standardized interface that each retailer integration must follow.
 * Implementations should be independent and follow the common data contract.
 * 
 * @module retailerAdapter
 */

/**
 * Retailer API Types
 * @enum {string}
 */
exports.APIType = {
  OFFICIAL_API: 'official_api',
  AFFILIATE_FEED: 'affiliate_feed',
  THIRD_PARTY: 'third_party',
  SCRAPING: 'scraping'
};

/**
 * Retailer Status
 * @enum {string}
 */
exports.RetailerStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  ERROR: 'ERROR'
};

/**
 * Price Status
 * @enum {string}
 */
exports.PriceStatus = {
  VERIFIED: 'VERIFIED',
  ESTIMATED: 'ESTIMATED',
  UNKNOWN: 'UNKNOWN',
  OUTDATED: 'OUTDATED'
};

/**
 * Match Confidence
 * @enum {string}
 */
exports.MatchConfidence = {
  EXACT: 'EXACT',
  HIGH: 'HIGH',
  POSSIBLE: 'POSSIBLE',
  LOW: 'LOW',
  DIFFERENT: 'DIFFERENT'
};

/**
 * Base Retailer Adapter Class
 * Each retailer must implement this interface.
 */
class BaseRetailerAdapter {
  /**
   * Constructor
   * @param {Object} options - Adapter options
   * @param {string} options.retailerId - Retailer database ID
   * @param {string} options.retailerName - Retailer name
   * @param {string} options.baseUrl - Base URL for the retailer
   * @param {string} options.apiType - Type of API access
   * @param {Object} options.credentials - API credentials (optional, for official APIs)
   */
  constructor(options) {
    this.retailerId = options.retailerId;
    this.retailerName = options.retailerName;
    this.baseUrl = options.baseUrl;
    this.apiType = options.apiType || exports.APIType.THIRD_PARTY;
    this.credentials = options.credentials || {};
    this.rateLimit = options.rateLimit || 60; // requests per minute
    this.lastChecked = null;
    this.status = exports.RetailerStatus.ACTIVE;
  }

  /**
   * Search products by query
   * @param {string} query - Product search query
   * @param {Object} [filters] - Optional filters (brand, category, etc.)
   * @returns {Promise<Array>} - Array of product summaries
   */
  async searchProducts(query, filters = {}) {
    throw new Error('Method not implemented: searchProducts');
  }

  /**
   * Retrieve product details by product ID or URL
   * @param {string} productId - Product identifier
   * @returns {Promise<Object>} - Product details
   */
  async getProductDetails(productId) {
    throw new Error('Method not implemented: getProductDetails');
  }

  /**
   * Retrieve price information for a product
   * @param {string} productId - Product identifier
   * @returns {Promise<Object>} - Price information
   */
  async getPrice(productId) {
    throw new Error('Method not implemented: getPrice');
  }

  /**
   * Retrieve shipping information for a product
   * @param {string} productId - Product identifier
   * @returns {Promise<Object>} - Shipping information
   */
  async getShipping(productId) {
    throw new Error('Method not implemented: getShipping');
  }

  /**
   * Check if the retailer is healthy and responding
   * @returns {Promise<boolean>} - True if healthy
   */
  async healthCheck() {
    throw new Error('Method not implemented: healthCheck');
  }

  /**
   * Normalize product data into internal format
   * @param {Object} rawProduct - Raw product data from retailer
   * @returns {Object} - Normalized product data
   */
  normalizeProduct(rawProduct) {
    throw new Error('Method not implemented: normalizeProduct');
  }

  /**
   * Normalize price data into internal format
   * @param {Object} rawPrice - Raw price data from retailer
   * @returns {Object} - Normalized price data
   */
  normalizePrice(rawPrice) {
    throw new Error('Method not implemented: normalizePrice');
  }

  /**
   * Normalize shipping data into internal format
   * @param {Object} rawShipping - Raw shipping data from retailer
   * @returns {Object} - Normalized shipping data
   */
  normalizeShipping(rawShipping) {
    throw new Error('Method not implemented: normalizeShipping');
  }

  /**
   * Validate that a product match has sufficient confidence
   * @param {Object} match - Match object from product matcher
   * @param {number} minConfidence - Minimum confidence score (0-100)
   * @returns {boolean} - True if match is valid
   */
  isValidMatch(match, minConfidence = 40) {
    return match && match.matchScore >= minConfidence;
  }
}

/**
 * Export the Base class
 */
module.exports = BaseRetailerAdapter;

/**
 * Retailer Configuration
 * Define the configuration for each integrated retailer
 * @returns {Array} - Array of retailer configurations
 */
exports.getRetailerConfigurations = function() {
  return [
    {
      id: 'yesstyle',
      name: 'YesStyle',
      slug: 'yesstyle',
      baseUrl: 'https://www.yesstyle.com',
      apiType: exports.APIType.SCRAPING,
      country: 'Germany',
      rateLimit: 30
    },
    {
      id: 'stylevana',
      name: 'Stylevana',
      slug: 'stylevana',
      baseUrl: 'https://www.stylevana.com',
      apiType: exports.APIType.SCRAPING,
      country: 'Germany',
      rateLimit: 30
    },
    {
      id: 'douglas',
      name: 'Douglas Germany',
      slug: 'douglas-de',
      baseUrl: 'https://www.douglas.de',
      apiType: exports.APIType.OFFICIAL_API,
      country: 'Germany',
      // TODO: Add official API credentials here when available
      // credentials: { clientId: '...', clientSecret: '...' }
    },
    {
      id: 'flaconi',
      name: 'Flaconi',
      slug: 'flaconi',
      baseUrl: 'https://www.flaconi.de',
      apiType: exports.APIType.OFFICIAL_API,
      country: 'Germany',
      // TODO: Add official API credentials here when available
    },
    {
      id: 'notino',
      name: 'Notino Germany',
      slug: 'notino-de',
      baseUrl: 'https://www.notino.de',
      apiType: exports.APIType.OFFICIAL_API,
      country: 'Germany',
      // TODO: Add official API credentials here when available
    },
    {
      id: 'sephora',
      name: 'Sephora Germany',
      slug: 'sephora-de',
      baseUrl: 'https://www.sephora.de',
      apiType: exports.APIType.OFFICIAL_API,
      country: 'Germany',
      // TODO: Add official API credentials here when available
    },
    {
      id: 'lookfantastic',
      name: 'Lookfantastic Germany',
      slug: 'lookfantastic-de',
      baseUrl: 'https://www.lookfantastic.de',
      apiType: exports.APIType.OFFICIAL_API,
      country: 'Germany',
      // TODO: Add official API credentials here when available
    },
    {
      id: 'shop_apotheke',
      name: 'Shop Apotheke',
      slug: 'shop-apotheke',
      baseUrl: 'https://www.shop-apotheke.de',
      apiType: exports.APIType.OFFICIAL_API,
      country: 'Germany',
      // TODO: Add official API credentials here when available
    },
    {
      id: 'dm',
      name: 'dm.de',
      slug: 'dm-de',
      baseUrl: 'https://www.dm.de',
      apiType: exports.APIType.THIRD_PARTY,
      country: 'Germany',
      // TODO: Investigate authorized data feed access
    },
    {
      id: 'rossmann',
      name: 'Rossmann.de',
      slug: 'rossmann-de',
      baseUrl: 'https://www.rossmann.de',
      apiType: exports.APIType.THIRD_PARTY,
      country: 'Germany',
      // TODO: Investigate authorized data feed access
    }
  ];
};

/**
 * Validate that required retailer configuration fields are present
 * @param {Object} config - Retailer configuration to validate
 * @returns {Object} - Validation result { valid: boolean, errors: string[] }
 */
exports.validateConfiguration = function(config) {
  const errors = [];
  
  if (!config.id) errors.push('Missing retailer ID');
  if (!config.name) errors.push('Missing retailer name');
  if (!config.baseUrl) errors.push('Missing base URL');
  if (!config.apiType) errors.push('Missing API type');
  if (!config.country) errors.push('Missing target country');
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Create a retailer adapter instance from configuration
 * @param {Object} config - Retailer configuration
 * @param {Object} [db] - Database instance (optional)
 * @returns {BaseRetailerAdapter} - Adapter instance
 */
exports.createAdapter = function(config, db) {
  const validation = exports.validateConfiguration(config);
  
  if (!validation.valid) {
    throw new Error('Invalid retailer configuration: ' + validation.errors.join(', '));
  }
  
  // Import the specific adapter based on apiType
  // This allows per-retailer adapter files to be loaded dynamically
  const adapterMap = {
    [exports.APIType.OFFICIAL_API]: require('./retailers/officialApiAdapter'),
    [exports.APIType.AFFILIATE_FEED]: require('./retailers/affiliateFeedAdapter'),
    [exports.APIType.THIRD_PARTY]: require('./retailers/thirdPartyAdapter'),
    [exports.APIType.SCRAPING]: require('./retailers/scrapingAdapter')
  };
  
  // Retailer-specific adapter overrides (factory functions)
  const retailerAdapterOverrides = {
    yesstyle: require('./retailers/yesStyleAdapter'),
    stylevana: require('./retailers/stylevanaAdapter')
  };
  
  const AdapterClass = adapterMap[config.apiType] || BaseRetailerAdapter;
  
  // Check for retailer-specific adapter override
  const retailerOverride = retailerAdapterOverrides[config.id];
  if (retailerOverride) {
    return retailerOverride({
      retailerId: config.id,
      retailerName: config.name,
      baseUrl: config.baseUrl,
      apiType: config.apiType,
      credentials: config.credentials,
      rateLimit: config.rateLimit,
      db: db ? db.getRepository && db.getRepository('RetailerProducts') : null
    });
  }
  
  return new AdapterClass({
    retailerId: config.id,
    retailerName: config.name,
    baseUrl: config.baseUrl,
    apiType: config.apiType,
    credentials: config.credentials,
    rateLimit: config.rateLimit,
    // Pass database instance for storing/retrieving product data
    db: db ? db.getRepository && db.getRepository('RetailerProducts') : null
  });
};

// ---------------------------------------------------------------------------
// Adapter Descriptions
// ---------------------------------------------------------------------------

/**
 * Official API Adapter
 * Uses retailer's official product API (REST/GraphQL) with proper authentication.
 * Most reliable method, respects rate limits and terms of service.
 * 
 * Required credentials: Varies by retailer (typically OAuth 2.0 client_id/secret)
 * Rate limits: Varies by retailer (typically 10-100 requests/minute)
 * Data quality: High - official source, structured data
 * 
 * Example retailers: Douglas, Flaconi, Notino, Sephora, Lookfantastic, Shop Apotheke
 */
exports.adapterDescriptions = {
  [exports.APIType.OFFICIAL_API]: {
    description: 'Official retailer product API',
    reliability: 'High',
    dataQuality: 'Structured, verified',
    rateLimitNote: 'Check retailer API docs for specific limits',
    implementationNote: 'Use OAuth 2.0 for authentication when available'
  },
  [exports.APIType.AFFILIATE_FEED]: {
    description: 'Official affiliate product feed (CSV/JSON)',
    reliability: 'Medium-High',
    dataQuality: 'Structured, includes affiliate tracking',
    rateLimitNote: 'Typically higher limits for approved affiliates',
    implementationNote: 'Must comply with affiliate program terms'
  },
  [exports.APIType.THIRD_PARTY]: {
    description: 'Authorized third-party data provider',
    reliability: 'Medium',
    dataQuality: 'Semi-structured, may require normalization',
    rateLimitNote: 'Varies by provider agreement',
    implementationNote: 'Ensure data licensing agreements are in place'
  },
  [exports.APIType.SCRAPING]: {
    description: 'Web scraping (respect robots.txt and TOS)',
    reliability: 'Low-Medium',
    dataQuality: 'Unstructured, requires heavy normalization',
    rateLimitNote: 'Must respect retailer\'s robots.txt and rate limits',
    implementationNote: 'Do NOT bypass CAPTCHAs or anti-bot protection'
  }
};

// ---------------------------------------------------------------------------
// Integration Notes
// ---------------------------------------------------------------------------

/**
 * Integration Checklist for Each Retailer
 * 
 * Before implementing a new retailer adapter, verify:
 * 
 * ✅ 1. Terms of Service analysis - Ensure permitted integration method
 * ✅ 2. robots.txt review - Check for disallowed paths
 * ✅ 3. Rate limit identification - Determine acceptable request frequency
 * ✅ 4. Data elements available - Product name, price, EAN, images, availability
 * ✅ 5. Currency handling - EUR as default, store original currency
 * ✅ 6. Shipping cost retrieval method - API, estimated, or checkout-based
 * ✅ 7. Import duty/charge policy - Document if/unknown/ included
 * ✅ 8. Authentication method - API key, OAuth, none
 * ✅ 9. Error handling strategy - Graceful degradation on failures
 * ✅ 10. Duplicate detection - Prevent same product multiple times
 * ✅ 11. Price verification - Distinguish verified vs estimated vs unknown
 * ✅ 12. Confidence scoring integration - Use product matcher confidence levels
 * ✅ 13. Data normalization - Convert to internal format consistently
 * ✅ 14. Failure modes - What happens on API errors, timeouts, etc.
 * ✅ 15. Monitoring - Log operations, track success/failure rates
 */
exports.integrationChecklist = exports.integrationChecklist || [];

/**
 * Example: Douglas Official API Adapter Structure
 * (Placeholder - to be implemented when API access is obtained)
 */
exports.exampleDouglasAdapter = class extends BaseRetailerAdapter {
  /**
   * @override
   */
  async searchProducts(query, filters = {}) {
    // TODO: Implement Douglas API search
    // - Construct API request with query and filters
    // - Handle authentication with credentials
    // - Parse response into standardized format
    // - Return array of product summaries
    return [];
  }
  
  /**
   * @override
   */
  async getProductDetails(productId) {
    // TODO: Implement Douglas API product details
    return {};
  }
  
  /**
   * @override
   */
  async getPrice(productId) {
    // TODO: Implement Douglas API price retrieval
    return { price: 0, currency: 'EUR', priceStatus: exports.PriceStatus.UNKNOWN };
  }
  
  /**
   * @override
   */
  async getShipping(productId) {
    // TODO: Implement Douglas shipping info
    return { shippingMethod: 'Standard', price: 0, estimatedDelivery: '3-5 days', stockAvailable: true, verificationStatus: 'unknown' };
  }
  
  /**
   * @override
   */
  async healthCheck() {
    // TODO: Implement health check
    return true;
  }
  
  /**
   * @override
   */
  normalizeProduct(rawProduct) {
    // TODO: Normalize Douglas product data
    return {
      id: rawProduct.id || crypto.randomUUID(),
      name: rawProduct.name || '',
      brand: rawProduct.brand || '',
      size: rawProduct.size || '',
      ean: rawProduct.ean || '',
      price: rawProduct.price || 0,
      currency: rawProduct.currency || 'EUR',
      url: rawProduct.url || '',
      imageUrl: rawProduct.imageUrl || '',
      availability: rawProduct.availability || 'unknown'
    };
  }
  
  /**
   * @override
   */
  normalizePrice(rawPrice) {
    // TODO: Normalize Douglas price data
    return {
      price: rawPrice.price || 0,
      currency: rawPrice.currency || 'EUR',
      priceStatus: rawPrice.verified ? exports.PriceStatus.VERIFIED : exports.PriceStatus.ESTIMATED,
      sourceVerification: rawPrice.source || 'api'
    };
  }
  
  /**
   * @override
   */
  normalizeShipping(rawShipping) {
    // TODO: Normalize Douglas shipping data
    return {
      shippingMethod: rawShipping.method || 'Standard',
      price: rawShipping.price || 0,
      currency: rawShipping.currency || 'EUR',
      estimatedDelivery: rawShipping.estimatedDelivery || '3-5 days',
      stockAvailable: rawShipping.stockAvailable !== undefined ? rawShipping.stockAvailable : true,
      source: rawShipping.source || 'api',
      verificationStatus: rawShipping.verified ? 'verified' : 'estimated'
    };
  }
};

// ---------------------------------------------------------------------------
// Retailer Integration Status
// ---------------------------------------------------------------------------

/**
 * Current integration status for all target retailers
 * @returns {Object} - Status map
 */
exports.getIntegrationStatus = function() {
  return {
    yesstyle: {
      type: 'THIRD_PARTY',
      status: 'Framework ready - awaiting API access or data feed',
      confidence: 'Can integrate via existing third-party framework'
    },
    stylevana: {
      type: 'THIRD_PARTY',
      status: 'Framework ready - awaiting API access or data feed',
      confidence: 'Can integrate via existing third-party framework'
    },
    douglas: {
      type: 'OFFICIAL_API',
      status: 'Framework ready - official API structure implemented',
      confidence: 'High - once API credentials obtained',
      notes: 'Official API typically provides best data quality and rates'
    },
    flaconi: {
      type: 'OFFICIAL_API',
      status: 'Framework ready - official API structure implemented',
      confidence: 'High - once API credentials obtained',
      notes: 'Same as Douglas - official source preferred'
    },
    notino: {
      type: 'OFFICIAL_API',
      status: 'Framework ready - official API structure implemented',
      confidence: 'High - once API credentials obtained',
      notes: 'Same as Douglas/Flaconi'
    },
    sephora: {
      type: 'OFFICIAL_API',
      status: 'Framework ready - official API structure implemented',
      confidence: 'High - once API credentials obtained',
      notes: 'Same as Douglas/Flaconi/Notino'
    },
    lookfantastic: {
      type: 'OFFICIAL_API',
      status: 'Framework ready - official API structure implemented',
      confidence: 'High - once API credentials obtained',
      notes: 'Same as other German retailers'
    },
    shop_apotheke: {
      type: 'OFFICIAL_API',
      status: 'Framework ready - official API structure implemented',
      confidence: 'High - once API credentials obtained',
      notes: 'Same as other German pharmacies/retailers'
    },
    dm: {
      type: 'THIRD_PARTY',
      status: 'Framework ready - third-party framework available',
      confidence: 'Medium - need to investigate authorized data feeds',
      notes: ' dm.de may have affiliate program or data partner'
    },
    rossmann: {
      type: 'THIRD_PARTY',
      status: 'Framework ready - third-party framework available',
      confidence: 'Medium - need to investigate authorized data feeds',
      notes: 'Same as dm.de - investigate data partnership options'
    }
  };
};

// ---------------------------------------------------------------------------
// End of Module
// ---------------------------------------------------------------------------