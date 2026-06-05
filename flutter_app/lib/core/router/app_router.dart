import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/signup_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/library/library_screen.dart';
import '../../features/library/subject_detail_screen.dart';
import '../../features/exam/exam_screen.dart';
import '../../features/practical/practical_screen.dart';
import '../../features/neural_lab/neural_lab_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/admin/admin_screen.dart';
import '../../features/study/study_screen.dart';
import '../../ui/widgets/main_scaffold.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      final isLoggedIn = authState.when(
        data: (user) => user != null,
        loading: () => false,
        error: (_, __) => false,
      );

      final isLoading = authState.isLoading;
      if (isLoading) return null;

      final isOnAuthPage =
          state.matchedLocation == '/login' ||
          state.matchedLocation == '/signup';

      if (!isLoggedIn && !isOnAuthPage) return '/login';
      if (isLoggedIn && isOnAuthPage) return '/home';
      return null;
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),

      // Main app shell with bottom navigation
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/library',
            builder: (context, state) => const LibraryScreen(),
            routes: [
              GoRoute(
                path: 'subject/:id',
                builder: (context, state) => SubjectDetailScreen(
                  subjectId: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/exam',
            builder: (context, state) => const ExamScreen(),
            routes: [
              GoRoute(
                path: 'subject/:id',
                builder: (context, state) => SubjectDetailScreen(
                  subjectId: state.pathParameters['id']!,
                  mode: SubjectDetailMode.exam,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/practical',
            builder: (context, state) => const PracticalScreen(),
            routes: [
              GoRoute(
                path: 'subject/:id',
                builder: (context, state) => SubjectDetailScreen(
                  subjectId: state.pathParameters['id']!,
                  mode: SubjectDetailMode.practical,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/neural-lab',
            builder: (context, state) => const NeuralLabScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),

      // Study mode (full screen — outside shell)
      GoRoute(
        path: '/study',
        builder: (context, state) {
          final extra = state.extra as Map<String, String>?;
          return StudyScreen(
            title: extra?['title'] ?? 'Study',
            url: extra?['url'] ?? '',
          );
        },
      ),

      // Admin panel (full screen)
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
});
