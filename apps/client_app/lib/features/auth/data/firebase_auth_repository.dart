import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

class FirebaseAuthRepository {
  FirebaseAuthRepository({FirebaseAuth? auth}) : _auth = auth ?? FirebaseAuth.instance;

  final FirebaseAuth _auth;

  Future<UserCredential> signInWithGoogle() async {
    if (kIsWeb) {
      final GoogleAuthProvider provider = GoogleAuthProvider();
      return _auth.signInWithPopup(provider);
    }
    // Mobile (Android/iOS) flow via google_sign_in
    final GoogleSignInAccount? googleUser = await GoogleSignIn(scopes: <String>['email']).signIn();
    if (googleUser == null) {
      throw Exception('Операция отменена пользователем');
    }
    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
    final OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    return _auth.signInWithCredential(credential);
  }

  Future<UserCredential> signInWithApple() async {
    if (kIsWeb) {
      final AppleAuthProvider provider = AppleAuthProvider();
      return _auth.signInWithPopup(provider);
    }
    // Mobile (iOS) flow via sign_in_with_apple
    final AuthorizationCredentialAppleID apple = await SignInWithApple.getAppleIDCredential(
      scopes: <AppleIDAuthorizationScopes>[
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );
    if (apple.identityToken == null) {
      throw Exception('Не удалось получить токен Apple ID');
    }
    final OAuthCredential credential = const OAuthProvider('apple.com').credential(
      idToken: apple.identityToken,
      accessToken: apple.authorizationCode,
    );
    return _auth.signInWithCredential(credential);
  }

  Future<UserCredential> linkAccountWithGoogle() async {
    final User? user = _auth.currentUser;
    if (user == null) {
      return signInWithGoogle();
    }
    if (kIsWeb) {
      final GoogleAuthProvider provider = GoogleAuthProvider();
      return user.linkWithPopup(provider);
    }
    final GoogleSignInAccount? googleUser = await GoogleSignIn(scopes: <String>['email']).signIn();
    if (googleUser == null) {
      throw Exception('Операция отменена пользователем');
    }
    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
    final OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    return user.linkWithCredential(credential);
  }

  Future<UserCredential> linkAccountWithApple() async {
    final User? user = _auth.currentUser;
    if (user == null) {
      return signInWithApple();
    }
    if (kIsWeb) {
      final AppleAuthProvider provider = AppleAuthProvider();
      return user.linkWithPopup(provider);
    }
    final AuthorizationCredentialAppleID apple = await SignInWithApple.getAppleIDCredential(
      scopes: <AppleIDAuthorizationScopes>[
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );
    if (apple.identityToken == null) {
      throw Exception('Не удалось получить токен Apple ID');
    }
    final OAuthCredential credential = const OAuthProvider('apple.com').credential(
      idToken: apple.identityToken,
      accessToken: apple.authorizationCode,
    );
    return user.linkWithCredential(credential);
  }

  Future<void> signOut() => _auth.signOut();
}

