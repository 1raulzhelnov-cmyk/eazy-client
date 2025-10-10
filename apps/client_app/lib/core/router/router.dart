import 'package:client_app/features/auth/domain/auth_state.dart';
import 'package:client_app/features/auth/presentation/auth_controller.dart';
import 'package:client_app/features/auth/presentation/login_screen.dart';
import 'package:client_app/features/auth/presentation/verify_otp_screen.dart';
import 'package:client_app/features/home/presentation/home_screen.dart';
import 'package:client_app/features/profile/presentation/profile_screen.dart';
import 'package:client_app/features/catalog/presentation/catalog_screen.dart';
import 'package:client_app/features/cart/presentation/cart_screen.dart';
import 'package:client_app/features/search/presentation/search_screen.dart';
import 'package:client_app/features/address/ui/addresses_page.dart';
import 'package:client_app/features/address/ui/address_form_page.dart';
import 'package:client_app/features/splash/presentation/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final AuthState authState = ref.watch(authControllerProvider);
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      final bool isAuth = authState is Authenticated;
      if (!isAuth && state.matchedLocation == '/home') {
        return '/login';
      }
      if (isAuth && (state.matchedLocation == '/login' || state.matchedLocation == '/auth' || state.matchedLocation == '/verify-otp' || state.matchedLocation == '/splash')) {
        return '/home';
      }
      return null;
    },
    routes: <RouteBase>[
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (BuildContext context, GoRouterState state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (BuildContext context, GoRouterState state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth',
        name: 'auth',
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
      GoRoute(
        path: '/catalog',
        name: 'catalog',
        builder: (BuildContext context, GoRouterState state) => const CatalogScreen(),
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (BuildContext context, GoRouterState state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/cart',
        name: 'cart',
        builder: (BuildContext context, GoRouterState state) => const CartScreen(),
      ),
      GoRoute(
        path: '/search',
        name: 'search',
        builder: (BuildContext context, GoRouterState state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/addresses',
        name: 'addresses',
        builder: (BuildContext context, GoRouterState state) => const AddressesPage(),
      ),
      GoRoute(
        path: '/address-form',
        name: 'addressForm',
        builder: (BuildContext context, GoRouterState state) {
          final String? addressId = state.extra as String?;
          return AddressFormPage(addressId: addressId);
        },
      ),
    ],
  );
});
