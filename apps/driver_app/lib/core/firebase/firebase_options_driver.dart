import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DriverFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      // TODO: Replace with driver app web options
      return const FirebaseOptions(
        apiKey: 'TODO',
        appId: 'TODO',
        messagingSenderId: 'TODO',
        projectId: 'TODO',
        storageBucket: 'TODO',
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return const FirebaseOptions(
          apiKey: 'TODO',
          appId: 'TODO',
          messagingSenderId: 'TODO',
          projectId: 'TODO',
          storageBucket: 'TODO',
        );
      case TargetPlatform.iOS:
        return const FirebaseOptions(
          apiKey: 'TODO',
          appId: 'TODO',
          messagingSenderId: 'TODO',
          projectId: 'TODO',
          storageBucket: 'TODO',
          iosBundleId: 'com.eazy.driverApp',
        );
      case TargetPlatform.macOS:
        return const FirebaseOptions(
          apiKey: 'TODO',
          appId: 'TODO',
          messagingSenderId: 'TODO',
          projectId: 'TODO',
          storageBucket: 'TODO',
          iosBundleId: 'com.eazy.driverApp',
        );
      case TargetPlatform.windows:
      case TargetPlatform.linux:
        return const FirebaseOptions(
          apiKey: 'TODO',
          appId: 'TODO',
          messagingSenderId: 'TODO',
          projectId: 'TODO',
          storageBucket: 'TODO',
        );
      case TargetPlatform.fuchsia:
        return const FirebaseOptions(
          apiKey: 'TODO',
          appId: 'TODO',
          messagingSenderId: 'TODO',
          projectId: 'TODO',
          storageBucket: 'TODO',
        );
    }
  }
}
