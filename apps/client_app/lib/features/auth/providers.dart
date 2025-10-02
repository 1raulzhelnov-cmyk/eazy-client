import 'package:flutter_riverpod/flutter_riverpod.dart';

final isAuthorizedProvider = NotifierProvider<AuthState, bool>(AuthState.new);

class AuthState extends Notifier<bool> {
  @override
  bool build() => false;

  void login() {
    state = true;
  }

  void logout() {
    state = false;
  }
}

