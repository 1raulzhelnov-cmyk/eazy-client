import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return const FirebaseOptions(
        apiKey: 'AIzaSyDDBuAYUzB11eCBvsAXRcoy2Q9QOUfEI3w',
        appId: '1:60020113259:web:750e4ca8681cea2a5ad62e',
        messagingSenderId: '60020113259',
        projectId: 'eazy-a-690c5',
        authDomain: 'eazy-a-690c5.firebaseapp.com',
        storageBucket: 'eazy-a-690c5.firebasestorage.app',
        measurementId: 'G-F5RKJ2XX5Z',
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return const FirebaseOptions(
          apiKey: 'AIzaSyCBFT49yHLw0tOtquHsyiN_5CPcJlLFtzU',
          appId: '1:60020113259:android:8926ee562148467a5ad62e',
          messagingSenderId: '60020113259',
          projectId: 'eazy-a-690c5',
          storageBucket: 'eazy-a-690c5.firebasestorage.app',
        );
      case TargetPlatform.iOS:
        return const FirebaseOptions(
          apiKey: 'AIzaSyBL2PnxA6qTtVDBNn_FRVopJdWBf3XA8Ts',
          appId: '1:60020113259:ios:8ef17a217dc107775ad62e',
          messagingSenderId: '60020113259',
          projectId: 'eazy-a-690c5',
          storageBucket: 'eazy-a-690c5.firebasestorage.app',
          iosBundleId: 'com.eazy.clientApp',
        );
      case TargetPlatform.macOS:
        return const FirebaseOptions(
          apiKey: 'AIzaSyBL2PnxA6qTtVDBNn_FRVopJdWBf3XA8Ts',
          appId: '1:60020113259:ios:8ef17a217dc107775ad62e',
          messagingSenderId: '60020113259',
          projectId: 'eazy-a-690c5',
          storageBucket: 'eazy-a-690c5.firebasestorage.app',
          iosBundleId: 'com.eazy.clientApp',
        );
      case TargetPlatform.windows:
      case TargetPlatform.linux:
        return const FirebaseOptions(
          apiKey: 'AIzaSyCBFT49yHLw0tOtquHsyiN_5CPcJlLFtzU',
          appId: '1:60020113259:android:8926ee562148467a5ad62e',
          messagingSenderId: '60020113259',
          projectId: 'eazy-a-690c5',
          storageBucket: 'eazy-a-690c5.firebasestorage.app',
        );
      case TargetPlatform.fuchsia:
        return const FirebaseOptions(
          apiKey: 'AIzaSyCBFT49yHLw0tOtquHsyiN_5CPcJlLFtzU',
          appId: '1:60020113259:android:8926ee562148467a5ad62e',
          messagingSenderId: '60020113259',
          projectId: 'eazy-a-690c5',
          storageBucket: 'eazy-a-690c5.firebasestorage.app',
        );
    }
  }
}