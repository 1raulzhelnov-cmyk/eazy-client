import 'dart:convert';

import 'package:client_app/features/address/models/address.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class PlacesService {
  PlacesService({Dio? dio, String? apiKey})
      : _dio = dio ?? Dio(),
        _apiKey = apiKey ?? const String.fromEnvironment('GOOGLE_MAPS_API_KEY');

  final Dio _dio;
  final String _apiKey;

  bool get isEnabled => _apiKey.isNotEmpty;

  Future<List<PlaceSuggestion>> autocomplete(String query) async {
    if (!isEnabled) return const <PlaceSuggestion>[];
    // Using Places Autocomplete API (HTTP only)
    final Response<String> res = await _dio.get<String>(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      queryParameters: <String, dynamic>{
        'input': query,
        'key': _apiKey,
        'types': 'geocode',
        'language': 'ru',
      },
    );
    final Map<String, dynamic> body = jsonDecode(res.data ?? '{}') as Map<String, dynamic>;
    final List<dynamic> preds = (body['predictions'] as List<dynamic>? ?? <dynamic>[]);
    return preds
        .map((p) => PlaceSuggestion(
              placeId: p['place_id'] as String? ?? '',
              description: p['description'] as String? ?? '',
            ))
        .where((s) => s.placeId.isNotEmpty)
        .toList(growable: false);
  }

  Future<GeocodeResult> resolvePlace(String placeId) async {
    if (!isEnabled) {
      throw StateError('Places API key missing');
    }
    final Response<String> res = await _dio.get<String>(
      'https://maps.googleapis.com/maps/api/place/details/json',
      queryParameters: <String, dynamic>{
        'place_id': placeId,
        'key': _apiKey,
        'language': 'ru',
        'fields': 'formatted_address,geometry',
      },
    );
    final Map<String, dynamic> body = jsonDecode(res.data ?? '{}') as Map<String, dynamic>;
    final Map<String, dynamic>? result = body['result'] as Map<String, dynamic>?;
    if (result == null) throw StateError('Place details missing');
    final Map<String, dynamic>? geometry = result['geometry'] as Map<String, dynamic>?;
    final Map<String, dynamic>? location = (geometry?['location']) as Map<String, dynamic>?;
    final double lat = (location?['lat'] as num?)?.toDouble() ?? 0.0;
    final double lng = (location?['lng'] as num?)?.toDouble() ?? 0.0;
    return GeocodeResult(
      lat: lat,
      lng: lng,
      formattedAddress: result['formatted_address'] as String? ?? '',
    );
  }
}
