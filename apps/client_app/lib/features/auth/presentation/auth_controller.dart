import 'package:client_app/features/auth/data/auth_api.dart';
import 'package:client_app/features/auth/data/auth_storage.dart';
import 'package:client_app/features/auth/domain/auth_state.dart';
import 'package:client_app/features/auth/domain/auth_tokens.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authControllerProvider = NotifierProvider<AuthController, AuthState>(
  AuthController.new,
);

class AuthController extends Notifier<AuthState> {
  late final AuthApi _api;
  late final AuthStorage _storage;

  @override
  AuthState build() {
    _api = const AuthApi();
    _storage = AuthStorage.instance;
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
    } catch (e) {
      state = ErrorState(e.toString());
    }
  }
}

