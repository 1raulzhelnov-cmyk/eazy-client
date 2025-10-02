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

