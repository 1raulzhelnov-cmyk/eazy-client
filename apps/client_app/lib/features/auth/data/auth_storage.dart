import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthStorage {
  AuthStorage._internal();
  static final AuthStorage instance = AuthStorage._internal();

  static const String _keyAccessToken = 'access_token';
  static const String _keyRefreshToken = 'refresh_token';

  static const FlutterSecureStorage _secure = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock_this_device),
    mOptions: MacOsOptions(accessibility: KeychainAccessibility.first_unlock_this_device),
  );

  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    await _secure.write(key: _keyAccessToken, value: accessToken);
    await _secure.write(key: _keyRefreshToken, value: refreshToken);
  }

  Future<String?> getAccessToken() => _secure.read(key: _keyAccessToken);

  Future<String?> getRefreshToken() => _secure.read(key: _keyRefreshToken);

  Future<void> clear() async {
    await _secure.delete(key: _keyAccessToken);
    await _secure.delete(key: _keyRefreshToken);
  }
}

