sealed class AuthState {
  const AuthState();
}

class Unauthenticated extends AuthState {
  const Unauthenticated();
}

class Loading extends AuthState {
  const Loading();
}

class Authenticated extends AuthState {
  const Authenticated({required this.userId});
  final String userId;
}

class ErrorState extends AuthState {
  const ErrorState(this.message);
  final String message;
}

class OtpSent extends AuthState {
  const OtpSent({required this.verificationId, required this.phone});
  final String verificationId;
  final String phone;
}

