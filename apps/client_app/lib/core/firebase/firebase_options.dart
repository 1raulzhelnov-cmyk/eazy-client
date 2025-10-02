// This is a placeholder generated for CI/local runs without flutterfire.
// Replace with the real file by running `flutterfire configure`.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return const FirebaseOptions(
        apiKey: 'web-api-key',
        appId: '1:000000000000:web:placeholder',
        messagingSenderId: '000000000000',
        projectId: 'placeholder-project',
        authDomain: 'placeholder.firebaseapp.com',
        storageBucket: 'placeholder.appspot.com',
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return const FirebaseOptions(
          apiKey: 'android-api-key',
          appId: '1:000000000000:android:placeholder',
          messagingSenderId: '000000000000',
          projectId: 'placeholder-project',
          storageBucket: 'placeholder.appspot.com',
        );
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
        return const FirebaseOptions(
          apiKey: 'ios-api-key',
          appId: '1:000000000000:ios:placeholder',
          messagingSenderId: '000000000000',
          projectId: 'placeholder-project',
          storageBucket: 'placeholder.appspot.com',
          iosBundleId: 'com.eazy.clientApp',
        );
      case TargetPlatform.windows:
      case TargetPlatform.linux:
        return const FirebaseOptions(
          apiKey: 'desktop-api-key',
          appId: '1:000000000000:linux:placeholder',
          messagingSenderId: '000000000000',
          projectId: 'placeholder-project',
          storageBucket: 'placeholder.appspot.com',
        );
      case TargetPlatform.fuchsia:
        return const FirebaseOptions(
          apiKey: 'fuchsia-api-key',
          appId: '1:000000000000:fuchsia:placeholder',
          messagingSenderId: '000000000000',
          projectId: 'placeholder-project',
          storageBucket: 'placeholder.appspot.com',
        );
    }
  }
}