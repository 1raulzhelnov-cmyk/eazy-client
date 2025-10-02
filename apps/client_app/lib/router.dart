import 'package:client_app/features/auth/domain/auth_state.dart';
import 'package:client_app/features/auth/presentation/auth_controller.dart';
import 'package:client_app/features/auth/presentation/login_screen.dart';
import 'package:client_app/features/auth/presentation/verify_otp_screen.dart';
import 'package:client_app/features/home/presentation/home_screen.dart';
import 'package:client_app/features/splash/presentation/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final AuthState authState = ref.watch(authControllerProvider);
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final bool isAuth = authState is Authenticated;
      if (!isAuth && state.matchedLocation == '/home') {
        return '/login';
      }
      if (isAuth && (state.matchedLocation == '/login' || state.matchedLocation == '/verify-otp' || state.matchedLocation == '/')) {
        return '/home';
      }
      return null;
    },
    routes: <RouteBase>[
      GoRoute(
        path: '/',
        name: 'splash',
        builder: (BuildContext context, GoRouterState state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (BuildContext context, GoRouterState state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/verify-otp',
        name: 'verifyOtp',
        builder: (BuildContext context, GoRouterState state) {
          final String contact = (state.extra as String?) ?? '';
          return VerifyOtpScreen(contact: contact);
        },
      ),
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (BuildContext context, GoRouterState state) => const HomeScreen(),
      ),
    ],
  );
});

