import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // MVP: no-op; could log or update local store
}

class MessagingService {
  MessagingService._();

  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  static bool _initialized = false;

  static Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    try {
      if (!kIsWeb && (Platform.isIOS || Platform.isMacOS)) {
        final NotificationSettings settings = await _fcm.requestPermission(
          alert: true,
          badge: true,
          sound: true,
          provisional: false,
        );
        debugPrint('Push permission: ${settings.authorizationStatus}');
      }

      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      final String? token = await _fcm.getToken();
      debugPrint('FCM token: $token');

      await _fcm.subscribeToTopic('orders');

      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('FCM foreground: ${message.messageId}');
      });
    } catch (e) {
      debugPrint('Messaging init error: $e');
    }
  }
}
