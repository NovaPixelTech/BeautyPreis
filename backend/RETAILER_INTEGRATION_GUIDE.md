# BeautyPreis Retailer Integration Guide

## Overview
This guide documents the retailer adapter architecture and provides detailed instructions for integrating each of the 10 target retailers into the BeautyPreis price comparison platform.

## Architecture

The platform uses a **standardized retailer adapter interface** (`BaseRetailerAdapter`) that all integrations must follow. This ensures:

- **Independent integrations** - Each retailer can be added/modified without affecting others
- **Consistent data contract** - All retailers normalize to the same internal format
- **Confidence-based matching** - Product matching uses brand, name, size, and EAN with scoring
- **Transparent price calculation** - Product price + shipping costs with verification status
- **Error isolation** - Failed retailer integrations don't break the application

### Adapter Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                BeautyPreis API Layer                         │
├─────────────────────┬─────────────────────┬─────────────┤
│  BaseRetailerAdapter  │  Douglas Adapter    │  YesStyle   │
│  (interface)          │  (official_api)     │  (third_party)│
├─────────────────────┼─────────────────────┼─────────────┤
│  - searchProducts()   │  - implements       │  - implements│
│  - getProductDetails()│  - official_api     │  - third_party│
│  - getPrice()         │  - methods          │  - methods   │
│  - getShipping()      │  - healthCheck()    │  - healthCheck()│
│  - normalizeProduct() │  - normalizeProduct()│  - normalizeProduct()│
│  - normalizePrice()   │  - normalizePrice() │  - normalizePrice()│
│  - normalizeShipping()│  - normalizeShipping()│  - normalizeShipping()│
└─────────────────────┴─────────────────────┴─────────────┘
```

## Retailer Configurations

The following configurations are pre-registered in the system:

| ID | Name | Slug | API Type | Country | Status |
|----|------|------|----------|---------|--------|
| yesstyle | YesStyle | yesstyle | third_party | Germany | Framework ready |
| stylevana | Stylevana | stylevana | third_party | Germany | Framework ready |
| douglas | Douglas Germany | douglas-de | official_api | Germany | Official API structure ready |
| flaconi | Flaconi | flaconi | official_api | Germany | Official API structure ready |
| notino | Notino Germany | notino-de | official_api | Germany | Official API structure ready |
| sephora | Sephora Germany | sephora-de | official_api | Germany | Official API structure ready |
| lookfantastic | Lookfantastic Germany | lookfantastic-de | official_api | Germany | Official API structure ready |
| shop_apotheke | Shop Apotheke | shop-apotheke | official_api | Germany | Official API structure ready |
| dm | dm.de | dm-de | third_party | Germany | Third-party investigation needed |
| rossmann | Rossmann.de | rossmann-de | third_party | Germany | Third-party investigation needed |

## Integration Methods (Priority Order)

### 1. Official Product APIs 🥇
**Preferred method when available.**

**Requirements:**
- API credentials (OAuth 2.0 client_id/secret or API key)
- API documentation review
- Rate limit identification
- Authentication flow implementation

**Example retailers:** Douglas, Flaconi, Notino, Sephora, Lookfantastic, Shop Apotheke

**Integration status:** Framework code structure implemented. Need: API credentials and documentation review.

### 2. Official Affiliate Product Feeds 🥈
**Secondary method using retailer affiliate programs.**

**Typical format:** CSV or JSON feed URL
**Data included:** Product IDs, names, prices, EANs, images, availability
**Affiliation:** Must comply with affiliate program terms and disclosure requirements

**Required:**
- Affiliate program approval
- Feed URL access
- Compliance with affiliate tracking requirements

**Example:** May be available for some retailers as alternative to official API

### 3. Authorized Third-Party Data Providers 🥉
**When official methods are unavailable.**

**Requirements:**
- Data licensing agreement
- Provider API credentials
- Data freshness and update frequency verification

**Implementation:** More complex normalization required due to varying data formats

### 4. Structured Product Information 📋
**Where legally and technically permitted.**

**Requirements:**
- Review of applicable copyright rules
- Permission for data use
- Structured format where available

### 5. Other Documented Methods 📝
**Last resort - only permitted methods.**

**Must respect:**
- Retailer terms of service
- robots.txt restrictions
- Rate limits
- Copyright rules
- Privacy requirements

**NOT allowed:**
- Bypassing CAPTCHAs or anti-bot protection
- Accessing restricted areas
- Modifying source prices silently

## Retailer-Specific Integration Notes

### YesStyle (yesstyle)
- **API Type:** third_party
- **Current status:** Framework ready
- **Integration path:** 
  - Investigate YesStyle affiliate program
  - Check for product data feed availability
  - If neither available, document as limitation
- **Key considerations:** International shipping to Germany, potential import duties

### Stylevana (stylevana)
- **API Type:** third_party
- **Current status:** Framework ready
- **Integration path:**
  - Investigate Stylevana affiliate program
  - Check for product data feed availability
  - Document limitations if no permitted access method
- **Key considerations:** Asian beauty products, shipping timelines

### Douglas Germany (douglas-de)
- **API Type:** official_api
- **Current status:** Framework ready - official API structure implemented
- **Integration path:**
  - Obtain official API credentials from Douglas
  - Review API documentation
  - Implement authentication (OAuth 2.0 or API key)
  - Test product search and price retrieval
  - Implement shipping cost retrieval
- **Key considerations:** German retailer, EUR pricing, fast delivery within EU

### Flaconi (flaconi)
- **API Type:** official_api
- **Current status:** Framework ready - official API structure implemented
- **Integration path:**
  - Obtain official API credentials from Flaconi
  - Review API documentation
  - Same implementation pattern as Douglas
- **Key considerations:** German retailer, wide product range

### Notino Germany (notino-de)
- **API Type:** official_api
- **Current status:** Framework ready - official API structure implemented
- **Integration path:**
  - Obtain official API credentials from Notino
  - Review API documentation
  - Standard implementation
- **Key considerations:** Popular German retailer, good price coverage

### Sephora Germany (sephora-de)
- **API Type:** official_api
- **Current status:** Framework ready - official API structure implemented
- **Integration path:**
  - Obtain official API credentials from Sephora
  - Review API documentation
  - Standard implementation
- **Key considerations:** International brand selection, genuine product guarantee

### Lookfantastic Germany (lookfantastic-de)
- **API Type:** official_api
- **Current status:** Framework ready - official API structure implemented
- **Integration path:**
  - Obtain official API credentials from Lookfantastic
  - Review API documentation
  - Standard implementation
- **Key considerations:** International shipping, gift with purchases

### Shop Apotheke (shop-apotheke)
- **API Type:** official_api
- **Current status:** Framework ready - official API structure implemented
- **Integration path:**
  - Obtain official API credentials from Shop Apotheke
  - Review API documentation
  - Standard implementation
- **Key considerations:** German pharmacy, prescription products policy, shipping restrictions

### dm.de (dm-de)
- **API Type:** third_party
- **Current status:** Framework ready - third-party framework available
- **Integration path:**
  - Investigate dm.de affiliate program
  - Check for authorized data feed partners
  - Contact dm.de merchant services for data access options
  - If no permitted method, document as limitation with clear explanation
- **Key considerations:** German drugstore chain, wide product variety, frequent promotions

### Rossmann.de (rossmann-de)
- **API Type:** third_party
- **Current status:** Framework ready - third-party framework available
- **Integration path:**
  - Investigate Rossmann affiliate program
  - Check for authorized data feed partners
  - Contact Rossmann merchant services for data access options
  - If no permitted method, document as limitation with clear explanation
- **Key considerations:** German drugstore chain, similar to dm.de

## Integration Checklist

Before implementing each retailer, verify:

### ✅ Pre-Integration
- [ ] Terms of Service analysis - Ensure permitted integration method
- [ ] robots.txt review - Check for disallowed paths
- [ ] Rate limit identification - Determine acceptable request frequency
- [ ] Data elements available - Product name, price, EAN, images, availability
- [ ] Currency handling - EUR as default, store original currency
- [ ] Shipping cost retrieval method - API, estimated, or checkout-based
- [ ] Import duty/charge policy - Document if/unknown/ included
- [ ] Authentication method - API key, OAuth, none
- [ ] Error handling strategy - Graceful degradation on failures
- [ ] Duplicate detection - Prevent same product multiple times
- [ ] Price verification - Distinguish verified vs estimated vs unknown
- [ ] Confidence scoring integration - Use product matcher confidence levels
- [ ] Data normalization - Convert to internal format consistently
- [ ] Failure modes - What happens on API errors, timeouts, etc.
- [ ] Monitoring - Log operations, track success/failure rates

### 🔧 Implementation
- [ ] Create adapter class extending BaseRetailerAdapter
- [ ] Implement searchProducts() method
- [ ] Implement getProductDetails() method
- [ ] Implement getPrice() method
- [ ] Implement getShipping() method
- [ ] Implement healthCheck() method
- [ ] Implement normalizeProduct() method
- [ ] Implement normalizePrice() method
- [ ] Implement normalizeShipping() method
- [ ] Register retailer in database configurations
- [ ] Add API credentials to .env (if official API)
- [ ] Test against real retailer data
- [ ] Verify product matching confidence scores
- [ ] Test total purchase cost calculation
- [ ] Test price alert functionality with real data

### 🚀 Post-Integration
- [ ] Monitor integration performance
- [ ] Track success/failure rates
- [ ] Update documentation with lessons learned
- [ ] Add to SEO and category mappings
- [ ] Test with multiple product types
- [ ] Verify mobile responsiveness of retailer offers
- [ ] Test price alert triggering with real data

## Data Normalization Rules

All retailer data must be normalized to this internal format:

### Product Normalization
```javascript
{
  id: string,              // UUID or retailer product ID
  name: string,            // Product name (original language)
  brand: string,           // Brand name
  size: string,            // e.g., "30ml", "50ml", "100ml"
  ean: string,             // EAN/GTIN barcode (optional)
  price: number,           // Product price in EUR
  currency: string,        // "EUR" (default) or original currency
  url: string,             // Direct product URL
  imageUrl: string,        // Product image URL
  availability: string,    // "in_stock", "out_of_stock", "limited", "unknown"
  matchConfidence: string  // EXACT, HIGH, POSSIBLE, LOW, DIFFERENT
}
```

### Price Normalization
```javascript
{
  price: number,           // Product price
  currency: string,        // "EUR" or original
  priceStatus: string,     // VERIFIED, ESTIMATED, UNKNOWN, OUTDATED
  sourceVerification: string, // "api", "checkout", "estimated", etc.
  totalPurchaseCost: number, // price + shipping (calculated at comparison time)
  shippingCost: number,    // Shipping cost in EUR (separate field)
  notes: string            // Any relevant notes
}
```

### Shipping Normalization
```javascript
{
  shippingMethod: string,  // "Standard", "Express", "Pickup", etc.
  price: number,           // Shipping cost in EUR
  currency: string,        // "EUR"
  estimatedDelivery: string, // "3-5 days", "1-2 weeks", etc.
  stockAvailable: boolean, // true/false/unknown
  source: string,          // "api", "checkout", "estimated"
  verificationStatus: string // "verified", "estimated", "unknown"
}
```

## Confidence Scoring Integration

The product matcher uses a 0-100 scale with these thresholds:

| Score | Confidence | Display Label |
|-------|-----------|--------------|
| 80+ | EXACT | "Exact match" |
| 60-79 | HIGH | "High confidence match" |
| 40-59 | POSSIBLE | "Possible match - verify details" |
| 1-39 | LOW | "Low confidence - check details" |
| 0 | DIFFERENT | "Different product/variant" |

**Factors contributing to score:**
- Brand exact match: +30 points
- EAN exact match: +35 points (most reliable)
- Size match: +20 points
- Keyword overlap: +15 points

**Display to user:**
- EXACT: "This is the exact product"
- HIGH: "High confidence this is the same product"
- POSSIBLE: "Possible match - verify product details match"
- LOW: "Low confidence - please verify product details"
- DIFFERENT: "This appears to be a different product or variant"

## Error Handling Guidelines

### API Failures
- **Timeouts:** Retry 2x with exponential backoff, then show "Unavailable"
- **4xx errors:** Client error - show "Product unavailable at this retailer"
- **5xx errors:** Server error - retry later, show "Retailer experiencing issues"
- **Rate limiting:** Respect Rate-Limit header, wait suggested time, then retry

### Data Quality Issues
- **Missing price:** Display "Price not available - check retailer"
- **Missing shipping:** Display "Shipping cost not verified - check retailer checkout"
- **Unknown import charges:** Display "Additional import charges may apply - final cost unknown"
- **Missing EAN:** Note in product matching as "EAN not available, matching by name/brand"

### User Communication
- Never invent prices or availability
- Always identify source for every offer
- Show last successful update timestamp
- Distinguish verified vs estimated vs unknown clearly
- Show uncertainty when product matching is not certain

## Monitoring and Logging

Each retailer integration should log:

```
{
  retailerId: "douglas",
  operation: "searchProducts" | "getProductDetails" | "getPrice" | "getShipping",
  status: "success" | "error" | "rate_limited",
  executionTimeMs: number,
  recordsProcessed: number,
  recordsSuccessful: number,
  errorMessage: string (if error),
  executedAt: ISO datetime
}
```

Logs are stored in the `IntegrationLogs` table and can be used for:
- Performance monitoring
- Failure pattern analysis
- Reteller priority optimization
- Resource allocation decisions

## Development Workflow

### 1. Create Adapter File
```javascript
// backend/retailers/douglasAdapter.js
const BaseRetailerAdapter = require('./baseAdapter');

class DouglasAdapter extends BaseRetailerAdapter {
  // Implement all abstract methods
}

module.exports = DouglasAdapter;
```

### 2. Test Against Real Data
- Use retailer's sandbox if available
- Test with 3-5 product types
- Verify confidence scoring
- Test error handling

### 3. Register in Database
```sql
INSERT INTO Retailer (id, name, slug, baseUrl, apiType, status, country)
VALUES ('douglas', 'Douglas Germany', 'douglas-de', 'https://www.douglas.de',
        'official_api', 'ACTIVE', 'Germany');
```

### 4. Update Configuration
Add to `retailerAdapter.js` getRetailerConfigurations() if not already present.

### 4. Deploy and Monitor
- Start with test products
- Monitor integration logs
- Gradually expand product coverage
- Collect user feedback on offer relevance

## Security and Compliance

### Data Protection
- Store only minimal necessary data
- Encrypt sensitive credentials in .env
- Never expose API keys in frontend code
- Comply with GDPR for user data

### Terms of Service
- Always read and comply with retailer TOS
- Respect robots.txt
- Honor rate limits
- Display affiliate disclosures when required
- Identify advertising clearly

### Copyright
- Do not scrape protected content
- Use only permitted data access methods
- Attribute sources properly
- Modify prices only as permitted

## Getting Started - First Retailer

### Recommended First Retailer: Douglas Germany

**Why Douglas:**
- Official API type (most reliable)
- German retailer (target market)
- Well-established e-commerce presence
- Comprehensive product catalog for beauty products

**Steps to integrate Douglas:**
1. Contact Douglas merchant/partner program for API access
2. Obtain client_id and client_secret (OAuth 2.0)
3. Implement DouglasAdapter extending BaseRetailerAdapter
4. Test with 5-10 beauty products
5. Verify product matching confidence scores
6. Test total purchase cost calculation
7. Add to production deployment

**Estimated effort:** 2-4 weeks from API access obtainment to production-ready integration.

## Contact and Support

For questions about retailer integration:
- Review this guide thoroughly
- Check existing adapter implementations
- Test with the product matcher first
- Contact the development team with specific questions

**Remember:** The most important competitive advantage must be:
**Accurate product identification + reliable price collection + transparent shipping costs + correct total purchase price comparison.**