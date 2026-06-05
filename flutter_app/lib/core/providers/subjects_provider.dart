import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/subject.dart';
import '../services/firestore_service.dart';
import '../models/app_user.dart';
import '../services/auth_service.dart';

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────

/// Real-time stream of all subjects from Firestore
final subjectsStreamProvider = StreamProvider<List<Subject>>((ref) {
  final service = ref.watch(firestoreServiceProvider);
  return service.watchSubjects();
});

/// Filtered subjects by search query
final subjectSearchQueryProvider = StateProvider<String>((ref) => '');

final filteredSubjectsProvider = Provider<AsyncValue<List<Subject>>>((ref) {
  final subjects = ref.watch(subjectsStreamProvider);
  final query = ref.watch(subjectSearchQueryProvider).toLowerCase().trim();

  return subjects.when(
    data: (list) {
      if (query.isEmpty) return AsyncValue.data(list);
      final filtered = list.where((s) =>
          s.name.toLowerCase().contains(query) ||
          (s.description?.toLowerCase().contains(query) ?? false)).toList();
      return AsyncValue.data(filtered);
    },
    loading: () => const AsyncValue.loading(),
    error: (e, st) => AsyncValue.error(e, st),
  );
});

/// Subjects grouped by year
final subjectsByYearProvider = Provider<AsyncValue<Map<int, List<Subject>>>>((ref) {
  final subjects = ref.watch(subjectsStreamProvider);
  return subjects.when(
    data: (list) {
      final map = <int, List<Subject>>{};
      for (final s in list) {
        for (final y in s.years) {
          map.putIfAbsent(y, () => []).add(s);
        }
      }
      return AsyncValue.data(map);
    },
    loading: () => const AsyncValue.loading(),
    error: (e, st) => AsyncValue.error(e, st),
  );
});

// ─── CURRENT USER ─────────────────────────────────────────────────────────────

final currentUserProvider = FutureProvider<AppUser?>((ref) async {
  final authState = ref.watch(authStateProvider);
  return authState.when(
    data: (user) async {
      if (user == null) return null;
      final authService = ref.read(authServiceProvider);
      return await authService.fetchCurrentUser();
    },
    loading: () => null,
    error: (_, __) => null,
  );
});

/// Provide the selected subject ID for detail view
final selectedSubjectIdProvider = StateProvider<String?>((ref) => null);

final selectedSubjectProvider = FutureProvider<Subject?>((ref) async {
  final id = ref.watch(selectedSubjectIdProvider);
  if (id == null) return null;
  final service = ref.read(firestoreServiceProvider);
  return await service.getSubject(id);
});
