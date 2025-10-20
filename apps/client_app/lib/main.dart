import 'package:client_app/app.dart';
import 'package:client_app/core/firebase/firebase_options.dart';
import 'package:client_app/core/firebase/messaging_service.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: '.env');
  } catch (e) {
    debugPrint('dotenv load skipped: $e');
  }
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  // Crashlytics: forward uncaught errors
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    FirebaseCrashlytics.instance.recordFlutterFatalError(details);
  };
  WidgetsBinding.instance.platformDispatcher.onError = (Object error, StackTrace stack) {
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    return true;
  };
  // Analytics minimal events will be logged from feature controllers.
  final String publishableKey = dotenv.maybeGet('STRIPE_PUBLISHABLE_KEY') ?? '';
  if (publishableKey.isNotEmpty) {
    Stripe.publishableKey = publishableKey;
    await Stripe.instance.applySettings();
  }
  await MessagingService.initialize();
  runApp(const ProviderScope(child: App()));
}
