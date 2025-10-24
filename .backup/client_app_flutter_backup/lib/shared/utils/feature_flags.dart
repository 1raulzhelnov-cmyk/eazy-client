import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FeatureFlags {
  FeatureFlags._();

  static const String _keyInAppChat = 'ff_inAppChat';
  static const String _keyRichPush = 'ff_richPush';
  static const String _keyWishlist = 'ff_wishlist';
  static const String _keyBouquetBuilder = 'ff_bouquetBuilder';

  static Future<bool> isEnabled(String key, {bool defaultValue = false}) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getBool(key) ?? defaultValue;
  }

  static Future<void> setEnabled(String key, bool value) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  static Future<bool> inAppChat() => isEnabled(_keyInAppChat, defaultValue: false);
  static Future<bool> richPush() => isEnabled(_keyRichPush, defaultValue: false);
  static Future<bool> wishlist() => isEnabled(_keyWishlist, defaultValue: true);
  static Future<bool> bouquetBuilder() => isEnabled(_keyBouquetBuilder, defaultValue: false);

  @visibleForTesting
  static const List<String> allKeys = <String>[_keyInAppChat, _keyRichPush, _keyWishlist, _keyBouquetBuilder];
}
