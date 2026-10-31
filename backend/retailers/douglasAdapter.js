const BaseRetailerAdapter = require('../baseAdapter');

/**
 * Douglas Germany Official API Adapter
 * 
 * Integrates with Douglas.de's official product API for beauty & skincare products.
 * 
 * Notes for implementation:
 * - Obtain OAuth 2.0 credentials from Douglas partner program
 * - API base URL: https://api.douglas.de/v1 (example - verify actual endpoint)
 * - Rate limits: Typically 10-50 requests/minute for official APIs
 * - Data format: JSON with product details, prices, availability
 * 
 * @extends BaseRetailerAdapter
 */
class DouglasAdapter extends BaseRetailerAdapter {
  /**
   * @param {Object} options - Adapter options
   * @param {string} options.credentials.client_id - OAuth client ID
   * @param {string} options.credentials.client_secret - OAuth client secret
   */
  constructor(options) {
    super(options);
    
    // Douglas API configuration
    this.apiBaseUrl = 'https://api.douglas.de/v1/products';
    this.scope = 'products:read';
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // If credentials provided, attempt initial token fetch
    if (options.credentials && options.credentials.client_id && options.credentials.client_secret) {
      this._initializeAuth().catch(err => {
        console.warn('Douglas auth initialization failed (may be in development mode):', err.message);
      });
    }
  }

  /**
   * Initialize OAuth 2.0 token for Douglas API
   * @private
   * @returns {Promise<void>}
   */
  async _initializeAuth() {
    try {
      const authUrl = 'https://www.douglas.de/oauth/token';
      const payload = {
        client_id: this.credentials.client_id,
        client_secret: this.credentials.client_secret,
        grant_type: 'client_credentials'
      };

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Douglas auth failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      console.log('Douglas API authentication successful');
    } catch (error) {
      console.error('Douglas API authentication error:', error.message);
      // Continue without auth token - may work for public endpoints
      this.accessToken = null;
    }
  }

  /**
   * Get valid access token, refreshing if necessary
   * @returns {Promise<string>}
   * @private
   */
  async _getValidToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }
    await this._initializeAuth();
    return this.accessToken;
  }

  /**
   * Make authenticated API request to Douglas
   * @param {string} endpoint - API endpoint path
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Parsed JSON response
   * @private
   */
  async _apiRequest(endpoint, params = {}) {
    const token = await this._getValidToken();
    
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.apiBaseUrl}${endpoint}?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token may have expired, re-authenticate
      await this._initializeAuth();
      return this._apiRequest(endpoint, params);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Douglas API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search products by query with optional filters
   * @param {string} query - Product search query
   * @param {Object} [filters] - Optional filters (brand, category, price range, etc.)
   * @returns {Promise<Array>} Array of product summaries
   */
  async searchProducts(query, filters = {}) {
    try {
      // Build search parameters
      const params = {
        query: query || '',
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
      };

      // Add optional filters
      if (filters.brand) params.brand = filters.brand;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const data = await this._apiRequest('/search', params);

      // Normalize Douglas API response to internal format
      if (data && data.products && Array.isArray(data.products)) {
        return data.products.map(product => this.normalizeProduct(product));
      }

      return [];
    } catch (error) {
      console.error('Douglas searchProducts error:', error.message);
      this._logIntegration('searchProducts', 'error', error.message);
      return [];
    }
  }

  /**
   * Retrieve product details by product ID
   * @param {string} productId - Douglas product ID
   * @returns {Promise<Object>} Normalized product details
   */
  async getProductDetails(productId) {
    try {
      const data = await this._apiRequest('/' + productId);
      
      if (data && data.id) {
        return this.normalizeProduct(data);
      }

      return null;
    } catch (error) {
      console.error('Douglas getProductDetails error:', error.message);
      this._logIntegration('getProductDetails', 'error', error.message);
      return null;
    }
  }

  /**
   * Retrieve price information for a product
   * @param {string} productId - Douglas product ID
   * @returns {Promise<Object>} Normalized price information
   */
  async getPrice(productId) {
    try {
      // Try to get price from product details first
      const product = await this.getProductDetails(productId);
      
      if (product && product.price !== undefined) {
        return this.normalizePrice({
          price: product.price,
          currency: product.currency || 'EUR',
          priceStatus: product.priceStatus || 'ESTIMATED',
          sourceVerification: 'douglas-api'
        });
      }

      // Fallback: direct price endpoint
      try {
        const data = await this._apiRequest('/' + productId + '/price');
        
        return this.normalizePrice({
          price: data.price,
          currency: data.currency || 'EUR',
          priceStatus: data.priceStatus || 'ESTIMATED',
          sourceVerification: 'douglas-api-price-endpoint'
        });
      } catch (priceError) {
        console.error('Douglas price endpoint error:', priceError.message);
        // Return estimated price status
        return {
          price: 0,
          currency: 'EUR',
          priceStatus: 'UNKNOWN',
          sourceVerification: 'douglas-api-price-endpoint-error'
        };
      }
    } catch (error) {
      console.error('Douglas getPrice error:', error.message);
      this._logIntegration('getPrice', 'error', error.message);
      return {
        price: 0,
        currency: 'EUR',
        priceStatus: 'UNKNOWN',
        sourceVerification: 'douglas-api-error'
      };
    }
  }

  /**
   * Retrieve shipping information for a product
   * @param {string} productId - Douglas product ID
   * @returns {Promise<Object>} Normalized shipping information
   */
  async getShipping(productId) {
    try {
      // Try product details first (may include shipping info)
      const product = await this.getProductDetails(productId);
      
      if (product && product.shipping) {
        return this.normalizeShipping({
          shippingMethod: product.shipping.method || 'Standard',
          price: product.shipping.price || 0,
          estimatedDelivery: product.shipping.estimatedDelivery || '3-5 days',
          stockAvailable: product.availability !== 'OUT_OF_STOCK',
          source: 'douglas-api',
          verificationStatus: product.availability === 'IN_STOCK' ? 'verified' : 'estimated'
        });
      }

      // Fallback: shipping endpoint
      try {
        const data = await this._apiRequest('/' + productId + '/shipping');
        
        return this.normalizeShipping({
          shippingMethod: data.shippingMethod || 'Standard',
          price: data.price || 0,
          estimatedDelivery: data.estimatedDelivery || '3-5 days',
          stockAvailable: data.stockAvailable !== undefined ? data.stockAvailable : true,
          source: 'douglas-api-shipping-endpoint',
          verificationStatus: data.stockAvailable ? 'verified' : 'estimated'
        });
      } catch (shippingError) {
        console.error('Douglas shipping endpoint error:', shippingError.message);
        // Return default shipping info
        return {
          shippingMethod: 'Standard',
          price: 0,
          estimatedDelivery: '3-5 days',
          stockAvailable: true,
          source: 'douglas-api-shipping-error-fallback',
          verificationStatus: 'estimated'
        };
      }
    } catch (error) {
      console.error('Douglas getShipping error:', error.message);
      this._logIntegration('getShipping', 'error', error.message);
      return {
        shippingMethod: 'Standard',
        price: 0,
        estimatedDelivery: '3-5 days',
        stockAvailable: true,
        source: 'douglas-api-shipping-error',
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
      const data = await this._apiRequest('/health', { simple: true });
      return data && data.status === 'OK';
    } catch (error) {
      console.error('Douglas healthCheck error:', error.message);
      return false;
    }
  }

  /**
   * Normalize Douglas product data to internal format
   * @param {Object} rawProduct - Raw product data from Douglas API
   * @returns {Object} Normalized product data
   */
  normalizeProduct(rawProduct) {
    // Extract EAN/GTIN if available
    const ean = rawProduct.ean || rawProduct.gtin || rawProduct.barcode || '';
    
    // Parse size from product name or dedicated field
    const sizeMatch = rawProduct.name.match(/(\d+(?:\.\d+)?)\s*ml/i);
    const size = sizeMatch ? sizeMatch[1] + 'ml' : rawProduct.size || '';
    
    return {
      id: rawProduct.id || crypto.randomUUID(),
      name: rawProduct.name || '',
      brand: rawProduct.brand || '',
      size: size,
      ean: ean,
      price: typeof rawProduct.price === 'number' ? rawProduct.price : 0,
      currency: rawProduct.currency || 'EUR',
      url: rawProduct.productUrl || rawProduct.url || 'https://www.douglas.de/p/' + rawProduct.id,
      imageUrl: rawProduct.imageUrl || rawProduct.images && rawProduct.images[0] || '',
      availability: this._mapAvailability(rawProduct.availability || rawProduct.stockStatus || ''),
      matchConfidence: 'LOW' // Will be updated by product matcher
    };
  }

  /**
   * Normalize Douglas price data to internal format
   * @param {Object} rawPrice - Raw price data from Douglas API
   * @returns {Object} Normalized price data
   */
  normalizePrice(rawPrice) {
    return {
      price: typeof rawPrice.price === 'number' ? rawPrice.price : 0,
      currency: rawPrice.currency || 'EUR',
      priceStatus: rawPrice.priceStatus || 'ESTIMATED',
      sourceVerification: rawPrice.sourceVerification || 'douglas-api'
    };
  }

  /**
   * Normalize Douglas shipping data to internal format
   * @param {Object} rawShipping - Raw shipping data from Douglas API
   * @returns {Object} Normalized shipping data
   */
  normalizeShipping(rawShipping) {
    return {
      shippingMethod: rawShipping.shippingMethod || 'Standard',
      price: typeof rawShipping.price === 'number' ? rawShipping.price : 0,
      currency: rawShipping.currency || 'EUR',
      estimatedDelivery: rawShipping.estimatedDelivery || '3-5 days',
      stockAvailable: rawShipping.stockAvailable !== undefined ? rawShipping.stockAvailable : true,
      source: rawShipping.source || 'douglas-api',
      verificationStatus: rawShipping.verificationStatus || 'estimated'
    };
  }

  /**
   * Map Douglas availability strings to internal format
   * @param {string} availability - Raw availability string
   * @returns {string} Normalized availability
   * @private
   */
  _mapAvailability(availability) {
    const availabilityMap = {
      'IN_STOCK': 'in_stock',
      'OUT_OF_STOCK': 'out_of_stock',
      'LIMITED_STOCK': 'limited',
      'PRE_ORDER': 'limited',
      'ARRIVING_SOON': 'limited',
      'IN_STOCK_ONLINE': 'in_stock',
      'VAILABLE': 'in_stock',
      'AVAILABLE': 'in_stock',
      'NON_AVAILABLE': 'out_of_stock',
      'NOT_AVAILABLE': 'out_of_stock',
      '': 'unknown',
      default: 'unknown'
    };
    
    return availabilityMap[availability] || availabilityMap.default;
  }

  /**
   * Log integration operation to database
   * @param {string} operation - Operation name
   * @param {string} status - Operation status
   * @param {string} errorMessage - Error message (if any)
   * @private
   */
  _logIntegration(operation, status, errorMessage) {
    // In production, this would log to the IntegrationLogs table
    // For now, console.log with structured format
    const logEntry = {
      retailerId: this.retailerId,
      operation: operation,
      status: status,
      errorMessage: errorMessage,
      executionTimeMs: new Date() - this._startTime,
      executedAt: new Date().toISOString()
    };
    // TODO: Implement actual database logging
    // db.query('INSERT INTO IntegrationLogs ...', [logEntry]);
    console.log('[Douglas Integration]', logEntry);
  }
}

/**
 * Factory function to create Douglas adapter instance
 * @param {Object} options - Adapter options with credentials
 * @returns {DouglasAdapter} Configured adapter instance
 */
function createDouglasAdapter(options) {
  return new DouglasAdapter(options);
}

module.exports = createDouglasAdapter;