import 'package:client_app/features/auth/data/auth_api.dart';
import 'package:client_app/features/auth/data/auth_storage.dart';
import 'package:client_app/features/auth/data/firebase_auth_repository.dart';
import 'package:client_app/features/auth/domain/auth_state.dart';
import 'package:client_app/features/auth/domain/auth_tokens.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authControllerProvider = NotifierProvider<AuthController, AuthState>(
  AuthController.new,
);

class AuthController extends Notifier<AuthState> {
  late final AuthApi _api;
  late final AuthStorage _storage;
  late final FirebaseAuthRepository _firebaseRepo;

  @override
  AuthState build() {
    _api = const AuthApi();
    _storage = AuthStorage.instance;
    _firebaseRepo = FirebaseAuthRepository();
    _initialize();
    return const Unauthenticated();
  }

  Future<void> _initialize() async {
    final String? token = await _storage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      state = const Authenticated(userId: 'user');
    } else {
      state = const Unauthenticated();
    }
  }

  Future<void> sendOtp(String emailOrPhone) async {
    state = const Loading();
    try {
      await _api.requestOtp(emailOrPhone);
      state = const Unauthenticated();
    } catch (e) {
      state = ErrorState(e.toString());
    }
  }

  Future<void> verifyOtp(String emailOrPhone, String code) async {
    state = const Loading();
    try {
      final AuthTokens tokens = await _api.verifyOtp(emailOrPhone, code);
      await _storage.saveTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );
      state = const Authenticated(userId: 'user');
      await FirebaseAnalytics.instance.logLogin(loginMethod: 'otp');
    } catch (e) {
      state = ErrorState(e.toString());
    }
  }

  Future<void> logout() async {
    state = const Loading();
    try {
      await _api.logout();
      await _storage.clear();
      state = const Unauthenticated();
      await FirebaseAnalytics.instance.logEvent(name: 'logout');
    } catch (e) {
      state = ErrorState(e.toString());
    }
  }

  Future<void> signInWithGoogle() async {
    state = const Loading();
    try {
      await _firebaseRepo.signInWithGoogle();
      state = const Authenticated(userId: 'firebase');
      await FirebaseAnalytics.instance.logLogin(loginMethod: 'google');
    } on FirebaseAuthException catch (e) {
      if (e.code == 'account-exists-with-different-credential' && e.email != null && e.email!.isNotEmpty) {
        try {
          final List<String> methods = await FirebaseAuth.instance.fetchSignInMethodsForEmail(e.email!);
          if (methods.contains('apple.com')) {
            // Sign in with existing provider (Apple), then link Google
            await _firebaseRepo.signInWithApple();
            await _firebaseRepo.linkAccountWithGoogle();
            state = const Authenticated(userId: 'firebase');
            await FirebaseAnalytics.instance.logLogin(loginMethod: 'google_linked');
            return;
          }
          // If we reach here, we couldn't resolve automatically
          state = ErrorState('Учетная запись уже существует с другим провайдером: ${methods.join(', ')}');
        } catch (linkErr) {
          state = ErrorState(linkErr.toString());
        }
      } else {
        state = ErrorState(e.message ?? e.code);
      }
    } catch (e) {
      state = ErrorState(e.toString());
    }
  }

  Future<void> signInWithApple() async {
    state = const Loading();
    try {
      await _firebaseRepo.signInWithApple();
      state = const Authenticated(userId: 'firebase');
      await FirebaseAnalytics.instance.logLogin(loginMethod: 'apple');
    } on FirebaseAuthException catch (e) {
      if (e.code == 'account-exists-with-different-credential' && e.email != null && e.email!.isNotEmpty) {
        try {
          final List<String> methods = await FirebaseAuth.instance.fetchSignInMethodsForEmail(e.email!);
          if (methods.contains('google.com')) {
            // Sign in with existing provider (Google), then link Apple
            await _firebaseRepo.signInWithGoogle();
            await _firebaseRepo.linkAccountWithApple();
            state = const Authenticated(userId: 'firebase');
            await FirebaseAnalytics.instance.logLogin(loginMethod: 'apple_linked');
            return;
          }
          state = ErrorState('Учетная запись уже существует с другим провайдером: ${methods.join(', ')}');
        } catch (linkErr) {
          state = ErrorState(linkErr.toString());
        }
      } else {
        state = ErrorState(e.message ?? e.code);
      }
    } catch (e) {
      state = ErrorState(e.toString());
    }
  }

  Future<void> linkWithGoogle() async {
    try {
      await _firebaseRepo.linkAccountWithGoogle();
    } catch (e) {
      // Keep current state; show error via UI
      state = ErrorState(e.toString());
    }
  }

  Future<void> linkWithApple() async {
    try {
      await _firebaseRepo.linkAccountWithApple();
    } catch (e) {
      state = ErrorState(e.toString());
    }
  }
}

