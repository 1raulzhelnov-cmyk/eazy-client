import 'package:driver_app/core/router/router.dart';
import 'package:driver_app/core/theme/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class DriverApp extends ConsumerWidget {
  const DriverApp({super.key});

  static Future<void> bootstrapAndRun() async {
    WidgetsFlutterBinding.ensureInitialized();
    await dotenv.load(fileName: '.env');
    runApp(const ProviderScope(child: DriverApp()));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GoRouter router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Driver App',
      theme: buildAppTheme(),
      routerConfig: router,
    );
  }
}
