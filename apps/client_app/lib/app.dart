import 'package:client_app/router.dart';
import 'package:client_app/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Eazy Client',
      theme: buildLightTheme(),
      routerConfig: router,
    );
  }
}

