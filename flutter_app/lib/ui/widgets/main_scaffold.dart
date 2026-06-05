import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/providers/subjects_provider.dart';
import '../../core/services/auth_service.dart';
import 'package:badges/badges.dart' as badges;

class MainScaffold extends ConsumerWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;

    int currentIndex = _locationToIndex(location);

    return Scaffold(
      body: child,
      bottomNavigationBar: _buildBottomNav(context, ref, currentIndex),
    );
  }

  int _locationToIndex(String location) {
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/library')) return 1;
    if (location.startsWith('/exam')) return 2;
    if (location.startsWith('/practical')) return 3;
    if (location.startsWith('/neural-lab')) return 4;
    if (location.startsWith('/profile')) return 5;
    return 0;
  }

  Widget _buildBottomNav(BuildContext context, WidgetRef ref, int currentIndex) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final items = [
      _NavItem(icon: Icons.home_rounded, label: 'Home', path: '/home'),
      _NavItem(icon: Icons.library_books_rounded, label: 'Library', path: '/library'),
      _NavItem(icon: Icons.school_rounded, label: 'Exams', path: '/exam'),
      _NavItem(icon: Icons.science_rounded, label: 'Practical', path: '/practical'),
      _NavItem(icon: Icons.psychology_rounded, label: 'Neural Lab', path: '/neural-lab'),
      _NavItem(icon: Icons.person_rounded, label: 'Profile', path: '/profile'),
    ];

    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: (index) {
        context.go(items[index].path);
      },
      elevation: 0,
      backgroundColor: isDark
          ? AppColors.dark.surface
          : AppColors.light.surface,
      indicatorColor: AppColors.primary.withOpacity(0.15),
      destinations: items.asMap().entries.map((entry) {
        final i = entry.key;
        final item = entry.value;
        return NavigationDestination(
          icon: Icon(item.icon),
          selectedIcon: Icon(item.icon, color: AppColors.primary),
          label: item.label,
        );
      }).toList(),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final String path;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.path,
  });
}
