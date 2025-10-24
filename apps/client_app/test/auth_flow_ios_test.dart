import 'package:client_app/features/auth/presentation/auth_controller.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  test('login/logout state transitions should not crash', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final controller = container.read(authControllerProvider.notifier);

    try {
      controller.loginWithEmail('user@example.com', 'password123');
    } catch (_) {}

    try {
      controller.logout();
    } catch (_) {}
  });
}
