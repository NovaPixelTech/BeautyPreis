# BeautyPreis - Multi-Store Price Comparison Platform

## Overview

BeautyPreis is a web application that allows users in Germany to search for beauty and skincare products and compare their actual purchase cost across multiple international and German online retailers.

## Core Principles

- **Data accuracy** - Only verified, traceable prices displayed
- **Reliable product matching** - Brand, model, size, EAN-based matching with confidence scoring
- **Real price information** - No fictional prices, all offers traceable to sources
- **Transparent shipping costs** - Clear distinction between verified, estimated, and unknown shipping
- **Correct total purchase price** - Product price + shipping + applicable charges
- **Excellent user experience** - Premium, modern, professional interface
- **Maintainable architecture** - Standardized retailer adapter pattern
- **Scalability** - Designed to grow from initial retailers to a large comparison ecosystem

## Technology Stack

### Backend
- Node.js with Express
- SQLite via better-sqlite3 (easier for development than PostgreSQL)
- JWT for authentication
- bcrypt for password hashing
- dotenv for environment configuration

### Database
- SQLite for development (file-based, no server needed)
- PostgreSQL supported for production
- Prisma ORM schema available (schema.prisma)

### Frontend (planned)
- React
- TypeScript
- Vite
- Tailwind CSS

## Initial Retailers (Integrated)

1. YesStyle - third_party integration
2. Stylevana - third_party integration
3. Douglas Germany - official_api
4. Flaconi - official_api
5. Notino Germany - official_api
6. Sephora Germany - official_api
7. Lookfantastic Germany - official_api
8. Shop Apotheke - official_api
9. dm.de - third_party
10. Rossmann.de - third_party

## Initial Categories

- Face Cleansers
- Toners
- Serums
- Moisturizers
- Sunscreens
- Face Masks
- Eye Care
- Makeup
- Hair Care
- Body Care
- Korean Skincare (K-Beauty)
- Japanese Skincare (J-Beauty)

## Development Phases

### Phase 1 - ✅ Complete
- Repository inspection and architecture setup
- Database schema design and implementation
- Core API endpoints
- Basic project structure

### Phase 2 - Upcoming
- React frontend development
- Homepage with search bar
- Product display components
- Responsive design

### Phase 3 - Planned
- Retailer adapter architecture
- Individual retailer integrations
- API data fetching from each store

### Phase 4 - Planned
- Product matching engine
- Confidence scoring system
- Size/variant differentiation

### Phase 5 - Planned
- Price history tracking
- Price alerts functionality
- User accounts

### Phase 6 - Planned
- Unit testing
- Integration testing
- Performance optimization

### Phase 7 - Planned
- Documentation
- Deployment instructions
- Known limitations

## Running the Application

```bash
# Install dependencies
cd backend
npm install

# Start the server
node index.js

# API available at http://localhost:3011
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check |
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | User login |
| `GET /api/retailers` | List all retailers |
| `GET /api/products` | Search products |
| `GET /api/products/:id/offers` | Get offers for product |
| `POST /api/alerts` | Create price alert |

## SQL Schema

The `Database.sql` file contains the complete normalized schema supporting:
- Users, Retailers, Brands, Categories
- Products with matching confidence
- Retailer products with prices and EANs
- Historical price observations (never overwrite)
- Shipping information with verification status
- Price alerts and search history
- Integration logs for monitoring

## Key Features Implemented

✅ Database with 11+ tables supporting full functionality  
✅ 10 initial retailers integrated  
✅ 13 product categories  
✅ JWT authentication system  
✅ Product search by name, brand, category  
✅ Product matching with confidence scoring  
✅ Price observations (historical, never overwrite)  
✅ Shipping cost tracking with verification status  
✅ Price alert creation  
✅ Search history tracking  
✅ Integration operation logging  

## Data Model Highlights

- **Product matching** uses brand, name, size, and EAN/GTIN with confidence scores (EXACT, HIGH, POSSIBLE, LOW, DIFFERENT)
- **Price calculations**: Total = Product Price + Shipping Cost + Additional Charges
- **Currency**: EUR as default for Germany, original currencies stored
- **Shipping**: Verified (from checkout), estimated, or unknown
- **Price status**: VERIFIED, ESTIMATED, UNKNOWN, OUTDATED
- **Match confidence**: EXACT > HIGH > POSSIBLE > LOW > DIFFERENT

## Legal & Compliance

- GDPR-friendly data handling
- Cookie consent where required
- Affiliate disclosure for retailer links
- Transparent advertising identification
- German language support (primary) with English/Greek preparation