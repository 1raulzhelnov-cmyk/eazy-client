# Eazy Client App

Flutter client scaffold with Riverpod, GoRouter, Dio, and dotenv.

## Getting Started

1. Copy env:
```bash
cp .env.sample .env
echo "API_BASE_URL=http://localhost:8080" >> .env
```
2. Install dependencies:
```bash
flutter pub get
```
3. Run analysis:
```bash
flutter analyze
```
4. Run on web:
```bash
flutter run -d chrome
```

## Structure
- `lib/app.dart`: App root with MaterialApp.router
- `lib/router.dart`: GoRouter configuration
- `lib/theme.dart`: Theme setup
- `lib/core/network/dio_client.dart`: Preconfigured Dio client
- `lib/features/splash/splash_screen.dart`: Splash screen
- `lib/features/auth/login_screen.dart`: Login screen
- `lib/features/home/home_screen.dart`: Home with tabs
# client_app

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
