import 'package:flutter/material.dart';

ThemeData buildLightTheme() {
  const Color seed = Color(0xFF0066FF);
  return ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: seed),
    useMaterial3: true,
    visualDensity: VisualDensity.adaptivePlatformDensity,
  );
}

