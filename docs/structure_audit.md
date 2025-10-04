## Structure Audit (Client App)

Scope: apps/client_app

### Summary
- The project already follows a feature-first layout for `auth`, `splash`, and `home`.
- Riverpod and GoRouter are in place. Firebase initialization exists in `main.dart`.
- No explicit Lowable artifacts detected; one leftover simplified provider exists.

### Findings by Category

- KEEP
  - `lib/main.dart` — Firebase init + ProviderScope
  - `lib/app.dart` — App root using `MaterialApp.router`
  - `lib/core/firebase/firebase_options.dart` — FlutterFire generated
  - `lib/core/network/dio_client.dart` — HTTP client with auth header
  - `lib/features/auth/domain/*` — Auth state and tokens
  - `lib/features/auth/presentation/*` — Login, Verify OTP, Auth controller
  - `lib/features/auth/data/*` — API, storage, Firebase auth repository
  - `lib/features/home/presentation/home_screen.dart` — Tabs scaffold (Food/Flowers)
  - `lib/features/splash/presentation/splash_screen.dart` — Splash layout and timing (UI preserved)

- REWRITE (internal logic/structure only, UI unchanged)
  - Move `lib/router.dart` to `lib/core/router/router.dart`
  - Move `lib/theme.dart` to `lib/core/theme/theme.dart`
  - Align Splash auth check with canonical `authControllerProvider`
  - Switch token storage to `shared_preferences` (remove flutter_secure_storage)

- REMOVE
  - `lib/features/auth/providers.dart` — ad-hoc boolean auth provider (redundant with `authControllerProvider`)

### Screen → Task Codes
- C000: `features/splash/presentation/splash_screen.dart`
- C001: `features/auth/presentation/login_screen.dart`
- C002: `features/auth/presentation/verify_otp_screen.dart`
- C003: `features/home/presentation/home_screen.dart`
- C004: `features/profile/*` (to be added)
- C005: `features/address/*` (to be added)
- C006: `features/restaurants/*` (to be added)
- C007: `features/catalog/*` (to be added)
- C008: `features/flowers/*` (to be added)
- C009: `features/search/*` (to be added)
- C010: `features/cart/*` (to be added)
- C011: `features/checkout/*` (to be added)
- C012: `features/orders/*` (to be added)
- C013: `features/tracking/*` (to be added)
- C014: `features/notifications/*` (to be added)
- C015: `features/favorites/*` (to be added)
- C016: `features/payments/*` (to be added)
- C017: `features/settings/*` (to be added)
- C018: `features/support/*` (to be added)

### Target Structure (no UI changes)
```
lib/
  core/
    firebase/
    network/
    router/
    theme/
  features/
    auth/
      data/ domain/ presentation/
    splash/ presentation/
    home/ presentation/
    ... (address, restaurants, catalog, flowers, search, cart, profile, etc.)
  shared/
    widgets/ utils/ extensions/ constants/
  main.dart
```

### Notes
- GoRouter already guards routes via `authControllerProvider`.
- Keep visuals (layouts/colors/texts/spacings) strictly unchanged; only internals move.
