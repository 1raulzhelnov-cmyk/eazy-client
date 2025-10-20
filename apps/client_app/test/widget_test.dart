// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:client_app/app.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:client_app/core/router/router.dart' as r;
import 'package:go_router/go_router.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:riverpod/riverpod.dart' as rp;

void main() {
  testWidgets('App renders without errors', (WidgetTester tester) async {
    // Override providers that require Firebase to avoid initializing Firebase in tests
    final container = rp.ProviderContainer(overrides: [
      r.routerProvider.overrideWithValue(GoRouter(initialLocation: '/login', routes: const <RouteBase>[])),
    ]);
    await tester.pumpWidget(UncontrolledProviderScope(
      container: container,
      child: const ProviderScope(child: App()),
    ));
    await tester.pump(const Duration(milliseconds: 16));
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
