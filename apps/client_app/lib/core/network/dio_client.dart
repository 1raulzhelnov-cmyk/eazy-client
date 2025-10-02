import 'package:dio/dio.dart';
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

  static Dio get instance => _dio;
}

