# İLLURÊ Commerce Control Center — Master Roadmap Truth Matrix

**Generated At**: 2026-11-11  
**Target Host**: `https://illure.77.37.45.177.sslip.io`  
**Test Suite**: 20 test files, 99 tests passing, 0 failures on PostgreSQL test database.

---

## 1. Feature Implementation & Verification Matrix

| Feature Key | Module / Group | Backend Architecture | Admin Configuration UI | Storefront UI | Feature Status | Automated Tests | Notes / External Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `scent_finder` | DISCOVERY | Implemented (`/api/products`) | Implemented (`AdminFeaturesPage`) | Implemented (`ScentFinderModal`) | **ACTIVE** | `phase3Conversion.test.ts` | Uses live catalog taxonomy & accords |
| `notes_explorer`| DISCOVERY | Implemented (`/api/products/facets`) | Implemented (`AdminFeaturesPage`) | Implemented (`NotesExplorerModal`) | **ACTIVE** | `phase3Conversion.test.ts` | Real product note aggregation |
| `compare` | DISCOVERY | Implemented (`/api/products`) | Implemented (`AdminFeaturesPage`) | Implemented (`FragranceCompareModal`) | **ACTIVE** | `phase3Conversion.test.ts` | Multi-product accord radar |
| `similar_scents`| DISCOVERY | Implemented (`/api/products`) | Implemented (`AdminFeaturesPage`) | Implemented (PDP Rail) | **ACTIVE** | `publicCatalog.test.ts` | Family-based similarity |
| `discovery_sets`| CONVERSION | Implemented (`/api/discovery-sets`) | Implemented (`AdminDiscoverySetsPage`) | Implemented (`DiscoverySetBuilder`) | **ACTIVE** | `phase3Conversion.test.ts` | Dynamic bundle slots & live stock checks |
| `wishlist` | CONVERSION | Implemented (`/api/wishlist`) | Implemented (`AdminFeaturesPage`) | Implemented (`WishlistContext` + Account) | **ACTIVE** | `phase3Conversion.test.ts` | Guest local sync + Customer DB merge |
| `recently_viewed`| CONVERSION | Implemented | Implemented (`AdminFeaturesPage`) | Implemented (`RecentlyViewedContext`) | **ACTIVE** | Frontend context | Max 6 products browsing rail on PDP |
| `stock_alerts` | CONVERSION | Implemented (`/api/stock-alerts`) | Implemented (`AdminFeaturesPage`) | Implemented (PDP Out of stock modal) | **ACTIVE** | `phase3Conversion.test.ts` | Decoupled via `NotificationJob` queue |
| `advanced_search`| CONVERSION | Implemented (`/api/products/search`) | Implemented (`AdminFeaturesPage`) | Implemented (`SearchModal`) | **ACTIVE** | `commerceControlCenter.test.ts` | Parameterized injection sanitization |
| `advanced_filters`| CONVERSION | Implemented (`/api/products/facets`) | Implemented (`AdminFeaturesPage`) | Implemented (`CatalogView`) | **ACTIVE** | `phase3Conversion.test.ts` | Dynamic facet dropdowns + URL state |
| `advanced_gifting`| GIFTING | Implemented (`OrderItem.gift*`) | Implemented (`AdminGiftPackagingPage`) | Implemented (Cart & Checkout) | **ACTIVE** | `orders.test.ts` | Preserved on order snapshot |
| `gift_finder` | GIFTING | Implemented (`/api/gifting/gift-finder`) | Implemented (`AdminFeaturesPage`) | Implemented | **ACTIVE** | `commerceControlCenter.test.ts` | Reuses Scent Finder taxonomy & budget |
| `gift_cards` | GIFTING | Implemented (`/api/gifting/gift-cards`) | Implemented (`AdminFeaturesPage`) | Implemented | **ACTIVE** | `commerceControlCenter.test.ts` | Cryptographic code, concurrency safe |
| `free_samples` | GIFTING | Implemented (`/api/gifting/free-samples`) | Implemented (`AdminFeaturesPage`) | Hidden until configured | **CONFIGURATION REQUIRED** | `commerceControlCenter.test.ts` | Requires admin selection of eligible variants |
| `scent_profile`| RETENTION | Implemented (`/api/retention/scent-profile`)| Implemented (`AdminFeaturesPage`) | Implemented (Account Tab) | **ACTIVE** | `commerceControlCenter.test.ts` | Customer preference persistence |
| `recommendations`| RETENTION | Implemented (`/api/retention/recommendations`)| Implemented (`AdminFeaturesPage`) | Implemented | **ACTIVE** | `commerceControlCenter.test.ts` | Catalog matching based on profile |
| `buy_again` | RETENTION | Implemented (`/api/retention/buy-again`) | Implemented (`AdminFeaturesPage`) | Implemented (Account Archive) | **ACTIVE** | `commerceControlCenter.test.ts` | Real-time stock & pricing check |
| `reviews` | RETENTION | Implemented (`/api/retention/reviews`) | Implemented (`AdminFeaturesPage`) | Implemented (PDP Reviews) | **ACTIVE** | `commerceControlCenter.test.ts` | Verified buyer badge + moderation |
| `review_media` | RETENTION | Implemented (MIME & extension check) | Implemented (`AdminFeaturesPage`) | Implemented | **ACTIVE** | `commerceControlCenter.test.ts` | Supports JPG, PNG, WEBP (max 5 photos) |
| `review_requests`| RETENTION | Implemented (`NotificationJob`) | Implemented (`AdminFeaturesPage`) | N/A (Email automation) | **ACTIVE** | `commerceControlCenter.test.ts` | Automated post-delivery email runner |
| `loyalty` | LOYALTY | Implemented (`/api/loyalty`) | Implemented (`AdminFeaturesPage`) | Implemented (Account Points) | **ACTIVE** | `commerceControlCenter.test.ts` | Double-entry ledger, idempotency protected |
| `referrals` | LOYALTY | Implemented (`/api/loyalty/referral`) | Implemented (`AdminFeaturesPage`) | Implemented (Account Share) | **ACTIVE** | `commerceControlCenter.test.ts` | Unique code, single-claim qualification |
| `abandoned_cart`| MARKETING | Implemented (`/api/loyalty/admin/...`) | Implemented (`AdminFeaturesPage`) | N/A (Background recovery) | **ACTIVE** | `commerceControlCenter.test.ts` | Enqueues jobs for unpurchased carts |
| `limited_drops`| MARKETING | Implemented (`/api/loyalty/drops`) | Implemented (`AdminFeaturesPage`) | Implemented | **ACTIVE** | `commerceControlCenter.test.ts` | Genuine countdown timers, zero fake scarcity |
| `order_timeline`| ORDERS | Implemented (`/api/operations/orders/.../timeline`)| Implemented | Implemented (Account Orders) | **ACTIVE** | `commerceControlCenter.test.ts` | Real database status transitions only |
| `customer_cancellation`| ORDERS | Implemented (`/api/operations/orders/.../cancel`)| Implemented (`AdminFeaturesPage`) | Implemented (Account Orders) | **ACTIVE** | `commerceControlCenter.test.ts` | Admin-configurable allowed statuses |
| `returns` | ORDERS | Implemented (`/api/operations/returns`) | Implemented (`AdminFeaturesPage`) | Implemented (Account Orders) | **CONFIGURATION REQUIRED** | `commerceControlCenter.test.ts` | Requires admin return window & policy rules |
| `invoices` | ORDERS | Implemented (`/api/operations/orders/.../invoice`)| Implemented (`AdminFeaturesPage`) | Implemented | **CONFIGURATION REQUIRED** | `commerceControlCenter.test.ts` | Blocked until legal business entity & GSTIN entered |
| `pincode_serviceability`| DELIVERY | Implemented (`/api/operations/pincode/...`)| Implemented (`AdminFeaturesPage`) | Implemented (PDP/Checkout) | **ACTIVE** | `commerceControlCenter.test.ts` | Truthful check; zero fabricated delivery ETAs |
| `cod_controls` | ORDERS | Implemented (`/api/checkout/summary`) | Implemented (`AdminFeaturesPage`) | Implemented (Checkout payment options)| **ACTIVE** | `orders.test.ts` | Configurable COD fee and restrictions |
| `risk_flags` | ORDERS | Implemented (`/api/operations/orders/...`)| Implemented (`AdminFeaturesPage`) | N/A (Admin Flagging) | **ACTIVE** | `commerceControlCenter.test.ts` | Configurable COD threshold (default flag only) |
| `shipping_provider`| DELIVERY | Implemented (`ShippingProviderService`) | Implemented (`AdminFeaturesPage`) | N/A (Fulfillment) | **CONFIGURATION REQUIRED** | `commerceControlCenter.test.ts` | Blocked externally until courier credentials provided |

---

## 2. Hardening Audit Findings & Actions Taken

1. **Removal of Invented Defaults**:
   - Removed hardcoded ₹1,999 spend threshold and hardcoded 3ml bottle size.
   - Removed hardcoded 100 signup points, ₹1 = 1 point, and hardcoded tier thresholds.
   - Removed hardcoded ₹15,000 COD risk threshold; moved to configurable feature settings.
   - Removed fabricated 3-day delivery ETA from default pincode responses.
   - Removed placeholder GSTIN (`07AAACI1234F1Z1`) and placeholder legal address. Invoices now strictly return `CONFIGURATION REQUIRED` until valid business entity details are provided.
2. **Security & Injection Neutralization**:
   - Protected CSV exports against formula injection (`=`, `+`, `-`, `@`) by prepending `'` inside escaped quotes.
   - Rate-limited and restricted Gift Card public balance endpoint to prevent enumeration and leaking private recipient data.
   - Row-level `SELECT ... FOR UPDATE` locking on Gift Card and Loyalty accounts to prevent concurrent double-spending race conditions.
   - Validated photo review uploads to strictly allow `.jpg`, `.jpeg`, `.png`, and `.webp` with 5-file limits.
3. **Background Worker & Automation**:
   - Added `NotificationQueueWorker` running at 30-second intervals in server runtime with exponential backoff and single-job claim locking.
4. **Prisma Migrations**:
   - Clean status on both `illure_test_db` and `illure_staging_db` across 8 committed migration folders.
