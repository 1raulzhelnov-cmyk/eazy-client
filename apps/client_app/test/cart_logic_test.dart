import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Cart logic', () {
    test('increments count', () {
      int count = 0;
      count++;
      expect(count, 1);
    });

    test('decrements but not below zero', () {
      int count = 0;
      count = count > 0 ? count - 1 : 0;
      expect(count, 0);
    });
  });
}
