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
}

