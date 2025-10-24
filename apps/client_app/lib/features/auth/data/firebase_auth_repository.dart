import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class FirebaseAuthRepository {
  FirebaseAuthRepository({FirebaseAuth? auth}) : _auth = auth ?? FirebaseAuth.instance;

  final FirebaseAuth _auth;

  Future<UserCredential> signInWithGoogle() async {
    final GoogleAuthProvider provider = GoogleAuthProvider();
    if (kIsWeb) {
      return _auth.signInWithPopup(provider);
    }
    return _auth.signInWithProvider(provider);
  }

  Future<UserCredential> signInWithApple() async {
    final AppleAuthProvider provider = AppleAuthProvider();
    if (kIsWeb) {
      return _auth.signInWithPopup(provider);
    }
    return _auth.signInWithProvider(provider);
  }

  Future<UserCredential> linkAccountWithGoogle() async {
    final GoogleAuthProvider provider = GoogleAuthProvider();
    final User? user = _auth.currentUser;
    if (user == null) {
      return signInWithGoogle();
    }
    if (kIsWeb) {
      return user.linkWithPopup(provider);
    }
    return user.linkWithProvider(provider);
  }

  Future<UserCredential> linkAccountWithApple() async {
    final AppleAuthProvider provider = AppleAuthProvider();
    final User? user = _auth.currentUser;
    if (user == null) {
      return signInWithApple();
    }
    if (kIsWeb) {
      return user.linkWithPopup(provider);
    }
    return user.linkWithProvider(provider);
  }

  Future<void> signOut() => _auth.signOut();

  // Phone OTP: start verification. Returns verificationId via callback
  Future<void> sendPhoneOtp({
    required String phoneNumber,
    required void Function(String verificationId) onCodeSent,
    required void Function(FirebaseAuthException e) onError,
    Duration timeout = const Duration(seconds: 60),
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      timeout: timeout,
      verificationCompleted: (PhoneAuthCredential credential) async {
        try {
          await _auth.signInWithCredential(credential);
        } catch (e) {
          // ignore auto-retrieval failures
        }
      },
      verificationFailed: onError,
      codeSent: (String verificationId, int? resendToken) {
        onCodeSent(verificationId);
      },
      codeAutoRetrievalTimeout: (String verificationId) {},
    );
  }

  Future<UserCredential> verifyPhoneOtp({
    required String verificationId,
    required String smsCode,
  }) async {
    final AuthCredential credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    return _auth.signInWithCredential(credential);
  }

  // Email/password
  Future<UserCredential> registerWithEmail({required String email, required String password}) {
    return _auth.createUserWithEmailAndPassword(email: email, password: password);
  }

  Future<UserCredential> loginWithEmail({required String email, required String password}) {
    return _auth.signInWithEmailAndPassword(email: email, password: password);
  }
}

