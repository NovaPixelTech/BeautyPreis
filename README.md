# BeautyPreis - Multi-Store Price Comparison Platform

## Professional price comparison platform for beauty & skincare products in Germany

### Overview

BeautyPreis is a web application that allows users in Germany to search for beauty and skincare products and compare their actual purchase cost across multiple international and German online retailers.

### Core Principles

- **Data accuracy** - Only verified, traceable prices displayed
- **Reliable product matching** - Brand, model, size, EAN-based matching with confidence scoring
- **Real price information** - No fictional prices, all offers traceable to sources
- **Transparent shipping costs** - Clear distinction between verified, estimated, and unknown shipping
- **Correct total purchase price** - Product price + shipping + applicable charges
- **Excellent user experience** - Premium, modern, professional interface
- **Maintainable architecture** - Standardized retailer adapter pattern
- **Scalability** - Designed to grow from initial retailers to a large comparison ecosystem

### Initial Target Retailers

1. YesStyle
2. Stylevana
3. Douglas Germany
4. Flaconi
5. Notino Germany
6. Sephora Germany
7. Lookfantastic Germany
8. Shop Apotheke
9. dm.de
10. Rossmann.de

### Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, TypeScript, REST API
- **Database**: PostgreSQL, Prisma ORM
- **Caching**: Redis (where justified)
- **Deployment**: Docker, with documented deployment instructions

### Search & Matching

- Support search by product name, brand, category, model, EAN/GTIN, keywords
- Product matching with confidence scoring (exact, high-confidence, possible, different)
- Never combine different product sizes/variants
- Display uncertainty when product matching is not certain

### Initial Demonstration Product

- **Brand**: ANUA
- **Product**: PDRN Hyaluronic Acid Hydrating Capsule Mist
- **Size**: 30ml

### Development Phases

1. **Phase 1** - Repository inspection and architecture setup
2. **Phase 2** - Core application (homepage, search, product details, database)
3. **Phase 3** - Retailer integration framework
4. **Phase 4** - Comparison engine (product matching, price normalization, total cost)
5. **Phase 5** - Advanced functionality (price history, alerts, filters)
6. **Phase 6** - Testing and optimization
7. **Phase 7** - Documentation and deployment

### SEO & Legal

- Primary language: German with English support
- GDPR compliant
- Cookie consent where required
- Affiliate disclosure and transparent advertising
- Structured product information where appropriate

### License

This is a commercial project. See individual retailer terms for affiliate and API requirements.