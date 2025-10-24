class AuthValidators {
  const AuthValidators._();

  static String? validateEmail(String? value) {
    final String input = (value ?? '').trim();
    if (input.isEmpty) return 'Введите email';
    final RegExp emailRegex = RegExp(r'^\S+@\S+\.\S+$');
    if (!emailRegex.hasMatch(input)) return 'Некорректный email';
    return null;
  }

  static String? validatePhone(String? value) {
    final String input = (value ?? '').trim();
    if (input.isEmpty) return 'Введите телефон';
    final String digits = input.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length < 10) return 'Некорректный телефон';
    return null;
  }

  static String? validatePassword(String? value) {
    final String input = (value ?? '').trim();
    if (input.isEmpty) return 'Введите пароль';
    if (input.length < 8) return 'Минимум 8 символов';
    return null;
  }
}
