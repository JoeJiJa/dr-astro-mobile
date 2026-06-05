import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/providers/subjects_provider.dart';
import '../../core/providers/theme_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../ui/widgets/subject_card.dart';
import '../../ui/widgets/book_card.dart';
import '../../ui/widgets/loading_shimmer.dart';
import '../../core/services/auth_service.dart';

// ---------------------------------------------------------------------------
// Year filter provider (local to home)
// ---------------------------------------------------------------------------
final _selectedYearProvider = StateProvider<int>((ref) => 0); // 0 = All

// ---------------------------------------------------------------------------
// HomeScreen
// ---------------------------------------------------------------------------
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _gradientController;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _gradientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _gradientController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system &&
            MediaQuery.platformBrightnessOf(context) == Brightness.dark);

    final userAsync = ref.watch(currentUserProvider);
    final subjectsAsync = ref.watch(subjectsStreamProvider);

    final screenBg =
        isDark ? const Color(0xFF0A0E1A) : const Color(0xFFF4F6FA);

    return Scaffold(
      backgroundColor: screenBg,
      body: CustomScrollView(
        controller: _scrollController,
        physics: const BouncingScrollPhysics(),
        slivers: [
          // ---------------------------------------------------------------
          // 1. Animated Gradient App Bar
          // ---------------------------------------------------------------
          _AnimatedGradientAppBar(
            isDark: isDark,
            gradientController: _gradientController,
            userAsync: userAsync,
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ---------------------------------------------------
                  // Greeting
                  // ---------------------------------------------------
                  _GreetingSection(userAsync: userAsync, isDark: isDark),

                  const SizedBox(height: 24),

                  // ---------------------------------------------------
                  // 2. Quick Stats Row
                  // ---------------------------------------------------
                  _QuickStatsRow(
                      userAsync: userAsync,
                      subjectsAsync: subjectsAsync,
                      isDark: isDark),

                  const SizedBox(height: 28),

                  // ---------------------------------------------------
                  // 3. Quick Access Buttons
                  // ---------------------------------------------------
                  _SectionTitle(title: 'Quick Access', isDark: isDark),
                  const SizedBox(height: 14),
                  _QuickAccessGrid(isDark: isDark),

                  const SizedBox(height: 28),

                  // ---------------------------------------------------
                  // 4. Featured Books
                  // ---------------------------------------------------
                  _SectionTitle(
                    title: 'Featured Books',
                    isDark: isDark,
                    trailing: TextButton(
                      onPressed: () => context.go('/library'),
                      child: Text(
                        'See All',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                ],
              ),
            ),
          ),

          // Featured books horizontal scroll (outside padding for edge-to-edge)
          _FeaturedBooksSliver(
              subjectsAsync: subjectsAsync, isDark: isDark),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ---------------------------------------------------
                  // 5. Subjects by Year
                  // ---------------------------------------------------
                  _SectionTitle(title: 'Subjects by Year', isDark: isDark),
                  const SizedBox(height: 14),
                  _YearFilterChips(isDark: isDark),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          _SubjectsByYearSliver(
              subjectsAsync: subjectsAsync, isDark: isDark),

          // ---------------------------------------------------
          // 6. Neural Lab CTA Banner
          // ---------------------------------------------------
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 36),
              child: _NeuralLabBanner(isDark: isDark),
            ),
          ),
        ],
      ),
    );
  }
}

// ===========================================================================
// Animated Gradient App Bar
// ===========================================================================
class _AnimatedGradientAppBar extends ConsumerWidget {
  const _AnimatedGradientAppBar({
    required this.isDark,
    required this.gradientController,
    required this.userAsync,
  });

  final bool isDark;
  final AnimationController gradientController;
  final AsyncValue userAsync;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SliverAppBar(
      expandedHeight: 110,
      floating: false,
      pinned: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      flexibleSpace: AnimatedBuilder(
        animation: gradientController,
        builder: (context, child) {
          final t = gradientController.value;
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color.lerp(
                    const Color(0xFF1A1060),
                    const Color(0xFF2D1B8E),
                    t,
                  )!,
                  Color.lerp(
                    const Color(0xFF3B1FA8),
                    const Color(0xFF5B2DB0),
                    t,
                  )!,
                  Color.lerp(
                    const Color(0xFF6C3BE0),
                    const Color(0xFF9B59B6),
                    t,
                  )!,
                ],
              ),
            ),
            child: child,
          );
        },
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              children: [
                // Logo text
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '✦ Dr. Astro',
                        style: GoogleFonts.orbitron(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 1.5,
                        ),
                      ),
                      Text(
                        'Medical Education Platform',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: Colors.white60,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                // Notification icon
                _AppBarIconButton(
                  icon: Icons.notifications_outlined,
                  badge: true,
                  onTap: () {},
                ),
                const SizedBox(width: 10),
                // User avatar
                _UserAvatar(userAsync: userAsync),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AppBarIconButton extends StatelessWidget {
  const _AppBarIconButton({
    required this.icon,
    required this.onTap,
    this.badge = false,
  });
  final IconData icon;
  final VoidCallback onTap;
  final bool badge;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.15)),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 20),
            if (badge)
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 1.2),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _UserAvatar extends ConsumerWidget {
  const _UserAvatar({required this.userAsync});
  final AsyncValue userAsync;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return userAsync.when(
      data: (user) {
        final photoUrl = user?.photoUrl as String?;
        final initials = _getInitials(user?.displayName as String? ?? 'User');
        return GestureDetector(
          onTap: () => context.go('/profile'),
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [Color(0xFF7B61FF), Color(0xFFB06AFF)],
              ),
              border: Border.all(color: Colors.white.withOpacity(0.3), width: 2),
              image: photoUrl != null
                  ? DecorationImage(
                      image: NetworkImage(photoUrl),
                      fit: BoxFit.cover,
                    )
                  : null,
            ),
            child: photoUrl == null
                ? Center(
                    child: Text(
                      initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  )
                : null,
          ),
        );
      },
      loading: () => Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withOpacity(0.15),
        ),
      ),
      error: (_, __) => const SizedBox(width: 40, height: 40),
    );
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    } else if (parts.isNotEmpty && parts[0].isNotEmpty) {
      return parts[0][0].toUpperCase();
    }
    return 'U';
  }
}

// ===========================================================================
// Greeting Section
// ===========================================================================
class _GreetingSection extends StatelessWidget {
  const _GreetingSection({required this.userAsync, required this.isDark});
  final AsyncValue userAsync;
  final bool isDark;

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    return userAsync.when(
      data: (user) {
        final name = (user?.displayName as String?) ?? 'Doctor';
        final firstName = name.split(' ').first;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${_getGreeting()}, 👋',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: isDark
                    ? Colors.white54
                    : const Color(0xFF6B7280),
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms, delay: 100.ms)
                .slideX(begin: -0.1, end: 0),
            const SizedBox(height: 4),
            Text(
              firstName,
              style: GoogleFonts.inter(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms, delay: 200.ms)
                .slideX(begin: -0.1, end: 0),
            const SizedBox(height: 6),
            Text(
              'Ready to level up your medical knowledge?',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: isDark
                    ? Colors.white38
                    : const Color(0xFF9CA3AF),
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms, delay: 300.ms),
          ],
        );
      },
      loading: () => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          LoadingShimmer(width: 140, height: 16, isDark: isDark),
          const SizedBox(height: 8),
          LoadingShimmer(width: 200, height: 28, isDark: isDark),
        ],
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}

// ===========================================================================
// Quick Stats Row
// ===========================================================================
class _QuickStatsRow extends StatelessWidget {
  const _QuickStatsRow({
    required this.userAsync,
    required this.subjectsAsync,
    required this.isDark,
  });

  final AsyncValue userAsync;
  final AsyncValue subjectsAsync;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return subjectsAsync.when(
      data: (subjects) {
        return userAsync.when(
          data: (user) {
            final xp = (user?.xpPoints as int?) ?? 0;
            final streak = (user?.studyStreak as int?) ?? 0;
            final totalBooks = subjects.fold<int>(
              0,
              (sum, s) => sum + ((s.bookCount as int?) ?? 0),
            );
            return _StatsGrid(
              isDark: isDark,
              stats: [
                _StatData(
                  label: 'Books',
                  value: '$totalBooks',
                  icon: Icons.menu_book_rounded,
                  gradient: const [Color(0xFF6C63FF), Color(0xFF9B59B6)],
                ),
                _StatData(
                  label: 'Subjects',
                  value: '${subjects.length}',
                  icon: Icons.science_rounded,
                  gradient: const [Color(0xFF00C9FF), Color(0xFF0066FF)],
                ),
                _StatData(
                  label: 'Streak',
                  value: '${streak}d',
                  icon: Icons.local_fire_department_rounded,
                  gradient: const [Color(0xFFFF6B35), Color(0xFFFF3CAC)],
                ),
                _StatData(
                  label: 'XP',
                  value: _formatXP(xp),
                  icon: Icons.bolt_rounded,
                  gradient: const [Color(0xFF56CCF2), Color(0xFF2F80ED)],
                ),
              ],
            );
          },
          loading: () => _StatsShimmer(isDark: isDark),
          error: (_, __) => _StatsShimmer(isDark: isDark),
        );
      },
      loading: () => _StatsShimmer(isDark: isDark),
      error: (_, __) => _StatsShimmer(isDark: isDark),
    );
  }

  String _formatXP(int xp) {
    if (xp >= 1000) return '${(xp / 1000).toStringAsFixed(1)}k';
    return '$xp';
  }
}

class _StatData {
  const _StatData({
    required this.label,
    required this.value,
    required this.icon,
    required this.gradient,
  });
  final String label;
  final String value;
  final IconData icon;
  final List<Color> gradient;
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.isDark, required this.stats});
  final bool isDark;
  final List<_StatData> stats;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(stats.length, (i) {
        final stat = stats[i];
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: i < stats.length - 1 ? 10 : 0),
            child: _StatCard(stat: stat, isDark: isDark, index: i),
          ),
        );
      }),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.stat,
    required this.isDark,
    required this.index,
  });
  final _StatData stat;
  final bool isDark;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF141829)
            : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.06)
              : Colors.black.withOpacity(0.06),
        ),
        boxShadow: [
          BoxShadow(
            color: stat.gradient.first.withOpacity(isDark ? 0.15 : 0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: stat.gradient),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(stat.icon, color: Colors.white, size: 18),
          ),
          const SizedBox(height: 8),
          Text(
            stat.value,
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            stat.label,
            style: GoogleFonts.inter(
              fontSize: 10,
              color: isDark ? Colors.white38 : Colors.black38,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(delay: (150 * index).ms, duration: 400.ms)
        .slideY(begin: 0.2, end: 0);
  }
}

class _StatsShimmer extends StatelessWidget {
  const _StatsShimmer({required this.isDark});
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(4, (i) {
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: i < 3 ? 10 : 0),
            child: LoadingShimmer(
              height: 90,
              isDark: isDark,
              borderRadius: 16,
            ),
          ),
        );
      }),
    );
  }
}

// ===========================================================================
// Section Title
// ===========================================================================
class _SectionTitle extends StatelessWidget {
  const _SectionTitle({
    required this.title,
    required this.isDark,
    this.trailing,
  });
  final String title;
  final bool isDark;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

// ===========================================================================
// Quick Access Grid
// ===========================================================================
class _QuickAccessItem {
  const _QuickAccessItem({
    required this.label,
    required this.icon,
    required this.gradient,
    required this.route,
  });
  final String label;
  final IconData icon;
  final List<Color> gradient;
  final String route;
}

const _quickAccessItems = [
  _QuickAccessItem(
    label: 'Library',
    icon: Icons.local_library_rounded,
    gradient: [Color(0xFF6C63FF), Color(0xFF9B59B6)],
    route: '/library',
  ),
  _QuickAccessItem(
    label: 'Exam Hub',
    icon: Icons.assignment_rounded,
    gradient: [Color(0xFF00C9FF), Color(0xFF0066FF)],
    route: '/exam-hub',
  ),
  _QuickAccessItem(
    label: 'Practical',
    icon: Icons.biotech_rounded,
    gradient: [Color(0xFF43E97B), Color(0xFF38F9D7)],
    route: '/practical',
  ),
  _QuickAccessItem(
    label: 'Neural Lab',
    icon: Icons.psychology_rounded,
    gradient: [Color(0xFFFF6B35), Color(0xFFFF3CAC)],
    route: '/neural-lab',
  ),
];

class _QuickAccessGrid extends StatelessWidget {
  const _QuickAccessGrid({required this.isDark});
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(_quickAccessItems.length, (i) {
        final item = _quickAccessItems[i];
        return Expanded(
          child: Padding(
            padding:
                EdgeInsets.only(right: i < _quickAccessItems.length - 1 ? 12 : 0),
            child: _QuickAccessButton(item: item, isDark: isDark, index: i),
          ),
        );
      }),
    );
  }
}

class _QuickAccessButton extends StatefulWidget {
  const _QuickAccessButton({
    required this.item,
    required this.isDark,
    required this.index,
  });
  final _QuickAccessItem item;
  final bool isDark;
  final int index;

  @override
  State<_QuickAccessButton> createState() => _QuickAccessButtonState();
}

class _QuickAccessButtonState extends State<_QuickAccessButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        context.go(widget.item.route);
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.94 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 6),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: widget.item.gradient,
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: widget.item.gradient.first.withOpacity(0.35),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            children: [
              Icon(widget.item.icon, color: Colors.white, size: 28),
              const SizedBox(height: 8),
              Text(
                widget.item.label,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    )
        .animate()
        .fadeIn(delay: (100 * widget.index).ms, duration: 400.ms)
        .scale(begin: const Offset(0.85, 0.85), end: const Offset(1, 1));
  }
}

// ===========================================================================
// Featured Books Sliver
// ===========================================================================
class _FeaturedBooksSliver extends ConsumerWidget {
  const _FeaturedBooksSliver({
    required this.subjectsAsync,
    required this.isDark,
  });
  final AsyncValue subjectsAsync;
  final bool isDark;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SliverToBoxAdapter(
      child: SizedBox(
        height: 220,
        child: subjectsAsync.when(
          data: (subjects) {
            if (subjects.isEmpty) {
              return Center(
                child: Text(
                  'No books available yet.',
                  style: TextStyle(
                    color: isDark ? Colors.white38 : Colors.black38,
                  ),
                ),
              );
            }

            // Use first subject's books as featured
            final firstSubject = subjects.first;
            final books = (firstSubject.books as List?) ?? [];

            if (books.isEmpty) {
              return Center(
                child: Text(
                  'No books in ${firstSubject.name}.',
                  style: TextStyle(
                    color: isDark ? Colors.white38 : Colors.black38,
                  ),
                ),
              );
            }

            return ListView.builder(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: books.length > 8 ? 8 : books.length,
              itemBuilder: (context, i) {
                return Padding(
                  padding: EdgeInsets.only(right: i < books.length - 1 ? 16 : 0),
                  child: BookCard(
                    book: books[i],
                    isDark: isDark,
                  )
                      .animate()
                      .fadeIn(delay: (80 * i).ms, duration: 350.ms)
                      .slideX(begin: 0.1, end: 0),
                );
              },
            );
          },
          loading: () => ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: 4,
            itemBuilder: (_, i) => Padding(
              padding: EdgeInsets.only(right: i < 3 ? 16 : 0),
              child: LoadingShimmer(
                width: 140,
                height: 210,
                isDark: isDark,
                borderRadius: 16,
              ),
            ),
          ),
          error: (e, _) => Center(
            child: Text(
              'Failed to load books.',
              style: TextStyle(
                  color: isDark ? Colors.white38 : Colors.black38),
            ),
          ),
        ),
      ),
    );
  }
}

// ===========================================================================
// Year Filter Chips
// ===========================================================================
class _YearFilterChips extends ConsumerWidget {
  const _YearFilterChips({required this.isDark});
  final bool isDark;

  static const List<String> _labels = [
    'All',
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    '5th Year',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(_selectedYearProvider);

    return SizedBox(
      height: 36,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: _labels.length,
        itemBuilder: (context, i) {
          final isSelected = selected == i;
          return Padding(
            padding: EdgeInsets.only(right: i < _labels.length - 1 ? 8 : 0),
            child: GestureDetector(
              onTap: () =>
                  ref.read(_selectedYearProvider.notifier).state = i,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                decoration: BoxDecoration(
                  gradient: isSelected
                      ? const LinearGradient(
                          colors: [Color(0xFF6C63FF), Color(0xFF9B59B6)],
                        )
                      : null,
                  color: isSelected
                      ? null
                      : isDark
                          ? const Color(0xFF141829)
                          : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected
                        ? Colors.transparent
                        : isDark
                            ? Colors.white.withOpacity(0.1)
                            : Colors.black.withOpacity(0.08),
                  ),
                ),
                child: Text(
                  _labels[i],
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight:
                        isSelected ? FontWeight.w600 : FontWeight.w500,
                    color: isSelected
                        ? Colors.white
                        : isDark
                            ? Colors.white60
                            : const Color(0xFF6B7280),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ===========================================================================
// Subjects By Year Sliver
// ===========================================================================
class _SubjectsByYearSliver extends ConsumerWidget {
  const _SubjectsByYearSliver({
    required this.subjectsAsync,
    required this.isDark,
  });
  final AsyncValue subjectsAsync;
  final bool isDark;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedYear = ref.watch(_selectedYearProvider);

    return SliverToBoxAdapter(
      child: SizedBox(
        height: 180,
        child: subjectsAsync.when(
          data: (subjects) {
            final filtered = selectedYear == 0
                ? subjects
                : subjects
                    .where((s) =>
                        (s.year as int? ?? 0) == selectedYear)
                    .toList();

            if (filtered.isEmpty) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    'No subjects found for this year.',
                    style: TextStyle(
                      color: isDark ? Colors.white38 : Colors.black38,
                    ),
                  ),
                ),
              );
            }

            return ListView.builder(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: filtered.length,
              itemBuilder: (context, i) {
                return Padding(
                  padding:
                      EdgeInsets.only(right: i < filtered.length - 1 ? 16 : 0),
                  child: SubjectCard(
                    subject: filtered[i],
                    isDark: isDark,
                  )
                      .animate()
                      .fadeIn(delay: (70 * i).ms, duration: 350.ms)
                      .slideX(begin: 0.1, end: 0),
                );
              },
            );
          },
          loading: () => ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: 4,
            itemBuilder: (_, i) => Padding(
              padding: EdgeInsets.only(right: i < 3 ? 16 : 0),
              child: LoadingShimmer(
                width: 150,
                height: 170,
                isDark: isDark,
                borderRadius: 16,
              ),
            ),
          ),
          error: (e, _) => Center(
            child: Text(
              'Failed to load subjects.',
              style: TextStyle(
                color: isDark ? Colors.white38 : Colors.black38,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ===========================================================================
// Neural Lab CTA Banner
// ===========================================================================
class _NeuralLabBanner extends StatefulWidget {
  const _NeuralLabBanner({required this.isDark});
  final bool isDark;

  @override
  State<_NeuralLabBanner> createState() => _NeuralLabBannerState();
}

class _NeuralLabBannerState extends State<_NeuralLabBanner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 1.0, end: 1.06).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulseAnim,
      builder: (context, child) => Transform.scale(
        scale: _pulseAnim.value,
        child: child,
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1A0C4C),
              Color(0xFF3B1FA8),
              Color(0xFF6C3BE0),
            ],
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: const Color(0xFF7B61FF).withOpacity(0.4),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF6C3BE0).withOpacity(0.4),
              blurRadius: 30,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.auto_awesome,
                            color: Colors.amber, size: 13),
                        const SizedBox(width: 4),
                        Text(
                          'AI Powered',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: Colors.white70,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Try Neural\nLab AI',
                    style: GoogleFonts.inter(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      height: 1.15,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Ask anything. Learn smarter\nwith AI-powered tutoring.',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: Colors.white60,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 18),
                  GestureDetector(
                    onTap: () => context.go('/neural-lab'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.white.withOpacity(0.25),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Launch Neural Lab',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF3B1FA8),
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Icon(
                            Icons.arrow_forward_rounded,
                            size: 15,
                            color: Color(0xFF3B1FA8),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            // Decorative brain/AI icon area
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(
                    color: Colors.white.withOpacity(0.15), width: 1.5),
              ),
              child: const Center(
                child: Icon(
                  Icons.psychology_rounded,
                  size: 44,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(delay: 600.ms, duration: 500.ms)
        .slideY(begin: 0.1, end: 0);
  }
}
