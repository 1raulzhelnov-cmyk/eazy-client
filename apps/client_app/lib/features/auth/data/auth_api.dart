import 'dart:async';

import 'package:client_app/features/auth/domain/auth_tokens.dart';

class AuthApi {
  const AuthApi();

  Future<void> requestOtp(String emailOrPhone) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
  }

  Future<AuthTokens> verifyOtp(String emailOrPhone, String code) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    return AuthTokens(
      accessToken: 'access_${DateTime.now().millisecondsSinceEpoch}',
      refreshToken: 'refresh_${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  Future<void> logout() async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
  }
}

