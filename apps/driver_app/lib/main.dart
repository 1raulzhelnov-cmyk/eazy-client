import 'package:driver_app/core/app.dart';
import 'package:driver_app/core/firebase/firebase_options_driver.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DriverFirebaseOptions.currentPlatform);
  await DriverApp.bootstrapAndRun();
}
