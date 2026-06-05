import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
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

  // ─── LOGGING & AUDITING ───────────────────────────────────────────────────

  /// Log user activity (e.g. view book, chat gemini) to the 'activities' collection
  Future<void> logUserActivity({
    required String userId,
    required String userName,
    required String action,
    required String targetId,
    required String targetName,
  }) async {
    try {
      await _db.collection(AppConstants.userActivitiesCollection).add({
        'userId': userId,
        'userName': userName,
        'action': action,
        'targetId': targetId,
        'targetName': targetName,
        'timestamp': DateTime.now().toUtc().toIso8601String(),
      });
    } catch (e) {
      print('Failed to log user activity: $e');
    }
  }

  /// Log admin action (e.g. add/edit book or section) to the 'admin-audit' collection
  Future<void> logAdminAction({
    required String action,
    required String targetSubjectId,
    String? targetSectionId,
    String? targetBookId,
    required String details,
  }) async {
    try {
      final currentUser = FirebaseAuth.instance.currentUser;
      await _db.collection(AppConstants.adminAuditLogsCollection).add({
        'adminEmail': currentUser?.email ?? 'unknown-admin',
        'action': action,
        'targetSubjectId': targetSubjectId,
        'targetSectionId': targetSectionId,
        'targetBookId': targetBookId,
        'details': details,
        'timestamp': DateTime.now().toUtc().toIso8601String(),
      });
    } catch (e) {
      print('Failed to log admin action: $e');
    }
  }

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

    await logAdminAction(
      action: 'book_added',
      targetSubjectId: subjectId,
      targetSectionId: categoryKey,
      targetBookId: book.id,
      details: 'Added book "${book.title}" in section $categoryKey',
    );
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

    await logAdminAction(
      action: 'book_edited',
      targetSubjectId: subjectId,
      targetSectionId: categoryKey,
      targetBookId: updatedBook.id,
      details: 'Edited book "${updatedBook.title}" in section $categoryKey',
    );
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

    await logAdminAction(
      action: 'book_deleted',
      targetSubjectId: subjectId,
      targetSectionId: categoryKey,
      targetBookId: bookId,
      details: 'Deleted book ID $bookId from section $categoryKey',
    );
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

    final typeLabel = sectionType == 'practicalSections' ? 'practical' : 'exam';
    await logAdminAction(
      action: 'section_added',
      targetSubjectId: subjectId,
      targetSectionId: section.id,
      details: 'Added $typeLabel section ${section.label}',
    );
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

    final typeLabel = sectionType == 'practicalSections' ? 'practical' : 'exam';
    await logAdminAction(
      action: 'section_removed',
      targetSubjectId: subjectId,
      targetSectionId: sectionId,
      details: 'Removed $typeLabel section $sectionId',
    );
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

    final typeLabel = sectionType == 'practicalSections' ? 'practical' : 'exam';
    await logAdminAction(
      action: 'section_renamed',
      targetSubjectId: subjectId,
      targetSectionId: sectionId,
      details: 'Renamed $typeLabel section to $newLabel',
    );
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

  // ─── AUDIT LOGS (ADMIN) ───────────────────────────────────────────────────

  Stream<List<Map<String, dynamic>>> watchAdminAuditLogs() {
    return _db
        .collection(AppConstants.adminAuditLogsCollection)
        .orderBy('timestamp', descending: true)
        .limit(100)
        .snapshots()
        .map((snap) => snap.docs.map((doc) => {'id': doc.id, ...doc.data()}).toList());
  }

  Stream<List<Map<String, dynamic>>> watchUserActivities({String? userId}) {
    Query query = _db.collection(AppConstants.userActivitiesCollection);
    if (userId != null) {
      query = query.where('userId', '==', userId);
    }
    return query.snapshots().map((snap) {
      final list = snap.docs.map((doc) => {'id': doc.id, ...doc.data()}).toList();
      list.sort((a, b) {
        final tA = a['timestamp'] as String? ?? '';
        final tB = b['timestamp'] as String? ?? '';
        return tB.compareTo(tA);
      });
      if (list.length > 100) {
        return list.sublist(0, 100);
      }
      return list;
    });
  }
}
