# Driver App

Scaffolded Flutter app for drivers.

## Dependencies

- flutter_riverpod
- go_router
- flutter_dotenv
- firebase_core, firebase_auth, cloud_firestore, firebase_storage
- geolocator, url_launcher, image_picker

Versions mirror `apps/client_app/pubspec.yaml` where applicable.

## Environment

- Copy `.env.sample` to `.env` in `apps/driver_app/`.

## Firebase

- Replace placeholders in `lib/core/firebase/firebase_options_driver.dart` with your driver app Firebase project configuration (web/android/ios/macos).
- Add platform configs as usual (Android `google-services.json`, iOS `GoogleService-Info.plist`). These are ignored by git.

## Run

```bash
/workspace/flutter/bin/flutter pub get
/workspace/flutter/bin/flutter analyze
/workspace/flutter/bin/flutter run -d chrome
```

## Project entry

- `lib/core/app.dart` — app bootstrap, theme, router
- `lib/core/router/router.dart` — routes
- `lib/core/theme/theme.dart` — theme
- `lib/core/env/env.dart` — env helpers
