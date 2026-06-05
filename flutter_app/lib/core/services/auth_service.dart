import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/app_user.dart';
import '../constants/app_constants.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(FirebaseAuth.instance, FirebaseFirestore.instance);
});

final authStateProvider = StreamProvider<User?>((ref) {
  return FirebaseAuth.instance.authStateChanges();
});

class AuthService {
  final FirebaseAuth _auth;
  final FirebaseFirestore _db;

  AuthService(this._auth, this._db);

  User? get currentUser => _auth.currentUser;

  // ─── Email / Password ─────────────────────────────────────────────────────

  Future<AppUser> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    final user = credential.user!;
    await _updateLastLogin(user.uid);
    return await _getOrCreateUser(user);
  }

  Future<AppUser> signUpWithEmail({
    required String name,
    required String email,
    required String password,
  }) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    final user = credential.user!;
    await user.updateDisplayName(name);

    final appUser = AppUser(
      id: user.uid,
      name: name,
      email: email,
      role: AppConstants.adminEmails.contains(email) ? UserRole.admin : UserRole.user,
      joinedAt: DateTime.now(),
      lastLoginAt: DateTime.now(),
    );

    await _db
        .collection(AppConstants.usersCollection)
        .doc(user.uid)
        .set(appUser.toMap());

    return appUser;
  }

  Future<void> sendPasswordReset(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  Future<AppUser?> signInWithGoogle() async {
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      if (googleUser == null) return null; // User cancelled flow

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      final user = userCredential.user!;
      await _updateLastLogin(user.uid);
      return await _getOrCreateUser(user);
    } catch (e) {
      throw Exception('Google Sign-In failed: $e');
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
    try {
      await GoogleSignIn().signOut();
    } catch (_) {}
  }

  // ─── Internal Helpers ─────────────────────────────────────────────────────

  Future<AppUser> _getOrCreateUser(User firebaseUser) async {
    final doc = await _db
        .collection(AppConstants.usersCollection)
        .doc(firebaseUser.uid)
        .get();

    if (doc.exists) {
      return AppUser.fromFirestore(doc);
    }

    // Create new user document for first-time sign-in
    final appUser = AppUser(
      id: firebaseUser.uid,
      name: firebaseUser.displayName ?? 'User',
      email: firebaseUser.email ?? '',
      avatarUrl: firebaseUser.photoURL,
      role: AppConstants.adminEmails.contains(firebaseUser.email)
          ? UserRole.admin
          : UserRole.user,
      joinedAt: DateTime.now(),
      lastLoginAt: DateTime.now(),
    );

    await _db
        .collection(AppConstants.usersCollection)
        .doc(firebaseUser.uid)
        .set(appUser.toMap());

    return appUser;
  }

  Future<void> _updateLastLogin(String uid) async {
    await _db.collection(AppConstants.usersCollection).doc(uid).update({
      'lastLoginAt': FieldValue.serverTimestamp(),
    });
  }

  Future<AppUser?> fetchCurrentUser() async {
    final user = _auth.currentUser;
    if (user == null) return null;
    final doc = await _db
        .collection(AppConstants.usersCollection)
        .doc(user.uid)
        .get();
    if (!doc.exists) return null;
    return AppUser.fromFirestore(doc);
  }
}
