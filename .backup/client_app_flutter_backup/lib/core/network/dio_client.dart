import 'package:client_app/features/auth/data/auth_storage.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class DioClient {
  DioClient._();

  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: dotenv.maybeGet('API_BASE_URL') ?? '',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
      headers: <String, String>{
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ),
  );

  static void _ensureInterceptor() {
    if (_dio.interceptors.any((it) => it is _AuthInterceptor)) return;
    _dio.interceptors.add(_AuthInterceptor());
  }

  static Dio get instance {
    _ensureInterceptor();
    return _dio;
  }
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    try {
      final String? token = await AuthStorage.instance.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    } catch (e) {
      debugPrint('Auth header error: $e');
    }
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      await AuthStorage.instance.clear();
      // Redirection is handled by router guard reacting to auth state changes
    }
    super.onError(err, handler);
  }
}

