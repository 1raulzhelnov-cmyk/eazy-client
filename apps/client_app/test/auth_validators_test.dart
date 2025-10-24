import 'package:client_app/features/auth/domain/validators.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AuthValidators', () {
    test('email validator', () {
      expect(AuthValidators.validateEmail(''), isNotNull);
      expect(AuthValidators.validateEmail('user@example.com'), isNull);
      expect(AuthValidators.validateEmail('bad@'), isNotNull);
    });

    test('phone validator', () {
      expect(AuthValidators.validatePhone(''), isNotNull);
      expect(AuthValidators.validatePhone('+1 (555) 123-4567'), isNull);
      expect(AuthValidators.validatePhone('12345'), isNotNull);
    });

    test('password validator', () {
      expect(AuthValidators.validatePassword(''), isNotNull);
      expect(AuthValidators.validatePassword('1234567'), isNotNull);
      expect(AuthValidators.validatePassword('password123'), isNull);
    });
  });
}
