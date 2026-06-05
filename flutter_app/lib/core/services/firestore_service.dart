import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/subject.dart';
import '../models/app_user.dart';
import '../constants/app_constants.dart';

final firestoreServiceProvider = Provider<FirestoreService>((ref) {
  return FirestoreService(FirebaseFirestore.instance);
});

class FirestoreService {
  final FirebaseFirestore _db;

  FirestoreService(this._db);

  // ─── SUBJECTS ─────────────────────────────────────────────────────────────

  /// Stream of all subjects — always live from Firestore
  Stream<List<Subject>> watchSubjects() {
    return _db.collection(AppConstants.subjectsCollection).snapshots().map(
          (snap) => snap.docs.map(Subject.fromFirestore).toList(),
        );
  }

  /// Fetch a single subject by ID
  Future<Subject?> getSubject(String subjectId) async {
    final doc = await _db
        .collection(AppConstants.subjectsCollection)
        .doc(subjectId)
        .get();
    if (!doc.exists) return null;
    return Subject.fromFirestore(doc);
  }

  // ─── BOOKS (ADMIN) ────────────────────────────────────────────────────────

  /// Add a book to a subject's category
  Future<void> addBook({
    required String subjectId,
    required String categoryKey,
    required Book book,
  }) async {
    final ref = _db.collection(AppConstants.subjectsCollection).doc(subjectId);
    await _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      final data = snap.data() ?? {};
      final materials = Map<String, dynamic>.from(data['materials'] as Map? ?? {});
      final books = List<dynamic>.from(materials[categoryKey] as List? ?? []);
      books.add(book.toMap());
      materials[categoryKey] = books;
      tx.update(ref, {'materials': materials});
    });
  }

  /// Update a book in a subject's category
  Future<void> updateBook({
    required String subjectId,
    required String categoryKey,
    required Book updatedBook,
  }) async {
    final ref = _db.collection(AppConstants.subjectsCollection).doc(subjectId);
    await _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      final data = snap.data() ?? {};
      final materials = Map<String, dynamic>.from(data['materials'] as Map? ?? {});
      final books = List<dynamic>.from(materials[categoryKey] as List? ?? []);
      final idx = books.indexWhere((b) => (b as Map)['id'] == updatedBook.id);
      if (idx != -1) books[idx] = updatedBook.toMap();
      materials[categoryKey] = books;
      tx.update(ref, {'materials': materials});
    });
  }

  /// Delete a book from a subject's category
  Future<void> deleteBook({
    required String subjectId,
    required String categoryKey,
    required String bookId,
  }) async {
    final ref = _db.collection(AppConstants.subjectsCollection).doc(subjectId);
    await _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      final data = snap.data() ?? {};
      final materials = Map<String, dynamic>.from(data['materials'] as Map? ?? {});
      final books = List<dynamic>.from(materials[categoryKey] as List? ?? []);
      books.removeWhere((b) => (b as Map)['id'] == bookId);
      materials[categoryKey] = books;
      tx.update(ref, {'materials': materials});
    });
  }

  // ─── SECTIONS (ADMIN) ─────────────────────────────────────────────────────

  /// Add an exam or practical section
  Future<void> addSection({
    required String subjectId,
    required String sectionType, // 'examSections' | 'practicalSections'
    required SubjectSection section,
  }) async {
    await _db.collection(AppConstants.subjectsCollection).doc(subjectId).update({
      sectionType: FieldValue.arrayUnion([section.toMap()]),
    });
  }

  /// Remove a section
  Future<void> removeSection({
    required String subjectId,
    required String sectionType,
    required String sectionId,
  }) async {
    final ref = _db.collection(AppConstants.subjectsCollection).doc(subjectId);
    await _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      final data = snap.data() ?? {};
      final sections = List<dynamic>.from(data[sectionType] as List? ?? []);
      sections.removeWhere((s) => (s as Map)['id'] == sectionId);
      tx.update(ref, {sectionType: sections});
    });
  }

  /// Rename a section
  Future<void> renameSection({
    required String subjectId,
    required String sectionType,
    required String sectionId,
    required String newLabel,
  }) async {
    final ref = _db.collection(AppConstants.subjectsCollection).doc(subjectId);
    await _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      final data = snap.data() ?? {};
      final sections = List<dynamic>.from(data[sectionType] as List? ?? []);
      final idx = sections.indexWhere((s) => (s as Map)['id'] == sectionId);
      if (idx != -1) {
        final section = Map<String, dynamic>.from(sections[idx] as Map);
        section['label'] = newLabel;
        sections[idx] = section;
      }
      tx.update(ref, {sectionType: sections});
    });
  }

  // ─── USERS ────────────────────────────────────────────────────────────────

  Future<AppUser?> getUser(String uid) async {
    final doc = await _db.collection(AppConstants.usersCollection).doc(uid).get();
    if (!doc.exists) return null;
    return AppUser.fromFirestore(doc);
  }

  Future<void> createUser(AppUser user) async {
    await _db
        .collection(AppConstants.usersCollection)
        .doc(user.id)
        .set(user.toMap());
  }

  Future<void> updateUser(String uid, Map<String, dynamic> fields) async {
    await _db.collection(AppConstants.usersCollection).doc(uid).update(fields);
  }

  Future<void> addToRecentlyViewed(String uid, String bookId) async {
    final ref = _db.collection(AppConstants.usersCollection).doc(uid);
    await _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      final data = snap.data() ?? {};
      var recent = List<String>.from(data['recentlyViewed'] as List? ?? []);
      recent.remove(bookId);
      recent.insert(0, bookId);
      if (recent.length > 20) recent = recent.sublist(0, 20);
      tx.update(ref, {'recentlyViewed': recent});
    });
  }

  Future<void> toggleFavorite(String uid, String bookId) async {
    final ref = _db.collection(AppConstants.usersCollection).doc(uid);
    await _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      final data = snap.data() ?? {};
      var favorites = List<String>.from(data['favorites'] as List? ?? []);
      if (favorites.contains(bookId)) {
        favorites.remove(bookId);
      } else {
        favorites.add(bookId);
      }
      tx.update(ref, {'favorites': favorites});
    });
  }

  // ─── ALL USERS (ADMIN) ────────────────────────────────────────────────────

  Future<List<AppUser>> getAllUsers() async {
    final snap = await _db.collection(AppConstants.usersCollection).get();
    return snap.docs.map(AppUser.fromFirestore).toList();
  }
}
