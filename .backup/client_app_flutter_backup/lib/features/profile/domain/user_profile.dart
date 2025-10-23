import 'package:flutter/foundation.dart';

@immutable
class UserProfile {
  const UserProfile({
    required this.id,
    required this.email,
    this.name,
    this.phone,
    this.photoUrl,
    this.notificationsEnabled = true,
  });

  final String id;
  final String email;
  final String? name;
  final String? phone;
  final String? photoUrl;
  final bool notificationsEnabled;

  UserProfile copyWith({
    String? id,
    String? email,
    String? name,
    String? phone,
    String? photoUrl,
    bool? notificationsEnabled,
  }) {
    return UserProfile(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      photoUrl: photoUrl ?? this.photoUrl,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
    );
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'email': email,
      'name': name,
      'phone': phone,
      'photoUrl': photoUrl,
      'notificationsEnabled': notificationsEnabled,
    };
  }

  static UserProfile fromMap(String id, Map<String, dynamic> map) {
    return UserProfile(
      id: id,
      email: map['email'] as String? ?? '',
      name: map['name'] as String?,
      phone: map['phone'] as String?,
      photoUrl: map['photoUrl'] as String?,
      notificationsEnabled: map['notificationsEnabled'] as bool? ?? true,
    );
  }
}
