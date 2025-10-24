import 'package:flutter/foundation.dart';

@immutable
class Address {
  const Address({
    required this.id,
    this.label,
    required this.fullText,
    required this.country,
    required this.city,
    required this.street,
    this.house,
    this.apartment,
    this.entrance,
    this.floor,
    this.lat,
    this.lng,
    this.placeId,
    this.deliveryNote,
    required this.isPrimary,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String? label; // up to 40 chars
  final String fullText; // full address text
  final String country;
  final String city;
  final String street;
  final String? house;
  final String? apartment;
  final String? entrance;
  final String? floor;
  final double? lat;
  final double? lng;
  final String? placeId;
  final String? deliveryNote; // up to 200 chars
  final bool isPrimary;
  final DateTime createdAt;
  final DateTime updatedAt;

  Address copyWith({
    String? id,
    String? label,
    String? fullText,
    String? country,
    String? city,
    String? street,
    String? house,
    String? apartment,
    String? entrance,
    String? floor,
    double? lat,
    double? lng,
    String? placeId,
    String? deliveryNote,
    bool? isPrimary,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Address(
      id: id ?? this.id,
      label: label ?? this.label,
      fullText: fullText ?? this.fullText,
      country: country ?? this.country,
      city: city ?? this.city,
      street: street ?? this.street,
      house: house ?? this.house,
      apartment: apartment ?? this.apartment,
      entrance: entrance ?? this.entrance,
      floor: floor ?? this.floor,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      placeId: placeId ?? this.placeId,
      deliveryNote: deliveryNote ?? this.deliveryNote,
      isPrimary: isPrimary ?? this.isPrimary,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'label': label,
      'fullText': fullText,
      'country': country,
      'city': city,
      'street': street,
      'house': house,
      'apartment': apartment,
      'entrance': entrance,
      'floor': floor,
      'lat': lat,
      'lng': lng,
      'placeId': placeId,
      'deliveryNote': deliveryNote,
      'isPrimary': isPrimary,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  static Address fromMap(String id, Map<String, dynamic> map) {
    return Address(
      id: id,
      label: map['label'] as String?,
      fullText: map['fullText'] as String? ?? '',
      country: map['country'] as String? ?? '',
      city: map['city'] as String? ?? '',
      street: map['street'] as String? ?? '',
      house: map['house'] as String?,
      apartment: map['apartment'] as String?,
      entrance: map['entrance'] as String?,
      floor: map['floor'] as String?,
      lat: (map['lat'] as num?)?.toDouble(),
      lng: (map['lng'] as num?)?.toDouble(),
      placeId: map['placeId'] as String?,
      deliveryNote: map['deliveryNote'] as String?,
      isPrimary: map['isPrimary'] as bool? ?? false,
      createdAt: DateTime.tryParse(map['createdAt'] as String? ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(map['updatedAt'] as String? ?? '') ?? DateTime.now(),
    );
  }
}

@immutable
class PlaceSuggestion {
  const PlaceSuggestion({required this.placeId, required this.description});
  final String placeId;
  final String description;
}

@immutable
class GeocodeResult {
  const GeocodeResult({required this.lat, required this.lng, required this.formattedAddress});
  final double lat;
  final double lng;
  final String formattedAddress;
}
