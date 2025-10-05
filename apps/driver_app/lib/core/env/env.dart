class Env {
  static String get firebaseProjectId => const String.fromEnvironment('FIREBASE_PROJECT_ID', defaultValue: '');
  static String apiBaseUrl(String? fallback) => const String.fromEnvironment('API_BASE_URL', defaultValue: '');
}
