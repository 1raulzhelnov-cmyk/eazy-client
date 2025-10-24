import 'package:client_app/features/auth/domain/auth_state.dart';
import 'package:client_app/features/auth/domain/validators.dart';
import 'package:client_app/features/auth/presentation/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final bool emailProvided = _emailController.text.trim().isNotEmpty;
    final bool phoneProvided = _phoneController.text.trim().isNotEmpty;
    if (!emailProvided && !phoneProvided) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Введите email или телефон')),
      );
      return;
    }
    if (emailProvided) {
      if (!_formKey.currentState!.validate()) return;
      await ref.read(authControllerProvider.notifier).registerWithEmail(
            _emailController.text.trim(),
            _passwordController.text,
          );
      final s = ref.read(authControllerProvider);
      if (s is Authenticated && context.mounted) {
        context.go('/home');
      } else if (s is ErrorState && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(s.message)));
      }
    } else {
      await ref.read(authControllerProvider.notifier).sendOtp(_phoneController.text.trim());
      if (!mounted) return;
      context.go('/verify-otp', extra: _phoneController.text.trim());
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authControllerProvider);
    final bool loading = state is Loading;
    return Scaffold(
      appBar: AppBar(title: const Text('Регистрация')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (_emailController.text.trim().isEmpty) return null; // email optional if phone
                  return AuthValidators.validateEmail(value);
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Телефон'),
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (_phoneController.text.trim().isEmpty) return null; // phone optional if email
                  return AuthValidators.validatePhone(value);
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Пароль'),
                obscureText: true,
                validator: (value) {
                  if (_emailController.text.trim().isEmpty) return null; // password only when email is provided
                  return AuthValidators.validatePassword(value);
                },
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: loading ? null : _submit,
                child: loading
                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Продолжить'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
