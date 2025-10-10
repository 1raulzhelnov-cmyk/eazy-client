import 'package:client_app/app.dart';
import 'package:client_app/core/firebase/firebase_options.dart';
import 'package:client_app/core/firebase/messaging_service.dart';
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
  final String publishableKey = dotenv.maybeGet('STRIPE_PUBLISHABLE_KEY') ?? '';
  if (publishableKey.isNotEmpty) {
    Stripe.publishableKey = publishableKey;
    await Stripe.instance.applySettings();
  }
  await MessagingService.initialize();
  runApp(const ProviderScope(child: App()));
}
