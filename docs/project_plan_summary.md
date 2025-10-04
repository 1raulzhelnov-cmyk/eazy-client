## Client App (C000–C018)

- C000: App bootstrap and Splash flow
- C001: Auth – Login (email/phone input, OTP request)
- C002: Auth – Verify OTP (code input, success routing)
- C003: Home – Main navigation (Food, Flowers tabs)
- C004: Profile – View/update profile, auth status
- C005: Address – Address list, add/edit/remove
- C006: Restaurants – Listing, details, delivery times
- C007: Catalog – Food catalog, categories, product details
- C008: Flowers – Catalog, bouquets, product details
- C009: Search – Global search (restaurants/products)
- C010: Cart – Add/remove/update items, promos
- C011: Checkout – Delivery slots, address, payment method
- C012: Orders – History, order details, reorder
- C013: Tracking – Live order tracking
- C014: Notifications – Push/in-app notifications
- C015: Favorites – Saved restaurants and items
- C016: Payments – Methods, receipts
- C017: Settings – Language, theme, legal
- C018: Support – Help center, chat/contact

Notes:
- UI/UX must remain pixel-identical to existing app.
- Internal architecture is feature-first, Riverpod state management, GoRouter navigation.

## Other Apps (future phases)

- Courier App (D000–D008)
  - D000: Courier bootstrap/auth
  - D001: Task list
  - D002: Task details and navigation
  - D003: Route optimization
  - D004: Status updates (pickup/delivery)
  - D005: Earnings and history
  - D006: Profile and settings
  - D007: Notifications
  - D008: Support

- Vendor App (P000–P006)
  - P000: Vendor bootstrap/auth
  - P001: Menu/catalog management
  - P002: Orders management
  - P003: Inventory and pricing
  - P004: Promotions
  - P005: Analytics
  - P006: Settings

- Backend (B001–B020)
  - Authentication, catalog, orders, payments, notifications, analytics

- Admin Panel (A001–A014)
  - Multi-tenant management, catalogs, orders, users, promotions, analytics

## Tech/Architecture

- Feature-based modules: features/<feature>/{presentation,domain,data}
- Core services: core/{router,theme,network,firebase}
- Shared code: shared/{widgets,utils,extensions,constants}
- State: flutter_riverpod; Navigation: go_router
- Data: Firebase (auth, firestore, storage), Dio for HTTP APIs
